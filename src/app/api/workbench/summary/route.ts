// GET /api/workbench/summary
// Returns aggregated workbench data for the current user

import { NextResponse } from "next/server";
import { requireLogin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { getRecommendedPackages, DEFAULT_RECOMMENDED_TOOLS } from "@/lib/workbench/recommendations";
import { getMaxLinks } from "@/lib/workbench/validation";

export async function GET(req: Request) {
  const res = await requireLogin();
  if ("error" in res) return res.error;

  const { session, role } = res;
  const userId = session.user.id;

  try {
    // Get user profile type
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileType: true, points: true, memberUntil: true, role: true },
    });

    // Get user's links
    const links = await prisma.workbenchLink.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        url: true,
        description: true,
        iconUrl: true,
        category: true,
        sortOrder: true,
      },
    });

    // Get user's tool favorites
    const favorites = await prisma.toolFavorite.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
      select: { toolKey: true, sortOrder: true },
    });

    // Get recommended tools (default if no favorites)
    const recommendedTools = favorites.length === 0
      ? DEFAULT_RECOMMENDED_TOOLS
      : [];

    // Get recommended packages based on profile type
    const recommendedPackages = getRecommendedPackages(user?.profileType || null);

    return NextResponse.json({
      profileType: user?.profileType || null,
      links,
      favorites,
      recommendedTools,
      recommendedPackages,
      limits: {
        maxLinks: getMaxLinks(role),
      },
      points: user?.points || 0,
      memberInfo: {
        isMember: user?.role === "member" && user?.memberUntil && user.memberUntil > new Date(),
        memberUntil: user?.memberUntil?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("[Workbench Summary Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
