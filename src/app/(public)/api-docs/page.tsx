"use client";
import { useState } from "react";
import { Book, ChevronDown, ChevronRight, Copy, Check } from "lucide-react";

const apiDocs = [
  {
    category: "认证",
    icon: "🔐",
    endpoints: [
      { method: "POST", path: "/api/auth/login", desc: "用户登录", auth: false },
      { method: "POST", path: "/api/auth/register", desc: "用户注册", auth: false },
      { method: "GET", path: "/api/auth/session", desc: "获取当前会话", auth: false },
    ]
  },
  {
    category: "链接管理",
    icon: "🔗",
    endpoints: [
      { method: "GET", path: "/api/links", desc: "获取链接列表", auth: true },
      { method: "POST", path: "/api/links", desc: "创建链接", auth: true },
      { method: "PUT", path: "/api/links/[id]", desc: "更新链接", auth: true },
      { method: "DELETE", path: "/api/links/[id]", desc: "删除链接", auth: true },
      { method: "POST", path: "/api/links/import", desc: "批量导入", auth: true },
      { method: "GET", path: "/api/links/export", desc: "导出链接", auth: true },
      { method: "POST", path: "/api/links/batch-delete", desc: "批量删除", auth: true },
    ]
  },
  {
    category: "广告管理",
    icon: "📢",
    endpoints: [
      { method: "GET", path: "/api/ads", desc: "获取广告列表", auth: false },
      { method: "POST", path: "/api/ads", desc: "创建广告", auth: true, admin: true },
      { method: "PUT", path: "/api/ads/[id]", desc: "更新广告", auth: true, admin: true },
      { method: "DELETE", path: "/api/ads/[id]", desc: "删除广告", auth: true, admin: true },
    ]
  },
  {
    category: "文章 CMS",
    icon: "📝",
    endpoints: [
      { method: "GET", path: "/api/articles", desc: "获取文章列表", auth: false },
      { method: "GET", path: "/api/articles/[slug]", desc: "获取单篇文章", auth: false },
      { method: "POST", path: "/api/articles", desc: "创建文章", auth: true, admin: true },
      { method: "PUT", path: "/api/articles/[slug]", desc: "更新文章", auth: true, admin: true },
      { method: "DELETE", path: "/api/articles/[slug]", desc: "删除文章", auth: true, admin: true },
    ]
  },
  {
    category: "收藏管理",
    icon: "⭐",
    endpoints: [
      { method: "GET", path: "/api/favorites", desc: "获取收藏列表", auth: true },
      { method: "POST", path: "/api/favorites", desc: "添加收藏", auth: true },
      { method: "DELETE", path: "/api/favorites/[id]", desc: "取消收藏", auth: true },
    ]
  },
  {
    category: "备忘录",
    icon: "📋",
    endpoints: [
      { method: "GET", path: "/api/memos", desc: "获取备忘录", auth: true },
      { method: "POST", path: "/api/memos", desc: "创建备忘录", auth: true },
      { method: "PUT", path: "/api/memos/[id]", desc: "更新备忘录", auth: true },
      { method: "DELETE", path: "/api/memos/[id]", desc: "删除备忘录", auth: true },
    ]
  },
  {
    category: "搜索 & 追踪",
    icon: "🔍",
    endpoints: [
      { method: "GET", path: "/api/search", desc: "搜索链接", auth: false },
      { method: "GET", path: "/api/tracking", desc: "物流追踪", auth: false },
    ]
  },
  {
    category: "统计 & 数据",
    icon: "📊",
    endpoints: [
      { method: "GET", path: "/api/stats", desc: "统计数据", auth: true, admin: true },
      { method: "GET", path: "/api/backup", desc: "数据库备份", auth: true, admin: true },
      { method: "POST", path: "/api/subscribe", desc: "邮件订阅", auth: false },
      { method: "GET", path: "/api/subscriptions", desc: "订阅列表", auth: true, admin: true },
      { method: "GET", path: "/api/webhooks", desc: "Webhook 列表", auth: true, admin: true },
      { method: "POST", path: "/api/webhooks", desc: "创建 Webhook", auth: true, admin: true },
      { method: "DELETE", path: "/api/webhooks/[id]", desc: "删除 Webhook", auth: true, admin: true },
    ]
  },
  {
    category: "用户管理",
    icon: "👤",
    endpoints: [
      { method: "GET", path: "/api/users", desc: "用户列表", auth: true, admin: true },
      { method: "GET", path: "/api/users/[id]", desc: "用户资料", auth: true },
      { method: "PUT", path: "/api/users/[id]", desc: "更新用户", auth: true },
      { method: "DELETE", path: "/api/users/[id]", desc: "删除用户", auth: true, admin: true },
      { method: "POST", path: "/api/workspace", desc: "创建工作区", auth: true },
    ]
  },
  {
    category: "工具",
    icon: "🛠️",
    endpoints: [
      { method: "GET", path: "/api/favicon", desc: "获取网站图标", auth: false },
      { method: "GET", path: "/go/[id]", desc: "链接跳转+计数", auth: false },
      { method: "GET", path: "/sitemap.xml", desc: "站点地图", auth: false },
      { method: "GET", path: "/rss.xml", desc: "RSS 订阅源", auth: false },
      { method: "GET", path: "/robots.txt", desc: "爬虫规则", auth: false },
    ]
  },
];

export default function ApiDocsPage() {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: true });
  const [copied, setCopied] = useState<string | null>(null);

  const toggle = (idx: number) => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const methodColors: Record<string, string> = {
    GET: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    POST: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    PUT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Book className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API 文档</h1>
          <p className="text-gray-500 dark:text-gray-400">海外百宝箱 REST API 参考</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">32</div>
          <div className="text-sm text-gray-500">API 端点</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">52</div>
          <div className="text-sm text-gray-500">总路由数</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">10</div>
          <div className="text-sm text-gray-500">模块分类</div>
        </div>
      </div>

      {/* Base URL */}
      <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-4 mb-8">
        <div className="flex items-center justify-between">
          <code className="text-green-400 text-sm">Base URL: {process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "https://jueshi.net"}</code>
          <button
            onClick={() => copyToClipboard(process.env.NEXT_PUBLIC_APP_URL || "https://jueshi.net")}
            className="text-gray-400 hover:text-white"
          >
            {copied === (process.env.NEXT_PUBLIC_APP_URL || "https://jueshi.net") ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {apiDocs.map((cat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{cat.category}</span>
                <span className="text-sm text-gray-400">({cat.endpoints.length} 个端点)</span>
              </div>
              {expanded[idx] ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            </button>

            {expanded[idx] && (
              <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700">
                {cat.endpoints.map((ep, i) => (
                  <div key={i} className="px-6 py-3 flex items-center gap-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${methodColors[ep.method]}`}>
                      {ep.method}
                    </span>
                    <code className="text-sm text-gray-700 dark:text-gray-300 font-mono flex-1">{ep.path}</code>
                    <span className="text-sm text-gray-500">{ep.desc}</span>
                    {ep.auth && <span className="px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">Auth</span>}
                    {ep.admin && <span className="px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Admin</span>}
                    <button
                      onClick={() => copyToClipboard(`${ep.method} ${ep.path}`)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {copied === `${ep.method} ${ep.path}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
