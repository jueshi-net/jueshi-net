// GET /api/tasks - List user's tasks
// POST /api/tasks - Create a new task

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (status && status !== "all") {
    where.status = status;
  }

  const tasks = await prisma.userTask.findMany({
    where,
    orderBy: [
      { status: "asc" }, // pending first
      { priority: "desc" }, // high first
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, priority, category, dueDate } = body;

  if (!title || title.trim().length === 0) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }

  const task = await prisma.userTask.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority || "normal",
      category: category || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: "pending",
    },
  });

  return NextResponse.json({ success: true, task });
}
