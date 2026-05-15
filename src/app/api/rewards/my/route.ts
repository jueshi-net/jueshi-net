// GET /api/rewards/my - List user's redeemed rewards

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = session.user.id;
  const { prisma } = await import("@/lib/prisma");

  try {
    const rewards = await prisma.userReward.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        rewardItem: {
          select: {
            code: true,
            name: true,
            rewardType: true,
          },
        },
      },
    });

    return NextResponse.json({ rewards });
  } catch (error) {
    console.error("My rewards error:", error);
    return NextResponse.json({ error: "获取我的权益失败" }, { status: 500 });
  }
}
