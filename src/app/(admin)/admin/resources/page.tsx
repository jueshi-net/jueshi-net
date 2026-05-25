'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, Trash2, Edit, Plus, Save, X, Loader2, ExternalLink, Upload, Download, FileJson, AlertCircle, Activity, Tag, Shield, Globe } from 'lucide-react';

// ─── 分类管理 ──────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { value: 'life', label: '海外生活', color: 'bg-blue-100 text-blue-700' },
  { value: 'logistics', label: '跨境物流', color: 'bg-orange-100 text-orange-700' },
  { value: 'business', label: '出海经营', color: 'bg-green-100 text-green-700' },
  { value: 'tools', label: '实用工具', color: 'bg-purple-100 text-purple-700' },
  { value: 'templates', label: '模板资源', color: 'bg-pink-100 text-pink-700' },
  { value: 'education', label: '教育学习', color: 'bg-teal-100 text-teal-700' },
];

const SOURCE_TYPES = [
  { value: 'official', label: '官方' },
  { value: 'third-party', label: '第三方' },
  { value: 'internal', label: '内部' },
];

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState<'delete' | 'category' | 'status' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', url: '', description: '', category: 'life',
    tags: '', sourceType: 'third-party', usage: '', disclaimer: '',
    isActive: true, sortOrder: 0, iconUrl: '', isAd: false,
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
  const [editingCat, setEditingCat] = useState<string | null>(null);

  // ─── 死链检测状态 ─────────────────────────────────────────────────────
  const [checkingLinks, setCheckingLinks] = useState(false);
  const [linkResults, setLinkResults] = useState<Record<string, { status: number | null; ok: boolean; error?: string }>>({});
  const abortRef = useRef(false);

  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    setLoading(true); setError(null);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (search) params.set('search', search);
    if (categoryFilter) params.set('category', categoryFilter);

    try {
      const res = await fetch(`/api/resources?${params}`);
      const data = await res.json();
      setResources(data.resources || []);
      setTotal(data.total || 0);
    } catch { setError('加载资源失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchResources(); }, [page, search, categoryFilter]);

  const openCreate = () => {
    setEditingId(null);
    setFormData({ name: '', url: '', description: '', category: 'life', tags: '', sourceType: 'third-party', usage: '', disclaimer: '', isActive: true, sortOrder: 0, iconUrl: '', isAd: false });
    setShowModal(true);
  };

  const openEdit = (r: any) => {
    setEditingId(r.id);
    setFormData({
      name: r.name || '', url: r.url || '', description: r.description || '',
      category: r.category || 'life', tags: (r.tags || []).join(', '),
      sourceType: r.sourceType || 'third-party', usage: r.usage || '',
      disclaimer: r.disclaimer || '', isActive: r.isActive !== false,
      sortOrder: r.sortOrder || 0, iconUrl: r.iconUrl || '', isAd: r.isAd || false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.url) return;
    setSaving(true);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/resources?id=${editingId}` : '/api/resources';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) })
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
      } catch (err: any) {
        setLinkResults(prev => ({
          ...prev,
          [r.id]: { status: null, ok: false, error: err.message || '超时' }
        }));
      }
      await new Promise(r => setTimeout(r, 200));
    }
    setCheckingLinks(false);
    fetchResources();
  }, [resources]);

  const stopCheck = () => { abortRef.current = true; setCheckingLinks(false); };

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
  const categoryCount = new Set(resources.map(r => r.category)).size;
  const deadLinkCount = Object.values(linkResults).filter(r => !r.ok).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold flex items-center gap-2"><Globe className="w-5 h-5" /> 🌍 网址导航大厅</h1>
            <p className="text-sm text-purple-100 mt-1">管理前台 /resources 展示的导航网址。共 {total} 条。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowCategoryModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl text-sm hover:bg-white/20 transition-colors min-h-[44px]">
              <Tag className="w-4 h-4" /> 分类管理
            </button>
            <button
              onClick={checkingLinks ? stopCheck : runDeadLinkCheck}
              disabled={resources.length === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2 border rounded-xl text-sm transition-colors min-h-[44px] ${
                checkingLinks
                  ? 'bg-red-500/20 border-red-300 text-white hover:bg-red-500/30'
                  : 'bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <Activity className={`w-4 h-4 ${checkingLinks ? 'animate-pulse' : ''}`} />
              {checkingLinks ? '检测中... 点击停止' : '⚡ 一键死链体检'}
            </button>
            <button onClick={() => setShowImportExport(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl text-sm hover:bg-white/20 transition-colors min-h-[44px]">
              <Upload className="w-4 h-4" /> 导入/导出
            </button>
            <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-5 py-2 bg-white text-purple-700 rounded-xl text-sm font-bold hover:bg-purple-50 transition-colors min-h-[44px]">
              <Plus className="w-4 h-4" /> 添加网址
            </button>
          </div>
        </div>
      </div>

      {/* 死链检测结果横幅 */}
      {deadLinkCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 font-medium">检测到 {deadLinkCount} 个死链，已自动下架。请核实后手动重新启用。</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-gray-900">{total}</div>
          <div className="text-xs text-gray-500">总网址</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-green-700">{activeCount}</div>
          <div className="text-xs text-green-600">启用中</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-gray-500">{inactiveCount}</div>
          <div className="text-xs text-gray-400">已隐藏</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-blue-700">{categoryCount}</div>
          <div className="text-xs text-blue-600">分类数</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchResources} className="ml-auto px-3 py-1 bg-red-600 text-white rounded-lg text-sm min-h-[36px]">重试</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="搜索名称/描述/URL..." className="flex-1 px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="px-3 py-2 border rounded-lg text-sm min-h-[44px]">
          <option value="">全部分类</option>
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700">已选 {selected.length} 项</span>
          <button onClick={() => setAction('delete')} className="px-2 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 min-h-[36px]">删除选中</button>
          <button onClick={() => { setSelected([]); setAction(null); }} className="px-2 py-1 text-sm text-gray-500 min-h-[36px]">取消</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left w-10"><input type="checkbox" onChange={e => setSelected(e.target.checked ? resources.map(r => r.id) : [])} checked={selected.length === resources.length && resources.length > 0} /></th>
                  <th className="px-4 py-3 text-left">名称</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">分类</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">来源</th>
                  <th className="px-4 py-3 text-left">状态</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">链接健康</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">更新时间</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {resources.map(r => {
                  const linkResult = linkResults[r.id];
                  return (
                    <tr key={r.id} className={`border-b hover:bg-gray-50 ${linkResult && !linkResult.ok ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(r.id)} onChange={e => setSelected(e.target.checked ? [...selected, r.id] : selected.filter(id => id !== r.id))} /></td>
                      <td className="px-4 py-3">
                        <div className="font-medium max-w-[180px] truncate">{r.name}</div>
                        <div className="text-xs text-gray-400 truncate max-w-xs">{r.url}</div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell"><span className={`px-2 py-0.5 rounded text-xs ${catColor(r.category)}`}>{catLabel(r.category)}</span></td>
                      <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs">{r.sourceType === 'official' ? '🏛️ 官方' : r.sourceType === 'third-party' ? '🔗 第三方' : '🔒 内部'}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{r.isActive ? '启用' : '隐藏'}</span></td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {linkResult ? (
                          linkResult.ok ? (
                            <span className="text-green-600 text-xs">✅ {linkResult.status}</span>
                          ) : (
                            <span className="text-red-600 text-xs flex items-center gap-1">
                              <span className="w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse" />
                              {linkResult.status || 'ERR'} {linkResult.error ? `(${linkResult.error})` : ''}
                            </span>
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
                          <a href={r.url} target="_blank" rel="noopener" className="p-1.5 text-gray-400 hover:text-blue-600 min-h-[36px]"><ExternalLink className="w-4 h-4" /></a>
                          <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-600 min-h-[36px]"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 min-h-[36px]"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {resources.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <BookOpen className="w-14 h-14 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium text-gray-500 mb-1">暂无网址</p>
              <p className="text-sm">点击「添加网址」开始管理导航目录</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {total > 50 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">共 {total} 条</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-50 min-h-[36px]">上一页</button>
            <span className="px-3 py-1 text-sm">第 {page} 页</span>
            <button disabled={page * 50 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-50 min-h-[36px]">下一页</button>
          </div>
        </div>
      )}

      {/* ─── Edit/Create Modal ─────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? '编辑网址' : '新增网址'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium mb-1">名称 *</label><input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">URL *</label><input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full px-3 py-2 border rounded-lg font-mono text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">描述</label><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">分类</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">来源</label><select value={formData.sourceType} onChange={e => setFormData({ ...formData, sourceType: e.target.value })} className="w-full px-3 py-2 border rounded-lg">{SOURCE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
              </div>

              {/* ─── 网站 Logo ─────────────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-medium mb-1">网站 Logo</label>
                <div className="flex gap-3">
                  <input
                    value={formData.iconUrl}
                    onChange={e => setFormData({ ...formData, iconUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
                  />
                  {formData.iconUrl && (
                    <div className="w-10 h-10 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
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

              <div><label className="block text-sm font-medium mb-1">标签（逗号分隔）</label><input value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">使用说明</label><textarea value={formData.usage} onChange={e => setFormData({ ...formData, usage: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">免责声明</label><textarea value={formData.disclaimer} onChange={e => setFormData({ ...formData, disclaimer: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} /> 启用（隐藏后前台不展示）</label>
                <div className="flex items-center gap-2"><span className="text-sm">排序</span><input type="number" value={formData.sortOrder} onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} className="w-20 px-3 py-2 border rounded-lg" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 min-h-[44px]">取消</button>
              <button onClick={handleSave} disabled={saving || !formData.name || !formData.url} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1 min-h-[44px]">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 分类管理 Modal ───────────────────────────────────────────── */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><Tag className="w-5 h-5" /> 分类管理</h2>
              <button onClick={() => setShowCategoryModal(false)} className="p-1 hover:bg-gray-100 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 mb-4">
              {categories.map(c => (
                <div key={c.value} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.color}`}>{c.label}</span>
                  <span className="text-xs text-gray-400 font-mono">{c.value}</span>
                  <button onClick={() => removeCategory(c.value)} className="ml-auto text-gray-400 hover:text-red-500 transition-colors min-h-[36px]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">添加新分类</p>
              <div className="flex gap-2">
                <input
                  value={newCatValue}
                  onChange={e => setNewCatValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="英文标识 (如 tools)"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm min-h-[44px]"
                />
                <input
                  value={newCatLabel}
                  onChange={e => setNewCatLabel(e.target.value)}
                  placeholder="中文名称 (如 实用工具)"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm min-h-[44px]"
                />
                <button onClick={addCategory} disabled={!newCatValue || !newCatLabel} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 min-h-[44px]">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t">
              <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 min-h-[44px]">完成</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Confirm */}
      {action && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2">确认{action === 'delete' ? '删除' : '操作'}</h3>
            <p className="text-sm text-gray-500 mb-4">确定要对选中的 {selected.length} 项执行此操作吗？</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setAction(null)} className="px-4 py-2 text-sm border rounded-lg min-h-[44px]">取消</button>
              <button onClick={handleBulkAction} disabled={processing} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 min-h-[44px]">{processing ? '处理中...' : '确认'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Modal */}
      {showImportExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">导入 / 导出</h2>
              <button onClick={() => setShowImportExport(false)} className="p-1 hover:bg-gray-100 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <button onClick={handleExport} disabled={exporting} className="w-full px-4 py-3 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 min-h-[44px]"><Download className="w-4 h-4" />{exporting ? '导出中...' : '导出全部资源 (JSON)'}</button>
              <div className="border-t pt-3">
                <label className="block text-sm font-medium mb-2">导入 JSON 数据</label>
                <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder='粘贴 JSON 数组，如：[{"name":"...", "url":"...", "category":"life"}]' rows={6} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" />
                <button onClick={handleImport} disabled={importing || !importText.trim()} className="mt-2 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-1 min-h-[44px]"><FileJson className="w-4 h-4" />{importing ? '导入中...' : '导入'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
