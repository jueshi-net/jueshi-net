// GET /api/user/stats
// 返回用户统计数据：积分、连续签到天数、今日是否已签到

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getTodayDateKey } from "@/lib/date-utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = session.user.id;
  const dateKey = getTodayDateKey();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        points: true,
        checkinStreak: true,
        lastCheckinDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 检查今日是否已签到
    const todayCheckin = await prisma.dailyCheckIn.findUnique({
      where: { userId_dateKey: { userId, dateKey } },
    });

    return NextResponse.json({
      points: user.points,
      checkinStreak: user.checkinStreak,
      checkedInToday: !!todayCheckin,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    return NextResponse.json(
      { error: "获取用户数据失败" },
      { status: 500 }
    );
  }
}
