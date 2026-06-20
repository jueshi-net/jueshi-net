import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/reward-items - List all reward items
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 });
    }

    const items = await prisma.rewardItem.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { userRewards: true },
        },
      },
    });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Failed to fetch reward items:", error);
    return NextResponse.json(
      { error: "获取奖励项列表失败" },
      { status: 500 }
    );
  }
}

// POST /api/admin/reward-items - Create a new reward item
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 });
    }

    const body = await req.json();
    const { code, name, description, costPoints, rewardType, rewardValue, enabled, sortOrder } = body;

    // Validation
    if (!code || !name || costPoints === undefined || !rewardType || rewardValue === undefined) {
      return NextResponse.json(
        { error: "缺少必填字段" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.rewardItem.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: `唯一标识 "${code}" 已存在` },
        { status: 400 }
      );
    }

    const item = await prisma.rewardItem.create({
      data: {
        code,
        name,
        description,
        costPoints: parseInt(costPoints),
        rewardType,
        rewardValue: parseInt(rewardValue),
        enabled: enabled ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Failed to create reward item:", error);
    return NextResponse.json(
      { error: "创建奖励项失败" },
      { status: 500 }
    );
  }
}
