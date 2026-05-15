"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const POINT_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  daily_checkin: { label: "签到", icon: "📅" },
  task_complete: { label: "任务", icon: "✅" },
  export_word: { label: "导出", icon: "📄" },
  admin_adjust: { label: "调整", icon: "⚙️" },
  reward_redeem: { label: "兑换", icon: "🎁" },
  system_adjust: { label: "系统", icon: "🔧" },
};

interface PointLog {
  id: string;
  type: string;
  points: number;
  reason: string | null;
  createdAt: string;
}

interface Stats {
  earned: number;
  count: number;
}

interface PointsData {
  logs: PointLog[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  stats: {
    today: Stats;
    thisWeek: Stats;
    thisMonth: Stats;
  };
  filters: { type: string | null; types: string[] };
}

const TYPE_FILTERS = [
  { value: "", label: "全部" },
  { value: "daily_checkin", label: "📅 签到" },
  { value: "task_complete", label: "✅ 任务" },
  { value: "reward_redeem", label: "🎁 兑换" },
  { value: "export_word", label: "📄 导出" },
  { value: "admin_adjust", label: "⚙️ 调整" },
];

export default function PointsPage() {
  const [data, setData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "20",
      });
      if (typeFilter) params.set("type", typeFilter);

      const res = await fetch(`/api/points/logs?${params.toString()}`);
      if (res.status === 401) {
        setLoginRequired(true);
        setLoading(false);
        return;
      }
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to fetch points:", e);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (loginRequired) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6">🔐</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">请先登录</h1>
        <p className="text-gray-600 mb-6">积分明细需要登录后查看</p>
        <Link href="/login" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          前往登录
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">积分明细</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-gray-500 mb-1">今日获得</div>
          <div className="text-2xl font-bold text-green-600">+{data.stats.today.earned}</div>
          <div className="text-xs text-gray-400">{data.stats.today.count} 笔</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-gray-500 mb-1">本周获得</div>
          <div className="text-2xl font-bold text-blue-600">+{data.stats.thisWeek.earned}</div>
          <div className="text-xs text-gray-400">{data.stats.thisWeek.count} 笔</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-gray-500 mb-1">本月获得</div>
          <div className="text-2xl font-bold text-purple-600">+{data.stats.thisMonth.earned}</div>
          <div className="text-xs text-gray-400">{data.stats.thisMonth.count} 笔</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-gray-500 mb-1">总记录</div>
          <div className="text-2xl font-bold text-gray-900">{data.pagination.total}</div>
          <div className="text-xs text-gray-400">条流水</div>
        </div>
      </div>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setTypeFilter(f.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === f.value
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {data.logs.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无积分记录</p>
            <p className="text-sm mt-1">通过签到和完成任务获取积分</p>
          </div>
        ) : (
          <div className="divide-y">
            {data.logs.map((log) => {
              const typeInfo = POINT_TYPE_LABELS[log.type] || { label: log.type, icon: "❓" };
              return (
                <div key={log.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{typeInfo.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{typeInfo.label}</div>
                      {log.reason && log.reason !== typeInfo.label && (
                        <div className="text-xs text-gray-400">{log.reason}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${log.points > 0 ? "text-green-600" : "text-red-600"}`}>
                      {log.points > 0 ? "+" : ""}{log.points}
                    </div>
                    <div className="text-xs text-gray-400">{formatTime(log.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            第 {data.pagination.page} / {data.pagination.totalPages} 页，共 {data.pagination.total} 条
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page >= data.pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
