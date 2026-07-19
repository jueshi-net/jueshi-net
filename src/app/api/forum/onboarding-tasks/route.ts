// GET /api/forum/onboarding-tasks - User's onboarding task progress
// Requires authentication.

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { getOnboardingProgress, checkAndCompleteOnboardingTasks } from "@/lib/community/onboarding-tasks";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;

    // Auto-check and complete tasks based on current activity
    await checkAndCompleteOnboardingTasks(session.user.id);

    const progress = await getOnboardingProgress(session.user.id);

    const completed = progress.filter((t) => t.status === "done").length;
    const total = progress.length;

    return NextResponse.json({
      tasks: progress,
      completed,
      total,
      allDone: completed === total,
    });
  } catch (error) {
    console.error("[Onboarding Tasks GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// POST /api/forum/onboarding-tasks - Mark a task as complete manually
// body: { taskSlug: string }
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;

    const body = await request.json();
    const { taskSlug } = body as { taskSlug: string };

    if (!taskSlug || typeof taskSlug !== "string") {
      return NextResponse.json({ error: "缺少 taskSlug" }, { status: 400 });
    }

    // Only allow manual completion for "read_rules" task
    // Other tasks are auto-completed via events
    if (taskSlug !== "forum_read_rules") {
      return NextResponse.json(
        { error: "此任务需要通过实际操作完成，不支持手动标记" },
        { status: 400 }
      );
    }

    const { completeOnboardingTask } = await import("@/lib/community/onboarding-tasks");
    const result = await completeOnboardingTask(session.user.id, taskSlug);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[Onboarding Tasks POST Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
