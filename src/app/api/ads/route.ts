import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET() {
  try {
    const ads = await prisma.adSlot.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
    return NextResponse.json({ success: true, data: ads });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch ads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const body = await req.json();
    const ad = await prisma.adSlot.create({
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
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });
    return NextResponse.json({ success: true, data: ad });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to create ad" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

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
