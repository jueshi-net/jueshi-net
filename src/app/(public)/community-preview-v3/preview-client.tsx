"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Eye,
  Pin,
  Star,
  CheckCircle2,
  Flame,
  Clock,
  Hash,
  Users,
  Award,
  Lightbulb,
  ArrowRight,
  PenSquare,
  Shield,
  BookOpen,
  Wrench,
  LayoutGrid,
  Lock,
  ThumbsUp,
  Search,
  Calculator,
  MapPin,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types (serializable — passed from the server component)            */
/* ------------------------------------------------------------------ */

export type PreviewContributor = {
  id: string;
  name: string | null;
  image: string | null;
  honorScore: number;
};

export type PreviewPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  isPinned: boolean;
  isFeatured: boolean;
  isSolved: boolean;
  isLocked: boolean;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  createdAt: string; // ISO
  lastCommentAt: string | null; // ISO
  tags: string[];
  author: {
    id: string;
    name: string | null;
    image: string | null;
    honorScore: number;
  };
  category: {
    id: string;
    key: string;
    name: string;
    color: string | null;
    iconText: string | null;
  };
};

export type PreviewCategory = {
  key: string;
  name: string;
  emoji: string;
  color: string; // canonical color key
  count: number;
};

export type PreviewTag = { tag: string; count: number };

