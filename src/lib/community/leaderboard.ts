/**
 * Forum V1.5 - Leaderboard
 *
 * Real-time aggregation of CommunityStat + GrowthLog + HonorLog.
 * No new database tables. API cached for 1 hour.
 *
 * Types:
 *   active  - most posts + comments in period (CommunityStat)
 *   honor   - most honor gained in period (HonorLog)
 *   growth  - most growth gained in period (GrowthLog)
 *   answers - most accepted answers (CommunityStat.acceptedAnswerCount)
 *
 * Periods: week (7d), month (30d)
 */

import { prisma } from "@/lib/prisma";

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatar: string | null;
  levelKey: string | null;
  score: number;
  rank: number;
}

export interface LeaderboardResult {
  type: string;
  period: string;
  generatedAt: string;
  entries: LeaderboardEntry[];
}

// ─── Helpers ────────────────────────────────────────────

function getPeriodStart(period: string): Date {
  const now = new Date();
  if (period === "week") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  // default to month
  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
}

function maskName(name: string | null): string {
  if (!name) return "匿名用户";
  // For privacy: show first 2 chars + *** if name > 2 chars
  if (name.length <= 2) return name;
  return name.substring(0, 2) + "***";
}

// ─── Active Leaderboard (posts + comments) ──────────────

async function getActiveLeaderboard(period: string, limit: number = 20): Promise<LeaderboardEntry[]> {
  const periodStart = getPeriodStart(period);

  // Count posts in period
  const postCounts = await prisma.forumPost.groupBy({
    by: ["userId"],
    where: {
      status: "published",
      createdAt: { gte: periodStart },
    },
    _count: { id: true },
  });

  // Count comments in period
  const commentCounts = await prisma.forumComment.groupBy({
    by: ["userId"],
    where: {
      status: "published",
      createdAt: { gte: periodStart },
    },
    _count: { id: true },
  });

  // Merge counts
  const scoreMap = new Map<string, number>();
  for (const p of postCounts) {
    scoreMap.set(p.userId, (scoreMap.get(p.userId) || 0) + p._count.id);
  }
  for (const c of commentCounts) {
    scoreMap.set(c.userId, (scoreMap.get(c.userId) || 0) + c._count.id);
  }

  // Sort and get top N
  const sorted = Array.from(scoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  if (sorted.length === 0) return [];

  const userIds = sorted.map((s) => s[0]);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true, levelKey: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  return sorted.map(([userId, score], index) => {
    const user = userMap.get(userId);
    return {
      userId,
      displayName: maskName(user?.name || null),
      avatar: user?.image || null,
      levelKey: user?.levelKey || null,
      score,
      rank: index + 1,
    };
  });
}

// ─── Honor Leaderboard ──────────────────────────────────

async function getHonorLeaderboard(period: string, limit: number = 20): Promise<LeaderboardEntry[]> {
  const periodStart = getPeriodStart(period);

  const results = await prisma.honorLog.groupBy({
    by: ["userId"],
    where: {
      createdAt: { gte: periodStart },
      delta: { gt: 0 },
    },
    _sum: { delta: true },
  });

  const sorted = results
    .sort((a, b) => (b._sum.delta || 0) - (a._sum.delta || 0))
    .slice(0, limit);

  if (sorted.length === 0) return [];

  const userIds = sorted.map((s) => s.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true, levelKey: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  return sorted.map((entry, index) => {
    const user = userMap.get(entry.userId);
    return {
      userId: entry.userId,
      displayName: maskName(user?.name || null),
      avatar: user?.image || null,
      levelKey: user?.levelKey || null,
      score: entry._sum.delta || 0,
      rank: index + 1,
    };
  });
}

// ─── Growth Leaderboard ─────────────────────────────────

async function getGrowthLeaderboard(period: string, limit: number = 20): Promise<LeaderboardEntry[]> {
  const periodStart = getPeriodStart(period);

  const results = await prisma.growthLog.groupBy({
    by: ["userId"],
    where: {
      createdAt: { gte: periodStart },
      value: { gt: 0 },
    },
    _sum: { value: true },
  });

  const sorted = results
    .sort((a, b) => (b._sum.value || 0) - (a._sum.value || 0))
    .slice(0, limit);

  if (sorted.length === 0) return [];

  const userIds = sorted.map((s) => s.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true, levelKey: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  return sorted.map((entry, index) => {
    const user = userMap.get(entry.userId);
    return {
      userId: entry.userId,
      displayName: maskName(user?.name || null),
      avatar: user?.image || null,
      levelKey: user?.levelKey || null,
      score: entry._sum.value || 0,
      rank: index + 1,
    };
  });
}

// ─── Answers Leaderboard (cumulative) ───────────────────

async function getAnswersLeaderboard(limit: number = 20): Promise<LeaderboardEntry[]> {
  const stats = await prisma.communityStat.findMany({
    where: {
      acceptedAnswerCount: { gt: 0 },
    },
    orderBy: { acceptedAnswerCount: "desc" },
    take: limit,
    select: { userId: true, acceptedAnswerCount: true },
  });

  if (stats.length === 0) return [];

  const userIds = stats.map((s) => s.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true, levelKey: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  return stats.map((entry, index) => {
    const user = userMap.get(entry.userId);
    return {
      userId: entry.userId,
      displayName: maskName(user?.name || null),
      avatar: user?.image || null,
      levelKey: user?.levelKey || null,
      score: entry.acceptedAnswerCount,
      rank: index + 1,
    };
  });
}

// ─── Main Entry ────────────────────────────────────────

export async function getLeaderboard(
  type: "active" | "honor" | "growth" | "answers",
  period: "week" | "month" = "week",
  limit: number = 20
): Promise<LeaderboardResult> {
  const cappedLimit = Math.min(Math.max(limit, 1), 50);

  let entries: LeaderboardEntry[];

  switch (type) {
    case "active":
      entries = await getActiveLeaderboard(period, cappedLimit);
      break;
    case "honor":
      entries = await getHonorLeaderboard(period, cappedLimit);
      break;
    case "growth":
      entries = await getGrowthLeaderboard(period, cappedLimit);
      break;
    case "answers":
      // answers is cumulative, period doesn't matter
      entries = await getAnswersLeaderboard(cappedLimit);
      break;
    default:
      entries = await getActiveLeaderboard(period, cappedLimit);
  }

  return {
    type,
    period,
    generatedAt: new Date().toISOString(),
    entries,
  };
}
