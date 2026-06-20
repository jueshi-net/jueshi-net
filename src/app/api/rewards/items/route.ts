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
    const rewardItems = await prisma.rewardItem.findMany({
      where: {
        enabled: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    // Transform to frontend format
    const items = rewardItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      costPoints: item.costPoints,
      rewardType: item.rewardType,
      rewardValue: item.rewardValue,
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
