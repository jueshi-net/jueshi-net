// GET /api/forum/admin/analytics/authors - Author growth analytics
// Returns anonymized author activity metrics

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { computeAuthorGrowth } from "@/lib/community/analytics-author";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { searchParams } = new URL(request.url);
    const days = Math.min(Math.max(parseInt(searchParams.get("days") || "30"), 1), 90);

    const result = await computeAuthorGrowth(days);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Forum Author Analytics Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
