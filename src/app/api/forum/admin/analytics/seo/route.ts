// GET /api/forum/admin/analytics/seo - SEO & crawl monitoring
// Returns read-only SEO health data

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { computeSeoMonitoring } from "@/lib/community/analytics-seo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const result = await computeSeoMonitoring();

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Forum SEO Monitoring Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
