import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing link ID" }, { status: 400 });
    }

    const link = await prisma.linkItem.findUnique({
      where: { id },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Generate share data
    const shareData = {
      id: link.id,
      title: link.title,
      url: link.url,
      description: link.description,
      icon: link.icon,
      category: link.categoryName || link.categoryId,
      createdAt: link.createdAt,
      shareUrl: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/share/${link.id}`,
    };

    return NextResponse.json({ link: shareData });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch link" },
      { status: 500 }
    );
  }
}
