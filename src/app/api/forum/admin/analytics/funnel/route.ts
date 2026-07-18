// GET /api/forum/admin/analytics/funnel - Content funnel analytics
// Returns content pipeline metrics with statistical notes

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { computeContentFunnel } from "@/lib/community/analytics-funnel";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { searchParams } = new URL(request.url);
    const days = Math.min(Math.max(parseInt(searchParams.get("days") || "30"), 1), 90);

    const result = await computeContentFunnel(days);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Forum Funnel Analytics Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
