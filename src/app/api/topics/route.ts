// GET /api/topics — list published topics (public)
// GET /api/topics/[slug] — get published topic by slug (public)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  try {
    if (slug) {
      const topic = await prisma.topic.findFirst({
        where: { slug, status: "published" },
        include: {
          items: { orderBy: { sortOrder: "asc" } },
          sections: { orderBy: { sortOrder: "asc" } },
        },
      });
      if (!topic) {
        return NextResponse.json({ success: false, error: "专题不存在" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: topic });
    }

    const topics = await prisma.topic.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true, slug: true, title: true, subtitle: true, summary: true,
        coverEmoji: true, heroBadges: true, suitableFor: true, tags: true,
        youtubeVideoId: true, youtubeThumbnail: true, publishedAt: true,
        _count: { select: { items: true } },
      },
    });
    return NextResponse.json({ success: true, data: topics });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
