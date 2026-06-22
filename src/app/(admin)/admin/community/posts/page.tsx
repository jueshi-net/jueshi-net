import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPostsManager } from "./posts-client";

export const dynamic = "force-dynamic";

export default async function AdminCommunityPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/login");

  const { q, category, status } = await searchParams;

  const where: any = {};
  if (status) where.status = status;
  if (category) where.category = { key: category };
  if (q && q.trim()) where.title = { contains: q.trim(), mode: "insensitive" };

  const [posts, categories] = await Promise.all([
    prisma.forumPost.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, image: true } },
        category: true,
        _count: { select: { comments: true, reports: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.forumCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, key: true },
    }),
  ]);

  return (
    <AdminPostsManager
      posts={posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        status: p.status,
        isPinned: p.isPinned,
        isLocked: p.isLocked,
        isFeatured: p.isFeatured,
        viewCount: p.viewCount,
        createdAt: p.createdAt.toISOString(),
        user: { name: p.user.name, email: p.user.email, image: p.user.image },
        category: { name: p.category.name, key: p.category.key },
        _count: { comments: p._count.comments, reports: p._count.reports },
      }))}
      currentStatus={status || ""}
      currentCategory={category || ""}
      currentQ={q || ""}
      categories={categories}
    />
  );
}
