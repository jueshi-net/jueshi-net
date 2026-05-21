// GET /api/me/membership — get current user's level, badges, and membership status
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });

    const userId = session.user.id;

    // Auto-award "初来乍到" badge (key: first_login) on first access
    const welcomeBadge = await prisma.userBadge.findFirst({
      where: { key: "first_login", isActive: true },
      select: { id: true, key: true, name: true },
    });

    if (welcomeBadge) {
      const existing = await prisma.userBadgeAward.findUnique({
        where: { userId_badgeId: { userId, badgeId: welcomeBadge.id } },
      });
      if (!existing) {
        await prisma.userBadgeAward.create({
          data: {
            userId,
            badgeId: welcomeBadge.id,
            reason: "首次访问会员中心自动授予",
          },
        });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        growthValue: true,
        levelKey: true,
        role: true,
        memberUntil: true,
        badges: true,
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

    // Check active member status
    const isActiveMember = user.role === "admin" || user.role === "member" || !!(user.memberUntil && user.memberUntil > new Date());

    return NextResponse.json({
      success: true,
      data: {
        growthValue: user.growthValue,
        levelKey: user.levelKey,
        badges: user.badges || [],
        nextLevel,
        isActiveMember,
        membershipStatus: isActiveMember ? "active" : "inactive",
        membershipExpiresAt: user.memberUntil,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
