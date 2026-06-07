// PUT /api/admin/badges/[id] — update badge
// PATCH /api/admin/badges/[id] — toggle isActive
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;
  try {
    const { id } = await params;
    const body = await _req.json();
    const existing = await prisma.userBadge.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "勋章不存在" }, { status: 404 });
    const badge = await prisma.userBadge.update({
      where: { id },
      data: {
        key: body.key ?? undefined, name: body.name ?? undefined,
        description: body.description ?? undefined, iconText: body.iconText ?? undefined,
        color: body.color ?? undefined, category: body.category ?? undefined,
        conditionText: body.conditionText ?? undefined,
        sortOrder: body.sortOrder ?? undefined, isActive: body.isActive ?? undefined,
      },
    });
    return NextResponse.json({ success: true, data: badge });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ success: false, error: "key 已存在" }, { status: 409 });
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;
  try {
    const { id } = await params;
    const body = await _req.json();
    const existing = await prisma.userBadge.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "勋章不存在" }, { status: 404 });
    const badge = await prisma.userBadge.update({ where: { id }, data: { isActive: body.isActive ?? existing.isActive } });
    return NextResponse.json({ success: true, data: badge });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
