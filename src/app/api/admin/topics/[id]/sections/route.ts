// POST /api/admin/topics/[id]/sections — add section
// PUT /api/admin/topics/[id]/sections/[sectionId] — update section
// DELETE /api/admin/topics/[id]/sections/[sectionId] — delete section
// GET /api/admin/topics/[id]/sections — list sections

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;
  try {
    const { id } = await params;
    const sections = await prisma.topicSection.findMany({
      where: { topicId: id },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, data: sections });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;
  try {
    const { id } = await params;
    const body = await req.json();
    const { type, title, content, sortOrder } = body;
    if (!type) {
      return NextResponse.json({ success: false, error: "type 必填" }, { status: 400 });
    }
    const topic = await prisma.topic.findUnique({ where: { id } });
    if (!topic) {
      return NextResponse.json({ success: false, error: "专题不存在" }, { status: 404 });
    }
    const maxSort = await prisma.topicSection.aggregate({
      where: { topicId: id },
      _max: { sortOrder: true },
    });
    const order = sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1;
    const section = await prisma.topicSection.create({
      data: { topicId: id, type, title, content, sortOrder: order },
    });
    return NextResponse.json({ success: true, data: section }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
