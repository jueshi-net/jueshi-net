import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BadgeManager } from "./badges-client";

export const dynamic = "force-dynamic";

export default async function AdminCommunityBadgesPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/login");

  const badges = await prisma.userBadge.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { awards: true } },
    },
  });

  return (
    <BadgeManager
      badges={badges.map((b: any) => ({
        id: b.id,
        key: b.key,
        name: b.name,
        description: b.description,
        iconText: b.iconText,
        color: b.color,
        category: b.category,
        conditionText: b.conditionText,
        isActive: b.isActive,
        sortOrder: b.sortOrder,
        awardCount: b._count.awards,
      }))}
    />
  );
}
