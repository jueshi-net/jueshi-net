import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import TasksClient from "./tasks-client";
import { GROWTH_TASKS, getUserTaskStatus } from "@/lib/growth-tasks";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: buildTitle("成长任务中心"),
  description: "完成日常任务获取成长值和勋章，提升你的社区等级",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/dashboard/tasks") },
  openGraph: {
    title: buildTitle("成长任务中心"),
    description: "完成日常任务获取成长值和勋章，提升你的社区等级",
    url: buildCanonical("/dashboard/tasks"),
  },
};

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/tasks");
  }

  const taskStatus = await getUserTaskStatus(session.user.id);

  // Get user's growth value and level info
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
    levelInfo = {
      growthValue: user.growthValue,
      level,
      nextLevel,
    };
  }

  // Build task data with status
  const tasks = GROWTH_TASKS.filter(t => t.isActive).map(t => ({
    ...t,
    completed: taskStatus.get(t.key)?.completed || false,
    count: taskStatus.get(t.key)?.count || 0,
  }));

  return <TasksClient tasks={tasks} levelInfo={levelInfo} />;
}
