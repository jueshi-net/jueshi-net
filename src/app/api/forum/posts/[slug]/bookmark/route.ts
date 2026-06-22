import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;
    const { slug } = await params;

    const post = await prisma.forumPost.findUnique({ where: { slug } });
    if (!post) return NextResponse.json({ error: "帖子不存在" }, { status: 404 });

    await prisma.forumBookmark.upsert({
      where: { userId_postId: { userId: session.user.id, postId: post.id } },
      create: { userId: session.user.id, postId: post.id },
      update: {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Bookmark Post Error]", error);
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

    await prisma.forumBookmark.deleteMany({
      where: { userId: session.user.id, postId: post.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Unbookmark Post Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
