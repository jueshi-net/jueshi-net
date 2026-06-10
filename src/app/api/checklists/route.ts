import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const toolSlug = searchParams.get("toolSlug");

    const where: any = {
      pageType: "checklist",
      status: "published",
    };

    // Filter by relatedTools if toolSlug is provided
    if (toolSlug) {
      where.relatedTools = { has: toolSlug };
    }

    const checklists = await prisma.landingPage.findMany({
      where,
      select: {
        slug: true,
        title: true,
        seoDescription: true,
        heroSection: true,
        publishedAt: true,
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    });

    const data = checklists.map((c) => {
      const hero = (c.heroSection as any) || {};
      return {
        slug: c.slug,
        title: c.title,
        summary: c.seoDescription || "",
        icon: hero.icon || "📋",
        estimatedTime: hero.estimatedTime || "",
        itemCount: hero.sections?.reduce(
          (sum: number, s: any) => sum + (s.items?.length || 0),
          0
        ),
        publishedAt: c.publishedAt,
      };
    });

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("[Checklists API] Error:", err.message);
    return NextResponse.json({ error: "Failed to fetch checklists" }, { status: 500 });
  }
}
