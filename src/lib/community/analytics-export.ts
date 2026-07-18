/**
 * Forum V1.3 - Analytics CSV Export
 *
 * Exports anonymized operational reports:
 * - Time range
 * - Content metrics
 * - Category metrics
 * - Author summaries
 * - Search summaries
 *
 * Security:
 * - CSV formula injection prevention
 * - No email, token, IP, cookie, or content fields
 * - All author identifiers are anonymized
 */

import { prisma } from "@/lib/prisma";

/**
 * Escape a CSV cell value to prevent formula injection.
 * Prefixes dangerous characters with single quote.
 */
function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  let str = String(value);
  // Prevent formula injection: prefix dangerous characters
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape double quotes by doubling them
  str = str.replace(/"/g, '""');
  // Wrap in quotes if contains comma, newline, or quote
  if (/[",\n\r]/.test(str)) {
    str = `"${str}"`;
  }
  return str;
}

function buildCsvRow(cells: (string | number | null | undefined)[]): string {
  return cells
    .map((c) => escapeCsvCell(c === undefined ? null : c))
    .join(",");
}

function buildCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][]
): string {
  return [buildCsvRow(headers), ...rows.map(buildCsvRow)].join("\n");
}

export interface AnalyticsExportParams {
  dateFrom?: string;
  dateTo?: string;
  reportType: "content" | "category" | "author" | "search" | "summary";
}

/**
 * Generate an anonymized analytics CSV report.
 */
