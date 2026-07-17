// GET /api/forum/my-bookmarks - 当前用户的收藏帖子列表

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10))
    );

    const [bookmarks, total] = await Promise.all([
      prisma.forumBookmark.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          post: {
            select: {
              id: true,
              slug: true,
              title: true,
              excerpt: true,
              status: true,
              viewCount: true,
              commentCount: true,
              createdAt: true,
              category: { select: { id: true, key: true, name: true } },
              user: { select: { id: true, name: true, email: true } },
              _count: {
                select: {
                  likes: true,
                  comments: { where: { status: "published" } },
                },
              },
            },
          },
        },
      }),
      prisma.forumBookmark.count({ where: { userId } }),
    ]);

    // Filter out deleted/hidden posts from bookmarks
    const items = bookmarks
      .filter((b) => b.post && b.post.status === "published")
      .map((b) => ({
        id: b.id,
        bookmarkedAt: b.createdAt,
        post: {
          id: b.post.id,
          slug: b.post.slug,
          title: b.post.title,
          excerpt: b.post.excerpt,
          viewCount: b.post.viewCount,
          commentCount: b.post.commentCount,
          createdAt: b.post.createdAt,
          category: b.post.category,
          author: b.post.user,
          _count: {
            likes: b.post._count.likes,
            comments: b.post._count.comments,
          },
        },
      }));

    return NextResponse.json({
      bookmarks: items,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("[My Bookmarks GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
