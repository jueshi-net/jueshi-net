import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MemosClient from "./memos-client";
import WorkspacePageFrame from "@/components/workspace/WorkspacePageFrame";
import WorkspaceRightRail from "@/components/workspace/WorkspaceRightRail";

export const metadata: Metadata = {
  title: "备忘录 — 绝世百宝箱",
  description: "你的私人备忘录",
};

export default async function MemosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/memos");

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
      <MemosClient />
    </WorkspacePageFrame>
  );
}
