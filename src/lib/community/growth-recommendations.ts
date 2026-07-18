/**
 * Forum V1.3 - Growth Recommendations Engine
 *
 * Rule-based, explainable recommendations:
 * - Categories lacking content
 * - Posts with no replies
 * - Search queries with no results
 * - Posts worth updating
 * - Posts suitable for featuring
 * - Categories needing cold-start
 *
 * All recommendations are read-only suggestions.
 * No automatic modifications to posts or categories.
 */

import { prisma } from "@/lib/prisma";

export interface Recommendation {
  type: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "opportunity";
  actionLabel: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Generate growth recommendations based on current data.
 * @param daysBack - Lookback period (default 30)
 */
export async function computeGrowthRecommendations(
  daysBack = 30
): Promise<{
  recommendations: Recommendation[];
  generatedAt: string;
}> {
  const now = new Date();
  const since = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const recommendations: Recommendation[] = [];

  // 1. Categories lacking content
  const categories = await prisma.forumCategory.findMany({
    where: { isActive: true },
    select: {
      id: true,
      key: true,
      name: true,
      description: true,
      _count: {
        select: {
          posts: {
            where: {
              status: "published",
              createdAt: { gte: since },
            },
          },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  for (const cat of categories) {
    if (cat._count.posts === 0) {
      recommendations.push({
        type: "category_lacks_content",
        title: `分类「${cat.name}」近 ${daysBack} 天无新帖`,
        description: `该分类在近 ${daysBack} 天内没有新的已发布帖子。考虑引导用户在此分类发帖，或发布种子内容。`,
        severity: "warning",
        actionLabel: "查看分类",
        actionUrl: `/bbs/category/${cat.key}`,
        metadata: { categoryKey: cat.key },
      });
    } else if (cat._count.posts < 3) {
      recommendations.push({
        type: "category_low_content",
        title: `分类「${cat.name}」内容不足`,
        description: `近 ${daysBack} 天仅 ${cat._count.posts} 篇帖子。建议增加该分类的内容密度。`,
        severity: "info",
        actionLabel: "查看分类",
        actionUrl: `/bbs/category/${cat.key}`,
        metadata: { categoryKey: cat.key, postCount: cat._count.posts },
      });
    }
  }

  // 2. Posts with no replies (older than 3 days, published)
  const unrepliedPosts = await prisma.forumPost.findMany({
    where: {
      status: "published",
      commentCount: 0,
      createdAt: { lt: threeDaysAgo },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      createdAt: true,
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  if (unrepliedPosts.length > 0) {
    recommendations.push({
      type: "posts_no_reply",
      title: `${unrepliedPosts.length} 篇帖子无回复`,
      description: `以下帖子已发布超过 3 天但仍无评论：${unrepliedPosts
        .slice(0, 5)
        .map((p) => `「${p.title}」`)
        .join("、")}${unrepliedPosts.length > 5 ? "等" : ""}。建议安排回复或引导讨论。`,
      severity: "warning",
      actionLabel: "查看待回复帖子",
      actionUrl: `/bbs/admin?filter=no-reply`,
      metadata: {
        count: unrepliedPosts.length,
        posts: unrepliedPosts.slice(0, 10).map((p) => ({
          slug: p.slug,
          title: p.title,
          category: p.category?.name,
          createdAt: p.createdAt.toISOString(),
        })),
      },
    });
  }

  // 3. Search queries with no results
  const noResultSearches = await prisma.eventLog.findMany({
    where: {
      eventType: "forum_search",
      createdAt: { gte: since },
      metadata: { path: ["resultCount"], equals: 0 },
    },
    select: { metadata: true },
    take: 200,
    orderBy: { createdAt: "desc" },
  });

  const noResultKeywords = new Map<string, number>();
  for (const event of noResultSearches) {
    if (event.metadata && typeof event.metadata === "object") {
      const meta = event.metadata as Record<string, unknown>;
      const keyword = String(meta.keyword || "").trim();
      if (keyword) {
        noResultKeywords.set(
          keyword,
          (noResultKeywords.get(keyword) || 0) + 1
        );
      }
    }
  }

  const topNoResultKeywords = [...noResultKeywords.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (topNoResultKeywords.length > 0) {
    recommendations.push({
      type: "search_no_results",
      title: `${topNoResultKeywords.length} 个搜索词无结果`,
      description: `用户经常搜索但没有匹配内容的关键词：${topNoResultKeywords
        .map(([kw, count]) => `「${kw}」(${count}次)`)
        .join("、")}。考虑创建相关内容或调整分类。`,
      severity: "opportunity",
      actionLabel: "查看搜索分析",
      actionUrl: `/bbs/admin?tab=search`,
      metadata: {
        keywords: topNoResultKeywords.map(([kw, count]) => ({ keyword: kw, count })),
      },
    });
  }

  // 4. Posts worth updating (high views, old, no recent comments)
  const oldPopularPosts = await prisma.forumPost.findMany({
    where: {
      status: "published",
      viewCount: { gt: 50 },
      lastCommentAt: {
        lt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      viewCount: true,
      commentCount: true,
      createdAt: true,
      category: { select: { name: true } },
    },
    orderBy: { viewCount: "desc" },
    take: 10,
  });

  if (oldPopularPosts.length > 0) {
    recommendations.push({
      type: "posts_worth_updating",
      title: `${oldPopularPosts.length} 篇高浏览帖子值得更新`,
      description: `这些帖子浏览量高但近期无新评论，更新内容可重新激活讨论：${oldPopularPosts
        .slice(0, 3)
        .map((p) => `「${p.title}」(${p.viewCount}次浏览)`)
        .join("、")}。`,
      severity: "opportunity",
      actionLabel: "查看帖子列表",
      metadata: {
        posts: oldPopularPosts.map((p) => ({
          slug: p.slug,
          title: p.title,
          viewCount: p.viewCount,
          commentCount: p.commentCount,
        })),
      },
    });
  }

  // 5. Posts suitable for featuring (high engagement, not featured)
  const featureCandidates = await prisma.forumPost.findMany({
    where: {
      status: "published",
      isFeatured: false,
      isPinned: false,
      commentCount: { gte: 3 },
      viewCount: { gte: 20 },
      createdAt: { gte: since },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      viewCount: true,
      commentCount: true,
      category: { select: { name: true } },
    },
    orderBy: [{ commentCount: "desc" }, { viewCount: "desc" }],
    take: 10,
  });

  if (featureCandidates.length > 0) {
    recommendations.push({
      type: "posts_for_featuring",
      title: `${featureCandidates.length} 篇帖子适合设为精华`,
      description: `这些帖子有较高互动量（评论 ≥3，浏览 ≥20）但尚未加精：${featureCandidates
        .slice(0, 3)
        .map((p) => `「${p.title}」(${p.commentCount}条评论, ${p.viewCount}次浏览)`)
        .join("、")}。`,
      severity: "opportunity",
      actionLabel: "查看候选帖子",
      actionUrl: `/bbs/admin?tab=feature-candidates`,
      metadata: {
        posts: featureCandidates.map((p) => ({
          slug: p.slug,
          title: p.title,
          viewCount: p.viewCount,
          commentCount: p.commentCount,
          category: p.category?.name,
        })),
      },
    });
  }

  // 6. Categories needing cold-start (no posts at all)
  const emptyCategories = categories.filter(
    (c) => c._count.posts === 0
  );

  if (emptyCategories.length > 0) {
    recommendations.push({
      type: "category_cold_start",
      title: `${emptyCategories.length} 个分类需要冷启动`,
      description: `以下分类没有任何已发布帖子：${emptyCategories
        .map((c) => `「${c.name}」`)
        .join("、")}。建议发布种子内容启动讨论。`,
      severity: "warning",
      actionLabel: "发帖",
      actionUrl: `/bbs/new`,
      metadata: {
        categories: emptyCategories.map((c) => ({
          key: c.key,
          name: c.name,
        })),
      },
    });
  }

  return {
    recommendations,
    generatedAt: now.toISOString(),
  };
}
