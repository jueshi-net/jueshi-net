// GET /api/admin/forum/stats — Forum admin statistics
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { session } = authResult;

  const userRole = (session.user as any).role?.toUpperCase();
  if (userRole !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  try {
    const [
      totalCategories,
      totalPosts,
      pendingPosts,
      publishedPosts,
      hiddenPosts,
      totalComments,
      pendingComments,
      publishedComments,
      recentPosts,
      recentComments,
    ] = await Promise.all([
      prisma.forumCategory.count(),
      prisma.forumPost.count(),
      prisma.forumPost.count({ where: { status: "pending" } }),
      prisma.forumPost.count({ where: { status: "published" } }),
      prisma.forumPost.count({ where: { status: "hidden" } }),
      prisma.forumComment.count(),
      prisma.forumComment.count({ where: { status: "pending" } }),
      prisma.forumComment.count({ where: { status: "published" } }),
      prisma.forumPost.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          category: { select: { name: true } },
        },
      }),
      prisma.forumComment.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          post: { select: { title: true, slug: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        categories: totalCategories,
        posts: {
          total: totalPosts,
          pending: pendingPosts,
          published: publishedPosts,
          hidden: hiddenPosts,
        },
        comments: {
          total: totalComments,
          pending: pendingComments,
          published: publishedComments,
        },
      },
      recentPosts,
      recentComments,
    });
  } catch (error) {
    console.error("[Admin Forum Stats Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
