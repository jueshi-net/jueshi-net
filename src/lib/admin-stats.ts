// Server-side admin stats loader — v1.20.29: expanded for ops dashboard
// Avoids client-side fetch auth cookie issues. Queries DB directly.
import { prisma } from "@/lib/prisma";

export interface AdminStatsData {
  // ===== Pending items (今日待处理) =====
  pending: {
    reviews: number;
    forumPosts: number;
    forumComments: number;
    draftTopics: number;
    unreadNotifications: number;
  };
  // ===== Core overview =====
  overview: {
    usersTotal: number;
    usersToday: number;
    topicsPublished: number;
    forumPostsPublished: number;
    reviewsApproved: number;
    growthLogsTotal: number;
    notificationsTotal: number;
  };
  // ===== Growth system =====
  growth: {
    logsToday: number;
    recentLogs: Array<{
      id: string;
      type: string;
      value: number;
      reason: string | null;
      createdAt: string;
      userEmail: string;
      userNickname: string | null;
    }>;
    usersByLevel: Record<string, number>;
  };
  // ===== Content ops =====
  content: {
    topics: { published: number; draft: number; archived: number };
    reviews: { pending: number; approved: number; rejected: number; hidden: number; total: number };
    forumPosts: { pending: number; published: number; hidden: number; rejected: number; total: number };
    forumComments: { pending: number; published: number; hidden: number; rejected: number; total: number };
    notifications: { unread: number; read: number; total: number };
  };
  // ===== Legacy (keep for backward compat) =====
  users: { total: number; normal: number; members: number; admins: number };
  articles: { total: number; published: number; draft: number; archived: number };
  resources: { total: number; active: number; inactive: number; categories: number };
  ads: { total: number; active: number; inactive: number };
  reviews: { total: number; pending: number; approved: number; rejected: number; hidden: number };
  points: { totalIssued: number; totalSpent: number; ledgerCount: number };
}

function safe(n: number | null | undefined): number {
  return n ?? 0;
}

