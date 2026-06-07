// GET /api/points/logs
// Get point ledger history for the current user.
// Supports type filter and cursor-based pagination with stats.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getVancouverDateRange, getVancouverWeekRange, getVancouverMonthRange } from "@/lib/date-utils";

const VALID_TYPES = ["daily_checkin", "task_complete", "export_word", "admin_adjust", "reward_redeem", "system_adjust"];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const type = searchParams.get("type") || "";

  // Build where clause
  const where: Record<string, unknown> = { userId: session.user.id };
  if (type && VALID_TYPES.includes(type)) {
    where.type = type;
  }

  // Pagination
  const skip = (page - 1) * pageSize;

  const [logs, total] = await Promise.all([
    prisma.pointLedger.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip,
      select: {
        id: true,
        type: true,
        points: true,
        reason: true,
        relatedId: true,
        metadata: true,
        createdAt: true,
      },
    }),
    prisma.pointLedger.count({ where }),
  ]);

  // Calculate stats using date ranges
  const todayRange = getVancouverDateRange();
  const weekRange = getVancouverWeekRange();
  const monthRange = getVancouverMonthRange();

  const [todayStats, weekStats, monthStats] = await Promise.all([
    getPointStats(session.user.id, todayRange.start, todayRange.end),
    getPointStats(session.user.id, weekRange.start, weekRange.end),
    getPointStats(session.user.id, monthRange.start, monthRange.end),
  ]);

  return NextResponse.json({
    logs,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    stats: {
      today: todayStats,
      thisWeek: weekStats,
      thisMonth: monthStats,
    },
    filters: {
      type: type || null,
      types: VALID_TYPES,
    },
  });
}

async function getPointStats(userId: string, start: Date, end: Date) {
  const result = await prisma.pointLedger.aggregate({
    where: { userId, createdAt: { gte: start, lte: end } },
    _sum: { points: true },
    _count: true,
  });
  return {
    earned: result._sum.points ?? 0,
    count: result._count ?? 0,
  };
}
