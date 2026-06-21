"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ListChecks, Plus, Edit2, Trash2, AlertCircle, CheckCircle, Loader2, Search } from "lucide-react";

type ChecklistStep = { title?: string; description?: string; optional?: boolean; toolLink?: string };

type Checklist = {
  id: string; slug: string; title: string; summary: string | null;
  steps: ChecklistStep[]; status: string; sortOrder: number;
  publishedAt: string | null; createdAt: string; updatedAt: string;
};

const STATUS_OPTIONS = [
  { value: "published", label: "已发布", color: "bg-green-100 text-green-700" },
  { value: "draft", label: "草稿", color: "bg-amber-100 text-amber-700" },
  { value: "archived", label: "已归档", color: "bg-gray-100 text-gray-600" },
];

export default function ChecklistsListClient({ checklists: initialChecklists }: { checklists: Checklist[] }) {
  const [checklists, setChecklists] = useState<Checklist[]>(initialChecklists);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchChecklists = useCallback(async (status: string, search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status && status !== "all") params.set("status", status);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/checklists?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setChecklists(data as Checklist[]);
    } catch {
      // keep existing list on fetch error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchChecklists(statusFilter, searchTerm), 300);
    return () => clearTimeout(t);
  }, [statusFilter, searchTerm, fetchChecklists]);

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此清单？此操作不可撤销。")) return;
    setDeleting(id);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch(`/api/admin/checklists/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "删除失败");
      setChecklists(checklists.filter((c) => c.id !== id));
      setMessage({ type: "success", text: "已删除" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setDeleting(null);
    }
  };

  const stepCount = (c: Checklist) => (Array.isArray(c.steps) ? c.steps.length : 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ListChecks className="w-6 h-6 text-teal-600" />
          <h1 className="text-xl font-bold text-gray-900">清单管理</h1>
        </div>
        <Link
          href="/admin/content/checklists/new"
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 min-h-[44px]"
        >
          <Plus className="w-4 h-4" /> 新建清单
        </Link>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${
            message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {message.type === "error" ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 bg-white min-h-[44px]"
        >
          <option value="all">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
          <option value="archived">已归档</option>
        </select>
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
            placeholder="搜索标题或 slug..."
          />
        </div>
        {loading && <Loader2 className="w-4 h-4 text-teal-400 animate-spin self-center" />}
      </div>

      {/* Checklists table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">标题</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">slug</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">步骤数</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">状态</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">更新时间</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {checklists.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  暂无清单，点击上方「新建清单」创建
                </td>
              </tr>
            ) : (
              checklists.map((c) => {
                const statusInfo = STATUS_OPTIONS.find((s) => s.value === c.status);
                const updated = c.updatedAt
                  ? new Date(c.updatedAt).toLocaleDateString("zh-CN")
                  : "—";
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{c.title}</div>
                      {c.summary && (
                        <div className="text-xs text-gray-400 truncate max-w-xs">{c.summary}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell font-mono text-xs">
                      /{c.slug}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{stepCount(c)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusInfo?.color || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {statusInfo?.label || c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">{updated}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/content/checklists/${c.id}/edit`}
                          className="p-1.5 rounded hover:bg-gray-100"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleting === c.id}
                          className="p-1.5 rounded hover:bg-red-50 disabled:opacity-50"
                          title="删除"
                        >
                          {deleting === c.id ? (
                            <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-400" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
