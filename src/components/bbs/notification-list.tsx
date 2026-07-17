"use client";

import { useState, useTransition } from "react";
import { Bell, CheckCheck, Eye, Heart, MessageSquare, Award, Flag, Star, Shield } from "lucide-react";
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

const TYPE_ICONS: Record<string, React.ReactNode> = {
  reply: <MessageSquare className="w-4 h-4" />,
  like: <Heart className="w-4 h-4" />,
  accepted: <Award className="w-4 h-4" />,
  featured: <Star className="w-4 h-4" />,
  report_resolved: <Shield className="w-4 h-4" />,
  post_approved: <CheckCheck className="w-4 h-4" />,
  post_rejected: <Flag className="w-4 h-4" />,
  post_hidden: <Shield className="w-4 h-4" />,
  post_restored: <CheckCheck className="w-4 h-4" />,
  post_locked: <Shield className="w-4 h-4" />,
};

export function NotificationList({
  initialNotifications,
  unreadCount: initialUnread,
}: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [busy, startTransition] = useTransition();

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
      {/* Mark all as read */}
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={markAllAsRead}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            全部标记为已读
          </button>
        </div>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          className={`bg-white rounded-xl border p-4 flex items-start gap-3 ${
            n.isRead ? "border-gray-200" : "border-brand/30 bg-brand/5"
          }`}
        >
          {/* Icon */}
          <div
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              n.isRead ? "bg-gray-100 text-gray-500" : "bg-brand/10 text-brand"
            }`}
          >
            {TYPE_ICONS[n.type] || <Bell className="w-4 h-4" />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 break-words">{n.message}</p>
            <div className="flex items-center gap-2 mt-1">
              <time className="text-xs text-gray-400">
                {new Date(n.createdAt).toLocaleString("zh-CN")}
              </time>
              {n.post && (
                <Link
                  href={`/bbs/${n.post.slug}`}
                  className="text-xs text-brand hover:underline inline-flex items-center gap-0.5"
                >
                  <Eye className="w-3 h-3" />
                  {n.post.title.length > 20
                    ? n.post.title.slice(0, 20) + "..."
                    : n.post.title}
                </Link>
              )}
            </div>
          </div>

          {/* Mark as read button */}
          {!n.isRead && (
            <button
              onClick={() => markAsRead(n.id)}
              disabled={busy}
              className="shrink-0 text-xs text-gray-400 hover:text-brand"
            >
              标记已读
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
