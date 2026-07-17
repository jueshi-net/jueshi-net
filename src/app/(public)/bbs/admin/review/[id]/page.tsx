import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MessageSquare,
  Calendar,
  Lock,
  Pin,
  Star,
  CheckCircle,
  ArrowLeft,
  Eye,
  Shield,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle } from "@/lib/seo";
import { formatDateTime } from "@/lib/utils";
import { PostContent } from "@/components/bbs/post-content";
import { CategoryBadge } from "@/components/bbs/category-badge";
import BreadcrumbBar from "@/components/design-system/BreadcrumbBar";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import { maskEmail } from "@/lib/community/utils";
import { AdminPreviewActions } from "@/components/bbs/admin-preview-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: buildTitle("审核预览"),
  robots: { index: false, follow: false },
};

async function getPostForReview(postId: string, isAdmin: boolean) {
  if (!isAdmin) return null;

  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          role: true,
          honorScore: true,
          _count: {
            select: {
              forumPosts: { where: { status: "published" } },
              forumComments: { where: { status: "published" } },
            },
          },
        },
      },
      category: true,
      _count: { select: { comments: true, likes: true, bookmarks: true } },
      moderationLogs: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { admin: { select: { name: true } } },
      },
    },
  });

  return post;
}

export default async function AdminReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  if (!isAdmin) {
    return (
      <JueshiV4PublicShell>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700 mb-2">
              需要管理员权限
            </p>
            <Link
              href="/bbs"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium"
            >
              返回论坛
            </Link>
          </div>
        </div>
      </JueshiV4PublicShell>
    );
  }

  const post = await getPostForReview(id, isAdmin);
  if (!post) {
    notFound();
  }

  const displayName = post.user.name || maskEmail(post.user.email);
  const latestReject = post.moderationLogs.find((m) => m.action === "reject");

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="mb-4">
            <BreadcrumbBar
              items={[
                { title: "首页", href: "/" },
                { title: "社区论坛", href: "/bbs" },
                { title: "审核管理", href: "/bbs/admin" },
                { title: "审核预览", current: true },
              ]}
            />
          </div>

          {/* Admin actions bar */}
          <AdminPreviewActions postId={post.id} postTitle={post.title} postStatus={post.status} />

          {/* Main layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 mt-4">
            <main className="min-w-0">
              {/* Topic header */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 mb-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <CategoryBadge category={post.category} size="md" />
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                      post.status === "pending"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : post.status === "rejected"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : post.status === "published"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {post.status === "pending"
                      ? "待审核"
                      : post.status === "rejected"
                      ? "已驳回"
                      : post.status === "published"
                      ? "已发布"
                      : post.status === "hidden"
                      ? "已隐藏"
                      : post.status}
                  </span>
                  {post.isPinned && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                      <Pin className="w-3 h-3" /> 置顶
                    </span>
                  )}
                  {post.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-200">
                      <Star className="w-3 h-3" /> 精华
                    </span>
                  )}
                </div>

                <h1 className="text-xl md:text-2xl font-extrabold leading-tight break-words mb-3">
                  {post.title}
                </h1>

                <div className="flex items-center gap-3 text-sm text-slate-500 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-sm font-bold text-brand shrink-0">
                      {displayName[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-slate-700">
                        {displayName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {post.user.honorScore ? `荣誉 ${post.user.honorScore}` : ""} ·
                        发帖 {post.user._count.forumPosts} · 回复{" "}
                        {post.user._count.forumComments}
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 ml-auto text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    <time dateTime={post.createdAt.toISOString()}>
                      {formatDateTime(post.createdAt)}
                    </time>
                  </span>
                </div>
              </div>

              {/* Topic content */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-8 mb-4">
                <div className="prose prose-sm max-w-none">
                  <PostContent content={post.content} />
                </div>

                {/* Tags */}
                {post.tags &&
                  Array.isArray(post.tags) &&
                  (post.tags as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                      {(post.tags as string[]).map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
              </div>

              {/* Bottom navigation */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Link
                  href="/bbs/admin"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4" /> 返回审核队列
                </Link>
                {post.status === "published" && (
                  <Link
                    href={`/bbs/${post.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4" /> 查看公开页面
                  </Link>
                )}
              </div>
            </main>

            {/* Sidebar - audit trail */}
            <aside className="hidden lg:block">
              <div className="sticky top-20 space-y-4">
                {/* Post info */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">
                    帖子信息
                  </h3>
                  <dl className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">ID</dt>
                      <dd className="font-mono text-gray-700">{post.id.slice(0, 12)}...</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Slug</dt>
                      <dd className="font-mono text-gray-700">{post.slug}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">浏览</dt>
                      <dd className="font-medium text-gray-700">{post.viewCount}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">回复</dt>
                      <dd className="font-medium text-gray-700">{post._count.comments}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">点赞</dt>
                      <dd className="font-medium text-gray-700">{post._count.likes}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">收藏</dt>
                      <dd className="font-medium text-gray-700">{post._count.bookmarks}</dd>
                    </div>
                  </dl>
                </div>

                {/* Moderation history */}
                {post.moderationLogs.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">
                      审核记录
                    </h3>
                    <div className="space-y-2">
                      {post.moderationLogs.map((log) => (
                        <div
                          key={log.id}
                          className="text-xs border-l-2 border-gray-200 pl-2 py-1"
                        >
                          <div className="flex items-center gap-1">
                            {log.action === "approve" && (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            )}
                            {log.action === "reject" && (
                              <XCircle className="w-3 h-3 text-red-500" />
                            )}
                            <span className="font-medium text-gray-700">
                              {log.action}
                            </span>
                          </div>
                          {log.reason && (
                            <p className="text-gray-500 mt-0.5">{log.reason}</p>
                          )}
                          <p className="text-gray-400 mt-0.5">
                            {log.admin?.name || "管理员"} ·{" "}
                            {formatDateTime(log.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Latest rejection */}
                {latestReject && (
                  <div className="bg-white rounded-xl border border-red-200 p-4">
                    <h3 className="text-sm font-bold text-red-700 mb-2">
                      最新驳回原因
                    </h3>
                    <p className="text-sm text-red-600">{latestReject.reason}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {latestReject.admin?.name || "管理员"} ·{" "}
                      {formatDateTime(latestReject.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
