import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Home, Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle, buildCanonical } from "@/lib/seo";
import { PostCard } from "@/components/bbs/post-card";

export const dynamic = "force-dynamic";

async function getCategory(key: string) {
  try {
    return await prisma.forumCategory.findUnique({
      where: { key },
    });
  } catch {
    return null;
  }
}

async function getPosts(categoryId: string, params: { q?: string; page?: number }) {
  try {
    const { q, page = 1 } = params;
    const pageSize = 20;

    const where: any = { categoryId, status: "published" };
    if (q) where.title = { contains: q, mode: "insensitive" };

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
  const category = await getCategory(key);

  if (!category) {
    return {
      title: buildTitle("分类不存在"),
      robots: { index: false },
    };
  }

  return {
    title: buildTitle(category.name),
    description: category.description || `${category.name} 分类下的帖子`,
    alternates: { canonical: buildCanonical(`/bbs/category/${key}`) },
    openGraph: {
      title: buildTitle(category.name),
      description: category.description || `${category.name} 分类下的帖子`,
      url: buildCanonical(`/bbs/category/${key}`),
      type: "website",
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { key } = await params;
  const sp = await searchParams;
  const q = sp.q || "";
  const page = sp.page ? Math.max(1, parseInt(sp.page, 10)) : 1;

  const category = await getCategory(key);
  if (!category) {
    notFound();
  }

  const { posts, total, pageSize } = await getPosts(category.id, { q, page });
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand via-brand-light to-accent text-white py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm text-brand-light/80 mb-4 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> 首页
            </Link>
            <span>/</span>
            <Link href="/bbs" className="hover:text-white transition-colors">
              社区论坛
            </Link>
            <span>/</span>
            <span className="text-white">{category.name}</span>
          </nav>

          <div className="flex items-center gap-3 mb-3">
            {category.iconText && <span className="text-4xl">{category.iconText}</span>}
            <h1 className="text-2xl md:text-3xl font-extrabold">{category.name}</h1>
          </div>
          {category.description && (
            <p className="text-lg text-brand-light/90 max-w-2xl">{category.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-5 pb-16 relative z-10">
        {/* Top bar: search + new post */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <form action={`/bbs/category/${key}`} method="get" className="flex-1 flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="搜索此分类..."
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
                />
              </div>
              <button
                type="submit"
                className="ml-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors min-h-[40px] shrink-0"
              >
                搜索
              </button>
            </form>

            {isLoggedIn ? (
              <Link
                href="/bbs/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors shrink-0 min-h-[40px]"
              >
                <Plus className="w-4 h-4" />
                发布帖子
              </Link>
            ) : (
              <Link
                href="/login?callbackUrl=/bbs/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-brand text-brand rounded-lg text-sm font-medium hover:bg-accent/10 transition-colors shrink-0 min-h-[40px]"
              >
                <Plus className="w-4 h-4" />
                登录后发帖
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              共 <strong className="text-gray-900">{total}</strong> 个帖子
            </span>
            <Link
              href="/bbs"
              className="inline-flex items-center gap-1 text-brand hover:text-brand-dark transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              返回论坛首页
            </Link>
          </div>
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
              {q ? "没有找到匹配的帖子" : "暂无帖子"}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {q ? "试试其他关键词" : "成为第一个发帖的人吧！"}
            </p>
            {q ? (
              <Link
                href={`/bbs/category/${key}`}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                返回全部
              </Link>
            ) : isLoggedIn ? (
              <Link
                href="/bbs/new"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                发布第一个帖子
              </Link>
            ) : (
              <Link
                href="/login?callbackUrl=/bbs/new"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
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
                href={buildPageUrl(`/bbs/category/${key}`, page - 1, { q })}
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
                    href={buildPageUrl(`/bbs/category/${key}`, p, { q })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors ${
                      p === page
                        ? "bg-brand text-white"
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
                href={buildPageUrl(`/bbs/category/${key}`, page + 1, { q })}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                下一页
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function buildPageUrl(
  base: string,
  page: number,
  params: { q?: string }
): string {
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  if (params.q) sp.set("q", params.q);
  return `${base}?${sp.toString()}`;
}
