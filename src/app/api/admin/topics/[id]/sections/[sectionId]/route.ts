// PUT /api/admin/topics/[id]/sections/[sectionId] — update section
// DELETE /api/admin/topics/[id]/sections/[sectionId] — delete section

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; sectionId: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;
  try {
    const { id, sectionId } = await params;
    const body = await req.json();
    const { type, title, content, sortOrder } = body;
    const existing = await prisma.topicSection.findUnique({ where: { id: sectionId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "分区不存在" }, { status: 404 });
    }
    const section = await prisma.topicSection.update({
      where: { id: sectionId },
      data: {
        type: type ?? existing.type,
        title: title ?? undefined,
        content: content ?? undefined,
        sortOrder: sortOrder ?? undefined,
      },
    });
    return NextResponse.json({ success: true, data: section });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; sectionId: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;
  try {
    const { sectionId } = await params;
    await prisma.topicSection.delete({ where: { id: sectionId } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
