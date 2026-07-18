// GET /api/forum/admin/export - 管理员只读 CSV 导出
// Exports filtered moderation queue results as CSV
// Security: CSV formula injection prevention, no sensitive fields, audit log

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

/**
 * Escape a CSV cell value to prevent formula injection.
 * If a value starts with =, +, -, @, tab, or carriage return,
 * prefix it with a single quote to neutralize spreadsheet formulas.
 */
function escapeCsvCell(value: string | null | undefined): string {
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
  return cells.map((c) => escapeCsvCell(c === undefined ? null : c === null ? null : String(c))).join(",");
}

export async function GET(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;
    const { session } = adminResult;
    const adminId = session.user.id;

    const { searchParams } = new URL(request.url);

    // Parse filter parameters
    const status = searchParams.get("status") || "all";
    const categoryId = searchParams.get("categoryId") || undefined;
    const authorId = searchParams.get("authorId") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const keyword = searchParams.get("keyword") || undefined;

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

    // Fetch posts with relationships (max 1000 to prevent abuse)
    const posts = await prisma.forumPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 1000,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        viewCount: true,
        commentCount: true,
        isPinned: true,
        isLocked: true,
        isFeatured: true,
        category: { select: { name: true } },
        user: { select: { name: true } },
        _count: {
          select: { reports: true },
        },
        moderationLogs: {
          where: { action: "reject" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { reason: true, createdAt: true },
        },
      },
    });

    // Build CSV - NO sensitive fields (no email, no password, no token)
    const headers = [
      "帖子ID",
      "标题",
      "状态",
      "分类",
      "作者",
      "创建时间",
      "更新时间",
      "浏览数",
      "评论数",
      "举报数",
      "置顶",
      "锁定",
      "精华",
      "最近驳回原因",
      "驳回时间",
    ];

    const rows = posts.map((p) =>
      buildCsvRow([
        p.id,
        p.title,
        p.status,
        p.category?.name || "",
        p.user?.name || "匿名",
        p.createdAt.toISOString(),
        p.updatedAt.toISOString(),
        p.viewCount,
        p.commentCount,
        p._count.reports,
        p.isPinned ? "是" : "否",
        p.isLocked ? "是" : "否",
        p.isFeatured ? "是" : "否",
        p.moderationLogs[0]?.reason || "",
        p.moderationLogs[0]?.createdAt.toISOString() || "",
      ])
    );

    const csv = [buildCsvRow(headers), ...rows].join("\n");

    // Write audit log
    await prisma.moderationLog.create({
      data: {
        adminId,
        action: "export_csv",
        reason: `导出 ${posts.length} 条帖子记录 (status=${filterStatus}, keyword=${keyword || "none"})`,
      },
    });

    // Return as CSV with proper headers
    const dateStr = new Date().toISOString().slice(0, 10);
    return new NextResponse("\uFEFF" + csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="forum-export-${dateStr}.csv"`,
      },
    });
  } catch (error) {
    console.error("[Admin Export Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
