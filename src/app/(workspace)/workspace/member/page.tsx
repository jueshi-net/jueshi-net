import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MemberClient from "./member-client";
import WorkspacePageFrame from "@/components/workspace/WorkspacePageFrame";
import WorkspaceRightRail from "@/components/workspace/WorkspaceRightRail";

export default async function MemberPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/member");

  const userId = session.user.id;

  const results = await Promise.allSettled([
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, memberUntil: true, growthValue: true, levelKey: true, points: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, memberUntil: true },
    }).then(async (u) => {
      const isMember = Boolean(u?.memberUntil && new Date(u.memberUntil) > new Date());
      const canUploadLogo = isMember;
      const canCloudDraft = isMember;
      const canExportWord = isMember;
      const canRemoveBranding = isMember;
      const companyProfilesMax = isMember ? 10 : 1;
      const maxDrafts = isMember ? 100 : 10;
      return {
        role: u?.role || "user",
        limits: {
          memoMax: isMember ? 50 : 10,
          companyProfilesMax,
          labelBatchMax: isMember ? 20 : 5,
          maxDrafts,
          canUploadLogo,
          canUseCustomStyle: isMember,
          canRemoveBranding,
          canCloudDraft,
          canExportWord,
          wordExportDailyLimit: isMember ? 50 : 0,
        },
        isMember,
        memberUntil: u?.memberUntil,
        points: 0,
      };
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
    prisma.userBadgeAward.count({ where: { userId } }),
    prisma.memo.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }),
  ]);

  const [user, permissions, unreadNotifsRes, badgeCountRes, memosRes] = results;

  const userData = user.status === "fulfilled" ? user.value : null;
  const perms = permissions.status === "fulfilled" ? permissions.value : null;
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
      <MemberClient userData={userData} permissions={perms} />
    </WorkspacePageFrame>
  );
}
