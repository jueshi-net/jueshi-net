// GET /api/forum/admin/user-risk/[userId] - 管理员只读用户风险概览
// Does NOT auto-ban or auto-mute. Risk score is advisory only.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { userId } = await params;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "缺少 userId" }, { status: 400 });
    }

    // Fetch user basic info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Parallel queries for risk metrics
    const [
      totalPosts,
      totalComments,
      rejectedCount,
      hiddenCount,
      reportedCount,
      validReportsCount,
      recentPosts,
      recentComments,
      recentReports,
      moderationLogs,
    ] = await Promise.all([
      // Total posts (excluding drafts)
      prisma.forumPost.count({
        where: { userId, status: { not: "draft" } },
      }),
      // Total comments
      prisma.forumComment.count({
        where: { userId },
      }),
      // Rejected posts count
      prisma.forumPost.count({
        where: { userId, status: "rejected" },
      }),
      // Hidden posts count
      prisma.forumPost.count({
        where: { userId, status: "hidden" },
      }),
      // Times reported by others (on this user's posts/comments)
      prisma.forumReport.count({
        where: {
          OR: [
            { post: { userId } },
            { comment: { userId } },
          ],
        },
      }),
      // Valid (resolved) reports against this user's content
      prisma.forumReport.count({
        where: {
          status: "resolved",
          OR: [
            { post: { userId } },
            { comment: { userId } },
          ],
        },
      }),
      // Recent posts (7 days) for frequency analysis
      prisma.forumPost.findMany({
        where: { userId, createdAt: { gte: sevenDaysAgo } },
        select: { id: true, title: true, content: true, createdAt: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      // Recent comments (7 days)
      prisma.forumComment.findMany({
        where: { userId, createdAt: { gte: sevenDaysAgo } },
        select: { id: true, content: true, createdAt: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      // Recent reports against this user (24 hours)
      prisma.forumReport.findMany({
        where: {
          createdAt: { gte: twentyFourHoursAgo },
          OR: [
            { post: { userId } },
            { comment: { userId } },
          ],
        },
        select: { id: true, reason: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      // Recent moderation logs for this user's content
      prisma.moderationLog.findMany({
        where: {
          OR: [
            { post: { userId } },
            { comment: { userId } },
          ],
        },
        include: {
          admin: { select: { name: true } },
          post: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // Calculate risk indicators
    const recentPostsCount = recentPosts.length;
    const recentCommentsCount = recentComments.length;

    // High-frequency posting: > 5 posts in 24h or > 15 in 7 days
    const postsIn24h = recentPosts.filter(
      (p) => p.createdAt >= twentyFourHoursAgo
    ).length;
    const isHighFrequency = postsIn24h > 5 || recentPostsCount > 15;

    // External link density: check if recent content has many links
    const linkRegex = /https?:\/\/[^\s]+/gi;
    const postsWithMultipleLinks = recentPosts.filter((p) => {
      const matches = p.content.match(linkRegex);
      return matches && matches.length >= 3;
    }).length;
    const hasLinkDensity = postsWithMultipleLinks > 0;

    // Calculate risk level (advisory only, NOT for auto-punishment)
    let riskScore = 0;
    const riskFactors: string[] = [];

    if (rejectedCount >= 3) {
      riskScore += 2;
      riskFactors.push(`多次驳回 (${rejectedCount} 次)`);
    } else if (rejectedCount >= 1) {
      riskScore += 1;
      riskFactors.push(`有驳回记录 (${rejectedCount} 次)`);
    }

    if (hiddenCount >= 2) {
      riskScore += 2;
      riskFactors.push(`多次隐藏 (${hiddenCount} 次)`);
    } else if (hiddenCount >= 1) {
      riskScore += 1;
      riskFactors.push(`有隐藏记录 (${hiddenCount} 次)`);
    }

    if (validReportsCount >= 3) {
      riskScore += 3;
      riskFactors.push(`多次被有效举报 (${validReportsCount} 次)`);
    } else if (validReportsCount >= 1) {
      riskScore += 2;
      riskFactors.push(`有有效举报 (${validReportsCount} 次)`);
    }

    if (isHighFrequency) {
      riskScore += 2;
      riskFactors.push(`短期高频发帖 (24h内 ${postsIn24h} 帖)`);
    }

    if (hasLinkDensity) {
      riskScore += 1;
      riskFactors.push(`外链密集内容 (${postsWithMultipleLinks} 帖含 ≥3 外链)`);
    }

    // Risk level mapping
    let riskLevel: "low" | "medium" | "high";
    if (riskScore >= 6) {
      riskLevel = "high";
    } else if (riskScore >= 3) {
      riskLevel = "medium";
    } else {
      riskLevel = "low";
    }

    // Mask email for privacy
    const maskedEmail = user.email
      ? user.email.replace(/(.{2}).*(@.*)/, "$1***$2")
      : null;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: maskedEmail,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
      metrics: {
        totalPosts,
        totalComments,
        rejectedCount,
        hiddenCount,
        reportedCount,
        validReportsCount,
        recentPostsCount,
        recentCommentsCount,
        postsIn24h,
      },
      riskAssessment: {
        level: riskLevel,
        score: riskScore,
        factors: riskFactors,
        isHighFrequency,
        hasLinkDensity,
        // Advisory notice - this score is NOT for auto-punishment
        notice:
          "风险等级仅供参考，不能作为自动处罚依据。管理员需结合上下文判断。",
      },
      recentActivity: {
        posts: recentPosts.map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          createdAt: p.createdAt.toISOString(),
        })),
        comments: recentComments.map((c) => ({
          id: c.id,
          contentPreview: c.content.slice(0, 100),
          status: c.status,
          createdAt: c.createdAt.toISOString(),
        })),
        reports: recentReports.map((r) => ({
          id: r.id,
          reason: r.reason,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        })),
      },
      moderationHistory: moderationLogs.map((log) => ({
        id: log.id,
        action: log.action,
        reason: log.reason,
        postTitle: log.post?.title || null,
        adminName: log.admin?.name || "管理员",
        createdAt: log.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[User Risk Overview Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
