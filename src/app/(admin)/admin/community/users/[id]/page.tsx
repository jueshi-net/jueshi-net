import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AdminUserCommunityDetail } from "./detail-client";

export const dynamic = "force-dynamic";

export default async function AdminUserCommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authRes = await requireAdmin();
  if (authRes instanceof Response) return authRes;

  const { id } = await params;

  const [user, profile, stat, badgeAwards, allBadges, honorLogs] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        membershipTier: true,
        points: true,
        growthValue: true,
        levelKey: true,
        honorScore: true,
        createdAt: true,
      },
    }),
    prisma.userCommunityProfile.findUnique({ where: { userId: id } }),
    prisma.communityStat.findUnique({ where: { userId: id } }),
    prisma.userBadgeAward.findMany({
      where: { userId: id },
      include: { badge: true },
      orderBy: { awardedAt: "desc" },
    }),
    prisma.userBadge.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.honorLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  if (!user) notFound();

  return (
    <AdminUserCommunityDetail
      user={{ ...user, createdAt: user.createdAt.toISOString(), honorScore: user.honorScore ?? 0 }}
      profile={profile}
      stat={stat || null}
      badgeAwards={badgeAwards.map(a => ({ ...a, awardedAt: a.awardedAt.toISOString(), createdAt: a.createdAt.toISOString(), badge: { ...a.badge, createdAt: a.badge.createdAt.toISOString(), updatedAt: a.badge.updatedAt.toISOString() } }))}
      allBadges={allBadges.map(b => ({ ...b, createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString() }))}
      honorLogs={honorLogs.map(l => ({ ...l, createdAt: l.createdAt.toISOString() }))}
    />
  );
}
