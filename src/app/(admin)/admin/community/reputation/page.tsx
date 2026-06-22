import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { UserReputationManager } from "./reputation-client";

export const dynamic = "force-dynamic";

export default async function AdminCommunityReputationPage() {
  const authRes = await requireAdmin();
  if (authRes instanceof Response) return authRes;

  const [users, badges] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        honorScore: true,
        growthValue: true,
        levelKey: true,
        createdAt: true,
      },
      orderBy: { honorScore: "desc" },
      take: 50,
    }),
    prisma.userBadge.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const honorLogs = await prisma.honorLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <UserReputationManager
      initialUsers={users.map(u => ({ ...u, createdAt: u.createdAt.toISOString(), honorScore: u.honorScore ?? 0 }))}
      badges={badges.map(b => ({ ...b, createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString() }))}
      initialLogs={honorLogs.map(l => ({ ...l, createdAt: l.createdAt.toISOString(), user: { name: l.user.name, email: l.user.email } }))}
    />
  );
}
