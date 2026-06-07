// GET /api/admin/users/[id]/badges — list user's awarded badges + all available badges
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  const { id } = await params;

  const [awards, allBadges] = await Promise.all([
    prisma.userBadgeAward.findMany({
      where: { userId: id },
      include: { badge: true },
      orderBy: { awardedAt: "desc" },
    }),
    prisma.userBadge.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return NextResponse.json({ awards, allBadges });
}
