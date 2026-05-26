"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText, Edit3, Trash2, Clock,
  ChevronRight, Home, Loader2, Building2,
  Plus, X, ArrowLeft,
  Receipt, Tag, Package, FileBadge, ClipboardList, Shield,
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
  shipping_label: "/tools/documents/shipping-label",
  quote_sheet: "/tools/quote-sheet",
  inbound_receipt: "/tools/inbound-receipt",
  handover_note: "/tools/handover-note",
  debit_note: "/tools/debit-note",
  video_script_sop: "/tools/video-script-sop",
};

const DOCUMENT_TOOLS = [
  { icon: FileText, label: "商业发票", sub: "Commercial Invoice", href: "/tools/documents/commercial-invoice", color: "teal" },
  { icon: Tag, label: "形式发票", sub: "Proforma Invoice", href: "/tools/documents/proforma-invoice", color: "blue" },
  { icon: Package, label: "装箱单", sub: "Packing List", href: "/tools/documents/packing-list", color: "purple" },
  { icon: FileBadge, label: "销售合同", sub: "Sales Contract", href: "/tools/documents/sales-contract", color: "indigo" },
  { icon: ClipboardList, label: "订舱委托书", sub: "Booking Form", href: "/tools/documents/booking-form", color: "orange" },
  { icon: Shield, label: "报关资料", sub: "Customs Docs", href: "/tools/documents/customs-declaration-authorization", color: "red" },
  { icon: Receipt, label: "唛头标签", sub: "Shipping Label", href: "/tools/documents/shipping-label", color: "teal" },
];

const colorMap: Record<string, { bg: string; icon: string; hover: string }> = {
  teal: { bg: "bg-teal-50", icon: "text-teal-600", hover: "hover:border-teal-300" },
  blue: { bg: "bg-blue-50", icon: "text-blue-600", hover: "hover:border-blue-300" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", hover: "hover:border-purple-300" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", hover: "hover:border-indigo-300" },
  orange: { bg: "bg-orange-50", icon: "text-orange-600", hover: "hover:border-orange-300" },
  red: { bg: "bg-red-50", icon: "text-red-600", hover: "hover:border-red-300" },
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
  const [showNewDocPicker, setShowNewDocPicker] = useState(false);

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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (loginRequired) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
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
    <div className="bg-[#F5F5F7]">
      {/* ===== TOOLBAR (h-14) ===== */}
      <div className="bg-white border-b sticky top-0 z-40" style={{ height: '56px' }}>
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/workbench" className="text-sm text-gray-500 hover:text-teal-600 flex items-center gap-1 min-h-[44px]">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-5 w-px bg-gray-200" />
            <div>
              <h1 className="font-semibold text-gray-900 text-sm leading-tight">我的单据</h1>
              <p className="text-[11px] text-gray-400 leading-tight">{drafts.length} 份草稿</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewDocPicker(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors min-h-[36px]"
          >
            <Plus className="w-3.5 h-3.5" /> 新建单据
          </button>
        </div>
      </div>

      {/* ===== NEW DOCUMENT PICKER MODAL ===== */}
      {showNewDocPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={() => setShowNewDocPicker(false)}>
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="font-bold text-gray-900">选择单据类型</h2>
              <button onClick={() => setShowNewDocPicker(false)} className="p-1 hover:bg-gray-100 rounded-lg min-h-[44px]">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DOCUMENT_TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  const c = colorMap[tool.color] || colorMap.teal;
                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className={`group flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-white ${c.hover} hover:shadow-md transition-all`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0 ${c.icon} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{tool.label}</p>
                        <p className="text-xs text-gray-400">{tool.sub}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-5">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
            {error}
            <button onClick={() => fetchDrafts(filterToolKey || undefined)} className="ml-2 underline font-medium">重试</button>
          </div>
        )}

        {/* Filter pills */}
        {drafts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-gray-400 mr-1">筛选：</span>
              <button
                onClick={() => setFilterToolKey("")}
                className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all ${!filterToolKey ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                全部
              </button>
              {Object.entries(TOOL_KEY_LABELS).map(([key, label]) => {
                const count = drafts.filter(d => d.toolKey === key).length;
                if (count === 0) return null;
                return (
                  <button
                    key={key}
                    onClick={() => setFilterToolKey(key)}
                    className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all ${filterToolKey === key ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  >
                    {label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Draft List */}
        {drafts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-2">暂无单据草稿</p>
            <p className="text-sm text-gray-400 mb-6">点击下方按钮选择单据类型开始创建</p>
            <button
              onClick={() => setShowNewDocPicker(true)}
              className="inline-flex items-center gap-2 px-5 py-3 min-h-[48px] bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> 新建单据
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {drafts.map((draft) => {
              const href = TOOL_KEY_HREFS[draft.toolKey];
              return (
                <div key={draft.id} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-4 hover:border-teal-200 transition-colors shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900 truncate">{draft.title}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium shrink-0">
                            {TOOL_KEY_LABELS[draft.toolKey] || draft.toolKey}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(draft.updatedAt)}
                          </span>
                          {draft.companyProfileId && (
                            <span className="flex items-center gap-1 text-teal-600">
                              <Building2 className="w-3 h-3" />
                              已关联公司
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {href && (
                        <Link
                          href={`${href}?draftId=${draft.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs text-white bg-teal-600 rounded-lg hover:bg-teal-700 font-medium"
                        >
                          <Edit3 className="w-3 h-3" /> 打开
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(draft.id)}
                        disabled={deletingId === draft.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-2 min-h-[40px] text-xs text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                      >
                        {deletingId === draft.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
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
