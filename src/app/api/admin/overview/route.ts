// GET /api/admin/overview — real-time admin dashboard stats
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    // Users by role
    const [userCount, memberCount, adminCount] = await Promise.all([
      prisma.user.count({ where: { role: "user" } }),
      prisma.user.count({ where: { role: "member" } }),
      prisma.user.count({ where: { role: "admin" } }),
    ]);

    // Articles by status
    const [articleTotal, articlePublished, articleDraft, articleArchived] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count({ where: { status: "DRAFT" } }),
      prisma.article.count({ where: { status: "ARCHIVED" } }),
    ]);

    // Resources
    const [resTotal, resActive, resInactive, resCategories] = await Promise.all([
      prisma.resource.count(),
      prisma.resource.count({ where: { isActive: true } }),
      prisma.resource.count({ where: { isActive: false } }),
      prisma.resource.groupBy({ by: ["category"] }).then((r: any[]) => r.length),
    ]);

    // Ads
    const [adTotal, adActive, adInactive] = await Promise.all([
      prisma.adSlot.count(),
      prisma.adSlot.count({ where: { isActive: true } }),
      prisma.adSlot.count({ where: { isActive: false } }),
    ]);

    // Reviews by status
    const [reviewTotal, reviewPending, reviewApproved, reviewRejected, reviewHidden] = await Promise.all([
      prisma.toolReview.count(),
      prisma.toolReview.count({ where: { status: "pending" } }),
      prisma.toolReview.count({ where: { status: "approved" } }),
      prisma.toolReview.count({ where: { status: "rejected" } }),
      prisma.toolReview.count({ where: { status: "hidden" } }),
    ]);

    // Points ledger stats
    const [ledgerCount, totalIssuedAgg, totalSpentAgg] = await Promise.all([
      prisma.pointLedger.count(),
      prisma.pointLedger.aggregate({ _sum: { points: true }, where: { points: { gt: 0 } } }),
      prisma.pointLedger.aggregate({ _sum: { points: true }, where: { points: { lt: 0 } } }),
    ]);
    const totalIssued = totalIssuedAgg._sum.points || 0;
    const totalSpent = Math.abs(totalSpentAgg._sum.points || 0);

    return NextResponse.json({
      users: { total: userCount + memberCount + adminCount, normal: userCount, members: memberCount, admins: adminCount },
      articles: { total: articleTotal, published: articlePublished, draft: articleDraft, archived: articleArchived },
      resources: { total: resTotal, active: resActive, inactive: resInactive, categories: resCategories },
      ads: { total: adTotal, active: adActive, inactive: adInactive },
      reviews: { total: reviewTotal, pending: reviewPending, approved: reviewApproved, rejected: reviewRejected, hidden: reviewHidden },
      points: { totalIssued, totalSpent, ledgerCount },
    });
  } catch (err) {
    console.error("Admin overview error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
