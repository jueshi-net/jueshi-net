import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";
    const type = searchParams.get("type") || "PUBLIC";

    const links = await prisma.linkItem.findMany({
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }],
    });

    if (format === "csv") {
      const headers = ["ID", "Title", "URL", "Description", "Category", "Clicks", "Created"];
      const rows = links.map((l) => [
        l.id,
        `"${l.title}"`,
        l.url,
        `"${l.description || ""}"`,
        `"${l.category?.name || ""}"`,
        l.clicks.toString(),
        l.createdAt.toISOString(),
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="links-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // JSON export
    return NextResponse.json({ success: true, data: links, count: links.length });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to export" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const body = await req.json();
    const { links } = body;

    if (!Array.isArray(links) || links.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;

    for (const link of links) {
      if (!link.title || !link.url) {
        skipped++;
        continue;
      }

      const existing = await prisma.linkItem.findFirst({
        where: { title: link.title, url: link.url },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.linkItem.create({
        data: {
          title: link.title,
          url: link.url,
          description: link.description || null,
          icon: link.icon || null,
          sortOrder: link.sortOrder || 0,
        },
      });
      created++;
    }

    return NextResponse.json({ success: true, data: { created, skipped } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to import" }, { status: 500 });
  }
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdminRole((session.user as any).role)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  return { session };
}
