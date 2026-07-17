import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

// GET /api/forum/notifications
// 获取当前用户的通知（分页，默认最新 20 条），返回触发者公开信息（name/image）
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10))
    );

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.forumNotification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.forumNotification.count({ where: { userId } }),
      prisma.forumNotification.count({ where: { userId, isRead: false } }),
    ]);

    // ForumNotification.actorId 无关联关系，手动获取触发者公开信息
    // 仅取 name/image，不泄露 email/password/points
    const actorIds = Array.from(
      new Set(
        notifications.map((n) => n.actorId).filter(Boolean) as string[]
      )
    );
    const actors = actorIds.length
      ? await prisma.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, name: true, image: true },
        })
      : [];
    const actorMap = new Map(actors.map((a) => [a.id, a]));

    const items = notifications.map((n) => ({
      id: n.id,
      type: n.type,
      postId: n.postId,
      commentId: n.commentId,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt,
      actor: n.actorId ? actorMap.get(n.actorId) || null : null,
    }));

    return NextResponse.json({
      notifications: items,
      total,
      unreadCount,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("[Forum Notifications GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// POST /api/forum/notifications
// 标记单条通知为已读（body: { notificationId }）
// 标记全部已读（body: { markAll: true }）
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;
    const userId = session.user.id;

    const body = await request.json().catch(() => ({}));
    const { notificationId, markAll } = body;

    if (markAll === true) {
      // Mark all unread notifications as read
      const result = await prisma.forumNotification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({
        success: true,
        updated: result.count,
      });
    }

    if (!notificationId || typeof notificationId !== "string") {
      return NextResponse.json({ error: "缺少 notificationId" }, { status: 400 });
    }

    // 仅允许标记自己的通知
    const notification = await prisma.forumNotification.findUnique({
      where: { id: notificationId },
      select: { id: true, userId: true },
    });
    if (!notification) {
      return NextResponse.json({ error: "通知不存在" }, { status: 404 });
    }
    if (notification.userId !== userId) {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    await prisma.forumNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Forum Notifications POST Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
