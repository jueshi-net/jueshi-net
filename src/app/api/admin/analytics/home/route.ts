import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range");
    const daysParam = searchParams.get("days");

    let days = 7;
    if (range === "today") days = 1;
    else if (range === "7d") days = 7;
    else if (range === "30d") days = 30;
    else if (daysParam) days = parseInt(daysParam, 10) || 7;

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const [events, adStats, totalEvents] = await Promise.all([
      prisma.eventLog.groupBy({
        by: ["eventType"],
        where: { createdAt: { gte: since } },
        _count: { eventType: true },
      }),
      prisma.adCampaign.findMany({
        select: { id: true, title: true, impressions: true, clicks: true },
        orderBy: { impressions: "desc" },
        take: 20,
      }),
      prisma.eventLog.count({ where: { createdAt: { gte: since } } }),
    ]);

    const eventStats = events.map((e) => ({
      eventType: e.eventType,
      count: e._count.eventType,
    }));

    const summary = {
      totalEvents,
      toolClicks: eventStats.find((e) => e.eventType === "Tool_Click")?.count || 0,
      searchSubmits: eventStats.find((e) => e.eventType === "Search_Submit")?.count || 0,
      registerClicks: eventStats.find((e) => e.eventType === "Register_Click")?.count || 0,
      memberUpgradeClicks: eventStats.find((e) => e.eventType === "Member_Upgrade_Click")?.count || 0,
    };

    return NextResponse.json({
      ok: true,
      range: range || `${days}d`,
      summary,
      events: eventStats,
      ads: adStats,
      since,
    });
  } catch (err) {
    console.error("Analytics API Error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch analytics", details: (err as Error).message },
      { status: 500 }
    );
  }
}
