import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { adjustHonor, incrementCommunityStat } from "@/lib/honor-helpers";

export const dynamic = "force-dynamic";

// POST /api/forum/posts/[slug]/accept
// 采纳一条评论为最佳回答。仅帖子作者或管理员可操作。
// - 设置 ForumPost.isSolved=true、acceptedCommentId
// - 设置 ForumComment.isAccepted=true
// - 给评论作者 +10 荣誉值（adjustHonor 内部写 HonorLog，含每日上限与来源去重）
// - 为评论作者创建 ForumNotification
// - 写入 ModerationLog 审计记录
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;
    const actorId = session.user.id;
    const role = (session.user as any).role || "";

    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const { commentId } = body;

    if (!commentId || typeof commentId !== "string") {
      return NextResponse.json({ error: "缺少 commentId" }, { status: 400 });
    }

    const post = await prisma.forumPost.findUnique({ where: { slug } });
    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // 仅帖子作者或管理员可采纳
    const isAdmin = ["管理员", "ADMIN", "admin"].includes(role);
    if (post.userId !== actorId && !isAdmin) {
      return NextResponse.json({ error: "无权采纳回答" }, { status: 403 });
    }

    // 校验评论存在且属于该帖
    const comment = await prisma.forumComment.findUnique({
      where: { id: commentId },
    });
    if (!comment || comment.postId !== post.id) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }
    if (comment.status !== "published") {
      return NextResponse.json(
        { error: "该评论不可见，无法采纳" },
        { status: 400 }
      );
    }

    // 已采纳同一条评论
    if (post.isSolved && post.acceptedCommentId === comment.id) {
      return NextResponse.json(
        { error: "该回答已被采纳" },
        { status: 409 }
      );
    }

    // 事务：更新帖子 + 评论 + 荣誉值 + 通知 + 审计日志（保证原子性）
    await prisma.$transaction(async (tx) => {
      // 若此前已采纳其他评论，先取消其 isAccepted
      if (post.acceptedCommentId && post.acceptedCommentId !== comment.id) {
        await tx.forumComment.update({
          where: { id: post.acceptedCommentId },
          data: { isAccepted: false },
        });
      }

      // 设置帖子为已解决，并标记采纳评论
      await tx.forumPost.update({
        where: { id: post.id },
        data: {
          isSolved: true,
          acceptedCommentId: comment.id,
        },
      });

      // 标记评论为已采纳
      await tx.forumComment.update({
        where: { id: comment.id },
        data: { isAccepted: true },
      });

      // 给评论作者 +10 荣誉值（adjustHonor 内部写 HonorLog，含每日上限与来源去重）
      await adjustHonor(
        comment.userId,
        10,
        "answer_accepted",
        "回答被采纳为最佳答案",
        comment.id,
        actorId,
        tx
      );

      // 通知评论作者：你的回答被采纳了
      await tx.forumNotification.create({
        data: {
          userId: comment.userId,
          type: "accepted",
          postId: post.id,
          commentId: comment.id,
          actorId,
          message: `你的回答在《${post.title}》中被采纳为最佳答案`,
        },
      });

      // 写入管理操作审计日志（作者或管理员采纳均记录）
      await tx.moderationLog.create({
        data: {
          adminId: actorId,
          action: "accept",
          postId: post.id,
          commentId: comment.id,
          reason: isAdmin ? "管理员采纳回答" : "作者采纳回答",
        },
      });
    });

    // 社区统计增量更新（非核心，失败不影响采纳结果）
    await incrementCommunityStat(comment.userId, "acceptedAnswerCount", 1).catch(
      () => {}
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Accept Answer Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
