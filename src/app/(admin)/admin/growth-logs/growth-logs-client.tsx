"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Search, ChevronLeft, ChevronRight, Award, ExternalLink } from "lucide-react";
import { GROWTH_TYPE_LABELS, isAutoReward } from "@/lib/growth-type-labels";

interface GrowthLog {
  id: string;
  type: string;
  value: number;
  reason: string | null;
  refType: string | null;
  refId: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    levelKey: string | null;
    growthValue: number;
  };
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const LEVEL_LABELS: Record<string, string> = {
  lv1: "Lv.1 新手",
  lv2: "Lv.2 进阶",
  lv3: "Lv.3 精英",
  lv4: "Lv.4 大师",
  lv5: "Lv.5 传奇",
};

export default function GrowthLogsClient({
  initialLogs,
  initialPagination,
  initialType,
  initialEmail,
  allTypes,
}: {
  initialLogs: GrowthLog[];
  initialPagination: Pagination;
  initialType: string;
  initialEmail: string;
  allTypes?: { type: string; _count: number }[];
}) {
  const [logs, setLogs] = useState<GrowthLog[]>(initialLogs);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [emailFilter, setEmailFilter] = useState(initialEmail);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (p: number, t: string, e: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p.toString(), pageSize: "20" });
      if (t) params.set("type", t);
      if (e) params.set("email", e);
      const res = await fetch(`/api/admin/growth-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    fetchData(1, typeFilter, emailFilter);
  };

  const handlePage = (newPage: number) => {
    fetchData(newPage, typeFilter, emailFilter);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 text-sm text-emerald-100 mb-2">
          <Link href="/admin" className="hover:text-white transition-colors">
            管理后台
          </Link>
          <span>/</span>
          <span className="text-white font-medium">成长日志</span>
        </div>
        <h1 className="text-xl font-extrabold flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> 成长值流水审计
        </h1>
        <p className="text-sm text-emerald-100 mt-1">
          查看所有用户的成长值变动记录，含签到、审核、后台调整
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">按用户邮箱搜索</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="搜索邮箱..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm min-h-[44px]"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <label className="text-xs text-gray-500 mb-1 block">按类型筛选</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]"
            >
              <option value="">全部类型</option>
              {allTypes?.map(t => (
                <option key={t.type} value={t.type}>
                  {GROWTH_TYPE_LABELS[t.type] || t.type} ({t._count})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors min-h-[44px]"
            >
              搜索
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-500">
        共 <span className="font-bold text-gray-900">{pagination.total}</span> 条记录
        {typeFilter && ` · 类型: ${GROWTH_TYPE_LABELS[typeFilter] || typeFilter}`}
        {emailFilter && ` · 用户: ${emailFilter}`}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">时间</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">用户</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">等级</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">当前成长值</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">类型</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">数值</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">原因</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">来源</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">暂无成长日志记录</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("zh-CN", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium max-w-[150px] truncate">{log.user.email}</div>
                      {log.user.name && <div className="text-xs text-gray-400">{log.user.name}</div>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {log.user.levelKey ? (LEVEL_LABELS[log.user.levelKey] || log.user.levelKey) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-medium text-emerald-600">{log.user.growthValue}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{GROWTH_TYPE_LABELS[log.type] || log.type}</span>
                        {isAutoReward(log.type) && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded" title="自动奖励">
                            自动
                          </span>
                        )}
                        {!isAutoReward(log.type) && (
                          <span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded" title="手动调整">
                            手动
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-medium ${log.value >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {log.value >= 0 ? "+" : ""}{log.value}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs max-w-[150px] truncate">
                      {log.reason || "—"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">
                      {log.refType && log.refId ? (
                        <span className="font-mono">{log.refType}:{log.refId.slice(0, 8)}...</span>
                      ) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            第 {pagination.page} / {pagination.totalPages} 页，共 {pagination.total} 条
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 min-h-[36px]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 min-h-[36px]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-400 py-4">加载中...</div>
      )}
    </div>
  );
}
