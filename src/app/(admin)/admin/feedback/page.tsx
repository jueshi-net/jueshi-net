"use client";
import { useEffect, useState } from "react";
import { MessageSquare, CheckCircle, Clock, Eye, AlertCircle } from "lucide-react";

const statusLabels: Record<string, string> = {
  pending: "待处理",
  reviewing: "处理中",
  resolved: "已解决",
  closed: "已关闭",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  reviewing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  resolved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const typeLabels: Record<string, string> = {
  suggestion: "建议",
  bug: "Bug",
  question: "咨询",
};

const typeColors: Record<string, string> = {
  suggestion: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  bug: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  question: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
};

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    const res = await fetch("/api/feedback");
    const data = await res.json();
    setFeedbacks(data.feedbacks || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/feedback?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    fetchFeedbacks();
  };

  const filtered = filter === "all" ? feedbacks : feedbacks.filter(f => f.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64">加载中...</div>;

  const counts = {
    all: feedbacks.length,
    pending: feedbacks.filter(f => f.status === "pending").length,
    reviewing: feedbacks.filter(f => f.status === "reviewing").length,
    resolved: feedbacks.filter(f => f.status === "resolved").length,
    closed: feedbacks.filter(f => f.status === "closed").length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        反馈管理
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`p-3 rounded-lg border transition-all text-center ${
              filter === key
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p>
            <p className="text-xs text-gray-500">{statusLabels[key] || "全部"}</p>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(fb => (
          <div key={fb.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div
              onClick={() => setExpanded(expanded === fb.id ? null : fb.id)}
              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {fb.status === "resolved" ? <CheckCircle className="w-5 h-5 text-green-500" /> :
                   fb.status === "reviewing" ? <Eye className="w-5 h-5 text-blue-500" /> :
                   fb.status === "closed" ? <AlertCircle className="w-5 h-5 text-gray-400" /> :
                   <Clock className="w-5 h-5 text-yellow-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs ${typeColors[fb.type]}`}>
                      {typeLabels[fb.type]}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColors[fb.status]}`}>
                      {statusLabels[fb.status]}
                    </span>
                    <span className="text-xs text-gray-400">{fb.user?.name || fb.user?.email}</span>
                    <span className="text-xs text-gray-400">{new Date(fb.createdAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{fb.content}</p>
                </div>
              </div>
            </div>

            {expanded === fb.id && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{fb.content}</p>
                {fb.url && <p className="text-xs text-blue-600 mb-3">相关页面: {fb.url}</p>}
                <div className="flex gap-2">
                  {["pending", "reviewing", "resolved", "closed"].map(status => (
                    <button
                      key={status}
                      onClick={() => updateStatus(fb.id, status)}
                      className={`px-3 py-1.5 rounded text-xs ${
                        fb.status === status ? statusColors[status] : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">暂无反馈</div>
      )}
    </div>
  );
}
