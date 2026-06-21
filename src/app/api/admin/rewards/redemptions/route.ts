// GET /api/admin/rewards/redemptions - Get all redemptions (admin only)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  const { prisma } = await import("@/lib/prisma");

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const rewardType = searchParams.get("rewardType");
    const status = searchParams.get("status");
    const auditStatus = searchParams.get("auditStatus");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (rewardType) where.rewardType = rewardType;
    if (status) where.status = status;
    if (auditStatus) where.auditStatus = auditStatus;

    const [redemptions, total] = await Promise.all([
      prisma.userReward.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
          rewardItem: {
            select: {
              code: true,
              name: true,
              rewardType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.userReward.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        redemptions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch redemptions:", error);
    return NextResponse.json(
      { error: "获取兑换记录失败" },
      { status: 500 }
    );
  }
}
