// Server Component: loads all forum data directly from DB
import { prisma } from "@/lib/prisma";
import ForumAdminClient from "./forum-admin-client";

export const dynamic = "force-dynamic";

async function loadForumData() {
  try {
    const [posts, postStats, comments, commentStats, categories] = await Promise.all([
      // Posts
      prisma.forumPost.findMany({
        include: {
          user: { select: { name: true, email: true } },
          category: { select: { name: true, key: true, iconText: true, color: true } },
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      }),
      // Post stats
      prisma.forumPost.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      // Comments
      prisma.forumComment.findMany({
        include: {
          user: { select: { name: true, email: true } },
          post: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      // Comment stats
      prisma.forumComment.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      // Categories
      prisma.forumCategory.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
    ]);

    const postStatsMap: Record<string, number> = {};
    for (const s of postStats) postStatsMap[s.status] = s._count.status;

    const commentStatsMap: Record<string, number> = {};
    for (const s of commentStats) commentStatsMap[s.status] = s._count.status;

    return {
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        status: p.status,
        isPinned: p.isPinned,
        isLocked: p.isLocked,
        viewCount: p.viewCount,
        commentCount: p.commentCount,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        rewardGrantedAt: p.rewardGrantedAt?.toISOString() ?? null,
        user: { name: p.user.name, email: p.user.email },
        category: { name: p.category.name, key: p.category.key, iconText: p.category.iconText, color: p.category.color },
      })),
      postStats: postStatsMap,
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        status: c.status,
        createdAt: c.createdAt.toISOString(),
        rewardGrantedAt: c.rewardGrantedAt?.toISOString() ?? null,
        user: { name: c.user.name, email: c.user.email },
        post: { title: c.post.title, slug: c.post.slug },
      })),
      commentStats: commentStatsMap,
      categories: categories.map((c) => ({
        id: c.id,
        key: c.key,
        name: c.name,
        description: c.description,
        iconText: c.iconText,
        color: c.color,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
        createdAt: c.createdAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("Forum admin load error:", err);
    return null;
  }
}

export default async function AdminForumPage() {
  const data = await loadForumData();

  return <ForumAdminClient data={data} />;
}
