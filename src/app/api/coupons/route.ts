// GET /api/coupons - Get user's coupon entitlements

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = session.user.id;
  const { prisma } = await import("@/lib/prisma");

  try {
    const coupons = await prisma.couponEntitlement.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        coupons,
      },
    });
  } catch (error) {
    console.error("Failed to fetch coupons:", error);
    return NextResponse.json(
      { error: "获取券类权益失败" },
      { status: 500 }
    );
  }
}
