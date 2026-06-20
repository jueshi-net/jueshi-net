// GET /api/task-chains/[id] - Get single task chain detail
// PUT /api/task-chains/[id] - Update task chain (full update)
// PATCH /api/task-chains/[id] - Update task chain (partial update, auto-save)
// DELETE /api/task-chains/[id] - Delete (soft) task chain

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  const taskChain = await prisma.taskChainDraft.findFirst({
    where: { id, userId },
  });

  if (!taskChain) {
    return NextResponse.json({ error: "任务链不存在" }, { status: 404 });
  }

  return NextResponse.json({ taskChain });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  return updateTaskChain(req, resolvedParams);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  return updateTaskChain(req, resolvedParams);
}

async function updateTaskChain(req: NextRequest, params: { id: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = params;
  const userId = session.user.id;

  // Verify ownership
  const existing = await prisma.taskChainDraft.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "任务链不存在" }, { status: 404 });
  }

  const body = await req.json();
  const { title, status, sourceTool, lastActiveTool, context, linkedDraftHints, currentStep, completedSteps } = body;

  const updateData: Record<string, unknown> = {};

  if (title !== undefined) {
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
    }
    if (trimmed.length > 200) {
      return NextResponse.json({ error: "标题不能超过 200 字" }, { status: 400 });
    }
    updateData.title = trimmed;
  }

  if (status !== undefined) {
    const validStatuses = ["active", "completed", "archived", "deleted"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `无效状态，可选值: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }
    updateData.status = status;
    // Set completedAt when transitioning to completed
    if (status === "completed" && existing.status !== "completed") {
      updateData.completedAt = new Date();
    } else if (status !== "completed") {
      updateData.completedAt = null;
    }
  }

  if (sourceTool !== undefined) {
    if (!sourceTool || sourceTool.trim().length === 0) {
      return NextResponse.json({ error: "来源工具不能为空" }, { status: 400 });
    }
    updateData.sourceTool = sourceTool.trim();
  }

  if (lastActiveTool !== undefined) {
    updateData.lastActiveTool = lastActiveTool || null;
  }

  if (context !== undefined) {
    if (typeof context !== "object" || context === null) {
      return NextResponse.json({ error: "上下文必须是对象" }, { status: 400 });
    }
    updateData.context = context;
  }

  if (linkedDraftHints !== undefined) {
    updateData.linkedDraftHints = linkedDraftHints;
  }

  // Store currentStep and completedSteps in context
  if (currentStep !== undefined || completedSteps !== undefined) {
    const currentContext = (existing.context as Record<string, unknown>) || {};
    const newContext = { ...currentContext };
    
    if (currentStep !== undefined) {
      newContext.currentStep = currentStep;
    }
    if (completedSteps !== undefined) {
      newContext.completedSteps = completedSteps;
    }
    
    updateData.context = newContext;
  }

  const taskChain = await prisma.taskChainDraft.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ success: true, taskChain });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  // Verify ownership
  const existing = await prisma.taskChainDraft.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "任务链不存在" }, { status: 404 });
  }

  // Soft delete: set status to "deleted"
  const taskChain = await prisma.taskChainDraft.update({
    where: { id },
    data: { status: "deleted" },
  });

  return NextResponse.json({ success: true, taskChain });
}
