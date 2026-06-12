import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: NextRequest) {
  // Admin-only check
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const role = (session.user as any).role || "";
  if (!["管理员", "ADMIN", "admin"].includes(role)) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7d";

    let dateFilter: any = {};
    const now = new Date();

    if (range === "today") {
      dateFilter = { gte: new Date(now.setHours(0, 0, 0, 0)) };
    } else if (range === "7d") {
      dateFilter = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    } else if (range === "30d") {
      dateFilter = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }

    const where = range === "all" ? {} : { createdAt: dateFilter };

    // 1. Summary by status
    const byStatus = await prisma.taskChainDraft.groupBy({
      by: ["status"],
      where,
      _count: true,
    });

    const total = byStatus.reduce((sum, s) => sum + s._count, 0);

    // 2. Source tool distribution
    const sourceToolDist = await prisma.taskChainDraft.groupBy({
      by: ["sourceTool"],
      where,
      _count: true,
    });

    // 3. Event counts
    const eventCounts = await prisma.eventLog.groupBy({
      by: ["eventType"],
      where: {
        eventType: {
          in: [
            "task_chain_save_context",
            "task_chain_next_click",
            "task_chain_workspace_save_success",
            "task_chain_workspace_save_failed",
            "task_chain_workspace_limit_hit",
            "task_chain_workspace_resume_click",
            "task_chain_archive",
            "task_chain_delete",
            "task_chain_prefill_accept",
            "task_chain_prefill_reject",
            "task_chain_local_continue",
          ],
        },
        ...(range === "all" ? {} : { createdAt: dateFilter }),
      },
      _count: true,
    });

    const getEventCount = (type: string) =>
      eventCounts.find((e) => e.eventType === type)?._count || 0;

    const saveContextCount = getEventCount("task_chain_save_context");
    const saveSuccessCount = getEventCount("task_chain_workspace_save_success");
    const resumeClickCount = getEventCount("task_chain_workspace_resume_click");

    const saveRate =
      saveContextCount > 0
        ? ((saveSuccessCount / saveContextCount) * 100).toFixed(2) + "%"
        : "N/A";
    const resumeRate =
      saveSuccessCount > 0
        ? ((resumeClickCount / saveSuccessCount) * 100).toFixed(2) + "%"
        : "N/A";

    // Build CSV
    const lines: string[] = [];

    // Section 1: Summary
    lines.push("=== Summary ===");
    lines.push("Metric,Value");
    lines.push(`Range,${range}`);
    lines.push(`Total,${total}`);
    for (const s of byStatus) {
      lines.push(`Status: ${s.status},${s._count}`);
    }
    lines.push("");

    // Section 2: Conversion Rates
    lines.push("=== Conversion Rates ===");
    lines.push("Metric,Value,Numerator,Denominator");
    lines.push(`Save-to-Workspace,${saveRate},${saveSuccessCount},${saveContextCount}`);
    lines.push(`Resume,${resumeRate},${resumeClickCount},${saveSuccessCount}`);
    lines.push("");

    // Section 3: Event Counts
    lines.push("=== Event Counts ===");
    lines.push("Event Type,Count");
    for (const e of eventCounts) {
      lines.push(`${escapeCsvField(e.eventType)},${e._count}`);
    }
    lines.push("");

    // Section 4: Source Tool Distribution
    lines.push("=== Source Tool Distribution ===");
    lines.push("Source Tool,Count");
    for (const s of sourceToolDist) {
      lines.push(`${escapeCsvField(s.sourceTool || "(none)")},${s._count}`);
    }

    const csv = lines.join("\n");
    const dateStr = now.toISOString().split("T")[0];
    const filename = `task-chain-analytics-${range}-${dateStr}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("[GET /api/admin/analytics/task-chains.csv]", err);
    return NextResponse.json(
      { error: "CSV 导出失败", details: err.message },
      { status: 500 }
    );
  }
}
