// GET /api/admin/badges — list badges
// POST /api/admin/badges — create badge
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const res = await requireAdmin();
  if ("error" in res) return res.error;
  try {
    const badges = await prisma.userBadge.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ success: true, data: badges });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;
  try {
    const body = await req.json();
    if (!body.key || !body.name || !body.category) {
      return NextResponse.json({ success: false, error: "key, name, category 必填" }, { status: 400 });
    }
    const badge = await prisma.userBadge.create({
      data: {
        key: body.key, name: body.name, description: body.description ?? null,
        iconText: body.iconText ?? "🎖️", color: body.color ?? "purple-500",
        category: body.category, conditionText: body.conditionText ?? null,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    return NextResponse.json({ success: true, data: badge }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ success: false, error: "key 已存在" }, { status: 409 });
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
