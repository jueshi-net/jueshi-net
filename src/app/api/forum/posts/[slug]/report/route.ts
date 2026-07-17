import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

const VALID_REASONS = ["spam", "abuse", "harassment", "illegal", "other"];

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;
    const { slug } = await params;
    const body = await request.json();
    const { reason, description } = body;

    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: "请选择有效的举报原因" }, { status: 400 });
    }

    const post = await prisma.forumPost.findUnique({ where: { slug } });
    if (!post) return NextResponse.json({ error: "帖子不存在" }, { status: 404 });

    // Can't report own content
    if (post.userId === session.user.id) {
      return NextResponse.json({ error: "不能举报自己的内容" }, { status: 400 });
    }

    // P4: Report rate limit - max 10 reports per day per user
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayReportCount = await prisma.forumReport.count({
      where: {
        reporterId: session.user.id,
        createdAt: { gte: todayStart },
      },
    });
    if (todayReportCount >= 10) {
      return NextResponse.json(
        { error: "今日举报次数已达上限（10 次）" },
        { status: 429 }
      );
    }

    // P4: Short-time burst limit - max 3 reports per 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentReportCount = await prisma.forumReport.count({
      where: {
        reporterId: session.user.id,
        createdAt: { gte: fiveMinutesAgo },
      },
    });
    if (recentReportCount >= 3) {
      return NextResponse.json(
        { error: "举报太频繁，请稍后再试" },
        { status: 429 }
      );
    }

    // Check existing report
    const existing = await prisma.forumReport.findUnique({
      where: { reporterId_postId: { reporterId: session.user.id, postId: post.id } },
    });
    if (existing) return NextResponse.json({ error: "已经举报过此帖子" }, { status: 409 });

    await prisma.forumReport.create({
      data: {
        reporterId: session.user.id,
        postId: post.id,
        reason,
        description: description?.slice(0, 500) || null,
      },
    });

    return NextResponse.json({ success: true, message: "举报已提交，管理员将尽快处理" });
  } catch (error) {
    console.error("[Report Post Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
