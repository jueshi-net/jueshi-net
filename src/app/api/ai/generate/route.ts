// POST /api/ai/generate — AI tool generation endpoint
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callAI, isAIEnabled, isMockMode, getEnv } from "@/lib/ai/client";
import { getProductCopyPrompt, getTranslatePolishPrompt, getDocumentSummaryPrompt, getVideoScriptSopPrompt, ToolType } from "@/lib/ai/prompts";
import { getDailyLimit, getCostPoints, hashInput, validateInputLength, getVancouverDateString } from "@/lib/ai/quota";

const VALID_TOOLS: ToolType[] = ["product_copy", "translate_polish", "document_summary", "video_script_sop"];

export async function POST(req: Request) {
  // Check if AI is enabled
  if (!isAIEnabled()) {
    return NextResponse.json(
      { error: "AI 工具维护中，请稍后再试", code: "AI_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  const session = await auth();
  const userId = session?.user?.id || null;
  const isGuest = !userId;

  // Get user role
  let role = "guest";
  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, points: true },
    });
    if (dbUser) {
      role = dbUser.role?.toLowerCase() || "user";
    }
  }

  // Parse request
  let body: { toolType?: string; input?: any };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const { toolType, input } = body;

  // Validate toolType
  if (!toolType || !VALID_TOOLS.includes(toolType as ToolType)) {
    return NextResponse.json(
      { error: `toolType 必须是 ${VALID_TOOLS.join(", ")} 之一` },
      { status: 400 }
    );
  }

  // Validate input
  if (!input || typeof input !== "object") {
    return NextResponse.json({ error: "input 不能为空" }, { status: 400 });
  }

  // Check input length
  const totalInput = JSON.stringify(input).length;
  const lengthCheck = validateInputLength(toolType, totalInput);
  if (!lengthCheck.valid) {
    return NextResponse.json({ error: lengthCheck.error }, { status: 400 });
  }

  // Check daily quota
  const dailyLimit = getDailyLimit(role);
  const today = getVancouverDateString();
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const ipHash = hashInput(ip);
  const ua = (req.headers.get("user-agent") || "").slice(0, 200);

  // Count today's usage (across ALL tools, not just current one)
  const usageCount = await prisma.aIUsageLog.count({
    where: {
      ...(isGuest ? { ipHash } : { userId }),
      createdAt: {
        gte: new Date(today + "T00:00:00-08:00"),
        lt: new Date(today + "T23:59:59-08:00"),
      },
    },
  });

  const remaining = Math.max(0, dailyLimit - usageCount);
  if (remaining <= 0) {
    if (role === "user") {
      // Check if user has enough points
      const user = await prisma.user.findUnique({
        where: { id: userId! },
        select: { points: true },
      });
      if (!user || user.points < 20) {
        return NextResponse.json(
          { error: "今日免费次数已用完，积分不足", code: "INSUFFICIENT_POINTS", points: user?.points || 0 },
          { status: 403 }
        );
      }
    } else if (role === "guest") {
      return NextResponse.json(
        { error: "游客每日只能使用 1 次，请登录后获得更多次数", code: "DAILY_LIMIT" },
        { status: 429 }
      );
    }
  }

  // Generate prompts
  let systemPrompt: string, userPrompt: string;
  try {
    switch (toolType) {
      case "product_copy":
        ({ systemPrompt, userPrompt } = getProductCopyPrompt(input as any));
        break;
      case "translate_polish":
        ({ systemPrompt, userPrompt } = getTranslatePolishPrompt(input as any));
        break;
      case "document_summary":
        ({ systemPrompt, userPrompt } = getDocumentSummaryPrompt(input as any));
        break;
      case "video_script_sop":
        ({ systemPrompt, userPrompt } = getVideoScriptSopPrompt(input as any));
        break;
      default:
        return NextResponse.json({ error: "不支持的工具类型" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "输入参数错误" }, { status: 400 });
  }

  // Call AI
  let result = "";
  let outputTokens: number | undefined;
  const startTime = Date.now();

  try {
    const aiRes = await callAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { maxTokens: 2000, temperature: 0.7 }
    );
    result = aiRes.content;
    outputTokens = aiRes.usage?.totalTokens;
  } catch (err: any) {
    const msg = err.message || "AI 服务错误";
    // Don't expose internal errors
    if (msg.includes("key") || msg.includes("Key") || msg.includes("secret")) {
      return NextResponse.json({ error: "AI 服务配置错误" }, { status: 500 });
    }
    return NextResponse.json({ error: msg.slice(0, 100) }, { status: 500 });
  }

  const duration = Date.now() - startTime;

  // Determine cost
  const costPoints = (role === "user" && remaining <= 0) ? 20 : 0;

  // Deduct points if needed
  if (costPoints > 0 && userId) {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: costPoints } },
      });
      await tx.pointLedger.create({
        data: {
          userId,
          type: "ai_tool_use",
          points: -costPoints,
          reason: "AI 工具调用",
        },
      });
    });
  }

  // Write usage log
  await prisma.aIUsageLog.create({
    data: {
      userId,
      toolType,
      inputHash: hashInput(JSON.stringify(input)),
      outputTokens,
      costPoints,
      ipHash,
      userAgent: ua,
    },
  });

  // Calculate new remaining
  const newRemaining = remaining > 0 ? remaining - 1 : (role === "member" || role === "admin") ? dailyLimit - usageCount - 1 : null;

  // For guest, show how many left (0 since they used their only one)
  const displayRemaining = role === "guest" ? 0 : (newRemaining ?? null);

  return NextResponse.json({
    result,
    usage: {
      remainingToday: displayRemaining,
      pointsUsed: costPoints,
      role,
    },
    meta: {
      duration,
      mock: isMockMode(),
    },
  });
}
