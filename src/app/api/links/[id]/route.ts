// GET - 获取单个链接
// PUT - 更新链接
// DELETE - 删除链接
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const link = await prisma.linkItem.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!link) {
      return NextResponse.json({ success: false, error: "Link not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: link });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch link" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const link = await prisma.linkItem.update({
      where: { id },
      data: {
        title: body.title,
        url: body.url,
        description: body.description,
        icon: body.icon,
        categoryId: body.categoryId,
        sortOrder: body.sortOrder,
      },
    });
    return NextResponse.json({ success: true, data: link });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update link" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.linkItem.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Link deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete link" }, { status: 500 });
  }
}
