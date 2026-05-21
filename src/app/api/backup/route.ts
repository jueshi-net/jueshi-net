import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Full database backup export (admin only)
export async function GET() {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const [categories, links, users, articles, adSlots, favorites, memos, tags, articleTags] = await Promise.all([
      prisma.category.findMany({ include: { _count: { select: { links: true } } } }),
      prisma.linkItem.findMany({ include: { category: true, favorites: true } }),
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } }),
      prisma.article.findMany({}),
      prisma.adCampaign.findMany(),
      prisma.favorite.findMany(),
      prisma.memo.findMany(),
      prisma.tag.findMany(),
      prisma.articleTag.findMany(),
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
      data: {
        categories,
        links,
        users,
        articles,
        adSlots,
        favorites,
        memos,
        tags,
        articleTags,
      },
      stats: {
        categories: categories.length,
        links: links.length,
        users: users.length,
        articles: articles.length,
        adSlots: adSlots.length,
        favorites: favorites.length,
        memos: memos.length,
        tags: tags.length,
      },
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="kjbxb-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Backup failed" }, { status: 500 });
  }
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  return { session };
}
