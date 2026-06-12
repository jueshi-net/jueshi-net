// 论坛成长值联动辅助函数
// 用于帖子/评论审核通过时自动发放成长值奖励

import { prisma } from "@/lib/prisma";
import { addGrowthValue } from "@/lib/growth-helpers";



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

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    // 更新帖子标记
    await tx.forumPost.update({
      where: { id: postId },
      data: { rewardGrantedAt: now },
    });

    // 统一使用 addGrowthValue：+20 growth_value + 写 growth_logs + 自动更新 levelKey
    await addGrowthValue(userId, 20, "forum_post_approved", "论坛帖子审核通过奖励", "forum_post", postId, tx);
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

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    // 更新评论标记
    await tx.forumComment.update({
      where: { id: commentId },
      data: { rewardGrantedAt: now },
    });

    // 统一使用 addGrowthValue：+5 growth_value + 写 growth_logs + 自动更新 levelKey
    await addGrowthValue(userId, 5, "forum_comment_approved", "论坛评论审核通过奖励", "forum_comment", commentId, tx);
  });

  return { success: true };
}
