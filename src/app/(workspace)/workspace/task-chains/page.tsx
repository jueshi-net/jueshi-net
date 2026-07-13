import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TaskChainsClient from "./task-chains-client";
import WorkspacePageFrame from "@/components/workspace/WorkspacePageFrame";
import WorkspaceRightRail from "@/components/workspace/WorkspaceRightRail";

export const metadata: Metadata = {
  title: buildTitle("任务链"),
  description: "管理你的跨境发货任务链，跟踪进度和生成的资料",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/workspace/task-chains") },
};

export default async function TaskChainsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/task-chains");

  const userId = session.user.id;

  const [unreadNotifs, badgeCount, recentMemos] = await Promise.all([
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
      <TaskChainsClient />
    </WorkspacePageFrame>
  );
}
