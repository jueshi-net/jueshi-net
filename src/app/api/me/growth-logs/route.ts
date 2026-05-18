// GET /api/me/growth-logs — user's own growth logs (last 5)
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;

  const logs = await prisma.growthLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      type: true,
      value: true,
      reason: true,
      refType: true,
      refId: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, logs });
}
