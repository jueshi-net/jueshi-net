// POST /api/growth-tasks/dashboard-visit
// Records a daily dashboard visit and awards +2 growth_value (once per day).
// Idempotent: returns 200 if already visited today.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addGrowthValue } from "@/lib/growth-helpers";
import { getTodayDateKey } from "@/lib/date-utils";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = session.user.id;
  const dateKey = getTodayDateKey();

  try {
    // Check if already rewarded today via growth_logs
    const existing = await prisma.growthLog.findFirst({
      where: {
        userId,
        type: "dashboard_visit",
        createdAt: {
          gte: new Date(dateKey + "T00:00:00-07:00"), // Pacific timezone
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyRewarded: true,
        message: "今日已访问过工作台",
        growthValue: existing.value,
      });
    }

    // Award +2 growth_value via shared helper
    const result = await addGrowthValue(
      userId,
      2,
      "dashboard_visit",
      "访问工作台奖励",
      "dashboard",
      dateKey
    );

    return NextResponse.json({
      success: true,
      alreadyRewarded: false,
      newGrowth: result.newGrowth,
      newLevel: result.newLevel,
    });
  } catch (error) {
    console.error("dashboard_visit error:", error);
    return NextResponse.json(
      { error: "记录失败，请重试" },
      { status: 500 }
    );
  }
}
