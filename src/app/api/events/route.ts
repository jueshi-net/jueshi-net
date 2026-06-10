import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 提取 toolSlug 的优先级逻辑
function extractToolSlug(body: any): string | null {
  return (
    body.toolSlug ||
    body.metadata?.toolSlug ||
    body.toolKey ||
    body.toolName ||
    body.metadata?.toolName ||
    null
  );
}

// 事件到 ToolMetricDaily 字段的映射
const METRIC_MAP: Record<string, string> = {
  Tool_View: "views",
  Tool_Click: "clicks",
  Document_Save: "saves",
  Favorite_Tool: "favorites",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventType, action, toolName, path, sessionId, ...rest } = body;
    const toolSlug = extractToolSlug(body);

    // Serialize remaining fields (checklistSlug, toolSlug, sourcePath, etc.) as JSON metadata
    const metadata = Object.keys(rest).length > 0 ? JSON.stringify(rest) : null;
    // Combine action + metadata: if both exist, action gets priority and metadata is appended
    const actionValue = action?.toString() || null;
    // If there's extra metadata, store it alongside the action for debugging
    const storedAction = metadata ? `${actionValue || ""} | metadata: ${metadata}` : actionValue;

    // 1. 主流程：写入 EventLog (始终尝试)
    await prisma.eventLog.create({
      data: {
        eventType: eventType?.toString() || "unknown",
        toolName: toolName?.toString() || null,
        path: path?.toString() || null,
        sessionId: sessionId?.toString() || null,
        action: storedAction,
      },
    });

    // 2. 副流程：如果事件属于指标类型且有 toolSlug，upsert ToolMetricDaily
    const eventKey = eventType?.toString() || "";
    if (toolSlug && METRIC_MAP[eventKey]) {
      const metricField = METRIC_MAP[eventKey];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 使用 fire-and-forget 模式避免阻塞 EventLog 响应，但为调试可加 await
      // 根据要求：try/catch 包裹，失败不报错
      try {
        await prisma.toolMetricDaily.upsert({
          where: { toolSlug_date: { toolSlug, date: today } },
          update: { [metricField]: { increment: 1 } },
          create: {
            toolSlug,
            date: today,
            [metricField]: 1,
          },
        });
      } catch (metricErr) {
        console.error("[Events] ToolMetricDaily upsert failed:", metricErr);
        // 不影响主流程
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
  }
}
