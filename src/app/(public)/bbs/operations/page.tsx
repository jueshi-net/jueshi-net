import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle } from "@/lib/seo";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import BreadcrumbBar from "@/components/design-system/BreadcrumbBar";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  FileText,
  MessageCircle,
  Flag,
  TrendingUp,
  Users,
  Eye,
  ThumbsUp,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: buildTitle("运营面板 - 社区"),
  robots: { index: false, follow: false },
};

export default async function OperationsDashboardPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  if (!isAdmin) {
    return (
      <JueshiV4PublicShell>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-[1200px] mx-auto px-4 py-2.5">
              <BreadcrumbBar
                items={[
                  { title: "首页", href: "/" },
                  { title: "社区论坛", href: "/bbs" },
                  { title: "运营面板", current: true },
                ]}
              />
            </div>
          </div>
          <div className="max-w-[1200px] mx-auto px-4 py-12">
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">需要管理员权限</h1>
              <p className="text-sm text-gray-500 mb-6">此页面仅对管理员开放</p>
              <Link
                href="/bbs"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark"
              >
                返回论坛
              </Link>
            </div>
          </div>
        </div>
      </JueshiV4PublicShell>
    );
  }

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const [
    todayPosts,
    pendingCount,
    todayComments,
    pendingReports,
    totalPublished,
    totalUsers,
    totalComments,
    topPosts,
    categoryDistribution,
  ] = await Promise.all([
    prisma.forumPost.count({
      where: { createdAt: { gte: today }, status: { not: "draft" } },
    }),
    prisma.forumPost.count({ where: { status: "pending" } }),
    prisma.forumComment.count({
      where: { createdAt: { gte: today }, status: "published" },
    }),
    prisma.forumReport.count({ where: { status: "pending" } }),
    prisma.forumPost.count({ where: { status: "published" } }),
    prisma.user.count(),
    prisma.forumComment.count({ where: { status: "published" } }),
    prisma.forumPost.findMany({
      where: { status: "published" },
      orderBy: { viewCount: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        viewCount: true,
        commentCount: true,
        category: { select: { name: true } },
        user: { select: { name: true } },
        _count: { select: { likes: true } },
      },
    }),
    prisma.forumCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            posts: { where: { status: "published" } },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const stats = [
    {
      label: "今日新帖",
      value: todayPosts,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "待审核",
      value: pendingCount,
      icon: Shield,
      color: "text-amber-600",
      bg: "bg-amber-50",
      link: pendingCount > 0 ? "/bbs/admin?status=pending" : undefined,
    },
    {
      label: "今日评论",
      value: todayComments,
      icon: MessageCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "待处理举报",
      value: pendingReports,
      icon: Flag,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  const overviewStats = [
    { label: "已发布帖子", value: totalPublished, icon: FileText },
    { label: "评论总数", value: totalComments, icon: MessageCircle },
    { label: "注册用户", value: totalUsers, icon: Users },
  ];

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1200px] mx-auto px-4 py-2.5">
            <BreadcrumbBar
              items={[
                { title: "首页", href: "/" },
                { title: "社区论坛", href: "/bbs" },
                { title: "运营面板", current: true },
              ]}
            />
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-brand" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">社区运营面板</h1>
          </div>

          {/* Today stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {stats.map((stat) => {
              const content = (
                <div className={`rounded-xl border border-gray-200 p-4 ${stat.bg} h-full`}>
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                </div>
              );
              return stat.link ? (
                <Link key={stat.label} href={stat.link} className="block hover:scale-[1.02] transition-transform">
                  {content}
                </Link>
              ) : (
                <div key={stat.label}>{content}</div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top posts */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-brand" />
                <h2 className="text-base font-bold text-gray-900">热门帖子</h2>
              </div>
              {topPosts.length > 0 ? (
                <div className="space-y-3">
                  {topPosts.map((post, idx) => (
                    <Link
                      key={post.id}
                      href={`/bbs/${post.slug}`}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          <span className="inline-flex items-center gap-0.5">
                            <Eye className="w-3 h-3" />
                            {post.viewCount}
                          </span>
                          <span className="inline-flex items-center gap-0.5">
                            <MessageCircle className="w-3 h-3" />
                            {post.commentCount}
                          </span>
                          <span className="inline-flex items-center gap-0.5">
                            <ThumbsUp className="w-3 h-3" />
                            {post._count.likes}
                          </span>
                          <span className="text-gray-400 truncate">{post.user.name || "匿名"}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">暂无已发布帖子</p>
              )}
            </div>

            {/* Category distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-brand" />
                <h2 className="text-base font-bold text-gray-900">分类分布</h2>
              </div>
              {categoryDistribution.length > 0 ? (
                <div className="space-y-3">
                  {categoryDistribution.map((cat) => {
                    const max = Math.max(...categoryDistribution.map((c) => c._count.posts), 1);
                    const pct = Math.round((cat._count.posts / max) * 100);
                    return (
                      <div key={cat.id}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-700">{cat.name}</span>
                          <span className="text-gray-500 font-medium">{cat._count.posts}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">暂无分类数据</p>
              )}
            </div>
          </div>

          {/* Overview stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {overviewStats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <stat.icon className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/bbs/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              <Shield className="w-4 h-4" />
              审核管理
            </Link>
            <Link
              href="/bbs/rules"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              <FileText className="w-4 h-4" />
              社区规则
            </Link>
            <Link
              href="/bbs"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              <FileText className="w-4 h-4" />
              论坛首页
            </Link>
          </div>

          {/* Operations Readiness */}
          <div className="mt-6 bg-blue-50 rounded-xl border border-blue-100 p-4">
            <h2 className="text-sm font-bold text-blue-900 mb-3 inline-flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              运营待办
            </h2>
            <ul className="space-y-2 text-sm text-blue-700">
              {pendingCount > 0 && (
                <li>• {pendingCount} 篇帖子待审核</li>
              )}
              {pendingReports > 0 && (
                <li>• {pendingReports} 个举报待处理</li>
              )}
              {categoryDistribution.filter((c) => c._count.posts === 0).length > 0 && (
                <li>
                  • {categoryDistribution.filter((c) => c._count.posts === 0).length} 个分类暂无内容，建议填充种子内容
                </li>
              )}
              {pendingCount === 0 && pendingReports === 0 && categoryDistribution.filter((c) => c._count.posts === 0).length === 0 && (
                <li>• 暂无待办事项</li>
              )}
            </ul>
            {categoryDistribution.filter((c) => c._count.posts === 0).length > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-100">
                <p className="text-xs text-blue-600 mb-1">空分类（冷启动建议）：</p>
                <div className="flex flex-wrap gap-1.5">
                  {categoryDistribution.filter((c) => c._count.posts === 0).map((cat) => (
                    <span key={cat.id} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
