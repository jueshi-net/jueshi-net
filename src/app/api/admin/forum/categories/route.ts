// GET /api/admin/forum/categories — 分类列表
// POST /api/admin/forum/categories — 创建分类

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const res = await requireAdmin();
  if (res instanceof NextResponse) return res;

  try {
    const categories = await prisma.forumCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[Admin Forum Categories GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const res = await requireAdmin();
  if (res instanceof NextResponse) return res;

  try {
    const body = await req.json();
    const { key, name, description, iconText, color, sortOrder, isActive } = body;

    if (!key || typeof key !== "string" || !key.trim()) {
      return NextResponse.json({ error: "分类 key 不能为空" }, { status: 400 });
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "分类名称不能为空" }, { status: 400 });
    }

    // Check key uniqueness
    const existing = await prisma.forumCategory.findUnique({
      where: { key: key.trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "该分类 key 已存在" }, { status: 409 });
    }

    const category = await prisma.forumCategory.create({
      data: {
        key: key.trim(),
        name: name.trim(),
        description: description?.trim() || null,
        iconText: iconText || null,
        color: color || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error("[Admin Forum Categories POST Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
