'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText, Edit3, Trash2, Loader2, Building2, Clock,
  Plus, X, ArrowLeft, Search, BarChart3, Filter, Calendar,
} from 'lucide-react';
import {
  documentTools, getToolHref, getToolIcon, getToolColor,
  categoryLabels, onlineToolCount,
} from '@/lib/document-tools-config';
import { MetricCard } from '@/components/saas/MetricCard';
import { SectionCard } from '@/components/saas/SectionCard';
import { WorkspacePageHeader } from '@/components/saas/WorkspacePageHeader';
import { StatusBadge } from '@/components/saas/StatusBadge';
import { CompactTable } from '@/components/saas/CompactTable';
import { SaasEmptyState } from '@/components/saas/SaasEmptyState';

const TOOL_KEY_LABELS: Record<string, string> = {
  commercial_invoice: '外贸发票',
  shipping_label: '唛头标签',
  quote_sheet: '供应链报价单',
  inbound_receipt: '商品入库单',
  handover_note: '出货交接单',
  debit_note: 'Debit Note',
  video_script_sop: '短视频 SOP 脚本',
  proforma_invoice: '形式发票',
  packing_list: '装箱单',
  sales_contract: '销售合同',
  booking_instruction: '订舱委托书',
  customs_declaration_authorization: '报关委托书',
  delivery_note: '送货单',
  freight_statement: '运费对账单',
  consolidation_inbound_receipt: '集运入库单',
  consolidation_packing_list: '集运合箱清单',
  express_declaration: '快递申报单',
  quotation: '通用报价单',
  shipping_instruction: '提单补料',
  trucking_dispatch_order: '拖车派车单',
  shipping_mark: '唛头模板',
  container_loading_list: '装柜明细单',
  return_packing_list: '退货装箱清单',
  certificate_of_origin_template: '原产地证模板',
  fumigation_certificate_template: '熏蒸证明模板',
  letter_of_credit_info_sheet: '信用证资料单',
  label_maker: '唛头/标签生成器',
  'quote-sheet': '供应链报价单',
  'handover-note': '出货交接单',
  'debit-note': 'Debit Note',
};

const TOOL_KEY_HREFS: Record<string, string> = {
  commercial_invoice: '/tools/commercial-invoice',
  shipping_label: '/tools/documents/shipping-label',
  quote_sheet: '/tools/documents/quotation',
  inbound_receipt: '/tools/inbound-receipt',
  handover_note: '/tools/handover-note',
  debit_note: '/tools/debit-note',
  video_script_sop: '/tools/video-script-sop',
  proforma_invoice: '/tools/documents/proforma-invoice',
  packing_list: '/tools/documents/packing-list',
  sales_contract: '/tools/documents/sales-contract',
  booking_instruction: '/tools/documents/booking-instruction',
  customs_declaration_authorization: '/tools/documents/customs-declaration-authorization',
  delivery_note: '/tools/documents/delivery-note',
  freight_statement: '/tools/documents/freight-statement',
  consolidation_inbound_receipt: '/tools/documents/consolidation-inbound-receipt',
  consolidation_packing_list: '/tools/documents/consolidation-packing-list',
  express_declaration: '/tools/documents/express-declaration',
  quotation: '/tools/documents/quotation',
  shipping_instruction: '/tools/documents/shipping-instruction',
  trucking_dispatch_order: '/tools/documents/trucking-dispatch-order',
  shipping_mark: '/tools/documents/shipping-mark',
  container_loading_list: '/tools/documents/container-loading-list',
  return_packing_list: '/tools/documents/return-packing-list',
  certificate_of_origin_template: '/tools/documents/certificate-of-origin-template',
  fumigation_certificate_template: '/tools/documents/fumigation-certificate-template',
  letter_of_credit_info_sheet: '/tools/documents/letter-of-credit-info-sheet',
  label_maker: '/tools/documents/shipping-label',
  'quote-sheet': '/tools/documents/quotation',
  'handover-note': '/tools/handover-note',
  'debit-note': '/tools/debit-note',
};

interface Draft {
  id: string;
  toolKey: string;
  title: string;
  companyProfileId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsClientInner() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(false);
  const [filterToolKey, setFilterToolKey] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNewDocPicker, setShowNewDocPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');

