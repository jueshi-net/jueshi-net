// GET /api/forum/admin/analytics/export - Anonymized analytics CSV export
// Exports content, category, author, search, or summary reports

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { generateAnalyticsCsv } from "@/lib/community/analytics-export";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;
    const { session } = adminResult;
    const adminId = session.user.id;

    const { searchParams } = new URL(request.url);
    const reportType = (searchParams.get("type") || "summary") as
      | "content"
      | "category"
      | "author"
      | "search"
      | "summary";

    if (!["content", "category", "author", "search", "summary"].includes(reportType)) {
      return NextResponse.json(
        { error: "无效的报表类型" },
        { status: 400 }
      );
    }

    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;

    const result = await generateAnalyticsCsv({
      reportType,
      dateFrom,
      dateTo,
    });

    // Write audit log
    await prisma.moderationLog.create({
      data: {
        adminId,
        action: "export_csv",
        reason: `导出分析报表 type=${reportType}, records=${result.recordCount}`,
      },
    });

    return new NextResponse("\uFEFF" + result.csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    console.error("[Analytics Export Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
