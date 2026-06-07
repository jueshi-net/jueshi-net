"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUserPreferences } from "@/components/user/UserPreferencesContext";

const PAGE_TITLES: Record<string, string> = {
  "/workspace": "我的工作台",
  "/workspace/tasks": "待办与任务",
  "/workspace/member": "会员与权益",
  "/workspace/documents": "我的单据",
  "/workspace/company-profiles": "公司资料",
  "/workspace/favorites": "我的收藏",
  "/workspace/settings": "账号设置",
};

export default function TopBar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { workspaceTitle } = useUserPreferences();

  // Use custom workspaceTitle for /workspace, otherwise map from pathname
  const title = pathname === "/workspace"
    ? (workspaceTitle || "我的工作台")
    : (PAGE_TITLES[pathname] || "工作台");

  return (
    <div className={className}>
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
        <div className="px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-600 transition-colors">首页</Link>
            <span className="text-gray-300">›</span>
            <span className="text-gray-700 font-medium">{title}</span>
          </div>
          <span className="md:hidden text-sm font-bold text-gray-900 tracking-tight sr-only">{title}</span>
          <div className="w-8" />
        </div>
      </div>
    </div>
  );
}
