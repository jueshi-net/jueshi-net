"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  const fetchCount = () => {
    fetch("/api/me/notifications/unread-count")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.success) setCount(d.count); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCount();
    // Refresh on visibility change (when user comes back to tab)
    const handler = () => { if (document.visibilityState === "visible") fetchCount(); };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  if (count === 0) {
    return (
      <Link href="/dashboard/notifications" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" title="通知中心">
        <Bell className="w-5 h-5 text-gray-400" />
      </Link>
    );
  }

  return (
    <Link href="/dashboard/notifications" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center relative" title="通知中心">
      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
        {count > 99 ? "99+" : count}
      </span>
    </Link>
  );
}
