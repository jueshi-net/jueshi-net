// GET /api/forum/search - Enhanced search with relevance scoring
// Features: title weighting, phrase matching, tag/category boost, highlighting, safety

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sanitizeSearchQuery,
  validateSearchQuery,
  calculateSearchRelevance,
  generateEmptySearchSuggestions,
} from "@/lib/community/search";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get("q") || "";
    const category = searchParams.get("category") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const sort = searchParams.get("sort") || "relevance"; // relevance | latest | hot
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(30, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

    // Sanitize and validate query
    const q = sanitizeSearchQuery(rawQuery);
    const validation = validateSearchQuery(q);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { status: "published" };
    if (category) where.category = { key: category };
    if (tag) where.tags = { has: tag };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    // For relevance sorting, fetch more results then re-rank
    const fetchLimit = sort === "relevance" ? Math.min(pageSize * 3, 100) : pageSize;

    // Determine sort order
    let orderBy: Record<string, string>[];
    switch (sort) {
      case "latest":
        orderBy = [{ isPinned: "desc" }, { createdAt: "desc" }];
        break;
      case "hot":
        orderBy = [{ isPinned: "desc" }, { viewCount: "desc" }];
        break;
      case "relevance":
      default:
        // Fetch by latest first, then re-rank in memory
        orderBy = [{ isPinned: "desc" }, { createdAt: "desc" }];
        break;
    }

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        orderBy,
        skip: sort === "relevance" ? 0 : (page - 1) * pageSize,
        take: fetchLimit,
        select: {
          id: true,
          slug: true,
          title: true,
          content: true,
          excerpt: true,
          tags: true,
          viewCount: true,
          commentCount: true,
          isFeatured: true,
          isSolved: true,
          isPinned: true,
          createdAt: true,
          category: { select: { key: true, name: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.forumPost.count({ where }),
    ]);

    // If relevance sorting, re-rank by score
    let rankedPosts = posts;
    if (sort === "relevance" && q) {
      const scored = posts.map((p) => {
        const relevance = calculateSearchRelevance({
          query: q,
          title: p.title,
          content: p.content,
          tags: p.tags as string[] | null,
          categoryName: p.category.name,
          isFeatured: p.isFeatured,
          isSolved: p.isSolved,
          createdAt: p.createdAt,
        });
        return { ...p, _relevance: relevance };
      });
      scored.sort((a, b) => b._relevance.score - a._relevance.score);
      rankedPosts = scored.slice((page - 1) * pageSize, page * pageSize);
    } else if (sort === "relevance") {
      rankedPosts = posts.slice((page - 1) * pageSize, page * pageSize);
    }

    // Format results
    const results = rankedPosts.map((p) => {
      const relevance = sort === "relevance" && q
        ? calculateSearchRelevance({
            query: q,
            title: p.title,
            content: p.content,
            tags: p.tags as string[] | null,
            categoryName: p.category.name,
            isFeatured: p.isFeatured,
            isSolved: p.isSolved,
            createdAt: p.createdAt,
          })
        : null;

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        viewCount: p.viewCount,
        commentCount: p.commentCount,
        isFeatured: p.isFeatured,
        isPinned: p.isPinned,
        createdAt: p.createdAt,
        tags: p.tags,
        category: p.category,
        author: {
          name: p.user?.name || "匿名用户",
        },
        relevance: relevance
          ? {
              score: relevance.score,
              breakdown: relevance.breakdown,
              titleMatch: relevance.titleMatch,
              contentMatch: relevance.contentMatch,
              tagMatch: relevance.tagMatch,
              categoryMatch: relevance.categoryMatch,
            }
          : null,
      };
    });

    // Generate suggestions for empty results
    let suggestions: ReturnType<typeof generateEmptySearchSuggestions> = [];
    if (results.length === 0 && q) {
      // Fetch popular tags and categories for suggestions
      const [recentTagged, cats] = await Promise.all([
        prisma.forumPost.findMany({
          where: { status: "published" },
          select: { tags: true },
          take: 50,
        }),
        prisma.forumCategory.findMany({
          where: { isActive: true },
          take: 5,
          select: { key: true, name: true },
        }),
      ]);

      const tagCount = new Map<string, number>();
      for (const p of recentTagged) {
        const tags = p.tags as string[] | null;
        if (tags) {
          for (const t of tags) {
            tagCount.set(t, (tagCount.get(t) || 0) + 1);
          }
        }
      }
      const popularTags = Array.from(tagCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([t]) => t);

      suggestions = generateEmptySearchSuggestions(q, popularTags, cats);
    }

    return NextResponse.json({
      results,
      total,
      page,
      pageSize,
      query: q,
      sort,
      suggestions: results.length === 0 ? suggestions : undefined,
    });
  } catch (error) {
    console.error("[Forum Search API Error]", error);
    return NextResponse.json(
      { error: "搜索失败，请稍后重试", code: "DATABASE_ERROR" },
      { status: 500 }
    );
  }
}
