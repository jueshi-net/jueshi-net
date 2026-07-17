import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle } from "@/lib/seo";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import BreadcrumbBar from "@/components/design-system/BreadcrumbBar";
import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, Eye, MessageCircle, ThumbsUp, Clock } from "lucide-react";
import { maskEmail } from "@/lib/community/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: buildTitle("我的收藏 - 社区"),
  robots: { index: false, follow: false },
};

export default async function MyBookmarksPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <JueshiV4PublicShell>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-[1200px] mx-auto px-4 py-2.5">
              <BreadcrumbBar
                items={[
                  { title: "首页", href: "/" },
                  { title: "社区论坛", href: "/bbs" },
                  { title: "我的收藏", current: true },
                ]}
              />
            </div>
          </div>
          <div className="max-w-[1200px] mx-auto px-4 py-12">
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">请先登录</p>
              <Link
                href="/login?callbackUrl=/bbs/my-bookmarks"
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

  const bookmarks = await prisma.forumBookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      post: {
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          status: true,
          viewCount: true,
          commentCount: true,
          createdAt: true,
          category: { select: { id: true, key: true, name: true } },
          user: { select: { id: true, name: true, email: true } },
          _count: {
            select: {
              likes: true,
              comments: { where: { status: "published" } },
            },
          },
        },
      },
    },
  });

  // Filter out non-published posts
  const validBookmarks = bookmarks.filter((b) => b.post && b.post.status === "published");

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1200px] mx-auto px-4 py-2.5">
            <BreadcrumbBar
              items={[
                { title: "首页", href: "/" },
                { title: "社区论坛", href: "/bbs" },
                { title: "我的收藏", current: true },
              ]}
            />
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-6">
            <Bookmark className="w-6 h-6 text-brand" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              我的收藏
            </h1>
            <span className="text-sm text-gray-500">({validBookmarks.length})</span>
          </div>

          {validBookmarks.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-1">暂无收藏</p>
              <p className="text-sm text-gray-500 mb-4">
                在帖子详情页点击收藏按钮，即可在这里查看
              </p>
              <Link
                href="/bbs"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark"
              >
                浏览论坛
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {validBookmarks.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-100">
                      {b.post.category.name}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 break-words mb-1">
                    <Link href={`/bbs/${b.post.slug}`} className="hover:text-brand">
                      {b.post.title}
                    </Link>
                  </h3>
                  {b.post.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {b.post.excerpt}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      {b.post.user.name || maskEmail(b.post.user.email)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(b.post.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {b.post.viewCount} 浏览
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {b.post._count.comments} 回复
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {b.post._count.likes} 赞
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Bookmark className="w-3 h-3" />
                      收藏于 {new Date(b.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
