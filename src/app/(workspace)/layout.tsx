import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserNavSidebar } from "@/components/user/UserSidebar";
import { WorkspaceProviders } from "@/components/user/WorkspaceProviders";
import WorkspaceMobileNav from "@/components/workspace/WorkspaceMobileNav";
import TopBar from "./topbar";

const levelLabels: Record<string, string> = {
  lv1: "Lv.1 新手",
  lv2: "Lv.2 进阶",
  lv3: "Lv.3 精英",
  lv4: "Lv.4 大师",
  lv5: "Lv.5 传奇",
};

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/workspace");
  }

  const userId = session.user.id;

  // Fetch user data for sidebar
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      levelKey: true,
      points: true,
      growthValue: true,
      checkinStreak: true,
      memberUntil: true,
    },
  });

  const displayName = user?.name?.split("@")[0] || user?.email?.split("@")[0] || "用户";
  const email = user?.email || "";
  const levelLabel = user?.levelKey && levelLabels[user.levelKey] ? levelLabels[user.levelKey] : "Lv.1 新手";
  const points = user?.points || 0;
  const growthValue = user?.growthValue || 0;
  const checkinStreak = user?.checkinStreak || 0;
  const isMember = user?.memberUntil && new Date(user.memberUntil) > new Date();

  const userAsset = {
    displayName,
    email,
    levelLabel,
    points,
    growthValue,
    checkinStreak,
    isMember,
  };

  return (
    <WorkspaceProviders>
      <div className="flex min-h-screen bg-[#F6F8FC]">
        <UserNavSidebar userAsset={userAsset} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto md:pb-0 pb-16">{children}</main>
        </div>
        <WorkspaceMobileNav />
      </div>
    </WorkspaceProviders>
  );
}
