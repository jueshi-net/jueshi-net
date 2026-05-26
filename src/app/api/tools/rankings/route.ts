// GET /api/tools/rankings — tool leaderboard

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all approved review stats per toolKey
    const reviewStats = await prisma.toolReview.groupBy({
      by: ["toolKey"],
      where: { status: "approved" },
      _avg: { rating: true },
      _count: { id: true },
    });

    // Get all favorite counts per toolKey
    const favStats = await prisma.toolFavorite.groupBy({
      by: ["toolKey"],
      _count: { id: true },
    });

    // Build maps
    const reviewMap = new Map<string, { avg: number; count: number }>();
    for (const r of reviewStats) {
      reviewMap.set(r.toolKey, {
        avg: r._avg.rating || 0,
        count: r._count.id,
      });
    }

    const favMap = new Map<string, number>();
    for (const f of favStats) {
      favMap.set(f.toolKey, f._count.id);
    }

    // Combine all toolKeys
    const allToolKeys = new Set([...reviewMap.keys(), ...favMap.keys()]);

    // Calculate scores and rank
    const rankings = [];
    for (const toolKey of allToolKeys) {
      const r = reviewMap.get(toolKey) || { avg: 0, count: 0 };
      const f = favMap.get(toolKey) || 0;

      // Score = avgRating * 20 + favorites * 2 + reviews * 3
      const score = r.avg * 20 + f * 2 + r.count * 3;

      rankings.push({
        toolKey,
        avgRating: Math.round(r.avg * 10) / 10,
        reviewCount: r.count,
        favoriteCount: f,
        score: Math.round(score * 10) / 10,
      });
    }

    // Sort by score descending, take top 20
    rankings.sort((a, b) => b.score - a.score);
    const top20 = rankings.slice(0, 20);

    return NextResponse.json({ rankings: top20 });
  } catch (error) {
    console.error("[Rankings GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
