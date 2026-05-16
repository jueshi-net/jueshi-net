// GET /api/admin/tool-reviews — list all reviews (admin only)

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;

  try {
    const reviews = await prisma.toolReview.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        toolKey: true,
        rating: true,
        content: true,
        status: true,
        pointsAwarded: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
      },
    });

    const masked = reviews.map((r) => ({
      id: r.id,
      toolKey: r.toolKey,
      rating: r.rating,
      content: r.content,
      status: r.status,
      pointsAwarded: r.pointsAwarded,
      createdAt: r.createdAt.toISOString(),
      userEmail: r.user?.email || "未知",
      userName: r.user?.name || "",
    }));

    return NextResponse.json({ reviews: masked });
  } catch (error) {
    console.error("[Admin Reviews GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
