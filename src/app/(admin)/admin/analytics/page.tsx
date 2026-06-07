'use client';

import { useState, useEffect } from 'react';
import {
  Users, Link, FolderOpen, FileText, Mail,
  TrendingUp, MessageSquare, Share2, Loader2,
  ArrowUpRight, ExternalLink
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalLinks: number;
    activeLinks: number;
    totalCategories: number;
    totalArticles: number;
    publishedArticles: number;
    totalFeedback: number;
    resolvedFeedback: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalShares: number;
    totalShortLinks: number;
  };
  trends: {
    newUsersLast7Days: number;
    newLinksLast7Days: number;
  };
  topCategories: { id: string; name: string; icon: string | null; _count: { linkItems: number } }[];
  topLinks: { id: string; name: string; url: string; clicks: number; category: { name: string } }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
        <p className="text-gray-500 mt-2">加载分析数据...</p>
      </div>
    );
  }

  if (!data) return <div className="p-6 text-red-500">加载失败</div>;

  const { overview, trends, topCategories, topLinks } = data;

  const stats = [
    { label: '总用户数', value: overview.totalUsers, icon: Users, color: 'blue', sub: `活跃 ${overview.activeUsers}` },
    { label: '导航链接', value: overview.totalLinks, icon: Link, color: 'green', sub: `启用 ${overview.activeLinks}` },
    { label: '文章数量', value: overview.totalArticles, icon: FileText, color: 'purple', sub: `已发布 ${overview.publishedArticles}` },
    { label: '邮件订阅', value: overview.totalSubscriptions, icon: Mail, color: 'orange', sub: `活跃 ${overview.activeSubscriptions}` },
    { label: '用户反馈', value: overview.totalFeedback, icon: MessageSquare, color: 'pink', sub: `已解决 ${overview.resolvedFeedback}` },
    { label: '分享次数', value: overview.totalShares, icon: Share2, color: 'cyan', sub: `短链 ${overview.totalShortLinks}` },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          系统分析
        </h1>
        <p className="text-gray-500 mt-1">平台运营数据总览</p>
      </div>

      {/* 本周趋势 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">近 7 天新用户</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{trends.newUsersLast7Days}</p>
            </div>
            <ArrowUpRight className="w-10 h-10 text-blue-300" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">近 7 天新链接</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{trends.newLinksLast7Days}</p>
            </div>
            <ArrowUpRight className="w-10 h-10 text-green-300" />
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 text-${stat.color}-500`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* 双栏 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 热门分类 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            热门分类
          </h2>
          <div className="space-y-3">
            {topCategories.map((cat, i) => (
              <div key={cat.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                </div>
                <span className="text-sm text-gray-500">{cat._count.linkItems} 链接</span>
              </div>
            ))}
            {topCategories.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">暂无分类数据</p>
            )}
          </div>
        </div>

        {/* 热门链接 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Link className="w-5 h-5" />
            热门链接 (点击量)
          </h2>
          <div className="space-y-3">
            {topLinks.map((link, i) => (
              <div key={link.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{link.name}</p>
                    <p className="text-xs text-gray-400">{link.category.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-medium text-gray-900">{link.clicks}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            ))}
            {topLinks.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">暂无链接数据</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
