import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function requireAdmin(session: any) {
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role || "";
  if (!["管理员", "ADMIN", "admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const pageType = searchParams.get("pageType") || undefined;
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;

  const where: any = {};
  if (pageType) where.pageType = pageType;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { slug: { contains: search, mode: "insensitive" as const } },
      { title: { contains: search, mode: "insensitive" as const } },
    ];
  }

  const pages = await prisma.landingPage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, slug: true, title: true, seoTitle: true, seoDescription: true,
      pageType: true, status: true, primaryTool: true, relatedTools: true,
      relatedTopics: true, relatedArticles: true, createdAt: true, publishedAt: true,
      heroSection: true, faqItems: true, officialLinks: true, ctaConfig: true,
    },
  });
  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  const body = await req.json();
  try {
    const page = await prisma.landingPage.create({
      data: {
        slug: body.slug,
        title: body.title,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        pageType: body.pageType || "landing",
        status: body.status || "draft",
        heroSection: body.heroSection || null,
        primaryTool: body.primaryTool || null,
        relatedTools: body.relatedTools || [],
        relatedTopics: body.relatedTopics || [],
        relatedArticles: body.relatedArticles || [],
        faqItems: body.faqItems || null,
        officialLinks: body.officialLinks || null,
        adPlacements: body.adPlacements || null,
        ctaConfig: body.ctaConfig || null,
      },
    });
    return NextResponse.json(page, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: `Slug "${body.slug}" 已存在` }, { status: 409 });
    }
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
