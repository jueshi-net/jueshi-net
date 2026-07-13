import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WorkspaceRightRail from "@/components/workspace/WorkspaceRightRail";
import WorkspacePageFrame from "@/components/workspace/WorkspacePageFrame";
import { InvitesClient } from "./invites-client";

export const metadata: Metadata = {
  title: buildTitle("邀请增长中心"),
  description: "邀请好友注册，获得会员奖励",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/workspace/invites") },
};

export default async function InvitesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/invites");

  const userId = session.user.id;

  const results = await Promise.allSettled([
    prisma.notification.count({ where: { userId, readAt: null } }),
    prisma.userBadgeAward.count({ where: { userId } }),
    prisma.memo.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }),
  ]);

  const [unreadNotifsRes, badgeCountRes, memosRes] = results;

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
      <InvitesClient />
    </WorkspacePageFrame>
  );
}
