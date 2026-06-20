'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, Trash2, Edit, Plus, Save, X, Loader2, ExternalLink, Upload, Download, FileJson, AlertCircle, Activity, Tag, Globe, Sparkles, Search } from 'lucide-react';
import { WorkspacePageHeader } from '@/components/saas/WorkspacePageHeader';
import { SectionCard } from '@/components/saas/SectionCard';
import { MetricCard } from '@/components/saas/MetricCard';
import { StatusBadge } from '@/components/saas/StatusBadge';
import { SaasEmptyState } from '@/components/saas/SaasEmptyState';

interface ResourceItem {
  id: string;
  name: string;
  url: string;
  description: string | null;
  category: string;
  tags: string[];
  sourceType: string;
  usage: string | null;
  disclaimer: string | null;
  isActive: boolean;
  sortOrder: number;
  iconUrl: string | null;
  isAd: boolean;
  qualityScore: number | null;
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
  featuredGroup: string | null;
  featuredOrder: number | null;
  featuredStartAt: string | null;
  featuredEndAt: string | null;
}

// ─── 分类管理 ──────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { value: 'tools', label: '实用工具', color: 'bg-purple-100 text-purple-700' },
  { value: 'business', label: '出海经营', color: 'bg-green-100 text-green-700' },
  { value: 'ecommerce', label: '跨境电商', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'life', label: '海外生活', color: 'bg-blue-100 text-blue-700' },
  { value: 'logistics', label: '物流追踪', color: 'bg-orange-100 text-orange-700' },
  { value: 'payment', label: '支付收款', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'templates', label: '外贸单据', color: 'bg-pink-100 text-pink-700' },
  { value: 'official', label: '官方机构', color: 'bg-red-100 text-red-700' },
  { value: 'education', label: '教育学习', color: 'bg-teal-100 text-teal-700' },
];

