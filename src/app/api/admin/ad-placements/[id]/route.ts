import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function requireAdmin(session: any) {
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role || "";
  if (!["管理员", "ADMIN", "admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  const { id } = await params;
  const body = await req.json();

  try {
    const placement = await prisma.adPlacement.update({
      where: { id },
      data: {
        ...(body.key !== undefined && { key: body.key }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.pageType !== undefined && { pageType: body.pageType }),
        ...(body.zone !== undefined && { zone: body.zone }),
        ...(body.device !== undefined && { device: body.device }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });
    return NextResponse.json(placement);
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: `广告位 key "${body.key}" 已存在` }, { status: 409 });
    }
    if (e.code === "P2025") {
      return NextResponse.json({ error: "广告位不存在" }, { status: 404 });
    }
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  const { id } = await params;
  await prisma.adPlacement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
