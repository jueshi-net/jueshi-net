// POST /api/events — track user events (Tool_View, Document_Save, Document_Export, etc.)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, toolSlug, source, exportType, saveMode, ...rest } = body;

    // Map modern event names to EventLog.eventType
    const eventTypeMap: Record<string, string> = {
      Tool_View: "tool_view",
      Tool_Click: "tool_click",
      Document_Save: "document_save",
      Document_Export: "document_export",
    };

    const eventType = eventTypeMap[event] || event || "unknown";

    // Get session ID for anonymous tracking
    const session = await auth();
    const userId = session?.user?.id || null;

    // Create event log entry
    await prisma.eventLog.create({
      data: {
        eventType,
        toolName: toolSlug || null,
        action: source || null,
        sessionId: userId ? null : (rest.sessionId || null),
        // For authenticated users, we don't need sessionId
      },
    });

    // Update ToolMetricDaily for save events
    if (event === "Document_Save" && toolSlug) {
      const today = new Date().toISOString().split("T")[0];
      await prisma.toolMetricDaily.upsert({
        where: {
          toolSlug_date: { toolSlug, date: new Date(today) },
        },
        update: { saves: { increment: 1 } },
        create: {
          toolSlug,
          date: new Date(today),
          views: 0,
          clicks: 0,
          saves: 1,
        },
      });
    }

    // Update ToolMetricDaily for view events
    if (event === "Tool_View" && toolSlug) {
      const today = new Date().toISOString().split("T")[0];
      await prisma.toolMetricDaily.upsert({
        where: {
          toolSlug_date: { toolSlug, date: new Date(today) },
        },
        update: { views: { increment: 1 } },
        create: {
          toolSlug,
          date: new Date(today),
          views: 1,
          clicks: 0,
          saves: 0,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
