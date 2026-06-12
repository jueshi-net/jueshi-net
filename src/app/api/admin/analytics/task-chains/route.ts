import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // 验证管理员权限
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const role = (session.user as any).role || "";
  if (!["管理员", "ADMIN", "admin"].includes(role)) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  try {
    // 解析 date range 参数
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
    // "all" 不加日期过滤

    // 1. TaskChainDraft 基础统计
    const taskChainStats = await prisma.taskChainDraft.aggregate({
      where: range === "all" ? {} : { createdAt: dateFilter },
      _count: true,
    });

    const taskChainByStatus = await prisma.taskChainDraft.groupBy({
      by: ["status"],
      where: range === "all" ? {} : { createdAt: dateFilter },
      _count: true,
    });

    // 2. 最近 24h / 7d / 30d 新增
    const last24h = await prisma.taskChainDraft.count({
      where: { createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
    });

    const last7d = await prisma.taskChainDraft.count({
      where: { createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } },
    });

    const last30d = await prisma.taskChainDraft.count({
      where: { createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
    });

    // 3. sourceTool 分布
    const sourceToolDist = await prisma.taskChainDraft.groupBy({
      by: ["sourceTool"],
      where: range === "all" ? {} : { createdAt: dateFilter },
      _count: true,
    });

    // 4. lastActiveTool 分布
    const lastActiveToolDist = await prisma.taskChainDraft.groupBy({
      by: ["lastActiveTool"],
      where: range === "all" ? {} : { createdAt: dateFilter },
      _count: true,
    });

    // 5. EventLog 统计
    const eventLogStats = await prisma.eventLog.groupBy({
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

    // 6. 核心工具漏斗（7 个工具）
    const coreTools = [
      "hs-code",
      "exchange-rate",
      "postal-code",
      "address-formatter",
      "shipping-calculator",
      "commercial-invoice",
      "quotation",
    ];

    const funnelData = await Promise.all(
      coreTools.map(async (tool) => {
        const toolEvents = await prisma.eventLog.groupBy({
          by: ["eventType"],
          where: {
            toolName: tool,
            ...(range === "all" ? {} : { createdAt: dateFilter }),
          },
          _count: true,
        });

        const taskChainEvents = await prisma.eventLog.groupBy({
          by: ["eventType"],
          where: {
            OR: [
              { toolName: tool },
              { action: { contains: tool } },
            ],
            eventType: {
              in: [
                "task_chain_save_context",
                "task_chain_next_click",
                "task_chain_workspace_save_success",
                "task_chain_workspace_resume_click",
              ],
            },
            ...(range === "all" ? {} : { createdAt: dateFilter }),
          },
          _count: true,
        });

        return {
          tool,
          toolEvents,
          taskChainEvents,
        };
      })
    );

    // 7. 最新 20 条 TaskChainDraft
    const recentTaskChains = await prisma.taskChainDraft.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        userId: true,
        title: true,
        status: true,
        sourceTool: true,
        lastActiveTool: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 8. 最新 50 条 task_chain 事件
    const recentEvents = await prisma.eventLog.findMany({
      where: {
        eventType: {
          contains: "task_chain",
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        eventType: true,
        toolName: true,
        action: true,
        path: true,
        createdAt: true,
      },
    });

    // 计算转化率
    const saveContextCount = eventLogStats.find(e => e.eventType === "task_chain_save_context")?._count || 0;
    const saveSuccessCount = eventLogStats.find(e => e.eventType === "task_chain_workspace_save_success")?._count || 0;
    const resumeClickCount = eventLogStats.find(e => e.eventType === "task_chain_workspace_resume_click")?._count || 0;

    const saveToWorkspaceRate = saveContextCount > 0 ? (saveSuccessCount / saveContextCount * 100).toFixed(2) : "N/A";
    const resumeRate = saveSuccessCount > 0 ? (resumeClickCount / saveSuccessCount * 100).toFixed(2) : "N/A";

    return NextResponse.json({
      success: true,
      range,
      summary: {
        total: taskChainStats._count,
        byStatus: taskChainByStatus,
        last24h,
        last7d,
        last30d,
        sourceToolDist,
        lastActiveToolDist,
      },
      eventCounts: eventLogStats,
      funnelData,
      conversionRates: {
        saveToWorkspaceRate,
        resumeRate,
        saveContextCount,
        saveSuccessCount,
        resumeClickCount,
      },
      recentTaskChains,
      recentEvents,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/analytics/task-chains]", err);
    return NextResponse.json(
      { error: "查询失败", details: err.message },
      { status: 500 }
    );
  }
}
