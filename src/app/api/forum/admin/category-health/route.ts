// GET /api/forum/admin/category-health - Category operations dashboard
// Provides: empty categories, stale categories, post counts, interaction metrics,
// pending review counts, hot content, cold-start suggestions

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    // Fetch all active categories
    const categories = await prisma.forumCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        iconText: true,
        color: true,
        sortOrder: true,
      },
    });

    if (categories.length === 0) {
      return NextResponse.json({ categories: [], summary: { total: 0 } });
    }

    // Batch query: post counts per category (published)
    const publishedCounts = await prisma.forumPost.groupBy({
      by: ["categoryId"],
      _count: { id: true },
      where: { status: "published" },
    });
    const publishedMap = new Map(publishedCounts.map((c) => [c.categoryId, c._count.id]));

    // Batch query: pending counts per category
    const pendingCounts = await prisma.forumPost.groupBy({
      by: ["categoryId"],
      _count: { id: true },
      where: { status: "pending" },
    });
    const pendingMap = new Map(pendingCounts.map((c) => [c.categoryId, c._count.id]));

    // Batch query: interaction totals (views + comments) per category
    const interactionStats = await prisma.forumPost.groupBy({
      by: ["categoryId"],
      _sum: { viewCount: true, commentCount: true },
      where: { status: "published" },
    });
    const interactionMap = new Map(
      interactionStats.map((s) => [
        s.categoryId,
        {
          totalViews: s._sum.viewCount || 0,
          totalComments: s._sum.commentCount || 0,
        },
      ])
    );

    // Batch query: latest post date per category
    const latestPosts = await prisma.forumPost.groupBy({
      by: ["categoryId"],
      _max: { createdAt: true },
      where: { status: "published" },
    });
    const latestMap = new Map(latestPosts.map((p) => [p.categoryId, p._max.createdAt]));

    // Batch query: hot posts per category (top 1 by views)
    const categoryIds = categories.map((c) => c.id);
    const hotPostsRaw = await prisma.forumPost.findMany({
      where: {
        status: "published",
        categoryId: { in: categoryIds },
      },
      orderBy: [{ viewCount: "desc" }],
      take: categoryIds.length,
      select: {
        id: true,
        slug: true,
        title: true,
        viewCount: true,
        commentCount: true,
        categoryId: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });
    // Keep only the first (hottest) post per category
    const hotPostMap = new Map<string, typeof hotPostsRaw[0]>();
    for (const p of hotPostsRaw) {
      if (!hotPostMap.has(p.categoryId)) {
        hotPostMap.set(p.categoryId, p);
      }
    }

    // Build result
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const result = categories.map((cat) => {
      const postCount = publishedMap.get(cat.id) || 0;
      const pendingCount = pendingMap.get(cat.id) || 0;
      const interaction = interactionMap.get(cat.id) || { totalViews: 0, totalComments: 0 };
      const latestAt = latestMap.get(cat.id) || null;
      const hotPost = hotPostMap.get(cat.id) || null;

      const isEmpty = postCount === 0;
      const isStale = !latestAt || latestAt < thirtyDaysAgo;
      const isActive = latestAt ? latestAt > sevenDaysAgo : false;

      // Cold-start suggestion logic
      let suggestion: string;
      if (isEmpty) {
        suggestion = "空分类：建议创建种子内容，邀请活跃用户发首帖";
      } else if (isStale) {
        suggestion = "长期无更新：建议推送相关话题或置顶优质旧帖";
      } else if (postCount < 3) {
        suggestion = "内容较少：建议补充更多种子内容";
      } else if (interaction.totalViews < 50) {
        suggestion = "互动不足：建议优化标题或添加标签提升可发现性";
      } else {
        suggestion = "健康运营中";
      }

      return {
        id: cat.id,
        key: cat.key,
        name: cat.name,
        description: cat.description,
        iconText: cat.iconText,
        color: cat.color,
        sortOrder: cat.sortOrder,
        postCount,
        pendingCount,
        totalViews: interaction.totalViews,
        totalComments: interaction.totalComments,
        avgViewsPerPost: postCount > 0 ? Math.round(interaction.totalViews / postCount) : 0,
        latestPostAt: latestAt,
        isEmpty,
        isStale,
        isActive,
        hotPost: hotPost
          ? {
              slug: hotPost.slug,
              title: hotPost.title,
              viewCount: hotPost.viewCount,
              commentCount: hotPost.commentCount,
              authorName: hotPost.user?.name || "匿名用户",
            }
          : null,
        suggestion,
      };
    });

    // Summary
    const summary = {
      total: result.length,
      empty: result.filter((c) => c.isEmpty).length,
      stale: result.filter((c) => c.isStale).length,
      active: result.filter((c) => c.isActive).length,
      totalPosts: result.reduce((sum, c) => sum + c.postCount, 0),
      totalPending: result.reduce((sum, c) => sum + c.pendingCount, 0),
      totalViews: result.reduce((sum, c) => sum + c.totalViews, 0),
      totalComments: result.reduce((sum, c) => sum + c.totalComments, 0),
    };

    return NextResponse.json({ categories: result, summary });
  } catch (error) {
    console.error("[Forum Category Health API Error]", error);
    return NextResponse.json(
      { error: "获取分类健康度失败", code: "DATABASE_ERROR" },
      { status: 500 }
    );
  }
}
