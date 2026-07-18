// GET /api/forum/admin/content-quality/queue - Prioritized maintenance queue
// Returns quality issues sorted by priority for admin action

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import {
  inspectContentQuality,
  buildMaintenanceQueue,
} from "@/lib/community/content-quality";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const checkBrokenLinks = searchParams.get("brokenLinks") === "1";

  const report = await inspectContentQuality({
    checkBrokenLinks,
  });

  const queue = buildMaintenanceQueue(report);

  return NextResponse.json({
    success: true,
    queue,
  });
}
