import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET() {
  try {
    const ads = await prisma.adSlot.findMany({
      orderBy: [{ position: "asc" }],
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
        imageUrl: body.imageUrl || "",
        linkUrl: body.linkUrl || "",
        altText: body.altText || "",
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });
    return NextResponse.json({ success: true, data: ad });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create ad" }, { status: 500 });
  }
}
