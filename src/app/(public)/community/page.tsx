import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  MessageSquare,
  Eye,
  Pin,
  ArrowRight,
  Sparkles,
  Shield,
  BookOpen,
  Flame,
  Hash,
  Users,
  Award,
  Inbox,
  Lightbulb,
  Star,
  CheckCircle2,
  ThumbsUp,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "社区 - 绝世百宝箱",
  description: "跨境发货、地址邮编、工具使用、海外生活经验交流社区",
  alternates: { canonical: "https://jueshi.net/community" },
};

type FilterKey = "latest" | "hot" | "unanswered" | "featured" | "solved";

const FILTER_TABS: { key: FilterKey; label: string; icon: typeof Clock }[] = [
  { key: "latest", label: "最新", icon: Clock },
  { key: "hot", label: "热门", icon: Flame },
  { key: "unanswered", label: "未回复", icon: Inbox },
  { key: "featured", label: "精华", icon: Star },
  { key: "solved", label: "已解决", icon: CheckCircle2 },
];

/** 格式化相对时间 */
function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds < 60) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return d.toLocaleDateString("zh-CN");
}

/** 从 Json? 字段安全提取标签数组 */
function getTagsArray(tags: unknown): string[] {
  if (!tags || !Array.isArray(tags)) return [];
  return tags.filter((t): t is string => typeof t === "string" && t.trim().length > 0).slice(0, 4);
}

