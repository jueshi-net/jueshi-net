import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FavoritesClient from "./favorites-client";
import WorkspaceRightRail from "@/components/workspace/WorkspaceRightRail";
import WorkspacePageFrame from "@/components/workspace/WorkspacePageFrame";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/favorites");

  const userId = session.user.id;

  const results = await Promise.allSettled([
    prisma.userFavorite.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.notification.count({ where: { userId, readAt: null } }),
    prisma.userBadgeAward.count({ where: { userId } }),
    prisma.memo.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }),
  ]);

  const [favoritesRes, unreadNotifsRes, badgeCountRes, memosRes] = results;

  const favorites = favoritesRes.status === "fulfilled" ? favoritesRes.value : [];
  const unreadNotifs = unreadNotifsRes.status === "fulfilled" ? unreadNotifsRes.value : 0;
  const badgeCount = badgeCountRes.status === "fulfilled" ? badgeCountRes.value : 0;
  const recentMemos = memosRes.status === "fulfilled" ? memosRes.value : [];

  return (
    <WorkspacePageFrame
      rightRail={
        <WorkspaceRightRail
          unreadNotifs={unreadNotifs}
          badgeCount={badgeCount}
          recentMemos={recentMemos}
          userId={userId}
        />
      }
    >
      <FavoritesClient favorites={favorites} />
    </WorkspacePageFrame>
  );
}
