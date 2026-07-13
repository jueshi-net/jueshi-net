import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TasksClient from "./tasks-client";
import WorkspaceRightRail from "@/components/workspace/WorkspaceRightRail";
import WorkspacePageFrame from "@/components/workspace/WorkspacePageFrame";

export const metadata: Metadata = {
  title: buildTitle("待办与任务"),
  description: "成长任务中心：完成日常任务获取成长值和勋章",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/workspace/tasks") },
};

const levelLabels: Record<string, string> = {
  lv1: "Lv.1 新手",
  lv2: "Lv.2 进阶",
  lv3: "Lv.3 精英",
  lv4: "Lv.4 大师",
  lv5: "Lv.5 传奇",
};

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/tasks");

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
      <TasksClient />
    </WorkspacePageFrame>
  );
}
