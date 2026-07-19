/**
 * Forum V1.5 - New User Onboarding Tasks
 *
 * Reuses the existing UserTask model (no schema changes).
 * Creates 5 guided tasks for new forum users:
 *   1. complete_profile  - Fill in community profile (bio)
 *   2. first_post        - Publish first post
 *   3. first_comment     - Post first comment
 *   4. first_like        - Like a post or comment
 *   5. read_rules        - Visit the community rules page
 *
 * Tasks are created idempotently (only once per user).
 * Completion is checked via events or manual marking.
 */

import { prisma } from "@/lib/prisma";
import { grantBadge } from "./forum-badges";

export interface OnboardingTaskDef {
  slug: string;
  title: string;
  description: string;
}

export const ONBOARDING_TASKS: OnboardingTaskDef[] = [
  {
    slug: "forum_complete_profile",
    title: "完善社区资料",
    description: "填写个人简介，让其他用户更好地认识你",
  },
  {
    slug: "forum_first_post",
    title: "发布第一篇帖子",
    description: "分享你的经验或提出问题，开启社区之旅",
  },
  {
    slug: "forum_first_comment",
    title: "发表第一条评论",
    description: "回复他人的帖子，参与社区讨论",
  },
  {
    slug: "forum_first_like",
    title: "点赞一条内容",
    description: "为你觉得有用的内容点赞",
  },
  {
    slug: "forum_read_rules",
    title: "浏览社区规则",
    description: "了解社区规范，共同维护良好环境",
  },
];

const TASK_SLUGS = ONBOARDING_TASKS.map((t) => t.slug);

/**
 * Ensure onboarding tasks exist for a user (idempotent).
 * Only creates tasks that don't already exist.
 * Called when user visits /bbs for the first time.
 */
export async function ensureOnboardingTasks(userId: string): Promise<void> {
  // Check if any onboarding tasks already exist for this user
  const existingCount = await prisma.userTask.count({
    where: {
      userId,
      title: { in: ONBOARDING_TASKS.map((t) => t.title) },
    },
  });

  if (existingCount >= ONBOARDING_TASKS.length) {
    return; // All tasks already exist
  }

  // Find which tasks are missing
  const existingTitles = await prisma.userTask.findMany({
    where: {
      userId,
      title: { in: ONBOARDING_TASKS.map((t) => t.title) },
    },
    select: { title: true },
  });

  const existingTitleSet = new Set(existingTitles.map((t) => t.title));
  const missingTasks = ONBOARDING_TASKS.filter((t) => !existingTitleSet.has(t.title));

  if (missingTasks.length === 0) return;

  // Create missing tasks
  await prisma.userTask.createMany({
    data: missingTasks.map((task, index) => ({
      userId,
      title: task.title,
      description: task.description,
      status: "pending",
      priority: index === 0 ? "high" : "normal",
    })),
  });
}

/**
 * Mark an onboarding task as completed.
 * Called when the corresponding event occurs.
 */
export async function completeOnboardingTask(
  userId: string,
  taskSlug: string
): Promise<{ completed: boolean; allDone: boolean }> {
  const taskDef = ONBOARDING_TASKS.find((t) => t.slug === taskSlug);
  if (!taskDef) return { completed: false, allDone: false };

  // Find the task by title
  const task = await prisma.userTask.findFirst({
    where: {
      userId,
      title: taskDef.title,
      status: "pending",
    },
  });

  if (!task) {
    // Task already done or doesn't exist
    return { completed: false, allDone: false };
  }

  await prisma.userTask.update({
    where: { id: task.id },
    data: { status: "done" },
  });

  // Check if all onboarding tasks are now done
  const pendingCount = await prisma.userTask.count({
    where: {
      userId,
      title: { in: ONBOARDING_TASKS.map((t) => t.title) },
      status: "pending",
    },
  });

  const allDone = pendingCount === 0;

  // If all done, grant the onboarding completion badge
  if (allDone) {
    // Grant a special "onboarding complete" badge
    // We use the existing badge system with a custom key
    await prisma.userBadge.upsert({
      where: { key: "forum_onboarding_complete" },
      create: {
        key: "forum_onboarding_complete",
        name: "社区新星",
        description: "完成所有新人引导任务",
        iconText: "🌟",
        color: "indigo-500",
        category: "forum",
        conditionText: "完成所有新人引导任务",
        isActive: true,
        sortOrder: 100,
      },
      update: {},
    });

    await grantBadge(userId, "forum_onboarding_complete", "完成新人引导任务自动授予");
  }

  return { completed: true, allDone };
}

/**
 * Get onboarding task progress for a user.
 * Returns all onboarding tasks with their current status.
 */
export async function getOnboardingProgress(userId: string) {
  await ensureOnboardingTasks(userId);

  const tasks = await prisma.userTask.findMany({
    where: {
      userId,
      title: { in: ONBOARDING_TASKS.map((t) => t.title) },
    },
    orderBy: { createdAt: "asc" },
  });

  const taskMap = new Map(tasks.map((t) => [t.title, t]));

  return ONBOARDING_TASKS.map((def) => {
    const task = taskMap.get(def.title);
    return {
      slug: def.slug,
      title: def.title,
      description: def.description,
      status: task?.status || "pending",
      completedAt: task?.status === "done" ? task.updatedAt.toISOString() : null,
    };
  });
}

/**
 * Check and auto-complete onboarding tasks based on user activity.
 * Called after key events (post created, comment posted, like given, etc.)
 */
export async function checkAndCompleteOnboardingTasks(userId: string): Promise<void> {
  // Check profile completion
  const profile = await prisma.userCommunityProfile.findUnique({
    where: { userId },
    select: { bio: true },
  });
  if (profile?.bio && profile.bio.trim().length > 0) {
    await completeOnboardingTask(userId, "forum_complete_profile").catch(() => {});
  }

  // Check first post
  const postCount = await prisma.forumPost.count({
    where: { userId, status: { in: ["published", "pending"] } },
  });
  if (postCount >= 1) {
    await completeOnboardingTask(userId, "forum_first_post").catch(() => {});
  }

  // Check first comment
  const commentCount = await prisma.forumComment.count({
    where: { userId, status: "published" },
  });
  if (commentCount >= 1) {
    await completeOnboardingTask(userId, "forum_first_comment").catch(() => {});
  }

  // Check first like given
  const likeCount = await prisma.forumLike.count({
    where: { userId },
  });
  if (likeCount >= 1) {
    await completeOnboardingTask(userId, "forum_first_like").catch(() => {});
  }
}
