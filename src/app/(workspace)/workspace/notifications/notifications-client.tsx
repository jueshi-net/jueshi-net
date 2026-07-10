"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCircle, Clock, Loader2, ExternalLink, Mail, TrendingUp, AlertTriangle, Gift, Filter, Calendar, Zap, MessageCircle } from "lucide-react";
import { MetricCard } from "@/components/saas/MetricCard";
import { SectionCard } from "@/components/saas/SectionCard";
import { StatusBadge } from "@/components/design-system/StatusBadge";
import { WorkspacePageHeader } from "@/components/saas/WorkspacePageHeader";
import { EmptyState } from "@/components/design-system/EmptyState";

const TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string; variant: "info" | "success" | "warning" | "processing" | "neutral" | "danger" }> = {
  system: { label: "系统通知", emoji: "🔔", color: "bg-blue-50 text-blue-700 border-blue-200", variant: "info" },
  reward: { label: "奖励通知", emoji: "🎁", color: "bg-purple-50 text-purple-700 border-purple-200", variant: "success" },
  growth: { label: "成长通知", emoji: "📈", color: "bg-green-50 text-green-700 border-green-200", variant: "success" },
  review: { label: "审核通知", emoji: "📋", color: "bg-amber-50 text-amber-700 border-amber-200", variant: "warning" },
  mail: { label: "邮件通知", emoji: "📧", color: "bg-teal-50 text-teal-700 border-teal-200", variant: "processing" },
  info: { label: "其他通知", emoji: "ℹ️", color: "bg-gray-50 text-gray-700 border-gray-200", variant: "neutral" },
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

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 7) return `${diffDay} 天前`;
  return date.toLocaleDateString("zh-CN");
}

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread" | "system" | "reward" | "growth">("all");
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");

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

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.isRead;
    if (filter === "system") return n.type === "system";
    if (filter === "reward") return n.type === "reward";
    if (filter === "growth") return n.type === "growth";
    return true;
  });

  const groupedNotifications = filteredNotifications.reduce((acc, n) => {
    if (!acc[n.type]) acc[n.type] = [];
    acc[n.type].push(n);
    return acc;
  }, {} as Record<string, Notification[]>);

  const filterTabs = [
    { key: "all", label: "全部", count: pagination.total, icon: <Mail className="w-3.5 h-3.5" /> },
    { key: "unread", label: "未读", count: unreadCount, icon: <Bell className="w-3.5 h-3.5" /> },
    { key: "system", label: "系统", count: notifications.filter(n => n.type === "system").length, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { key: "reward", label: "奖励", count: notifications.filter(n => n.type === "reward").length, icon: <Gift className="w-3.5 h-3.5" /> },
    { key: "growth", label: "成长", count: notifications.filter(n => n.type === "growth").length, icon: <TrendingUp className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <WorkspacePageHeader
        title="通知中心"
        subtitle="系统通知、任务提醒、等级升级等消息"
        icon={<Bell className="w-5 h-5" />}
        breadcrumbs={[
          { label: "工作台", href: "/workspace" },
          { label: "通知中心" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <StatusBadge
                label={`${unreadCount} 条未读`}
                variant="warning"
                dot
                pulse
              />
            )}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                全部已读
              </button>
            )}
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${viewMode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                列表
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${viewMode === "timeline" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                时间线
              </button>
            </div>
          </div>
        }
      />

      <div className="px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            label="未读通知"
            value={unreadCount}
            icon={<Bell className="w-5 h-5" />}
            trend={unreadCount > 0 ? { value: "需要处理", positive: false } : undefined}
          />
          <MetricCard
            label="全部通知"
            value={pagination.total}
            icon={<Mail className="w-5 h-5" />}
          />
          <MetricCard
            label="当前页码"
            value={`${pagination.page}/${pagination.totalPages || 1}`}
            icon={<Clock className="w-5 h-5" />}
          />
        </div>

        {/* Filter Tabs */}
        <SectionCard title="通知筛选">
          <div className="flex gap-2 flex-wrap">
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === tab.key
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  filter === tab.key ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Notification List */}
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-500 mt-2">加载通知...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            variant={filter === "unread" ? "no-data" : "no-data"}
            title={filter === "unread" ? "太棒了！没有未读通知" : "暂无通知"}
            description={filter === "unread"
              ? "你已经查看了所有通知"
              : "系统通知、任务提醒、等级升级等消息会显示在这里"}
            icon={filter === "unread"
              ? <CheckCircle className="w-12 h-12 text-green-500" />
              : <Clock className="w-12 h-12 text-gray-300" />
            }
            primaryAction={{ label: "查看今日任务", href: "/workspace/tasks" }}
            secondaryAction={{ label: "返回工作台", href: "/workspace" }}
          />
        ) : viewMode === "timeline" ? (
          /* Timeline View */
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-4">
              {filteredNotifications.map((n, idx) => {
                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                return (
                  <div key={n.id} className="relative flex gap-4 pl-2">
                    {/* Timeline dot */}
                    <div className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                      n.isRead ? "bg-white border-gray-200" : "bg-white border-amber-300 shadow-sm"
                    }`}>
                      <span className="text-sm">{config.emoji}</span>
                      {!n.isRead && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 rounded-xl border p-4 transition-all ${
                      n.isRead ? "border-gray-100 bg-white" : "border-amber-200 bg-amber-50/30 shadow-sm"
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-sm font-medium ${n.isRead ? "text-gray-600" : "text-gray-900"}`}>
                              {n.title}
                            </span>
                            {!n.isRead && (
                              <StatusBadge label="未读" variant="warning" size="sm" dot />
                            )}
                            <StatusBadge label={config.label} variant={config.variant} size="sm" />
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{n.content}</p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-[10px] text-gray-400 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(n.createdAt)}
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
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* List View - Grouped by type */
          <div className="space-y-4">
            {Object.entries(groupedNotifications).map(([type, typeNotifications]) => {
              const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;

              return (
                <SectionCard
                  key={type}
                  title={config.label}
                  subtitle={`${typeNotifications.length} 条通知`}
                  action={
                    <StatusBadge
                      label={`${config.emoji} ${config.label}`}
                      variant={config.variant}
                      size="sm"
                    />
                  }
                >
                  <div className="space-y-2">
                    {typeNotifications.map(n => {
                      return (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                            n.isRead ? "border-gray-100 bg-gray-50/30" : "border-amber-200 bg-amber-50/30 shadow-sm"
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            n.isRead ? "bg-gray-100" : "bg-amber-100"
                          }`}>
                            <span className="text-base">{config.emoji}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-medium ${n.isRead ? "text-gray-600" : "text-gray-900"}`}>
                                {n.title}
                              </span>
                              {!n.isRead && (
                                <StatusBadge label="未读" variant="warning" size="sm" dot />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{n.content}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="text-[10px] text-gray-400 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatRelativeTime(n.createdAt)}
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
                      );
                    })}
                  </div>
                </SectionCard>
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
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>
            <span className="text-sm text-gray-500 px-3">
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
    </div>
  );
}
