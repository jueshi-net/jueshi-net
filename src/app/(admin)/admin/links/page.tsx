'use client';

import { useState, useEffect } from 'react';
import { Link2, Trash2, Edit, FolderOpen, Loader2, CheckCircle, X, Plus, Save, Download, Upload, FileJson, FileSpreadsheet } from 'lucide-react';

export default function AdminLinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState<'delete' | 'category' | 'status' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', url: '', description: '', icon: '', categoryId: '', sortOrder: 0, isFeatured: false, status: 'active' as string });
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Import/export state
  const [showImportExport, setShowImportExport] = useState(false);
  const [importMode, setImportMode] = useState<'upsert' | 'create'>('upsert');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const [importText, setImportText] = useState('');

  const fetchLinks = async () => {
    setLoading(true);
    const res = await fetch(`/api/links?page=${page}&limit=20&search=${search}`);
    const data = await res.json();
    const arr = data.links ?? data.data ?? (Array.isArray(data) ? data : []);
    setLinks(Array.isArray(arr) ? arr : []);
    setTotal(data.total ?? arr.length);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data.categories || []);
  };

  useEffect(() => {
    fetchLinks();
    fetchCategories();
  }, [page]);

  const openCreate = () => {
    setEditingId(null);
    setFormData({ title: '', url: '', description: '', icon: '', categoryId: '', sortOrder: 0, isFeatured: false, status: 'active' });
    setShowModal(true);
  };

  const openEdit = (link: any) => {
    setEditingId(link.id);
    setFormData({
      title: link.title || '',
      url: link.url || '',
      description: link.description || '',
      icon: link.icon || '',
      categoryId: link.categoryId || '',
      sortOrder: link.sortOrder || 0,
      isFeatured: link.isFeatured || false,
      status: link.status || 'active',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.url) return;
    setSaving(true);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/links?id=${editingId}` : '/api/links';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        fetchLinks();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此链接？')) return;
    await fetch(`/api/links?id=${id}`, { method: 'DELETE' });
    fetchLinks();
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selected.length === links.length) {
      setSelected([]);
    } else {
      setSelected(links.map(l => l.id));
    }
  };

  const handleBulkAction = async () => {
    if (selected.length === 0 || !action) return;
    setProcessing(true);
    for (const id of selected) {
      if (action === 'delete') {
        await fetch(`/api/links?id=${id}`, { method: 'DELETE' });
      } else if (action === 'status') {
        await fetch(`/api/links?id=${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'inactive' }),
        });
      }
    }
    setSelected([]);
    setAction(null);
    setProcessing(false);
    fetchLinks();
  };

  // Export handlers
  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    try {
      const res = await fetch(`/api/links/bulk?format=${format}`);
      if (format === 'csv') {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `links-export-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `links-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  };

  // Import handler
  const handleImport = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    setImportResult(null);
    try {
      let links: any[];
      try {
        const parsed = JSON.parse(importText);
        links = Array.isArray(parsed) ? parsed : (parsed.data || parsed.links || []);
      } catch {
        setImportResult({ success: false, error: 'JSON 格式错误，请检查输入' });
        return;
      }

      const res = await fetch('/api/links/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links, mode: importMode }),
      });
      const data = await res.json();
      setImportResult(data);
      if (data.success) {
        fetchLinks();
      }
    } finally {
      setImporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Link2 className="w-6 h-6" />
          链接管理
          <span className="text-sm font-normal text-gray-400">({total} 个)</span>
        </h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          新建链接
        </button>
        <button
          onClick={() => { setShowImportExport(true); setImportResult(null); setImportText(''); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <Upload className="w-4 h-4" />
          导入 / 导出
        </button>
      </div>

      {/* 搜索和批量操作 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索链接..."
            className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg"
          />
          <button
            onClick={() => { setPage(1); fetchLinks(); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            搜索
          </button>
          {selected.length > 0 && (
            <div className="flex gap-2 items-center">
              <select
                value={action || ''}
                onChange={(e) => setAction(e.target.value as any)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">批量操作...</option>
                <option value="delete">删除</option>
                <option value="status">设为失效</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={processing || !action}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin inline" /> : '执行'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 链接列表 */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /></div>
        ) : links.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>暂无链接数据</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={selected.length === links.length && links.length > 0} onChange={toggleAll} />
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">图标</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">标题</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">URL</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">分类</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">点击</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {links.map(link => (
                    <tr key={link.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.includes(link.id)} onChange={() => toggleSelect(link.id)} />
                      </td>
                      <td className="px-4 py-3 text-lg">{link.icon || '🔗'}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm">{link.title}</div>
                        {link.isFeatured && <span className="text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">⭐ 推荐</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-xs" title={link.url}>{link.url}</td>
                      <td className="px-4 py-3 text-sm">{link.category?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm">{link.clicks || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${link.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {link.status === 'active' ? '活跃' : '失效'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(link)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(link.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <span className="text-sm text-gray-500">第 {page} / {totalPages} 页，共 {total} 条</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded text-sm disabled:opacity-40">上一页</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 border rounded text-sm disabled:opacity-40">下一页</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold">{editingId ? '编辑链接' : '新建链接'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="网站名称" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                <input type="url" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="https://example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="简短描述" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">图标</label>
                  <input type="text" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="📦" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                    <option value="">未分类</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                  <input type="number" value={formData.sortOrder} onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                    <option value="active">活跃</option>
                    <option value="inactive">失效</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm">⭐ 设为首页推荐</span>
              </label>
            </div>
            <div className="flex gap-2 justify-end p-5 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={handleSave} disabled={saving || !formData.title || !formData.url} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Modal */}
      {showImportExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowImportExport(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5" />
                批量导入 / 导出
              </h2>
              <button onClick={() => setShowImportExport(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-6">
              {/* Export Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  导出链接
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleExport('json')}
                    disabled={exporting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                  >
                    <FileJson className="w-5 h-5" />
                    {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : '导出 JSON'}
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={exporting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : '导出 CSV'}
                  </button>
                </div>
              </div>

              {/* Import Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  导入链接
                </h3>

                {/* Mode selector */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setImportMode('upsert')}
                    className={`px-3 py-1.5 text-sm rounded-lg border ${importMode === 'upsert' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-600'}`}
                  >
                    更新或创建（URL 相同则更新）
                  </button>
                  <button
                    onClick={() => setImportMode('create')}
                    className={`px-3 py-1.5 text-sm rounded-lg border ${importMode === 'create' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-600'}`}
                  >
                    仅创建（跳过重复 URL）
                  </button>
                </div>

                {/* JSON input */}
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`粘贴 JSON 数组，格式示例：
[
  {
    "title": "网站名称",
    "url": "https://example.com",
    "description": "简短描述",
    "icon": "📦",
    "category": "快递查询",
    "sortOrder": 0,
    "isFeatured": false,
    "status": "active"
  }
]`}
                  className="w-full h-48 px-4 py-3 border rounded-lg text-sm font-mono bg-gray-50"
                />
                <p className="text-xs text-gray-400 mt-1">
                  💡 可粘贴之前导出的 JSON 文件内容，category 字段会自动匹配已有分类
                </p>

                <button
                  onClick={handleImport}
                  disabled={importing || !importText.trim()}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : '开始导入'}
                </button>
              </div>

              {/* Result */}
              {importResult && (
                <div className={`rounded-lg p-4 text-sm ${importResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {importResult.error ? (
                    <p>❌ {importResult.error}</p>
                  ) : (
                    <>
                      <p className="font-semibold mb-1">✅ 导入完成！</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <p>新增: <strong>{importResult.created}</strong></p>
                        <p>更新: <strong>{importResult.updated}</strong></p>
                        <p>跳过: <strong>{importResult.skipped}</strong></p>
                      </div>
                      {importResult.errors?.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs">查看 {importResult.errors.length} 个错误</summary>
                          <pre className="mt-2 text-xs bg-white/50 p-2 rounded max-h-32 overflow-auto">
                            {importResult.errors.join('\n')}
                          </pre>
                        </details>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end p-5 border-t">
              <button onClick={() => setShowImportExport(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
