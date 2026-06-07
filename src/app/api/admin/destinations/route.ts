import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function adminCheck() {
  return (async () => {
    const session = await auth();
    if (!session?.user || (session.user as any).role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }
    return null;
  })();
}

// GET: List all destinations OR get single by slug/id
export async function GET(req: NextRequest) {
  const denied = await adminCheck();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const slug = searchParams.get("slug");

  // Single destination lookup by slug
  if (slug) {
    const dest = await prisma.destination.findUnique({
      where: { slug },
      include: {
        tools: { orderBy: { sortOrder: "asc" } },
        guides: { orderBy: { sortOrder: "asc" } },
        services: { orderBy: { sortOrder: "asc" } },
      },
    });
    return NextResponse.json({ success: true, data: dest });
  }

  // Single destination lookup by id
  if (id) {
    const dest = await prisma.destination.findUnique({
      where: { id },
      include: {
        tools: { orderBy: { sortOrder: "asc" } },
        guides: { orderBy: { sortOrder: "asc" } },
        services: { orderBy: { sortOrder: "asc" } },
      },
    });
    return NextResponse.json({ success: true, data: dest });
  }

  // List all
  const destinations = await prisma.destination.findMany({
    include: {
      _count: { select: { tools: true, guides: true, services: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { region: "asc" }],
  });

  return NextResponse.json({ success: true, data: destinations });
}

// POST: Create or full upsert (with children)
export async function POST(req: NextRequest) {
  const denied = await adminCheck();
  if (denied) return denied;

  const body = await req.json();
  const { slug, name, nameEn, currency, region, emoji, heroTitle, heroSubtitle, seoTitle, seoDescription, keywords, keyCities, userCount, docCount, isActive, tools, guides, services } = body;

  if (!slug || !name || !nameEn) {
    return NextResponse.json({ success: false, error: "slug, name, nameEn are required" }, { status: 400 });
  }

  try {
    const dest = await prisma.$transaction(async (tx) => {
      const d = await tx.destination.upsert({
        where: { slug },
        create: {
          slug, name, nameEn, currency: currency || "", region: region || "",
          emoji: emoji || "", heroTitle: heroTitle || name,
          heroSubtitle: heroSubtitle || "", seoTitle: seoTitle || "",
          seoDescription: seoDescription || "", keywords: keywords || [],
          keyCities: keyCities || [], userCount: userCount || "0",
          docCount: docCount || "0", isActive: isActive ?? true,
        },
        update: {
          name, nameEn, currency, region, emoji, heroTitle,
          heroSubtitle, seoTitle, seoDescription, keywords,
          keyCities, userCount, docCount, isActive: isActive ?? true,
        },
      });

      // Sync children (delete + recreate for idempotency)
      await tx.destinationTool.deleteMany({ where: { destinationId: d.id } });
      await tx.destinationGuide.deleteMany({ where: { destinationId: d.id } });
      await tx.destinationService.deleteMany({ where: { destinationId: d.id } });

      if (tools?.length) {
        await tx.destinationTool.createMany({
          data: (tools as string[]).map((toolSlug, i) => ({ destinationId: d.id, toolSlug, sortOrder: i })),
        });
      }
      if (guides?.length) {
        await tx.destinationGuide.createMany({
          data: (guides as any[]).map((g, i) => ({ destinationId: d.id, title: g.title, description: g.description, type: g.type, sortOrder: i })),
        });
      }
      if (services?.length) {
        await tx.destinationService.createMany({
          data: (services as any[]).map((s, i) => ({ destinationId: d.id, title: s.title, category: s.category, description: s.description, sortOrder: i })),
        });
      }

      return tx.destination.findUnique({
        where: { id: d.id },
        include: {
          tools: { orderBy: { sortOrder: "asc" } },
          guides: { orderBy: { sortOrder: "asc" } },
          services: { orderBy: { sortOrder: "asc" } },
        },
      });
    });

    return NextResponse.json({ success: true, data: dest });
  } catch (e: any) {
    console.error('[Destinations API Error]:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// PUT: Update destination with full children sync
export async function PUT(req: NextRequest) {
  const denied = await adminCheck();
  if (denied) return denied;

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

  try {
    const dest = await prisma.$transaction(async (tx) => {
      const d = await tx.destination.update({
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

      // Full sync children
      if (data.tools !== undefined) {
        await tx.destinationTool.deleteMany({ where: { destinationId: id } });
        if (data.tools.length) {
          await tx.destinationTool.createMany({
            data: (data.tools as string[]).map((toolSlug, i) => ({ destinationId: id, toolSlug, sortOrder: i })),
          });
        }
      }
      if (data.guides !== undefined) {
        await tx.destinationGuide.deleteMany({ where: { destinationId: id } });
        if (data.guides.length) {
          await tx.destinationGuide.createMany({
            data: (data.guides as any[]).map((g, i) => ({ destinationId: id, title: g.title, description: g.description, type: g.type, sortOrder: i })),
          });
        }
      }
      if (data.services !== undefined) {
        await tx.destinationService.deleteMany({ where: { destinationId: id } });
        if (data.services.length) {
          await tx.destinationService.createMany({
            data: (data.services as any[]).map((s, i) => ({ destinationId: id, title: s.title, category: s.category, description: s.description, sortOrder: i })),
          });
        }
      }

      return tx.destination.findUnique({
        where: { id },
        include: {
          tools: { orderBy: { sortOrder: "asc" } },
          guides: { orderBy: { sortOrder: "asc" } },
          services: { orderBy: { sortOrder: "asc" } },
        },
      });
    });

    return NextResponse.json({ success: true, data: dest });
  } catch (e: any) {
    console.error('[Destinations API PUT Error]:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// PATCH: Toggle isActive
export async function PATCH(req: NextRequest) {
  const denied = await adminCheck();
  if (denied) return denied;

  const body = await req.json();
  const { id, isActive } = body;
  if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

  const dest = await prisma.destination.update({
    where: { id },
    data: { isActive },
  });

  return NextResponse.json({ success: true, data: dest });
}

// DELETE: Remove destination
export async function DELETE(req: NextRequest) {
  const denied = await adminCheck();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

  await prisma.destination.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
