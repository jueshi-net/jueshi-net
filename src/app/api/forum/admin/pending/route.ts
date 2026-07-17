// GET /api/forum/admin/pending - 管理员待审核帖子列表
// POST /api/forum/admin/pending - 批量审核（通过/驳回）

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

    // Allow filtering by pending, rejected, hidden, all
    const validStatuses = ["pending", "rejected", "hidden", "all"];
    const filterStatus = validStatuses.includes(status) ? status : "pending";

    const where = filterStatus === "all"
      ? { status: { in: ["pending", "rejected", "hidden"] } }
      : { status: filterStatus };

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, key: true, name: true } },
          moderationLogs: {
            where: { action: "reject" },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { reason: true, createdAt: true, adminId: true },
          },
        },
      }),
      prisma.forumPost.count({ where }),
    ]);

    // Get admin names for rejection logs
    const adminIds = Array.from(
      new Set(
        posts
          .flatMap((p) => p.moderationLogs.map((m) => m.adminId))
          .filter(Boolean)
      )
    );
    const admins = adminIds.length
      ? await prisma.user.findMany({
          where: { id: { in: adminIds } },
          select: { id: true, name: true },
        })
      : [];
    const adminMap = new Map(admins.map((a) => [a.id, a]));

    const items = posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      content: p.content,
      excerpt: p.excerpt,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      category: p.category,
      author: {
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
      },
      rejectionReason: p.moderationLogs[0]?.reason || null,
      rejectedAt: p.moderationLogs[0]?.createdAt || null,
      rejectedBy: p.moderationLogs[0]
        ? adminMap.get(p.moderationLogs[0].adminId)?.name || "管理员"
        : null,
    }));

    return NextResponse.json({ posts: items, total, page, pageSize });
  } catch (error) {
    console.error("[Admin Pending GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// POST /api/forum/admin/pending - 批量审核
// body: { action: "approve" | "reject", postIds: string[], reason?: string }
export async function POST(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;
    const { session } = adminResult;
    const adminId = session.user.id;

    const body = await request.json();
    const { action, postIds, reason } = body as {
      action: "approve" | "reject";
      postIds: string[];
      reason?: string;
    };

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "无效的操作" }, { status: 400 });
    }

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json({ error: "请选择至少一个帖子" }, { status: 400 });
    }

    if (action === "reject" && (!reason || reason.trim().length < 2)) {
      return NextResponse.json({ error: "驳回原因至少 2 个字符" }, { status: 400 });
    }

    // Fetch posts to verify they exist and are in a modifiable state
    const posts = await prisma.forumPost.findMany({
      where: {
        id: { in: postIds },
        status: { in: ["pending", "rejected", "hidden"] },
      },
      select: { id: true, slug: true, title: true, userId: true, status: true },
    });

    // Track which IDs were not found or not in modifiable state
    const foundIds = new Set(posts.map((p) => p.id));
    const skipped: { id: string; error: string }[] = [];
    for (const id of postIds) {
      if (!foundIds.has(id)) {
        skipped.push({ id, error: "帖子不存在或状态不允许审核" });
      }
    }

    if (posts.length === 0) {
      return NextResponse.json({
        success: false,
        error: "没有可审核的帖子",
        results: skipped,
        processed: 0,
        failed: skipped.length,
      }, { status: 404 });
    }

    const newStatus = action === "approve" ? "published" : "rejected";
    const modAction = action === "approve" ? "approve" : "reject";
    const trimmedReason = reason?.trim() || null;

    // Process each post individually to track per-item results
    const results: { id: string; success: boolean; error?: string; title?: string }[] = [];
    let successCount = 0;

    for (const post of posts) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.forumPost.update({
            where: { id: post.id },
            data: { status: newStatus },
          });

          await tx.moderationLog.create({
            data: {
              adminId,
              action: modAction,
              postId: post.id,
              reason: trimmedReason,
            },
          });

          await tx.forumNotification.create({
            data: {
              userId: post.userId,
              type: action === "approve" ? "post_approved" : "post_rejected",
              postId: post.id,
              actorId: adminId,
              message:
                action === "approve"
                  ? `您的帖子「${post.title}」已审核通过`
                  : `您的帖子「${post.title}」已被驳回${trimmedReason ? `：${trimmedReason}` : ""}`,
            },
          });
        });
        results.push({ id: post.id, success: true, title: post.title });
        successCount++;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "未知错误";
        results.push({ id: post.id, success: false, error: errMsg, title: post.title });
      }
    }

    // Add skipped items to results
    for (const s of skipped) {
      results.push({ id: s.id, success: false, error: s.error });
    }

    const failedCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: failedCount === 0,
      processed: successCount,
      failed: failedCount,
      results,
      action,
    });
  } catch (error) {
    console.error("[Admin Batch Moderate Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
