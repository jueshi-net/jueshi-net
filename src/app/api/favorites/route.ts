import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

// GET: User's favorites list
export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  const { session } = result;
  const userId = (session.user as any).id;

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      link: {
        include: {
          category: { select: { name: true, icon: true } },
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return NextResponse.json({
    success: true,
    data: favorites.map((f) => ({
      id: f.id,
      linkId: f.link.id,
      title: f.link.title,
      url: f.link.url,
      description: f.link.description || "",
      icon: f.link.icon || "",
      category: f.link.category?.name || "",
      categoryIcon: f.link.category?.icon || "",
      clicks: f.link.clicks || 0,
      createdAt: f.createdAt,
    })),
  });
}

// POST: Add a favorite
export async function POST(req: NextRequest) {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  const { session } = result;
  const userId = (session.user as any).id;
  const body = await req.json();
  const { linkId } = body;

  if (!linkId) {
    return NextResponse.json({ success: false, error: "linkId is required" }, { status: 400 });
  }

  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_linkId: { userId, linkId } },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "Already favorited" }, { status: 409 });
    }

    await prisma.favorite.create({
      data: { userId, linkId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to add favorite" }, { status: 500 });
  }
}

// DELETE: Remove a favorite
export async function DELETE(req: NextRequest) {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  const { session } = result;
  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const linkId = searchParams.get("linkId");

  if (!linkId) {
    return NextResponse.json({ success: false, error: "linkId is required" }, { status: 400 });
  }

  try {
    await prisma.favorite.delete({
      where: { userId_linkId: { userId, linkId } },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to remove favorite" }, { status: 500 });
  }
}
