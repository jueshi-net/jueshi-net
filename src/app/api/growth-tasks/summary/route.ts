import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GROWTH_TASKS, getUserTaskStatus } from "@/lib/growth-tasks";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const taskStatus = await getUserTaskStatus(session.user.id);

  const activeTasks = GROWTH_TASKS.filter(t => t.isActive);
  const tasks = activeTasks.map(t => {
    const status = taskStatus.get(t.key);
    return {
      id: t.id,
      key: t.key,
      title: t.title,
      description: t.description,
      rewardGrowth: t.rewardGrowth,
      actionType: t.actionType,
      targetUrl: t.targetUrl,
      badgeKey: t.badgeKey,
      badgeName: t.badgeName,
      category: t.category,
      sortOrder: t.sortOrder,
      completed: status?.completed || false,
      count: status?.count || 0,
    };
  });

  const completedCount = tasks.filter(t => t.completed).length;

  // Level info
  const user = await (await import("@/lib/prisma")).prisma.user.findUnique({
    where: { id: session.user.id },
    select: { growthValue: true },
  });
  const growthValue = user?.growthValue ?? 0;

  const LEVELS = [
    { name: "Lv.1 新手", iconText: "⭐", color: "gray", minGrowth: 0, maxGrowth: 50 },
    { name: "Lv.2 进阶", iconText: "🌟", color: "blue", minGrowth: 50, maxGrowth: 200 },
    { name: "Lv.3 精英", iconText: "💎", color: "purple", minGrowth: 200, maxGrowth: 500 },
    { name: "Lv.4 大师", iconText: "👑", color: "amber", minGrowth: 500, maxGrowth: 1000 },
    { name: "Lv.5 传奇", iconText: "🏆", color: "red", minGrowth: 1000, maxGrowth: null },
  ];

  const level = LEVELS.find(l => l.maxGrowth === null || growthValue < l.maxGrowth) || LEVELS[LEVELS.length - 1];
  const levelIdx = LEVELS.indexOf(level);
  const nextLevel = levelIdx < LEVELS.length - 1 ? LEVELS[levelIdx + 1] : null;

  return NextResponse.json({
    success: true,
    tasks,
    completedCount,
    levelInfo: {
      growthValue,
      level: { ...level, maxGrowth: level.maxGrowth },
      nextLevel,
    },
  });
}