  const fetchDrafts = useCallback(async (toolKey?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = toolKey ? `/api/me/tool-documents?toolKey=${toolKey}` : '/api/me/tool-documents';
      const res = await fetch(url);
      if (res.status === 401) {
        setLoginRequired(true);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError('加载失败，请重试');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setDrafts(data.data || []);
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts(filterToolKey || undefined);
  }, [fetchDrafts, filterToolKey]);

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这个草稿吗？')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/me/tool-documents/${id}`, { method: 'DELETE' });
      if (res.ok) setDrafts((prev) => prev.filter((d) => d.id !== id));
      else alert('删除失败');
    } catch {
      alert('删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const getDaysSinceUpdate = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    return Math.floor(diff / (24 * 60 * 60 * 1000));
  };

  // Compute stats
  const toolTypeCount = new Set(drafts.map(d => d.toolKey)).size;
  const withCompany = drafts.filter(d => d.companyProfileId).length;
  const recentCount = drafts.filter(d => {
    const diff = Date.now() - new Date(d.updatedAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000; // last 7 days
  }).length;

  // Filter by date
  const filteredByDate = drafts.filter(d => {
    if (dateFilter === 'all') return true;
    const days = getDaysSinceUpdate(d.updatedAt);
    if (dateFilter === '7d') return days <= 7;
    if (dateFilter === '30d') return days <= 30;
    if (dateFilter === '90d') return days <= 90;
    return true;
  });

  // Filter tools for the picker modal
  const filteredTools = documentTools.filter(t => {
    if (!t.isOnline) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      if (!t.titleZh.toLowerCase().includes(s) && !t.titleEn.toLowerCase().includes(s) && !t.description.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  // Table columns for CompactTable
  const tableColumns = [
    {
      key: 'title',
      header: '标题',
      render: (draft: Draft) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <span className="font-medium text-gray-900 truncate">{draft.title}</span>
        </div>
      ),
    },
    {
      key: 'toolKey',
      header: '类型',
      render: (draft: Draft) => (
        <StatusBadge
          label={TOOL_KEY_LABELS[draft.toolKey] || draft.toolKey}
          variant="info"
          size="sm"
        />
      ),
    },
    {
      key: 'companyProfileId',
      header: '关联',
      render: (draft: Draft) => (
        draft.companyProfileId ? (
          <StatusBadge label="已关联" variant="success" size="sm" dot />
        ) : (
          <span className="text-xs text-gray-400">未关联</span>
        )
      ),
    },
    {
      key: 'updatedAt',
      header: '更新时间',
      render: (draft: Draft) => {
        const days = getDaysSinceUpdate(draft.updatedAt);
        const variant = days <= 1 ? 'success' : days <= 7 ? 'info' : 'neutral';
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="w-3 h-3 text-gray-400" />
            <span>{formatDate(draft.updatedAt)}</span>
            <StatusBadge
              label={days === 0 ? '今天' : days <= 7 ? `${days}天前` : `${days}天前`}
              variant={variant}
              size="sm"
            />
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '操作',
      align: 'right' as const,
      render: (draft: Draft) => {
        const href = TOOL_KEY_HREFS[draft.toolKey];
        return (
          <div className="flex items-center gap-1 justify-end">
            {href && (
              <Link
                href={`${href}?draftId=${draft.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-white bg-teal-600 rounded-lg hover:bg-teal-700 font-medium transition-colors"
              >
                <Edit3 className="w-3 h-3" /> 打开
              </Link>
            )}
            <button
              onClick={() => handleDelete(draft.id)}
              disabled={deletingId === draft.id}
              className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
            >
              {deletingId === draft.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        );
      },
    },
  ];

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
      <SaasEmptyState
        variant="no-access"
        title="请先登录"
        description="查看和管理单据草稿需要登录后使用"
        primaryAction={{ label: '前往登录', href: '/login' }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <WorkspacePageHeader
        title="我的单据"
        subtitle="管理所有单据草稿，快速编辑和创建"
        icon={<FileText className="w-5 h-5" />}
        breadcrumbs={[
          { label: '工作台', href: '/workspace' },
          { label: '我的单据' },
        ]}
        actions={
          <button
            onClick={() => { setShowNewDocPicker(true); setSearchTerm(''); setFilterCategory('all'); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> 新建单据
          </button>
        }
      />

      <div className="px-6 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="总草稿数"
            value={drafts.length}
            icon={<FileText className="w-5 h-5" />}
          />
          <MetricCard
            label="单据类型"
            value={toolTypeCount}
            icon={<BarChart3 className="w-5 h-5" />}
          />
          <MetricCard
            label="近7天更新"
            value={recentCount}
            icon={<Clock className="w-5 h-5" />}
            trend={{ value: `${Math.round((recentCount / Math.max(drafts.length, 1)) * 100)}%`, positive: recentCount > 0 }}
          />
          <MetricCard
            label="关联公司"
            value={withCompany}
            icon={<Building2 className="w-5 h-5" />}
          />
        </div>

        {/* Filter + Actions Bar */}
        <SectionCard
          title="筛选与搜索"
          action={
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">全部时间</option>
                <option value="7d">近7天</option>
                <option value="30d">近30天</option>
                <option value="90d">近90天</option>
              </select>
            </div>
          }
        >
          {drafts.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-gray-400 mr-1">按类型：</span>
                <button
                  onClick={() => setFilterToolKey('')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${!filterToolKey ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  全部
                </button>
                {Object.entries(TOOL_KEY_LABELS).map(([key, label]) => {
                  const count = drafts.filter(d => d.toolKey === key).length;
                  if (count === 0) return null;
                  return (
                    <button key={key} onClick={() => setFilterToolKey(key)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${filterToolKey === key ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {label} ({count})
                    </button>
                  );
                })}
              </div>
              {filteredByDate.length !== drafts.length && (
                <p className="text-xs text-gray-500">
                  显示 {filteredByDate.length} / {drafts.length} 条记录
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">暂无草稿，点击上方按钮创建第一份单据</p>
          )}
        </SectionCard>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
            <button onClick={() => fetchDrafts(filterToolKey || undefined)} className="ml-2 underline font-medium">重试</button>
          </div>
        )}

        {/* Draft List - CompactTable */}
        {filteredByDate.length === 0 ? (
          <SaasEmptyState
            variant="no-data"
            title="暂无单据草稿"
            description="点击下方按钮选择单据类型开始创建"
            primaryAction={{
              label: '新建单据',
              onClick: () => { setShowNewDocPicker(true); setSearchTerm(''); setFilterCategory('all'); },
            }}
          />
        ) : (
          <SectionCard title={`草稿列表 (${filteredByDate.length})`}>
            <CompactTable
              columns={tableColumns}
              data={filteredByDate}
              density="compact"
              striped
              hoverable
              rowKey={(row) => row.id}
            />
          </SectionCard>
        )}

        {/* NEW DOCUMENT PICKER MODAL */}
        {showNewDocPicker && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={() => setShowNewDocPicker(false)}>
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[85vh] overflow-hidden shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Modal header */}
              <div className="border-b px-5 py-4 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="font-bold text-gray-900">选择单据类型</h2>
                  <p className="text-xs text-gray-400 mt-0.5">共 {onlineToolCount} 种单据工具</p>
                </div>
                <button onClick={() => setShowNewDocPicker(false)} className="p-1 hover:bg-gray-100 rounded-lg min-h-[44px]">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Search + filter */}
              <div className="border-b px-5 py-3 space-y-2 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索单据名称..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${filterCategory === 'all' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    全部 ({filteredTools.length})
                  </button>
                  {Object.entries(categoryLabels).map(([key, label]) => {
                    const count = documentTools.filter(t => t.isOnline && t.category === key).length;
                    if (count === 0) return null;
                    return (
                      <button key={key} onClick={() => setFilterCategory(key)}
                        className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${filterCategory === key ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {label} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tool grid */}
              <div className="overflow-y-auto flex-1 p-5">
                {filteredTools.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Search className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">未找到匹配的单据</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredTools.map((tool) => {
                      const Icon = getToolIcon(tool);
                      const colors = getToolColor(tool);
                      return (
                        <Link
                          key={tool.key}
                          href={getToolHref(tool)}
                          className={`group flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white ${colors.hover} hover:shadow-md transition-all`}
                        >
                          <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{tool.titleZh}</p>
                            <p className="text-xs text-gray-400 truncate">{tool.titleEn}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{tool.description}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
