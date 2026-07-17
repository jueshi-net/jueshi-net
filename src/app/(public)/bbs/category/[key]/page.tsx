import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft, Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle, buildCanonical } from "@/lib/seo";
import { PostCard } from "@/components/bbs/post-card";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import BreadcrumbBar from "@/components/design-system/BreadcrumbBar";
import { ForumEmptyState } from "@/components/community/forum-empty-state";

export const dynamic = "force-dynamic";

async function getCategory(key: string) {
  return await prisma.forumCategory.findUnique({
    where: { key },
  });
}

async function getPosts(categoryId: string, params: { q?: string; page?: number }) {
  try {
    const { q, page = 1 } = params;
    const pageSize = 20;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/**
 * Suspense fallback skeleton for the category content area.
 * Shown while CategoryPostList fetches post data.
 */
function CategoryContentSkeleton() {
  return (
    <>
      {/* Stats skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      {/* Post list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-4 md:p-5"
          >
            <div className="flex items-start gap-2 mb-2">
              <div className="h-5 flex-1 max-w-md bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="flex gap-3">
              <div className="h-3 w-16 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Async server component for the category post list.
 * Fetches posts independently so the main page can render
 * the category header immediately while posts stream in.
 *
 * This component is rendered inside a <Suspense> boundary so it
 * does NOT block the initial HTTP response. If the category doesn't
 * exist, notFound() is called in the parent page BEFORE this
 * component is rendered.
 */
async function CategoryPostList({
  categoryId,
  categoryKey,
  q,
  page,
}: {
  categoryId: string;
  categoryKey: string;
  q: string;
  page: number;
}) {
  const { posts, total, pageSize } = await getPosts(categoryId, { q, page });
  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
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
      ) : q ? (
        <ForumEmptyState variant="no-search-results" searchQuery={q} categoryKey={categoryKey} />
      ) : (
        <ForumEmptyState variant="no-posts" isLoggedIn={false} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildPageUrl(`/bbs/category/${categoryKey}`, page - 1, { q })}
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
                  href={buildPageUrl(`/bbs/category/${categoryKey}`, p, { q })}
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
              href={buildPageUrl(`/bbs/category/${categoryKey}`, page + 1, { q })}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              下一页
            </Link>
          )}
        </div>
      )}
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const { key } = await params;
  const category = await getCategory(key);

  if (!category) {
    notFound();
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

  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        {/* Page header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="mb-3">
              <BreadcrumbBar
                items={[
                  { title: "首页", href: "/" },
                  { title: "社区论坛", href: "/bbs" },
                  { title: category.name, current: true },
                ]}
              />
            </div>
            <div className="flex items-center gap-3">
              {category.iconText && (
                <span className="text-3xl">{category.iconText}</span>
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 pb-16">
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

          {/* Stats + Posts list + Pagination - streamed via Suspense
              to preserve loading UX without route-level loading.tsx
              that would cause soft 404 */}
          <Suspense fallback={<CategoryContentSkeleton />}>
            <CategoryPostList
              categoryId={category.id}
              categoryKey={key}
              q={q}
              page={page}
            />
          </Suspense>
        </div>
      </div>
    </JueshiV4PublicShell>
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
