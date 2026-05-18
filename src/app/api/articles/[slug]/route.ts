// GET /api/articles/[slug] — get single article (admin only)
// PUT /api/articles/[slug] — update article (admin only)
// DELETE /api/articles/[slug] — soft delete article → archived (admin only)
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/** GET — get single article (admin only, returns regardless of status) */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) return NextResponse.json({ error: "文章不存在" }, { status: 404 });

  return NextResponse.json({ success: true, data: article });
}

/** PUT — update article (admin only) */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  const { slug } = await params;
  const body = await req.json();

  const existing = await prisma.article.findUnique({ where: { slug } });
  if (!existing) return NextResponse.json({ error: "文章不存在" }, { status: 404 });

  const { title, content, excerpt, status, category, seoTitle, seoDescription, coverImage, relatedTools, author } = body;

  // Validation
  if (title !== undefined) {
    if (title.length < 2) return NextResponse.json({ error: "标题至少 2 字" }, { status: 400 });
    if (title.length > 120) return NextResponse.json({ error: "标题最多 120 字" }, { status: 400 });
  }
  if (content !== undefined) {
    if (content.length < 10) return NextResponse.json({ error: "内容至少 10 字" }, { status: 400 });
    if (content.length > 50000) return NextResponse.json({ error: "内容最多 50000 字" }, { status: 400 });
  }
  if (excerpt !== undefined && excerpt.length > 300) return NextResponse.json({ error: "摘要最多 300 字" }, { status: 400 });
  if (seoTitle !== undefined && seoTitle.length > 120) return NextResponse.json({ error: "SEO 标题最多 120 字" }, { status: 400 });
  if (seoDescription !== undefined && seoDescription.length > 300) return NextResponse.json({ error: "SEO 描述最多 300 字" }, { status: 400 });
  if (category !== undefined && category.length > 50) return NextResponse.json({ error: "分类最多 50 字" }, { status: 400 });

  // Determine new status
  const newStatus = status || existing.status;
  const validStatus = ["draft", "published", "archived"].includes(newStatus) ? newStatus : existing.status;

  // Handle publishedAt
  let publishedAt: Date | null | undefined = undefined;
  if (validStatus === "published" && existing.status !== "published") {
    publishedAt = new Date();
  } else if (validStatus !== "published") {
    publishedAt = null;
  }

  const updated = await prisma.article.update({
    where: { slug },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(excerpt !== undefined && { excerpt }),
      ...(category !== undefined && { category }),
      ...(seoTitle !== undefined && { seoTitle }),
      ...(seoDescription !== undefined && { seoDescription }),
      ...(coverImage !== undefined && { coverImage }),
      ...(author !== undefined && { author }),
      ...(relatedTools !== undefined && { relatedTools: Array.isArray(relatedTools) ? relatedTools : [] }),
      status: validStatus,
      ...(publishedAt !== undefined && { publishedAt }),
    },
  });

  return NextResponse.json({ success: true, data: updated });
}

/** DELETE — soft delete: set status = 'archived' (admin only) */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  const { slug } = await params;
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (!existing) return NextResponse.json({ error: "文章不存在" }, { status: 404 });

  await prisma.article.update({
    where: { slug },
    data: { status: "archived", publishedAt: null },
  });

  return NextResponse.json({ success: true, message: "文章已归档（软删除）" });
}
