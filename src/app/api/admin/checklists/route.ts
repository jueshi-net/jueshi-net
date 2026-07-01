import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function requireAdmin(session: any) {
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role || "";
  if (!["管理员", "ADMIN", "admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

interface ChecklistStep {
  title?: string;
  description?: string;
  completed?: boolean;
  optional?: boolean;
  toolLink?: string;
}

interface ChecklistCreateBody {
  title?: string;
  slug?: string;
  summary?: string;
  steps?: ChecklistStep[] | Prisma.InputJsonValue;
  relatedTools?: string[];
  relatedTaskChain?: string;
  relatedGuides?: string[];
  relatedTopics?: string[];
  status?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  robots?: string;
  sortOrder?: number;
  publishedAt?: string | null;
  metadataJson?: any; // v1.20.42.18.6.16.6.72: ContentOps metadata bridge
}

// GET /api/admin/checklists — list checklists with optional status filter
export async function GET(req: NextRequest) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { slug: { contains: search, mode: "insensitive" as const } },
        { title: { contains: search, mode: "insensitive" as const } },
      ];
    }

    const checklists = await prisma.checklist.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, slug: true, title: true, summary: true, steps: true,
        status: true, coverImage: true, seoTitle: true, seoDescription: true,
        canonicalUrl: true, robots: true, sortOrder: true, publishedAt: true,
        createdAt: true, updatedAt: true,
        relatedTools: true, relatedTaskChain: true, relatedGuides: true, relatedTopics: true,
        metadataJson: true, // v1.20.42.18.6.16.6.72: ContentOps metadata bridge
      },
    });
    return NextResponse.json(checklists);
  } catch (e: any) {
    console.error("Admin checklists list error:", e);
    return NextResponse.json({ error: "获取清单列表失败" }, { status: 500 });
  }
}

// POST /api/admin/checklists — create checklist
export async function POST(req: NextRequest) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  try {
    const body = (await req.json()) as ChecklistCreateBody;

    // Validate required fields: title, slug, steps
    if (!body.title || !body.slug || !body.steps) {
      return NextResponse.json(
        { error: "title, slug, steps 为必填字段" },
        { status: 400 }
      );
    }

    const checklist = await prisma.checklist.create({
      data: {
        title: body.title,
        slug: body.slug,
        summary: body.summary || null,
        steps: body.steps as Prisma.InputJsonValue,
        relatedTools: body.relatedTools || [],
        relatedTaskChain: body.relatedTaskChain || null,
        relatedGuides: body.relatedGuides || [],
        relatedTopics: body.relatedTopics || [],
        status: body.status || "draft",
        coverImage: body.coverImage || null,
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
    return NextResponse.json(checklist, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "slug 已存在" }, { status: 409 });
    }
    console.error("Admin checklist create error:", e);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
