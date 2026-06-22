import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  PreviewClient,
  type CommunityPreviewV3Data,
  type PreviewPost,
  type PreviewCategory,
  type PreviewTag,
  type PreviewContributor,
} from "./preview-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "社区预览 V3 - 绝世百宝箱",
  description: "社区新版布局预览 V3（仅供视觉审核）",
  robots: { index: false, follow: false },
};

/** Canonical V3 community taxonomy (6 categories). */
const CANONICAL_CATEGORIES: {
  key: string;
  name: string;
  emoji: string;
  color: string;
}[] = [
  { key: "cross-border-life", name: "跨境生活", emoji: "🌍", color: "blue" },
  { key: "tool-usage", name: "工具使用", emoji: "🔧", color: "teal" },
  { key: "logistics-customs", name: "物流报关", emoji: "📦", color: "amber" },
  { key: "suggestion-feedback", name: "建议反馈", emoji: "💡", color: "rose" },
  {
    key: "general-discussion",
    name: "综合讨论",
    emoji: "💬",
    color: "violet",
  },
  { key: "overseas-life", name: "海外生活", emoji: "🏠", color: "emerald" },
];

/** Safely extract a string[] from a Prisma Json? tags field. */
function getTagsArray(tags: unknown): string[] {
  if (!tags || !Array.isArray(tags)) return [];
  return tags
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .slice(0, 4);
}

export default async function CommunityPreviewV3Page() {
  const session = await auth();
  const isSignedIn = !!session;
  const newPostHref = isSignedIn
    ? "/community/new"
    : "/login?callbackUrl=/community/new";

  // ---- Parallel data queries ----
  const [dbCategories, posts, tagAgg, contributors, categoryCounts] =
    await Promise.all([
      prisma.forumCategory.findMany({
        where: { isActive: true },
        select: { id: true, key: true },
      }),
      prisma.forumPost.findMany({
        where: { status: "published" },
        include: {
          user: {
            select: { id: true, name: true, image: true, honorScore: true },
          },
          category: {
            select: { id: true, key: true, name: true, color: true, iconText: true },
          },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        take: 30,
      }),
      // Popular tags: aggregate from recent posts in JS
      prisma.forumPost
        .findMany({
          where: { status: "published" },
          select: { tags: true },
          orderBy: { createdAt: "desc" },
          take: 200,
        })
        .then((results): PreviewTag[] => {
          const counts = new Map<string, number>();
          for (const r of results) {
            for (const t of getTagsArray(r.tags)) {
              counts.set(t, (counts.get(t) || 0) + 1);
            }
          }
          return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([tag, count]) => ({ tag, count }));
        }),
      // Active contributors: top 5 by honorScore
      prisma.user.findMany({
        orderBy: { honorScore: "desc" },
        take: 5,
        select: { id: true, name: true, image: true, honorScore: true },
      }),
      // Posts per category
      prisma.forumPost.groupBy({
        by: ["categoryId"],
        where: { status: "published" },
        _count: { categoryId: true },
      }),
    ]);

  // categoryId -> post count
  const countByCategoryId = new Map<string, number>(
    categoryCounts.map((c) => [c.categoryId, c._count.categoryId]),
  );
  // category key -> post count
  const countByKey = new Map<string, number>();
  for (const c of dbCategories) {
    countByKey.set(c.key, countByCategoryId.get(c.id) ?? 0);
  }
  const totalPosts = Array.from(countByCategoryId.values()).reduce(
    (a, b) => a + b,
    0,
  );

  // Build the 6 canonical categories with real post counts
  const categories: PreviewCategory[] = CANONICAL_CATEGORIES.map((c) => ({
    key: c.key,
    name: c.name,
    emoji: c.emoji,
    color: c.color,
    count: countByKey.get(c.key) ?? 0,
  }));

  // Map posts into serializable shape
  const mappedPosts: PreviewPost[] = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    isPinned: p.isPinned,
    isFeatured: p.isFeatured,
    isSolved: p.isSolved,
    isLocked: p.isLocked,
    viewCount: p.viewCount,
    commentCount: p.commentCount,
    likeCount: p._count.likes,
    createdAt: p.createdAt.toISOString(),
    lastCommentAt: p.lastCommentAt ? p.lastCommentAt.toISOString() : null,
    tags: getTagsArray(p.tags),
    author: {
      id: p.user.id,
      name: p.user.name,
      image: p.user.image,
      honorScore: p.user.honorScore,
    },
    category: {
      id: p.category.id,
      key: p.category.key,
      name: p.category.name,
      color: p.category.color,
      iconText: p.category.iconText,
    },
  }));

  const mappedContributors: PreviewContributor[] = contributors.map((u) => ({
    id: u.id,
    name: u.name,
    image: u.image,
    honorScore: u.honorScore,
  }));

  const data: CommunityPreviewV3Data = {
    categories,
    totalPosts,
    posts: mappedPosts,
    tags: tagAgg,
    contributors: mappedContributors,
    newPostHref,
    isSignedIn,
  };

  return <PreviewClient data={data} />;
}
