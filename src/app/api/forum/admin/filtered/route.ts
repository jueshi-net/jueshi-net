// GET /api/forum/admin/filtered - 管理员筛选帖子列表
// Enhanced filtering: category, author, status, date range, keyword, report count

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { searchParams } = new URL(request.url);

    // Parse filters
    const status = searchParams.get("status") || "all";
    const categoryId = searchParams.get("categoryId") || undefined;
    const authorId = searchParams.get("authorId") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const keyword = searchParams.get("keyword") || undefined;
    const minReports = parseInt(searchParams.get("minReports") || "0", 10);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

    // Build where clause
    const where: Record<string, unknown> = {};

    const validStatuses = ["pending", "published", "rejected", "hidden", "all"];
    const filterStatus = validStatuses.includes(status) ? status : "all";
    if (filterStatus !== "all") {
      where.status = filterStatus;
    } else {
      where.status = { not: "draft" };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (authorId) {
      where.userId = authorId;
    }

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        dateFilter.lte = endOfDay;
      }
      where.createdAt = dateFilter;
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { content: { contains: keyword, mode: "insensitive" } },
      ];
    }

    // Fetch posts with report count
    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true } },
          category: { select: { id: true, key: true, name: true } },
          _count: {
            select: {
              reports: true,
              comments: { where: { status: "published" } },
            },
          },
          moderationLogs: {
            where: { action: "reject" },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { reason: true, createdAt: true },
          },
        },
      }),
      prisma.forumPost.count({ where }),
    ]);

    // Filter by minReports if specified (post-query since Prisma doesn't support _count filter directly)
    let filteredPosts = posts;
    if (minReports > 0) {
      filteredPosts = posts.filter((p) => p._count.reports >= minReports);
    }

    const items = filteredPosts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      viewCount: p.viewCount,
      commentCount: p.commentCount,
      isPinned: p.isPinned,
      isLocked: p.isLocked,
      isFeatured: p.isFeatured,
      category: p.category,
      author: {
        id: p.user.id,
        name: p.user.name,
      },
      reportCount: p._count.reports,
      publishedCommentCount: p._count.comments,
      rejectionReason: p.moderationLogs[0]?.reason || null,
      rejectedAt: p.moderationLogs[0]?.createdAt.toISOString() || null,
    }));

    return NextResponse.json({
      posts: items,
      total: minReports > 0 ? filteredPosts.length : total,
      page,
      pageSize,
      filters: {
        status: filterStatus,
        categoryId: categoryId || null,
        authorId: authorId || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        keyword: keyword || null,
        minReports: minReports || null,
      },
    });
  } catch (error) {
    console.error("[Admin Filtered Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
