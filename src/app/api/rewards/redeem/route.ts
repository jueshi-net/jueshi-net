// POST /api/rewards/redeem - Redeem a reward item with points
// v1.20.42.18.4.3: Added limit checks, fulfillment logic, and audit tracking

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// v1.20.42.18.4.3: Limit validation functions
function checkTimeWindow(rewardItem: any): { ok: boolean; reason?: string } {
  const now = new Date();
  
  if (rewardItem.startAt && now < new Date(rewardItem.startAt)) {
    return { ok: false, reason: "活动尚未开始" };
  }
  
  if (rewardItem.endAt && now > new Date(rewardItem.endAt)) {
    return { ok: false, reason: "活动已结束" };
  }
  
  return { ok: true };
}

async function checkStock(tx: any, rewardItem: any): Promise<{ ok: boolean; reason?: string }> {
  if (rewardItem.stockLimit === null || rewardItem.stockLimit === undefined) {
    return { ok: true }; // 无限制
  }
  
  if (rewardItem.stockUsed >= rewardItem.stockLimit) {
    return { ok: false, reason: "库存不足" };
  }
  
  return { ok: true };
}

async function checkPerUserLimit(tx: any, userId: string, rewardItem: any): Promise<{ ok: boolean; reason?: string }> {
  const userRewardCount = await tx.userReward.count({
    where: {
      userId,
      rewardItemId: rewardItem.id,
    },
  });
  
  if (userRewardCount >= rewardItem.perUserLimit) {
    return { ok: false, reason: `每人限兑 ${rewardItem.perUserLimit} 次` };
  }
  
  return { ok: true };
}

async function checkCooldown(tx: any, userId: string, rewardItem: any): Promise<{ ok: boolean; reason?: string }> {
  if (rewardItem.cooldownHours === 0) {
    return { ok: true }; // 无冷却期
  }
  
  const lastReward = await tx.userReward.findFirst({
    where: {
      userId,
      rewardItemId: rewardItem.id,
    },
    orderBy: { createdAt: "desc" },
  });
  
  if (lastReward) {
    const cooldownEnd = new Date(lastReward.createdAt.getTime() + rewardItem.cooldownHours * 60 * 60 * 1000);
    if (new Date() < cooldownEnd) {
      const remainingHours = Math.ceil((cooldownEnd.getTime() - Date.now()) / (60 * 60 * 1000));
      return { ok: false, reason: `冷却期未结束，还需 ${remainingHours} 小时` };
    }
  }
  
  return { ok: true };
}

async function validateRedemption(tx: any, userId: string, rewardItem: any): Promise<{ ok: boolean; reason?: string }> {
  // 1. 检查 enabled
  if (!rewardItem.enabled) {
    return { ok: false, reason: "奖励项已禁用" };
  }
  
  // 2. 检查时间窗口
  const timeCheck = checkTimeWindow(rewardItem);
  if (!timeCheck.ok) return timeCheck;
  
  // 3. 检查库存
  const stockCheck = await checkStock(tx, rewardItem);
  if (!stockCheck.ok) return stockCheck;
  
  // 4. 检查限兑
  const perUserCheck = await checkPerUserLimit(tx, userId, rewardItem);
  if (!perUserCheck.ok) return perUserCheck;
  
  // 5. 检查冷却期
  const cooldownCheck = await checkCooldown(tx, userId, rewardItem);
  if (!cooldownCheck.ok) return cooldownCheck;
  
  // 6. 检查积分
  const user = await tx.user.findUnique({ where: { id: userId } });
  if (!user || user.points < rewardItem.costPoints) {
    return { ok: false, reason: "积分不足" };
  }
  
  return { ok: true };
}

