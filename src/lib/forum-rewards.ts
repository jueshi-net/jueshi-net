// 论坛成长值联动辅助函数
// 用于帖子/评论审核通过时自动发放成长值奖励

import { prisma } from "@/lib/prisma";

/**
 * 计算用户等级：从高到低匹配第一个 min_growth <= growthValue 的等级
 */
async function calculateLevel(growthValue: number): Promise<string> {
  const level = await prisma.userLevel.findFirst({
    where: {
      isActive: true,
      minGrowth: { lte: growthValue },
    },
    orderBy: { minGrowth: "desc" },
    select: { key: true },
  });
  return level?.key || "lv1";
}

/**
 * 帖子审核通过时发放成长值奖励
 * @param postId - 帖子 ID
 * @param userId - 帖子作者 ID
 * @returns 是否成功发放奖励
 */
export async function grantPostReward(
  postId: string,
  userId: string
): Promise<{ success: boolean; reason?: string }> {
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: { rewardGrantedAt: true },
  });
  if (!post) return { success: false, reason: "帖子不存在" };
  if (post.rewardGrantedAt !== null) {
    return { success: false, reason: "奖励已发放，跳过" };
  }

  const rewardValue = 20;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    // 更新帖子标记
    await tx.forumPost.update({
      where: { id: postId },
      data: { rewardGrantedAt: now },
    });

    // 更新用户成长值
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { growthValue: true },
    });
    const newGrowth = (user?.growthValue || 0) + rewardValue;
    const newLevel = await calculateLevel.call({ prisma: tx } as any, newGrowth);

    await tx.user.update({
      where: { id: userId },
      data: {
        growthValue: newGrowth,
        levelKey: newLevel,
      },
    });

    // 写入 growth_logs
    await tx.growthLog.create({
      data: {
        userId,
        type: "forum_post_approved",
        value: rewardValue,
        reason: "论坛帖子审核通过奖励",
        refType: "forum_post",
        refId: postId,
      },
    });
  });

  return { success: true };
}

/**
 * 评论审核通过时发放成长值奖励
 * @param commentId - 评论 ID
 * @param userId - 评论作者 ID
 * @returns 是否成功发放奖励
 */
export async function grantCommentReward(
  commentId: string,
  userId: string
): Promise<{ success: boolean; reason?: string }> {
  const comment = await prisma.forumComment.findUnique({
    where: { id: commentId },
    select: { rewardGrantedAt: true },
  });
  if (!comment) return { success: false, reason: "评论不存在" };
  if (comment.rewardGrantedAt !== null) {
    return { success: false, reason: "奖励已发放，跳过" };
  }

  const rewardValue = 5;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    // 更新评论标记
    await tx.forumComment.update({
      where: { id: commentId },
      data: { rewardGrantedAt: now },
    });

    // 更新用户成长值
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { growthValue: true },
    });
    const newGrowth = (user?.growthValue || 0) + rewardValue;
    // 直接查询等级（不用外部 this）
    const level = await tx.userLevel.findFirst({
      where: {
        isActive: true,
        minGrowth: { lte: newGrowth },
      },
      orderBy: { minGrowth: "desc" },
      select: { key: true },
    });
    const newLevel = level?.key || "lv1";

    await tx.user.update({
      where: { id: userId },
      data: {
        growthValue: newGrowth,
        levelKey: newLevel,
      },
    });

    // 写入 growth_logs
    await tx.growthLog.create({
      data: {
        userId,
        type: "forum_comment_approved",
        value: rewardValue,
        reason: "论坛评论审核通过奖励",
        refType: "forum_comment",
        refId: commentId,
      },
    });
  });

  return { success: true };
}
