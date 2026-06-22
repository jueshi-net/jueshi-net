import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MessageSquare, Eye, Pin, ArrowRight, Calendar, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "社区 - 绝世百宝箱",
  description: "跨境工具问答社区，分享经验、提问互助",
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
      {/* Hero */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">社区论坛</h1>
          <p className="text-sm text-gray-500 mt-1">分享经验、提问互助、讨论跨境工具</p>
        </div>
        {session ? (
          <Link
            href="/community/new"
            className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
          >
            发帖 <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href="/login?callbackUrl=/community/new"
            className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
          >
            登录发帖 <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/community/c/${cat.key}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-sm"
          >
            <span>{cat.iconText}</span>
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Posts list */}
      {allPosts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-lg font-semibold text-gray-700">社区还没有帖子</h2>
          <p className="text-sm text-gray-400 mt-1">成为第一个发帖的人吧！</p>
          {session ? (
            <Link href="/community/new" className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">
              发第一帖 <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link href="/login?callbackUrl=/community/new" className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">
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
    </div>
  );
}
