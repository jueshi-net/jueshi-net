/**
 * Forum V1.5 - Badge System
 *
 * Provides:
 * - ensureForumBadges(): Creates forum badge definitions if they don't exist (idempotent upsert)
 * - checkAndGrantForumBadges(): Checks conditions and auto-grants badges
 *
 * Forum badges (5 types):
 *   first_post        - First published post (already seeded, but ensured here)
 *   helpful_answer    - First accepted answer (already seeded, but ensured here)
 *   forum_featured_author - First featured post (NEW)
 *   forum_active_30   - 10+ posts in 30 days (NEW)
 *   forum_helpful_50  - 50+ total likes received (NEW)
 *
 * No schema changes required. Uses existing UserBadge + UserBadgeAward models.
 */

import { prisma } from "@/lib/prisma";

// ─── Badge Definitions ──────────────────────────────────

export interface ForumBadgeDef {
  key: string;
  name: string;
  description: string;
  iconText: string;
  color: string;
  category: string; // "forum"
  conditionText: string;
  sortOrder: number;
}

export const FORUM_BADGES: ForumBadgeDef[] = [
  {
    key: "first_post",
    name: "初露锋芒",
    description: "发布首篇审核通过的帖子",
    iconText: "✍️",
    color: "blue-500",
    category: "forum",
    conditionText: "发布第一篇社区帖",
    sortOrder: 110,
  },
  {
    key: "helpful_answer",
    name: "初次解答",
    description: "回答首次被采纳为最佳答案",
    iconText: "💬",
    color: "teal-500",
    category: "forum",
    conditionText: "回答首次被采纳",
    sortOrder: 120,
  },
  {
    key: "forum_featured_author",
    name: "精华作者",
    description: "帖子首次被设为精华",
    iconText: "⭐",
    color: "amber-500",
    category: "forum",
    conditionText: "帖子首次被加精",
    sortOrder: 130,
  },
  {
    key: "forum_active_30",
    name: "活跃达人",
    description: "30 天内发布 10+ 帖子",
    iconText: "🔥",
    color: "rose-500",
    category: "forum",
    conditionText: "30天内发布10篇以上帖子",
    sortOrder: 140,
  },
  {
    key: "forum_helpful_50",
    name: "热心助人",
    description: "累计获得 50+ 点赞",
    iconText: "❤️",
    color: "pink-500",
    category: "forum",
    conditionText: "累计获得50个以上点赞",
    sortOrder: 150,
  },
];

// ─── Ensure Badges Exist (idempotent) ────────────────────

let ensurePromise: Promise<void> | null = null;

/**
 * Ensures all forum badge definitions exist in the database.
 * Uses upsert so it's safe to call multiple times - no seed/migration needed.
 * Cached via a module-level promise to avoid repeated DB calls within the same request cycle.
 */
export async function ensureForumBadges(tx?: any): Promise<void> {
  // If inside a transaction, don't use cache
  if (tx) {
    for (const def of FORUM_BADGES) {
      await tx.userBadge.upsert({
        where: { key: def.key },
        create: {
          key: def.key,
          name: def.name,
          description: def.description,
          iconText: def.iconText,
          color: def.color,
          category: def.category,
          conditionText: def.conditionText,
          isActive: true,
          sortOrder: def.sortOrder,
        },
        update: {}, // Don't overwrite if exists
      });
    }
    return;
  }

  // Outside transaction: use cached promise
  if (!ensurePromise) {
    ensurePromise = doEnsureForumBadges().catch((err) => {
      ensurePromise = null; // Reset on failure so next call can retry
      throw err;
    });
  }
  return ensurePromise;
}

async function doEnsureForumBadges(): Promise<void> {
  for (const def of FORUM_BADGES) {
    await prisma.userBadge.upsert({
      where: { key: def.key },
      create: {
        key: def.key,
        name: def.name,
        description: def.description,
        iconText: def.iconText,
        color: def.color,
        category: def.category,
        conditionText: def.conditionText,
        isActive: true,
        sortOrder: def.sortOrder,
      },
      update: {}, // Don't overwrite if exists
    });
  }
}

