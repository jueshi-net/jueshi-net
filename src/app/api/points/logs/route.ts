// GET /api/points/logs
// Get point ledger history for the current user.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const logs = await prisma.pointLedger.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    select: {
      id: true,
      type: true,
      points: true,
      reason: true,
      relatedId: true,
      createdAt: true,
    },
  });

  const total = await prisma.pointLedger.count({
    where: { userId: session.user.id },
  });

  return NextResponse.json({
    logs,
    total,
    limit,
    offset,
  });
}
