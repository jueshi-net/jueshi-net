import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - find forum posts related to a tool
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const toolSlug = searchParams.get("toolSlug");
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!toolSlug) {
      return NextResponse.json({ posts: [] });
    }

    // Search for posts that have relatedTool matching, or mention the tool in title/content
    const posts = await prisma.forumPost.findMany({
      where: {
        OR: [
          { relatedTool: toolSlug },
          { title: { contains: toolSlug, mode: "insensitive" } },
          { title: { contains: toolSlug.replace(/-/g, " "), mode: "insensitive" } },
        ],
        status: "published",
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        userId: true,
        commentCount: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });

    return NextResponse.json({
      posts: posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        authorName: p.user?.name || "用户",
        createdAt: p.createdAt.toISOString(),
        replyCount: p.commentCount || 0,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ posts: [], error: e.message }, { status: 500 });
  }
}
