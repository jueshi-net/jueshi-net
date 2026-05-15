// POST /api/rewards/redeem - Redeem a reward item with points
// All point deductions happen in a DB transaction to ensure consistency

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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

    // Fetch reward item and user in parallel
    const [rewardItem, user] = await Promise.all([
      prisma.rewardItem.findUnique({ where: { id: rewardItemId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { points: true } }),
    ]);

    if (!rewardItem) {
      return NextResponse.json({ error: "兑换项不存在" }, { status: 404 });
    }

    if (!rewardItem.enabled) {
      return NextResponse.json({ error: "该兑换项暂未开放" }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    if (user.points < rewardItem.costPoints) {
      return NextResponse.json({
        error: "积分不足",
        currentPoints: user.points,
        requiredPoints: rewardItem.costPoints,
      }, { status: 400 });
    }

    // Execute redemption in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Double-check points under transaction lock
      const lockedUser = await tx.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });

      if (!lockedUser || lockedUser.points < rewardItem.costPoints) {
        throw new Error("积分不足");
      }

      // Deduct points
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { points: { increment: -rewardItem.costPoints } },
      });

      // Create user reward
      const now = new Date();
      const expiresAt = rewardItem.rewardType === "member_trial"
        ? new Date(now.getTime() + rewardItem.rewardValue * 24 * 60 * 60 * 1000)
        : null;

      const userReward = await tx.userReward.create({
        data: {
          userId,
          rewardItemId,
          rewardType: rewardItem.rewardType,
          rewardValue: rewardItem.rewardValue,
          status: "active",
          expiresAt,
        },
      });

      // Auto-upgrade for member_trial: set role to member and update memberUntil
      if (rewardItem.rewardType === "member_trial" && expiresAt) {
        const currentUser = await tx.user.findUnique({
          where: { id: userId },
          select: { memberUntil: true, role: true },
        });

        // Calculate new memberUntil: extend from current expiry or now
        const currentExpiry = currentUser?.memberUntil;
        const baseDate = (currentExpiry && currentExpiry > now) ? currentExpiry : now;
        const newMemberUntil = new Date(baseDate.getTime() + rewardItem.rewardValue * 24 * 60 * 60 * 1000);

        await tx.user.update({
          where: { id: userId },
          data: {
            role: "member",
            memberUntil: newMemberUntil,
          },
        });
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
    });
  } catch (error: any) {
    console.error("Redeem error:", error);
    if (error.message === "积分不足") {
      return NextResponse.json({ error: "积分不足" }, { status: 400 });
    }
    return NextResponse.json({ error: "兑换失败，请重试" }, { status: 500 });
  }
}
