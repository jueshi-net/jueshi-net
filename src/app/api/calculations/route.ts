import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/calculations - List user's saved calculations
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: true, data: [] });
    }

    const calcs = await prisma.linkItem.findMany({
      where: {
        userId: session.user.id as string,
        status: "saved_calculation",
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const data = calcs.map(c => ({
      id: c.id,
      type: c.categoryName === "express" ? "express" : "sea",
      data: c.description ? JSON.parse(c.description) : null,
      result: c.icon ? JSON.parse(c.icon) : null,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("List calculations error:", error);
    return NextResponse.json({ success: false, error: "查询失败" }, { status: 500 });
  }
}

// POST /api/calculations - Save a calculation
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, data, result } = body;

    if (!type || !data) {
      return NextResponse.json({ success: false, error: "数据为必填" }, { status: 400 });
    }

    const label = type === "express" ? "快递/空派" : "海运大货";
    const calc = await prisma.linkItem.create({
      data: {
        title: `${label}计算 - ${new Date().toLocaleDateString("zh-CN")}`,
        url: "#calculation",
        description: JSON.stringify(data),
        icon: JSON.stringify(result),
        userId: session.user.id as string,
        status: "saved_calculation",
        categoryName: type,
      },
    });

    return NextResponse.json({ success: true, data: { id: calc.id } });
  } catch (error) {
    console.error("Save calculation error:", error);
    return NextResponse.json({ success: false, error: "保存失败" }, { status: 500 });
  }
}

// DELETE /api/calculations?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "缺少ID" }, { status: 400 });
    }

    await prisma.linkItem.delete({
      where: { id, userId: session.user.id as string },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete calculation error:", error);
    return NextResponse.json({ success: false, error: "删除失败" }, { status: 500 });
  }
}
