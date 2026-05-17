// POST /api/admin/users/[id]/growth-adjust — adjust user growth value
// POST /api/admin/users/[id]/badges — award badge to user
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

async function recalculateLevel(growthValue: number): Promise<string> {
  const levels = await prisma.userLevel.findMany({
    where: { isActive: true },
    orderBy: { minGrowth: "desc" },
    select: { key: true, minGrowth: true },
  });
  for (const l of levels) {
    if (growthValue >= l.minGrowth) return l.key;
  }
  return "lv1";
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  const { id } = await params;
  const body = await req.json();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ success: false, error: "用户不存在" }, { status: 404 });

  // Growth adjustment
  if (body.growthAdjust != null) {
    const newValue = user.growthValue + body.growthAdjust;
    const newLevel = await recalculateLevel(newValue);
    await prisma.$transaction([
      prisma.user.update({ where: { id }, data: { growthValue: newValue, levelKey: newLevel } }),
      prisma.growthLog.create({
        data: { userId: id, type: "admin_adjust", value: body.growthAdjust, reason: body.reason || "后台调整" },
      }),
    ]);
    return NextResponse.json({ success: true, data: { growthValue: newValue, levelKey: newLevel } });
  }

  // Badge award
  if (body.badgeId) {
    const existing = await prisma.userBadgeAward.findUnique({
      where: { userId_badgeId: { userId: id, badgeId: body.badgeId } },
    });
    if (existing) return NextResponse.json({ success: false, error: "已授予过该勋章" }, { status: 409 });
    const award = await prisma.userBadgeAward.create({
      data: { userId: id, badgeId: body.badgeId, reason: body.reason || "后台手动授予" },
    });
    return NextResponse.json({ success: true, data: award }, { status: 201 });
  }

  return NextResponse.json({ success: false, error: "需要 growthAdjust 或 badgeId" }, { status: 400 });
}
