"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Search, X, Save, Loader2, Trash2, Eye, EyeOff } from "lucide-react";

const PAGE_TYPES = ["country", "tool", "topic", "guide", "city", "postal", "landing"];
const STATUSES = ["draft", "published", "hidden"];

interface LandingPage {
  id: string;
  slug: string;
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  pageType: string;
  status: string;
  primaryTool: string | null;
  relatedTools: string[];
  relatedTopics: string[];
  relatedArticles: string[];
  createdAt: string;
  publishedAt: string | null;
}

export default function LandingPagesClient() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LandingPage | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ pageType: "", status: "", search: "" });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ slug: "", title: "", seoTitle: "", seoDescription: "", pageType: "landing", status: "draft", primaryTool: "", relatedTools: "", relatedTopics: "", relatedArticles: "" });

  const fetchPages = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.pageType) params.set("pageType", filters.pageType);
    if (filters.status) params.set("status", filters.status);
    if (filters.search) params.set("search", filters.search);
    
    const res = await fetch(`/api/admin/landing-pages?${params}`);
    if (res.ok) setPages(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchPages(); }, [filters]);

  const handleSubmit = async () => {
    setSaving(true);
    const data: any = {
      slug: form.slug, title: form.title,
      seoTitle: form.seoTitle || null, seoDescription: form.seoDescription || null,
      pageType: form.pageType, status: form.status,
      primaryTool: form.primaryTool || null,
      relatedTools: form.relatedTools.split(",").map(s => s.trim()).filter(Boolean),
      relatedTopics: form.relatedTopics.split(",").map(s => s.trim()).filter(Boolean),
      relatedArticles: form.relatedArticles.split(",").map(s => s.trim()).filter(Boolean),
    };
    const url = editing ? `/api/admin/landing-pages/${editing.id}` : "/api/admin/landing-pages";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) {
      setForm({ slug: "", title: "", seoTitle: "", seoDescription: "", pageType: "landing", status: "draft", primaryTool: "", relatedTools: "", relatedTopics: "", relatedArticles: "" });
      setEditing(null);
      setShowForm(false);
      fetchPages();
    } else {
      const err = await res.json();
      alert(err.error || "操作失败");
    }
    setSaving(false);
  };

  const handleEdit = (p: LandingPage) => {
    setEditing(p);
    setForm({ slug: p.slug, title: p.title, seoTitle: p.seoTitle || "", seoDescription: p.seoDescription || "", pageType: p.pageType, status: p.status, primaryTool: p.primaryTool || "", relatedTools: (p.relatedTools || []).join(", "), relatedTopics: (p.relatedTopics || []).join(", "), relatedArticles: (p.relatedArticles || []).join(", ") });
    setShowForm(true);
  };

  const handleStatus = async (p: LandingPage, newStatus: string) => {
    const res = await fetch(`/api/admin/landing-pages/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
    if (res.ok) fetchPages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此落地页配置吗？")) return;
    const res = await fetch(`/api/admin/landing-pages/${id}`, { method: "DELETE" });
    if (res.ok) fetchPages();
  };

  const statusColors: Record<string, string> = { draft: "bg-gray-100 text-gray-600", published: "bg-green-50 text-green-700", hidden: "bg-red-50 text-red-600" };
  const statusLabels: Record<string, string> = { draft: "草稿", published: "已发布", hidden: "已隐藏" };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">落地页管理</h1>
          <p className="text-sm text-gray-500 mt-1">配置落地页 SEO、关联内容与广告位 (仅后台，未公开发布)</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ slug: "", title: "", seoTitle: "", seoDescription: "", pageType: "landing", status: "draft", primaryTool: "", relatedTools: "", relatedTopics: "", relatedArticles: "" }); setShowForm(!showForm); }} className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">
          <Plus className="w-4 h-4" /> 新建落地页
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索 slug/标题..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-48" />
          </div>
          <select value={filters.pageType} onChange={e => setFilters(f => ({ ...f, pageType: e.target.value }))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">全部类型</option>
            {PAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">全部状态</option>
            {STATUSES.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
          </select>
          <button onClick={() => setFilters({ pageType: "", status: "", search: "" })} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 rounded-lg">重置</button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border-2 border-teal-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">{editing ? "编辑落地页" : "新建落地页"}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Slug (唯一) *</label>
              <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. canada-logistics" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">标题 *</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">SEO 标题</label>
              <input type="text" value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">页面类型</label>
              <select value={form.pageType} onChange={e => setForm(f => ({ ...f, pageType: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                {PAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">状态</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                {STATUSES.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">主工具 (slug)</label>
              <input type="text" value={form.primaryTool} onChange={e => setForm(f => ({ ...f, primaryTool: e.target.value }))} placeholder="e.g. commercial-invoice" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">相关工具 (逗号分隔)</label>
              <input type="text" value={form.relatedTools} onChange={e => setForm(f => ({ ...f, relatedTools: e.target.value }))} placeholder="tracking, hs-code" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">相关专题 (逗号分隔)</label>
              <input type="text" value={form.relatedTopics} onChange={e => setForm(f => ({ ...f, relatedTopics: e.target.value }))} placeholder="vpn-guide, sim-card" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">相关文章 (逗号分隔)</label>
              <input type="text" value={form.relatedArticles} onChange={e => setForm(f => ({ ...f, relatedArticles: e.target.value }))} placeholder="article-slug-1, article-slug-2" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">SEO 描述</label>
              <textarea value={form.seoDescription} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 rounded-lg">取消</button>
            <button onClick={handleSubmit} disabled={saving || !form.slug || !form.title} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> 加载中...</div>
        ) : pages.length === 0 ? (
          <div className="p-8 text-center text-gray-400">暂无落地页配置，点击新建创建</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs">Slug</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs">标题</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs hidden sm:table-cell">类型</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs">状态</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs hidden sm:table-cell">主工具</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs hidden sm:table-cell">创建时间</th>
                  <th className="px-4 py-2.5 text-right font-medium text-gray-500 text-xs">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pages.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-700">{p.slug}</td>
                    <td className="px-4 py-2.5 font-medium text-sm text-gray-900">{p.title}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 hidden sm:table-cell"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{p.pageType}</span></td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[p.status]}`}>{statusLabels[p.status]}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 hidden sm:table-cell">{p.primaryTool || "—"}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 hidden sm:table-cell">{new Date(p.createdAt).toLocaleDateString("zh-CN")}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {p.status !== "published" && <button onClick={() => handleStatus(p, "published")} className="p-1 text-gray-400 hover:text-green-600 rounded" title="发布"><Eye className="w-3.5 h-3.5" /></button>}
                        {p.status !== "hidden" && <button onClick={() => handleStatus(p, "hidden")} className="p-1 text-gray-400 hover:text-red-500 rounded" title="隐藏"><EyeOff className="w-3.5 h-3.5" /></button>}
                        {p.status !== "draft" && <button onClick={() => handleStatus(p, "draft")} className="p-1 text-gray-400 hover:text-gray-600 rounded" title="草稿"><X className="w-3.5 h-3.5" /></button>}
                        <button onClick={() => handleEdit(p)} className="p-1 text-gray-400 hover:text-teal-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
