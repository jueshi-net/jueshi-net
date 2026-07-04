"use client";

import { Search, Bell, User, Menu } from "lucide-react";

interface JueshiV4TopbarProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function JueshiV4Topbar({
  onMenuClick,
  sidebarCollapsed,
  onToggleSidebar,
}: JueshiV4TopbarProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-[#1b1d21]/95 backdrop-blur-sm border-b border-[#3a3e45] flex items-center justify-between px-4 lg:px-6">
      {/* Left: Menu Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-400 hover:text-white p-2"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleSidebar}
          className="hidden lg:block text-gray-400 hover:text-white p-2"
          title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索工具、指南、资源..."
            className="w-full bg-[#2a2d35] border border-[#3a3e45] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#6c5dd3] focus:ring-1 focus:ring-[#6c5dd3] transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button className="relative text-gray-400 hover:text-white p-2">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          用
        </button>
      </div>
    </header>
  );
}
