// v18.6.1: 荣誉值（honorScore）辅助函数
// 荣誉值不可消费，代表用户在社区中的可信度和贡献背书
// 所有变动必须写 HonorLog，同一来源不可重复刷，每日有增长上限

import { prisma } from "@/lib/prisma";

// 每日荣誉值增长上限（防止刷分）
const DAILY_HONOR_CAP = 50;

/**
 * 获取用户今日已获得的荣誉值（仅正数）
 */
async function getTodayHonorGain(userId: string, tx?: any): Promise<number> {
  const client = tx || prisma;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const logs = await client.honorLog.findMany({
    where: {
      userId,
      delta: { gt: 0 },
      createdAt: { gte: todayStart },
    },
    select: { delta: true },
  });

  return logs.reduce((sum: number, log: { delta: number }) => sum + log.delta, 0);
}

/**
 * 检查同一来源是否已发放过荣誉值（防重复）
 */
async function hasExistingHonorLog(
  userId: string,
  sourceType: string,
  sourceId: string,
  tx?: any
): Promise<boolean> {
  const client = tx || prisma;
  const existing = await client.honorLog.findFirst({
    where: { userId, sourceType, sourceId },
    select: { id: true },
  });
  return !!existing;
}

/**
 * 增加或扣减用户荣誉值
 * - 写 HonorLog
 * - 更新 User.honorScore
 * - 检查每日上限（仅正数）
 * - 检查来源防重复（仅正数且 sourceId 存在时）
 */
export async function adjustHonor(
  userId: string,
  delta: number,
  sourceType: string,
  reason: string,
  sourceId?: string,
  actorId?: string,
  tx?: any
): Promise<{ success: boolean; newHonor: number; reason?: string }> {
  const client = tx || prisma;

  // 正数时检查每日上限和防重复
  if (delta > 0) {
    // 防重复：同一来源不可重复刷
    if (sourceId) {
      const exists = await hasExistingHonorLog(userId, sourceType, sourceId, client);
      if (exists) {
        return { success: false, newHonor: 0, reason: "该来源荣誉值已发放，跳过" };
      }
    }

    // 每日上限
    const todayGain = await getTodayHonorGain(userId, client);
    if (todayGain + delta > DAILY_HONOR_CAP) {
      const allowed = Math.max(0, DAILY_HONOR_CAP - todayGain);
      if (allowed === 0) {
        return { success: false, newHonor: 0, reason: "今日荣誉值增长已达上限" };
      }
      // 部分发放
      delta = allowed;
    }
  }

  // 获取当前荣誉值
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { honorScore: true },
  });

  const newHonor = Math.max(0, (user?.honorScore || 0) + delta);

  // 更新用户荣誉值
  await client.user.update({
    where: { id: userId },
    data: { honorScore: newHonor },
  });

  // 写 HonorLog
  await client.honorLog.create({
    data: {
      userId,
      delta,
      reason,
      sourceType,
      sourceId: sourceId || null,
      actorId: actorId || null,
    },
  });

  return { success: true, newHonor };
}

/**
 * 确保用户有 CommunityStat 记录，没有则创建
 */
export async function ensureCommunityStat(userId: string, tx?: any): Promise<void> {
  const client = tx || prisma;
  const existing = await client.communityStat.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!existing) {
    await client.communityStat.create({
      data: { userId },
    });
  }
}

/**
 * 更新社区统计（增量更新）
 */
export async function incrementCommunityStat(
  userId: string,
  field: "postCount" | "commentCount" | "acceptedAnswerCount" | "featuredPostCount" | "helpfulVoteCount" | "reportAcceptedCount" | "violationCount",
  increment: number = 1,
  tx?: any
): Promise<void> {
  const client = tx || prisma;
  await ensureCommunityStat(userId, client);
  await client.communityStat.update({
    where: { userId },
    data: {
      [field]: { increment },
      lastActiveAt: new Date(),
    },
  });
}

/**
 * 获取用户社区公开信息（用于 UserTrustCard）
 */
export async function getUserCommunityInfo(userId: string) {
  const [user, profile, stat, badges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        membershipTier: true,
        growthValue: true,
        levelKey: true,
        honorScore: true,
        points: true,
        createdAt: true,
      },
    }),
    prisma.userCommunityProfile.findUnique({
      where: { userId },
    }),
    prisma.communityStat.findUnique({
      where: { userId },
    }),
    prisma.userBadgeAward.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { awardedAt: "desc" },
    }),
  ]);

  if (!user) return null;

  // 获取等级信息
  const level = await prisma.userLevel.findUnique({
    where: { key: user.levelKey || "lv1" },
    select: { name: true, iconText: true, color: true, minGrowth: true },
  });

  return {
    user,
    profile,
    stat: stat || {
      postCount: 0,
      commentCount: 0,
      acceptedAnswerCount: 0,
      featuredPostCount: 0,
      helpfulVoteCount: 0,
      reportAcceptedCount: 0,
      violationCount: 0,
    },
    badges: badges.map((b) => ({
      key: b.badge.key,
      name: b.badge.name,
      iconText: b.badge.iconText,
      color: b.badge.color,
      category: b.badge.category,
      awardedAt: b.awardedAt.toISOString(),
    })),
    level: level || { name: "Lv.1 新手", iconText: "🌱", color: "green-500", minGrowth: 0 },
  };
}
