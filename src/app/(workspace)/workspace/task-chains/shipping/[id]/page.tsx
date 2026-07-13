import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ShippingWorkbench from "./shipping-workbench";
import WorkspacePageFrame from "@/components/workspace/WorkspacePageFrame";
import WorkspaceRightRail from "@/components/workspace/WorkspaceRightRail";

export const metadata: Metadata = {
  title: buildTitle("发货任务工作台"),
  description: "跨境发货10步骤工作台",
  robots: { index: false, follow: false },
};

export default async function ShippingWorkbenchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/task-chains");

  const { id } = await params;
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
      <ShippingWorkbench taskId={id} />
    </WorkspacePageFrame>
  );
}
