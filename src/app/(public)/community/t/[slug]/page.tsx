import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TopicDetailClient } from "./topic-detail-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.forumPost.findUnique({ where: { slug }, select: { title: true } });
  return { title: `${post?.title || "帖子"} - 社区 - 绝世百宝箱` };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  const post = await prisma.forumPost.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true, name: true, image: true, role: true,
          membershipTier: true, growthValue: true, levelKey: true,
          honorScore: true, createdAt: true,
        },
      },
      category: true,
    },
  });

  if (!post || post.status === "deleted") notFound();
  if (post.status === "hidden" && post.userId !== session?.user?.id) {
    notFound();
  }

  // Increment view count
  await prisma.forumPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const [comments, likes, userLike, userBookmark] = await Promise.all([
    prisma.forumComment.findMany({
      where: { postId: post.id, status: "published" },
      include: {
        user: { select: { id: true, name: true, image: true, role: true, levelKey: true, honorScore: true } },
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.forumLike.count({ where: { postId: post.id } }),
    session ? prisma.forumLike.findUnique({ where: { userId_postId: { userId: session.user.id, postId: post.id } } }).catch(() => null) : null,
    session ? prisma.forumBookmark.findUnique({ where: { userId_postId: { userId: session.user.id, postId: post.id } } }).catch(() => null) : null,
  ]);

  const serializedPost = {
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    status: post.status,
    isPinned: post.isPinned,
    isLocked: post.isLocked,
    viewCount: post.viewCount,
    commentCount: post.commentCount,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    user: {
      id: post.user.id,
      name: post.user.name,
      image: post.user.image,
      role: post.user.role,
      membershipTier: post.user.membershipTier,
      growthValue: post.user.growthValue,
      levelKey: post.user.levelKey,
      honorScore: post.user.honorScore,
      createdAt: post.user.createdAt.toISOString(),
    },
    category: {
      id: post.category.id,
      name: post.category.name,
      key: post.category.key,
      iconText: post.category.iconText,
    },
  };

  const serializedComments = comments.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <TopicDetailClient
      post={serializedPost}
      comments={serializedComments}
      likeCount={likes}
      hasLiked={!!userLike}
      hasBookmarked={!!userBookmark}
      isLoggedIn={!!session}
      currentUserId={session?.user?.id || null}
    />
  );
}
