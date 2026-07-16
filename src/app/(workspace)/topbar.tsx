"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUserPreferences } from "@/components/user/UserPreferencesContext";
import { Bell, Menu } from "lucide-react";
import { useState } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/workspace": "我的工作台",
  "/workspace/tasks": "待办与任务",
  "/workspace/notifications": "通知中心",
  "/workspace/member": "会员与权益",
  "/workspace/documents": "我的单据",
  "/workspace/company-profiles": "公司资料",
  "/workspace/favorites": "我的收藏",
  "/workspace/settings": "账号设置",
};

export default function TopBar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { workspaceTitle } = useUserPreferences();
  const [menuOpen, setMenuOpen] = useState(false);

  // Use custom workspaceTitle for /workspace, otherwise map from pathname
  const title = pathname === "/workspace"
    ? (workspaceTitle || "我的工作台")
    : (PAGE_TITLES[pathname] || "工作台");

  return (
    <div className={className}>
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
        {/* Desktop breadcrumb */}
        <div className="hidden md:flex px-4 sm:px-6 h-12 sm:h-14 items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-600 transition-colors">首页</Link>
            <span className="text-gray-300">›</span>
            <span className="text-gray-700 font-medium">{title}</span>
          </div>
          <div className="w-8" />
        </div>

        {/* Mobile compact header */}
        <div className="md:hidden flex items-center justify-between h-12 px-3" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          {/* Left: Robot symbol + title */}
          <div className="flex items-center gap-2">
            <img
              src="/brand/v2/robot-symbol-color.svg"
              alt="绝世百宝箱"
              className="w-7 h-7 object-contain"
            />
            <span className="text-sm font-bold text-gray-900 tracking-tight">工作台</span>
          </div>

          {/* Right: Notification + Menu */}
          <div className="flex items-center gap-1">
            <Link
              href="/workspace/notifications"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="通知"
            >
              <Bell className="w-4.5 h-4.5 text-gray-600" />
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="菜单"
            >
              <Menu className="w-4.5 h-4.5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-12 right-0 w-56 bg-white shadow-xl rounded-bl-xl z-50 md:hidden border border-gray-100">
            <nav className="py-2">
              {[
                { href: "/workspace", label: "概览" },
                { href: "/workspace/documents", label: "我的单据" },
                { href: "/workspace/tasks", label: "任务清单" },
                { href: "/workspace/favorites", label: "我的收藏" },
                { href: "/workspace/notifications", label: "通知中心" },
                { href: "/workspace/settings", label: "账号设置" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 text-sm ${
                    pathname === item.href
                      ? "bg-[#0A1D6B]/5 text-[#0A1D6B] font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <hr className="my-1 border-gray-100" />
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50"
              >
                返回首页
              </Link>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
