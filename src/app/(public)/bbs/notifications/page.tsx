import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle } from "@/lib/seo";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import BreadcrumbBar from "@/components/design-system/BreadcrumbBar";
import { NotificationList } from "@/components/bbs/notification-list";
import type { Metadata } from "next";
import Link from "next/link";
import { Bell } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: buildTitle("通知 - 社区"),
  robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userId = session?.user?.id;

  if (!isLoggedIn || !userId) {
    return (
      <JueshiV4PublicShell>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-[1200px] mx-auto px-4 py-2.5">
              <BreadcrumbBar
                items={[
                  { title: "首页", href: "/" },
                  { title: "社区论坛", href: "/bbs" },
                  { title: "通知", current: true },
                ]}
              />
            </div>
          </div>
          <div className="max-w-[1200px] mx-auto px-4 py-12">
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">请先登录</p>
              <Link
                href="/login?callbackUrl=/bbs/notifications"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark"
              >
                登录 / 注册
              </Link>
            </div>
          </div>
        </div>
      </JueshiV4PublicShell>
    );
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.forumNotification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.forumNotification.count({
      where: { userId, isRead: false },
    }),
  ]);

  // Get actor info
  const actorIds = Array.from(
    new Set(
      notifications
        .map((n) => n.actorId)
        .filter(Boolean) as string[]
    )
  );
  const actors = actorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, name: true, image: true },
      })
    : [];
  const actorMap = new Map(actors.map((a) => [a.id, a]));

  // Get post info
  const postIds = Array.from(
    new Set(
      notifications
        .map((n) => n.postId)
        .filter(Boolean) as string[]
    )
  );
  const posts = postIds.length
    ? await prisma.forumPost.findMany({
        where: { id: { in: postIds } },
        select: { id: true, slug: true, title: true, status: true },
      })
    : [];
  const postMap = new Map(posts.map((p) => [p.id, p]));

  const serializedNotifications = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    postId: n.postId,
    commentId: n.commentId,
    actorId: n.actorId,
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
    actor: n.actorId ? actorMap.get(n.actorId) || null : null,
    // P4: Include accessibility flag for broken-link handling
    post: n.postId
      ? (() => {
          const p = postMap.get(n.postId);
          return p
            ? { id: p.id, slug: p.slug, title: p.title, isAccessible: (p.status as string) === "published" }
            : null;
        })()
      : null,
  }));

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1200px] mx-auto px-4 py-2.5">
            <BreadcrumbBar
              items={[
                { title: "首页", href: "/" },
                { title: "社区论坛", href: "/bbs" },
                { title: "通知", current: true },
              ]}
            />
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-6 h-6 text-brand" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              通知
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                {unreadCount} 条未读
              </span>
            )}
          </div>
          <NotificationList
            initialNotifications={serializedNotifications}
            unreadCount={unreadCount}
          />
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
