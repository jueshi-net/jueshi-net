/**
 * Forum V1.3 - Content Funnel Analytics
 *
 * Computes content pipeline metrics from existing data:
 * - Draft creation count
 * - Draft-to-submit rate
 * - Pending approval rate
 * - Pending rejection rate
 * - Posts receiving first comment ratio
 * - 24h engagement rate
 * - No-reply rate
 * - Report rate
 * - Featured conversion rate
 *
 * All metrics include explicit statistical notes and time ranges.
 * No sensitive data is collected or inferred.
 */

import { prisma } from "@/lib/prisma";

export interface FunnelMetric {
  key: string;
  label: string;
  value: number;
  unit: string;
  note: string;
  period: string;
}

/**
 * Compute content funnel metrics for a given time range.
 * @param daysBack - How many days to look back (default 30)
 */
export async function computeContentFunnel(daysBack = 30): Promise<{
  metrics: FunnelMetric[];
  generatedAt: string;
  periodLabel: string;
}> {
  const now = new Date();
  const since = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const periodLabel = `近 ${daysBack} 天`;

  // Run all independent queries in parallel
  const [
    draftCount,
    submittedCount,
    approveLogs,
    rejectLogs,
    publishedInPeriod,
    postsWithComments,
    postsWithoutComments,
    totalReports,
    featuredCount,
    totalPublishedAllTime,
  ] = await Promise.all([
    // 1. Drafts created in period
    prisma.forumPost.count({
      where: { createdAt: { gte: since }, status: "draft" },
    }),

    // 2. Submitted (non-draft) posts created in period
    prisma.forumPost.count({
      where: { createdAt: { gte: since }, status: { not: "draft" } },
    }),

    // 3. Approve actions in period
    prisma.moderationLog.count({
      where: { action: "approve", createdAt: { gte: since } },
    }),

    // 4. Reject actions in period
    prisma.moderationLog.count({
      where: { action: "reject", createdAt: { gte: since } },
    }),

    // 5. Published posts created in period
    prisma.forumPost.count({
      where: { createdAt: { gte: since }, status: "published" },
    }),

    // 6. Published posts in period that have at least 1 comment
    prisma.forumPost.count({
      where: {
        createdAt: { gte: since },
        status: "published",
        commentCount: { gt: 0 },
      },
    }),

    // 7. Published posts in period with 0 comments
    prisma.forumPost.count({
      where: {
        createdAt: { gte: since },
        status: "published",
        commentCount: 0,
      },
    }),

    // 8. Total reports in period
    prisma.forumReport.count({
      where: { createdAt: { gte: since } },
    }),

    // 9. Featured posts created in period
    prisma.forumPost.count({
      where: {
        createdAt: { gte: since },
        status: "published",
        isFeatured: true,
      },
    }),

    // 10. All-time published count (for rate denominators)
    prisma.forumPost.count({
      where: { status: "published" },
    }),
  ]);

  // Compute derived metrics
  const totalDraftsAndSubmitted = draftCount + submittedCount;
  const draftSubmitRate =
    totalDraftsAndSubmitted > 0
      ? Math.round((submittedCount / totalDraftsAndSubmitted) * 100)
      : 0;

  const totalModActions = approveLogs + rejectLogs;
  const approvalRate =
    totalModActions > 0 ? Math.round((approveLogs / totalModActions) * 100) : 0;
  const rejectionRate =
    totalModActions > 0 ? Math.round((rejectLogs / totalModActions) * 100) : 0;

  const firstCommentRatio =
    publishedInPeriod > 0
      ? Math.round((postsWithComments / publishedInPeriod) * 100)
      : 0;

  const noReplyRate =
    publishedInPeriod > 0
      ? Math.round((postsWithoutComments / publishedInPeriod) * 100)
      : 0;

  const reportRate =
    publishedInPeriod > 0
      ? Math.round((totalReports / publishedInPeriod) * 100)
      : 0;

  const featuredConversionRate =
    publishedInPeriod > 0
      ? Math.round((featuredCount / publishedInPeriod) * 100)
      : 0;

  // 24h engagement: posts with viewCount > 0 or commentCount > 0 within 24h of creation
  // Approximated by checking if posts created in period have any engagement
  const engagedPosts = await prisma.forumPost.count({
    where: {
      createdAt: { gte: since },
      status: "published",
      OR: [{ viewCount: { gt: 0 } }, { commentCount: { gt: 0 } }],
    },
  });
  const engagementRate24h =
    publishedInPeriod > 0
      ? Math.round((engagedPosts / publishedInPeriod) * 100)
      : 0;

  const metrics: FunnelMetric[] = [
    {
      key: "draftCount",
      label: "草稿创建数",
      value: draftCount,
      unit: "篇",
      note: `${periodLabel}内创建的草稿帖子数`,
      period: `${daysBack}d`,
    },
    {
      key: "draftSubmitRate",
      label: "草稿提交率",
      value: draftSubmitRate,
      unit: "%",
      note: `提交 ${submittedCount} / (草稿 ${draftCount} + 提交 ${submittedCount})，${periodLabel}`,
      period: `${daysBack}d`,
    },
    {
      key: "approvalRate",
      label: "审核通过率",
      value: approvalRate,
      unit: "%",
      note: `通过 ${approveLogs} / (通过+驳回 ${totalModActions})，${periodLabel}，基于审核操作日志`,
      period: `${daysBack}d`,
    },
    {
      key: "rejectionRate",
      label: "审核驳回率",
      value: rejectionRate,
      unit: "%",
      note: `驳回 ${rejectLogs} / (通过+驳回 ${totalModActions})，${periodLabel}，基于审核操作日志`,
      period: `${daysBack}d`,
    },
    {
      key: "firstCommentRatio",
      label: "获得首条评论比例",
      value: firstCommentRatio,
      unit: "%",
      note: `有评论帖子 ${postsWithComments} / 已发布 ${publishedInPeriod}，${periodLabel}`,
      period: `${daysBack}d`,
    },
    {
      key: "engagementRate24h",
      label: "发布后互动率",
      value: engagementRate24h,
      unit: "%",
      note: `有浏览或评论的帖子 ${engagedPosts} / 已发布 ${publishedInPeriod}，${periodLabel}，互动定义为有浏览或评论记录`,
      period: `${daysBack}d`,
    },
    {
      key: "noReplyRate",
      label: "无回复率",
      value: noReplyRate,
      unit: "%",
      note: `无评论帖子 ${postsWithoutComments} / 已发布 ${publishedInPeriod}，${periodLabel}`,
      period: `${daysBack}d`,
    },
    {
      key: "reportRate",
      label: "举报率",
      value: reportRate,
      unit: "%",
      note: `举报数 ${totalReports} / 已发布 ${publishedInPeriod}，${periodLabel}`,
      period: `${daysBack}d`,
    },
    {
      key: "featuredConversionRate",
      label: "精华转化率",
      value: featuredConversionRate,
      unit: "%",
      note: `精华帖 ${featuredCount} / 已发布 ${publishedInPeriod}，${periodLabel}`,
      period: `${daysBack}d`,
    },
  ];

  return {
    metrics,
    generatedAt: now.toISOString(),
    periodLabel,
  };
}
