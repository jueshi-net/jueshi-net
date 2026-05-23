'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText, Edit3, Trash2, Loader2, Building2, Clock,
  Plus,
} from 'lucide-react';

const TOOL_KEY_LABELS: Record<string, string> = {
  commercial_invoice: '外贸发票',
  shipping_label: '唛头标签',
  quote_sheet: '供应链报价单',
  inbound_receipt: '商品入库单',
  handover_note: '出货交接单',
  debit_note: 'Debit Note',
  video_script_sop: '短视频 SOP 脚本',
};

const TOOL_KEY_HREFS: Record<string, string> = {
  commercial_invoice: '/tools/commercial-invoice',
  shipping_label: '/tools/shipping-label',
  quote_sheet: '/tools/quote-sheet',
  inbound_receipt: '/tools/inbound-receipt',
  handover_note: '/tools/handover-note',
  debit_note: '/tools/debit-note',
  video_script_sop: '/tools/video-script-sop',
};

interface Draft {
  id: string;
  toolKey: string;
  title: string;
  companyProfileId: string | null;
  createdAt: string;
  updatedAt: string;
}

const MOCK_DRAFTS: Draft[] = [
  { id: '1', toolKey: 'commercial_invoice', title: '2026Q1 美国订单发票', companyProfileId: 'cp1', createdAt: '2026-05-20T10:00:00Z', updatedAt: '2026-05-22T14:30:00Z' },
  { id: '2', toolKey: 'shipping_label', title: '欧洲FBA外箱唛头', companyProfileId: null, createdAt: '2026-05-18T08:00:00Z', updatedAt: '2026-05-21T09:15:00Z' },
  { id: '3', toolKey: 'quote_sheet', title: '东南亚物流报价单', companyProfileId: 'cp1', createdAt: '2026-05-15T16:00:00Z', updatedAt: '2026-05-20T11:00:00Z' },
];

export default function DocumentsClientInner() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(false);
  const [filterToolKey, setFilterToolKey] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchDrafts = useCallback(async (toolKey?: string) => {
    setLoading(true);
    try {
      const url = toolKey ? `/api/me/tool-documents?toolKey=${toolKey}` : '/api/me/tool-documents';
      const res = await fetch(url);
      if (res.status === 401) { setLoginRequired(true); setLoading(false); return; }
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      setDrafts(data.data?.length ? data.data : MOCK_DRAFTS);
    } catch {
      setDrafts(MOCK_DRAFTS);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDrafts(filterToolKey || undefined); }, [fetchDrafts, filterToolKey]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); }
  }, [toast]);

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这个草稿吗？')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/me/tool-documents/${id}`, { method: 'DELETE' });
      if (res.ok) { setDrafts(p => p.filter(d => d.id !== id)); setToast('🗑️ 已删除'); }
      else setToast('删除失败');
    } catch { setToast('删除失败'); }
    finally { setDeletingId(null); }
  };

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-teal-600 mr-2" />
      <span className="text-sm text-gray-400">加载中...</span>
    </div>
  );

  if (loginRequired) return (
    <div className="bg-white rounded-2xl border border-gray-100/80 p-10 text-center max-w-sm mx-auto">
      <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <h2 className="text-base font-bold text-gray-900 mb-1">请先登录</h2>
      <p className="text-sm text-gray-400 mb-4">查看单据草稿需要登录</p>
      <Link href="/login" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors w-full">前往登录</Link>
    </div>
  );

  return (
    <div>
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg bg-white/90 border border-gray-100">{toast}</div>
      )}

      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">📦</span>
        <div>
          <h1 className="text-base font-bold text-gray-900 tracking-tight">我的单据</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">{drafts.length} 份草稿</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-100/80 p-3 mb-4">
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilterToolKey('')} className={`px-2.5 py-1.5 text-[11px] rounded-lg font-medium transition-all ${!filterToolKey ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
            全部
          </button>
          {Object.entries(TOOL_KEY_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => setFilterToolKey(key)} className={`px-2.5 py-1.5 text-[11px] rounded-lg font-medium transition-all ${filterToolKey === key ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Draft List */}
      {drafts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100/80 p-12 text-center">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium mb-1">暂无单据草稿</p>
          <p className="text-xs text-gray-400 mb-4">在单据工具中保存草稿即可在此查看</p>
          <Link href="/tools/commercial-invoice" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> 新建单据
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {drafts.map(draft => {
            const href = TOOL_KEY_HREFS[draft.toolKey];
            return (
              <div key={draft.id} className="bg-white rounded-xl border border-gray-100/80 p-4 hover:border-gray-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 ring-1 ring-teal-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 truncate">{draft.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">{TOOL_KEY_LABELS[draft.toolKey]}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                      <Clock className="w-3 h-3" /> {fmtDate(draft.updatedAt)}
                      {draft.companyProfileId && <><Building2 className="w-3 h-3" /> 已关联公司</>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {href && (
                      <Link href={`${href}?draftId=${draft.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] text-white bg-teal-600 rounded-lg hover:bg-teal-700 font-medium transition-colors">
                        <Edit3 className="w-3 h-3" /> 打开
                      </Link>
                    )}
                    <button onClick={() => handleDelete(draft.id)} disabled={deletingId === draft.id} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors">
                      {deletingId === draft.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
