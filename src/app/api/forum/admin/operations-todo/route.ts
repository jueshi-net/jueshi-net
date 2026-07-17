// GET /api/forum/admin/operations-todo - 管理员运营待办清单
// Returns actionable items for admins

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      pendingPosts,
      pendingReports,
      oldPendingPosts,
      emptyCategories,
      recentlyRejected,
    ] = await Promise.all([
      // Posts awaiting review
      prisma.forumPost.count({ where: { status: "pending" } }),

      // Reports awaiting processing
      prisma.forumReport.count({ where: { status: "pending" } }),

      // Posts pending for > 24 hours (needs attention)
      prisma.forumPost.count({
        where: {
          status: "pending",
          createdAt: { lt: twentyFourHoursAgo },
        },
      }),

      // Categories with zero published posts (cold start)
      prisma.forumCategory.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          key: true,
          _count: { select: { posts: { where: { status: "published" } } } },
        },
      }),

      // Recently rejected posts (may need follow-up)
      prisma.forumPost.count({
        where: {
          status: "rejected",
          updatedAt: { gte: twentyFourHoursAgo },
        },
      }),
    ]);

    const emptyCategoryList = emptyCategories
      .filter((c) => c._count.posts === 0)
      .map((c) => ({ id: c.id, name: c.name, key: c.key }));

    const todos: Array<{
      priority: "high" | "medium" | "low";
      category: string;
      label: string;
      count: number;
      link: string;
      description: string;
    }> = [];

    // High priority: old pending posts
    if (oldPendingPosts > 0) {
      todos.push({
        priority: "high",
        category: "审核",
        label: `${oldPendingPosts} 篇帖子待审核超 24 小时`,
        count: oldPendingPosts,
        link: "/bbs/admin?status=pending",
        description: "这些帖子等待时间较长，建议优先处理",
      });
    }

    // High priority: pending reports
    if (pendingReports > 0) {
      todos.push({
        priority: "high",
        category: "举报",
        label: `${pendingReports} 个举报待处理`,
        count: pendingReports,
        link: "/bbs/admin/reports",
        description: "及时处理举报有助于维护社区秩序",
      });
    }

    // Medium priority: all pending posts
    if (pendingPosts > 0 && oldPendingPosts < pendingPosts) {
      todos.push({
        priority: "medium",
        category: "审核",
        label: `共 ${pendingPosts} 篇帖子待审核`,
        count: pendingPosts,
        link: "/bbs/admin?status=pending",
        description: "新提交的帖子等待审核",
      });
    }

    // Medium priority: recently rejected
    if (recentlyRejected > 0) {
      todos.push({
        priority: "medium",
        category: "审核",
        label: `${recentlyRejected} 篇帖子在过去 24h 被驳回`,
        count: recentlyRejected,
        link: "/bbs/admin?status=rejected",
        description: "关注被驳回帖子，必要时与作者沟通",
      });
    }

    // Low priority: empty categories
    if (emptyCategoryList.length > 0) {
      todos.push({
        priority: "low",
        category: "运营",
        label: `${emptyCategoryList.length} 个分类暂无内容`,
        count: emptyCategoryList.length,
        link: "/bbs/operations",
        description: `空分类：${emptyCategoryList.map((c) => c.name).join("、")}。建议填充种子内容促进冷启动。`,
      });
    }

    return NextResponse.json({
      todos,
      summary: {
        total: todos.length,
        high: todos.filter((t) => t.priority === "high").length,
        medium: todos.filter((t) => t.priority === "medium").length,
        low: todos.filter((t) => t.priority === "low").length,
      },
    });
  } catch (error) {
    console.error("[Operations Todo Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
