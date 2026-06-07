import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: true, data: { subscribed: false } });
    }

    const sub = await prisma.userSubscription.findFirst({
      where: {
        userId: session.user.id as string,
        status: "active",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        subscribed: !!sub,
        subscription: sub ? {
          id: sub.id,
          status: sub.status,
          startDate: sub.startDate.toISOString(),
          endDate: sub.endDate?.toISOString() || null,
        } : null,
      },
    });
  } catch (error) {
    console.error("Subscription check error:", error);
    return NextResponse.json({ success: false, error: "查询失败" }, { status: 500 });
  }
}
