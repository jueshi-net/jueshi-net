"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, EyeOff, Eye, Star, Loader2, RefreshCw } from "lucide-react";

interface Review {
  id: string; toolKey: string; rating: number; content: string; status: string;
  pointsAwarded: boolean; createdAt: string; userEmail: string; userName: string;
}

const STATUS_TABS = [
  { value: "pending", label: "待审核", badge: "amber" },
  { value: "approved", label: "已通过", badge: "green" },
  { value: "rejected", label: "已拒绝", badge: "red" },
  { value: "hidden", label: "已隐藏", badge: "gray" },
  { value: "", label: "全部", badge: "blue" },
];

export default function AdminToolReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [acting, setActing] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);

  const fetchReviews = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const url = status ? `/api/admin/tool-reviews?status=${status}` : "/api/admin/tool-reviews";
      const res = await fetch(url);
      if (res.ok) { const data = await res.json(); setReviews(data.reviews || []); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  // Fetch stats for pending count
  useEffect(() => {
    fetch("/api/admin/tool-reviews?status=pending").then(r => r.json()).then(d => {
      setStats(prev => ({ ...prev, pending: (d.reviews || []).length }));
    }).catch(() => {});
    fetch("/api/admin/tool-reviews?status=approved").then(r => r.json()).then(d => {
      setStats(prev => ({ ...prev, approved: (d.reviews || []).length }));
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchReviews(statusFilter); }, [statusFilter, fetchReviews]);

  const handleAction = async (id: string, status: string, label: string) => {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/tool-reviews/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (res.ok) {
        setToast(`${label}成功`);
        fetchReviews(statusFilter);
        // Refresh pending count
        fetch("/api/admin/tool-reviews?status=pending").then(r => r.json()).then(d => {
          setStats(prev => ({ ...prev, pending: (d.reviews || []).length }));
        }).catch(() => {});
      } else {
        const data = await res.json();
        setToast(data.error || "操作失败");
      }
    } catch { setToast("操作失败"); }
    finally { setActing(null); }
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-5 text-white">
        <div>
          <h1 className="text-xl font-extrabold flex items-center gap-2"><Star className="w-5 h-5" /> 短评审核</h1>
          <p className="text-sm text-amber-100 mt-1">审核用户提交的工具短评（通过/拒绝/隐藏/恢复）。共 {stats.total || reviews.length} 条。</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-amber-700">{stats.pending || reviews.filter(r => r.status === "pending").length}</div>
          <div className="text-xs text-amber-600">待审核</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-green-700">{stats.approved || reviews.filter(r => r.status === "approved").length}</div>
          <div className="text-xs text-green-600">已通过</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-red-700">{reviews.filter(r => r.status === "rejected").length}</div>
          <div className="text-xs text-red-600">已拒绝</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-gray-500">{reviews.filter(r => r.status === "hidden").length}</div>
          <div className="text-xs text-gray-400">已隐藏</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const badgeColors: Record<string, string> = { amber: "border-amber-500 bg-amber-50 text-amber-700", green: "border-green-500 bg-green-50 text-green-700", red: "border-red-500 bg-red-50 text-red-700", gray: "border-gray-300 bg-gray-50 text-gray-600", blue: "border-blue-500 bg-blue-50 text-blue-700" };
          const isActive = statusFilter === tab.value;
          return (
            <button key={tab.value} onClick={() => setStatusFilter(tab.value)} className={`px-4 py-2 text-sm rounded-lg border transition-colors min-h-[44px] ${isActive ? badgeColors[tab.badge] : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Review list */}
      {loading ? (
        <div className="text-center text-gray-500 py-16 flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> 加载中...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
          <Star className="w-14 h-14 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium text-gray-500 mb-1">暂无短评</p>
          <p className="text-sm">{statusFilter === "pending" ? "待审核的短评已全部处理完成" : "该状态下暂无短评"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className={`bg-white rounded-xl border p-4 ${r.status === "pending" ? "border-amber-300 bg-amber-50/30" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`w-4 h-4 ${i <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-900 font-mono">{r.toolKey}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "pending" ? "bg-amber-100 text-amber-700" : r.status === "approved" ? "bg-green-100 text-green-700" : r.status === "rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
                      {r.status === "pending" ? "待审核" : r.status === "approved" ? "已通过" : r.status === "rejected" ? "已拒绝" : "已隐藏"}
                    </span>
                    {r.pointsAwarded && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">+10 积分</span>}
                  </div>
                  <p className="text-sm text-gray-700 mb-2 break-words">{r.content}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{r.userEmail}</span>
                    <span>{new Date(r.createdAt).toLocaleString("zh-CN")}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  {r.status === "pending" && (
                    <>
                      <button onClick={() => handleAction(r.id, "approved", "通过")} disabled={acting === r.id} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium min-h-[44px]" title="通过">
                        {acting === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> 通过</>}
                      </button>
                      <button onClick={() => handleAction(r.id, "rejected", "拒绝")} disabled={acting === r.id} className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium min-h-[44px]" title="拒绝">
                        {acting === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4" /> 拒绝</>}
                      </button>
                      <button onClick={() => handleAction(r.id, "hidden", "隐藏")} disabled={acting === r.id} className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 text-sm min-h-[44px]" title="隐藏">
                        <EyeOff className="w-4 h-4" /> 隐藏
                      </button>
                    </>
                  )}
                  {r.status === "approved" && (
                    <button onClick={() => handleAction(r.id, "hidden", "隐藏")} disabled={acting === r.id} className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 text-sm min-h-[44px]" title="隐藏">
                      <EyeOff className="w-4 h-4" /> 隐藏
                    </button>
                  )}
                  {r.status === "rejected" && (
                    <button onClick={() => handleAction(r.id, "approved", "恢复通过")} disabled={acting === r.id} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium min-h-[44px]" title="恢复通过">
                      <RefreshCw className="w-4 h-4" /> 恢复通过
                    </button>
                  )}
                  {r.status === "hidden" && (
                    <button onClick={() => handleAction(r.id, "approved", "恢复通过")} disabled={acting === r.id} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium min-h-[44px]" title="恢复通过">
                      <Eye className="w-4 h-4" /> 恢复展示
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium bg-green-600 text-white">{toast}</div>
      )}
    </div>
  );
}
