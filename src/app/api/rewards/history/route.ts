// GET /api/rewards/history - Get user's redemption history

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = session.user.id;
  const { prisma } = await import("@/lib/prisma");

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const [redemptions, total] = await Promise.all([
      prisma.userReward.findMany({
        where: { userId },
        include: {
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
      prisma.userReward.count({ where: { userId } }),
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
    console.error("Failed to fetch redemption history:", error);
    return NextResponse.json(
      { error: "获取兑换记录失败" },
      { status: 500 }
    );
  }
}
