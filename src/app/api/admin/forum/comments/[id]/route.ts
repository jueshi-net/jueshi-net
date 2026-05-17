// PATCH /api/admin/forum/comments/[id] — 管理评论操作

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { grantCommentReward } from "@/lib/forum-rewards";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const res = await requireAdmin();
  if (res instanceof NextResponse) return res;

  const { id } = await params;

  try {
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "status 是必需的" }, { status: 400 });
    }

    const validStatuses = ["published", "pending", "hidden", "deleted"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status 必须是 ${validStatuses.join(", ")} 之一` },
        { status: 400 }
      );
    }

    const existing = await prisma.forumComment.findUnique({
      where: { id },
      select: { status: true, postId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }

    const oldStatus = existing.status;

    // Update comment
    const comment = await prisma.forumComment.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { name: true, email: true } },
        post: { select: { title: true } },
      },
    });

    // Update post commentCount when status crosses the published boundary
    // pending → published: increment
    // published → hidden/deleted: decrement
    // hidden → published: increment
    if (status === "published" && oldStatus === "pending") {
      await prisma.forumPost.update({
        where: { id: existing.postId },
        data: {
          commentCount: { increment: 1 },
          lastCommentAt: new Date(),
          lastCommentUserId: comment.userId,
        },
      });
    } else if (oldStatus === "published" && (status === "hidden" || status === "deleted")) {
      await prisma.forumPost.update({
        where: { id: existing.postId },
        data: { commentCount: { increment: -1 } },
      });
    } else if (oldStatus === "hidden" && status === "published") {
      await prisma.forumPost.update({
        where: { id: existing.postId },
        data: { commentCount: { increment: 1 } },
      });
    }

    // 如果审核通过（pending → published），发放成长值奖励
    if (status === "published" && oldStatus === "pending") {
      const commentWithUser = await prisma.forumComment.findUnique({
        where: { id },
        select: { rewardGrantedAt: true, userId: true },
      });
      if (commentWithUser && !commentWithUser.rewardGrantedAt) {
        await grantCommentReward(id, commentWithUser.userId);
      }
    }

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error("[Admin Forum Comment PATCH Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
