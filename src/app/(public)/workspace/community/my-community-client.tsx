"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Reply,
  Bookmark,
  Bell,
  Pin,
  Lock,
  Star,
  Eye,
  ThumbsUp,
  ArrowLeft,
  CheckCheck,
  FileText,
  Inbox,
} from "lucide-react";

interface PostItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  category: { name: string; key: string };
  _count: { comments: number; likes: number };
}

interface CommentItem {
  id: string;
  content: string;
  status: string;
  floorNumber: number;
  createdAt: string;
  post: { id: string; slug: string; title: string } | null;
}

interface BookmarkItem {
  id: string;
  createdAt: string;
  post: {
    id: string;
    slug: string;
    title: string;
    status: string;
    category: { name: string; key: string } | null;
  } | null;
}

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  postId: string | null;
  commentId: string | null;
  createdAt: string;
  actor: { name: string | null; image: string | null } | null;
}

interface MyCommunityData {
  posts: PostItem[];
  comments: CommentItem[];
  bookmarks: BookmarkItem[];
  notifications: NotificationItem[];
  unreadCount: number;
}

type TabKey = "posts" | "comments" | "bookmarks" | "notifications";

const TABS: { key: TabKey; label: string; icon: typeof MessageSquare }[] = [
  { key: "posts", label: "我的帖子", icon: FileText },
  { key: "comments", label: "我的回复", icon: Reply },
  { key: "bookmarks", label: "我的收藏", icon: Bookmark },
  { key: "notifications", label: "我的通知", icon: Bell },
];

const STATUS_STYLES: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  hidden: "bg-red-100 text-red-700",
  deleted: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  published: "已发布",
  pending: "待审核",
  hidden: "已隐藏",
  deleted: "已删除",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} 天前`;
  return new Date(iso).toLocaleDateString("zh-CN");
}

function EmptyState({
  icon: Icon,
  title,
  hint,
  actionLabel,
  actionHref,
}: {
  icon: typeof Inbox;
  title: string;
  hint: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Icon className="w-7 h-7 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{hint}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex items-center gap-1 px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function MyCommunityClient({ data }: { data: MyCommunityData }) {
  const [tab, setTab] = useState<TabKey>("posts");

  const counts: Record<TabKey, number> = {
    posts: data.posts.length,
    comments: data.comments.length,
    bookmarks: data.bookmarks.length,
    notifications: data.notifications.length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link
        href="/community"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> 返回社区
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">我的社区</h1>
        {data.unreadCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">
            <Bell className="w-3.5 h-3.5" />
            {data.unreadCount} 条未读
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4 -mx-1 px-1">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              <span
                className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  active ? "bg-teal-500/40" : "bg-gray-200 text-gray-500"
                }`}
              >
                {counts[t.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {/* 我的帖子 */}
        {tab === "posts" &&
          (data.posts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="还没有发过帖子"
              hint="分享你的经验或提问，与社区互动"
              actionLabel="去发帖"
              actionHref="/community/new"
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.posts.map((p) => (
                <li key={p.id} className="p-4 hover:bg-gray-50/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {p.isPinned && (
                          <Pin className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        {p.isFeatured && (
                          <Star className="w-3.5 h-3.5 text-purple-500" />
                        )}
                        {p.isLocked && (
                          <Lock className="w-3.5 h-3.5 text-red-400" />
                        )}
                        <Link
                          href={`/community/t/${p.slug}`}
                          className="font-medium text-gray-900 hover:text-teal-700 truncate"
                        >
                          {p.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                          {p.category.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            STATUS_STYLES[p.status] || "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {STATUS_LABELS[p.status] || p.status}
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <Eye className="w-3 h-3" /> {p.viewCount}
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <MessageSquare className="w-3 h-3" /> {p._count.comments}
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <ThumbsUp className="w-3 h-3" /> {p._count.likes}
                        </span>
                        <span>{timeAgo(p.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ))}

        {/* 我的回复 */}
        {tab === "comments" &&
          (data.comments.length === 0 ? (
            <EmptyState
              icon={Reply}
              title="还没有回复过帖子"
              hint="浏览社区，参与讨论吧"
              actionLabel="逛逛社区"
              actionHref="/community"
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.comments.map((c) => (
                <li key={c.id} className="p-4 hover:bg-gray-50/60">
                  {c.post ? (
                    <Link
                      href={`/community/t/${c.post.slug}`}
                      className="text-xs text-teal-600 hover:underline mb-1 inline-flex items-center gap-1"
                    >
                      <Reply className="w-3 h-3" />
                      回复：{c.post.title}
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-400 mb-1 block">
                      原帖已删除
                    </span>
                  )}
                  <p className="text-sm text-gray-700 line-clamp-2 break-words">
                    {c.content}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    {c.floorNumber > 0 && <span>#{c.floorNumber} 楼</span>}
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        STATUS_STYLES[c.status] || "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {STATUS_LABELS[c.status] || c.status}
                    </span>
                    <span>{timeAgo(c.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ))}

        {/* 我的收藏 */}
        {tab === "bookmarks" &&
          (data.bookmarks.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="还没有收藏帖子"
              hint="在帖子详情页点击收藏，方便日后查看"
              actionLabel="逛逛社区"
              actionHref="/community"
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.bookmarks.map((b) => (
                <li key={b.id} className="p-4 hover:bg-gray-50/60">
                  {b.post ? (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/community/t/${b.post.slug}`}
                          className="font-medium text-gray-900 hover:text-teal-700 truncate block"
                        >
                          {b.post.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
                          {b.post.category && (
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                              {b.post.category.name}
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              STATUS_STYLES[b.post.status] ||
                              "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {STATUS_LABELS[b.post.status] || b.post.status}
                          </span>
                          <span>收藏于 {timeAgo(b.createdAt)}</span>
                        </div>
                      </div>
                      <Bookmark className="w-4 h-4 text-teal-500 shrink-0 mt-1" />
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">原帖已删除</span>
                  )}
                </li>
              ))}
            </ul>
          ))}

        {/* 我的通知 */}
        {tab === "notifications" &&
          (data.notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="暂无通知"
              hint="有人回复、点赞或采纳你的内容时，会在这里提醒你"
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.notifications.map((n) => (
                <li
                  key={n.id}
                  className={`p-4 flex items-start gap-3 ${
                    n.isRead ? "" : "bg-teal-50/40"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {n.actor?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={n.actor.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Bell className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700 break-words">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      {n.actor?.name && <span>{n.actor.name}</span>}
                      <span>{timeAgo(n.createdAt)}</span>
                      {!n.isRead && (
                        <span className="inline-flex items-center gap-0.5 text-teal-600">
                          <CheckCheck className="w-3 h-3" /> 未读
                        </span>
                      )}
                    </div>
                  </div>
                  {n.postId && (
                    <Link
                      href={`/community/t/${
                        data.posts.find((p) => p.id === n.postId)?.slug || ""
                      }`}
                      className="text-xs text-teal-600 hover:underline shrink-0"
                    >
                      查看
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          ))}
      </div>
    </div>
  );
}
