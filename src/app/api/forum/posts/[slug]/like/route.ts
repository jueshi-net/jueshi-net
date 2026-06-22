import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { adjustHonor, incrementCommunityStat } from "@/lib/honor-helpers";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;
    const { slug } = await params;

    const post = await prisma.forumPost.findUnique({ where: { slug } });
    if (!post) return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    if (post.status !== "published") return NextResponse.json({ error: "帖子不可见" }, { status: 403 });

    // Prevent self-like
    if (post.userId === session.user.id) {
      return NextResponse.json({ error: "不能给自己的帖子点赞" }, { status: 400 });
    }

    // Check existing like
    const existing = await prisma.forumLike.findUnique({
      where: { userId_postId: { userId: session.user.id, postId: post.id } },
    });
    if (existing) return NextResponse.json({ error: "已经点赞过" }, { status: 409 });

    await prisma.forumLike.create({
      data: { userId: session.user.id, postId: post.id },
    });

    // Award honor +1 to post author (with daily cap, dedup by sourceId)
    await adjustHonor(post.userId, 1, "帖子被点赞", "post_liked", post.id, session.user.id).catch(() => {});
    await incrementCommunityStat(post.userId, "helpfulVoteCount").catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Like Post Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;
    const { slug } = await params;

    const post = await prisma.forumPost.findUnique({ where: { slug } });
    if (!post) return NextResponse.json({ error: "帖子不存在" }, { status: 404 });

    await prisma.forumLike.deleteMany({
      where: { userId: session.user.id, postId: post.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Unlike Post Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
