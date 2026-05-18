// Shared growth/level helper — used by checkin, forum rewards, admin tools
import { prisma } from "@/lib/prisma";

/**
 * Calculate user level key based on growth value
 * Returns the highest level where minGrowth <= growthValue
 */
export async function calculateLevelKey(growthValue: number, tx?: any): Promise<string> {
  const client = tx || prisma;
  const level = await client.userLevel.findFirst({
    where: {
      isActive: true,
      minGrowth: { lte: growthValue },
    },
    orderBy: { minGrowth: "desc" },
    select: { key: true },
  });
  return level?.key || "lv1";
}

/**
 * Update user's growth value and recalculate level
 * Must be called within a transaction if tx is provided
 */
export async function addGrowthValue(
  userId: string,
  value: number,
  type: string,
  reason: string,
  refType?: string,
  refId?: string,
  tx?: any
): Promise<{ newGrowth: number; newLevel: string }> {
  const client = tx || prisma;

  // Get current growth value
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { growthValue: true },
  });

  const newGrowth = (user?.growthValue || 0) + value;
  const newLevel = await calculateLevelKey(newGrowth, client);

  // Update user
  await client.user.update({
    where: { id: userId },
    data: {
      growthValue: newGrowth,
      levelKey: newLevel,
    },
  });

  // Write growth log
  await client.growthLog.create({
    data: {
      userId,
      type,
      value,
      reason,
      refType: refType || null,
      refId: refId || null,
    },
  });

  return { newGrowth, newLevel };
}
