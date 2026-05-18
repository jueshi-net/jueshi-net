"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, ArrowRight, TrendingUp, Award, Star, Check, Mail } from "lucide-react";

const TYPE_ICON: Record<string, any> = {
  growth_reward: TrendingUp,
  badge_awarded: Award,
  level_up: Star,
  review_approved: Check,
  forum_post_approved: Check,
  forum_comment_approved: Check,
  review_rejected: Mail,
  forum_post_rejected: Mail,
};

const TYPE_COLOR: Record<string, string> = {
  growth_reward: "text-emerald-500",
  badge_awarded: "text-purple-500",
  level_up: "text-amber-500",
  review_approved: "text-green-500",
  forum_post_approved: "text-green-500",
  forum_comment_approved: "text-green-500",
  review_rejected: "text-red-400",
  forum_post_rejected: "text-red-400",
};

export default function NotificationSummaryCard() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/me/notifications?unreadOnly=true&pageSize=3").then(r => r.ok ? r.json() : null),
      fetch("/api/me/notifications/unread-count").then(r => r.ok ? r.json() : null),
    ]).then(([notifRes, countRes]) => {
      if (notifRes?.success) setNotifications(notifRes.notifications || []);
      if (countRes?.success) setUnreadCount(countRes.count);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse bg-white rounded-xl border p-5 h-36" />;
  if (notifications.length === 0 && unreadCount === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-900">通知</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full px-1.5">
              {unreadCount}
            </span>
          )}
        </div>
        <Link href="/dashboard/notifications" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium min-h-[44px] px-2">
          查看全部 <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="p-5">
        <div className="space-y-2">
          {notifications.slice(0, 3).map((n: any) => {
            const Icon = TYPE_ICON[n.type] || Bell;
            const color = TYPE_COLOR[n.type] || "text-gray-400";
            return (
              <Link
                key={n.id}
                href={n.link || "/dashboard/notifications"}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-all min-h-[44px]"
              >
                <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-900 truncate">{n.title}</span>
                    {!n.isRead && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" })}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
