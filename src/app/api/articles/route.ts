// GET /api/articles — list articles (admin only)
// POST /api/articles — create new article (admin only)
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** GET — list articles with optional search and status filter (admin only) */
export async function GET(req: NextRequest) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "all";
  const q = searchParams.get("q") || "";

  const where: Record<string, unknown> = {};
  if (status !== "all") where.status = status;
  if (q) where.title = { contains: q, mode: "insensitive" };

  const articles = await prisma.article.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      status: true,
      category: true,
      views: true,
      createdAt: true,
      updatedAt: true,
      publishedAt: true,
    },
  });

  const data = articles.map((a) => ({
    ...a,
    tags: "", // legacy field for backward compat
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    publishedAt: a.publishedAt?.toISOString() || null,
  }));

  return NextResponse.json({ success: true, data });
}

/** POST — create new article (admin only) */
export async function POST(req: NextRequest) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  const body = await req.json();
  const { title, slug, content, excerpt, status, category, seoTitle, seoDescription, coverImage, relatedTools, author } = body;

  // Validation
  if (!title || title.length < 2) return NextResponse.json({ error: "标题至少 2 字" }, { status: 400 });
  if (title.length > 120) return NextResponse.json({ error: "标题最多 120 字" }, { status: 400 });
  if (!slug || slug.length < 3) return NextResponse.json({ error: "Slug 至少 3 字符" }, { status: 400 });
  if (slug.length > 100) return NextResponse.json({ error: "Slug 最多 100 字符" }, { status: 400 });
  if (!SLUG_RE.test(slug)) return NextResponse.json({ error: "Slug 只能包含小写字母、数字和短横线（不能以短横线开头或结尾，不能连续短横线）" }, { status: 400 });
  if (!content || content.length < 10) return NextResponse.json({ error: "内容至少 10 字" }, { status: 400 });
  if (content.length > 50000) return NextResponse.json({ error: "内容最多 50000 字" }, { status: 400 });
  if (excerpt && excerpt.length > 300) return NextResponse.json({ error: "摘要最多 300 字" }, { status: 400 });
  if (seoTitle && seoTitle.length > 120) return NextResponse.json({ error: "SEO 标题最多 120 字" }, { status: 400 });
  if (seoDescription && seoDescription.length > 300) return NextResponse.json({ error: "SEO 描述最多 300 字" }, { status: 400 });
  if (category && category.length > 50) return NextResponse.json({ error: "分类最多 50 字" }, { status: 400 });

  // Check slug uniqueness
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "Slug 已存在" }, { status: 409 });

  const validStatus = ["draft", "published", "archived"].includes(status) ? status : "draft";

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      status: validStatus,
      category: category || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      coverImage: coverImage || null,
      author: author || null,
      relatedTools: Array.isArray(relatedTools) ? relatedTools : [],
      publishedAt: validStatus === "published" ? new Date() : null,
    },
  });

  return NextResponse.json({ success: true, data: article }, { status: 201 });
}