// v1.20.42.18.4.3: Fulfillment functions
async function fulfillMemberTrial(tx: any, userId: string, rewardItem: any, userReward: any) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + rewardItem.rewardValue * 24 * 60 * 60 * 1000);
  
  // Update memberUntil
  const currentUser = await tx.user.findUnique({
    where: { id: userId },
    select: { memberUntil: true },
  });
  
  const currentExpiry = currentUser?.memberUntil;
  const baseDate = (currentExpiry && currentExpiry > now) ? currentExpiry : now;
  const newMemberUntil = new Date(baseDate.getTime() + rewardItem.rewardValue * 24 * 60 * 60 * 1000);
  
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

async function fulfillGrowth(tx: any, userId: string, rewardItem: any, userReward: any) {
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

async function fulfillWordExportCoupon(tx: any, userId: string, rewardItem: any, userReward: any) {
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

async function fulfillNoBrandingCoupon(tx: any, userId: string, rewardItem: any, userReward: any) {
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

async function fulfillAdSlotDays(tx: any, userId: string, rewardItem: any, userReward: any) {
  // v1.20.42.18.4.3: ad_slot_7day should remain inactive
  // This function should not be called if reward is properly disabled
  throw new Error("广告权益系统尚未实现");
}

async function fulfillReward(tx: any, userId: string, rewardItem: any, userReward: any) {
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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = session.user.id;
  const { prisma } = await import("@/lib/prisma");

  try {
    const body = await req.json();
    const { rewardItemId } = body;

    if (!rewardItemId) {
      return NextResponse.json({ error: "缺少兑换项 ID" }, { status: 400 });
    }

    // Fetch reward item
    const rewardItem = await prisma.rewardItem.findUnique({ 
      where: { id: rewardItemId } 
    });

    if (!rewardItem) {
      return NextResponse.json({ error: "兑换项不存在" }, { status: 404 });
    }

    // Execute redemption in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // v1.20.42.18.4.3: Validate all limits
      const validation = await validateRedemption(tx, userId, rewardItem);
      if (!validation.ok) {
        throw new Error(validation.reason);
      }

      // Deduct points
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: rewardItem.costPoints } },
      });

      // Increment stock used
      if (rewardItem.stockLimit !== null && rewardItem.stockLimit !== undefined) {
        await tx.rewardItem.update({
          where: { id: rewardItem.id },
          data: { stockUsed: { increment: 1 } },
        });
      }

      // Create user reward with pending status
      const userReward = await tx.userReward.create({
        data: {
          userId,
          rewardItemId,
          rewardType: rewardItem.rewardType,
          rewardValue: rewardItem.rewardValue,
          status: rewardItem.requiresApproval ? "pending" : "active",
          pointsCost: rewardItem.costPoints,
          auditStatus: rewardItem.requiresApproval ? "pending" : "auto",
        },
      });

      // v1.20.42.18.4.3: Execute fulfillment logic
      if (!rewardItem.requiresApproval) {
        await fulfillReward(tx, userId, rewardItem, userReward);
      }

      // Write point ledger
      await tx.pointLedger.create({
        data: {
          userId,
          type: "reward_redeem",
          points: -rewardItem.costPoints,
          reason: `兑换${rewardItem.name}`,
          relatedId: userReward.id,
          metadata: { rewardCode: rewardItem.code },
        },
      });

      return { userReward, remainingPoints: updatedUser.points };
    });

    return NextResponse.json({
      success: true,
      reward: {
        name: rewardItem.name,
        type: rewardItem.rewardType,
        value: rewardItem.rewardValue,
      },
      remainingPoints: result.remainingPoints,
      message: rewardItem.requiresApproval 
        ? "兑换成功，等待审核" 
        : "兑换成功",
    });
  } catch (error: any) {
    console.error("Redeem error:", error);
    
    // Handle specific validation errors
    if (error.message.includes("库存不足") || 
        error.message.includes("限兑") || 
        error.message.includes("冷却期") || 
        error.message.includes("积分不足") ||
        error.message.includes("活动")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: "兑换失败，请重试" }, { status: 500 });
  }
}
