import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: List all destinations
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const destinations = await prisma.destination.findMany({
    include: {
      _count: { select: { tools: true, guides: true, services: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { region: "asc" }],
  });

  return NextResponse.json({ success: true, data: destinations });
}

// POST: Create a new destination
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { slug, name, nameEn, currency, region, emoji, heroTitle, heroSubtitle, seoTitle, seoDescription, keywords, keyCities, userCount, docCount } = body;

  if (!slug || !name || !nameEn) {
    return NextResponse.json({ success: false, error: "slug, name, nameEn are required" }, { status: 400 });
  }

  try {
    const dest = await prisma.destination.create({
      data: {
        slug, name, nameEn, currency: currency || "", region: region || "",
        emoji: emoji || "", heroTitle: heroTitle || name,
        heroSubtitle: heroSubtitle || "", seoTitle: seoTitle || "",
        seoDescription: seoDescription || "", keywords: keywords || [],
        keyCities: keyCities || [], userCount: userCount || "0",
        docCount: docCount || "0",
      },
    });
    return NextResponse.json({ success: true, data: dest });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ success: false, error: "slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// PUT: Update a destination
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

  const dest = await prisma.destination.update({
    where: { id },
    data: {
      name: data.name, nameEn: data.nameEn, currency: data.currency,
      region: data.region, emoji: data.emoji, heroTitle: data.heroTitle,
      heroSubtitle: data.heroSubtitle, seoTitle: data.seoTitle,
      seoDescription: data.seoDescription, keywords: data.keywords,
      keyCities: data.keyCities, userCount: data.userCount,
      docCount: data.docCount, isActive: data.isActive,
      sortOrder: data.sortOrder,
    },
  });

  return NextResponse.json({ success: true, data: dest });
}

// PATCH: Toggle isActive
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { id, isActive } = body;
  if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

  const dest = await prisma.destination.update({
    where: { id },
    data: { isActive },
  });

  return NextResponse.json({ success: true, data: dest });
}

// DELETE: Remove a destination
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

  await prisma.destination.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
