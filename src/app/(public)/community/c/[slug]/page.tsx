import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MessageSquare, Eye, Pin, ArrowRight, ArrowLeft, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await prisma.forumCategory.findUnique({ where: { key: slug } });
  return { title: `${cat?.name || "分类"} - 社区 - 绝世百宝箱` };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  const category = await prisma.forumCategory.findUnique({ where: { key: slug } });
  if (!category) notFound();

  const posts = await prisma.forumPost.findMany({
    where: { status: "published", categoryId: category.id },
    include: {
      user: { select: { name: true, image: true, id: true } },
      _count: { select: { comments: true } },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Link href="/community" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> 返回社区
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{category.iconText}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
            <p className="text-sm text-gray-500">{category.description || `${category.name}分类下的所有帖子`}</p>
          </div>
        </div>
        {session ? (
          <Link href={`/community/new?category=${category.id}`} className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">
            发帖 <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link href="/login?callbackUrl=/community/new" className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">
            登录发帖 <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-500">该分类下还没有帖子</p>
          {session && (
            <Link href={`/community/new?category=${category.id}`} className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">
              发第一帖 <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <Link key={post.id} href={`/community/t/${post.slug}`} className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-teal-300 transition">
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
                    {post.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500" />}
                    <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{post.user.name || "匿名"}</span>
                    <span className="inline-flex items-center gap-0.5"><Calendar className="w-3 h-3" />{new Date(post.createdAt).toLocaleDateString("zh-CN")}</span>
                    <span className="inline-flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />{post._count.comments}</span>
                    <span className="inline-flex items-center gap-0.5"><Eye className="w-3 h-3" />{post.viewCount}</span>
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
