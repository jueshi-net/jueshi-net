import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import TasksClient from "./tasks-client";
import { GROWTH_TASKS, getUserTaskStatus } from "@/lib/growth-tasks";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: buildTitle("待办与任务"),
  description: "成长任务中心：完成日常任务获取成长值和勋章",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/dashboard/tasks") },
  openGraph: {
    title: buildTitle("待办与任务"),
    description: "成长任务中心：完成日常任务获取成长值和勋章",
    url: buildCanonical("/dashboard/tasks"),
  },
};

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/tasks");
  }

  const taskStatus = await getUserTaskStatus(session.user.id);

  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { growthValue: true, levelKey: true },
  });

  let levelInfo = null;
  if (user?.levelKey) {
    const level = await prisma.userLevel.findUnique({
      where: { key: user.levelKey },
      select: { name: true, iconText: true, color: true, minGrowth: true, maxGrowth: true },
    });
    const nextLevel = await prisma.userLevel.findFirst({
      where: { minGrowth: { gt: user.growthValue }, isActive: true },
      orderBy: { minGrowth: "asc" },
      select: { name: true, iconText: true, color: true, minGrowth: true },
    });
    levelInfo = { growthValue: user.growthValue, level, nextLevel };
  }

  const tasks = GROWTH_TASKS.filter(t => t.isActive).map(t => ({
    ...t,
    completed: taskStatus.get(t.key)?.completed || false,
    count: taskStatus.get(t.key)?.count || 0,
  }));

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Top bar — breadcrumb hidden on mobile */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600 transition-colors">首页</a>
            <span className="text-gray-300">›</span>
            <span className="text-gray-700 font-medium">待办与任务</span>
          </div>
          <span className="md:hidden text-sm font-bold text-gray-900 tracking-tight">待办与任务</span>
          <div className="w-8" />
        </div>
      </div>
      <UserNavSidebar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5 lg:ml-0">
        <TasksClient tasks={tasks} levelInfo={levelInfo} />
      </div>
    </div>
  );
}

import { UserNavSidebar } from "@/components/user/UserSidebar";

function UserCenterShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <>
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <a href="/" className="hover:text-gray-600 transition-colors">首页</a>
            <span>›</span>
            <span className="text-gray-700 font-medium">{title}</span>
          </p>
        </div>
      </div>
      <UserNavSidebar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">{children}</div>
    </>
  );
}
