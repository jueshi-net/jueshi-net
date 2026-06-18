import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserLimits } from "@/lib/auth/permissions";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const memos = await prisma.memo.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    take: 50,
    select: { id: true, title: true, content: true, category: true, isPinned: true, color: true, dueDate: true, createdAt: true, updatedAt: true }
  });
  return NextResponse.json(memos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  // Check memo limit
  const limits = getUserLimits(session.user.role as any);
  if (limits.maxMemos > 0) {
    const count = await prisma.memo.count({ where: { userId: session.user.id } });
    if (count >= limits.maxMemos) {
      return NextResponse.json({ error: `备忘录数量已达上限 (${limits.maxMemos})` }, { status: 403 });
    }
  }
  
  const body = await req.json();
  const memo = await prisma.memo.create({
    data: {
      userId: session.user.id,
      title: body.title || "无标题备忘",
      content: body.content || "",
      category: body.category || null,
      color: body.color || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      isPinned: false,
    },
  });
  return NextResponse.json(memo, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  
  const body = await req.json();
  
  const memo = await prisma.memo.update({
    where: { id, userId: session.user.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.color !== undefined && { color: body.color }),
      ...(body.isPinned !== undefined && { isPinned: body.isPinned }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
    },
  });
  
  return NextResponse.json(memo);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  
  await prisma.memo.deleteMany({
    where: { id, userId: session.user.id },
  });
  
  return NextResponse.json({ success: true });
}
