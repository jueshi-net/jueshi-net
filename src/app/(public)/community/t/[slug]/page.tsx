import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getUserCommunityInfo } from "@/lib/honor-helpers";
import type { TrustCardData } from "@/components/community/user-trust-card";
import { TopicDetailClient } from "./topic-detail-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.forumPost.findUnique({
    where: { slug },
    select: { title: true },
  });
  return { title: `${post?.title || "帖子"} - 社区 - 绝世百宝箱` };
}

function isAdminRole(role: string | undefined | null): boolean {
  return !!role && ["管理员", "ADMIN", "admin"].includes(role);
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id || null;
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = isAdminRole(role);

  const post = await prisma.forumPost.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          honorScore: true,
          createdAt: true,
        },
      },
      category: true,
      comments: {
        where: { status: "published" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              honorScore: true,
              role: true,
              levelKey: true,
            },
          },
          _count: { select: { likes: true } },
        },
        orderBy: [{ floorNumber: "asc" }, { createdAt: "asc" }],
      },
      _count: { select: { comments: true, likes: true, bookmarks: true } },
    },
  });

  if (!post || post.status === "deleted") notFound();
  // Hidden/pending posts only visible to author or admin
  if (
    (post.status === "hidden" || post.status === "pending") &&
    post.userId !== currentUserId &&
    !isAdmin
  ) {
    notFound();
  }

  // Increment view count (fire and forget — do not await)
  prisma.forumPost
    .update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  // Author trust card data (full mode)
  const authorInfo = await getUserCommunityInfo(post.userId);
  const authorTrustCard: TrustCardData | null = authorInfo
    ? {
        user: {
          id: authorInfo.user.id,
          name: authorInfo.user.name,
          image: authorInfo.user.image,
          role: authorInfo.user.role,
          membershipTier: authorInfo.user.membershipTier,
          growthValue: authorInfo.user.growthValue,
          levelKey: authorInfo.user.levelKey,
          honorScore: authorInfo.user.honorScore,
          points: authorInfo.user.points,
          createdAt: authorInfo.user.createdAt.toISOString(),
        },
        profile: authorInfo.profile
          ? {
              displayName: authorInfo.profile.displayName,
              bio: authorInfo.profile.bio,
              locationText: authorInfo.profile.locationText,
              publicTitle: authorInfo.profile.publicTitle,
              isPublic: authorInfo.profile.isPublic,
              joinedAtDisplayMode: authorInfo.profile.joinedAtDisplayMode,
            }
          : null,
        stat: authorInfo.stat,
        badges: authorInfo.badges,
        level: authorInfo.level,
      }
    : null;

  // Resolve the current user's interactions (likes / bookmark) for initial state
  const commentIds = post.comments.map((c) => c.id);
  const [userLike, userBookmark, myCommentLikes] = currentUserId
    ? await Promise.all([
        prisma.forumLike
          .findUnique({
            where: {
              userId_postId: { userId: currentUserId, postId: post.id },
            },
          })
          .catch(() => null),
        prisma.forumBookmark
          .findUnique({
            where: {
              userId_postId: { userId: currentUserId, postId: post.id },
            },
          })
          .catch(() => null),
        commentIds.length
          ? prisma.forumLike
              .findMany({
                where: { userId: currentUserId, commentId: { in: commentIds } },
                select: { commentId: true },
              })
              .catch(() => [])
          : Promise.resolve([]),
      ])
    : [null, null, []];

  const likedCommentIds = new Set(
    myCommentLikes
      .map((l) => l.commentId)
      .filter((v): v is string => !!v)
  );

  // Resolve related content links (guide/checklist are slug-based routes but
  // the stored value may be an id — resolve to slug + title for correct links)
  const [relatedGuide, relatedChecklist] = await Promise.all([
    post.relatedGuideId
      ? prisma.guide
          .findUnique({
            where: { id: post.relatedGuideId },
            select: { slug: true, title: true },
          })
          .catch(() => null)
          .then((g) =>
            g ? g : prisma.guide
              .findUnique({
                where: { slug: post.relatedGuideId as string },
                select: { slug: true, title: true },
              })
              .catch(() => null)
          )
      : Promise.resolve(null),
    post.relatedChecklistId
      ? prisma.checklist
          .findUnique({
            where: { id: post.relatedChecklistId },
            select: { slug: true, title: true },
          })
          .catch(() => null)
          .then((c) =>
            c ? c : prisma.checklist
              .findUnique({
                where: { slug: post.relatedChecklistId as string },
                select: { slug: true, title: true },
              })
              .catch(() => null)
          )
      : Promise.resolve(null),
  ]);

  const tags: string[] = Array.isArray(post.tags)
    ? post.tags.filter((t): t is string => typeof t === "string")
    : [];

  const serializedPost = {
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    status: post.status,
    isPinned: post.isPinned,
    isLocked: post.isLocked,
    isFeatured: post.isFeatured,
    isSolved: post.isSolved,
    acceptedCommentId: post.acceptedCommentId,
    viewCount: post.viewCount,
    commentCount: post.commentCount,
    lastCommentAt: post.lastCommentAt?.toISOString() ?? null,
    tags,
    createdAt: post.createdAt.toISOString(),
    relatedTool: post.relatedTool,
    relatedGuideId: post.relatedGuideId,
    relatedChecklistId: post.relatedChecklistId,
    relatedTaskChainType: post.relatedTaskChainType,
    user: {
      id: post.user.id,
      name: post.user.name,
      image: post.user.image,
      honorScore: post.user.honorScore,
      createdAt: post.user.createdAt.toISOString(),
    },
    category: {
      id: post.category.id,
      name: post.category.name,
      key: post.category.key,
      iconText: post.category.iconText,
      color: post.category.color,
    },
    relatedGuide: relatedGuide
      ? { slug: relatedGuide.slug, title: relatedGuide.title }
      : null,
    relatedChecklist: relatedChecklist
      ? { slug: relatedChecklist.slug, title: relatedChecklist.title }
      : null,
  };

  const serializedComments = post.comments.map((c) => ({
    id: c.id,
    content: c.content,
    status: c.status,
    floorNumber: c.floorNumber,
    isAccepted: c.isAccepted,
    createdAt: c.createdAt.toISOString(),
    user: {
      id: c.user.id,
      name: c.user.name,
      image: c.user.image,
      honorScore: c.user.honorScore,
      role: c.user.role,
      levelKey: c.user.levelKey,
    },
    likeCount: c._count.likes,
    likedByMe: likedCommentIds.has(c.id),
  }));

  return (
    <TopicDetailClient
      post={serializedPost}
      comments={serializedComments}
      authorTrustCard={authorTrustCard}
      likeCount={post._count.likes}
      hasLiked={!!userLike}
      hasBookmarked={!!userBookmark}
      isLoggedIn={!!session}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
    />
  );
}
