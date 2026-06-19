"use client";

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Users, Eye, MousePointer, MessageSquare, AlertCircle } from 'lucide-react';

interface AnalyticsData {
  overview: {
    today: {
      pv: number;
      uv: number;
      sessions: number;
      toolUsage: number;
      signups: number;
      feedback: number;
      errors: number;
    };
    yesterday: {
      pv: number;
      uv: number;
    };
    trends: {
      pvChange: number;
      uvChange: number;
    };
  };
  topPages: Array<{ path: string; count: number }>;
  topReferrers: Array<{ domain: string; count: number }>;
  topTools: Array<{ tool: string; count: number }>;
  deviceDistribution: Array<{ device: string; count: number }>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pages');

  useEffect(() => {
    fetch('/api/admin/analytics/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load analytics:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">加载中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12 text-red-500">加载失败</div>
      </div>
    );
  }

  const { overview, topPages, topReferrers, topTools, deviceDistribution } = data;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics 总览</h1>
        <p className="text-muted-foreground mt-2">v1.20.42.10.0 Analytics MVP</p>
      </div>

      {/* 总览卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">今日 PV</div>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold mt-2">{overview.today.pv}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {overview.trends.pvChange >= 0 ? (
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{overview.trends.pvChange}
              </span>
            ) : (
              <span className="text-red-500 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                {overview.trends.pvChange}
              </span>
            )}
            {' '}vs 昨日
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">今日 UV</div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold mt-2">{overview.today.uv}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {overview.trends.uvChange >= 0 ? (
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{overview.trends.uvChange}
              </span>
            ) : (
              <span className="text-red-500 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                {overview.trends.uvChange}
              </span>
            )}
            {' '}vs 昨日
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">工具使用</div>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold mt-2">{overview.today.toolUsage}</div>
          <p className="text-xs text-muted-foreground mt-1">今日工具操作次数</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">注册 / 反馈</div>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold mt-2">{overview.today.signups} / {overview.today.feedback}</div>
          <p className="text-xs text-muted-foreground mt-1">今日新增注册 / 反馈</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('pages')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'pages'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              页面排行
            </button>
            <button
              onClick={() => setActiveTab('referrers')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'referrers'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              来源分析
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'tools'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              工具排行
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'devices'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              设备分布
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'pages' && (
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">页面 PV 排行（近 7 天）</h3>
            <div className="space-y-2">
              {topPages.map((page, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm">{page.path}</span>
                  <span className="text-sm font-medium">{page.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'referrers' && (
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">来源域名排行（近 7 天）</h3>
            <div className="space-y-2">
              {topReferrers.map((ref, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm">{ref.domain}</span>
                  <span className="text-sm font-medium">{ref.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">工具使用排行（近 7 天）</h3>
            <div className="space-y-2">
              {topTools.map((tool, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm">{tool.tool}</span>
                  <span className="text-sm font-medium">{tool.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'devices' && (
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">设备分布（近 7 天）</h3>
            <div className="space-y-2">
              {deviceDistribution.map((device, i) => {
                const total = deviceDistribution.reduce((sum, d) => sum + d.count, 0);
                const percentage = ((device.count / total) * 100).toFixed(1);
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm">{device.device}</span>
                    <span className="text-sm font-medium">
                      {device.count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 错误统计 */}
      {overview.today.errors > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-red-700">今日错误</div>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2">{overview.today.errors}</div>
          <p className="text-xs text-red-600 mt-1">工具错误事件</p>
        </div>
      )}
    </div>
  );
}
