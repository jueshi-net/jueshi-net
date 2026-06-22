import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { adjustHonor, incrementCommunityStat } from "@/lib/honor-helpers";

export const dynamic = "force-dynamic";

// POST /api/forum/comments/[id]/like — 点赞一条评论
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;
    const { id } = await params;

    const comment = await prisma.forumComment.findUnique({ where: { id } });
    if (!comment) return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    if (comment.status !== "published") {
      return NextResponse.json({ error: "评论不可见" }, { status: 403 });
    }

    // 不允许给自己的评论点赞（防止刷荣誉值）
    if (comment.userId === session.user.id) {
      return NextResponse.json({ error: "不能给自己的评论点赞" }, { status: 400 });
    }

    // 已点赞过
    const existing = await prisma.forumLike.findUnique({
      where: { userId_commentId: { userId: session.user.id, commentId: comment.id } },
    });
    if (existing) return NextResponse.json({ error: "已经点赞过" }, { status: 409 });

    await prisma.forumLike.create({
      data: { userId: session.user.id, commentId: comment.id },
    });

    // 给评论作者 +1 荣誉值（adjustHonor 内部含每日上限与来源去重）
    await adjustHonor(comment.userId, 1, "评论被点赞", "comment_liked", comment.id, session.user.id).catch(() => {});
    await incrementCommunityStat(comment.userId, "helpfulVoteCount").catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Like Comment Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// DELETE /api/forum/comments/[id]/like — 取消点赞评论
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;
    const { id } = await params;

    await prisma.forumLike.deleteMany({
      where: { userId: session.user.id, commentId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Unlike Comment Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
