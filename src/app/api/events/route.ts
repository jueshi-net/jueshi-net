// POST /api/events - 匿名统计埋点接收端
// 不记录用户输入内容，仅记录事件元数据
// 安全加固：白名单 eventType + 字段长度限制 + 内存防刷

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 白名单：只允许已知的事件类型
const ALLOWED_EVENT_TYPES = new Set([
  'tool_click',
  'tool_copy',
  'tool_calculate',
  'tool_query',
  'article_click',
  'resource_click',
  'memo_action',
]);

// 字段最大长度
const MAX_LENGTHS = {
  eventType: 50,
  toolName: 80,
  action: 100,
  path: 300,
  sessionId: 100,
};

// 内存级防刷：Map<key, { count, resetAt }>
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 10_000; // 10 秒窗口
const RATE_LIMIT_MAX = 20; // 每窗口最多 20 次

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return false;
  }
  return true;
}

// 定期清理过期条目（每 60 秒）
let lastCleanup = 0;
function cleanupRateLimit() {
  const now = Date.now();
  if (now - lastCleanup > 60_000) {
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
    lastCleanup = now;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 防刷检查
    cleanupRateLimit();
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const ua = req.headers.get('user-agent') || '';
    const rateKey = `evt:${ip}:${ua.slice(0, 50)}`;
    if (!checkRateLimit(rateKey)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { eventType, toolName, action, path: pagePath, sessionId } = body;

    // 白名单验证
    if (!eventType || typeof eventType !== 'string') {
      return NextResponse.json({ error: 'Invalid eventType' }, { status: 400 });
    }
    if (!ALLOWED_EVENT_TYPES.has(eventType)) {
      return NextResponse.json({ error: 'Unknown eventType' }, { status: 400 });
    }

    // 字段长度验证
    if (eventType.length > MAX_LENGTHS.eventType) {
      return NextResponse.json({ error: 'eventType too long' }, { status: 400 });
    }
    if (toolName && (typeof toolName !== 'string' || toolName.length > MAX_LENGTHS.toolName)) {
      return NextResponse.json({ error: 'toolName too long' }, { status: 400 });
    }
    if (action && (typeof action !== 'string' || action.length > MAX_LENGTHS.action)) {
      return NextResponse.json({ error: 'action too long' }, { status: 400 });
    }
    if (pagePath && (typeof pagePath !== 'string' || pagePath.length > MAX_LENGTHS.path)) {
      return NextResponse.json({ error: 'path too long' }, { status: 400 });
    }
    if (sessionId && (typeof sessionId !== 'string' || sessionId.length > MAX_LENGTHS.sessionId)) {
      return NextResponse.json({ error: 'sessionId too long' }, { status: 400 });
    }

    // 写入数据库（埋点失败不影响用户体验）
    await prisma.eventLog.create({
      data: {
        eventType,
        toolName: toolName || null,
        action: action || null,
        path: pagePath || null,
        sessionId: sessionId || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    // 埋点失败静默处理，不阻塞用户操作
    return NextResponse.json({ ok: true });
  }
}

// GET /api/events/stats - 简单统计查看
// 安全加固：仅开发环境可用，生产环境需要管理员权限
export async function GET(req: NextRequest) {
  // 生产环境禁止公开访问
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Stats disabled in production' }, { status: 403 });
  }

  // 如果有 ADMIN_SECRET，需要验证
  if (process.env.ADMIN_SECRET) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const { searchParams } = new URL(req.url);
    const toolName = searchParams.get('toolName');
    const daysParam = searchParams.get('days');
    const days = Math.min(180, Math.max(1, parseInt(daysParam || '30')));

    // 按事件类型统计（使用参数化查询，避免 SQL 注入）
    const byType = await prisma.$queryRaw`
      SELECT "eventType", "toolName", "action", COUNT(*)::int as count
      FROM event_logs
      WHERE "createdAt" >= NOW() - INTERVAL '1 day' * ${days}
      GROUP BY "eventType", "toolName", "action"
      ORDER BY count DESC
      LIMIT 100
    `;

    // 总事件数
    const total = await prisma.eventLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      },
    });

    // 按工具统计
    const byTool = await prisma.$queryRaw`
      SELECT "toolName", COUNT(*)::int as count
      FROM event_logs
      WHERE "createdAt" >= NOW() - INTERVAL '1 day' * ${days}
      GROUP BY "toolName"
      ORDER BY count DESC
    `;

    return NextResponse.json({
      total,
      byType: (byType as any[]).map((r: any) => ({
        eventType: r.eventType,
        toolName: r.toolName,
        action: r.action,
        count: r.count,
      })),
      byTool: (byTool as any[]).map((r: any) => ({
        toolName: r.toolName,
        count: r.count,
      })),
    });
  } catch (error) {
    console.error('[Events API] GET Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
