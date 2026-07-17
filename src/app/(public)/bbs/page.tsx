import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search, FileText, Tag, Clock, MessageCircle, TrendingUp, Award, BookOpen, Wrench, Lightbulb, Package, Ship, Mail, Medal, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle, buildCanonical } from "@/lib/seo";
import { PostCard } from "@/components/bbs/post-card";
import { CategoryBadge } from "@/components/bbs/category-badge";
import { formatDateTime } from "@/lib/utils";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import BreadcrumbBar from "@/components/design-system/BreadcrumbBar";

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

async function getCategoriesWithCounts() {
  try {
    const cats = await prisma.forumCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, key: true, name: true, description: true, iconText: true, color: true },
    });
    const postCounts = await prisma.forumPost.groupBy({
      by: ["categoryId"],
      _count: { id: true },
      where: { status: "published" },
    });
    const countMap = new Map<string, number>();
    for (const pc of postCounts) countMap.set(pc.categoryId, pc._count.id);
    return cats.map(c => ({ ...c, postCount: countMap.get(c.id) || 0 }));
  } catch {
    return [];
  }
}

async function getPosts(params: { q?: string; category?: string; tag?: string; sort?: string; featured?: boolean; page?: number }) {
  try {
    const { q, category, tag, sort = "latest", featured, page = 1 } = params;
    const pageSize = 20;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { status: "published" };
    if (category) where.category = { key: category };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }
    if (tag) where.tags = { has: tag };
    if (featured) where.isFeatured = true;

    // Determine sort order
    let orderBy: any[];
    switch (sort) {
      case "hot":
        // Hot = most views in last 7 days
        orderBy = [{ isPinned: "desc" }, { viewCount: "desc" }];
        break;
      case "replies":
        orderBy = [{ isPinned: "desc" }, { commentCount: "desc" }];
        break;
      case "featured":
        orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }];
        break;
      case "latest":
      default:
        orderBy = [{ isPinned: "desc" }, { createdAt: "desc" }];
        break;
    }

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        orderBy,
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

