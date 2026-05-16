"use client";
import Link from "next/link";
import { Users, Star, FileText, Megaphone, FolderOpen, Link2, Settings, Cloud, BarChart3, Shield, Database, Package, ExternalLink } from "lucide-react";

interface ModuleCard {
  name: string;
  path: string;
  icon: any;
  status: "online" | "partial" | "planned";
  statusLabel: string;
  description: string;
  dataSource: string;
  color: string;
}

const modules: ModuleCard[] = [
  {
    name: "用户管理",
    path: "/admin/users",
    icon: Users,
    status: "online",
    statusLabel: "已上线",
    description: "查看/编辑用户、角色、积分、会员到期时间",
    dataSource: "DB: users, memberships, point_ledgers",
    color: "blue",
  },
  {
    name: "短评审核",
    path: "/admin/tool-reviews",
    icon: Star,
    status: "online",
    statusLabel: "已上线",
    description: "审核用户提交的工具短评（通过/隐藏/拒绝）",
    dataSource: "DB: tool_reviews",
    color: "yellow",
  },
  {
    name: "文章管理",
    path: "/admin/cms",
    icon: FileText,
    status: "online",
    statusLabel: "已上线",
    description: "管理网站文章/指南/教程。前台展示：/guides 和 /guides/[slug]",
    dataSource: "DB: articles",
    color: "orange",
  },
  {
    name: "广告管理",
    path: "/admin/ads",
    icon: Megaphone,
    status: "online",
    statusLabel: "已上线",
    description: "管理广告位。支持图片广告、文字广告、HTML/JS 代码广告",
    dataSource: "DB: ad_slots",
    color: "green",
  },
  {
    name: "资源库",
    path: "/admin/resources",
    icon: FolderOpen,
    status: "partial",
    statusLabel: "已上线/待完善",
    description: "管理资源库内容。前台展示：/resources 和 /resources/[slug]",
    dataSource: "DB: resources",
    color: "purple",
  },
  {
    name: "链接管理",
    path: "/admin/links",
    icon: Link2,
    status: "online",
    statusLabel: "已上线",
    description: "管理链接收藏、分类、标签",
    dataSource: "DB: links, link_categories, link_tags",
    color: "teal",
  },
  {
    name: "分类/标签",
    path: "/admin/categories",
    icon: BarChart3,
    status: "online",
    statusLabel: "已上线",
    description: "管理链接分类和标签",
    dataSource: "DB: link_categories, link_tags",
    color: "indigo",
  },
  {
    name: "单据/唛头模板",
    path: "/tools/label-maker",
    icon: Package,
    status: "partial",
    statusLabel: "代码级管理",
    description: "8 种唛头/标签类型 + 6 种视觉风格。目前通过代码配置，不是后台编辑",
    dataSource: "代码: src/lib/documents / src/lib/labels",
    color: "gray",
  },
  {
    name: "网盘分享",
    path: "#",
    icon: Cloud,
    status: "planned",
    statusLabel: "未实现",
    description: "计划在 v1.20/v1.21 实现，目前无 model/API/页面",
    dataSource: "无",
    color: "sky",
  },
  {
    name: "系统设置",
    path: "/admin/settings",
    icon: Settings,
    status: "online",
    statusLabel: "已上线",
    description: "网站基础设置",
    dataSource: "DB: site_settings",
    color: "slate",
  },
  {
    name: "数据备份",
    path: "/admin/backup",
    icon: Database,
    status: "online",
    statusLabel: "已上线",
    description: "数据库备份管理",
    dataSource: "系统: pg_dump + 脚本",
    color: "emerald",
  },
  {
    name: "权限/安全",
    path: "/admin/audit",
    icon: Shield,
    status: "online",
    statusLabel: "已上线",
    description: "审计日志、安全设置",
    dataSource: "DB: audit_logs",
    color: "red",
  },
];

const statusColors: Record<string, string> = {
  online: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  planned: "bg-gray-100 text-gray-500",
};

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">管理面板</h1>
        <p className="text-sm text-gray-500 mt-1">选择要管理的模块，每个模块显示当前状态</p>
      </div>

      {/* Status Legend */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> 已上线</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> 部分功能</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400"></span> 未实现</span>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((m) => {
          const Icon = m.icon;
          const isPlanned = m.status === "planned";
          const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
            blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200" },
            yellow: { bg: "bg-yellow-50", icon: "text-yellow-600", border: "border-yellow-200" },
            orange: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-200" },
            green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-200" },
            purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-200" },
            teal: { bg: "bg-teal-50", icon: "text-teal-600", border: "border-teal-200" },
            indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", border: "border-indigo-200" },
            gray: { bg: "bg-gray-50", icon: "text-gray-600", border: "border-gray-200" },
            sky: { bg: "bg-sky-50", icon: "text-sky-600", border: "border-sky-200" },
            slate: { bg: "bg-slate-50", icon: "text-slate-600", border: "border-slate-200" },
            emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200" },
            red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-200" },
          };
          const c = colorMap[m.color] || colorMap.gray;

          return isPlanned ? (
            <div key={m.name} className={`rounded-xl border ${c.border} ${c.bg} p-5 opacity-70`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${c.icon}`} />
                <h3 className="font-semibold text-gray-700">{m.name}</h3>
              </div>
              <p className="text-xs text-gray-500 mb-1">{m.description}</p>
              <p className="text-xs text-gray-400 mb-2 font-mono">{m.dataSource}</p>
              <span className={`px-2 py-0.5 rounded text-xs ${statusColors[m.status]}`}>{m.statusLabel}</span>
            </div>
          ) : (
            <Link
              key={m.name}
              href={m.path}
              className={`rounded-xl border ${c.border} ${c.bg} p-5 hover:shadow-md transition-all block group`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                  <h3 className="font-semibold text-gray-900">{m.name}</h3>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
              <p className="text-xs text-gray-500 mb-1">{m.description}</p>
              <p className="text-xs text-gray-400 mb-3 font-mono">{m.dataSource}</p>
              <span className={`px-2 py-0.5 rounded text-xs ${statusColors[m.status]}`}>{m.statusLabel}</span>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">快速信息</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">文章</p>
            <p className="text-lg font-bold text-gray-900">20 篇</p>
          </div>
          <div>
            <p className="text-gray-500">资源</p>
            <p className="text-lg font-bold text-gray-900">80 条</p>
          </div>
          <div>
            <p className="text-gray-500">广告位</p>
            <p className="text-lg font-bold text-gray-900">0 个</p>
          </div>
          <div>
            <p className="text-gray-500">单据模板</p>
            <p className="text-lg font-bold text-gray-900">8 种</p>
          </div>
        </div>
      </div>
    </div>
  );
}
