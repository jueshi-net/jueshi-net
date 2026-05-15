// POST /api/checkin
// Daily check-in with anti-duplicate.
// user: +5 points, member/admin: +10 points
// Each user can only check in once per day.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCurrentUserRole, getUserLimits } from "@/lib/auth/permissions";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = session.user.id;
  const role = await getCurrentUserRole();

  // Determine points based on role
  const checkinPoints = role === "member" || role === "admin" ? 10 : 5;

  const today = new Date();
  const dateKey = today.toISOString().slice(0, 10); // YYYY-MM-DD

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

    // Calculate new streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

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
