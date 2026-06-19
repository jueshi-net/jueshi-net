import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  parseUserAgent,
  parseReferrer,
  parseUTM,
  hashIP,
  extractIP,
  isBot,
  isValidEventType,
  sanitizeMetadata,
} from "@/lib/analytics/utils";

// Rate limit 配置
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 分钟
const RATE_LIMIT_MAX = 100; // 每分钟最多 100 次

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

// 定期清理过期的 rate limit 记录
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000); // 每 5 分钟清理一次

// 提取 toolSlug 的优先级逻辑
function extractToolSlug(body: any): string | null {
  return (
    body.toolSlug ||
    body.metadata?.toolSlug ||
    body.toolKey ||
    body.toolName ||
    body.metadata?.toolName ||
    null
  );
}

// 事件到 ToolMetricDaily 字段的映射
const METRIC_MAP: Record<string, string> = {
  Tool_View: "views",
  tool_view: "views",
  Tool_Click: "clicks",
  tool_click: "clicks",
  Document_Save: "saves",
  tool_save: "saves",
  Favorite_Tool: "favorites",
  tool_favorite: "favorites",
};

export async function POST(req: Request) {
  try {
    // 1. Body size 限制（最大 10KB）
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    // 2. 解析 body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { eventType, action, toolName, path, sessionId, userId, anonymousId, referrer, metadata, ...rest } = body;

    // 3. 验证事件类型
    if (!eventType || !isValidEventType(eventType.toString())) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    // 4. 提取 IP 并生成哈希
    const realIP = extractIP(req);
    const ipHash = hashIP(realIP);

    // 5. Bot 过滤
    const userAgent = req.headers.get('user-agent') || '';
    if (isBot(userAgent)) {
      // 静默丢弃 bot 请求
      return NextResponse.json({ ok: true, filtered: true });
    }

    // 6. Rate limit
    const clientIP = realIP || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // 7. 解析 User-Agent
    const { deviceType, browser, os } = parseUserAgent(userAgent);

    // 8. 解析 Referrer
    const referrerDomain = parseReferrer(referrer);

    // 9. 解析 UTM（从 referrer 或当前页面 URL）
    const utm = parseUTM(referrer || path);

    // 10. 清理 metadata
    const sanitizedMetadata = sanitizeMetadata(metadata) || (Object.keys(rest).length > 0 ? rest : null);

    const toolSlug = extractToolSlug(body);

    // Serialize remaining fields as JSON metadata
    const actionValue = action?.toString() || null;
    const storedAction = sanitizedMetadata 
      ? `${actionValue || ""} | metadata: ${JSON.stringify(sanitizedMetadata)}` 
      : actionValue;

    // 11. 获取当前用户（如果已登录）
    let currentUserId: string | null = null;
    try {
      const session = await auth();
      if (session?.user?.id) {
        currentUserId = session.user.id;
      }
    } catch {
      // 静默失败，不影响事件记录
    }

    // 12. 主流程：写入 EventLog
    await prisma.eventLog.create({
      data: {
        eventType: eventType.toString(),
        toolName: toolName?.toString() || null,
        path: path?.toString() || null,
        sessionId: sessionId?.toString() || null,
        action: storedAction,
        // v1.20.42.10.0 新增字段
        userId: userId?.toString() || currentUserId,
        anonymousId: anonymousId?.toString() || null,
        referrer: referrer?.toString() || null,
        referrerDomain,
        utmSource: utm.utmSource,
        utmMedium: utm.utmMedium,
        utmCampaign: utm.utmCampaign,
        utmTerm: utm.utmTerm,
        utmContent: utm.utmContent,
        deviceType,
        browser,
        os,
        country: null, // 后续可通过 IP 地理位置服务填充
        ipHash,
        durationMs: typeof body.durationMs === 'number' ? body.durationMs : null,
        metadata: sanitizedMetadata,
      },
    });

    // 13. 副流程：如果事件属于指标类型且有 toolSlug，upsert ToolMetricDaily
    const eventKey = eventType.toString();
    if (toolSlug && METRIC_MAP[eventKey]) {
      const metricField = METRIC_MAP[eventKey];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      try {
        await prisma.toolMetricDaily.upsert({
          where: { toolSlug_date: { toolSlug, date: today } },
          update: { [metricField]: { increment: 1 } },
          create: {
            toolSlug,
            date: today,
            [metricField]: 1,
          },
        });
      } catch (metricErr) {
        console.error("[Events] ToolMetricDaily upsert failed:", metricErr);
        // 不影响主流程
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Events] Failed to log event:", error);
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
  }
}
