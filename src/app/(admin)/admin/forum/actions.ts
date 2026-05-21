// Server Actions for admin forum management
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { grantPostReward, grantCommentReward } from "@/lib/forum-rewards";

export async function updatePostStatus(postId: string, newStatus: string) {
  try {
    const existing = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { status: true },
    });
    if (!existing) return { success: false, error: "帖子不存在" };

    await prisma.forumPost.update({
      where: { id: postId },
      data: { status: newStatus },
    });

    // 如果审核通过（pending → published），发放成长值奖励 + 通知
    if (newStatus === "published" && existing.status === "pending") {
      const postWithUser = await prisma.forumPost.findUnique({
        where: { id: postId },
        select: { rewardGrantedAt: true, userId: true, slug: true, title: true },
      });
      if (postWithUser && !postWithUser.rewardGrantedAt) {
        await grantPostReward(postId, postWithUser.userId);
        createNotification({
          userId: postWithUser.userId,
          type: "forum_post_approved",
          title: "帖子审核通过 ✓",
          message: `你的帖子「${postWithUser.title}」已通过审核，现在可以在论坛查看。`,
          link: `https://bbs.jueshi.net/${postWithUser.slug}`,
        });
      }
    } else if (newStatus === "rejected" && existing.status === "pending") {
      const postWithUser = await prisma.forumPost.findUnique({
        where: { id: postId },
        select: { userId: true, title: true },
      });
      if (postWithUser) {
        createNotification({
          userId: postWithUser.userId,
          type: "forum_post_rejected",
          title: "帖子审核未通过",
          message: `你的帖子「${postWithUser.title}」未通过审核。请检查内容是否符合社区规范后重新提交。`,
          link: "https://bbs.jueshi.net",
        });
      }
    }

    revalidatePath("/admin/forum");
    return { success: true };
  } catch (err) {
    console.error("Update post status error:", err);
    return { success: false, error: "操作失败" };
  }
}

export async function togglePostPin(postId: string, isPinned: boolean) {
  try {
    await prisma.forumPost.update({
      where: { id: postId },
      data: { isPinned },
    });
    revalidatePath("/admin/forum");
    return { success: true };
  } catch (err) {
    console.error("Toggle pin error:", err);
    return { success: false, error: "操作失败" };
  }
}

export async function togglePostLock(postId: string, isLocked: boolean) {
  try {
    await prisma.forumPost.update({
      where: { id: postId },
      data: { isLocked },
    });
    revalidatePath("/admin/forum");
    return { success: true };
  } catch (err) {
    console.error("Toggle lock error:", err);
    return { success: false, error: "操作失败" };
  }
}

export async function updateCommentStatus(commentId: string, newStatus: string) {
  try {
    const existing = await prisma.forumComment.findUnique({
      where: { id: commentId },
      select: { status: true, postId: true },
    });
    if (!existing) return { success: false, error: "评论不存在" };

    await prisma.forumComment.update({
      where: { id: commentId },
      data: { status: newStatus },
    });

    // Update post commentCount when status crosses the published boundary
    if (
      newStatus === "published" && existing.status === "pending"
    ) {
      await prisma.forumPost.update({
        where: { id: existing.postId },
        data: {
          commentCount: { increment: 1 },
          lastCommentAt: new Date(),
        },
      });
    } else if (
      existing.status === "published" && (newStatus === "hidden" || newStatus === "deleted")
    ) {
      await prisma.forumPost.update({
        where: { id: existing.postId },
        data: { commentCount: { increment: -1 } },
      });
    } else if (existing.status === "hidden" && newStatus === "published") {
      await prisma.forumPost.update({
        where: { id: existing.postId },
        data: { commentCount: { increment: 1 } },
      });
    }

    // 如果审核通过（pending → published），发放成长值奖励 + 通知
    if (newStatus === "published" && existing.status === "pending") {
      const commentWithUser = await prisma.forumComment.findUnique({
        where: { id: commentId },
        select: { rewardGrantedAt: true, userId: true, postId: true },
      });
      if (commentWithUser && !commentWithUser.rewardGrantedAt) {
        await grantCommentReward(commentId, commentWithUser.userId);
        // Find post slug for link
        const post = await prisma.forumPost.findUnique({
          where: { id: commentWithUser.postId },
          select: { slug: true },
        });
        createNotification({
          userId: commentWithUser.userId,
          type: "forum_comment_approved",
          title: "评论审核通过 ✓",
          message: "你的评论已通过审核，现在可以在帖子中查看。",
          link: post ? `https://bbs.jueshi.net/${post.slug}` : "https://bbs.jueshi.net",
        });
      }
    }

    revalidatePath("/admin/forum");
    return { success: true };
  } catch (err) {
    console.error("Update comment status error:", err);
    return { success: false, error: "操作失败" };
  }
}

export async function createCategory(data: {
  key: string;
  name: string;
  description?: string;
  iconText?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
}) {
  try {
    await prisma.forumCategory.create({ data });
    revalidatePath("/admin/forum");
    return { success: true };
  } catch (err: any) {
    console.error("Create category error:", err);
    if (err.code === "P2002") return { success: false, error: "分类 key 已存在" };
    return { success: false, error: "创建失败" };
  }
}

export async function updateCategory(id: string, data: {
  name: string;
  description?: string;
  iconText?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
}) {
  try {
    await prisma.forumCategory.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/forum");
    return { success: true };
  } catch (err) {
    console.error("Update category error:", err);
    return { success: false, error: "更新失败" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const postCount = await prisma.forumPost.count({ where: { categoryId: id } });
    if (postCount > 0) {
      return { success: false, error: `该分类下有 ${postCount} 个帖子，无法删除` };
    }
    await prisma.forumCategory.delete({ where: { id } });
    revalidatePath("/admin/forum");
    return { success: true };
  } catch (err) {
    console.error("Delete category error:", err);
    return { success: false, error: "删除失败" };
  }
}
