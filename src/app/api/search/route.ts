import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import PinyinMatch from "pinyin-match";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";

    if (!query && !category) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Always fetch all links when there's a query (for pinyin matching)
    // or filter by category
    const where: Record<string, unknown> = { status: "active" };

    if (category) {
      (where as any).category = { slug: category };
    }

    const allLinks = await prisma.linkItem.findMany({
      where,
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }],
    });

    let results = allLinks;

    if (query) {
      const q = query.trim().toLowerCase();

      results = allLinks.filter((link) => {
        // Direct text match (case-insensitive)
        if (
          link.title.toLowerCase().includes(q) ||
          (link.description && link.description.toLowerCase().includes(q)) ||
          link.url.toLowerCase().includes(q)
        ) {
          return true;
        }

        // Pinyin match on title and description
        if (PinyinMatch.match(link.title, query.trim()) !== false) {
          return true;
        }
        if (link.description && PinyinMatch.match(link.description, query.trim()) !== false) {
          return true;
        }

        return false;
      });

      // Sort: direct match first, then pinyin match
      results.sort((a, b) => {
        const aDirect =
          a.title.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          a.url.toLowerCase().includes(q);
        const bDirect =
          b.title.toLowerCase().includes(q) ||
          (b.description && b.description.toLowerCase().includes(q)) ||
          b.url.toLowerCase().includes(q);

        if (aDirect && !bDirect) return -1;
        if (!aDirect && bDirect) return 1;
        return 0;
      });

      // Limit results
      results = results.slice(0, 50);
    }

    return NextResponse.json({ success: true, data: results });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to search" }, { status: 500 });
  }
}
