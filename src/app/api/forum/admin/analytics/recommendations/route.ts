// GET /api/forum/admin/analytics/recommendations - Growth recommendations
// Returns rule-based, explainable recommendations

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { computeGrowthRecommendations } from "@/lib/community/growth-recommendations";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { searchParams } = new URL(request.url);
    const days = Math.min(Math.max(parseInt(searchParams.get("days") || "30"), 1), 90);

    const result = await computeGrowthRecommendations(days);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Forum Recommendations Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
