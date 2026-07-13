import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DocumentsClientInner from "./documents-client-inner";
import WorkspaceRightRail from "@/components/workspace/WorkspaceRightRail";

const levelLabels: Record<string, string> = {
  lv1: "Lv.1 新手",
  lv2: "Lv.2 进阶",
  lv3: "Lv.3 精英",
  lv4: "Lv.4 大师",
  lv5: "Lv.5 传奇",
};

export const metadata: Metadata = {
  title: buildTitle("我的单据"),
  description: "查看和管理你保存的所有单据草稿。",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/workspace/documents") },
};

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/workspace/documents");
  }

  const userId = session.user.id;

  const results = await Promise.allSettled([
    prisma.notification.count({ where: { userId, readAt: null } }),
    prisma.userBadgeAward.count({ where: { userId } }),
    prisma.memo.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }),
    prisma.documentHistory.count({ where: { userId } }),
  ]);

  const [unreadNotifsRes, badgeCountRes, memosRes, docCountRes] = results;

  const unreadNotifs = unreadNotifsRes.status === "fulfilled" ? unreadNotifsRes.value : 0;
  const badgeCount = badgeCountRes.status === "fulfilled" ? badgeCountRes.value : 0;
  const recentMemos = memosRes.status === "fulfilled" ? memosRes.value : [];
  const docCount = docCountRes.status === "fulfilled" ? docCountRes.value : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6">
      <main>
        <DocumentsClientInner />
      </main>

      <WorkspaceRightRail
        unreadNotifs={unreadNotifs}
        badgeCount={badgeCount}
        recentMemos={recentMemos}
        userId={userId}
      />
    </div>
  );
}
