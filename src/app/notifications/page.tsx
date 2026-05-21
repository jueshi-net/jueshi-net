"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, Check, Trash2, ExternalLink, Mail, AlertCircle, Info, CheckCircle } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  email: Mail,
};

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
    if (status === "authenticated") {
      fetchNotifications();
    }
  }, [status, router]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (ids: string[]) => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/mark-read?id=${id}`, {
        method: "DELETE",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const clearRead = async () => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "DELETE",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to clear:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">通知中心</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} 未读
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAsRead(notifications.filter(n => !n.isRead).map(n => n.id))}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            全部已读
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>暂无通知</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || Info;
            return (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notif.isRead
                    ? "bg-white dark:bg-gray-800 dark:border-gray-700"
                    : "bg-blue-50 dark:bg-gray-700 border-blue-200 dark:border-gray-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${notif.isRead ? "text-gray-400" : "text-blue-500"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium truncate">{notif.title}</h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {notif.link && (
                        <a
                          href={notif.link}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          onClick={async (e) => {
                            // Mark as read before navigating
                            try {
                              await fetch("/api/notifications/mark-read", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ ids: [notif.id] }),
                              });
                              setNotifications(prev =>
                                prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
                              );
                              setUnreadCount(prev => Math.max(0, prev - 1));
                            } catch (error) {
                              console.error("Failed to mark as read:", error);
                            }
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                          查看详情
                        </a>
                      )}
                      <div className="flex gap-2 ml-auto">
                        {!notif.isRead && (
                          <button
                            onClick={() => markAsRead([notif.id])}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" />
                            已读
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {notifications.some(n => n.isRead) && (
        <div className="mt-4 text-center">
          <button
            onClick={clearRead}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            清除已读通知
          </button>
        </div>
      )}
    </div>
  );
}
