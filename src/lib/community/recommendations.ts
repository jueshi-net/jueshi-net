/**
 * Content recommendation engine for the forum.
 *
 * Uses existing fields (viewCount, commentCount, likeCount, bookmarkCount,
 * isFeatured, createdAt, updatedAt) to produce explainable rankings.
 *
 * No random sorting - every score is deterministic and traceable.
 */

import { prisma } from "@/lib/prisma";

// ─── Types ───

export interface RecommendedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  viewCount: number;
  commentCount: number;
  isFeatured: boolean;
  isPinned: boolean;
  createdAt: Date;
  score: number;
  scoreBreakdown: { label: string; value: number }[];
  user: { name: string | null; email: string };
  category: { key: string; name: string };
}

// ─── Time Decay ───

/**
 * Calculate a time-decay factor (0..1) for a post.
 *
 * Posts lose ~50% visibility every 7 days after the first 3 days.
 * Formula: decay = 1 / (1 + max(0, ageDays - 3) / 7)
 *
 * This prevents old posts from permanently dominating rankings.
 */
export function calculateTimeDecay(createdAt: Date, now: Date = new Date()): number {
  const ageMs = now.getTime() - createdAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays <= 3) return 1.0;
  const decay = 1 / (1 + (ageDays - 3) / 7);
  return Math.max(0.01, decay);
}

// ─── Scoring ───

export interface ScoreInput {
  viewCount: number;
  commentCount: number;
  likeCount: number;
  bookmarkCount: number;
  isFeatured: boolean;
  isPinned: boolean;
  createdAt: Date;
}

export interface ScoreResult {
  total: number;
  breakdown: { label: string; value: number }[];
}

/**
 * Calculate a composite engagement score with time decay.
 *
 * Weights:
 *   views:     1 point each (capped at 50 → 50 pts)
 *   comments:  5 points each (capped at 20 → 100 pts)
 *   likes:     3 points each (capped at 30 → 90 pts)
 *   bookmarks: 4 points each (capped at 20 → 80 pts)
 *   featured:  +30 bonus
 *   pinned:    +50 bonus (usually pinned posts stay on top)
 *
 * Total raw score is then multiplied by time decay factor.
 */
export function calculateScore(input: ScoreInput): ScoreResult {
  const views = Math.min(input.viewCount, 50);
  const comments = Math.min(input.commentCount, 20);
  const likes = Math.min(input.likeCount, 30);
  const bookmarks = Math.min(input.bookmarkCount, 20);
  const featuredBonus = input.isFeatured ? 30 : 0;
  const pinnedBonus = input.isPinned ? 50 : 0;

  const rawScore =
    views * 1 +
    comments * 5 +
    likes * 3 +
    bookmarks * 4 +
    featuredBonus +
    pinnedBonus;

  const decay = calculateTimeDecay(input.createdAt);
  const total = Math.round(rawScore * decay * 100) / 100;

  return {
    total,
    breakdown: [
      { label: "浏览", value: views * 1 },
      { label: "回复", value: comments * 5 },
      { label: "点赞", value: likes * 3 },
      { label: "收藏", value: bookmarks * 4 },
      { label: "精华", value: featuredBonus },
      { label: "置顶", value: pinnedBonus },
      { label: "时间衰减", value: Math.round(decay * 100) / 100 },
    ],
  };
}

// ─── Recommendation Functions ───

const COMMON_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  viewCount: true,
  commentCount: true,
  isFeatured: true,
  isPinned: true,
  createdAt: true,
  updatedAt: true,
  tags: true,
  categoryId: true,
  userId: true,
  user: { select: { name: true, email: true } },
  category: { select: { key: true, name: true } },
  _count: {
    select: {
      likes: true,
      bookmarks: true,
    },
  },
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRecommended(post: any): RecommendedPost {
  const score = calculateScore({
    viewCount: post.viewCount,
    commentCount: post.commentCount,
    likeCount: post._count?.likes ?? 0,
    bookmarkCount: post._count?.bookmarks ?? 0,
    isFeatured: post.isFeatured,
    isPinned: post.isPinned,
    createdAt: post.createdAt,
  });

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    viewCount: post.viewCount,
    commentCount: post.commentCount,
    isFeatured: post.isFeatured,
    isPinned: post.isPinned,
    createdAt: post.createdAt,
    score: score.total,
    scoreBreakdown: score.breakdown,
    user: { name: post.user.name, email: post.user.email },
    category: post.category,
  };
}

/**
 * Today's hot posts (created in last 24h, ranked by engagement score).
 */
export async function getTodaysHot(limit = 10): Promise<RecommendedPost[]> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const posts = await prisma.forumPost.findMany({
    where: {
      status: "published",
      createdAt: { gte: yesterday },
    },
    orderBy: [{ isPinned: "desc" }, { viewCount: "desc" }],
    take: limit * 3, // fetch more, then re-rank by score
    select: COMMON_SELECT,
  });

  return posts
    .map(toRecommended)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Weekly hot posts (created in last 7 days, ranked by engagement score).
 */
export async function getWeeklyHot(limit = 10): Promise<RecommendedPost[]> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const posts = await prisma.forumPost.findMany({
    where: {
      status: "published",
      createdAt: { gte: weekAgo },
    },
    orderBy: [{ isPinned: "desc" }, { viewCount: "desc" }],
    take: limit * 3,
    select: COMMON_SELECT,
  });

  return posts
    .map(toRecommended)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Latest discussions (newest first, no scoring).
 */
