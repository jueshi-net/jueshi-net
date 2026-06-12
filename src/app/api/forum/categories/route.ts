// GET /api/forum/categories — 分类列表
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.forumCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        iconText: true,
        color: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[Forum Categories GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
