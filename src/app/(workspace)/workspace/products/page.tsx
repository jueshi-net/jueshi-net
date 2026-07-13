import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WorkspacePageFrame from "@/components/workspace/WorkspacePageFrame";
import WorkspaceRightRail from "@/components/workspace/WorkspaceRightRail";
import ProductsClient from "./products-client";

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/products");

  const userId = session.user.id;

  const [unreadNotifs, badgeCount, recentMemos] = await Promise.all([
    prisma.notification.count({ where: { userId, readAt: null } }).catch(() => 0),
    prisma.userBadgeAward.count({ where: { userId } }).catch(() => 0),
    prisma.memo.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }).catch(() => []),
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
      <ProductsClient />
    </WorkspacePageFrame>
  );
}
