import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { id } = await params;
  const body = await req.json();
  
  // Ensure user owns the memo
  const existing = await prisma.memo.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  const memo = await prisma.memo.update({
    where: { id },
    data: {
      title: body.title ?? existing.title,
      content: body.content ?? existing.content,
      category: body.category ?? existing.category,
      isPinned: body.isPinned ?? existing.isPinned,
    },
  });
  return NextResponse.json(memo);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { id } = await params;
  
  await prisma.memo.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
