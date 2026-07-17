"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Bell,
  CheckCheck,
  Eye,
  Heart,
  MessageSquare,
  Award,
  Flag,
  Star,
  Shield,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: string;
  postId: string | null;
  commentId: string | null;
  actorId: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  actor: { id: string; name: string | null; image: string | null } | null;
  post: { id: string; slug: string; title: string } | null;
}

interface NotificationListProps {
  initialNotifications: NotificationItem[];
  unreadCount: number;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  reply: { icon: <MessageSquare className="w-4 h-4" />, label: "评论", color: "bg-blue-50 text-blue-600" },
  like: { icon: <Heart className="w-4 h-4" />, label: "点赞", color: "bg-red-50 text-red-600" },
  accepted: { icon: <Award className="w-4 h-4" />, label: "采纳", color: "bg-green-50 text-green-600" },
  featured: { icon: <Star className="w-4 h-4" />, label: "精华", color: "bg-amber-50 text-amber-600" },
  report_resolved: { icon: <Shield className="w-4 h-4" />, label: "举报", color: "bg-purple-50 text-purple-600" },
  post_approved: { icon: <CheckCheck className="w-4 h-4" />, label: "审核通过", color: "bg-green-50 text-green-600" },
  post_rejected: { icon: <Flag className="w-4 h-4" />, label: "审核驳回", color: "bg-red-50 text-red-600" },
  post_hidden: { icon: <Shield className="w-4 h-4" />, label: "帖子隐藏", color: "bg-gray-50 text-gray-600" },
  post_restored: { icon: <CheckCheck className="w-4 h-4" />, label: "帖子恢复", color: "bg-green-50 text-green-600" },
  post_locked: { icon: <Shield className="w-4 h-4" />, label: "帖子锁定", color: "bg-gray-50 text-gray-600" },
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 7) return `${diffDay} 天前`;
  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

function getGroupKey(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHour = diffMs / 3600000;

  if (diffHour < 24 && date.getDate() === now.getDate()) return "今天";
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (diffHour < 48 && date.getDate() === yesterday.getDate()) return "昨天";
  
  if (diffHour < 168) return "本周";
  return "更早";
}

const GROUP_ORDER = ["今天", "昨天", "本周", "更早"];

export function NotificationList({
  initialNotifications,
  unreadCount: initialUnread,
}: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [busy, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.isRead);
    return notifications;
  }, [notifications, filter]);

  const grouped = useMemo(() => {
    const groups: Record<string, NotificationItem[]> = {};
    for (const n of filtered) {
      const key = getGroupKey(n.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    }
    return groups;
  }, [filtered]);

  async function markAsRead(id: string) {
    startTransition(async () => {
      try {
        await fetch("/api/forum/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // ignore
      }
    });
  }

  async function markAllAsRead() {
    startTransition(async () => {
      try {
        await fetch("/api/forum/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markAll: true }),
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      } catch {
        // ignore
      }
    });
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-700 mb-1">暂无通知</p>
        <p className="text-sm text-gray-500">
          当有人回复、点赞或审核你的帖子时，通知会出现在这里
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter + Mark all as read */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2" role="tablist" aria-label="通知筛选">
          <button
            onClick={() => setFilter("all")}
            role="tab"
            aria-selected={filter === "all"}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-brand text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            全部 ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            role="tab"
            aria-selected={filter === "unread"}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === "unread"
                ? "bg-brand text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            未读 ({unreadCount})
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            aria-label="全部标记为已读"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            全部已读
          </button>
        )}
      </div>

      {/* Notification groups */}
      {GROUP_ORDER.map((groupKey) => {
        const items = grouped[groupKey];
        if (!items || items.length === 0) return null;
        return (
          <div key={groupKey} className="space-y-2">
            {/* Group header */}
            <div className="flex items-center gap-2 px-1">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{groupKey}</h3>
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">{items.length}</span>
            </div>

            {/* Items */}
            {items.map((n) => {
              const config = TYPE_CONFIG[n.type] || { icon: <Bell className="w-4 h-4" />, label: "通知", color: "bg-gray-50 text-gray-500" };
              const postUrl = n.post ? `/bbs/${n.post.slug}` : null;

              return (
                <div
                  key={n.id}
                  className={`bg-white rounded-xl border p-4 flex items-start gap-3 transition-colors ${
                    n.isRead ? "border-gray-200" : "border-brand/30 bg-brand/5"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}
                    aria-hidden="true"
                  >
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-gray-500 px-1.5 py-0.5 bg-gray-50 rounded">
                        {config.label}
                      </span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand" aria-label="未读" />
                      )}
                    </div>
                    <p className={`text-sm break-words ${n.isRead ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <time className="text-xs text-gray-400" title={new Date(n.createdAt).toLocaleString("zh-CN")}>
                        {formatRelativeTime(n.createdAt)}
                      </time>
                      {postUrl && (
                        <Link
                          href={postUrl}
                          className="text-xs text-brand hover:underline inline-flex items-center gap-0.5"
                        >
                          <Eye className="w-3 h-3" />
                          {n.post!.title.length > 25
                            ? n.post!.title.slice(0, 25) + "..."
                            : n.post!.title}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Mark as read button */}
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      disabled={busy}
                      className="shrink-0 text-xs text-gray-400 hover:text-brand px-2 py-1 rounded hover:bg-gray-50"
                      aria-label="标记为已读"
                    >
                      已读
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Filtered empty state */}
      {filter === "unread" && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <CheckCheck className="w-10 h-10 text-green-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700">全部已读</p>
          <p className="text-xs text-gray-500 mt-1">没有未读通知</p>
        </div>
      )}
    </div>
  );
}