export async function loadAdminStats(): Promise<AdminStatsData | null> {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Run all queries in parallel
    const [
      // Pending items
      reviewsPending,
      forumPostsPending,
      forumCommentsPending,
      draftTopics,
      unreadNotifs,
      // Core overview
      usersTotal,
      usersToday,
      topicsPublished,
      forumPostsPublished,
      reviewsApproved,
      growthLogsTotal,
      notifsTotal,
      // Growth system
      growthLogsToday,
      recentLogs,
      usersByLevel,
      // Content ops
      topicsPublished2, topicsDraft, topicsArchived,
      reviewsTotal, reviewsPending2, reviewsApproved2, reviewsRejected, reviewsHidden,
      fpTotal, fpPending, fpPublished, fpHidden, fpRejected,
      fcTotal, fcPending, fcPublished, fcHidden, fcRejected,
      notifsUnread, notifsRead, notifsTotal2,
      // Legacy
      userCount, memberCount, adminCount,
      articleTotal, articlePublished, articleDraft, articleArchived,
      resTotal, resActive, resInactive, resCats,
      adTotal, adActive, adInactive,
      ledgerCount, totalIssuedAgg, totalSpentAgg,
    ] = await Promise.all([
      // --- Pending items ---
      prisma.toolReview.count({ where: { status: "pending" } }),
      prisma.forumPost.count({ where: { status: "pending" } }),
      prisma.forumComment.count({ where: { status: "pending" } }),
      prisma.topic.count({ where: { status: "draft" } }),
      prisma.notification.count({ where: { isRead: false } }),
      // --- Core overview ---
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.topic.count({ where: { status: "published" } }),
      prisma.forumPost.count({ where: { status: "published" } }),
      prisma.toolReview.count({ where: { status: "approved" } }),
      prisma.growthLog.count(),
      prisma.notification.count(),
      // --- Growth system ---
      prisma.growthLog.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.growthLog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, name: true } } },
      }),
      prisma.user.groupBy({ by: ["levelKey"], _count: { levelKey: true } }),
      // --- Content ops ---
      prisma.topic.count({ where: { status: "published" } }),
      prisma.topic.count({ where: { status: "draft" } }),
      prisma.topic.count({ where: { status: "archived" } }),
      prisma.toolReview.count(),
      prisma.toolReview.count({ where: { status: "pending" } }),
      prisma.toolReview.count({ where: { status: "approved" } }),
      prisma.toolReview.count({ where: { status: "rejected" } }),
      prisma.toolReview.count({ where: { status: "hidden" } }),
      prisma.forumPost.count(),
      prisma.forumPost.count({ where: { status: "pending" } }),
      prisma.forumPost.count({ where: { status: "published" } }),
      prisma.forumPost.count({ where: { status: "hidden" } }),
      prisma.forumPost.count({ where: { status: "rejected" } }),
      prisma.forumComment.count(),
      prisma.forumComment.count({ where: { status: "pending" } }),
      prisma.forumComment.count({ where: { status: "published" } }),
      prisma.forumComment.count({ where: { status: "hidden" } }),
      prisma.forumComment.count({ where: { status: "rejected" } }),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.count({ where: { isRead: true } }),
      prisma.notification.count(),
      // --- Legacy ---
      prisma.user.count({ where: { role: "user" } }),
      prisma.user.count({ where: { role: "member" } }),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.article.count(),
      prisma.article.count({ where: { status: "published" } }),
      prisma.article.count({ where: { status: "draft" } }),
      prisma.article.count({ where: { status: "archived" } }),
      prisma.resource.count(),
      prisma.resource.count({ where: { isActive: true } }),
      prisma.resource.count({ where: { isActive: false } }),
      prisma.resource.groupBy({ by: ["category"] }),
      prisma.adSlot.count(),
      prisma.adSlot.count({ where: { isActive: true } }),
      prisma.adSlot.count({ where: { isActive: false } }),
      prisma.pointLedger.count(),
      prisma.pointLedger.aggregate({ _sum: { points: true }, where: { points: { gt: 0 } } }),
      prisma.pointLedger.aggregate({ _sum: { points: true }, where: { points: { lt: 0 } } }),
    ]);

    // Build usersByLevel map
    const levelMap: Record<string, number> = {};
    for (const l of usersByLevel) {
      levelMap[l.levelKey] = l._count.levelKey;
    }
    // Ensure all levels exist
    for (const lv of ["lv1", "lv2", "lv3", "lv4", "lv5"]) {
      if (!levelMap[lv]) levelMap[lv] = 0;
    }

    return {
      // Pending
      pending: {
        reviews: reviewsPending,
        forumPosts: forumPostsPending,
        forumComments: forumCommentsPending,
        draftTopics: draftTopics,
        unreadNotifications: unreadNotifs,
      },
      // Overview
      overview: {
        usersTotal,
        usersToday,
        topicsPublished,
        forumPostsPublished,
        reviewsApproved,
        growthLogsTotal,
        notificationsTotal: notifsTotal,
      },
      // Growth
      growth: {
        logsToday: growthLogsToday,
        recentLogs: recentLogs.map((l) => ({
          id: l.id,
          type: l.type,
          value: l.value,
          reason: l.reason,
          createdAt: l.createdAt.toISOString(),
          userEmail: l.user.email,
          userNickname: l.user.name,
        })),
        usersByLevel: levelMap,
      },
      // Content
      content: {
        topics: { published: topicsPublished2, draft: topicsDraft, archived: topicsArchived },
        reviews: { total: safe(reviewsTotal), pending: safe(reviewsPending2), approved: safe(reviewsApproved2), rejected: safe(reviewsRejected), hidden: safe(reviewsHidden) },
        forumPosts: { total: safe(fpTotal), pending: safe(fpPending), published: safe(fpPublished), hidden: safe(fpHidden), rejected: safe(fpRejected) },
        forumComments: { total: safe(fcTotal), pending: safe(fcPending), published: safe(fcPublished), hidden: safe(fcHidden), rejected: safe(fcRejected) },
        notifications: { unread: safe(notifsUnread), read: safe(notifsRead), total: safe(notifsTotal2) },
      },
      // Legacy
      users: { total: userCount + memberCount + adminCount, normal: userCount, members: memberCount, admins: adminCount },
      articles: { total: articleTotal, published: articlePublished, draft: articleDraft, archived: articleArchived },
      resources: { total: resTotal, active: resActive, inactive: resInactive, categories: resCats.length },
      ads: { total: adTotal, active: adActive, inactive: adInactive },
      reviews: { total: reviewsTotal, pending: reviewsPending, approved: reviewsApproved, rejected: reviewsRejected, hidden: reviewsHidden },
      points: { totalIssued: safe(totalIssuedAgg._sum.points), totalSpent: Math.abs(safe(totalSpentAgg._sum.points)), ledgerCount },
    };
  } catch (err) {
    console.error("Admin stats load error:", err);
    return null;
  }
}
