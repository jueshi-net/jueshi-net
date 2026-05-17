// GET /api/me/membership — get current user's level and badges
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        growthValue: true,
        levelKey: true,
        userLevel: { select: { key: true, name: true, minGrowth: true, maxGrowth: true, iconText: true, color: true, benefits: true } },
        badgeAwards: {
          include: { badge: { select: { id: true, key: true, name: true, iconText: true, color: true, category: true, description: true } } },
          orderBy: { awardedAt: "desc" },
        },
      },
    });

    if (!user) return NextResponse.json({ success: false, error: "用户不存在" }, { status: 404 });

    // Calculate next level
    const allLevels = await prisma.userLevel.findMany({
      where: { isActive: true },
      orderBy: { minGrowth: "asc" },
      select: { key: true, name: true, minGrowth: true, maxGrowth: true, iconText: true, color: true },
    });
    let nextLevel = null;
    for (const l of allLevels) {
      if (l.minGrowth > user.growthValue) { nextLevel = l; break; }
    }

    return NextResponse.json({
      success: true,
      data: {
        growthValue: user.growthValue,
        levelKey: user.levelKey,
        level: user.userLevel,
        badges: user.badgeAwards.map(a => ({ ...a.badge, awardedAt: a.awardedAt, reason: a.reason })),
        nextLevel,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
