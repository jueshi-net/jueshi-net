import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import crypto from "crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    const post = await prisma.forumPost.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    const [comments, total] = await Promise.all([
      prisma.forumComment.findMany({
        where: { postId: post.id, status: "published" },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.forumComment.count({
        where: { postId: post.id, status: "published" },
      }),
    ]);

    return NextResponse.json({ comments, total, page, pageSize });
  } catch (error) {
    console.error("GET /api/forum/posts/[slug]/comments error:", error);
    return NextResponse.json(
      { error: "获取评论失败" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;

    const { slug } = await params;
    const body = await request.json();
    const content = body.content?.trim();

    if (!content || content.length < 2) {
      return NextResponse.json(
        { error: "评论至少 2 个字符" },
        { status: 400 }
      );
    }
    if (content.length > 1000) {
      return NextResponse.json(
        { error: "评论最多 1000 个字符" },
        { status: 400 }
      );
    }

    // P4: Anti-spam content risk checks for comments
    const { runContentRiskChecks } = await import("@/lib/community/anti-spam");
    const contentRisk = runContentRiskChecks(content, {
      maxLinks: 3,
      maxDupes: 2,
      maxConsecutive: 15,
      minRatio: 0.2,
    });
    if (!contentRisk.ok) {
      return NextResponse.json(
        { error: contentRisk.error },
        { status: 400 }
      );
    }

    const post = await prisma.forumPost.findUnique({ where: { slug } });
    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }
    if (post.isLocked) {
      return NextResponse.json(
        { error: "该帖已锁定，不能评论" },
        { status: 403 }
      );
    }
    // Cannot comment on pending/hidden posts
    if (post.status !== "published") {
      return NextResponse.json(
        { error: "该帖未审核或已隐藏，不能评论" },
        { status: 403 }
      );
    }

    // Rate limit: max 3 comments per minute per user
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentComments = await prisma.forumComment.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: oneMinuteAgo },
      },
    });
    if (recentComments >= 3) {
      return NextResponse.json(
        { error: "评论太频繁，请等待 1 分钟" },
        { status: 429 }
      );
    }

    // Duplicate content check: same content in same post in last 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const duplicateComment = await prisma.forumComment.findFirst({
      where: {
        postId: post.id,
        userId: session.user.id,
        content,
        createdAt: { gte: oneHourAgo },
      },
    });
    if (duplicateComment) {
      return NextResponse.json(
        { error: "检测到重复评论，请勿重复提交" },
        { status: 409 }
      );
    }

    // Daily limit: 20 comments per user
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = await prisma.forumComment.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: todayStart },
      },
    });
    if (todayCount >= 20) {
      return NextResponse.json(
        { error: "今日评论次数已达上限（20 条）" },
        { status: 429 }
      );
    }

    // Get IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "unknown";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
    const userAgent = request.headers.get("user-agent") || null;

    // Admin users bypass moderation; regular users start as pending
    const userRole = (session.user as any).role?.toUpperCase();
    const commentStatus = userRole === "ADMIN" ? "published" : "pending";

    const comment = await prisma.$transaction(async (tx) => {
      const c = await tx.forumComment.create({
        data: {
          postId: post.id,
          userId: session.user.id,
          content,
          status: commentStatus,
          ipHash,
          userAgent,
        },
        include: { user: { select: { name: true, email: true } } },
      });

      // Only increment commentCount for published comments (visible on frontend)
      if (commentStatus === "published") {
        await tx.forumPost.update({
          where: { id: post.id },
          data: {
            commentCount: { increment: 1 },
            lastCommentAt: new Date(),
            lastCommentUserId: session.user.id,
          },
        });
      }

      return c;
    });

    // v18.6.1: Update community stats + grant first_reply badge (fire-and-forget)
    try {
      const { incrementCommunityStat, ensureCommunityStat } = await import("@/lib/honor-helpers");
      await ensureCommunityStat(session.user.id);
      await incrementCommunityStat(session.user.id, "commentCount");
      // Grant first_reply badge if this is user's first comment
      const commentCount = await prisma.forumComment.count({ where: { userId: session.user.id } });
      if (commentCount === 1) {
        const badge = await prisma.userBadge.findUnique({ where: { key: "first_reply" } });
        if (badge) {
          await prisma.userBadgeAward.upsert({
            where: { userId_badgeId: { userId: session.user.id, badgeId: badge.id } },
            create: { userId: session.user.id, badgeId: badge.id, reason: "首次回复自动授予" },
            update: {},
          });
        }
      }
    } catch (e) {
      console.error("[CommunityStat comment increment error]", e);
    }

    // Create notification for post author (if commenter is not the author)
    // P4: Deduplication — don't create a notification if the same actor already
    // has an unread reply notification for this post in the last hour.
    if (commentStatus === "published" && post.userId !== session.user.id) {
      try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const existingNotif = await prisma.forumNotification.findFirst({
          where: {
            userId: post.userId,
            type: "reply",
            postId: post.id,
            actorId: session.user.id,
            isRead: false,
            createdAt: { gte: oneHourAgo },
          },
          select: { id: true },
        });
        if (!existingNotif) {
          await prisma.forumNotification.create({
            data: {
              userId: post.userId,
              type: "reply",
              postId: post.id,
              commentId: comment.id,
              actorId: session.user.id,
              message: `有新回复了您的帖子「${post.title.slice(0, 30)}」`,
            },
          });
        }
      } catch (notifError) {
        console.error("[Comment notification error]", notifError);
      }
    }

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/forum/posts/[slug]/comments error:", error);
    return NextResponse.json(
      { error: "评论失败，请重试" },
      { status: 500 }
    );
  }
}
