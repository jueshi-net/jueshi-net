// PATCH /api/admin/forum/categories/[id] — 更新分类

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const res = await requireAdmin();
  if (res instanceof NextResponse) return res;

  const { id } = await params;

  try {
    const body = await req.json();
    const { key, name, description, iconText, color, sortOrder, isActive } = body;

    const existing = await prisma.forumCategory.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    const data: any = {};

    if (key !== undefined) {
      if (typeof key !== "string" || !key.trim()) {
        return NextResponse.json({ error: "key 不能为空" }, { status: 400 });
      }
      // Check uniqueness (exclude current)
      const duplicate = await prisma.forumCategory.findFirst({
        where: { key: key.trim(), id: { not: id } },
      });
      if (duplicate) {
        return NextResponse.json({ error: "该分类 key 已存在" }, { status: 409 });
      }
      data.key = key.trim();
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ error: "名称不能为空" }, { status: 400 });
      }
      data.name = name.trim();
    }

    if (description !== undefined) data.description = description?.trim() || null;
    if (iconText !== undefined) data.iconText = iconText || null;
    if (color !== undefined) data.color = color || null;
    if (sortOrder !== undefined) {
      if (typeof sortOrder !== "number") {
        return NextResponse.json({ error: "sortOrder 必须是数字" }, { status: 400 });
      }
      data.sortOrder = sortOrder;
    }
    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return NextResponse.json({ error: "isActive 必须是布尔值" }, { status: 400 });
      }
      data.isActive = isActive;
    }

    const category = await prisma.forumCategory.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("[Admin Forum Category PATCH Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
