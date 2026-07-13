import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import NotificationsClient from "./notifications-client";
import WorkspaceRightRail from "@/components/workspace/WorkspaceRightRail";
import WorkspacePageFrame from "@/components/workspace/WorkspacePageFrame";

export const metadata: Metadata = {
  title: "通知中心 — 绝世百宝箱",
  description: "查看系统通知、任务提醒、等级升级等消息",
};

const levelLabels: Record<string, string> = {
  lv1: "Lv.1 新手",
  lv2: "Lv.2 进阶",
  lv3: "Lv.3 精英",
  lv4: "Lv.4 大师",
  lv5: "Lv.5 传奇",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/workspace/notifications");
  }

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
      <NotificationsClient />
    </WorkspacePageFrame>
  );
}
