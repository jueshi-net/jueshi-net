import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const slugs = request.nextUrl.searchParams.get("slugs");
  if (!slugs) {
    return NextResponse.json([]);
  }

  const slugList = slugs.split(",").map(s => s.trim()).filter(Boolean);

  const articles = await prisma.article.findMany({
    where: {
      slug: { in: slugList },
      status: "published",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
    },
  });

  // Preserve order from the input slugs
  const ordered = slugList.map(slug => articles.find(a => a.slug === slug)).filter(Boolean);

  return NextResponse.json(ordered);
}
