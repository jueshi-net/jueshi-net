// Growth log type → user-friendly labels
// Used across admin UI, dashboard, and growth-task components

export const GROWTH_TYPE_LABELS: Record<string, string> = {
  daily_checkin: "每日签到",
  dashboard_visit: "访问工作台",
  review_approved: "点评审核通过",
  forum_post_approved: "帖子审核通过",
  forum_comment_approved: "评论审核通过",
  admin_adjust: "后台调整",
};

export function getGrowthTypeLabel(type: string): string {
  return GROWTH_TYPE_LABELS[type] || type;
}

export function isAutoReward(type: string): boolean {
  return type !== "admin_adjust";
}
