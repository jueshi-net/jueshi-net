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

interface GuideUpdateBody {
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
  coverImage?: string | null;
  author?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  robots?: string;
  sortOrder?: number;
  publishedAt?: string | null;
  metadataJson?: any; // v1.20.42.18.6.16.6.72: ContentOps metadata bridge
}

// GET /api/admin/guides/[id] — single guide
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  try {
    const { id } = await params;
    const guide = await prisma.guide.findUnique({ where: { id } });
    if (!guide) {
      return NextResponse.json({ error: "指南不存在" }, { status: 404 });
    }
    return NextResponse.json(guide);
  } catch (e: any) {
    console.error("Admin guide get error:", e);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// PUT /api/admin/guides/[id] — update guide
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  try {
    const { id } = await params;
    const body = (await req.json()) as GuideUpdateBody;

    // If status is being changed to "published", set publishedAt to now() if not already set
    let publishedAtValue: Date | undefined = undefined;
    if (body.status === "published") {
      // Check current record to avoid overwriting an existing publishedAt
      const existing = await prisma.guide.findUnique({
        where: { id },
        select: { publishedAt: true },
      });
      if (!existing) {
        return NextResponse.json({ error: "指南不存在" }, { status: 404 });
      }
      if (!existing.publishedAt && !body.publishedAt) {
        publishedAtValue = new Date();
      }
    }

    const guide = await prisma.guide.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.summary !== undefined && { summary: body.summary }),
        ...(body.body !== undefined && { body: body.body }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.relatedTools !== undefined && { relatedTools: body.relatedTools }),
        ...(body.relatedTopics !== undefined && { relatedTopics: body.relatedTopics }),
        ...(body.relatedChecklists !== undefined && { relatedChecklists: body.relatedChecklists }),
        ...(body.relatedGuides !== undefined && { relatedGuides: body.relatedGuides }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
        ...(body.author !== undefined && { author: body.author }),
        ...(body.seoTitle !== undefined && { seoTitle: body.seoTitle }),
        ...(body.seoDescription !== undefined && { seoDescription: body.seoDescription }),
        ...(body.canonicalUrl !== undefined && { canonicalUrl: body.canonicalUrl }),
        ...(body.robots !== undefined && { robots: body.robots }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.metadataJson !== undefined && { metadataJson: body.metadataJson }),
        ...(publishedAtValue && { publishedAt: publishedAtValue }),
      },
    });
    return NextResponse.json(guide);
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "slug 已存在" }, { status: 409 });
    }
    if (e.code === "P2025") {
      return NextResponse.json({ error: "指南不存在" }, { status: 404 });
    }
    console.error("Admin guide update error:", e);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// DELETE /api/admin/guides/[id] — delete guide
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  try {
    const { id } = await params;
    await prisma.guide.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === "P2025") {
      return NextResponse.json({ error: "指南不存在" }, { status: 404 });
    }
    console.error("Admin guide delete error:", e);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
