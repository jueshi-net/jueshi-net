import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const ad = await prisma.adSlot.findUnique({ where: { id } });
    if (!ad) return NextResponse.json({ success: false, error: "Ad not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: ad });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch ad" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;
    const body = await req.json();
    const ad = await prisma.adSlot.update({
      where: { id },
      data: {
        name: body.name,
        position: body.position,
        type: body.type || "image",
        imageUrl: body.imageUrl || null,
        linkUrl: body.linkUrl || null,
        targetUrl: body.targetUrl || null,
        altText: body.altText || null,
        title: body.title || null,
        description: body.description || null,
        buttonText: body.buttonText || null,
        code: body.code || null,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : null,
        isActive: body.isActive,
      },
    });
    return NextResponse.json({ success: true, data: ad });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to update ad" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;
    const body = await req.json();
    const ad = await prisma.adSlot.update({
      where: { id },
      data: { isActive: body.isActive },
    });
    return NextResponse.json({ success: true, data: ad });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update ad" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;
    await prisma.adSlot.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Ad deleted" });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete ad" }, { status: 500 });
  }
}