export async function getLatestDiscussions(limit = 10): Promise<RecommendedPost[]> {
  const posts = await prisma.forumPost.findMany({
    where: { status: "published" },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: COMMON_SELECT,
  });

  return posts.map(toRecommended);
}

/**
 * Most replied posts (ranked by commentCount with time decay).
 */
export async function getMostReplied(limit = 10): Promise<RecommendedPost[]> {
  const posts = await prisma.forumPost.findMany({
    where: { status: "published", commentCount: { gt: 0 } },
    orderBy: [{ commentCount: "desc" }],
    take: limit * 3,
    select: COMMON_SELECT,
  });

  return posts
    .map(toRecommended)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * High-quality featured posts (isFeatured=true, ranked by score).
 */
export async function getFeaturedQuality(limit = 10): Promise<RecommendedPost[]> {
  const posts = await prisma.forumPost.findMany({
    where: { status: "published", isFeatured: true },
    orderBy: [{ createdAt: "desc" }],
    take: limit * 2,
    select: COMMON_SELECT,
  });

  return posts
    .map(toRecommended)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Unanswered posts (commentCount=0, published, oldest first for visibility).
 */
export async function getUnanswered(limit = 10): Promise<RecommendedPost[]> {
  const posts = await prisma.forumPost.findMany({
    where: { status: "published", commentCount: 0 },
    orderBy: [{ createdAt: "asc" }],
    take: limit,
    select: COMMON_SELECT,
  });

  return posts.map(toRecommended);
}

/**
 * Same-category recommendations.
 */
export async function getByCategory(categoryKey: string, excludeSlug?: string, limit = 5): Promise<RecommendedPost[]> {
  const posts = await prisma.forumPost.findMany({
    where: {
      status: "published",
      category: { key: categoryKey },
      ...(excludeSlug ? { slug: { not: excludeSlug } } : {}),
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: limit * 2,
    select: COMMON_SELECT,
  });

  return posts
    .map(toRecommended)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Same-tag recommendations.
 */
export async function getByTag(tag: string, excludeSlug?: string, limit = 5): Promise<RecommendedPost[]> {
  // Json array 'has' filter requires string_contains on PostgreSQL
  // Use raw filter approach for JSONB array containment
  const posts = await prisma.forumPost.findMany({
    where: {
      status: "published",
      // @ts-expect-error - Prisma JSON filter for array containment
      tags: { string_contains: tag },
      ...(excludeSlug ? { slug: { not: excludeSlug } } : {}),
    },
    orderBy: [{ createdAt: "desc" }],
    take: limit * 2,
    select: COMMON_SELECT,
  });

  // Filter in memory to ensure exact tag match
  const filtered = posts.filter((p) => {
    const tags = p.tags as string[] | null;
    return tags && tags.includes(tag);
  });

  return filtered
    .map(toRecommended)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * New-user friendly content: featured + well-answered (isSolved=true) posts.
 */
export async function getNewUserFriendly(limit = 10): Promise<RecommendedPost[]> {
  const posts = await prisma.forumPost.findMany({
    where: {
      status: "published",
      OR: [
        { isFeatured: true },
        { isSolved: true },
      ],
    },
    orderBy: [{ isFeatured: "desc" }, { commentCount: "desc" }],
    take: limit * 2,
    select: COMMON_SELECT,
  });

  return posts
    .map(toRecommended)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ─── Contributor Ranking ───

export interface ContributorRank {
  userId: string;
  name: string | null;
  email: string;
  postCount: number;
  commentCount: number;
  acceptedAnswerCount: number;
  featuredPostCount: number;
  honorScore: number;
  totalScore: number;
  rank: number;
}

/**
 * Get top contributors based on CommunityStat + honor score.
 *
 * Score = postCount*2 + commentCount*1 + acceptedAnswerCount*5 + featuredPostCount*3 + honorScore*1
 */
export async function getTopContributors(limit = 10): Promise<ContributorRank[]> {
  const stats = await prisma.communityStat.findMany({
    where: {
      OR: [
        { postCount: { gt: 0 } },
        { commentCount: { gt: 0 } },
        { acceptedAnswerCount: { gt: 0 } },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          honorScore: true,
        },
      },
    },
    take: limit * 3,
  });

  const ranked = stats
    .map((s) => {
      const postScore = s.postCount * 2;
      const commentScore = s.commentCount * 1;
      const answerScore = s.acceptedAnswerCount * 5;
      const featuredScore = s.featuredPostCount * 3;
      const honorScore = s.user.honorScore || 0;
      const totalScore = postScore + commentScore + answerScore + featuredScore + honorScore;

      return {
        userId: s.userId,
        name: s.user.name,
        email: s.user.email,
        postCount: s.postCount,
        commentCount: s.commentCount,
        acceptedAnswerCount: s.acceptedAnswerCount,
        featuredPostCount: s.featuredPostCount,
        honorScore: s.user.honorScore || 0,
        totalScore,
        rank: 0,
      } satisfies ContributorRank;
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit);

  ranked.forEach((r, i) => {
    r.rank = i + 1;
  });

  return ranked;
}
