// GET /api/forum/admin/content-quality - Content quality inspection report
// Returns all content quality issues found in published posts

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { inspectContentQuality } from "@/lib/community/content-quality";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const checkBrokenLinks = searchParams.get("brokenLinks") === "1";
  const maxBrokenLinkChecks = parseInt(
    searchParams.get("maxBrokenChecks") || "50",
    10
  );
  const expiredDays = searchParams.get("expiredDays")
    ? parseInt(searchParams.get("expiredDays")!, 10)
    : undefined;
  const noReplyDays = searchParams.get("noReplyDays")
    ? parseInt(searchParams.get("noReplyDays")!, 10)
    : undefined;
  const duplicateThreshold = searchParams.get("dupThreshold")
    ? parseFloat(searchParams.get("dupThreshold")!)
    : undefined;

  const report = await inspectContentQuality({
    checkBrokenLinks,
    maxBrokenLinkChecks,
    expiredDays,
    noReplyDays,
    duplicateThreshold,
  });

  return NextResponse.json({
    success: true,
    report,
  });
}