// ─── Badge Granting ──────────────────────────────────────

/**
 * Grant a badge to a user if not already awarded.
 * Safe to call multiple times - uses upsert with no-op update.
 * Must be called AFTER ensureForumBadges().
 */
export async function grantBadge(
  userId: string,
  badgeKey: string,
  reason: string = "自动授予",
  tx?: any
): Promise<{ granted: boolean; badgeId?: string }> {
  const client = tx || prisma;

  const badge = await client.userBadge.findUnique({
    where: { key: badgeKey },
    select: { id: true, isActive: true },
  });

  if (!badge || !badge.isActive) {
    return { granted: false };
  }

  // Check if already awarded
  const existing = await client.userBadgeAward.findUnique({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
    select: { id: true },
  });

  if (existing) {
    return { granted: false };
  }

  await client.userBadgeAward.create({
    data: {
      userId,
      badgeId: badge.id,
      reason,
    },
  });

  // Also add to User.badges array for quick lookup (if not present)
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { badges: true },
  });

  if (user && !user.badges.includes(badgeKey)) {
    await client.user.update({
      where: { id: userId },
      data: { badges: { push: badgeKey } },
    });
  }

  return { granted: true, badgeId: badge.id };
}

// ─── Auto-Check & Grant ──────────────────────────────────

/**
 * Checks all forum badge conditions for a user and grants any earned badges.
 * Called after key events: post approved, answer accepted, post featured, post liked.
 *
 * @param userId - The user to check
 * @param tx - Optional Prisma transaction client
 * @returns Array of newly granted badge keys
 */
export async function checkAndGrantForumBadges(
  userId: string,
  tx?: any
): Promise<string[]> {
  const client = tx || prisma;

  // Ensure badge definitions exist
  await ensureForumBadges(client);

  const grantedBadges: string[] = [];

  // 1. first_post: has at least 1 published post
  const publishedPostCount = await client.forumPost.count({
    where: { userId, status: "published" },
  });
  if (publishedPostCount >= 1) {
    const result = await grantBadge(userId, "first_post", "首次发布帖子自动授予", client);
    if (result.granted) grantedBadges.push("first_post");
  }

  // 2. helpful_answer: has at least 1 accepted comment
  const acceptedCount = await client.forumComment.count({
    where: { userId, isAccepted: true },
  });
  if (acceptedCount >= 1) {
    const result = await grantBadge(userId, "helpful_answer", "回答被采纳自动授予", client);
    if (result.granted) grantedBadges.push("helpful_answer");
  }

  // 3. forum_featured_author: has at least 1 featured post
  const featuredCount = await client.forumPost.count({
    where: { userId, isFeatured: true },
  });
  if (featuredCount >= 1) {
    const result = await grantBadge(userId, "forum_featured_author", "帖子被加精自动授予", client);
    if (result.granted) grantedBadges.push("forum_featured_author");
  }

  // 4. forum_active_30: 10+ published posts in last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentPostCount = await client.forumPost.count({
    where: {
      userId,
      status: "published",
      createdAt: { gte: thirtyDaysAgo },
    },
  });
  if (recentPostCount >= 10) {
    const result = await grantBadge(userId, "forum_active_30", "30天内发布10+帖子自动授予", client);
    if (result.granted) grantedBadges.push("forum_active_30");
  }

  // 5. forum_helpful_50: 50+ total likes received (on posts + comments)
  const [postLikes, commentLikes] = await Promise.all([
    client.forumLike.count({
      where: { post: { userId } },
    }),
    client.forumLike.count({
      where: { comment: { userId } },
    }),
  ]);
  const totalLikes = postLikes + commentLikes;
  if (totalLikes >= 50) {
    const result = await grantBadge(userId, "forum_helpful_50", "累计获得50+点赞自动授予", client);
    if (result.granted) grantedBadges.push("forum_helpful_50");
  }

  return grantedBadges;
}
