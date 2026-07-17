import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Eye,
  MessageSquare,
  Calendar,
  Lock,
  Pin,
  Star,
  CheckCircle,
  ArrowLeft,
  Award,
  Edit,
  AlertCircle,
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

export const dynamic = "force-dynamic";

// Always noindex - this is a private preview route
export const metadata: Metadata = {
  title: buildTitle("预览帖子"),
  robots: { index: false, follow: false },
};

async function getPostForAuthor(slug: string, userId: string) {
  const post = await prisma.forumPost.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          levelKey: true,
          growthValue: true,
          honorScore: true,
          createdAt: true,
          role: true,
          membershipTier: true,
          _count: {
            select: {
              forumPosts: { where: { status: "published" } },
              forumComments: { where: { status: "published" } },
            },
          },
        },
      },
      category: true,
      _count: { select: { comments: { where: { status: "published" } } } },
      moderationLogs: {
        where: { action: "reject" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { reason: true, createdAt: true, adminId: true },
      },
    },
  });

  if (!post) return null;
  // Only the author can preview their own non-published posts
  if (post.userId !== userId) return null;
  // Published posts should use the public route
  if (post.status === "published") return null;
  // Drafts, pending, rejected, hidden are all previewable by the author
  return post;
}

export default async function AuthorPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return (
      <JueshiV4PublicShell>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-lg font-semibold text-gray-700 mb-2">请先登录</p>
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(`/bbs/my-posts/${slug}`)}`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium"
            >
              登录 / 注册
            </Link>
          </div>
        </div>
      </JueshiV4PublicShell>
    );
  }

  const post = await getPostForAuthor(slug, session.user.id);
  if (!post) {
    notFound();
  }

  const isAdmin = session.user.role === "admin";
  const isAuthor = post.userId === session.user.id;
  const rejectionReason = post.moderationLogs[0]?.reason || null;

  // Get admin name who rejected
  let rejectedBy = "管理员";
  if (post.moderationLogs[0]?.adminId) {
    const admin = await prisma.user.findUnique({
      where: { id: post.moderationLogs[0].adminId },
      select: { name: true },
    });
    rejectedBy = admin?.name || "管理员";
  }

  const displayName = post.user.name || maskEmail(post.user.email);

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        {/* noindex meta note - robots handled by metadata export */}
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="mb-4">
            <BreadcrumbBar
              items={[
                { title: "首页", href: "/" },
                { title: "社区论坛", href: "/bbs" },
                { title: "我的内容", href: "/bbs/my-posts" },
                { title: "预览", current: true },
              ]}
            />
          </div>

          {/* Status banner */}
          <div
            className={`rounded-xl border p-4 mb-4 ${
              post.status === "pending"
                ? "bg-amber-50 border-amber-200"
                : post.status === "rejected"
                ? "bg-red-50 border-red-200"
                : post.status === "draft"
                ? "bg-blue-50 border-blue-200"
                : "bg-gray-100 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle
                  className={`w-5 h-5 ${
                    post.status === "pending"
                      ? "text-amber-600"
                      : post.status === "rejected"
                      ? "text-red-600"
                      : post.status === "draft"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                />
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      post.status === "pending"
                        ? "text-amber-800"
                        : post.status === "rejected"
                        ? "text-red-800"
                        : post.status === "draft"
                        ? "text-blue-800"
                        : "text-gray-700"
                    }`}
                  >
                    {post.status === "pending" &&
                      "此帖子正在等待管理员审核，其他用户暂时无法看到"}
                    {post.status === "rejected" &&
                      "此帖子已被驳回，可修改后重新提交"}
                    {post.status === "draft" &&
                      "这是草稿，尚未提交审核。点击编辑继续完善后提交。"}
                    {post.status === "hidden" && "此帖子已被隐藏"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    此页面为私有预览，不会被搜索引擎收录
                  </p>
                </div>
              </div>
              {(post.status === "draft" || post.status === "rejected" || post.status === "pending") && (
                <Link
                  href={`/bbs/${slug}/edit`}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-3.5 h-3.5" />
                  {post.status === "draft" ? "编辑并提交" : post.status === "rejected" ? "修改并重新提交" : "编辑"}
                </Link>
              )}
            </div>
          </div>

          {/* Rejection reason */}
          {post.status === "rejected" && rejectionReason && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-4">
              <p className="text-xs font-medium text-red-700 mb-1">
                驳回原因（{rejectedBy} ·{" "}
                {post.moderationLogs[0]?.createdAt
                  ? formatDateTime(post.moderationLogs[0].createdAt)
                  : ""}
                ）
              </p>
              <p className="text-sm text-red-600">{rejectionReason}</p>
            </div>
          )}

          {/* Main layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            <main className="min-w-0">
              {/* Topic header */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 mb-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <CategoryBadge category={post.category} size="md" />
                  {post.isPinned && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                      <Pin className="w-3 h-3" /> 置顶
                    </span>
                  )}
                  {post.isLocked && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-slate-600 border border-slate-200">
                      <Lock className="w-3 h-3" /> 锁定
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
                        {post.user.honorScore
                          ? `荣誉 ${post.user.honorScore}`
                          : ""}{" "}
                        成长值 {post.user.growthValue || 0}
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

              {/* Comments disabled notice */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-brand" />
                  <h2 className="text-lg font-bold text-slate-900">
                    回复 ({post._count.comments})
                  </h2>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-4 text-center">
                  <p className="text-sm text-gray-500">
                    帖子审核通过后才能评论
                  </p>
                </div>
              </div>

              {/* Bottom navigation */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Link
                  href="/bbs/my-posts"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4" /> 返回我的内容
                </Link>
              </div>
            </main>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-20 space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">
                    帖子信息
                  </h3>
                  <dl className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">状态</dt>
                      <dd className="font-medium text-gray-700">
                        {post.status === "pending"
                          ? "待审核"
                          : post.status === "rejected"
                          ? "已驳回"
                          : post.status === "hidden"
                          ? "已隐藏"
                          : post.status}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">浏览</dt>
                      <dd className="font-medium text-gray-700">
                        {post.viewCount}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">回复</dt>
                      <dd className="font-medium text-gray-700">
                        {post._count.comments}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">创建</dt>
                      <dd className="font-medium text-gray-700">
                        {formatDateTime(post.createdAt)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">更新</dt>
                      <dd className="font-medium text-gray-700">
                        {formatDateTime(post.updatedAt)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