export type CommunityPreviewV3Data = {
  categories: PreviewCategory[];
  totalPosts: number;
  posts: PreviewPost[];
  tags: PreviewTag[];
  contributors: PreviewContributor[];
  newPostHref: string;
  isSignedIn: boolean;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

type FilterKey = "all" | "latest" | "hot" | "featured";

const FILTER_TABS: { key: FilterKey; label: string; icon: typeof Clock }[] = [
  { key: "all", label: "全部", icon: LayoutGrid },
  { key: "latest", label: "最新", icon: Clock },
  { key: "hot", label: "热门", icon: Flame },
  { key: "featured", label: "精华", icon: Star },
];

type ColorKey =
  | "blue"
  | "teal"
  | "amber"
  | "rose"
  | "violet"
  | "emerald"
  | "slate";

/** Canonical display for a category key — covers both the new V3 keys
 *  and the legacy DB keys so real posts always render nicely. */
function categoryDisplay(
  key: string,
  fallbackName?: string | null,
  fallbackIcon?: string | null,
): { emoji: string; name: string; color: ColorKey } {
  switch (key) {
    case "cross-border-life":
      return { emoji: "🌍", name: "跨境生活", color: "blue" };
    case "tool-usage":
      return { emoji: "🔧", name: "工具使用", color: "teal" };
    case "logistics-customs":
      return { emoji: "📦", name: "物流报关", color: "amber" };
    case "suggestion-feedback":
      return { emoji: "💡", name: "建议反馈", color: "rose" };
    case "general-discussion":
      return { emoji: "💬", name: "综合讨论", color: "violet" };
    case "overseas-life":
      return { emoji: "🏠", name: "海外生活", color: "emerald" };
    // legacy DB keys
    case "general":
      return { emoji: "💬", name: fallbackName ?? "综合讨论", color: "violet" };
    case "tools":
      return { emoji: "🔧", name: fallbackName ?? "工具使用", color: "teal" };
    case "logistics":
    case "shipping":
      return { emoji: "📦", name: fallbackName ?? "物流报关", color: "amber" };
    case "feedback":
      return { emoji: "💡", name: fallbackName ?? "建议反馈", color: "rose" };
    default:
      return {
        emoji: fallbackIcon ?? "💬",
        name: fallbackName ?? "综合",
        color: "slate",
      };
  }
}

const BADGE_STYLES: Record<ColorKey, string> = {
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  teal: "bg-teal-100 text-teal-700 border-teal-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  rose: "bg-rose-100 text-rose-700 border-rose-200",
  violet: "bg-violet-100 text-violet-700 border-violet-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
};

const CARD_ACCENT: Record<ColorKey, string> = {
  blue: "bg-blue-400",
  teal: "bg-teal-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
  violet: "bg-violet-400",
  emerald: "bg-emerald-400",
  slate: "bg-slate-300",
};

const CARD_LEFT_BORDER: Record<ColorKey, string> = {
  blue: "border-l-blue-400",
  teal: "border-l-teal-400",
  amber: "border-l-amber-400",
  rose: "border-l-rose-400",
  violet: "border-l-violet-400",
  emerald: "border-l-emerald-400",
  slate: "border-l-slate-300",
};

const TOOL_ENTRIES: { label: string; href: string; icon: typeof Search }[] = [
  { label: "HS 编码查询", href: "/tools/hs-code", icon: Search },
  { label: "运费计算器", href: "/tools/shipping-calculator", icon: Calculator },
  { label: "邮编查询", href: "/tools/postal-code", icon: MapPin },
];

/** Format a relative time string (zh-CN) from an ISO date. */
function formatRelativeTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
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

function applyFilter(posts: PreviewPost[], filter: FilterKey): PreviewPost[] {
  const arr = [...posts];
  switch (filter) {
    case "latest":
      return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "hot":
      return arr.sort(
        (a, b) =>
          b.commentCount - a.commentCount || b.viewCount - a.viewCount,
      );
    case "featured":
      return arr
        .filter((p) => p.isFeatured)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "all":
    default:
      return arr.sort(
        (a, b) =>
          Number(b.isPinned) - Number(a.isPinned) ||
          b.createdAt.localeCompare(a.createdAt),
      );
  }
}

/* ------------------------------------------------------------------ */
/* Avatar                                                             */
/* ------------------------------------------------------------------ */

function Avatar({
  src,
  name,
  size = "md",
}: {
  src: string | null;
  name: string | null;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${dim} rounded-full flex-shrink-0 object-cover border border-white shadow-sm`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-full bg-gradient-to-br from-indigo-400 via-violet-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm`}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main client component                                              */
/* ------------------------------------------------------------------ */

export function PreviewClient({ data }: { data: CommunityPreviewV3Data }) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const visiblePosts = useMemo(
    () => applyFilter(data.posts, filter),
    [data.posts, filter],
  );

  const isEmpty = visiblePosts.length === 0;
  const maxTagCount = useMemo(
    () => Math.max(1, ...data.tags.map((t) => t.count)),
    [data.tags],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== Yellow preview banner (full-width, top) ===== */}
      <div className="w-full bg-yellow-300 border-b-2 border-yellow-400">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 text-yellow-950 text-sm font-medium">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            ⚠️ 新版社区预览 V3 — 仅供视觉审核，不影响正式社区页面
          </span>
        </div>
      </div>

      {/* ===== Mobile sticky post button ===== */}
      <div className="xl:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-2 flex items-center gap-2">
        <span className="text-sm font-bold text-violet-700 truncate">
          绝世百宝箱社区
        </span>
        <Link
          href={data.newPostHref}
          className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 transition flex-shrink-0"
        >
          <PenSquare className="w-3.5 h-3.5" />
          发布新帖
        </Link>
      </div>

      {/* ===== Mobile horizontal scrollable categories ===== */}
      <div className="xl:hidden bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 overflow-x-auto px-4 py-2.5">
          <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-600 text-white whitespace-nowrap">
            <LayoutGrid className="w-3.5 h-3.5" />
            全部
            <span className="text-violet-200">{data.totalPosts}</span>
          </span>
          {data.categories.map((cat) => (
            <span
              key={cat.key}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 whitespace-nowrap"
            >
              <span>{cat.emoji}</span>
              {cat.name}
              <span className="text-gray-400">{cat.count}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ===== Main 3-column layout ===== */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
        <div className="grid xl:grid-cols-[220px_1fr_300px] gap-6">
          {/* ---------- Left column (PC, sticky) ---------- */}
          <aside className="hidden xl:block">
            <div className="sticky top-4 space-y-4">
              {/* Community navigation */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-indigo-50">
                  <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <Hash className="w-4 h-4 text-violet-500" />
                    社区导航
                  </h3>
                </div>
                <nav className="p-2">
                  <Link
                    href="/community"
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-sm font-semibold text-white bg-violet-600 mb-0.5"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" />
                      全部
                    </span>
                    <span className="text-xs text-violet-200">
                      {data.totalPosts}
                    </span>
                  </Link>
                  {data.categories.map((cat) => {
                    const badge = BADGE_STYLES[cat.color as ColorKey];
                    return (
                      <Link
                        key={cat.key}
                        href={`/community/c/${cat.key}`}
                        className="flex items-center justify-between px-2.5 py-2 rounded-lg text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-700 transition"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs border ${badge}`}
                          >
                            {cat.emoji}
                          </span>
                          <span className="truncate">{cat.name}</span>
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {cat.count}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Community rules card */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-2">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  社区规则
                </h3>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400 flex-shrink-0">1.</span>
                    友善交流，禁止人身攻击与广告刷屏
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400 flex-shrink-0">2.</span>
                    真实经验分享，不传播虚假物流信息
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400 flex-shrink-0">3.</span>
                    提问请描述清楚场景与已尝试方案
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400 flex-shrink-0">4.</span>
                    尊重隐私，勿泄露他人地址与单号
                  </li>
                </ul>
                <Link
                  href="/community/c/general"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  查看完整规则 <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Beta feedback link */}
              <Link
                href="/community/c/feedback"
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-violet-200 bg-white hover:bg-violet-50 transition group"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 group-hover:bg-violet-200 transition flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-violet-600" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-800">
                    Beta 反馈
                  </div>
                  <div className="text-xs text-gray-400">
                    反馈布局与功能建议
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-violet-500 ml-auto transition" />
              </Link>
            </div>
          </aside>

          {/* ---------- Center column ---------- */}
          <div className="min-w-0">
            {/* Compact hero banner (max 120px) */}
            <div className="relative rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-5 py-4 text-white mb-4 shadow-md overflow-hidden max-h-[120px]">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute right-16 -bottom-10 w-24 h-24 rounded-full bg-white/10" />
              <div className="relative flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold">绝世百宝箱社区</h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400 text-amber-950">
                      <Star className="w-3 h-3" />
                      V3 预览
                    </span>
                  </div>
                  <p className="text-xs text-violet-100/90 mt-1">
                    跨境生活 · 工具使用 · 物流报关 · 海外经验交流
                  </p>
                </div>
                <Link
                  href={data.newPostHref}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-white text-violet-700 rounded-lg text-sm font-semibold hover:bg-violet-50 transition shadow-sm flex-shrink-0"
                >
                  <PenSquare className="w-4 h-4" />
                  发帖
                </Link>
              </div>
            </div>

            {/* Filter tabs (interactive) */}
            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
              {FILTER_TABS.map((tab) => {
                const isActive = filter === tab.key;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? "bg-violet-600 text-white shadow-sm"
                        : "bg-white text-gray-500 border border-gray-200 hover:border-violet-300 hover:text-violet-600"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
              <span className="ml-auto text-xs text-gray-400 hidden sm:inline-flex items-center gap-1 pl-2">
                <MessageSquare className="w-3.5 h-3.5" />
                {visiblePosts.length} 个话题
              </span>
            </div>

            {/* Topic list / empty state */}
            {isEmpty ? (
              <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
                <div className="text-5xl mb-3">
                  {filter === "featured" ? "⭐" : filter === "hot" ? "🔥" : "💬"}
                </div>
                <h2 className="text-base font-semibold text-gray-700">
                  {filter === "featured"
                    ? "暂无精华帖子"
                    : filter === "hot"
                      ? "暂无热门帖子"
                      : "暂无帖子"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {filter === "all"
                    ? "社区还没有帖子，成为第一个发帖的人吧！"
                    : "试试切换到「全部」查看更多帖子"}
                </p>
                <Link
                  href={data.newPostHref}
                  className="mt-5 inline-flex items-center gap-1 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition"
                >
                  去发帖 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {visiblePosts.map((post) => {
                  const cd = categoryDisplay(
                    post.category.key,
                    post.category.name,
                    post.category.iconText,
                  );
                  const badge = BADGE_STYLES[cd.color];
                  const accent = CARD_ACCENT[cd.color];
                  const leftBorder = CARD_LEFT_BORDER[cd.color];
                  return (
                    <Link
                      key={post.id}
                      href={`/community/t/${post.slug}`}
                      className={`block rounded-xl border border-gray-200 border-l-4 ${leftBorder} bg-white overflow-hidden hover:shadow-md hover:border-violet-300 transition group`}
                    >
                      {/* colored top accent line */}
                      <div className={`h-0.5 w-full ${accent}`} />
                      <div className="p-3.5">
                        {/* Row 1: status + title + inline stats (xl) */}
                        <div className="flex items-start gap-2 mb-1.5">
                          <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                            {post.isPinned && (
                              <span title="置顶">
                                <Pin className="w-3.5 h-3.5 text-amber-500" />
                              </span>
                            )}
                            {post.isFeatured && (
                              <span title="精华">
                                <Star className="w-3.5 h-3.5 text-violet-500 fill-violet-500" />
                              </span>
                            )}
                            {post.isSolved && (
                              <span title="已解决">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              </span>
                            )}
                            {post.isLocked && (
                              <span title="已锁定">
                                <Lock className="w-3.5 h-3.5 text-gray-400" />
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1 flex-1 min-w-0 group-hover:text-violet-700 transition">
                            {post.title}
                          </h3>
                          {/* stats inline (xl only) */}
                          <div className="hidden xl:flex items-center gap-3 text-xs text-gray-400 flex-shrink-0 pt-0.5">
                            <span
                              className="inline-flex items-center gap-0.5"
                              title="回复"
                            >
                              <MessageSquare className="w-3 h-3" />
                              {post.commentCount}
                            </span>
                            <span
                              className="inline-flex items-center gap-0.5"
                              title="浏览"
                            >
                              <Eye className="w-3 h-3" />
                              {post.viewCount}
                            </span>
                            <span
                              className="inline-flex items-center gap-0.5"
                              title="点赞"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              {post.likeCount}
                            </span>
                          </div>
                        </div>

                        {/* Excerpt */}
                        {(post.excerpt || post.content) && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                            {post.excerpt || post.content.slice(0, 120)}
                          </p>
                        )}

                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap mb-2">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] bg-violet-50 text-violet-600 border border-violet-100"
                              >
                                <Hash className="w-2.5 h-2.5" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Meta row: author + category badge + last activity */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar
                              src={post.author.image}
                              name={post.author.name}
                              size="sm"
                            />
                            <span className="text-xs text-gray-600 truncate max-w-[90px]">
                              {post.author.name || "匿名"}
                            </span>
                            {post.author.honorScore > 0 && (
                              <span
                                title={`荣誉值 ${post.author.honorScore}`}
                                className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                              >
                                <Award className="w-2.5 h-2.5" />
                                {post.author.honorScore}
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${badge}`}
                            >
                              <span>{cd.emoji}</span>
                              {cd.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400">
                            {/* mobile/tablet stats (hidden on xl) */}
                            <span
                              className="xl:hidden inline-flex items-center gap-0.5"
                              title="回复"
                            >
                              <MessageSquare className="w-3 h-3" />
                              {post.commentCount}
                            </span>
                            <span
                              className="xl:hidden inline-flex items-center gap-0.5"
                              title="浏览"
                            >
                              <Eye className="w-3 h-3" />
                              {post.viewCount}
                            </span>
                            <span
                              className="inline-flex items-center gap-0.5"
                              title="最后活动"
                            >
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(
                                post.lastCommentAt ?? post.createdAt,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* ---------- Right column (PC, sticky) ---------- */}
          <aside className="hidden xl:block">
            <div className="sticky top-4 space-y-4">
              {/* 发布新帖 button */}
              <Link
                href={data.newPostHref}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition shadow-md w-full"
              >
                <PenSquare className="w-4 h-4" />
                发布新帖
              </Link>

              {/* 新手发帖指南 */}
              <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-3">
                  <Lightbulb className="w-4 h-4 text-violet-500" />
                  新手发帖指南
                </h3>
                <ul className="space-y-1.5 text-xs text-gray-600 mb-3">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 flex-shrink-0">•</span>
                    分享跨境发货经验（物流、时效、费用）
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 flex-shrink-0">•</span>
                    反馈工具使用问题或建议
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 flex-shrink-0">•</span>
                    提问地址邮编、HS 编码、报关问题
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 flex-shrink-0">•</span>
                    分享海外生活经验与实用技巧
                  </li>
                </ul>
                <Link
                  href={data.newPostHref}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 transition w-full justify-center"
                >
                  我要发帖 <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 热门标签 cloud */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-3">
                  <Hash className="w-4 h-4 text-violet-500" />
                  热门标签
                </h3>
                {data.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {data.tags.map(({ tag, count }) => {
                      const ratio = count / maxTagCount;
                      const sizeClass =
                        ratio > 0.66
                          ? "text-sm font-semibold"
                          : ratio > 0.33
                            ? "text-xs font-medium"
                            : "text-xs";
                      return (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-gray-600 hover:bg-violet-50 hover:text-violet-600 border border-gray-100 transition cursor-default ${sizeClass}`}
                        >
                          #{tag}
                          <span className="text-gray-300">{count}</span>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    暂无热门标签，发帖时添加标签即可显示
                  </p>
                )}
              </div>

              {/* 活跃贡献者 (top 5 by honorScore) */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-3">
                  <Users className="w-4 h-4 text-violet-500" />
                  活跃贡献者
                </h3>
                {data.contributors.length > 0 ? (
                  <div className="space-y-2.5">
                    {data.contributors.map((c, idx) => (
                      <Link
                        key={c.id}
                        href={`/u/${c.id}`}
                        className="flex items-center gap-2.5 group"
                      >
                        <span className="text-sm flex-shrink-0 w-5 text-center">
                          {idx === 0
                            ? "🥇"
                            : idx === 1
                              ? "🥈"
                              : idx === 2
                                ? "🥉"
                                : (
                                  <span className="text-xs font-bold text-gray-300">
                                    {idx + 1}
                                  </span>
                                )}
                        </span>
                        <Avatar src={c.image} name={c.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-700 group-hover:text-violet-700 truncate transition">
                            {c.name || "匿名"}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            {c.honorScore > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-emerald-600">
                                <Award className="w-2.5 h-2.5" />
                                {c.honorScore}
                              </span>
                            )}
                            <span className="text-gray-300">荣誉值</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">暂无活跃贡献者</p>
                )}
              </div>

              {/* 相关工具入口 */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-3">
                  <Wrench className="w-4 h-4 text-violet-500" />
                  相关工具入口
                </h3>
                <div className="space-y-1.5">
                  {TOOL_ENTRIES.map((tool) => {
                    const ToolIcon = tool.icon;
                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-violet-50 hover:text-violet-700 transition group"
                      >
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-violet-100 transition flex-shrink-0">
                          <ToolIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-violet-600" />
                        </span>
                        {tool.label}
                        <ArrowRight className="w-3 h-3 ml-auto text-gray-300 group-hover:text-violet-500 transition" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
