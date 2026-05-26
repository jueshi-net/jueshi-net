// GET /api/admin/levels — list levels
// POST /api/admin/levels — create level
// PUT /api/admin/levels/[id] — update level

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const res = await requireAdmin();
  if ("error" in res) return res.error;
  try {
    const levels = await prisma.userLevel.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ success: true, data: levels });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;
  try {
    const body = await req.json();
    if (!body.key || !body.name || body.minGrowth == null) {
      return NextResponse.json({ success: false, error: "key, name, minGrowth 必填" }, { status: 400 });
    }
    const level = await prisma.userLevel.create({
      data: {
        key: body.key, name: body.name, minGrowth: body.minGrowth,
        maxGrowth: body.maxGrowth ?? null, description: body.description ?? null,
        benefits: body.benefits ?? null, iconText: body.iconText ?? "⭐",
        color: body.color ?? "blue-500", sortOrder: body.sortOrder ?? 0,
      },
    });
    return NextResponse.json({ success: true, data: level }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ success: false, error: "key 已存在" }, { status: 409 });
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
