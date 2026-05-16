"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, EyeOff, Filter, Star } from "lucide-react";

interface Review {
  id: string;
  toolKey: string;
  rating: number;
  content: string;
  status: string;
  pointsAwarded: boolean;
  createdAt: string;
  userEmail: string;
  userName: string;
}

const STATUS_TABS = [
  { value: "", label: "全部" },
  { value: "pending", label: "待审核" },
  { value: "approved", label: "已通过" },
  { value: "rejected", label: "已拒绝" },
  { value: "hidden", label: "已隐藏" },
];

export default function AdminToolReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [acting, setActing] = useState<string | null>(null);

  const fetchReviews = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const url = status ? `/api/admin/tool-reviews?status=${status}` : "/api/admin/tool-reviews";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(statusFilter);
  }, [statusFilter, fetchReviews]);

  const handleAction = async (id: string, status: string) => {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/tool-reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      alert("操作失败");
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">短评审核</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              statusFilter === tab.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Review list */}
      {loading ? (
        <div className="text-center text-gray-500 py-8">加载中...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center text-gray-400 py-8">暂无短评</div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{r.toolKey}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        r.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : r.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : r.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.status}
                    </span>
                    {r.pointsAwarded && (
                      <span className="text-xs text-green-600">+10 积分已发放</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{r.content}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{r.userEmail}</span>
                    <span>{new Date(r.createdAt).toLocaleString("zh-CN")}</span>
                  </div>
                </div>

                {/* Actions */}
                {r.status === "pending" && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAction(r.id, "approved")}
                      disabled={acting === r.id}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 disabled:opacity-50"
                      title="通过"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAction(r.id, "rejected")}
                      disabled={acting === r.id}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50"
                      title="拒绝"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAction(r.id, "hidden")}
                      disabled={acting === r.id}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                      title="隐藏"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
