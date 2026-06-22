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
  LayoutGrid,
  Wrench,
  Mail,
  Calculator,
  PackageSearch,
  PenSquare,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "社区预览 V2 - 绝世百宝箱",
  description: "社区新版布局预览（仅供视觉审核）",
  robots: { index: false, follow: false },
};

type FilterKey = "latest" | "hot" | "unanswered" | "featured" | "solved";

const FILTER_TABS: { key: FilterKey; label: string; icon: typeof Clock }[] = [
  { key: "latest", label: "最新", icon: Clock },
  { key: "hot", label: "热门", icon: Flame },
  { key: "unanswered", label: "未回复", icon: Inbox },
  { key: "featured", label: "精华", icon: Star },
  { key: "solved", label: "已解决", icon: CheckCircle2 },
];

const TOOL_ENTRIES = [
  { label: "地址邮编查询", href: "/tools/zipcode", icon: PackageSearch },
  { label: "运费计算器", href: "/tools/shipping-calculator", icon: Calculator },
  { label: "物流追踪", href: "/tools/tracking", icon: Mail },
  { label: "全部工具", href: "/tools", icon: LayoutGrid },
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
  return tags
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .slice(0, 4);
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

export default async function CommunityPreviewV2Page({
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

  // ---- Parallel queries (same data as /community) ----
  const [categories, posts, tagData, contributorData, categoryCounts] =
    await Promise.all([
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
      prisma.forumPost
        .findMany({
          where: { status: "published" },
          select: {
            userId: true,
            user: {
              select: { id: true, name: true, image: true, honorScore: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 200,
        })
        .then((results) => {
          const userMap = new Map<
            string,
            {
              id: string;
              name: string | null;
              image: string | null;
              honorScore: number;
              count: number;
            }
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
  const totalPosts = Array.from(postCountByCategory.values()).reduce(
    (a, b) => a + b,
    0,
  );
  const newPostHref = session
    ? "/community/new"
    : "/login?callbackUrl=/community/new";
  const isEmpty = posts.length === 0;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-5">
      <div className="grid xl:grid-cols-[220px_1fr_300px] gap-6">
        {/* ===== Left sidebar: 社区导航 (PC only) ===== */}
        <aside className="hidden xl:block">
          <div className="sticky top-4 space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                  <Hash className="w-4 h-4 text-teal-500" />
                  社区导航
                </h3>
              </div>
              <nav className="p-2">
                <Link
                  href="/community"
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-sm font-medium text-white bg-gray-900 mb-0.5"
                >
                  <span className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    全部
                  </span>
                  <span className="text-xs text-gray-300">{totalPosts}</span>
                </Link>
                {categories.map((cat) => {
                  const count = postCountByCategory.get(cat.id) ?? 0;
                  return (
                    <Link
                      key={cat.id}
                      href={`/community/c/${cat.key}`}
                      className="flex items-center justify-between px-2.5 py-2 rounded-lg text-sm text-gray-600 hover:bg-teal-50 hover:text-teal-700 transition"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="text-base flex-shrink-0">
                          {cat.iconText || "💬"}
                        </span>
                        <span className="truncate">{cat.name}</span>
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </nav>
              <div className="px-2 pb-2 pt-1 border-t border-gray-100 mt-1">
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
          </div>
        </aside>

        {/* ===== Center column ===== */}
        <div className="min-w-0">
          {/* Compact hero banner */}
          <div className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-4 text-white mb-4 shadow-sm flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold">绝世百宝箱社区</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-amber-950">
                  <Sparkles className="w-3 h-3" />
                  Beta
                </span>
              </div>
              <p className="text-xs text-teal-50/90 mt-1">
                跨境发货 · 地址邮编 · 工具使用 · 海外生活经验交流
              </p>
            </div>
            <Link
              href={newPostHref}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-teal-700 rounded-lg text-sm font-semibold hover:bg-teal-50 transition shadow-sm flex-shrink-0"
            >
              <PenSquare className="w-4 h-4" />
              发帖
            </Link>
          </div>

          {/* Preview notice */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 mb-4 text-xs text-amber-800 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              <strong>预览页面</strong>：新版宽屏三栏布局，仅供视觉审核，非正式入口。
            </span>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.key}
                  href={
                    tab.key === "latest"
                      ? "/community-preview-v2"
                      : `/community-preview-v2?filter=${tab.key}`
                  }
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

          {/* Topic feed heading */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-500" />
              话题流
              <span className="text-xs font-normal text-gray-400">
                {posts.length} 个话题
              </span>
            </h2>
          </div>

          {/* Post list or empty state */}
          {isEmpty ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <div className="text-5xl mb-4">
                {activeFilter === "unanswered"
                  ? "📭"
                  : activeFilter === "featured"
                    ? "⭐"
                    : activeFilter === "solved"
                      ? "✅"
                      : "💬"}
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
              <div className="mt-6 flex items-center justify-center gap-3">
                {activeFilter !== "latest" && (
                  <Link
                    href="/community-preview-v2"
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
            <div className="space-y-2.5">
              {posts.map((post) => {
                const tags = getTagsArray(post.tags);
                const lastReplyTime = post.lastCommentAt || post.createdAt;
                return (
                  <Link
                    key={post.id}
                    href={`/community/t/${post.slug}`}
                    className={`block rounded-lg border border-gray-200 border-l-[3px] ${categoryBorderColor(post.category.key)} bg-white px-4 py-3 hover:border-teal-300 hover:shadow-sm transition group`}
                  >
                    {/* Row 1: status icons + title */}
                    <div className="flex items-start gap-1.5 mb-1">
                      <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                        {post.isPinned && (
                          <span title="置顶">
                            <Pin className="w-3.5 h-3.5 text-amber-500" />
                          </span>
                        )}
                        {post.isFeatured && (
                          <span title="精华">
                            <Star className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />
                          </span>
                        )}
                        {post.isSolved && (
                          <span title="已解决">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1 flex-1 min-w-0 group-hover:text-teal-700 transition">
                        {post.title}
                      </h3>
                      {/* Stats inline on the right (PC density) */}
                      <div className="hidden xl:flex items-center gap-3 text-xs text-gray-400 flex-shrink-0 pt-0.5">
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
                      </div>
                    </div>

                    {/* Row 2: excerpt */}
                    {(post.excerpt || post.content) && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2 pl-0.5">
                        {post.excerpt || post.content.slice(0, 120)}
                      </p>
                    )}

                    {/* Row 3: tags */}
                    {tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap mb-2 pl-0.5">
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

                    {/* Row 4: author + category + last reply (compact meta) */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pl-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {post.user.image ? (
                          <img
                            src={post.user.image}
                            alt=""
                            className="w-5 h-5 rounded-full flex-shrink-0 object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {(post.user.name || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs text-gray-600 truncate max-w-[90px]">
                          {post.user.name || "匿名"}
                        </span>
                        {post.user.honorScore > 0 && (
                          <span
                            title={`荣誉值 ${post.user.honorScore}`}
                            className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            <Award className="w-2.5 h-2.5" />
                            {post.user.honorScore}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500">
                          {post.category.iconText && <span>{post.category.iconText}</span>}
                          {post.category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        {/* Mobile/tablet stats (hidden on xl where they're inline above) */}
                        <span className="xl:hidden inline-flex items-center gap-0.5" title="回复">
                          <MessageSquare className="w-3 h-3" />
                          {post._count.comments}
                        </span>
                        <span className="xl:hidden inline-flex items-center gap-0.5" title="浏览">
                          <Eye className="w-3 h-3" />
                          {post.viewCount}
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

        {/* ===== Right sidebar ===== */}
        <aside className="space-y-4">
          {/* 发布新帖 CTA */}
          <Link
            href={newPostHref}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition shadow-sm w-full"
          >
            <PenSquare className="w-4 h-4" />
            发布新帖
          </Link>

          {/* 新手发帖指南 */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-3">
              <Lightbulb className="w-4 h-4 text-teal-500" />
              新手发帖指南
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-600 mb-3">
              <li className="flex items-start gap-2">
                <span className="text-teal-500 flex-shrink-0">•</span>
                分享跨境发货经验（物流、时效、费用）
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 flex-shrink-0">•</span>
                反馈工具使用问题或建议
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 flex-shrink-0">•</span>
                提问地址邮编、HS 编码、报关问题
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 flex-shrink-0">•</span>
                分享海外生活经验与实用技巧
              </li>
            </ul>
            <Link
              href={newPostHref}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition w-full justify-center"
            >
              我要发帖 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 热门标签 */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-3">
              <Hash className="w-4 h-4 text-teal-500" />
              热门标签
            </h3>
            {tagData.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tagData.map(([tag, count]) => (
                  <Link
                    key={tag}
                    href="/community-preview-v2?filter=latest"
                    className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-xs bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-600 border border-gray-100 transition"
                  >
                    #{tag}
                    <span className="text-gray-300">{count}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                暂无热门标签，发帖时添加标签即可显示
              </p>
            )}
          </div>

          {/* 活跃贡献者 */}
          {contributorData.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-3">
                <Users className="w-4 h-4 text-teal-500" />
                活跃贡献者
              </h3>
              <div className="space-y-2">
                {contributorData.map((contributor, idx) => (
                  <Link
                    key={contributor.id}
                    href={`/u/${contributor.id}`}
                    className="flex items-center gap-2.5 group"
                  >
                    <span
                      className={`text-xs font-bold w-4 flex-shrink-0 text-center ${
                        idx === 0
                          ? "text-amber-500"
                          : idx === 1
                            ? "text-gray-400"
                            : idx === 2
                              ? "text-orange-400"
                              : "text-gray-300"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    {contributor.image ? (
                      <img
                        src={contributor.image}
                        alt=""
                        className="w-7 h-7 rounded-full flex-shrink-0 object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(contributor.name || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-700 group-hover:text-teal-700 truncate transition">
                        {contributor.name || "匿名"}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
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

          {/* 相关工具入口 */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-3">
              <Wrench className="w-4 h-4 text-teal-500" />
              相关工具入口
            </h3>
            <div className="space-y-1.5">
              {TOOL_ENTRIES.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-teal-50 hover:text-teal-700 transition group"
                  >
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-teal-100 transition flex-shrink-0">
                      <ToolIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-teal-600" />
                    </span>
                    {tool.label}
                    <ArrowRight className="w-3 h-3 ml-auto text-gray-300 group-hover:text-teal-500 transition" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 p-4 text-center">
            <p className="text-xs text-gray-600 mb-3">
              有问题想问？有经验想分享？
            </p>
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
