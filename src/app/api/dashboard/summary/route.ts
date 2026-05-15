// GET /api/dashboard/summary
// Returns aggregated dashboard data for the current user.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCurrentUserRole, getUserLimits } from "@/lib/auth/permissions";
import { getTodayDateKey, getTodayRange } from "@/lib/date-utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = session.user.id;
  const role = await getCurrentUserRole();

  // Use timezone-aware date key and range
  const dateKey = getTodayDateKey();
  const { start: today, end: tomorrow } = getTodayRange();

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { points: true, checkinStreak: true, lastCheckinDate: true },
  });

  // Check if checked in today
  const todayCheckin = await prisma.dailyCheckIn.findUnique({
    where: { userId_dateKey: { userId, dateKey } },
  });

  // Calculate today's earned points
  const todayLedger = await prisma.pointLedger.aggregate({
    _sum: { points: true },
    _count: true,
    where: {
      userId,
      createdAt: { gte: today, lt: tomorrow },
      points: { gt: 0 },
    },
  });

  // Daily point cap by role
  const dailyPointCap = role === "admin" ? 999 : role === "member" ? 60 : 30;

  // Task stats
  const taskStats = await prisma.userTask.groupBy({
    by: ["status"],
    where: { userId },
    _count: true,
  });

  const taskCounts: Record<string, number> = {};
  for (const s of taskStats) {
    taskCounts[s.status] = s._count;
  }

  // Recent point logs
  const recentLogs = await prisma.pointLedger.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      type: true,
      points: true,
      reason: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    role,
    points: user?.points || 0,
    checkinStreak: user?.checkinStreak || 0,
    checkedInToday: !!todayCheckin,
    todayEarned: todayLedger._sum.points || 0,
    todayLogCount: todayLedger._count,
    dailyPointCap,
    taskStats: {
      pending: taskCounts.pending || 0,
      done: taskCounts.done || 0,
      archived: taskCounts.archived || 0,
      total: (taskCounts.pending || 0) + (taskCounts.done || 0) + (taskCounts.archived || 0),
    },
    recentLogs,
  });
}
