import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Redirect endpoint with click tracking
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const link = await prisma.linkItem.findUnique({ where: { id } });
    if (!link) {
      return NextResponse.json({ success: false, error: "Link not found" }, { status: 404 });
    }

    // Increment click count
    await prisma.linkItem.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });

    return NextResponse.redirect(link.url);
  } catch {
    return NextResponse.json({ success: false, error: "Failed to redirect" }, { status: 500 });
  }
}
