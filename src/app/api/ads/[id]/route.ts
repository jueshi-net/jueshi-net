import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const ad = await prisma.adSlot.findUnique({ where: { id } });
    if (!ad) return NextResponse.json({ success: false, error: "Ad not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: ad });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch ad" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const ad = await prisma.adSlot.update({
      where: { id },
      data: {
        name: body.name,
        position: body.position,
        imageUrl: body.imageUrl,
        linkUrl: body.linkUrl,
        altText: body.altText,
        isActive: body.isActive,
      },
    });
    return NextResponse.json({ success: true, data: ad });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update ad" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.adSlot.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Ad deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete ad" }, { status: 500 });
  }
}
