import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

// Export links as JSON or CSV
export async function GET(req: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if ("json" in adminCheck && !(adminCheck as any).session) return adminCheck as any;

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";
    const categoryId = searchParams.get("categoryId");

    const where: Record<string, unknown> = {};
    if (categoryId) {
      (where as any).categoryId = categoryId;
    }

    const links = await prisma.linkItem.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });

    if (format === "csv") {
      const header = "title,url,description,icon,category,sortOrder,isFeatured,status,clicks\n";
      const rows = links.map((link) => {
        const fields = [
          `"${(link.title || "").replace(/"/g, '""')}"`,
          `"${(link.url || "").replace(/"/g, '""')}"`,
          `"${(link.description || "").replace(/"/g, '""')}"`,
          `"${link.icon || ""}"`,
          `"${link.category?.name || ""}"`,
          String(link.sortOrder || 0),
          String(link.isFeatured || false),
          link.status || "active",
          String(link.clicks || 0),
        ];
        return fields.join(",");
      }).join("\n");

      return new Response(header + rows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="links-export-${Date.now()}.csv"`,
        },
      });
    }

    // JSON export
    return NextResponse.json({
      success: true,
      count: links.length,
      data: links.map((link) => ({
        title: link.title,
        url: link.url,
        description: link.description || "",
        icon: link.icon || "",
        category: link.category?.name || "",
        sortOrder: link.sortOrder || 0,
        isFeatured: link.isFeatured || false,
        status: link.status || "active",
      })),
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ success: false, error: "Failed to export" }, { status: 500 });
  }
}

// Import links from JSON
export async function POST(req: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if ("json" in adminCheck && !(adminCheck as any).session) return adminCheck as any;

    const body = await req.json();
    const { links: importLinks, mode = "upsert" } = body as { links: Array<{ title: string; url: string; description?: string; icon?: string; category?: string; sortOrder?: number; isFeatured?: boolean; status?: string }>; mode?: string };

    if (!Array.isArray(importLinks) || importLinks.length === 0) {
      return NextResponse.json({ success: false, error: "No links provided" }, { status: 400 });
    }

    // Fetch existing categories for mapping
    const categories = await prisma.category.findMany();
    const categoryMap = new Map<string, string>(categories.map((c) => [c.name.toLowerCase(), c.id as string]));

    const results = { created: 0, updated: 0, skipped: 0, errors: [] as string[] };

    for (const item of importLinks as any[]) {
      if (!(item as any).title || !(item as any).url) {
        results.skipped++;
        continue;
      }

      try {
        // Find or create category
        let categoryId: string | null = null;
        if ((item as any).category) {
          const found = categoryMap.get(String((item as any).category).toLowerCase());
          if (found) categoryId = found;
        }

        if (mode === "upsert") {
          // Check if link with same URL exists
          const existing = await prisma.linkItem.findFirst({
            where: { url: item.url },
          });

          if (existing) {
            await prisma.linkItem.update({
              where: { id: existing.id },
              data: {
                title: item.title,
                description: item.description || "",
                icon: item.icon || "",
                categoryId,
                sortOrder: item.sortOrder ?? 0,
                isFeatured: item.isFeatured ?? false,
                status: item.status || "active",
              },
            });
            results.updated++;
          } else {
            await prisma.linkItem.create({
              data: {
                title: item.title,
                url: item.url,
                description: item.description || "",
                icon: item.icon || "",
                categoryId,
                sortOrder: item.sortOrder ?? 0,
                isFeatured: item.isFeatured ?? false,
                status: item.status || "active",
              },
            });
            results.created++;
          }
        } else {
          // Create only mode
          await prisma.linkItem.create({
            data: {
              title: item.title,
              url: item.url,
              description: item.description || "",
              icon: item.icon || "",
              categoryId,
              sortOrder: item.sortOrder ?? 0,
              isFeatured: item.isFeatured ?? false,
              status: item.status || "active",
            },
          });
          results.created++;
        }
      } catch (err: any) {
        results.errors.push(`${item.title || 'unknown'}: ${err.message || String(err)}`);
        results.skipped++;
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json({ success: false, error: "Failed to import" }, { status: 500 });
  }
}
