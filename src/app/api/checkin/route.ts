// POST /api/checkin
// Daily check-in with anti-duplicate.
// user: +5 points, member/admin: +10 points
// Also grants +2 growth_value (all roles) and writes growth_logs
// Each user can only check in once per day.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCurrentUserRole, isElevatedRole, getUserLimits } from "@/lib/auth/permissions";
import { getTodayDateKey, getDateKey } from "@/lib/date-utils";
import { addGrowthValue } from "@/lib/growth-helpers";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = session.user.id;
  const role = await getCurrentUserRole();

  // Determine points based on role
  const checkinPoints = isElevatedRole(role) ? 10 : 5;

  // Use timezone-aware date key (America/Vancouver)
  const dateKey = getTodayDateKey();
  const yesterdayKey = getDateKey(-1);

  try {
    // Check if already checked in today
    const existing = await prisma.dailyCheckIn.findUnique({
      where: { userId_dateKey: { userId, dateKey } },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "今日已签到", checkedIn: true, points: existing.points },
        { status: 409 }
      );
    }

    const yesterdayCheckin = await prisma.dailyCheckIn.findUnique({
      where: { userId_dateKey: { userId, dateKey: yesterdayKey } },
    });

    // Get current user to read streak
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, checkinStreak: true, lastCheckinDate: true },
    });

    const newStreak = user?.lastCheckinDate === yesterdayKey
      ? (user?.checkinStreak || 0) + 1
      : 1;

    // Create check-in record, update user points and streak in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const checkin = await tx.dailyCheckIn.create({
        data: {
          userId,
          dateKey,
          points: checkinPoints,
        },
      });

      // Write point ledger
      await tx.pointLedger.create({
        data: {
          userId,
          type: "daily_checkin",
          points: checkinPoints,
          reason: "每日签到",
          relatedId: checkin.id,
        },
      });

      // Update user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          points: { increment: checkinPoints },
          checkinStreak: newStreak,
          lastCheckinDate: dateKey,
        },
      });

      // Grant +2 growth_value and write growth_logs
      await addGrowthValue(userId, 2, "daily_checkin", "每日签到奖励", "daily_checkin", checkin.id, tx);

      return { checkin, updatedUser };
    });

    return NextResponse.json({
      success: true,
      checkedIn: true,
      points: checkinPoints,
      streak: result.updatedUser.checkinStreak,
      totalPoints: result.updatedUser.points,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "签到失败，请重试" },
      { status: 500 }
    );
  }
}