const SOURCE_TYPES = [
  { value: 'official', label: '官方' },
  { value: 'third-party', label: '第三方' },
  { value: 'internal', label: '内部' },
];

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState<'delete' | 'category' | 'status' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('');
  const [isAdFilter, setIsAdFilter] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', url: '', description: '', category: 'life',
    tags: '', sourceType: 'third-party', usage: '', disclaimer: '',
    isActive: true, sortOrder: 0, iconUrl: '', isAd: false,
    isFeatured: false, featuredGroup: '', featuredOrder: 0,
    featuredStartAt: '', featuredEndAt: '',
  });
  const [saving, setSaving] = useState(false);

  const [showImportExport, setShowImportExport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [exporting, setExporting] = useState(false);

  // ─── 分类管理状态 ──────────────────────────────────────────────────────
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCatValue, setNewCatValue] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');

  // ─── 死链检测状态 ─────────────────────────────────────────────────────
  const [checkingLinks, setCheckingLinks] = useState(false);
  const [linkResults, setLinkResults] = useState<Record<string, { status: number | null; ok: boolean; error?: string }>>({});
  const abortRef = useRef(false);

  // ─── 质量检查状态 ─────────────────────────────────────────────────────
  const [showQualityCheck, setShowQualityCheck] = useState(false);
  const [qualityReport, setQualityReport] = useState<any>(null);
  const [runningQualityCheck, setRunningQualityCheck] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    setLoading(true); setError(null);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (search) params.set('search', search);
    if (categoryFilter) params.set('category', categoryFilter);
    if (sourceTypeFilter) params.set('sourceType', sourceTypeFilter);
    if (isAdFilter) params.set('isAd', isAdFilter);
    if (sortBy) params.set('sortBy', sortBy);

    try {
      const res = await fetch(`/api/resources?${params}`);
      const data = await res.json();
      setResources(data.resources || []);
      setTotal(data.total || 0);
    } catch { setError('加载资源失败'); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { fetchResources(); }, [page, search, categoryFilter, sourceTypeFilter, isAdFilter, sortBy]);

  const openCreate = () => {
    setEditingId(null);
    setFormData({ name: '', url: '', description: '', category: 'life', tags: '', sourceType: 'third-party', usage: '', disclaimer: '', isActive: true, sortOrder: 0, iconUrl: '', isAd: false, isFeatured: false, featuredGroup: '', featuredOrder: 0, featuredStartAt: '', featuredEndAt: '' });
    setShowModal(true);
  };

  const openEdit = (r: ResourceItem) => {
    setEditingId(r.id);
    setFormData({
      name: r.name || '', url: r.url || '', description: r.description || '',
      category: r.category || 'life', tags: (r.tags || []).join(', '),
      sourceType: r.sourceType || 'third-party', usage: r.usage || '',
      disclaimer: r.disclaimer || '', isActive: r.isActive !== false,
      sortOrder: r.sortOrder || 0, iconUrl: r.iconUrl || '', isAd: r.isAd || false,
      isFeatured: r.isFeatured || false, featuredGroup: r.featuredGroup || '',
      featuredOrder: r.featuredOrder || 0,
      featuredStartAt: r.featuredStartAt ? new Date(r.featuredStartAt).toISOString().slice(0, 16) : '',
      featuredEndAt: r.featuredEndAt ? new Date(r.featuredEndAt).toISOString().slice(0, 16) : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.url) return;
    setSaving(true);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/resources?id=${editingId}` : '/api/resources';
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        featuredStartAt: formData.featuredStartAt ? new Date(formData.featuredStartAt).toISOString() : null,
        featuredEndAt: formData.featuredEndAt ? new Date(formData.featuredEndAt).toISOString() : null,
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) { setShowModal(false); fetchResources(); }
      else alert(data.error);
    } catch { alert('保存失败'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？此操作不可恢复。')) return;
    try { const res = await fetch(`/api/resources?id=${id}`, { method: 'DELETE' }); const data = await res.json(); if (data.success) fetchResources(); }
    catch { alert('删除失败'); }
  };

  const handleBulkAction = async () => {
    if (selected.length === 0 || !action) return;
    setProcessing(true);
    if (action === 'delete') { for (const id of selected) await fetch(`/api/resources?id=${id}`, { method: 'DELETE' }); }
    setSelected([]); setAction(null); setProcessing(false); fetchResources();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/resources?limit=1000'); const data = await res.json();
      const blob = new Blob([JSON.stringify(data.resources, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'resources-export.json'; a.click();
    } catch { alert('导出失败'); }
    setExporting(false);
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    try {
      const items = JSON.parse(importText); const arr = Array.isArray(items) ? items : [items];
      let count = 0;
      for (const item of arr) { const res = await fetch('/api/resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, tags: item.tags || [] }) }); const data = await res.json(); if (data.success) count++; }
      alert(`成功导入 ${count}/${arr.length} 条`); setImportText(''); setShowImportExport(false); fetchResources();
    } catch { alert('导入失败：JSON 格式错误'); }
    setImporting(false);
  };

  // ─── 死链体检 ───────────────────────────────────────────────────────────
  const runDeadLinkCheck = useCallback(async () => {
    setCheckingLinks(true);
    setLinkResults({});
    abortRef.current = false;

    for (let i = 0; i < resources.length; i++) {
      if (abortRef.current) break;
      const r = resources[i];
      try {
        const res = await fetch(`/api/resources/${r.id}/check-link`, {
          method: 'POST',
          signal: AbortSignal.timeout(10000),
        });
        const data = await res.json();
        setLinkResults(prev => ({
          ...prev,
          [r.id]: { status: data.httpStatus, ok: data.ok, error: data.error }
        }));

        // 如果检测到 404/500，自动标记
        if (!data.ok) {
          await fetch(`/api/resources?id=${r.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: false })
          });
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : '超时';
        setLinkResults(prev => ({
          ...prev,
          [r.id]: { status: null, ok: false, error: errorMessage }
        }));
      }
      await new Promise(r => setTimeout(r, 200));
    }
    setCheckingLinks(false);
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources]);

  const stopCheck = () => { abortRef.current = true; setCheckingLinks(false); };

  // ─── 质量检查 ───────────────────────────────────────────────────────────
  const runQualityCheck = async () => {
    setRunningQualityCheck(true);
    setShowQualityCheck(true);
    try {
      const res = await fetch('/api/admin/resources/quality-check');
      const data = await res.json();
      if (data.success) {
        setQualityReport(data.report);
        try {
          navigator.sendBeacon(
            '/api/events',
            JSON.stringify({
              eventType: 'resource_quality_check_run',
              itemCount: data.report.total,
              ts: Date.now(),
            })
          );
        } catch {
          // fail silently
        }
      } else {
        alert(data.error || '质量检查失败');
      }
    } catch {
      alert('质量检查失败');
    }
    setRunningQualityCheck(false);
  };

  // ─── 分类管理 ───────────────────────────────────────────────────────────
  const addCategory = () => {
    if (!newCatValue || !newCatLabel) return;
    if (categories.find(c => c.value === newCatValue)) return;
    setCategories([...categories, { value: newCatValue, label: newCatLabel, color: 'bg-gray-100 text-gray-700' }]);
    setNewCatValue('');
    setNewCatLabel('');
  };

  const removeCategory = (value: string) => {
    setCategories(categories.filter(c => c.value !== value));
  };

  const catLabel = (cat: string) => {
    const found = categories.find(c => c.value === cat);
    return found ? found.label : cat;
  };

  const catColor = (cat: string) => {
    const found = categories.find(c => c.value === cat);
    return found ? found.color : 'bg-gray-100 text-gray-700';
  };

  const activeCount = resources.filter(r => r.isActive).length;
  const inactiveCount = resources.filter(r => !r.isActive).length;
  const adCount = resources.filter(r => r.isAd).length;
  const categoryCount = new Set(resources.map(r => r.category)).size;
  const deadLinkCount = Object.values(linkResults).filter(r => !r.ok).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <WorkspacePageHeader
        title="网址导航管理"
        subtitle="管理前台 /resources 页面展示的导航网址。每个网址条目包含名称、URL、分类、标签等信息。"
        icon={<Globe className="w-5 h-5" />}
        actions={
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowCategoryModal(true)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors min-h-[44px]">
              <Tag className="w-4 h-4" /> 分类管理
            </button>
            <button
              onClick={runQualityCheck}
              disabled={runningQualityCheck}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors min-h-[44px]"
            >
              <Activity className={`w-4 h-4 ${runningQualityCheck ? 'animate-pulse' : ''}`} />
              {runningQualityCheck ? '检查中...' : '质量检查'}
            </button>
            <button
              onClick={checkingLinks ? stopCheck : runDeadLinkCheck}
              disabled={resources.length === 0}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors min-h-[44px] ${
                checkingLinks
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Activity className={`w-4 h-4 ${checkingLinks ? 'animate-pulse' : ''}`} />
              {checkingLinks ? '检测中... 停止' : '死链体检'}
            </button>
            <button onClick={() => setShowImportExport(true)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors min-h-[44px]">
              <Upload className="w-4 h-4" /> 导入/导出
            </button>
            <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors min-h-[44px]">
              <Plus className="w-4 h-4" /> 添加网址
            </button>
          </div>
        }
      />

      {/* 死链检测结果横幅 */}
      {deadLinkCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 font-medium">检测到 {deadLinkCount} 个死链，已自动下架。请核实后手动重新启用。</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <MetricCard label="总网址" value={total} icon={<Globe className="w-5 h-5" />} />
        <MetricCard label="启用中" value={activeCount} icon={<StatusBadge label="" variant="success" size="sm" />} />
        <MetricCard label="已隐藏" value={inactiveCount} icon={<StatusBadge label="" variant="neutral" size="sm" />} />
        <MetricCard label="广告/赞助" value={adCount} icon={<Sparkles className="w-5 h-5" />} />
        <MetricCard label="分类数" value={categoryCount} icon={<Tag className="w-5 h-5" />} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchResources} className="ml-auto px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm min-h-[36px] hover:bg-red-700">重试</button>
        </div>
      )}

      {/* Filters */}
      <SectionCard>
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="搜索名称/描述/URL..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">全部分类</option>
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={sourceTypeFilter} onChange={e => { setSourceTypeFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">全部来源</option>
            <option value="official">🏛️ 官方</option>
            <option value="third-party">🔗 第三方</option>
            <option value="internal">🔒 内部</option>
          </select>
          <select value={isAdFilter} onChange={e => { setIsAdFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">全部类型</option>
            <option value="true">⭐ 广告/赞助</option>
            <option value="false">普通资源</option>
          </select>
          <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="updatedAt">最近更新</option>
            <option value="createdAt">创建时间</option>
            <option value="sortOrder">排序权重</option>
            <option value="qualityScore">质量评分</option>
            <option value="name">名称</option>
          </select>
        </div>
      </SectionCard>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-200 rounded-xl">
          <span className="text-sm text-teal-700 font-medium">已选 {selected.length} 项</span>
          <button onClick={() => setAction('delete')} className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 min-h-[36px]">删除选中</button>
          <button onClick={() => { setSelected([]); setAction(null); }} className="px-3 py-1.5 text-sm text-gray-500 rounded-lg hover:bg-gray-100 min-h-[36px]">取消</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <span className="text-sm text-gray-400">加载中...</span>
        </div>
      ) : resources.length === 0 ? (
        <SaasEmptyState
          variant="no-data"
          title="暂无网址"
          description="点击「添加网址」开始管理导航目录"
          icon={<BookOpen className="w-12 h-12" />}
          primaryAction={{ label: '添加网址', onClick: openCreate }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-10"><input type="checkbox" onChange={e => setSelected(e.target.checked ? resources.map(r => r.id) : [])} checked={selected.length === resources.length && resources.length > 0} /></th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">名称</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">分类</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">来源</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">质量</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">状态</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">推荐</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">链接健康</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">更新时间</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 text-xs uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resources.map(r => {
                  const linkResult = linkResults[r.id];
                  return (
                    <tr key={r.id} className={`hover:bg-gray-50/60 transition-colors ${linkResult && !linkResult.ok ? 'bg-red-50/50' : ''} ${r.isAd ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(r.id)} onChange={e => setSelected(e.target.checked ? [...selected, r.id] : selected.filter(id => id !== r.id))} /></td>
                      <td className="px-4 py-3">
                        <div className="font-medium max-w-[180px] truncate flex items-center gap-1 text-gray-700">
                          {r.isAd && <span className="text-amber-500 text-xs" title="广告/赞助">⭐</span>}
                          {r.name}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-xs">{r.url}</div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catColor(r.category)}`}>{catLabel(r.category)}</span></td>
                      <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-gray-600">{r.sourceType === 'official' ? '🏛️ 官方' : r.sourceType === 'third-party' ? '🔗 第三方' : '🔒 内部'}</span></td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-xs font-bold ${(r.qualityScore ?? 0) >= 80 ? 'text-green-600' : (r.qualityScore ?? 0) >= 50 ? 'text-amber-600' : 'text-gray-400'}`}>
                          {r.qualityScore || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.isActive ? (
                          <StatusBadge label="启用" variant="success" size="sm" dot />
                        ) : (
                          <StatusBadge label="隐藏" variant="neutral" size="sm" />
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {r.isFeatured ? (
                          <StatusBadge label="推荐" variant="info" size="sm" icon={<Sparkles className="w-3 h-3" />} />
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {linkResult ? (
                          linkResult.ok ? (
                            <StatusBadge label={`${linkResult.status}`} variant="success" size="sm" />
                          ) : (
                            <StatusBadge label={`${linkResult.status || 'ERR'} ${linkResult.error ? `(${linkResult.error})` : ''}`} variant="danger" size="sm" dot pulse />
                          )
                        ) : checkingLinks ? (
                          <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">{r.updatedAt ? new Date(r.updatedAt).toLocaleDateString("zh-CN") : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a href={r.url} target="_blank" rel="noopener" className="p-1.5 text-gray-400 hover:text-teal-600 rounded-lg hover:bg-gray-100 transition-colors min-h-[36px]"><ExternalLink className="w-4 h-4" /></a>
                          <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-teal-600 rounded-lg hover:bg-gray-100 transition-colors min-h-[36px]"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors min-h-[36px]"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > 50 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">共 {total} 条</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 min-h-[36px] hover:bg-gray-50">上一页</button>
            <span className="px-3 py-1.5 text-sm text-gray-600">第 {page} 页</span>
            <button disabled={page * 50 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 min-h-[36px] hover:bg-gray-50">下一页</button>
          </div>
        </div>
      )}

      {/* ─── Edit/Create Modal ─────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? '编辑网址' : '新增网址'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium mb-1 text-gray-700">名称 *</label><input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">URL *</label><input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">描述</label><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">分类</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1 text-gray-700">来源</label><select value={formData.sourceType} onChange={e => setFormData({ ...formData, sourceType: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">{SOURCE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
              </div>

              {/* ─── 网站 Logo ─────────────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">网站 Logo</label>
                <div className="flex gap-3">
                  <input
                    value={formData.iconUrl}
                    onChange={e => setFormData({ ...formData, iconUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {formData.iconUrl && (
                    <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.iconUrl} alt="Logo" className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">粘贴图片 URL，支持 PNG/SVG/ICO 格式</p>
              </div>

              {/* ─── 广告开关 ─────────────────────────────────────────────── */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isAd} onChange={e => setFormData({ ...formData, isAd: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
                  <span className="text-sm font-medium text-amber-700">这是一个广告 (Sponsored)</span>
                </label>
              </div>

              {/* ─── 推荐位管理 ─────────────────────────────────────────────── */}
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">推荐位设置</span>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500" />
                    <span className="text-sm font-medium text-gray-700">设为推荐资源</span>
                  </label>
                  {formData.isFeatured && (
                    <div className="grid grid-cols-2 gap-2 pl-6">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">推荐分组</label>
                        <input value={formData.featuredGroup} onChange={e => setFormData({ ...formData, featuredGroup: e.target.value })}
                          placeholder="如: 热门、新品" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">排序权重</label>
                        <input type="number" value={formData.featuredOrder} onChange={e => setFormData({ ...formData, featuredOrder: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">开始时间</label>
                        <input type="datetime-local" value={formData.featuredStartAt} onChange={e => setFormData({ ...formData, featuredStartAt: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">结束时间</label>
                        <input type="datetime-local" value={formData.featuredEndAt} onChange={e => setFormData({ ...formData, featuredEndAt: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div><label className="block text-sm font-medium mb-1 text-gray-700">标签（逗号分隔）</label><input value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">使用说明</label><textarea value={formData.usage} onChange={e => setFormData({ ...formData, usage: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">免责声明</label><textarea value={formData.disclaimer} onChange={e => setFormData({ ...formData, disclaimer: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} /> 启用（隐藏后前台不展示）</label>
                <div className="flex items-center gap-2 text-sm text-gray-700"><span>排序</span><input type="number" value={formData.sortOrder} onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 min-h-[44px]">取消</button>
              <button onClick={handleSave} disabled={saving || !formData.name || !formData.url} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1 min-h-[44px]">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 分类管理 Modal ───────────────────────────────────────────── */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Tag className="w-5 h-5" /> 分类管理</h2>
              <button onClick={() => setShowCategoryModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 mb-4">
              {categories.map(c => (
                <div key={c.value} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>
                  <span className="text-xs text-gray-400 font-mono">{c.value}</span>
                  <button onClick={() => removeCategory(c.value)} className="ml-auto text-gray-400 hover:text-red-500 transition-colors min-h-[36px]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium mb-2 text-gray-700">添加新分类</p>
              <div className="flex gap-2">
                <input
                  value={newCatValue}
                  onChange={e => setNewCatValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="英文标识 (如 tools)"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  value={newCatLabel}
                  onChange={e => setNewCatLabel(e.target.value)}
                  placeholder="中文名称 (如 实用工具)"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button onClick={addCategory} disabled={!newCatValue || !newCatLabel} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 min-h-[44px]">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
              <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 min-h-[44px]">完成</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Confirm */}
      {action && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">确认{action === 'delete' ? '删除' : '操作'}</h3>
            <p className="text-sm text-gray-500 mb-4">确定要对选中的 {selected.length} 项执行此操作吗？</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setAction(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg min-h-[44px] hover:bg-gray-50">取消</button>
              <button onClick={handleBulkAction} disabled={processing} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 min-h-[44px]">{processing ? '处理中...' : '确认'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Modal */}
      {showImportExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">导入 / 导出</h2>
              <button onClick={() => setShowImportExport(false)} className="p-1.5 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <button onClick={handleExport} disabled={exporting} className="w-full px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 min-h-[44px] text-sm font-medium text-gray-700"><Download className="w-4 h-4" />{exporting ? '导出中...' : '导出全部资源 (JSON)'}</button>
              <div className="border-t border-gray-100 pt-3">
                <label className="block text-sm font-medium mb-2 text-gray-700">导入 JSON 数据</label>
                <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder='粘贴 JSON 数组，如：[{"name":"...", "url":"...", "category":"life"}]' rows={6} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <button onClick={handleImport} disabled={importing || !importText.trim()} className="mt-2 w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-1 min-h-[44px]"><FileJson className="w-4 h-4" />{importing ? '导入中...' : '导入'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quality Check Modal */}
      {showQualityCheck && qualityReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                资源质量报告
              </h2>
              <button onClick={() => setShowQualityCheck(false)} className="p-1.5 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {/* 总览 */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-100">
                <div className="text-2xl font-bold text-teal-700">{qualityReport.total}</div>
                <div className="text-sm text-gray-600">总资源数</div>
              </div>

              {/* 问题统计 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-xl font-bold text-red-700">{qualityReport.issues.noLogo}</div>
                  <div className="text-xs text-red-600">缺 Logo</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="text-xl font-bold text-orange-700">{qualityReport.issues.noDescription}</div>
                  <div className="text-xs text-orange-600">缺描述</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="text-xl font-bold text-amber-700">{qualityReport.issues.noTags}</div>
                  <div className="text-xs text-amber-600">缺标签</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-xl font-bold text-yellow-700">{qualityReport.issues.lowQuality}</div>
                  <div className="text-xs text-yellow-600">低质量评分</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xl font-bold text-gray-700">{qualityReport.issues.inactive}</div>
                  <div className="text-xs text-gray-600">已隐藏</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-xl font-bold text-purple-700">{qualityReport.featured}</div>
                  <div className="text-xs text-purple-600">推荐资源</div>
                </div>
              </div>

              {/* 分类统计 */}
              {qualityReport.byCategory && qualityReport.byCategory.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">分类分布</h3>
                  <div className="space-y-1">
                    {qualityReport.byCategory.map((item: any) => (
                      <div key={item.category} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{catLabel(item.category)}</span>
                        <span className="font-medium text-gray-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 建议 */}
              {qualityReport.recommendations && qualityReport.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-700 mb-2">改进建议</h3>
                  <ul className="space-y-1">
                    {qualityReport.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="text-sm text-blue-600 flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 重复域名 */}
              {qualityReport.duplicateDomains && qualityReport.duplicateDomains.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-amber-700 mb-2">重复域名 ({qualityReport.duplicateDomains.length})</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {qualityReport.duplicateDomains.slice(0, 10).map((dup: any, idx: number) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium text-amber-800">{dup.domain}</span>
                        <span className="text-amber-600 ml-2">({dup.count} 个资源)</span>
                        <div className="text-xs text-gray-500 ml-4 mt-0.5">
                          {dup.resources.map((r: any) => r.name).join(', ')}
                        </div>
                      </div>
                    ))}
                    {qualityReport.duplicateDomains.length > 10 && (
                      <div className="text-xs text-amber-600">...还有 {qualityReport.duplicateDomains.length - 10} 个</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
              <button onClick={() => setShowQualityCheck(false)} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 min-h-[44px]">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
