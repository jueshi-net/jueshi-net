"use client";

import {
  Home,
  TrendingUp,
  Star,
  Map,
  Mail,
  Calculator,
  Ship,
  GraduationCap,
  FileText,
  Settings,
  MessageCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface JueshiV4SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const navItems = [
  { icon: Home, label: "首页", href: "/" },
  { icon: TrendingUp, label: "热门工具", href: "/tools" },
  { icon: Star, label: "收藏", href: "/favorites" },
];

const toolCategories = [
  { icon: Map, label: "地图导航", href: "/tools/postal-code" },
  { icon: Mail, label: "单据生成", href: "/tools/commercial-invoice" },
  { icon: Calculator, label: "汇率换算", href: "/tools/exchange-rate" },
  { icon: Ship, label: "物流查询", href: "/tools/shipping-estimator" },
  { icon: GraduationCap, label: "留学指南", href: "/guides" },
  { icon: FileText, label: "官方资源", href: "/resources" },
];

const bottomItems = [
  { icon: MessageCircle, label: "社区", href: "/community" },
  { icon: Settings, label: "设置", href: "/settings" },
];

export default function JueshiV4Sidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: JueshiV4SidebarProps) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-[#1b1d21] border-r border-[#3a3e45] z-50 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#3a3e45]">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg"></span>
            </div>
            <span className="font-bold text-white">绝世百宝箱</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white text-lg">🦀</span>
          </div>
        )}
        <button
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="py-4 px-3 space-y-1 overflow-y-auto h-[calc(100%-8rem)]">
        {/* Main Nav */}
        <div className="space-y-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-[#2a2d35] hover:text-white transition-colors ${
                isCollapsed ? "justify-center" : ""
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-[#3a3e45] my-3" />

        {/* Tool Categories */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
              工具分类
            </div>
          )}
          {toolCategories.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-[#2a2d35] hover:text-white transition-colors ${
                isCollapsed ? "justify-center" : ""
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-[#3a3e45] my-3" />

        {/* Bottom Items */}
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-[#2a2d35] hover:text-white transition-colors ${
                isCollapsed ? "justify-center" : ""
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </a>
          ))}
        </div>
      </nav>

      {/* Collapse Toggle (Desktop Only) */}
      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-[#2a2d35] border border-[#3a3e45] rounded-full items-center justify-center text-gray-400 hover:text-white hover:bg-[#3a3e45] transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