/** 根据分类 key 返回帖子卡片左侧边框颜色 */
function categoryBorderColor(categoryKey: string): string {
  switch (categoryKey) {
    case "general":
      return "border-l-teal-400";
    case "tools":
      return "border-l-blue-400";
    case "logistics":
    case "shipping":
      return "border-l-amber-400";
    case "overseas-life":
      return "border-l-purple-400";
    case "feedback":
      return "border-l-rose-400";
    default:
      return "border-l-teal-400";
  }
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string | string[] }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const rawFilter = Array.isArray(sp.filter) ? sp.filter[0] : sp.filter;
  const activeFilter: FilterKey = FILTER_TABS.some((t) => t.key === rawFilter)
    ? (rawFilter as FilterKey)
    : "latest";

  // ---- Build filter conditions ----
  const baseWhere = { status: "published" as const };
  let filterWhere: Record<string, unknown> = {};
  const orderBy: Record<string, "asc" | "desc">[] = [{ isPinned: "desc" }];

  switch (activeFilter) {
    case "hot":
      orderBy.push({ commentCount: "desc" });
      break;
    case "unanswered":
      filterWhere = { commentCount: 0 };
      orderBy.push({ createdAt: "desc" });
      break;
    case "featured":
      filterWhere = { isFeatured: true };
      orderBy.push({ createdAt: "desc" });
      break;
    case "solved":
      filterWhere = { isSolved: true };
      orderBy.push({ createdAt: "desc" });
      break;
    case "latest":
    default:
      orderBy.push({ createdAt: "desc" });
      break;
  }

  const postInclude = {
    user: { select: { id: true, name: true, image: true, honorScore: true } },
    category: true,
    _count: { select: { comments: true, likes: true } },
  };

  // ---- Parallel queries ----
  const [categories, posts, tagData, contributorData, categoryCounts] = await Promise.all([
    prisma.forumCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.forumPost.findMany({
      where: { ...baseWhere, ...filterWhere },
      include: postInclude,
      orderBy,
      take: 20,
    }),
    // Popular tags: fetch recent posts' tags and aggregate in JS
    prisma.forumPost
      .findMany({
        where: { status: "published" },
        select: { tags: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      })
      .then((results) => {
        const tagCounts = new Map<string, number>();
        for (const r of results) {
          for (const t of getTagsArray(r.tags)) {
            tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
          }
        }
        return Array.from(tagCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15);
      }),
    // Active contributors: aggregate from recent posts in JS
    prisma.forumPost
      .findMany({
        where: { status: "published" },
        select: {
          userId: true,
          user: { select: { id: true, name: true, image: true, honorScore: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      })
      .then((results) => {
        const userMap = new Map<
          string,
          { id: string; name: string | null; image: string | null; honorScore: number; count: number }
        >();
        for (const r of results) {
          if (!r.user) continue;
          const existing = userMap.get(r.userId);
          if (existing) {
            existing.count++;
          } else {
            userMap.set(r.userId, { ...r.user, count: 1 });
          }
        }
        return Array.from(userMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      }),
    prisma.forumPost.groupBy({
      by: ["categoryId"],
      where: { status: "published" },
      _count: { categoryId: true },
    }),
  ]);

  const postCountByCategory = new Map<string, number>(
    categoryCounts.map((c) => [c.categoryId, c._count.categoryId]),
  );
  const newPostHref = session ? "/community/new" : "/login?callbackUrl=/community/new";
  const isEmpty = posts.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* ===== Hero ===== */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 via-teal-600 to-cyan-700 px-6 py-8 sm:py-10 text-white mb-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold">绝世百宝箱社区</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-amber-950">
                <Sparkles className="w-3 h-3" />
                Beta 小范围测试中
              </span>
            </div>
            <p className="text-sm sm:text-base text-teal-50/90 mt-2 max-w-xl">
              跨境发货、地址邮编、工具使用、海外生活经验交流。提问、分享、互助，一起把发货变简单。
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <Link
              href="/community/c/general"
              className="inline-flex items-center gap-1 px-3 py-2 text-teal-50/90 hover:text-white text-sm font-medium transition"
            >
              <Shield className="w-3.5 h-3.5" />
              社区规则
            </Link>
            <Link
              href="/community/c/feedback"
              className="inline-flex items-center gap-1 px-3 py-2 text-teal-50/90 hover:text-white text-sm font-medium transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Beta 反馈
            </Link>
            <Link
              href={newPostHref}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-teal-700 rounded-xl text-sm font-semibold hover:bg-teal-50 transition shadow-sm"
            >
              发帖 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ===== Beta notice ===== */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 mb-5 text-sm text-blue-800">
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

      {/* ===== Mobile categories (horizontal scroll, hidden on xl) ===== */}
      {categories.length > 0 && (
        <div className="xl:hidden mb-5">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Link
              href="/community"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white whitespace-nowrap"
            >
              <span>📋</span> 全部
            </Link>
            {categories.map((cat) => {
              const count = postCountByCategory.get(cat.id) ?? 0;
              return (
                <Link
                  key={cat.id}
                  href={`/community/c/${cat.key}`}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-700 transition whitespace-nowrap"
                >
                  <span>{cat.iconText || "💬"}</span>
                  {cat.name}
                  <span className="text-xs text-gray-400">{count}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Three-column forum layout ===== */}
      <div className="grid lg:grid-cols-[1fr_300px] xl:grid-cols-[200px_1fr_300px] gap-5">
        {/* ----- Left sidebar: Community navigation (PC only) ----- */}
        <aside className="hidden xl:block space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 sticky top-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
              <Hash className="w-4 h-4 text-teal-500" />
              社区导航
            </h3>
            <nav className="space-y-0.5">
              <Link
                href="/community"
                className="flex items-center justify-between px-2.5 py-2 rounded-lg text-sm text-gray-600 hover:bg-teal-50 hover:text-teal-700 transition"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">📋</span>
                  全部
                </span>
              </Link>
              {categories.map((cat) => {
                const count = postCountByCategory.get(cat.id) ?? 0;
                return (
                  <Link
                    key={cat.id}
                    href={`/community/c/${cat.key}`}
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-sm text-gray-600 hover:bg-teal-50 hover:text-teal-700 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{cat.iconText || "💬"}</span>
                      {cat.name}
                    </span>
                    <span className="text-xs text-gray-400">{count}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-0.5">
              <Link
                href="/community/c/general"
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-gray-600 hover:bg-teal-50 hover:text-teal-700 transition"
              >
                <Shield className="w-3.5 h-3.5 text-gray-400" />
                社区规则
              </Link>
              <Link
                href="/community/c/feedback"
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-gray-600 hover:bg-teal-50 hover:text-teal-700 transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                Beta 反馈
              </Link>
            </div>
          </div>
        </aside>

        {/* ----- Main content ----- */}
        <div className="min-w-0">
          {/* 话题流 heading */}
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-500" />
            话题流
          </h2>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.key}
                  href={tab.key === "latest" ? "/community" : `/community?filter=${tab.key}`}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Post list or empty state */}
          {isEmpty ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <div className="text-5xl mb-4">
                {activeFilter === "unanswered" ? "📭" : activeFilter === "featured" ? "⭐" : activeFilter === "solved" ? "✅" : "💬"}
              </div>
              <h2 className="text-lg font-semibold text-gray-700">
                {activeFilter === "latest"
                  ? "社区还没有帖子"
                  : activeFilter === "unanswered"
                    ? "暂无未回复的帖子"
                    : activeFilter === "featured"
                      ? "暂无精华帖子"
                      : activeFilter === "solved"
                        ? "暂无已解决的帖子"
                        : "暂无热门帖子"}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {activeFilter === "latest"
                  ? "成为第一个发帖的人吧！"
                  : "试试切换到「最新」查看全部帖子"}
              </p>

              {activeFilter === "latest" && (
                <div className="mt-6 max-w-sm mx-auto text-left">
                  <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    你可以发什么：
                  </div>
                  <ul className="space-y-1.5 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-teal-500 flex-shrink-0">•</span>
                      分享你的跨境发货经验（物流选择、时效、费用）
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-500 flex-shrink-0">•</span>
                      反馈工具使用中遇到的问题或建议
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-500 flex-shrink-0">•</span>
                      提问地址邮编、HS 编码、报关单据相关问题
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-500 flex-shrink-0">•</span>
                      分享海外生活经验和实用技巧
                    </li>
                  </ul>
                </div>
              )}

              <div className="mt-6 flex items-center justify-center gap-3">
                {activeFilter !== "latest" && (
                  <Link
                    href="/community"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                  >
                    查看全部帖子
                  </Link>
                )}
                <Link
                  href={newPostHref}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition"
                >
                  {activeFilter === "latest" ? "发第一帖" : "去发帖"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => {
                const tags = getTagsArray(post.tags);
                const lastReplyTime = post.lastCommentAt || post.createdAt;
                return (
                  <Link
                    key={post.id}
                    href={`/community/t/${post.slug}`}
                    className={`block rounded-xl border border-gray-200 border-l-4 ${categoryBorderColor(post.category.key)} bg-white p-4 hover:border-teal-300 hover:shadow-sm transition`}
                  >
                    {/* Status icons + title */}
                    <div className="flex items-start gap-2 mb-1.5">
                      <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                        {post.isPinned && (
                          <span title="置顶" className="inline-flex items-center justify-center">
                            <Pin className="w-4 h-4 text-amber-500" />
                          </span>
                        )}
                        {post.isFeatured && (
                          <span title="精华" className="inline-flex items-center justify-center">
                            <Star className="w-4 h-4 text-purple-500 fill-purple-500" />
                          </span>
                        )}
                        {post.isSolved && (
                          <span title="已解决" className="inline-flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 flex-1 min-w-0">
                        {post.title}
                      </h3>
                    </div>

                    {/* Excerpt */}
                    {(post.excerpt || post.content) && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2 pl-1">
                        {post.excerpt || post.content.slice(0, 120)}
                      </p>
                    )}

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mb-2.5 pl-1">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-teal-50 text-teal-600 border border-teal-100"
                          >
                            <Hash className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pl-1">
                      {/* Author */}
                      <div className="flex items-center gap-2 min-w-0">
                        {post.user.image ? (
                          <img
                            src={post.user.image}
                            alt=""
                            className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(post.user.name || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs text-gray-600 truncate max-w-[100px]">
                          {post.user.name || "匿名"}
                        </span>
                        {/* Honor level badge */}
                        {post.user.honorScore > 0 && (
                          <span
                            title={`荣誉值 ${post.user.honorScore}`}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            <Award className="w-2.5 h-2.5" />
                            {post.user.honorScore}
                          </span>
                        )}
                        {/* Category badge */}
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
                          {post.category.iconText && <span>{post.category.iconText}</span>}
                          {post.category.name}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-0.5" title="回复">
                          <MessageSquare className="w-3 h-3" />
                          {post._count.comments}
                        </span>
                        <span className="inline-flex items-center gap-0.5" title="浏览">
                          <Eye className="w-3 h-3" />
                          {post.viewCount}
                        </span>
                        <span className="inline-flex items-center gap-0.5" title="点赞">
                          <ThumbsUp className="w-3 h-3" />
                          {post._count.likes}
                        </span>
                        <span className="inline-flex items-center gap-0.5" title="最后回复时间">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(lastReplyTime)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ----- Sidebar ----- */}
        <aside className="space-y-4">
          {/* 发布新帖 (prominent CTA at top) */}
          <Link
            href={newPostHref}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition shadow-sm w-full"
          >
            <ArrowRight className="w-4 h-4 rotate-0" />
            发布新帖
          </Link>

          {/* 新手发帖指南 */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
              <Lightbulb className="w-4 h-4 text-teal-500" />
              新手发帖指南
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 mb-3">
              <li className="flex items-start gap-2">
                <span className="text-teal-500 flex-shrink-0">•</span>
                分享跨境发货经验
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 flex-shrink-0">•</span>
                反馈工具问题
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 flex-shrink-0">•</span>
                提问地址邮编问题
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 flex-shrink-0">•</span>
                分享海外生活经验
              </li>
            </ul>
            <Link
              href="/community/new"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition w-full justify-center"
            >
              我要发帖 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick links */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
            <Link
              href="/community/c/general"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-700 transition group"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-teal-50 transition">
                <Shield className="w-3.5 h-3.5 text-gray-400 group-hover:text-teal-600" />
              </span>
              社区规则
            </Link>
            <Link
              href="/community/c/feedback"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-700 transition group"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-teal-50 transition">
                <BookOpen className="w-3.5 h-3.5 text-gray-400 group-hover:text-teal-600" />
              </span>
              Beta 反馈
            </Link>
          </div>

          {/* Popular tags */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
              <Hash className="w-4 h-4 text-teal-500" />
              热门标签
            </h3>
            {tagData.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tagData.map(([tag, count]) => (
                  <Link
                    key={tag}
                    href={`/community?filter=latest`}
                    className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-xs bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-600 border border-gray-100 transition"
                  >
                    {tag}
                    <span className="text-gray-300">{count}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">暂无热门标签，发帖时添加标签即可显示</p>
            )}
          </div>

          {/* Active contributors */}
          {contributorData.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
                <Users className="w-4 h-4 text-teal-500" />
                活跃贡献者
              </h3>
              <div className="space-y-2.5">
                {contributorData.map((contributor, idx) => (
                  <Link
                    key={contributor.id}
                    href={`/u/${contributor.id}`}
                    className="flex items-center gap-2.5 group"
                  >
                    <span className="text-xs font-bold text-gray-300 w-4 flex-shrink-0">
                      {idx + 1}
                    </span>
                    {contributor.image ? (
                      <img
                        src={contributor.image}
                        alt=""
                        className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(contributor.name || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-700 group-hover:text-teal-700 truncate transition">
                        {contributor.name || "匿名"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-0.5">
                          <MessageSquare className="w-2.5 h-2.5" />
                          {contributor.count} 帖
                        </span>
                        {contributor.honorScore > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600">
                            <Award className="w-2.5 h-2.5" />
                            {contributor.honorScore}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posting CTA */}
          <div className="rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 p-4 text-center">
            <p className="text-sm text-gray-600 mb-3">有问题想问？有经验想分享？</p>
            <Link
              href={newPostHref}
              className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition w-full justify-center"
            >
              发布新帖 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
