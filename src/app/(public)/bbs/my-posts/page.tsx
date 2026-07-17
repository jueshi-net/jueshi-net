import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle } from "@/lib/seo";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import BreadcrumbBar from "@/components/design-system/BreadcrumbBar";
import { MyPostsList } from "@/components/bbs/my-posts-list";
import type { Metadata } from "next";
import Link from "next/link";
import { User, Bookmark, MessageCircle, Bell } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: buildTitle("我的内容 - 社区"),
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function MyPostsPage({ searchParams }: PageProps) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userId = session?.user?.id;

  const params = await searchParams;
  const status = params.status || "all";

  // If not logged in, render the component which shows login prompt
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
                  { title: "我的内容", current: true },
                ]}
              />
            </div>
          </div>
          <div className="max-w-[1200px] mx-auto px-4 py-6">
            <MyPostsList
              initialPosts={[]}
              initialTotal={0}
              statusCounts={{}}
              currentStatus={status}
              isLoggedIn={false}
            />
          </div>
        </div>
      </JueshiV4PublicShell>
    );
  }

  // Valid status filters
  const validStatuses = ["all", "published", "pending", "rejected", "hidden", "deleted", "draft"];
  const filterStatus = validStatuses.includes(status) ? status : "all";

  const where = filterStatus === "all"
    ? { userId, status: { not: "deleted" } }
    : { userId, status: filterStatus };

  const [posts, total, counts] = await Promise.all([
    prisma.forumPost.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        category: { select: { id: true, key: true, name: true } },
        _count: {
          select: {
            comments: { where: { status: "published" } },
            likes: true,
            bookmarks: true,
          },
        },
      },
    }),
    prisma.forumPost.count({ where }),
    prisma.forumPost.groupBy({
      by: ["status"],
      where: { userId },
      _count: { id: true },
    }),
  ]);

  // Build status count map
  const statusCounts: Record<string, number> = {
    published: 0,
    pending: 0,
    rejected: 0,
    hidden: 0,
    deleted: 0,
    draft: 0,
  };
  for (const c of counts) {
    statusCounts[c.status] = c._count.id;
  }
  statusCounts.all = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  // Fetch rejection reasons for rejected posts
  const rejectedPostIds = posts
    .filter((p) => p.status === "rejected")
    .map((p) => p.id);

  const rejectionReasons: Record<string, { reason: string; createdAt: Date }> = {};
  if (rejectedPostIds.length > 0) {
    const logs = await prisma.moderationLog.findMany({
      where: {
        postId: { in: rejectedPostIds },
        action: "reject",
      },
      orderBy: { createdAt: "desc" },
    });
    // Get the latest per postId
    const seen = new Set<string>();
    for (const log of logs) {
      if (log.postId && !seen.has(log.postId)) {
        seen.add(log.postId);
        rejectionReasons[log.postId] = {
          reason: log.reason || "",
          createdAt: log.createdAt,
        };
      }
    }
  }

  const serializedPosts = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content.slice(0, 300),
    status: p.status,
    isPinned: p.isPinned,
    isLocked: p.isLocked,
    isFeatured: p.isFeatured,
    isSolved: p.isSolved,
    viewCount: p.viewCount,
    commentCount: p.commentCount,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    category: p.category,
    _count: {
      comments: p._count.comments,
      likes: p._count.likes,
      bookmarks: p._count.bookmarks,
    },
    rejectionReason: rejectionReasons[p.id]?.reason || null,
    rejectedAt: rejectionReasons[p.id]?.createdAt.toISOString() || null,
  }));

  // Get unread notification count
  const unreadCount = await prisma.forumNotification.count({
    where: { userId, isRead: false },
  });

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1200px] mx-auto px-4 py-2.5">
            <BreadcrumbBar
              items={[
                { title: "首页", href: "/" },
                { title: "社区论坛", href: "/bbs" },
                { title: "我的内容", current: true },
              ]}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <User className="w-6 h-6 text-brand" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                我的内容
              </h1>
            </div>
            {/* Quick links */}
            <div className="flex gap-2">
              <Link
                href="/bbs/my-bookmarks"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">我的收藏</span>
              </Link>
              <Link
                href="/bbs/my-comments"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">我的评论</span>
              </Link>
              <Link
                href="/bbs/notifications"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 relative"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">通知</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <MyPostsList
            initialPosts={serializedPosts}
            initialTotal={total}
            statusCounts={statusCounts}
            currentStatus={filterStatus}
            isLoggedIn={true}
          />
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
