// GET /api/forum/my-badges - Current user's earned badges
// Requires authentication.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { ensureForumBadges, checkAndGrantForumBadges, FORUM_BADGES } from "@/lib/community/forum-badges";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;
    const userId = session.user.id;

    // Ensure badge definitions exist
    await ensureForumBadges();

    // Auto-check and grant any earned badges
    const newlyGranted = await checkAndGrantForumBadges(userId);

    // Get all earned badges
    const awards = await prisma.userBadgeAward.findMany({
      where: { userId },
      include: {
        badge: {
          select: {
            key: true,
            name: true,
            description: true,
            iconText: true,
            color: true,
            category: true,
            conditionText: true,
          },
        },
      },
      orderBy: { awardedAt: "desc" },
    });

    // Get forum badges that haven't been earned yet
    const earnedKeys = new Set(awards.map((a) => a.badge.key));
    const unearnedForumBadges = FORUM_BADGES.filter(
      (def) => !earnedKeys.has(def.key)
    ).map((def) => ({
      key: def.key,
      name: def.name,
      description: def.description,
      iconText: def.iconText,
      color: def.color,
      conditionText: def.conditionText,
      earned: false,
    }));

    return NextResponse.json({
      earned: awards.map((a) => ({
        key: a.badge.key,
        name: a.badge.name,
        description: a.badge.description,
        iconText: a.badge.iconText,
        color: a.badge.color,
        category: a.badge.category,
        conditionText: a.badge.conditionText,
        awardedAt: a.awardedAt.toISOString(),
        reason: a.reason,
      })),
      unearned: unearnedForumBadges,
      newlyGranted,
    });
  } catch (error) {
    console.error("[My Badges GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
