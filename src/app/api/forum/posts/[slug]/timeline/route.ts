// GET /api/forum/posts/[slug]/timeline - 内容状态事件时间线
// Returns read-only status event timeline from existing ModerationLog (no version table)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await prisma.forumPost.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        isPinned: true,
        isLocked: true,
        isFeatured: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // Check visibility - hidden/deleted posts only visible to author and admin
    const session = await auth();
    const userId = session?.user?.id;
    const isAdmin = session?.user?.role === "admin";

    if (
      (post.status === "hidden" || post.status === "deleted") &&
      post.userId !== userId &&
      !isAdmin
    ) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // Fetch all moderation logs for this post (sorted ascending = chronological)
    const logs = await prisma.moderationLog.findMany({
      where: { postId: post.id },
      orderBy: { createdAt: "asc" },
      include: {
        admin: { select: { name: true } },
      },
    });

    // Build timeline events from available data
    // NOTE: We cannot reconstruct full content versions - only status events
    const events: Array<{
      type: string;
      label: string;
      timestamp: string;
      actor?: string;
      reason?: string | null;
      description: string;
    }> = [];

    // Event 1: Post created
    events.push({
      type: "created",
      label: "创建帖子",
      timestamp: post.createdAt.toISOString(),
      description: post.status === "draft" ? "保存为草稿" : "提交审核",
    });

    // Events from moderation logs
    const actionLabels: Record<string, string> = {
      approve: "审核通过",
      reject: "驳回",
      hide: "隐藏",
      restore: "恢复显示",
      pin: "置顶",
      unpin: "取消置顶",
      feature: "设为精华",
      unfeature: "取消精华",
      lock: "锁定",
      unlock: "解锁",
      investigate_report: "受理举报",
      resolve_report: "处理举报",
      dismiss_report: "驳回举报",
    };

    for (const log of logs) {
      events.push({
        type: log.action,
        label: actionLabels[log.action] || log.action,
        timestamp: log.createdAt.toISOString(),
        actor: log.admin?.name || "管理员",
        reason: log.reason,
        description: log.reason
          ? `${actionLabels[log.action] || log.action}：${log.reason}`
          : actionLabels[log.action] || log.action,
      });
    }

    // Event: Last update (if different from creation and no explicit log)
    if (post.updatedAt > post.createdAt) {
      const hasExplicitUpdate = logs.some(
        (l) => Math.abs(l.createdAt.getTime() - post.updatedAt.getTime()) < 60000
      );
      if (!hasExplicitUpdate) {
        events.push({
          type: "edited",
          label: "编辑内容",
          timestamp: post.updatedAt.toISOString(),
          description: "内容已更新",
        });
      }
    }

    // Sort by timestamp ascending
    events.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Add current status
    const currentStatus: Record<string, string> = {
      draft: "草稿",
      pending: "待审核",
      published: "已发布",
      rejected: "已驳回",
      hidden: "已隐藏",
      deleted: "已删除",
    };

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        status: post.status,
        statusLabel: currentStatus[post.status] || post.status,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      },
      events,
      // Explicit limitation notice
      limitation:
        "此时间线仅展示状态变更事件，不包含完整的内容版本历史。内容正文的历史版本不可恢复。",
      canViewFullHistory: isAdmin || post.userId === userId,
    });
  } catch (error) {
    console.error("[Post Timeline Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
