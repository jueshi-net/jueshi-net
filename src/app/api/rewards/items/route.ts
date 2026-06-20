import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
    }

    // Fetch active reward items from database
    const rewardItems = await prisma.rewardRule.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to frontend format
    const items = rewardItems.map((rule) => ({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      costPoints: rule.costPoints,
      rewardType: rule.rewardType,
      rewardValue: rule.rewardValue,
      stock: rule.stock,
      redeemedCount: rule.redeemedCount,
    }));

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Failed to fetch reward items:", error);
    return NextResponse.json(
      { success: false, error: "获取奖励项失败" },
      { status: 500 }
    );
  }
}
