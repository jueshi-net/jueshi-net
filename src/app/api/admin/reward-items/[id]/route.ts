import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/admin/reward-items/[id] - Update a reward item
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await req.json();

    // Check if item exists
    const existing = await prisma.rewardItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "奖励项不存在" }, { status: 404 });
    }

    // Update item
    const item = await prisma.rewardItem.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.costPoints !== undefined && { costPoints: parseInt(body.costPoints) }),
        ...(body.rewardType !== undefined && { rewardType: body.rewardType }),
        ...(body.rewardValue !== undefined && { rewardValue: parseInt(body.rewardValue) }),
        ...(body.enabled !== undefined && { enabled: body.enabled }),
        ...(body.sortOrder !== undefined && { sortOrder: parseInt(body.sortOrder) }),
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Failed to update reward item:", error);
    return NextResponse.json(
      { error: "更新奖励项失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reward-items/[id] - Delete a reward item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if item exists
    const existing = await prisma.rewardItem.findUnique({
      where: { id },
      include: {
        _count: {
          select: { userRewards: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "奖励项不存在" }, { status: 404 });
    }

    // Check if item has been redeemed
    if (existing._count.userRewards > 0) {
      return NextResponse.json(
        { 
          error: `该奖励项已被兑换 ${existing._count.userRewards} 次，无法删除。建议改为停用。`,
        },
        { status: 400 }
      );
    }

    // Delete item
    await prisma.rewardItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete reward item:", error);
    return NextResponse.json(
      { error: "删除奖励项失败" },
      { status: 500 }
    );
  }
}
