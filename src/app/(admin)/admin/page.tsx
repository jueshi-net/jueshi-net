"use client";
import { useEffect, useState } from "react";
import { LayoutDashboard, Link2, FileText, Megaphone, Users, FolderOpen, TrendingUp, Star, Download, Plus, Settings, Upload, BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#6366F1"];

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64">加载中...</div>;
  if (!stats || !stats.categories) return <div className="text-red-500 p-8 text-center">
    <p className="text-xl mb-2">加载失败</p>
    <p className="text-sm text-gray-500">{stats?.error || "可能是权限问题，请重新登录"}</p>
    <a href="/login" className="text-blue-600 underline mt-2 inline-block">返回登录</a>
  </div>;

  const categoryData = stats.categories.map((c: any) => ({ name: c.name, 数量: c._count.links }));
  const linkData = stats.topLinks.map((l: any) => ({ name: l.title.slice(0, 8), 点击: l.clicks }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6" />
          管理面板
        </h1>
        <div className="flex gap-2">
          <a href="/api/export?type=links&format=csv" className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出CSV
          </a>
          <a href="/admin/settings" className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            设置
          </a>
          <a href="/admin/import-bookmarks" className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            导入书签
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: "链接总数", value: stats.totalLinks, icon: Link2, color: "text-blue-600" },
          { label: "分类数", value: stats.categories.length, icon: FolderOpen, color: "text-green-600" },
          { label: "用户数", value: stats.totalUsers, icon: Users, color: "text-purple-600" },
          { label: "文章数", value: stats.totalArticles, icon: FileText, color: "text-orange-600" },
          { label: "总点击", value: stats.totalClicks, icon: TrendingUp, color: "text-red-600" },
          { label: "总阅读", value: stats.totalViews, icon: Star, color: "text-yellow-600" },
          { label: "订阅数", value: stats.totalSubs || 0, icon: Megaphone, color: "text-teal-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
            <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">分类分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="数量">
                {categoryData.map((_: any, index: number) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">热门链接 Top 10</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={linkData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="点击" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">快捷操作</h2>
        <div className="flex gap-3 flex-wrap">
          <a href="/admin/links" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"><Plus className="w-4 h-4" />管理链接</a>
          <a href="/admin/categories" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"><FolderOpen className="w-4 h-4" />管理分类</a>
          <a href="/admin/cms" className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 flex items-center gap-2"><FileText className="w-4 h-4" />发布文章</a>
          <a href="/admin/resources" className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 flex items-center gap-2"><BookOpen className="w-4 h-4" />管理资源</a>
          <a href="/admin/ads" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-2"><Megaphone className="w-4 h-4" />配置广告</a>
          <a href="/admin/users" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center gap-2"><Users className="w-4 h-4" />用户管理</a>
          <a href="/admin/settings" className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 flex items-center gap-2"><Settings className="w-4 h-4" />系统设置</a>
        </div>
      </div>
    </div>
  );
}
