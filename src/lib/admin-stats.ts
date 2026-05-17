// Server-side admin stats loader — avoids client-side fetch auth cookie issues
// The admin layout already does server-side auth() check + redirect,
// so any page that renders here is guaranteed to be admin-authenticated.
// We query DB directly instead of going through API routes.
import { prisma } from "@/lib/prisma";

export interface AdminStatsData {
  users: { total: number; normal: number; members: number; admins: number };
  articles: { total: number; published: number; draft: number; archived: number };
  resources: { total: number; active: number; inactive: number; categories: number };
  ads: { total: number; active: number; inactive: number };
  reviews: { total: number; pending: number; approved: number; rejected: number; hidden: number };
  points: { totalIssued: number; totalSpent: number; ledgerCount: number };
}

export async function loadAdminStats(): Promise<AdminStatsData | null> {
  try {
    const [
      userCount, memberCount, adminCount,
      articleTotal, articlePublished, articleDraft, articleArchived,
      resTotal, resActive, resInactive,
      resCats,
      adTotal, adActive, adInactive,
      reviewTotal, reviewPending, reviewApproved, reviewRejected, reviewHidden,
      ledgerCount, totalIssuedAgg, totalSpentAgg,
    ] = await Promise.all([
      // Users
      prisma.user.count({ where: { role: "user" } }),
      prisma.user.count({ where: { role: "member" } }),
      prisma.user.count({ where: { role: "admin" } }),
      // Articles
      prisma.article.count(),
      prisma.article.count({ where: { status: "published" } }),
      prisma.article.count({ where: { status: "draft" } }),
      prisma.article.count({ where: { status: "archived" } }),
      // Resources
      prisma.resource.count(),
      prisma.resource.count({ where: { isActive: true } }),
      prisma.resource.count({ where: { isActive: false } }),
      // Resource categories
      prisma.resource.groupBy({ by: ["category"] }),
      // Ads
      prisma.adSlot.count(),
      prisma.adSlot.count({ where: { isActive: true } }),
      prisma.adSlot.count({ where: { isActive: false } }),
      // Reviews
      prisma.toolReview.count(),
      prisma.toolReview.count({ where: { status: "pending" } }),
      prisma.toolReview.count({ where: { status: "approved" } }),
      prisma.toolReview.count({ where: { status: "rejected" } }),
      prisma.toolReview.count({ where: { status: "hidden" } }),
      // Points
      prisma.pointLedger.count(),
      prisma.pointLedger.aggregate({ _sum: { points: true }, where: { points: { gt: 0 } } }),
      prisma.pointLedger.aggregate({ _sum: { points: true }, where: { points: { lt: 0 } } }),
    ]);

    return {
      users: { total: userCount + memberCount + adminCount, normal: userCount, members: memberCount, admins: adminCount },
      articles: { total: articleTotal, published: articlePublished, draft: articleDraft, archived: articleArchived },
      resources: { total: resTotal, active: resActive, inactive: resInactive, categories: resCats.length },
      ads: { total: adTotal, active: adActive, inactive: adInactive },
      reviews: { total: reviewTotal, pending: reviewPending, approved: reviewApproved, rejected: reviewRejected, hidden: reviewHidden },
      points: { totalIssued: totalIssuedAgg._sum.points || 0, totalSpent: Math.abs(totalSpentAgg._sum.points || 0), ledgerCount },
    };
  } catch (err) {
    console.error("Admin stats load error:", err);
    return null;
  }
}