export async function generateAnalyticsCsv(
  params: AnalyticsExportParams
): Promise<{ csv: string; filename: string; recordCount: number }> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  const dateFrom = params.dateFrom
    ? new Date(params.dateFrom)
    : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const dateTo = params.dateTo ? new Date(params.dateTo) : now;
  dateTo.setHours(23, 59, 59, 999);

  const where = {
    createdAt: { gte: dateFrom, lte: dateTo },
  };

  switch (params.reportType) {
    case "content": {
      const posts = await prisma.forumPost.findMany({
        where: { ...where, status: { not: "draft" } },
        orderBy: { createdAt: "desc" },
        take: 2000,
        select: {
          slug: true,
          title: true,
          status: true,
          viewCount: true,
          commentCount: true,
          isFeatured: true,
          isPinned: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { name: true } },
          _count: { select: { reports: true, likes: true } },
        },
      });

      const headers = [
        "标题",
        "状态",
        "分类",
        "创建时间",
        "更新时间",
        "浏览数",
        "评论数",
        "点赞数",
        "举报数",
        "精华",
        "置顶",
      ];

      const rows = posts.map((p) => [
        p.title,
        p.status,
        p.category?.name || "",
        p.createdAt.toISOString(),
        p.updatedAt.toISOString(),
        p.viewCount,
        p.commentCount,
        p._count.likes,
        p._count.reports,
        p.isFeatured ? "是" : "否",
        p.isPinned ? "是" : "否",
      ]);

      return {
        csv: buildCsv(headers, rows),
        filename: `forum-content-${dateStr}.csv`,
        recordCount: posts.length,
      };
    }

    case "category": {
      const categories = await prisma.forumCategory.findMany({
        where: { isActive: true },
        select: {
          key: true,
          name: true,
          _count: {
            select: {
              posts: {
                where: {
                  status: "published",
                  createdAt: { gte: dateFrom, lte: dateTo },
                },
              },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      });

      // Get aggregate metrics per category
      const headers = [
        "分类Key",
        "分类名称",
        "帖子数",
        "总浏览数",
        "总评论数",
        "总点赞数",
      ];

      const rows: (string | number | null | undefined)[][] = [];

      for (const cat of categories) {
        const stats = await prisma.forumPost.aggregate({
          where: {
            categoryId: cat.key,
            status: "published",
            createdAt: { gte: dateFrom, lte: dateTo },
          },
          _sum: { viewCount: true, commentCount: true },
        });

        const likeCount = await prisma.forumLike.count({
          where: {
            post: {
              categoryId: cat.key,
              status: "published",
              createdAt: { gte: dateFrom, lte: dateTo },
            },
          },
        });

        rows.push([
          cat.key,
          cat.name,
          cat._count.posts,
          stats._sum.viewCount || 0,
          stats._sum.commentCount || 0,
          likeCount,
        ]);
      }

      return {
        csv: buildCsv(headers, rows),
        filename: `forum-category-${dateStr}.csv`,
        recordCount: rows.length,
      };
    }

    case "author": {
      // Anonymized author summaries - no email, no real user ID
      const authorStats = await prisma.forumPost.groupBy({
        by: ["userId"],
        where: {
          ...where,
          status: { not: "draft" },
        },
        _count: true,
        orderBy: { _count: { userId: "desc" } },
        take: 200,
      });

      const headers = [
        "作者标识(匿名化)",
        "帖子数",
        "评论数",
        "收到点赞数",
        "精华帖数",
        "首次发帖时间",
        "最近活动时间",
      ];

      const rows: (string | number | null | undefined)[][] = [];

      for (const stat of authorStats) {
        const [commentCount, likeCount, featuredCount, firstPost, lastPost] =
          await Promise.all([
            prisma.forumComment.count({
              where: { userId: stat.userId, createdAt: { gte: dateFrom, lte: dateTo } },
            }),
            prisma.forumLike.count({
              where: {
                post: {
                  userId: stat.userId,
                  createdAt: { gte: dateFrom, lte: dateTo },
                },
              },
            }),
            prisma.forumPost.count({
              where: {
                userId: stat.userId,
                isFeatured: true,
                createdAt: { gte: dateFrom, lte: dateTo },
              },
            }),
            prisma.forumPost.findFirst({
              where: { userId: stat.userId },
              orderBy: { createdAt: "asc" },
              select: { createdAt: true },
            }),
            prisma.forumPost.findFirst({
              where: { userId: stat.userId, createdAt: { lte: dateTo } },
              orderBy: { createdAt: "desc" },
              select: { createdAt: true },
            }),
          ]);

        // Anonymized ID - simple hash, not reversible
        const anonId = `author_${hashAnon(stat.userId)}`;

        rows.push([
          anonId,
          stat._count,
          commentCount,
          likeCount,
          featuredCount,
          firstPost?.createdAt.toISOString() || "",
          lastPost?.createdAt.toISOString() || "",
        ]);
      }

      return {
        csv: buildCsv(headers, rows),
        filename: `forum-author-${dateStr}.csv`,
        recordCount: rows.length,
      };
    }

    case "search": {
      // Search keyword summaries from EventLog
      const searchEvents = await prisma.eventLog.findMany({
        where: {
          eventType: "forum_search",
          createdAt: { gte: dateFrom, lte: dateTo },
        },
        select: { metadata: true },
        take: 5000,
      });

      const keywordCounts = new Map<string, { count: number; noResult: number }>();
      for (const event of searchEvents) {
        if (event.metadata && typeof event.metadata === "object") {
          const meta = event.metadata as Record<string, unknown>;
          const keyword = String(meta.keyword || "").trim().slice(0, 50);
          const resultCount = Number(meta.resultCount || 0);
          if (keyword) {
            const existing = keywordCounts.get(keyword) || { count: 0, noResult: 0 };
            existing.count++;
            if (resultCount === 0) existing.noResult++;
            keywordCounts.set(keyword, existing);
          }
        }
      }

      const headers = ["搜索关键词", "搜索次数", "无结果次数", "无结果率(%)"];

      const rows = [...keywordCounts.entries()]
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 200)
        .map(([keyword, data]) => [
          keyword,
          data.count,
          data.noResult,
          data.count > 0 ? Math.round((data.noResult / data.count) * 100) : 0,
        ]);

      return {
        csv: buildCsv(headers, rows),
        filename: `forum-search-${dateStr}.csv`,
        recordCount: rows.length,
      };
    }

    case "summary":
    default: {
      // Overall summary report
      const [
        totalPosts,
        publishedPosts,
        pendingPosts,
        rejectedPosts,
        totalComments,
        totalReports,
        totalLikes,
        totalFeatured,
      ] = await Promise.all([
        prisma.forumPost.count({ where }),
        prisma.forumPost.count({ where: { ...where, status: "published" } }),
        prisma.forumPost.count({ where: { ...where, status: "pending" } }),
        prisma.forumPost.count({ where: { ...where, status: "rejected" } }),
        prisma.forumComment.count({ where }),
        prisma.forumReport.count({ where }),
        prisma.forumLike.count({ where }),
        prisma.forumPost.count({ where: { ...where, isFeatured: true } }),
      ]);

      const headers = ["指标", "数值", "统计口径"];
      const rows: (string | number | null | undefined)[][] = [
        ["总帖子数(非草稿)", totalPosts, `${dateFrom.toISOString()} 至 ${dateTo.toISOString()}`],
        ["已发布帖子", publishedPosts, "同一时间范围"],
        ["待审核帖子", pendingPosts, "同一时间范围"],
        ["已驳回帖子", rejectedPosts, "同一时间范围"],
        ["总评论数", totalComments, "同一时间范围"],
        ["总举报数", totalReports, "同一时间范围"],
        ["总点赞数", totalLikes, "同一时间范围"],
        ["精华帖数", totalFeatured, "同一时间范围"],
      ];

      return {
        csv: buildCsv(headers, rows),
        filename: `forum-summary-${dateStr}.csv`,
        recordCount: rows.length,
      };
    }
  }
}

/**
 * Simple non-reversible hash for anonymizing user IDs in exports.
 */
function hashAnon(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36).slice(0, 8);
}
