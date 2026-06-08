import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const memos = await prisma.memo.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, title: true, content: true, category: true, isPinned: true, createdAt: true, updatedAt: true }
  });
  return NextResponse.json(memos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const body = await req.json();
  const memo = await prisma.memo.create({
    data: {
      userId: session.user.id,
      title: body.title || "无标题备忘",
      content: body.content || "",
      category: body.category || null,
      isPinned: false,
    },
  });
  return NextResponse.json(memo, { status: 201 });
}
