// 成长任务中心 — 静态配置 + 状态判断
// MVP 阶段不新增 DB，通过已有数据判断任务完成状态

import { prisma } from "@/lib/prisma";

export interface GrowthTask {
  id: string;
  key: string;
  title: string;
  description: string;
  rewardGrowth: number;
  actionType: "checkin" | "tool_review" | "forum_post" | "forum_comment" | "workspace_visit" | "member_visit";
  targetUrl: string;
  badgeKey?: string;
  badgeName?: string;
  category: "daily" | "growth" | "community" | "content";
  sortOrder: number;
  isActive: boolean;
}

export const GROWTH_TASKS: GrowthTask[] = [
  {
    id: "task-daily-checkin",
    key: "daily_checkin",
    title: "每日签到",
    description: "每天签到一次，积累积分和成长值",
    rewardGrowth: 2,
    actionType: "checkin",
    targetUrl: "/dashboard",
    category: "daily",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "task-tool-review",
    key: "tool_review_approved",
    title: "提交工具点评",
    description: "为你用过的工具写一条点评，帮助其他用户做出选择",
    rewardGrowth: 10,
    actionType: "tool_review",
    targetUrl: "/tools",
    badgeKey: "helpful_reviewer",
    badgeName: "热心点评",
    category: "content",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "task-forum-post",
    key: "forum_post_published",
    title: "发布论坛帖子",
    description: "在社区分享你的经验或提问",
    rewardGrowth: 20,
    actionType: "forum_post",
    targetUrl: "https://bbs.jueshi.net/new",
    category: "community",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "task-forum-comment",
    key: "forum_comment_published",
    title: "评论论坛帖子",
    description: "参与社区讨论，回复他人的帖子",
    rewardGrowth: 5,
    actionType: "forum_comment",
    targetUrl: "https://bbs.jueshi.net",
    category: "community",
    sortOrder: 4,
    isActive: true,
  },
  {
    id: "task-workspace-visit",
    key: "workspace_visit",
    title: "访问工作台",
    description: "每天访问你的个人工作台，管理工作、任务和资源",
    rewardGrowth: 2,
    actionType: "workspace_visit",
    targetUrl: "/dashboard",
    category: "daily",
    sortOrder: 5,
    isActive: true,
  },
  {
    id: "task-first-login",
    key: "first_login_badge",
    title: "首次访问站点",
    description: "恭喜加入海外百宝箱！",
    rewardGrowth: 0,
    actionType: "member_visit",
    targetUrl: "/dashboard/points",
    badgeKey: "first_login",
    badgeName: "初来乍到",
    category: "growth",
    sortOrder: 6,
    isActive: true,
  },
];

// 根据用户实际数据判断任务状态
export async function getUserTaskStatus(userId: string) {
  const results = new Map<string, { completed: boolean; count: number }>();

  // 1. daily_checkin: 今天是否签到
  const { getTodayDateKey } = await import("@/lib/date-utils");
  const dateKey = getTodayDateKey();
  const todayCheckin = await prisma.dailyCheckIn.findUnique({
    where: { userId_dateKey: { userId, dateKey } },
  });
  results.set("daily_checkin", { completed: !!todayCheckin, count: todayCheckin ? 1 : 0 });

  // 2. tool_review_approved: 是否有 approved 点评
  const reviewCount = await prisma.toolReview.count({
    where: { userId, status: "approved" },
  });
  results.set("tool_review_approved", { completed: reviewCount > 0, count: reviewCount });

  // 3. forum_post_published: 是否有 published 论坛帖
  const postCount = await prisma.forumPost.count({
    where: { userId, status: "published" },
  });
  results.set("forum_post_published", { completed: postCount > 0, count: postCount });

  // 4. forum_comment_published: 是否有 published 论坛评论
  const commentCount = await prisma.forumComment.count({
    where: { userId, status: "published" },
  });
  results.set("forum_comment_published", { completed: commentCount > 0, count: commentCount });

  // 5. workspace_visit: 通过 growth_logs 判断今天是否已访问工作台并获奖励
  const visitDateKey = dateKey;
  const todayVisit = await prisma.growthLog.findFirst({
    where: {
      userId,
      type: "dashboard_visit",
      createdAt: {
        gte: new Date(visitDateKey + "T00:00:00-07:00"),
      },
    },
  });
  results.set("workspace_visit", { completed: !!todayVisit, count: todayVisit ? 1 : 0 });

  // 6. first_login_badge: 是否已获得 first_login 勋章
  const badgeAward = await prisma.userBadgeAward.findFirst({
    where: { userId, badge: { key: "first_login" } },
  });
  results.set("first_login_badge", { completed: !!badgeAward, count: badgeAward ? 1 : 0 });

  return results;
}
