import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slugs = searchParams.get("slugs");

    if (slugs) {
      // Fetch specific checklists by slug
      const slugList = slugs.split(",");
      const checklists = await prisma.landingPage.findMany({
        where: {
          slug: { in: slugList },
          pageType: "checklist",
          status: "published",
        },
        select: {
          slug: true,
          title: true,
          seoDescription: true,
          heroSection: true,
        },
      });
      return NextResponse.json({
        data: checklists.map((c) => ({
          slug: c.slug,
          title: c.title,
          summary: c.seoDescription || "",
          icon: (c.heroSection as any)?.icon || "📋",
        })),
      });
    }

    // Fetch all published checklists
    const checklists = await prisma.landingPage.findMany({
      where: {
        pageType: "checklist",
        status: "published",
      },
      select: {
        slug: true,
        title: true,
        seoDescription: true,
        heroSection: true,
      },
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({
      data: checklists.map((c) => ({
        slug: c.slug,
        title: c.title,
        summary: c.seoDescription || "",
        icon: (c.heroSection as any)?.icon || "📋",
      })),
    });
  } catch (err: any) {
    console.error("[Checklists API] Error:", err.message);
    return NextResponse.json({ error: "Failed to fetch checklists" }, { status: 500 });
  }
}
