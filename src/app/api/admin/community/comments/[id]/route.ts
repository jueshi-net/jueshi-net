import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authRes = await requireAdmin();
    if (authRes instanceof NextResponse) return authRes;
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const comment = await prisma.forumComment.findUnique({ where: { id } });
    if (!comment) return NextResponse.json({ error: "评论不存在" }, { status: 404 });

    if (action === "publish") {
      await prisma.forumComment.update({ where: { id }, data: { status: "published" } });
    } else if (action === "hide") {
      await prisma.forumComment.update({ where: { id }, data: { status: "hidden" } });
    } else {
      return NextResponse.json({ error: "无效操作" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Comment Moderate Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
