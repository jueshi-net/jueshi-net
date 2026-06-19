"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCircle, Clock, Loader2, ExternalLink, Mail, TrendingUp, AlertTriangle, Gift, Filter } from "lucide-react";
import PageHeader from "@/components/workspace/PageHeader";
import EmptyState from "@/components/workspace/EmptyState";

const TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  system: { label: "系统通知", emoji: "🔔", color: "bg-blue-50 text-blue-700 border-blue-200" },
  reward: { label: "奖励通知", emoji: "🎁", color: "bg-purple-50 text-purple-700 border-purple-200" },
  growth: { label: "成长通知", emoji: "📈", color: "bg-green-50 text-green-700 border-green-200" },
  review: { label: "审核通知", emoji: "📋", color: "bg-amber-50 text-amber-700 border-amber-200" },
  mail: { label: "邮件通知", emoji: "📧", color: "bg-teal-50 text-teal-700 border-teal-200" },
  info: { label: "其他通知", emoji: "ℹ️", color: "bg-gray-50 text-gray-700 border-gray-200" },
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
  const [filter, setFilter] = useState<"all" | "unread" | "system" | "reward" | "growth">("all");

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

  // 根据筛选条件过滤通知
  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.isRead;
    if (filter === "system") return n.type === "system";
    if (filter === "reward") return n.type === "reward";
    if (filter === "growth") return n.type === "growth";
    return true;
  });

  // 按类型分组
  const groupedNotifications = filteredNotifications.reduce((acc, n) => {
    if (!acc[n.type]) acc[n.type] = [];
    acc[n.type].push(n);
    return acc;
  }, {} as Record<string, Notification[]>);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={<Bell className="w-5 h-5" />}
        title="通知中心"
        description="查看系统通知、任务提醒、等级升级等消息"
        action={
          unreadCount > 0 ? (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              全部已读
            </button>
          ) : null
        }
      />

      {/* 通知概览 */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs text-gray-500 mb-1">未读通知</div>
              <div className="text-2xl font-bold text-gray-900">{unreadCount}</div>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div>
              <div className="text-xs text-gray-500 mb-1">全部通知</div>
              <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              {unreadCount} 条未读
            </div>
          )}
        </div>
      </div>

      {/* 筛选 tabs */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "全部", count: pagination.total },
            { key: "unread", label: "未读", count: unreadCount },
            { key: "system", label: "系统", count: notifications.filter(n => n.type === "system").length },
            { key: "reward", label: "奖励", count: notifications.filter(n => n.type === "reward").length },
            { key: "growth", label: "成长", count: notifications.filter(n => n.type === "growth").length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key 
                  ? "bg-teal-600 text-white" 
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* 通知列表 */}
      {loading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500 mt-2">加载通知...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        filter === "unread" ? (
          <EmptyState
            icon={<CheckCircle className="w-8 h-8" />}
            title="太棒了！没有未读通知"
            description="你已经查看了所有通知。系统通知、任务提醒、等级升级等消息会显示在这里。"
            primaryAction={{ label: "查看今日任务", href: "/workspace/tasks" }}
            secondaryAction={{ label: "查看会员权益", href: "/workspace/member" }}
          />
        ) : (
          <EmptyState
            icon={<Clock className="w-8 h-8" />}
            title="暂无通知"
            description="系统通知、任务提醒、等级升级等消息会显示在这里。完成今日任务可以获得通知和奖励。"
            primaryAction={{ label: "查看今日任务", href: "/workspace/tasks" }}
          />
        )
      ) : (
        <div className="space-y-6">
          {/* 按类型分组 */}
          {Object.entries(groupedNotifications).map(([type, typeNotifications]) => {
            const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
            
            return (
              <div key={type} className="space-y-3">
                {/* 分组标题 */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
                  <span>{config.emoji}</span>
                  <span>{config.label}</span>
                  <span className="text-xs opacity-70">({typeNotifications.length})</span>
                </div>
                
                {/* 通知列表 */}
                <div className="space-y-2">
                  {typeNotifications.map(n => {
                    const emoji = config.emoji;
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
                            <div className="flex items-center gap-2 flex-wrap">
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
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className="text-[10px] text-gray-400">
                                {new Date(n.createdAt).toLocaleDateString("zh-CN")}
                              </span>
                              {n.linkUrl && (
                                <a 
                                  href={n.linkUrl} 
                                  className="text-[10px] text-teal-600 hover:underline inline-flex items-center gap-0.5"
                                >
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
              </div>
            );
          })}
        </div>
      )}

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          <span className="text-sm text-gray-500">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
