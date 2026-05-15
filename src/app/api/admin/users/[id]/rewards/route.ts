// GET /api/admin/users/[id]/rewards - Admin: view user's reward history

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "无权限" }, { status: 403 });

  const { id } = await params;

  const rewards = await prisma.userReward.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    include: { rewardItem: { select: { name: true, code: true } } },
  });

  return NextResponse.json({ rewards });
}
