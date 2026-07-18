/**
 * Forum V1.3 - Content Growth Trends
 *
 * Computes daily content trends and popular items:
 * - Daily post trend
 * - Daily comment trend
 * - Search count trend (from EventLog)
 * - Popular search keywords
 * - Popular categories
 * - Popular tags
 * - Feed request volume (from EventLog)
 * - Share click volume (from EventLog)
 *
 * EventLog reuse: Uses existing EventLog model with forum_* event types.
 * No new database models are created.
 * No sensitive data is recorded in event metadata.
 */

import { prisma } from "@/lib/prisma";

export interface DailyTrendPoint {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface TrendResult {
  postTrend: DailyTrendPoint[];
  commentTrend: DailyTrendPoint[];
  searchTrend: DailyTrendPoint[];
  feedViewTrend: DailyTrendPoint[];
  shareClickTrend: DailyTrendPoint[];
  topKeywords: { keyword: string; count: number }[];
  topCategories: { key: string; name: string; postCount: number }[];
  topTags: { tag: string; count: number }[];
  generatedAt: string;
  periodLabel: string;
}

/**
 * Compute content growth trends.
 * @param daysBack - Lookback period (default 30)
 */
export async function computeContentTrends(daysBack = 30): Promise<TrendResult> {
  const now = new Date();
  const since = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const periodLabel = `近 ${daysBack} 天`;

  // Generate date range for daily trends
  const dates: string[] = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dates.push(d.toISOString().slice(0, 10));
  }

  // Daily post trend
  const postsByDay = await prisma.$queryRaw<
    Array<{ date: string; count: bigint }>
  >`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM forum_posts
    WHERE created_at >= ${since} AND status != 'draft'
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  const postTrend: DailyTrendPoint[] = dates.map((date) => {
    const found = postsByDay.find((p) => p.date === date);
    return { date, count: found ? Number(found.count) : 0 };
  });

  // Daily comment trend
  const commentsByDay = await prisma.$queryRaw<
    Array<{ date: string; count: bigint }>
  >`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM forum_comments
    WHERE created_at >= ${since}
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  const commentTrend: DailyTrendPoint[] = dates.map((date) => {
    const found = commentsByDay.find((c) => c.date === date);
    return { date, count: found ? Number(found.count) : 0 };
  });

  // Search trend from EventLog
  const searchEventsByDay = await prisma.$queryRaw<
    Array<{ date: string; count: bigint }>
  >`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM event_logs
    WHERE event_type = 'forum_search' AND created_at >= ${since}
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  const searchTrend: DailyTrendPoint[] = dates.map((date) => {
    const found = searchEventsByDay.find((s) => s.date === date);
    return { date, count: found ? Number(found.count) : 0 };
  });

  // Feed view trend from EventLog
  const feedEventsByDay = await prisma.$queryRaw<
    Array<{ date: string; count: bigint }>
  >`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM event_logs
    WHERE event_type = 'forum_feed_view' AND created_at >= ${since}
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  const feedViewTrend: DailyTrendPoint[] = dates.map((date) => {
    const found = feedEventsByDay.find((f) => f.date === date);
    return { date, count: found ? Number(found.count) : 0 };
  });

  // Share click trend from EventLog
  const shareEventsByDay = await prisma.$queryRaw<
    Array<{ date: string; count: bigint }>
  >`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM event_logs
    WHERE event_type = 'forum_share' AND created_at >= ${since}
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  const shareClickTrend: DailyTrendPoint[] = dates.map((date) => {
    const found = shareEventsByDay.find((s) => s.date === date);
    return { date, count: found ? Number(found.count) : 0 };
  });

  // Top search keywords from EventLog metadata
  const searchKeywordEvents = await prisma.eventLog.findMany({
    where: {
      eventType: "forum_search",
      createdAt: { gte: since },
    },
    select: { metadata: true },
    take: 1000,
  });

  const keywordCounts = new Map<string, number>();
  for (const event of searchKeywordEvents) {
    if (event.metadata && typeof event.metadata === "object") {
      const meta = event.metadata as Record<string, unknown>;
      const keyword = String(meta.keyword || meta.q || "").trim();
      if (keyword) {
        const sanitized = sanitizeKeyword(keyword);
        if (sanitized) {
          keywordCounts.set(
            sanitized,
            (keywordCounts.get(sanitized) || 0) + 1
          );
        }
      }
    }
  }

  const topKeywords = [...keywordCounts.entries()]
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Top categories by post count
  const categories = await prisma.forumCategory.findMany({
    where: { isActive: true },
    select: {
      key: true,
      name: true,
      _count: {
        select: {
          posts: {
            where: { status: "published", createdAt: { gte: since } },
          },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const topCategories = categories
    .map((c) => ({
      key: c.key,
      name: c.name,
      postCount: c._count.posts,
    }))
    .sort((a, b) => b.postCount - a.postCount);

  // Top tags from published posts
  const taggedPosts = await prisma.forumPost.findMany({
    where: {
      status: "published",
      createdAt: { gte: since },
      NOT: { tags: { equals: [] as any } },
    },
    select: { tags: true },
    take: 500,
  });

  const tagCounts = new Map<string, number>();
  for (const post of taggedPosts) {
    if (post.tags && Array.isArray(post.tags)) {
      for (const tag of post.tags) {
        if (typeof tag === "string") {
          const sanitized = tag.trim().slice(0, 30);
          if (sanitized) {
            tagCounts.set(sanitized, (tagCounts.get(sanitized) || 0) + 1);
          }
        }
      }
    }
  }

  const topTags = [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    postTrend,
    commentTrend,
    searchTrend,
    feedViewTrend,
    shareClickTrend,
    topKeywords,
    topCategories,
    topTags,
    generatedAt: now.toISOString(),
    periodLabel,
  };
}

/**
 * Sanitize a search keyword for storage and display.
 * - Limit length to 50 characters
 * - Remove control characters
 * - Do not record full search text that might contain PII
 */
export function sanitizeKeyword(keyword: string): string {
  if (!keyword) return "";
  // Remove control characters
  let cleaned = keyword.replace(/[\x00-\x1F\x7F]/g, "").trim();
  // Limit length
  cleaned = cleaned.slice(0, 50);
  // Return empty if only whitespace or very short
  if (cleaned.length < 1) return "";
  return cleaned;
}
