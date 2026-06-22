import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const tool = request.nextUrl.searchParams.get("tool");
  if (!tool) {
    return NextResponse.json({ posts: [] });
  }

  try {
    const posts = await prisma.forumPost.findMany({
      where: {
        status: "published",
        relatedTool: tool,
      },
      include: {
        user: { select: { name: true, image: true } },
        category: true,
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    return NextResponse.json({
      posts: posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        userName: p.user.name || "匿名",
        commentCount: p._count.comments,
        categoryName: p.category.name,
      })),
    });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}
