// GET /api/forum/posts/[slug] — 帖子详情

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const post = await prisma.forumPost.findUnique({
      where: { slug },
      include: {
        user: { select: { name: true, email: true } },
        category: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // hidden/deleted not visible to non-admins
    if (post.status === "hidden" || post.status === "deleted") {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // Increment view count
    await prisma.forumPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("[Forum Post Detail GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
