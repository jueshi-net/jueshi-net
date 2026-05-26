// PUT /api/admin/topics/[id]/items/[itemId] — update item
// DELETE /api/admin/topics/[id]/items/[itemId] — delete item

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  try {
    const { id, itemId } = await params;
    const body = await req.json();

    const existing = await prisma.topicItem.findFirst({
      where: { id: itemId, topicId: id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: "条目不存在" }, { status: 404 });
    }

    const item = await prisma.topicItem.update({
      where: { id: itemId },
      data: {
        name: body.name ?? existing.name,
        alias: body.alias ?? undefined,
        rating: body.rating ?? undefined,
        category: body.category ?? undefined,
        iconText: body.iconText ?? undefined,
        iconBg: body.iconBg ?? undefined,
        iconFg: body.iconFg ?? undefined,
        installPriority: body.installPriority ?? undefined,
        description: body.description ?? undefined,
        analogy: body.analogy ?? undefined,
        suitableFor: body.suitableFor ?? undefined,
        beginnerAdvice: body.beginnerAdvice ?? undefined,
        riskTip: body.riskTip ?? undefined,
        officialUrl: body.officialUrl ?? undefined,
        isBeginnerFriendly: body.isBeginnerFriendly ?? undefined,
        sortOrder: body.sortOrder ?? undefined,
      },
    });
    return NextResponse.json({ success: true, data: item });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  try {
    const { id, itemId } = await params;
    const existing = await prisma.topicItem.findFirst({
      where: { id: itemId, topicId: id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: "条目不存在" }, { status: 404 });
    }
    await prisma.topicItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
