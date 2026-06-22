import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MessageSquare, Eye, Pin, ArrowRight, Calendar, Sparkles, Shield, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "社区 - 绝世百宝箱",
  description: "跨境发货、地址邮编、工具使用、海外生活经验交流社区",
  alternates: { canonical: "https://jueshi.net/community" },
};

export default async function CommunityPage() {
  const session = await auth();

  const [categories, recentPosts, pinnedPosts] = await Promise.all([
    prisma.forumCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.forumPost.findMany({
      where: { status: "published" },
      include: {
        user: { select: { name: true, image: true, id: true } },
        category: true,
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.forumPost.findMany({
      where: { status: "published", isPinned: true },
      include: {
        user: { select: { name: true, image: true, id: true } },
        category: true,
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const allPosts = [...pinnedPosts, ...recentPosts.filter(p => !p.isPinned)];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Hero with Beta badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">绝世百宝箱社区</h1>
            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 border border-amber-200">
              Beta 测试中
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            跨境发货、地址邮编、工具使用、海外生活经验交流
          </p>
        </div>
        {session ? (
          <Link
            href="/community/new"
            className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 flex-shrink-0"
          >
            发帖 <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href="/login?callbackUrl=/community/new"
            className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 flex-shrink-0"
          >
            登录发帖 <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Beta notice */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 mb-4 text-sm text-blue-800">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">当前为小范围 Beta 测试社区</p>
            <p className="text-xs mt-0.5 text-blue-600">
              欢迎分享跨境发货经验、反馈工具问题、提出建议。发帖前请先阅读社区规则。
            </p>
          </div>
        </div>
      </div>

      {/* Categories with descriptions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/community/c/${cat.key}`}
            className="flex items-start gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:border-teal-300 hover:shadow-sm transition text-sm"
          >
            <span className="text-lg flex-shrink-0">{cat.iconText}</span>
            <div className="min-w-0">
              <div className="font-medium text-gray-900 truncate">{cat.name}</div>
              <div className="text-xs text-gray-400 truncate">{cat.description || "讨论交流"}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Posts list */}
      {allPosts.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-lg font-semibold text-gray-700">社区还没有帖子</h2>
          <p className="text-sm text-gray-400 mt-1">成为第一个发帖的人吧！</p>
          <div className="mt-6 max-w-sm mx-auto text-left">
            <div className="text-xs font-medium text-gray-500 mb-2">你可以发什么：</div>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                分享你的跨境发货经验（物流选择、时效、费用）
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                反馈工具使用中遇到的问题或建议
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                提问地址邮编、HS 编码、报关单据相关问题
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                分享海外生活经验和实用技巧
              </li>
            </ul>
          </div>
          {session ? (
            <Link href="/community/new" className="inline-flex items-center gap-1 mt-6 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">
              发第一帖 <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link href="/login?callbackUrl=/community/new" className="inline-flex items-center gap-1 mt-6 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">
              登录发帖 <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {allPosts.map(post => (
            <Link
              key={post.id}
              href={`/community/t/${post.slug}`}
              className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-teal-300 hover:shadow-sm transition"
            >
              <div className="flex items-start gap-3">
                {post.user.image ? (
                  <img src={post.user.image} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {(post.user.name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {post.isPinned && (
                      <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    )}
                    <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.excerpt || post.content.slice(0, 120)}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{post.user.name || "匿名"}</span>
                    <span className="inline-flex items-center gap-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <MessageSquare className="w-3 h-3" />
                      {post._count.comments}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <Eye className="w-3 h-3" />
                      {post.viewCount}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                      {post.category.name}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Footer links */}
      <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-400">
        <Link href="/community/c/general" className="inline-flex items-center gap-1 hover:text-gray-600">
          <Shield className="w-3 h-3" /> 社区规则
        </Link>
        <Link href="/community/c/feedback" className="inline-flex items-center gap-1 hover:text-gray-600">
          <BookOpen className="w-3 h-3" /> Beta 反馈
        </Link>
      </div>
    </div>
  );
}
