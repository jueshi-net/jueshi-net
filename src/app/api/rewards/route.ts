// GET /api/rewards - List available reward items for redemption

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const { prisma } = await import("@/lib/prisma");

  try {
    const items = await prisma.rewardItem.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        costPoints: true,
        rewardType: true,
        rewardValue: true,
      },
    });

    // Get user's current points if logged in
    let points = 0;
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { points: true },
      });
      points = user?.points || 0;
    }

    return NextResponse.json({ items, points, authenticated: !!session?.user });
  } catch (error) {
    console.error("Rewards list error:", error);
    return NextResponse.json({ error: "获取兑换列表失败" }, { status: 500 });
  }
}
