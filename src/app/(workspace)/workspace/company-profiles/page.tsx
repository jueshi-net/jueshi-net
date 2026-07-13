import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CompanyProfilesClient from "./company-profiles-client";
import WorkspacePageFrame from "@/components/workspace/WorkspacePageFrame";
import WorkspaceRightRail from "@/components/workspace/WorkspaceRightRail";

export default async function CompanyProfilesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/company-profiles");

  const userId = session.user.id;

  const [profiles, user, unreadNotifs, badgeCount, recentMemos] = await Promise.all([
    prisma.userCompanyProfile.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }).catch(() => []),
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, memberUntil: true },
    }).catch(() => null),
    prisma.notification.count({
      where: { userId, readAt: null },
    }).catch(() => 0),
    prisma.userBadgeAward.count({
      where: { userId },
    }).catch(() => 0),
    prisma.memo.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }).catch(() => []),
  ]);

  const isMember = Boolean(user?.memberUntil && new Date(user.memberUntil) > new Date());

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
      <CompanyProfilesClient profiles={profiles} isMember={isMember} />
    </WorkspacePageFrame>
  );
}
