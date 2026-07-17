// GET /api/forum/my-comments - 当前用户的评论列表

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

    const [comments, total] = await Promise.all([
      prisma.forumComment.findMany({
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
              status: true,
              category: { select: { id: true, key: true, name: true } },
            },
          },
          _count: {
            select: { likes: true },
          },
        },
      }),
      prisma.forumComment.count({ where: { userId } }),
    ]);

    const items = comments.map((c) => ({
      id: c.id,
      content: c.content,
      status: c.status,
      floorNumber: c.floorNumber,
      isAccepted: c.isAccepted,
      createdAt: c.createdAt,
      likeCount: c._count.likes,
      post: {
        id: c.post.id,
        slug: c.post.slug,
        title: c.post.title,
        status: c.post.status,
        category: c.post.category,
      },
    }));

    return NextResponse.json({
      comments: items,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("[My Comments GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
