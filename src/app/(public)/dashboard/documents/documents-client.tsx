"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, FileText, Edit3, Trash2, History,
  ChevronRight, Home, Loader2, Building2, Clock,
} from "lucide-react";

const TOOL_KEY_LABELS: Record<string, string> = {
  commercial_invoice: "外贸发票",
  shipping_label: "唛头标签",
  quote_sheet: "供应链报价单",
  inbound_receipt: "商品入库单",
  handover_note: "出货交接单",
  debit_note: "Debit Note",
  video_script_sop: "短视频 SOP 脚本",
};

const TOOL_KEY_HREFS: Record<string, string> = {
  commercial_invoice: "/tools/commercial-invoice",
  shipping_label: "/tools/shipping-label",
  quote_sheet: "/tools/quote-sheet",
  inbound_receipt: "/tools/inbound-receipt",
  handover_note: "/tools/handover-note",
  debit_note: "/tools/debit-note",
  video_script_sop: "/tools/video-script-sop",
};

interface Draft {
  id: string;
  toolKey: string;
  title: string;
  companyProfileId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsClient() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(false);
  const [filterToolKey, setFilterToolKey] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = useCallback(async (toolKey?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = toolKey ? `/api/me/tool-documents?toolKey=${toolKey}` : "/api/me/tool-documents";
      const res = await fetch(url);
      if (res.status === 401) {
        setLoginRequired(true);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("加载失败，请重试");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setDrafts(data.data || []);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts(filterToolKey || undefined);
  }, [fetchDrafts, filterToolKey]);

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这个草稿吗？删除后历史版本也会一起删除。")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/me/tool-documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDrafts((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert("删除失败");
      }
    } catch {
      alert("删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-teal-600" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (loginRequired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">请先登录</h1>
          <p className="text-gray-500 mb-6">查看和管理单据草稿需要登录后使用</p>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors w-full">
            前往登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 via-blue-800 to-teal-700 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8 pb-8 md:pt-12 md:pb-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-teal-100 mb-4 min-h-[44px]">
            <Link href="/" className="hover:text-white transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> 首页
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/dashboard" className="hover:text-white transition-colors">我的工作台</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">我的单据</span>
          </nav>

          <h1 className="text-2xl md:text-3xl font-extrabold mb-2 flex items-center gap-3">
            <FileText className="w-7 h-7" />
            我的单据草稿
          </h1>
          <p className="text-teal-100/90 text-sm md:text-base max-w-xl">
            管理你保存的所有单据草稿，点击「打开」可继续编辑
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 pb-16">
        {/* Filter */}
        <div className="bg-white rounded-xl border shadow-sm p-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 font-medium mr-1">筛选：</span>
            <button
              onClick={() => setFilterToolKey("")}
              className={`px-3 py-2 min-h-[44px] text-xs rounded-lg font-medium transition-all ${!filterToolKey ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              全部 ({drafts.length})
            </button>
            {Object.entries(TOOL_KEY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilterToolKey(key)}
                className={`px-3 py-2 min-h-[44px] text-xs rounded-lg font-medium transition-all ${filterToolKey === key ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
            {error}
            <button onClick={() => fetchDrafts(filterToolKey || undefined)} className="ml-2 underline font-medium">重试</button>
          </div>
        )}

        {/* Draft List */}
        {drafts.length === 0 ? (
          <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-2">暂无单据草稿</p>
            <p className="text-sm text-gray-400 mb-4">在单据工具中填写内容并点击「保存草稿」即可在这里看到</p>
            <Link href="/tools/document-tools" className="inline-flex items-center gap-2 px-5 py-3 min-h-[48px] bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors">
              前往单据工具箱
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => {
              const href = TOOL_KEY_HREFS[draft.toolKey];
              return (
                <div key={draft.id} className="bg-white rounded-xl border shadow-sm p-4 sm:p-5 hover:border-teal-200 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Icon + Info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-gray-900 truncate">{draft.title}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium shrink-0">
                            {TOOL_KEY_LABELS[draft.toolKey] || draft.toolKey}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            更新于 {formatDate(draft.updatedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            创建于 {formatDate(draft.createdAt)}
                          </span>
                          {draft.companyProfileId && (
                            <span className="flex items-center gap-1 text-teal-600">
                              <Building2 className="w-3 h-3" />
                              已关联公司资料
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {href && (
                        <Link
                          href={`${href}?draftId=${draft.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 font-medium"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> 打开
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(draft.id)}
                        disabled={deletingId === draft.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
                      >
                        {deletingId === draft.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} 删除
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
