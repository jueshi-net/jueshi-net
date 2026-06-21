// POST /api/admin/rewards/redemptions/[id]/audit - Audit a redemption (admin only)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  const { prisma } = await import("@/lib/prisma");
  const { id } = await params;

  try {
    const body = await req.json();
    const { action, note } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "无效的操作" }, { status: 400 });
    }

    const redemption = await prisma.userReward.findUnique({
      where: { id },
      include: {
        rewardItem: true,
      },
    });

    if (!redemption) {
      return NextResponse.json({ error: "兑换记录不存在" }, { status: 404 });
    }

    if (redemption.auditStatus !== "pending") {
      return NextResponse.json({ error: "该记录不在待审核状态" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "active" : "rejected";
    const newAuditStatus = action === "approve" ? "approved" : "rejected";

    await prisma.userReward.update({
      where: { id },
      data: {
        status: newStatus,
        auditStatus: newAuditStatus,
        auditNote: note || null,
      },
    });

    // If approved, execute fulfillment
    if (action === "approve") {
      // Import fulfillment functions
      const { fulfillReward } = await import("@/lib/rewards/fulfillment");
      await fulfillReward(prisma, redemption.userId, redemption.rewardItem, redemption);
    }

    return NextResponse.json({
      success: true,
      data: {
        id,
        status: newStatus,
        auditStatus: newAuditStatus,
      },
    });
  } catch (error: any) {
    console.error("Failed to audit redemption:", error);
    return NextResponse.json(
      { error: error.message || "审核失败" },
      { status: 500 }
    );
  }
}
