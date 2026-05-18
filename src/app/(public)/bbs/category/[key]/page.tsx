import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildTitle, buildCanonical } from "@/lib/seo";
import { PostCard } from "@/components/bbs/post-card";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getCategory(key: string) {
  try {
    const cat = await prisma.forumCategory.findUnique({
      where: { key },
    });
    return cat;
  } catch {
    return null;
  }
}

async function getPostsByCategory(categoryKey: string, page: number = 1) {
  try {
    const pageSize = 20;

    const where = {
      status: "published" as const,
      category: { key: categoryKey },
    };

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { name: true, email: true } },
          category: true,
        },
      }),
      prisma.forumPost.count({ where }),
    ]);

    return { posts, total, page, pageSize };
  } catch {
    return { posts: [], total: 0, page: 1, pageSize: 20 };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const { key } = await params;
  const cat = await getCategory(key);

  if (!cat) {
    return {
      title: buildTitle("分类不存在"),
      robots: { index: false },
    };
  }

  return {
    title: buildTitle(`${cat.name} - 社区`),
    description: cat.description || `${cat.name} 分类下的帖子`,
    alternates: { canonical: buildCanonical(`/bbs/category/${key}`) },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { key } = await params;
  const sp = await searchParams;
  const page = sp.page ? Math.max(1, parseInt(sp.page, 10)) : 1;

  const [cat, { posts, total, pageSize }] = await Promise.all([
    getCategory(key),
    getPostsByCategory(key, page),
  ]);

  if (!cat) {
    notFound();
  }

  const totalPages = Math.ceil(total / pageSize);
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 text-white py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4">
          <Link
            href="/bbs"
            className="inline-flex items-center gap-1.5 text-sm text-teal-100 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            返回论坛
          </Link>

          <div className="flex items-center gap-3 mb-3">
            {cat.iconText && (
              <span className="text-3xl">{cat.iconText}</span>
            )}
            <h1 className="text-3xl md:text-4xl font-extrabold">{cat.name}</h1>
          </div>
          {cat.description && (
            <p className="text-lg text-teal-100/90 max-w-2xl leading-relaxed">
              {cat.description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-5 pb-16 relative z-10">
        {/* Posts count + CTA */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <span className="text-sm text-gray-500">
            共 {total} 条帖子
          </span>
          {isLoggedIn && (
            <Link
              href="/bbs/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors min-h-[44px]"
            >
              <Plus className="w-4 h-4" /> 发布帖子
            </Link>
          )}
        </div>

        {/* Posts list */}
        {posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  createdAt: post.createdAt,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              该分类暂无帖子
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              欢迎发布第一篇！
            </p>
            {isLoggedIn ? (
              <Link
                href="/bbs/new"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors min-h-[44px]"
              >
                <Plus className="w-4 h-4" /> 发布帖子
              </Link>
            ) : (
              <Link
                href={`/login?callbackUrl=/bbs/category/${key}`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-teal-600 text-teal-600 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors min-h-[44px]"
              >
                登录后发帖
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/bbs/category/${key}?page=${page - 1}`}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                上一页
              </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              if (totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                return (
                  <Link
                    key={p}
                    href={`/bbs/category/${key}?page=${p}`}
                    className={`px-3 py-2 rounded-lg text-sm font-medium min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors ${
                      p === page
                        ? "bg-teal-600 text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </Link>
                );
              }
              return null;
            })}

            {page < totalPages && (
              <Link
                href={`/bbs/category/${key}?page=${page + 1}`}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                下一页
              </Link>
            )}
          </div>
        )}

        {/* Return to forum */}
        <div className="mt-6 text-center">
          <Link
            href="/bbs"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors min-h-[44px]"
          >
            <ChevronLeft className="w-4 h-4" /> 返回论坛首页
          </Link>
        </div>
      </div>
    </div>
  );
}
