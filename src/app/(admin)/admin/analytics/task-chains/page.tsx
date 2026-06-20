"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BarChart3, TrendingUp, Activity, Calendar, RefreshCw, Download, AlertTriangle, Layers, ExternalLink } from "lucide-react";

interface AnalyticsData {
  success: boolean;
  range: string;
  summary: {
    total: number;
    byStatus: Array<{ status: string; _count: number }>;
    last24h: number;
    last7d: number;
    last30d: number;
    sourceToolDist: Array<{ sourceTool: string | null; _count: number }>;
    lastActiveToolDist: Array<{ lastActiveTool: string | null; _count: number }>;
  };
  eventCounts: Array<{ eventType: string; _count: number }>;
  funnelData: Array<{
    tool: string;
    toolEvents: Array<{ eventType: string; _count: number }>;
    taskChainEvents: Array<{ eventType: string; _count: number }>;
  }>;
  conversionRates: {
    saveToWorkspaceRate: string;
    resumeRate: string;
    saveContextCount: number;
    saveSuccessCount: number;
    resumeClickCount: number;
  };
  recentTaskChains: Array<{
    id: string;
    userId: string;
    title: string | null;
    status: string;
    sourceTool: string | null;
    lastActiveTool: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  recentEvents: Array<{
    id: string;
    eventType: string;
    toolName: string | null;
    action: string | null;
    path: string | null;
    createdAt: string;
  }>;
}

export default function TaskChainAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [range, setRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/analytics/task-chains?range=${range}`);
      if (!res.ok) {
        let errMsg = `HTTP ${res.status}`;
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }
      const json = await res.json();
      setData(json);
      setLastUpdatedAt(new Date().toLocaleString());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <div className="text-gray-500 text-sm">加载分析数据中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertTriangle className="w-8 h-8 text-red-400" />
        <div className="text-red-500 text-sm">加载失败: {error}</div>
        <button
          onClick={() => fetchData()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          重试
        </button>
      </div>
    );
  }

  if (!data) return null;

  const getEventCount = (eventType: string) => {
    const event = data.eventCounts.find(e => e.eventType === eventType);
    return event?._count || 0;
  };

  const getStatusCount = (status: string) => {
    const s = data.summary.byStatus.find(s => s.status === status);
    return s?._count || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            TaskChain Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            任务链转化数据分析（只读）· 当前范围: <span className="font-medium text-gray-700">{
              range === "today" ? "今天" : range === "7d" ? "最近 7 天" : range === "30d" ? "最近 30 天" : "全部"
            }</span>
            {lastUpdatedAt && (
              <span className="ml-3 text-xs text-gray-400">
                最后更新: {lastUpdatedAt}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
            title="刷新数据"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <a
            href={`/api/admin/analytics/task-chains.csv?range=${range}`}
            className="p-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            title="导出 CSV"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </a>
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="today">今天</option>
            <option value="7d">最近 7 天</option>
            <option value="30d">最近 30 天</option>
            <option value="all">全部</option>
          </select>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/admin/analytics/task-chains/templates"
          className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group shadow-sm"
        >
          <Layers className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
          <div>
            <div className="text-sm font-medium text-gray-900">任务链模板管理</div>
            <div className="text-xs text-gray-500">配置预定义的任务链模板</div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-300 ml-auto" />
        </Link>
        <Link
          href="/admin/analytics/task-chains/stats"
          className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group shadow-sm"
        >
          <BarChart3 className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
          <div>
            <div className="text-sm font-medium text-gray-900">任务链详细统计</div>
            <div className="text-xs text-gray-500">按工具、用户维度查看统计</div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-300 ml-auto" />
        </Link>
      </div>

      {/* Stats Summary Banner */}
      {data && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">数据概览</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-900">{data.summary.total}</div>
              <div className="text-xs text-blue-600">总任务链</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-700">{getStatusCount("active")}</div>
              <div className="text-xs text-green-600">活跃中</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-700">
                {data.conversionRates.saveToWorkspaceRate === "N/A" ? "N/A" : `${data.conversionRates.saveToWorkspaceRate}%`}
              </div>
              <div className="text-xs text-gray-600">保存转化率</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-700">{data.summary.last7d}</div>
              <div className="text-xs text-gray-600">近 7 天新增</div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="总任务链数"
          value={data.summary.total}
          icon={<Activity className="w-5 h-5 text-blue-600" />}
        />
        <MetricCard
          title="Active"
          value={getStatusCount("active")}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        />
        <MetricCard
          title="Archived"
          value={getStatusCount("archived")}
          icon={<Activity className="w-5 h-5 text-gray-600" />}
        />
        <MetricCard
          title="Deleted"
          value={getStatusCount("deleted")}
          icon={<Activity className="w-5 h-5 text-red-600" />}
        />
      </div>

      {/* Time-based Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="最近 24 小时" value={data.summary.last24h} />
        <MetricCard title="最近 7 天" value={data.summary.last7d} />
        <MetricCard title="最近 30 天" value={data.summary.last30d} />
      </div>

      {/* Conversion Rates */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">转化率</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Save-to-Workspace 转化率</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {data.conversionRates.saveToWorkspaceRate === "N/A"
                ? "N/A"
                : `${data.conversionRates.saveToWorkspaceRate}%`}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {data.conversionRates.saveSuccessCount} / {data.conversionRates.saveContextCount}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Resume 转化率</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {data.conversionRates.resumeRate === "N/A"
                ? "N/A"
                : `${data.conversionRates.resumeRate}%`}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {data.conversionRates.resumeClickCount} / {data.conversionRates.saveSuccessCount}
            </div>
          </div>
        </div>
      </div>

      {/* Event Counts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">事件统计</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <EventCount label="save_context" count={getEventCount("task_chain_save_context")} />
          <EventCount label="next_click" count={getEventCount("task_chain_next_click")} />
          <EventCount label="save_success" count={getEventCount("task_chain_workspace_save_success")} />
          <EventCount label="save_failed" count={getEventCount("task_chain_workspace_save_failed")} />
          <EventCount label="limit_hit" count={getEventCount("task_chain_workspace_limit_hit")} />
          <EventCount label="resume_click" count={getEventCount("task_chain_workspace_resume_click")} />
          <EventCount label="archive" count={getEventCount("task_chain_archive")} />
          <EventCount label="delete" count={getEventCount("task_chain_delete")} />
          <EventCount label="prefill_accept" count={getEventCount("task_chain_prefill_accept")} />
          <EventCount label="prefill_reject" count={getEventCount("task_chain_prefill_reject")} />
          <EventCount label="local_continue" count={getEventCount("task_chain_local_continue")} />
        </div>
      </div>

      {/* Source Tool Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Source Tool 分布</h2>
        <div className="space-y-2">
          {data.summary.sourceToolDist.map((item) => (
            <div key={item.sourceTool || "null"} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{item.sourceTool || "(无)"}</span>
              <span className="text-sm font-medium text-gray-900">{item._count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Core Tools Funnel */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">核心工具漏斗</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">工具</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">save_context</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">next_click</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">save_success</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">resume_click</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.funnelData.map((item) => {
                const getTCCount = (type: string) => {
                  const e = item.taskChainEvents.find(e => e.eventType === type);
                  return e?._count || 0;
                };
                return (
                  <tr key={item.tool}>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.tool}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-700">{getTCCount("task_chain_save_context")}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-700">{getTCCount("task_chain_next_click")}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-700">{getTCCount("task_chain_workspace_save_success")}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-700">{getTCCount("task_chain_workspace_resume_click")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            样本不足，仅用于验证埋点链路，不用于产品结论。
          </p>
        </div>
      </div>

      {/* Recent Task Chains */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最新任务链（20 条）</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.recentTaskChains.map((tc) => (
                <tr key={tc.id}>
                  <td className="px-4 py-2 text-xs text-gray-500 font-mono">{tc.id.substring(0, 8)}</td>
                  <td className="px-4 py-2 text-xs text-gray-500 font-mono">{tc.userId.substring(0, 8)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{tc.title || "(无标题)"}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      tc.status === "active" ? "bg-green-100 text-green-800" :
                      tc.status === "archived" ? "bg-gray-100 text-gray-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {tc.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">{tc.sourceTool || "-"}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{new Date(tc.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最新事件（50 条）</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tool</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Path</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.recentEvents.map((event) => (
                <tr key={event.id}>
                  <td className="px-4 py-2 text-xs text-gray-500">{new Date(event.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{event.eventType}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{event.toolName || "-"}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{event.path || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
        </div>
        {icon && <div>{icon}</div>}
      </div>
    </div>
  );
}

function EventCount({ label, count }: { label: string; count: number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-bold text-gray-900 mt-1">{count}</div>
    </div>
  );
}
