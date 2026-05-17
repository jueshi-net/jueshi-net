// PATCH /api/admin/tool-reviews/[id] — admin approve/reject/hide a review
// On approve: award +10 growth value, check for "first review" badge

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["approved", "rejected", "hidden"];

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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  const { id } = await params;

  try {
    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status 必须是 ${VALID_STATUSES.join(", ")} 之一` },
        { status: 400 }
      );
    }

    const existing = await prisma.toolReview.findUnique({
      where: { id },
      select: { status: true, userId: true, reviewedRewardedAt: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "短评不存在" }, { status: 404 });
    }

    // Update review status
    const review = await prisma.toolReview.update({
      where: { id },
      data: { status },
    });

    // Award growth value + badge on first approve
    if (status === "approved" && existing.status !== "approved" && !existing.reviewedRewardedAt) {
      const newGrowth = 10;
      const user = await prisma.user.findUnique({
        where: { id: existing.userId },
        select: { growthValue: true, levelKey: true },
      });
      if (user) {
        const totalGrowth = user.growthValue + newGrowth;
        const newLevel = await recalculateLevel(totalGrowth);

        await prisma.$transaction([
          prisma.user.update({
            where: { id: existing.userId },
            data: { growthValue: totalGrowth, levelKey: newLevel },
          }),
          prisma.growthLog.create({
            data: {
              userId: existing.userId,
              type: "review_approved",
              value: newGrowth,
              reason: "短评审核通过奖励",
              refType: "tool_review",
              refId: id,
            },
          }),
          prisma.toolReview.update({
            where: { id },
            data: { reviewedRewardedAt: new Date() },
          }),
        ]);

        // Award "热心点评" badge if first approved review
        const badge = await prisma.userBadge.findFirst({
          where: { key: "first_review", isActive: true },
          select: { id: true },
        });
        if (badge) {
          const existingAward = await prisma.userBadgeAward.findUnique({
            where: {
              userId_badgeId: { userId: existing.userId, badgeId: badge.id },
            },
          });
          if (!existingAward) {
            await prisma.userBadgeAward.create({
              data: {
                userId: existing.userId,
                badgeId: badge.id,
                reason: "首次提交点评并通过审核",
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ review: { id: review.id, status: review.status } });
  } catch (error) {
    console.error("[Admin Review PATCH Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
