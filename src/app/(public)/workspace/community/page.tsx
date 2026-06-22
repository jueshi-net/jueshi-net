import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MyCommunityClient } from "./my-community-client";

export const dynamic = "force-dynamic";

export const metadata = { title: "我的社区 - 绝世百宝箱" };

export default async function MyCommunityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/workspace/community");

  const userId = session.user.id as string;

  const [posts, comments, bookmarks, notifications] = await Promise.all([
    prisma.forumPost.findMany({
      where: { userId },
      include: {
        category: { select: { name: true, key: true } },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.forumComment.findMany({
      where: { userId },
      include: {
        post: { select: { id: true, slug: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.forumBookmark.findMany({
      where: { userId },
      include: {
        post: {
          select: {
            id: true,
            slug: true,
            title: true,
            status: true,
            category: { select: { name: true, key: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.forumNotification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  // ForumNotification has no `actor` relation — resolve actor users manually.
  const actorIds = Array.from(
    new Set(
      notifications
        .map((n) => n.actorId)
        .filter((id): id is string => Boolean(id))
    )
  );
  const actors = actorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, name: true, image: true },
      })
    : [];
  const actorMap = new Map(actors.map((a) => [a.id, a]));

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const serialized = {
    posts: posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      status: p.status,
      isPinned: p.isPinned,
      isLocked: p.isLocked,
      isFeatured: p.isFeatured,
      viewCount: p.viewCount,
      commentCount: p.commentCount,
      createdAt: p.createdAt.toISOString(),
      category: { name: p.category.name, key: p.category.key },
      _count: { comments: p._count.comments, likes: p._count.likes },
    })),
    comments: comments.map((c) => ({
      id: c.id,
      content: c.content,
      status: c.status,
      floorNumber: c.floorNumber,
      createdAt: c.createdAt.toISOString(),
      post: c.post
        ? { id: c.post.id, slug: c.post.slug, title: c.post.title }
        : null,
    })),
    bookmarks: bookmarks.map((b) => ({
      id: b.id,
      createdAt: b.createdAt.toISOString(),
      post: b.post
        ? {
            id: b.post.id,
            slug: b.post.slug,
            title: b.post.title,
            status: b.post.status,
            category: b.post.category
              ? { name: b.post.category.name, key: b.post.category.key }
              : null,
          }
        : null,
    })),
    notifications: notifications.map((n) => {
      const actor = n.actorId ? actorMap.get(n.actorId) : undefined;
      return {
        id: n.id,
        type: n.type,
        message: n.message,
        isRead: n.isRead,
        postId: n.postId,
        commentId: n.commentId,
        createdAt: n.createdAt.toISOString(),
        actor: actor
          ? { name: actor.name, image: actor.image }
          : null,
      };
    }),
    unreadCount,
  };

  return <MyCommunityClient data={serialized} />;
}
