import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle, buildCanonical } from "@/lib/seo";
import { PostCard } from "@/components/bbs/post-card";
import { CategoryBadge } from "@/components/bbs/category-badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: buildTitle("社区"),
  description: "交流海外生活、工具经验、物流问题的社区",
  alternates: { canonical: buildCanonical("/bbs") },
  openGraph: {
    title: buildTitle("社区"),
    description: "交流海外生活、工具经验、物流问题的社区",
    url: buildCanonical("/bbs"),
    type: "website",
  },
};

async function getCategories() {
  try {
    const cats = await prisma.forumCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return cats;
  } catch {
    return [];
  }
}

async function getPosts(params: { q?: string; category?: string; page?: number }) {
  try {
    const { q, category, page = 1 } = params;
    const pageSize = 20;

    const where: any = { status: "published" };
    if (category) where.category = { key: category };
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

export default async function BBSPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q || "";
  const category = params.category || "";
  const page = params.page ? Math.max(1, parseInt(params.page, 10)) : 1;

  const [categories, { posts, total, pageSize }] = await Promise.all([
    getCategories(),
    getPosts({ q, category, page }),
  ]);
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 text-white py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm text-teal-100 border border-white/10 mb-5">
              <Sparkles className="w-4 h-4" />
              <span>海外百宝箱社区</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              海外百宝箱社区
            </h1>
            <p className="text-lg text-teal-100/90 max-w-2xl leading-relaxed">
              交流海外生活、工具经验、物流问题
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-5 pb-16 relative z-10">
        {/* Top bar: categories + search + new post */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Link
              href="/bbs"
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px] ${
                !category
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              全部
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.key}
                href={
                  q
                    ? `/bbs?category=${cat.key}&q=${encodeURIComponent(q)}`
                    : `/bbs?category=${cat.key}`
                }
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px] ${
                  category === cat.key
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.iconText && <span>{cat.iconText}</span>}
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>

          {/* Search + New Post */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form action="/bbs" method="get" className="flex-1 flex">
              {category && (
                <input type="hidden" name="category" value={category} />
              )}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="搜索帖子..."
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors shrink-0 min-h-[40px]"
              >
                <Plus className="w-4 h-4" />
                发布帖子
              </Link>
            ) : (
              <Link
                href="/login?callbackUrl=/bbs/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-teal-600 text-teal-600 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors shrink-0 min-h-[40px]"
              >
                <Plus className="w-4 h-4" />
                登录后发帖
              </Link>
            )}
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
              {q || category ? "没有找到匹配的帖子" : "暂无帖子"}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {q || category
                ? "试试其他关键词或分类"
                : "成为第一个发帖的人吧！"}
            </p>
            {q || category ? (
              <Link
                href="/bbs"
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                返回全部
              </Link>
            ) : isLoggedIn ? (
              <Link
                href="/bbs/new"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                发布第一个帖子
              </Link>
            ) : (
              <Link
                href="/login?callbackUrl=/bbs/new"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
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
                href={buildPageUrl("/bbs", page - 1, { q, category })}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                上一页
              </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              // Show at most 7 page buttons
              if (totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                return (
                  <Link
                    key={p}
                    href={buildPageUrl("/bbs", p, { q, category })}
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
                href={buildPageUrl("/bbs", page + 1, { q, category })}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                下一页
              </Link>
            )}
          </div>
        )}

        {/* Related links */}
        <div className="mt-8 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100 p-6">
          <h3 className="font-bold text-gray-900 mb-3">还需要什么？</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors min-h-[44px]"
            >
              🛠️ 工具中心
            </Link>
            <Link
              href="/guides"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              📖 实用指南
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              📚 资源库
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildPageUrl(
  base: string,
  page: number,
  params: { q?: string; category?: string }
): string {
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  return `${base}?${sp.toString()}`;
}
