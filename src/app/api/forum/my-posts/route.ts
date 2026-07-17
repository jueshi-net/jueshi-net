// GET /api/forum/my-posts - 当前用户的帖子列表（按状态筛选）
// DELETE /api/forum/my-posts - 删除自己的草稿或待审核帖子

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10))
    );

    // Valid status filters: all, published, pending, rejected, hidden, deleted
    const validStatuses = [
      "all",
      "published",
      "pending",
      "rejected",
      "hidden",
      "deleted",
    ];
    const filterStatus = validStatuses.includes(status) ? status : "all";

    const where =
      filterStatus === "all"
        ? { userId }
        : { userId, status: filterStatus };

    const [posts, total, counts] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: { select: { id: true, key: true, name: true } },
          _count: {
            select: {
              comments: { where: { status: "published" } },
              likes: true,
              bookmarks: true,
            },
          },
        },
      }),
      prisma.forumPost.count({ where }),
      // Get counts for each status tab
      prisma.forumPost.groupBy({
        by: ["status"],
        where: { userId },
        _count: { id: true },
      }),
    ]);

    // Build status count map
    const statusCounts: Record<string, number> = {
      published: 0,
      pending: 0,
      rejected: 0,
      hidden: 0,
      deleted: 0,
    };
    for (const c of counts) {
      statusCounts[c.status] = c._count.id;
    }
    statusCounts.all = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    // Fetch latest rejection reason for rejected posts
    const rejectedPostIds = posts
      .filter((p) => p.status === "rejected")
      .map((p) => p.id);

    const rejectionReasons: Record<string, { reason: string; createdAt: Date }> = {};
    if (rejectedPostIds.length > 0) {
      const logs = await prisma.moderationLog.findMany({
        where: {
          postId: { in: rejectedPostIds },
          action: "reject",
        },
        orderBy: { createdAt: "desc" },
        distinct: ["postId"],
      });
      for (const log of logs) {
        if (log.postId && log.reason) {
          rejectionReasons[log.postId] = {
            reason: log.reason,
            createdAt: log.createdAt,
          };
        }
      }
    }

    const items = posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content.slice(0, 300),
      status: p.status,
      isPinned: p.isPinned,
      isLocked: p.isLocked,
      isFeatured: p.isFeatured,
      isSolved: p.isSolved,
      viewCount: p.viewCount,
      commentCount: p.commentCount,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      category: p.category,
      _count: {
        comments: p._count.comments,
        likes: p._count.likes,
        bookmarks: p._count.bookmarks,
      },
      rejectionReason: rejectionReasons[p.id]?.reason || null,
      rejectedAt: rejectionReasons[p.id]?.createdAt || null,
    }));

    return NextResponse.json({
      posts: items,
      total,
      page,
      pageSize,
      statusCounts,
    });
  } catch (error) {
    console.error("[My Posts GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// DELETE /api/forum/my-posts - 删除自己的草稿或待审核帖子
// body: { postId: string }
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;
    const userId = session.user.id;

    const body = await request.json().catch(() => ({}));
    const { postId } = body as { postId: string };

    if (!postId || typeof postId !== "string") {
      return NextResponse.json({ error: "缺少 postId" }, { status: 400 });
    }

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { id: true, userId: true, status: true, title: true },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // Only the author can delete
    if (post.userId !== userId) {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    // Can only delete pending or rejected posts (soft delete)
    if (!["pending", "rejected"].includes(post.status)) {
      return NextResponse.json(
        { error: "只能删除待审核或被驳回的帖子" },
        { status: 400 }
      );
    }

    // Soft delete: set status to "deleted"
    await prisma.forumPost.update({
      where: { id: postId },
      data: { status: "deleted" },
    });

    // Decrement community stat
    try {
      const { incrementCommunityStat } = await import("@/lib/honor-helpers");
      await incrementCommunityStat(userId, "postCount", -1);
    } catch (e) {
      console.error("[CommunityStat decrement error]", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[My Posts DELETE Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
