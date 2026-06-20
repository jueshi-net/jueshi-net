// GET /api/task-chains - List user's task chains
// POST /api/task-chains - Create a new task chain draft

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const MAX_TITLE_LENGTH = 200;
const MAX_TASK_CHAINS = 100;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const sourceTool = searchParams.get("sourceTool");

  const where: Record<string, unknown> = {
    userId: session.user.id,
    status: { not: "deleted" },
  };

  if (status && status !== "all") {
    where.status = status;
  }
  if (sourceTool) {
    where.sourceTool = sourceTool;
  }

  const taskChains = await prisma.taskChainDraft.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
  });

  return NextResponse.json({ taskChains });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const { title, sourceTool, context, linkedDraftHints } = body;

  // Validate required fields
  if (!title || title.trim().length === 0) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    return NextResponse.json(
      { error: `标题不能超过 ${MAX_TITLE_LENGTH} 字` },
      { status: 400 }
    );
  }

  if (!sourceTool || sourceTool.trim().length === 0) {
    return NextResponse.json({ error: "来源工具不能为空" }, { status: 400 });
  }

  if (!context || typeof context !== "object") {
    return NextResponse.json({ error: "任务链上下文不能为空" }, { status: 400 });
  }

  // Check creation limit
  const existingCount = await prisma.taskChainDraft.count({
    where: {
      userId: session.user.id,
      status: { not: "deleted" },
    },
  });

  if (existingCount >= MAX_TASK_CHAINS) {
    return NextResponse.json(
      { error: `最多只能创建 ${MAX_TASK_CHAINS} 个任务链` },
      { status: 429 }
    );
  }

  const taskChain = await prisma.taskChainDraft.create({
    data: {
      userId: session.user.id,
      title: trimmedTitle,
      sourceTool: sourceTool.trim(),
      context,
      linkedDraftHints: linkedDraftHints || null,
      status: "active",
    },
  });

  return NextResponse.json({ success: true, taskChain });
}
