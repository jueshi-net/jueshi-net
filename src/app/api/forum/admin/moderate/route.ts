// POST /api/forum/admin/moderate - 单个帖子审核操作
// body: {
//   postId: string,
//   action: "approve" | "reject" | "hide" | "restore" | "pin" | "unpin" | "feature" | "unfeature" | "lock" | "unlock",
//   reason?: string,
// }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

const VALID_ACTIONS = [
  "approve",
  "reject",
  "hide",
  "restore",
  "pin",
  "unpin",
  "feature",
  "unfeature",
  "lock",
  "unlock",
] as const;

type ModAction = (typeof VALID_ACTIONS)[number];

export async function POST(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;
    const { session } = adminResult;
    const adminId = session.user.id;

    const body = await request.json();
    const { postId, action, reason } = body as {
      postId: string;
      action: string;
      reason?: string;
    };

    if (!postId || typeof postId !== "string") {
      return NextResponse.json({ error: "缺少 postId" }, { status: 400 });
    }

    if (!action || !VALID_ACTIONS.includes(action as ModAction)) {
      return NextResponse.json(
        { error: `无效的操作，支持: ${VALID_ACTIONS.join(", ")}` },
        { status: 400 }
      );
    }

    const modAction = action as ModAction;

    // Reject requires a reason
    if (modAction === "reject" && (!reason || reason.trim().length < 2)) {
      return NextResponse.json(
        { error: "驳回原因至少 2 个字符" },
        { status: 400 }
      );
    }

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { id: true, slug: true, title: true, userId: true, status: true, isPinned: true, isLocked: true, isFeatured: true },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    const trimmedReason = reason?.trim() || null;

    // P4: Idempotency checks — reject no-op moderation actions
    const postStatus = post.status as string;
    const idempotencyErrors: Partial<Record<ModAction, string>> = {
      approve: postStatus === "published" ? "该帖子已是「已发布」状态" : undefined,
      reject: postStatus === "rejected" ? "该帖子已被驳回" : undefined,
      hide: postStatus === "hidden" ? "该帖子已隐藏" : undefined,
      restore: postStatus !== "hidden" ? "该帖子未处于隐藏状态，无需恢复" : undefined,
      pin: post.isPinned ? "该帖子已置顶" : undefined,
      unpin: !post.isPinned ? "该帖子未置顶" : undefined,
      feature: post.isFeatured ? "该帖子已是精华" : undefined,
      unfeature: !post.isFeatured ? "该帖子不是精华" : undefined,
      lock: post.isLocked ? "该帖子已锁定" : undefined,
      unlock: !post.isLocked ? "该帖子未锁定" : undefined,
    };

    const idempotencyError = idempotencyErrors[modAction];
    if (idempotencyError) {
      return NextResponse.json(
        { error: idempotencyError, noOp: true, currentStatus: post.status },
        { status: 409 }
      );
    }

    // Determine new post fields based on action
    const updates: Record<string, unknown> = {};
    let notificationType: string | null = null;
    let notificationMessage = "";

    switch (modAction) {
      case "approve":
        updates.status = "published";
        notificationType = "post_approved";
        notificationMessage = `您的帖子「${post.title}」已审核通过`;
        break;
      case "reject":
        updates.status = "rejected";
        notificationType = "post_rejected";
        notificationMessage = `您的帖子「${post.title}」已被驳回${trimmedReason ? `：${trimmedReason}` : ""}`;
        break;
      case "hide":
        updates.status = "hidden";
        notificationType = "post_hidden";
        notificationMessage = `您的帖子「${post.title}」已被隐藏${trimmedReason ? `：${trimmedReason}` : ""}`;
        break;
      case "restore":
        updates.status = "published";
        notificationType = "post_restored";
        notificationMessage = `您的帖子「${post.title}」已恢复显示`;
        break;
      case "pin":
        updates.isPinned = true;
        notificationType = "post_featured";
        notificationMessage = `您的帖子「${post.title}」已被置顶`;
        break;
      case "unpin":
        updates.isPinned = false;
        break;
      case "feature":
        updates.isFeatured = true;
        notificationType = "post_featured";
        notificationMessage = `您的帖子「${post.title}」已被设为精华`;
        break;
      case "unfeature":
        updates.isFeatured = false;
        break;
      case "lock":
        updates.isLocked = true;
        notificationType = "post_locked";
        notificationMessage = `您的帖子「${post.title}」已被锁定`;
        break;
      case "unlock":
        updates.isLocked = false;
        notificationType = "post_restored";
        notificationMessage = `您的帖子「${post.title}」已解锁`;
        break;
    }

    // Use transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // Update post
      await tx.forumPost.update({
        where: { id: post.id },
        data: updates,
      });

      // Create moderation log
      await tx.moderationLog.create({
        data: {
          adminId,
          action: modAction,
          postId: post.id,
          reason: trimmedReason,
        },
      });

      // Create notification if applicable
      if (notificationType && notificationMessage) {
        await tx.forumNotification.create({
          data: {
            userId: post.userId,
            type: notificationType,
            postId: post.id,
            actorId: adminId,
            message: notificationMessage,
          },
        });
      }
    });

    return NextResponse.json({ success: true, action: modAction, postId });
  } catch (error) {
    console.error("[Admin Moderate Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
