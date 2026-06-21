// v1.20.42.18.4.3: Reward fulfillment functions
// Shared between redeem API and admin audit API

import { PrismaClient } from "@prisma/client";

export async function fulfillMemberTrial(
  tx: PrismaClient,
  userId: string,
  rewardItem: any,
  userReward: any
) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + rewardItem.rewardValue * 24 * 60 * 60 * 1000);

  // Update memberUntil
  const currentUser = await tx.user.findUnique({
    where: { id: userId },
    select: { memberUntil: true },
  });

  const currentExpiry = currentUser?.memberUntil;
  const baseDate = currentExpiry && currentExpiry > now ? currentExpiry : now;
  const newMemberUntil = new Date(
    baseDate.getTime() + rewardItem.rewardValue * 24 * 60 * 60 * 1000
  );

  // v1.20.42.18.4.2: Update membershipTier, NEVER touch role
  await tx.user.update({
    where: { id: userId },
    data: {
      memberUntil: newMemberUntil,
      membershipTier: "member",
    },
  });

  // Update user reward status and expiresAt
  await tx.userReward.update({
    where: { id: userReward.id },
    data: {
      status: "active",
      expiresAt: newMemberUntil,
    },
  });
}

export async function fulfillGrowth(
  tx: PrismaClient,
  userId: string,
  rewardItem: any,
  userReward: any
) {
  // Increment growthValue
  await tx.user.update({
    where: { id: userId },
    data: {
      growthValue: { increment: rewardItem.rewardValue },
    },
  });

  // Create GrowthLog
  await tx.growthLog.create({
    data: {
      userId,
      type: "reward_redeem",
      value: rewardItem.rewardValue,
      reason: `兑换${rewardItem.name}`,
      refType: "userReward",
      refId: userReward.id,
    },
  });

  // Update user reward status
  await tx.userReward.update({
    where: { id: userReward.id },
    data: {
      status: "active",
    },
  });
}

export async function fulfillWordExportCoupon(
  tx: PrismaClient,
  userId: string,
  rewardItem: any,
  userReward: any
) {
  // Create CouponEntitlement
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1年有效期

  await tx.couponEntitlement.create({
    data: {
      userId,
      couponType: "word_export",
      quantity: rewardItem.rewardValue,
      usedCount: 0,
      status: "active",
      expiresAt,
      sourceRewardId: userReward.id,
    },
  });

  // Update user reward status and expiresAt
  await tx.userReward.update({
    where: { id: userReward.id },
    data: {
      status: "active",
      expiresAt,
    },
  });
}

export async function fulfillNoBrandingCoupon(
  tx: PrismaClient,
  userId: string,
  rewardItem: any,
  userReward: any
) {
  // Create CouponEntitlement
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1年有效期

  await tx.couponEntitlement.create({
    data: {
      userId,
      couponType: "no_branding",
      quantity: rewardItem.rewardValue,
      usedCount: 0,
      status: "active",
      expiresAt,
      sourceRewardId: userReward.id,
    },
  });

  // Update user reward status and expiresAt
  await tx.userReward.update({
    where: { id: userReward.id },
    data: {
      status: "active",
      expiresAt,
    },
  });
}

export async function fulfillAdSlotDays(
  tx: PrismaClient,
  userId: string,
  rewardItem: any,
  userReward: any
) {
  // v1.20.42.18.4.3: ad_slot_7day should remain inactive
  // This function should not be called if reward is properly disabled
  throw new Error("广告权益系统尚未实现");
}

export async function fulfillReward(
  tx: PrismaClient,
  userId: string,
  rewardItem: any,
  userReward: any
) {
  switch (rewardItem.rewardType) {
    case "member_trial":
      await fulfillMemberTrial(tx, userId, rewardItem, userReward);
      break;
    case "growth":
      await fulfillGrowth(tx, userId, rewardItem, userReward);
      break;
    case "word_export_coupon":
      await fulfillWordExportCoupon(tx, userId, rewardItem, userReward);
      break;
    case "no_branding_coupon":
      await fulfillNoBrandingCoupon(tx, userId, rewardItem, userReward);
      break;
    case "ad_slot_days":
      await fulfillAdSlotDays(tx, userId, rewardItem, userReward);
      break;
    default:
      throw new Error(`未知的奖励类型: ${rewardItem.rewardType}`);
  }
}
