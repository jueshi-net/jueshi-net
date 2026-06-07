// GET /api/admin/topics — list all topics (admin only)
// POST /api/admin/topics — create topic (admin only)

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { parseYouTubeUrl } from "@/lib/youtube";

export async function GET() {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  try {
    const topics = await prisma.topic.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, slug: true, title: true, subtitle: true,
        status: true, templateType: true, coverEmoji: true,
        youtubeUrl: true, publishedAt: true, createdAt: true, updatedAt: true,
        _count: { select: { items: true, sections: true } },
      },
    });
    return NextResponse.json({ success: true, data: topics });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  try {
    const body = await req.json();
    const { slug, title, subtitle, summary, status, templateType, coverEmoji, seoTitle, seoDescription, youtubeUrl } = body;

    if (!slug || !title) {
      return NextResponse.json({ success: false, error: "slug 和 title 必填" }, { status: 400 });
    }

    const youtubeVideoId = youtubeUrl ? parseYouTubeUrl(youtubeUrl) : null;

    const topic = await prisma.topic.create({
      data: {
        slug, title, subtitle: subtitle || null, summary: summary || null,
        status: status || "draft", templateType: templateType || "rating_list",
        coverEmoji: coverEmoji || null, seoTitle: seoTitle || null,
        seoDescription: seoDescription || null, youtubeUrl: youtubeUrl || null,
        youtubeVideoId: youtubeVideoId || null,
        publishedAt: status === "published" ? new Date() : null,
      },
    });
    return NextResponse.json({ success: true, data: topic }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ success: false, error: "slug 已存在" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
