"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Home, ChevronRight, Bell, Check, CheckCheck, Loader2, Mail, Star, Award, TrendingUp, MessageSquare, Settings } from "lucide-react";

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  growth_reward: { icon: TrendingUp, color: "text-emerald-500 bg-emerald-50", label: "成长值" },
  badge_awarded: { icon: Award, color: "text-purple-500 bg-purple-50", label: "勋章" },
  level_up: { icon: Star, color: "text-amber-500 bg-amber-50", label: "等级" },
  review_approved: { icon: Check, color: "text-green-500 bg-green-50", label: "点评通过" },
  review_rejected: { icon: Mail, color: "text-red-500 bg-red-50", label: "点评未通过" },
  forum_post_approved: { icon: MessageSquare, color: "text-green-500 bg-green-50", label: "帖子通过" },
  forum_post_rejected: { icon: Mail, color: "text-red-500 bg-red-50", label: "帖子未通过" },
  forum_comment_approved: { icon: MessageSquare, color: "text-green-500 bg-green-50", label: "评论通过" },
  forum_comment_hidden: { icon: Mail, color: "text-gray-500 bg-gray-50", label: "评论隐藏" },
  system: { icon: Settings, color: "text-blue-500 bg-blue-50", label: "系统" },
  admin_message: { icon: Mail, color: "text-blue-500 bg-blue-50", label: "管理员" },
};

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export default function NotificationsClient({
  initialNotifications,
  initialUnreadCount,
}: {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const handleMarkRead = useCallback(async (id: string) => {
    setMarkingId(id);
    try {
      const res = await fetch(`/api/me/notifications/${id}`, { method: "PATCH" });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch {
      // ignore
    } finally {
      setMarkingId(null);
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    setMarkingAll(true);
    try {
      const res = await fetch("/api/me/notifications/mark-all-read", { method: "POST" });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
        setUnreadCount(0);
      }
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  }, []);

  const visible = filter === "unread" ? notifications.filter(n => !n.isRead) : notifications;

  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex items-center gap-1.5 text-sm text-blue-100/80 mb-4 min-h-[44px]">
            <Link href="/" className="hover:text-white transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> 首页
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/dashboard" className="hover:text-white transition-colors">工作台</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">通知中心</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <Bell className="w-7 h-7" /> 通知中心
          </h1>
          <p className="text-blue-100/90 text-sm mt-1">
            {unreadCount > 0 ? `你有 ${unreadCount} 条未读通知` : "暂无未读通知"}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-5 pb-16 relative z-10">
        {/* Controls */}
        <div className="bg-white rounded-xl border p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-h-[44px]">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "unread" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
            >
              未读 {unreadCount > 0 && <span className="ml-1 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">{unreadCount}</span>}
            </button>
          </div>
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll || unreadCount === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {markingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            全部已读
          </button>
        </div>

        {/* Notification list */}
        {visible.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center shadow-sm">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">暂无通知</h3>
            <p className="text-sm text-gray-500">签到、点评、发帖等互动将在这里收到通知</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map(n => {
              const cfg = TYPE_CONFIG[n.type] || { icon: Bell, color: "text-gray-500 bg-gray-50", label: n.type };
              const Icon = cfg.icon;
              return (
                <div
                  key={n.id}
                  className={`bg-white rounded-xl border shadow-sm transition-all ${!n.isRead ? "border-blue-200 bg-blue-50/30" : ""}`}
                >
                  <div className="p-4 flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${!n.isRead ? "text-gray-900" : "text-gray-600"}`}>
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString("zh-CN", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {n.link && (
                        <Link
                          href={n.link}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors min-h-[36px]"
                        >
                          查看
                        </Link>
                      )}
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          disabled={markingId === n.id}
                          className="inline-flex items-center px-3 py-1.5 text-gray-400 hover:text-green-600 rounded-lg text-xs font-medium hover:bg-green-50 transition-colors min-h-[36px] disabled:opacity-50"
                        >
                          {markingId === n.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          已读
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
