// PUT /api/admin/forum/comments/[id] — Approve/reject comments
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { grantCommentReward } from "@/lib/forum-rewards";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { session } = authResult;

  const userRole = (session.user as any).role?.toUpperCase();
  if (userRole !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body; // approve, reject

    const comment = await prisma.forumComment.findUnique({ where: { id } });
    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }

    let updateData: any = {};
    let eventAction = "";

    switch (action) {
      case "approve":
        updateData.status = "published";
        eventAction = "forum_comment_approve";
        break;
      case "reject":
        updateData.status = "hidden";
        eventAction = "forum_comment_reject";
        break;
      default:
        return NextResponse.json({ error: "无效操作" }, { status: 400 });
    }

    const updatedComment = await prisma.$transaction(async (tx) => {
      const c = await tx.forumComment.update({
        where: { id },
        data: updateData,
      });

      // If approving, increment post comment count
      if (action === "approve" && comment.status === "pending") {
        await tx.forumPost.update({
          where: { id: comment.postId },
          data: {
            commentCount: { increment: 1 },
            lastCommentAt: new Date(),
            lastCommentUserId: comment.userId,
          },
        });
      }

      return c;
    });

    // Log event (non-blocking)
    try {
      await prisma.eventLog.create({
        data: {
          eventType: "forum_admin",
          action: eventAction,
          toolName: id,
        },
      });
    } catch (logError) {
      console.error("[Forum Event Log Error]", logError);
    }

    // Grant growth reward on approve (non-blocking)
    if (action === "approve") {
      try {
        await grantCommentReward(updatedComment.id, updatedComment.userId);
      } catch (rewardError) {
        console.error("[Forum Comment Reward Error]", rewardError);
      }
    }

    return NextResponse.json({ success: true, comment: updatedComment });
  } catch (error) {
    console.error("[Admin Forum Comment Action Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
