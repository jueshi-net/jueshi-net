'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, BarChart3, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function UserDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stats/clicks?days=${period}`)
      .then(res => res.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading || !stats) {
    return (
      <div className="bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Activity className="w-7 h-7" />
            数据看板
          </h1>
          <p className="text-emerald-100 mt-1">链接点击统计与趋势分析</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-4">
        {/* 时间选择 */}
        <div className="flex gap-2 mb-6">
          {[
            { label: '近 7 天', value: '7' },
            { label: '近 30 天', value: '30' },
            { label: '近 90 天', value: '90' },
          ].map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">总点击数</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalClicks.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1 text-green-600 text-xs">
              <ArrowUpRight className="w-3 h-3" />
              <span>持续增长</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">热门链接</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.topClicked.length}</p>
            <p className="text-xs text-gray-400 mt-1">近期活跃</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">分类数</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.categories.length}</p>
            <p className="text-xs text-gray-400 mt-1">已覆盖</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">平均点击</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.topClicked.length > 0
                ? Math.round(stats.topClicked.reduce((a: number, b: any) => a + b.clicks, 0) / stats.topClicked.length)
                : 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">每链接</p>
          </div>
        </div>

        {/* 双栏 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 热门链接 */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              热门链接 TOP 10
            </h2>
            <div className="space-y-3">
              {stats.topClicked.map((link: any, i: number) => (
                <div key={link.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{link.title}</p>
                    <p className="text-xs text-gray-400">{link.category?.name || '未分类'}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 shrink-0">{link.clicks}</span>
                </div>
              ))}
              {stats.topClicked.length === 0 && (
                <p className="text-center text-gray-400 py-4 text-sm">暂无点击数据</p>
              )}
            </div>
          </div>

          {/* 分类分布 */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              分类链接分布
            </h2>
            <div className="space-y-3">
              {stats.categories.map((cat: any) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{cat.name}</span>
                    <span className="text-gray-500">{cat.count} 个链接</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${stats.categories.length > 0 ? (cat.count / Math.max(...stats.categories.map((c: any) => c.count))) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              ))}
              {stats.categories.length === 0 && (
                <p className="text-center text-gray-400 py-4 text-sm">暂无分类数据</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
