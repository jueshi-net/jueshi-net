// GET /api/forum/admin/health - 社区健康度指标（只读）
// All metrics are approximated from existing data, with explicit statistical notes.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Approval rate and rejection rate (last 30 days)
    // Based on moderation logs: approve vs reject actions
    const [approveLogs, rejectLogs] = await Promise.all([
      prisma.moderationLog.count({
        where: { action: "approve", createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.moderationLog.count({
        where: { action: "reject", createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    const totalModActions = approveLogs + rejectLogs;
    const approvalRate = totalModActions > 0 ? Math.round((approveLogs / totalModActions) * 100) : 100;
    const rejectionRate = totalModActions > 0 ? Math.round((rejectLogs / totalModActions) * 100) : 0;

    // 2. Report processing rate (last 30 days)
    const [totalReports, resolvedReports] = await Promise.all([
      prisma.forumReport.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.forumReport.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { in: ["resolved", "dismissed"] },
        },
      }),
    ]);
    const reportProcessingRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 100;

    // 3. Average review wait time (pending posts created in last 7 days)
    // Approximated: time from post creation to first approve/reject log
    const recentApprovedLogs = await prisma.moderationLog.findMany({
      where: {
        action: { in: ["approve", "reject"] },
        createdAt: { gte: sevenDaysAgo },
        post: { status: { in: ["published", "rejected"] } },
      },
      include: {
        post: { select: { createdAt: true } },
      },
      take: 100,
      orderBy: { createdAt: "desc" },
    });

    let avgReviewMs = 0;
    if (recentApprovedLogs.length > 0) {
      const waitTimes = recentApprovedLogs
        .filter((log) => log.post)
        .map((log) => log.createdAt.getTime() - log.post.createdAt.getTime())
        .filter((ms) => ms > 0 && ms < 7 * 24 * 60 * 60 * 1000); // Filter outliers
      if (waitTimes.length > 0) {
        avgReviewMs = Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length);
      }
    }

    // Convert ms to hours for display
    const avgReviewHours = avgReviewMs > 0 ? Math.round(avgReviewMs / (60 * 60 * 1000)) : 0;

    // 4. Today's active authors (users who posted or commented today)
    const [todayActivePosters, todayActiveCommenters] = await Promise.all([
      prisma.forumPost.findMany({
        where: { createdAt: { gte: twentyFourHoursAgo }, status: { not: "draft" } },
        select: { userId: true },
        distinct: ["userId"],
      }),
      prisma.forumComment.findMany({
        where: { createdAt: { gte: twentyFourHoursAgo } },
        select: { userId: true },
        distinct: ["userId"],
      }),
    ]);
    const activeAuthorIds = new Set([
      ...todayActivePosters.map((p) => p.userId),
      ...todayActiveCommenters.map((c) => c.userId),
    ]);
    const todayActiveAuthors = activeAuthorIds.size;

    // 5. Unreplied posts (published, commentCount = 0, older than 3 days)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const unrepliedPosts = await prisma.forumPost.count({
      where: {
        status: "published",
        commentCount: 0,
        createdAt: { lt: threeDaysAgo },
      },
    });

    // 6. Long-pending reports (> 7 days old, still pending)
    const longPendingReports = await prisma.forumReport.count({
      where: {
        status: "pending",
        createdAt: { lt: sevenDaysAgo },
      },
    });

    // 7. Draft-to-submit ratio (last 30 days)
    const [totalDrafts, totalSubmitted] = await Promise.all([
      prisma.forumPost.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: "draft",
        },
      }),
      prisma.forumPost.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { not: "draft" },
        },
      }),
    ]);
    const draftSubmitRatio =
      totalDrafts + totalSubmitted > 0
        ? Math.round((totalSubmitted / (totalDrafts + totalSubmitted)) * 100)
        : 0;

    return NextResponse.json({
      metrics: [
        {
          key: "approvalRate",
          label: "审核通过率",
          value: approvalRate,
          unit: "%",
          note: `近 30 天，基于审核操作日志计算（通过 ${approveLogs} / 驳回 ${rejectLogs}）`,
          period: "30d",
        },
        {
          key: "rejectionRate",
          label: "驳回率",
          value: rejectionRate,
          unit: "%",
          note: `近 30 天，基于审核操作日志计算`,
          period: "30d",
        },
        {
          key: "reportProcessingRate",
          label: "举报处理率",
          value: reportProcessingRate,
          unit: "%",
          note: `近 30 天，已处理 ${resolvedReports} / 共 ${totalReports} 个举报`,
          period: "30d",
        },
        {
          key: "avgReviewTime",
          label: "平均审核等待时间",
          value: avgReviewHours,
          unit: "小时",
          note: `近 7 天，基于帖子创建到审核操作的时间差近似计算`,
          period: "7d",
        },
        {
          key: "todayActiveAuthors",
          label: "今日活跃作者",
          value: todayActiveAuthors,
          unit: "人",
          note: "过去 24 小时内发帖或评论的唯一用户数",
          period: "24h",
        },
        {
          key: "unrepliedPosts",
          label: "无回复帖子",
          value: unrepliedPosts,
          unit: "篇",
          note: "已发布超过 3 天且评论数为 0 的帖子",
          period: "cumulative",
        },
        {
          key: "longPendingReports",
          label: "长期未处理举报",
          value: longPendingReports,
          unit: "个",
          note: "超过 7 天仍待处理的举报",
          period: "cumulative",
        },
        {
          key: "draftSubmitRatio",
          label: "草稿转提交比例",
          value: draftSubmitRatio,
          unit: "%",
          note: `近 30 天，提交 ${totalSubmitted} / 草稿+提交 ${totalDrafts + totalSubmitted}`,
          period: "30d",
        },
      ],
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("[Community Health Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
