// PATCH /api/tasks/[id] - Update task (including complete)
// DELETE /api/tasks/[id] - Archive (soft delete) task

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/auth/permissions";
import { getTodayRange } from "@/lib/date-utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;
  const body = await req.json();

  // Verify task ownership
  const existingTask = await prisma.userTask.findFirst({
    where: { id, userId },
  });

  if (!existingTask) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 });
  }

  const { title, description, priority, category, dueDate, status } = body;

  // Handle task completion with points
  if (status === "done" && existingTask.status !== "done" && !existingTask.pointsAwarded) {
    // Block completing archived tasks
    if (existingTask.status === "archived") {
      return NextResponse.json({ error: "已归档的任务不能完成" }, { status: 400 });
    }

    const role = await getCurrentUserRole();
    const taskPoints = 2;

    // Use timezone-aware daily range
    const { start: today, end: tomorrow } = getTodayRange();

    const dailyTaskPoints = await prisma.pointLedger.aggregate({
      _sum: { points: true },
      where: {
        userId,
        type: "task_complete",
        createdAt: { gte: today, lt: tomorrow },
      },
    });

    const earnedToday = dailyTaskPoints._sum.points || 0;
    const dailyTaskCap = 20; // Max 20 points from tasks per day

    let awardedPoints = 0;
    let pointsAwarded = false;

    if (earnedToday < dailyTaskCap) {
      awardedPoints = Math.min(taskPoints, dailyTaskCap - earnedToday);
      pointsAwarded = true;
    }

    // Update task and write ledger in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.userTask.update({
        where: { id },
        data: {
          status: "done",
          completedAt: new Date(),
          pointsAwarded,
        },
      });

      if (awardedPoints > 0) {
        await tx.pointLedger.create({
          data: {
            userId,
            type: "task_complete",
            points: awardedPoints,
            reason: "完成任务",
            relatedId: id,
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: { points: { increment: awardedPoints } },
        });
      }

      return { updatedTask, awardedPoints };
    });

    return NextResponse.json({
      success: true,
      task: result.updatedTask,
      pointsEarned: result.awardedPoints,
      dailyTaskPointsRemaining: Math.max(0, dailyTaskCap - earnedToday - result.awardedPoints),
    });
  }

  // Regular update (not completing, or already awarded)
  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title.trim();
  if (description !== undefined) updateData.description = description?.trim() || null;
  if (priority !== undefined) updateData.priority = priority;
  if (category !== undefined) updateData.category = category || null;
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
  if (status !== undefined) updateData.status = status;

  // Handle status change without points (re-open, archive, etc.)
  if (status === "done" && existingTask.status !== "done") {
    updateData.completedAt = new Date();
  } else if (status !== "done") {
    updateData.completedAt = null;
    // If re-opening a completed task, DO NOT reset pointsAwarded.
    // Same task can only earn points once, even if re-opened.
  }

  const task = await prisma.userTask.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ success: true, task });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  // Verify ownership
  const existingTask = await prisma.userTask.findFirst({
    where: { id, userId },
  });

  if (!existingTask) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 });
  }

  // Soft delete: archive instead of hard delete
  const task = await prisma.userTask.update({
    where: { id },
    data: { status: "archived" },
  });

  return NextResponse.json({ success: true, task });
}
