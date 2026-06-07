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
  const tasks = activeTasks.map(t => ({
    key: t.key,
    title: t.title,
    completed: taskStatus.get(t.key)?.completed || false,
    url: t.targetUrl,
  }));

  const completedCount = tasks.filter(t => t.completed).length;

  return NextResponse.json({ success: true, tasks, completedCount });
}