async function getStats() {
  try {
    const [postCount, categoryCount, latestPost] = await Promise.all([
      prisma.forumPost.count({ where: { status: "published" } }),
      prisma.forumCategory.count({ where: { isActive: true } }),
      prisma.forumPost.findFirst({
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);
    return { postCount, categoryCount, latestPostAt: latestPost?.createdAt ?? null };
  } catch {
    return { postCount: 0, categoryCount: 0, latestPostAt: null };
  }
}

async function getTopUsers() {
  try {
    let users = await prisma.user.findMany({
      where: { honorScore: { gt: 0 } },
      orderBy: { honorScore: "desc" },
      take: 5,
      select: { id: true, name: true, honorScore: true },
    });
    if (users.length === 0) {
      users = await prisma.user.findMany({
        orderBy: { createdAt: "asc" },
        take: 5,
        select: { id: true, name: true, honorScore: true },
      });
    }
    return users;
  } catch {
    return [];
  }
}

async function getHotTags() {
  try {
    const posts = await prisma.forumPost.findMany({
      where: { status: "published" },
      select: { tags: true },
      take: 50,
    });
    const tagCount = new Map<string, number>();
    for (const p of posts) {
      const tags = p.tags;
      if (tags && Array.isArray(tags)) {
        for (const t of tags) {
          if (typeof t === "string") {
            tagCount.set(t, (tagCount.get(t) || 0) + 1);
          }
        }
      }
    }
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));
  } catch {
    return [];
  }
}

export default async function BBSPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; tag?: string; sort?: string; featured?: string; page?: string; created?: string; status?: string }>;
}) {
  const params = await searchParams;
  const q = params.q || "";
  const category = params.category || "";
  const tag = params.tag || "";
  const sort = params.sort || "latest";
  const featured = params.featured === "1" || params.featured === "true";
  const page = params.page ? Math.max(1, parseInt(params.page, 10)) : 1;
  const createdFlag = params.created === "1";
  const postStatus = params.status || "";

  const [categories, { posts, total, pageSize }, stats, categoriesWithCounts, topUsers, hotTags] = await Promise.all([
    getCategories(),
    getPosts({ q, category, tag, sort, featured, page }),
    getStats(),
    getCategoriesWithCounts(),
    getTopUsers(),
    getHotTags(),
  ]);
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const totalPages = Math.ceil(total / pageSize);
  const medals = ["1", "2", "3"];

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          {/* Post creation success banner */}
          {createdFlag && (
            <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-800">
                  {postStatus === "pending"
                    ? "帖子已提交，审核通过后将在社区公开"
                    : "帖子发布成功！"}
                </p>
                {postStatus === "pending" && (
                  <p className="text-xs text-green-600 mt-0.5">
                    您的帖子正在等待管理员审核，审核通过后其他用户即可看到。
                  </p>
                )}
              </div>
            </div>
          )}
          {/* Breadcrumb */}
          <div className="mb-4">
            <BreadcrumbBar items={[
              { title: "首页", href: "/" },
              { title: "社区", current: true },
            ]} />
          </div>
          {/* Compact page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">社区论坛</h1>
              <p className="text-sm text-gray-600 mt-1">
                交流出海工具、海外生活、物流经验 · {stats.postCount} 帖 · {stats.categoryCount} 分类
              </p>
            </div>
            {isLoggedIn ? (
              <Link
                href="/bbs/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-lg text-sm font-bold hover:bg-brand-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                发布帖子
              </Link>
            ) : (
              <Link
                href="/login?callbackUrl=/bbs/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-lg text-sm font-bold hover:bg-brand-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                登录后发帖
              </Link>
            )}
          </div>
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_300px] gap-6">
              {/* Left sidebar — Community navigation */}
              <aside className="hidden lg:block">
                <div className="sticky top-20 space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-brand" />
                      社区导航
                    </h3>
                    <nav className="space-y-1">
                      <Link
                        href="/bbs"
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          !category ? "bg-brand text-white font-medium" : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>全部</span>
                        <span className="text-xs opacity-75">{stats.postCount}</span>
                      </Link>
                      {categoriesWithCounts.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/bbs?category=${cat.key}`}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                            category === cat.key ? "bg-brand text-white font-medium" : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {cat.iconText && <span>{cat.iconText}</span>}
                            <span>{cat.name}</span>
                          </span>
                          <span className="text-xs opacity-75">{cat.postCount}</span>
                        </Link>
                      ))}
                    </nav>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">社区规则</h3>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      <li>• 禁止广告、灰产、引战</li>
                      <li>• 新帖需审核后展示</li>
                      <li>• 尊重他人，理性讨论</li>
                      <li>• 转载请注明出处</li>
                    </ul>
                    <Link href="/bbs" className="text-xs text-brand hover:underline mt-2 inline-block">
                      查看完整规则 →
                    </Link>
                  </div>

                  <Link
                    href="/bbs/new"
                    className="block bg-gradient-to-br from-brand/5 to-accent/5 rounded-xl border border-accent/20 p-4 text-center hover:border-brand/30 transition-colors"
                  >
                    <span className="text-sm font-medium text-brand flex items-center justify-center gap-1.5"><Lightbulb className="w-4 h-4" /> Beta 反馈</span>
                    <p className="text-xs text-slate-600 mt-1">反馈布局与功能建议</p>
              </Link>
            </div>
          </aside>

          {/* Center — Topic stream */}
          <main>
            {/* Mobile search + new post */}
            <div className="lg:hidden mb-4">
              <form action="/bbs" method="get" className="flex gap-2 mb-3">
                {category && <input type="hidden" name="category" value={category} />}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="q"
                    defaultValue={q}
                    placeholder="搜索帖子..."
                    className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-gray-100 rounded-lg text-sm">搜索</button>
              </form>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Link href="/bbs" className={`shrink-0 px-3 py-1.5 rounded-full text-sm ${!category ? "bg-brand text-white" : "bg-slate-100 text-slate-700"}`}>全部</Link>
                {categoriesWithCounts.map((cat) => (
                  <Link key={cat.id} href={`/bbs?category=${cat.key}`} className={`shrink-0 px-3 py-1.5 rounded-full text-sm ${category === cat.key ? "bg-brand text-white" : "bg-slate-100 text-slate-700"}`}>
                    {cat.iconText} {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop search */}
            <div className="hidden lg:block mb-4">
              <form action="/bbs" method="get" className="flex gap-3">
                {category && <input type="hidden" name="category" value={category} />}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="q"
                    defaultValue={q}
                    placeholder="搜索帖子..."
                    className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm"
                  />
                </div>
                <button type="submit" className="px-5 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">搜索</button>
              </form>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <FileText className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xl font-bold text-slate-900">{stats.postCount}</span>
                </div>
                <span className="text-xs text-slate-600">帖子</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Tag className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xl font-bold text-slate-900">{stats.categoryCount}</span>
                </div>
                <span className="text-xs text-slate-600">分类</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-medium text-gray-700">
                    {stats.latestPostAt ? formatDateTime(stats.latestPostAt) : "暂无"}
                  </span>
                </div>
                <span className="text-xs text-slate-600">最新更新</span>
              </div>
            </div>

            {/* Sort tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {[
                { key: "latest", label: "最新" },
                { key: "hot", label: "热门" },
                { key: "replies", label: "最多回复" },
                { key: "featured", label: "精华" },
              ].map((tab) => {
                const sp = new URLSearchParams();
                if (q) sp.set("q", q);
                if (category) sp.set("category", category);
                if (tag) sp.set("tag", tag);
                if (featured) sp.set("featured", "1");
                sp.set("sort", tab.key);
                const href = `/bbs${sp.toString() ? `?${sp.toString()}` : ""}`;
                return (
                  <Link
                    key={tab.key}
                    href={href}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      sort === tab.key
                        ? "bg-brand text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
              {/* Active tag filter */}
              {tag && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 border border-blue-200 text-blue-700">
                  #{tag}
                  <Link
                    href={`/bbs?${(() => {
                      const sp = new URLSearchParams();
                      if (q) sp.set("q", q);
                      if (category) sp.set("category", category);
                      if (sort) sp.set("sort", sort);
                      return sp.toString();
                    })()}`}
                    className="ml-1 text-blue-400 hover:text-blue-600"
                  >
                    ✕
                  </Link>
                </span>
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {q || category ? "没有找到匹配的帖子" : "暂无帖子"}
                </h2>
                <p className="text-sm text-slate-600 mb-5">
                  {q || category ? "试试其他关键词或分类" : "成为第一个发帖的人吧！"}
                </p>
                {q || category ? (
                  <Link href="/bbs" className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
                    返回全部
                  </Link>
                ) : isLoggedIn ? (
                  <Link href="/bbs/new" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    发布第一个帖子
                  </Link>
                ) : (
                  <Link href="/login?callbackUrl=/bbs/new" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium">
                    登录后发帖
                  </Link>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link href={buildPageUrl("/bbs", page - 1, { q, category, tag, sort, featured })} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    上一页
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                    return (
                      <Link
                        key={p}
                        href={buildPageUrl("/bbs", p, { q, category, tag, sort, featured })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          p === page ? "bg-brand text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  }
                  return null;
                })}
                {page < totalPages && (
                  <Link href={buildPageUrl("/bbs", page + 1, { q, category, tag, sort, featured })} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    下一页
                  </Link>
                )}
              </div>
            )}
          </main>

          {/* Right sidebar — Operations */}
          <aside className="hidden xl:block">
            <div className="sticky top-20 space-y-4">
              {/* New post button */}
              {isLoggedIn ? (
                <Link href="/bbs/new" className="block w-full bg-brand text-white rounded-xl py-3 text-center font-bold text-sm hover:bg-brand-dark transition-colors">
                  <span className="flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" /> 发布新帖</span>
                </Link>
              ) : (
                <Link href="/login?callbackUrl=/bbs/new" className="block w-full bg-brand text-white rounded-xl py-3 text-center font-bold text-sm hover:bg-brand-dark transition-colors">
                  <span className="flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" /> 登录后发帖</span>
                </Link>
              )}

              {/* Newbie guide */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-brand" />
                  新手发帖指南
                </h3>
                <ol className="space-y-1.5 text-xs text-slate-600 list-decimal list-inside">
                  <li>点击「发布新帖」</li>
                  <li>选择合适分类</li>
                  <li>填写标题和内容</li>
                  <li>提交后等待审核</li>
                  <li>审核通过后展示</li>
                </ol>
              </div>

              {/* Hot tags */}
              {hotTags.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-brand" />
                    热门标签
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {hotTags.map(({ tag: t, count }) => (
                      <Link
                        key={t}
                        href={`/bbs?tag=${encodeURIComponent(t)}${sort !== "latest" ? `&sort=${sort}` : ""}`}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          tag === t
                            ? "bg-brand text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        #{t} <span className="opacity-75">{count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Active contributors */}
              {topUsers.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-brand" />
                    活跃贡献者
                  </h3>
                  <div className="space-y-2">
                    {topUsers.map((user, i) => (
                      <div key={user.id} className="flex items-center gap-2">
                        <span className="text-sm flex items-center justify-center w-5 h-5 rounded-full bg-brand/10 text-brand text-xs font-bold">{i < 3 ? medals[i] : `${i + 1}`}</span>
                        <div className="w-7 h-7 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="text-sm text-gray-700 flex-1 truncate">{user.name || "匿名"}</span>
                        <span className="text-xs text-slate-500">{user.honorScore || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related tools */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-brand" />
                  相关工具入口
                </h3>
                <div className="space-y-1.5">
                  <Link href="/tools/hs-code" className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand transition-colors"><Package className="w-4 h-4" /> HS 编码查询</Link>
                  <Link href="/tools/shipping-calculator" className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand transition-colors"><Ship className="w-4 h-4" /> 运费计算器</Link>
                  <Link href="/tools/postal-code" className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand transition-colors"><Mail className="w-4 h-4" /> 邮编查询</Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      </div>
    </JueshiV4PublicShell>
  );
}

function buildPageUrl(
  base: string,
  page: number,
  params: { q?: string; category?: string; tag?: string; sort?: string; featured?: boolean }
): string {
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.tag) sp.set("tag", params.tag);
  if (params.sort) sp.set("sort", params.sort);
  if (params.featured) sp.set("featured", "1");
  return `${base}?${sp.toString()}`;
}
