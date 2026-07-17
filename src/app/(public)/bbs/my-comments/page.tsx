import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle } from "@/lib/seo";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import BreadcrumbBar from "@/components/design-system/BreadcrumbBar";
import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, ThumbsUp, Clock, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: buildTitle("我的评论 - 社区"),
  robots: { index: false, follow: false },
};

export default async function MyCommentsPage() {
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
                  { title: "我的评论", current: true },
                ]}
              />
            </div>
          </div>
          <div className="max-w-[1200px] mx-auto px-4 py-12">
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">请先登录</p>
              <Link
                href="/login?callbackUrl=/bbs/my-comments"
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

  const comments = await prisma.forumComment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      post: {
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          category: { select: { id: true, key: true, name: true } },
        },
      },
      _count: {
        select: { likes: true },
      },
    },
  });

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1200px] mx-auto px-4 py-2.5">
            <BreadcrumbBar
              items={[
                { title: "首页", href: "/" },
                { title: "社区论坛", href: "/bbs" },
                { title: "我的评论", current: true },
              ]}
            />
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-6 h-6 text-brand" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              我的评论
            </h1>
            <span className="text-sm text-gray-500">({comments.length})</span>
          </div>

          {comments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-1">暂无评论</p>
              <p className="text-sm text-gray-500 mb-4">
                参与帖子讨论，你的评论会出现在这里
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
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  {/* Status badge */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        c.status === "published"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : c.status === "pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-gray-50 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {c.status === "published"
                        ? "已发布"
                        : c.status === "pending"
                        ? "待审核"
                        : c.status === "hidden"
                        ? "已隐藏"
                        : c.status}
                    </span>
                    {c.isAccepted && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-600 border border-green-200 inline-flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" /> 已采纳
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-100">
                      {c.post.category.name}
                    </span>
                  </div>

                  {/* Comment content */}
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words mb-2 line-clamp-3">
                    {c.content}
                  </p>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(c.createdAt).toLocaleString("zh-CN")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {c._count.likes} 赞
                    </span>
                    {c.post.status === "published" && (
                      <Link
                        href={`/bbs/${c.post.slug}`}
                        className="text-brand hover:underline"
                      >
                        查看原帖: {c.post.title.length > 20
                          ? c.post.title.slice(0, 20) + "..."
                          : c.post.title}
                      </Link>
                    )}
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
