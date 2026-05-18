// Notification helper — fire-and-forget, never blocks main business flow
import { prisma } from "@/lib/prisma";
import { GROWTH_TYPE_LABELS } from "@/lib/growth-type-labels";

export type NotificationType =
  | "growth_reward"
  | "badge_awarded"
  | "level_up"
  | "review_approved"
  | "review_rejected"
  | "forum_post_approved"
  | "forum_post_rejected"
  | "forum_comment_approved"
  | "forum_comment_hidden"
  | "system"
  | "admin_message";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a notification — fire-and-forget, never throws
 */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link || null,
        isRead: false,
      },
    });
  } catch (err) {
    console.error("[notifications] createNotification failed:", err);
    // Never throw — notification failure must not break main flow
  }
}

/**
 * Create a growth reward notification
 */
export async function createGrowthNotification(
  userId: string,
  growthType: string,
  value: number
): Promise<void> {
  const label = GROWTH_TYPE_LABELS[growthType] || growthType;
  await createNotification({
    userId,
    type: "growth_reward",
    title: `成长值 +${value}`,
    message: `你因为「${label}」获得了 ${value} 成长值。`,
    link: getGrowthLink(growthType),
  });
}

/**
 * Create a level up notification
 */
export async function createLevelUpNotification(
  userId: string,
  newLevelKey: string
): Promise<void> {
  const levelNames: Record<string, string> = {
    lv1: "Lv.1 新手",
    lv2: "Lv.2 进阶",
    lv3: "Lv.3 精英",
    lv4: "Lv.4 大师",
    lv5: "Lv.5 传奇",
  };
  const levelName = levelNames[newLevelKey] || newLevelKey;
  await createNotification({
    userId,
    type: "level_up",
    title: "等级提升 🎉",
    message: `恭喜你升级到 ${levelName}！`,
    link: "/dashboard",
  });
}

/**
 * Create a badge awarded notification
 */
export async function createBadgeNotification(
  userId: string,
  badgeName: string
): Promise<void> {
  await createNotification({
    userId,
    type: "badge_awarded",
    title: "获得新勋章 🎖️",
    message: `你获得了「${badgeName}」勋章。`,
    link: "/dashboard",
  });
}

function getGrowthLink(growthType: string): string {
  switch (growthType) {
    case "daily_checkin":
    case "dashboard_visit":
      return "/dashboard/tasks";
    case "review_approved":
      return "/dashboard/points";
    case "forum_post_approved":
    case "forum_comment_approved":
      return "/bbs";
    default:
      return "/dashboard/tasks";
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: { userId, isRead: false },
    });
  } catch {
    return 0;
  }
}

/**
 * Mark notification as read (with userId ownership check)
 */
export async function markAsRead(userId: string, notificationId: string): Promise<boolean> {
  try {
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count > 0;
  } catch {
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<number> {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count;
  } catch {
    return 0;
  }
}

/**
 * Admin: list notifications with filters (for /admin/notifications)
 */
export interface AdminNotificationFilters {
  page?: number;
  pageSize?: number;
  email?: string;
  type?: string;
  unreadOnly?: boolean;
}

export interface AdminNotificationListResult {
  items: Array<{
    id: string;
    userId: string;
    userEmail: string;
    userNickname: string | null;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    readAt: string | null;
    link: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listAdminNotifications(
  filters: AdminNotificationFilters = {}
): Promise<AdminNotificationListResult> {
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize || 20));

  const where: Record<string, unknown> = {};
  if (filters.email) {
    where.user = { email: { contains: filters.email, mode: "insensitive" } };
  }
  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.unreadOnly) {
    where.isRead = false;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    items: notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      userEmail: n.user.email,
      userNickname: n.user.name,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      readAt: n.readAt?.toISOString() || null,
      link: n.link,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Admin: send notification to a user by email
 */
export async function sendNotificationByEmail(
  email: string,
  type: string,
  title: string,
  message: string,
  link?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true, role: true },
    });
    if (!user) return { success: false, error: `用户 ${email} 不存在` };

    await prisma.notification.create({
      data: {
        userId: user.id,
        type,
        title,
        message,
        link: link || null,
        isRead: false,
      },
    });
    return { success: true };
  } catch (err) {
    console.error("[notifications] sendNotificationByEmail failed:", err);
    return { success: false, error: "发送失败" };
  }
}

/**
 * Admin: broadcast notification to all enabled users
 */
export async function broadcastNotification(
  type: string,
  title: string,
  message: string,
  link?: string | null
): Promise<{ createdCount: number; error?: string }> {
  try {
    const allUsers = await prisma.user.findMany({
      select: { id: true },
    });
    if (allUsers.length === 0) return { createdCount: 0 };

    await prisma.notification.createMany({
      data: allUsers.map((u) => ({
        userId: u.id,
        type,
        title,
        message,
        link: link || null,
        isRead: false,
      })),
    });
    return { createdCount: allUsers.length };
  } catch (err) {
    console.error("[notifications] broadcastNotification failed:", err);
    return { createdCount: 0, error: "群发失败" };
  }
}
