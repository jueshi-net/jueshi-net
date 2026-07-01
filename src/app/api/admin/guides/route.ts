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

interface GuideCreateBody {
  title?: string;
  slug?: string;
  summary?: string;
  body?: string;
  category?: string;
  tags?: string[];
  relatedTools?: string[];
  relatedTopics?: string[];
  relatedChecklists?: string[];
  relatedGuides?: string[];
  status?: string;
  coverImage?: string;
  author?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  robots?: string;
  sortOrder?: number;
  publishedAt?: string | null;
  metadataJson?: any; // v1.20.42.18.6.16.6.72: ContentOps metadata bridge
}

// GET /api/admin/guides — list guides with optional status/category filters
export async function GET(req: NextRequest) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { slug: { contains: search, mode: "insensitive" as const } },
        { title: { contains: search, mode: "insensitive" as const } },
      ];
    }

    const guides = await prisma.guide.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, slug: true, title: true, summary: true, category: true,
        tags: true, status: true, coverImage: true, author: true,
        seoTitle: true, seoDescription: true, canonicalUrl: true, robots: true,
        sortOrder: true, publishedAt: true, createdAt: true, updatedAt: true,
        relatedTools: true, relatedTopics: true, relatedChecklists: true, relatedGuides: true,
        metadataJson: true, // v1.20.42.18.6.16.6.72: ContentOps metadata bridge
      },
    });
    return NextResponse.json(guides);
  } catch (e: any) {
    console.error("Admin guides list error:", e);
    return NextResponse.json({ error: "获取指南列表失败" }, { status: 500 });
  }
}

// POST /api/admin/guides — create guide
export async function POST(req: NextRequest) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  try {
    const body = (await req.json()) as GuideCreateBody;

    // Validate required fields
    if (!body.title || !body.slug || !body.body) {
      return NextResponse.json(
        { error: "title, slug, body 为必填字段" },
        { status: 400 }
      );
    }

    const guide = await prisma.guide.create({
      data: {
        title: body.title,
        slug: body.slug,
        summary: body.summary || null,
        body: body.body,
        category: body.category || "general",
        tags: body.tags || [],
        relatedTools: body.relatedTools || [],
        relatedTopics: body.relatedTopics || [],
        relatedChecklists: body.relatedChecklists || [],
        relatedGuides: body.relatedGuides || [],
        status: body.status || "draft",
        coverImage: body.coverImage || null,
        author: body.author || null,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        canonicalUrl: body.canonicalUrl || null,
        robots: body.robots || "index,follow",
        sortOrder: body.sortOrder ?? 0,
        metadataJson: body.metadataJson || null, // v1.20.42.18.6.16.6.72: ContentOps metadata bridge
        // When status is "published", set publishedAt to now() if not already set
        ...(body.status === "published" && !body.publishedAt && { publishedAt: new Date() }),
      },
    });
    return NextResponse.json(guide, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "slug 已存在" }, { status: 409 });
    }
    console.error("Admin guide create error:", e);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
