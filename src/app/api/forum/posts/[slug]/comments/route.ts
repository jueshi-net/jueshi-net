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

    const comment = await prisma.$transaction(async (tx) => {
      const c = await tx.forumComment.create({
        data: {
          postId: post.id,
          userId: session.user.id,
          content,
          ipHash,
          userAgent,
        },
        include: { user: { select: { name: true, email: true } } },
      });

      await tx.forumPost.update({
        where: { id: post.id },
        data: {
          commentCount: { increment: 1 },
          lastCommentAt: new Date(),
          lastCommentUserId: session.user.id,
        },
      });

      return c;
    });

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/forum/posts/[slug]/comments error:", error);
    return NextResponse.json(
      { error: "评论失败，请重试" },
      { status: 500 }
    );
  }
}
