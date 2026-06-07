// PUT /api/admin/levels/[id] — update level
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;
  try {
    const { id } = await params;
    const body = await _req.json();
    const existing = await prisma.userLevel.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "等级不存在" }, { status: 404 });
    const level = await prisma.userLevel.update({
      where: { id },
      data: {
        key: body.key ?? undefined, name: body.name ?? undefined,
        minGrowth: body.minGrowth ?? undefined, maxGrowth: body.maxGrowth ?? undefined,
        description: body.description ?? undefined, benefits: body.benefits ?? undefined,
        iconText: body.iconText ?? undefined, color: body.color ?? undefined,
        sortOrder: body.sortOrder ?? undefined, isActive: body.isActive ?? undefined,
      },
    });
    return NextResponse.json({ success: true, data: level });
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
    const existing = await prisma.userLevel.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "等级不存在" }, { status: 404 });
    const level = await prisma.userLevel.update({
      where: { id },
      data: { isActive: body.isActive ?? existing.isActive },
    });
    return NextResponse.json({ success: true, data: level });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
