// GET /api/admin/topics/[id] — get topic with items + sections
// PUT /api/admin/topics/[id] — update topic
// DELETE /api/admin/topics/[id] — delete topic

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  try {
    const { id } = await params;
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        sections: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!topic) {
      return NextResponse.json({ success: false, error: "专题不存在" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: topic });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const { title, subtitle, summary, status, templateType, coverEmoji, seoTitle, seoDescription, youtubeUrl, heroBadges, suitableFor, tags } = body;

    const existing = await prisma.topic.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "专题不存在" }, { status: 404 });
    }

    // If changing to published, set publishedAt
    const now = new Date();
    const publishedAt = status === "published" && existing.status !== "published" ? now : (status === "draft" ? null : existing.publishedAt);

    const topic = await prisma.topic.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        subtitle: subtitle ?? undefined,
        summary: summary ?? undefined,
        status: status ?? existing.status,
        templateType: templateType ?? existing.templateType,
        coverEmoji: coverEmoji ?? undefined,
        seoTitle: seoTitle ?? undefined,
        seoDescription: seoDescription ?? undefined,
        youtubeUrl: youtubeUrl ?? undefined,
        heroBadges: heroBadges ?? undefined,
        suitableFor: suitableFor ?? undefined,
        tags: tags ?? undefined,
        publishedAt,
      },
    });
    return NextResponse.json({ success: true, data: topic });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ success: false, error: "slug 已存在" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  try {
    const { id } = await params;
    await prisma.topic.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
