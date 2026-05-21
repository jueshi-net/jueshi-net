// Server-side admin stats loader — v1.21.1: safe adCampaign guards
// Avoids client-side fetch auth cookie issues. Queries DB directly.
import { prisma } from "@/lib/prisma";

export interface AdminStatsData {
  pending: {
    reviews: number;
    draftTopics: number;
    unreadNotifications: number;
  };
  overview: {
    usersTotal: number;
    usersToday: number;
    topicsPublished: number;
    reviewsApproved: number;
    growthLogsTotal: number;
    notificationsTotal: number;
  };
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
  content: {
    topics: { published: number; draft: number; archived: number };
    reviews: { pending: number; approved: number; rejected: number; hidden: number; total: number };
    notifications: { unread: number; read: number; total: number };
  };
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

async function safeCount(fn: () => Promise<number>): Promise<number> {
  try { return await fn(); } catch { return 0; }
}

export async function loadAdminStats(): Promise<AdminStatsData | null> {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      reviewsPending, draftTopics, unreadNotifs,
      usersTotal, usersToday, topicsPublished, reviewsApproved, growthLogsTotal, notifsTotal,
      growthLogsToday, recentLogs, usersByLevel,
      topicsPublished2, topicsDraft, topicsArchived,
      reviewsTotal, reviewsPending2, reviewsApproved2, reviewsRejected, reviewsHidden,
      notifsUnread, notifsRead, notifsTotal2,
      userCount, memberCount, adminCount,
      articleTotal, articlePublished, articleDraft, articleArchived,
      resTotal, resActive, resInactive, resCats,
      ledgerCount, totalIssuedAgg, totalSpentAgg,
    ] = await Promise.all([
      prisma.toolReview.count({ where: { status: "pending" } }),
      prisma.topic.count({ where: { status: "draft" } }),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.topic.count({ where: { status: "published" } }),
      prisma.toolReview.count({ where: { status: "approved" } }),
      prisma.growthLog.count(),
      prisma.notification.count(),
      prisma.growthLog.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.growthLog.findMany({
        take: 5, orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, name: true } } },
      }),
      prisma.user.groupBy({ by: ["levelKey"], _count: { levelKey: true } }),
      prisma.topic.count({ where: { status: "published" } }),
      prisma.topic.count({ where: { status: "draft" } }),
      prisma.topic.count({ where: { status: "archived" } }),
      prisma.toolReview.count(),
      prisma.toolReview.count({ where: { status: "pending" } }),
      prisma.toolReview.count({ where: { status: "approved" } }),
      prisma.toolReview.count({ where: { status: "rejected" } }),
      prisma.toolReview.count({ where: { status: "hidden" } }),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.count({ where: { isRead: true } }),
      prisma.notification.count(),
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
      prisma.pointLedger.count(),
      prisma.pointLedger.aggregate({ _sum: { points: true }, where: { points: { gt: 0 } } }),
      prisma.pointLedger.aggregate({ _sum: { points: true }, where: { points: { lt: 0 } } }),
    ]);

    // Safe adCampaign queries — table may not exist in production yet
    const adTotal = await safeCount(() => prisma.adCampaign.count());
    const adActive = await safeCount(() => prisma.adCampaign.count({ where: { isActive: true } }));
    const adInactive = await safeCount(() => prisma.adCampaign.count({ where: { isActive: false } }));

    const levelMap: Record<string, number> = {};
    for (const l of usersByLevel) {
      if (l.levelKey) levelMap[l.levelKey] = l._count.levelKey;
    }
    for (const lv of ["lv1", "lv2", "lv3", "lv4", "lv5"]) {
      if (!levelMap[lv]) levelMap[lv] = 0;
    }

    return {
      pending: {
        reviews: reviewsPending,
        draftTopics: draftTopics,
        unreadNotifications: unreadNotifs,
      },
      overview: {
        usersTotal, usersToday, topicsPublished, reviewsApproved,
        growthLogsTotal, notificationsTotal: notifsTotal,
      },
      growth: {
        logsToday: growthLogsToday,
        recentLogs: recentLogs.map((l) => ({
          id: l.id, type: l.type, value: l.value, reason: l.reason,
          createdAt: l.createdAt.toISOString(),
          userEmail: l.user.email, userNickname: l.user.name,
        })),
        usersByLevel: levelMap,
      },
      content: {
        topics: { published: topicsPublished2, draft: topicsDraft, archived: topicsArchived },
        reviews: { total: safe(reviewsTotal), pending: safe(reviewsPending2), approved: safe(reviewsApproved2), rejected: safe(reviewsRejected), hidden: safe(reviewsHidden) },
        notifications: { unread: safe(notifsUnread), read: safe(notifsRead), total: safe(notifsTotal2) },
      },
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
