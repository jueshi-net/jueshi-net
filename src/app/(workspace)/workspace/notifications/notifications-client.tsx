"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCircle, Clock, Loader2, ExternalLink, Mail, TrendingUp, AlertTriangle, Gift } from "lucide-react";

const ICON_MAP: Record<string, typeof Bell> = {
  system: Bell,
  reward: Gift,
  growth: TrendingUp,
  review: AlertTriangle,
  mail: Mail,
};

const ICON_EMOJI: Record<string, string> = {
  system: "🔔",
  reward: "🎁",
  growth: "📈",
  review: "📋",
  mail: "📧",
};

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  linkUrl: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/me/notifications?page=${pagination.page}&pageSize=${pagination.pageSize}`);
    const data = await res.json();
    if (data.success) {
      setNotifications(data.notifications);
      setPagination(data.pagination);
    }
    setLoading(false);
  }, [pagination.page, pagination.pageSize]);

  const fetchUnreadCount = useCallback(async () => {
    const res = await fetch("/api/me/notifications/unread-count");
    const data = await res.json();
    if (data.success) setUnreadCount(data.count);
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const markAsRead = async (id: string) => {
    setMarkingId(id);
    await fetch(`/api/me/notifications/${id}`, { method: "PATCH" });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    setMarkingId(null);
  };

  const markAllAsRead = async () => {
    await fetch("/api/me/notifications/mark-all-read", { method: "POST" });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-amber-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">通知中心</h1>
            <p className="text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} 条未读` : "暂无未读通知"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            全部已读
          </button>
        )}
      </div>

      {/* Unread/All tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-600 text-white"
        >
          全部通知
        </button>
        <span className="text-xs text-gray-400 py-1.5">
          共 {pagination.total} 条通知
        </span>
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500 mt-2">加载通知...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-1">暂无通知</p>
          <p className="text-sm text-gray-400">系统通知、任务提醒、等级升级等消息会显示在这里</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = ICON_MAP[n.type] || Bell;
            const emoji = ICON_EMOJI[n.type] || "🔔";
            return (
              <div
                key={n.id}
                className={`bg-white border rounded-xl p-4 transition-all ${
                  n.isRead ? "border-gray-100" : "border-amber-200 bg-amber-50/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0 mt-0.5">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${n.isRead ? "text-gray-700" : "text-gray-900"}`}>
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium">
                          未读
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{n.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-gray-400">
                        {new Date(n.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                      {n.linkUrl && (
                        <a href={n.linkUrl} className="text-[10px] text-teal-600 hover:underline inline-flex items-center gap-0.5">
                          查看详情 <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      disabled={markingId === n.id}
                      className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-green-600 transition-colors disabled:opacity-50"
                      title="标记为已读"
                    >
                      {markingId === n.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          <span className="text-xs text-gray-500">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
