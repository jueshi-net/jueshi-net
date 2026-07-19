// GET /api/forum/leaderboard - Public leaderboard
// Query params: type=active|honor|growth|answers, period=week|month, limit=20

import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/community/leaderboard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") || "active") as "active" | "honor" | "growth" | "answers";
    const period = (searchParams.get("period") || "week") as "week" | "month";
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const validTypes = ["active", "honor", "growth", "answers"];
    const validPeriods = ["week", "month"];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `无效的类型，支持: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: `无效的周期，支持: ${validPeriods.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await getLeaderboard(type, period, limit);

    // Cache for 1 hour (public, stale-while-revalidate)
    const response = NextResponse.json(result);
    response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600");
    return response;
  } catch (error) {
    console.error("[Leaderboard GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
