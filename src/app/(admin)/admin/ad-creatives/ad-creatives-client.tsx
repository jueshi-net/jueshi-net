"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, ToggleLeft, ToggleRight, Search, Filter, X, Save, Loader2, Trash2, AlertTriangle, Image as ImageIcon, FileCode, Type, LayoutGrid } from "lucide-react";

const CREATIVE_TYPES = ["image", "html", "text", "native"];
const CREATIVE_TYPE_LABELS: Record<string, string> = {
  image: "图片",
  html: "HTML",
  text: "文案",
  native: "原生卡片",
};
const CREATIVE_TYPE_ICONS: Record<string, typeof ImageIcon> = {
  image: ImageIcon,
  html: FileCode,
  text: Type,
  native: LayoutGrid,
};

interface AdCreative {
  id: string;
  campaignId: string;
  title: string;
  creativeType: string;
  imageUrl: string | null;
  targetUrl: string | null;
  codeSnippet: string | null;
  headline: string | null;
  bodyText: string | null;
  ctaText: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface AdCampaign {
  id: string;
  title: string;
}

export default function AdCreativesClient() {
  const [creatives, setCreatives] = useState<AdCreative[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdCreative | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ campaignId: "", creativeType: "", search: "" });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    campaignId: "", title: "", creativeType: "image",
    imageUrl: "", targetUrl: "", codeSnippet: "",
    headline: "", bodyText: "", ctaText: "",
    isActive: true, sortOrder: 0,
  });

  const fetchCreatives = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.campaignId) params.set("campaignId", filters.campaignId);
    if (filters.creativeType) params.set("creativeType", filters.creativeType);
    if (filters.search) params.set("search", filters.search);

    const res = await fetch(`/api/admin/ad-creatives?${params}`);
    if (res.ok) setCreatives(await res.json());
    setLoading(false);
  };

  const fetchCampaigns = async () => {
    const res = await fetch("/api/admin/ads");
    if (res.ok) {
      const data = await res.json();
      setCampaigns(data.data || []);
    }
  };

  useEffect(() => { fetchCreatives(); fetchCampaigns(); }, [filters]);

  const handleSubmit = async () => {
    if (!form.campaignId || !form.title) {
      alert("请选择广告活动并填写素材名称");
      return;
    }
    if (form.creativeType === "image" && !form.imageUrl) {
      alert("图片类型需要填写图片 URL");
      return;
    }
    if (form.creativeType === "html" && !form.codeSnippet) {
      alert("HTML 类型需要填写代码片段");
      return;
    }

    setSaving(true);
    const url = editing ? `/api/admin/ad-creatives/${editing.id}` : "/api/admin/ad-creatives";
    const method = editing ? "PUT" : "POST";
    const body = {
      ...form,
      imageUrl: form.imageUrl || null,
      targetUrl: form.targetUrl || null,
      codeSnippet: form.codeSnippet || null,
      headline: form.headline || null,
      bodyText: form.bodyText || null,
      ctaText: form.ctaText || null,
    };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      resetForm();
      fetchCreatives();
    } else {
      const data = await res.json();
      alert(data.error || "操作失败");
    }
    setSaving(false);
  };

  const handleEdit = (c: AdCreative) => {
    setEditing(c);
    setForm({
      campaignId: c.campaignId, title: c.title, creativeType: c.creativeType,
      imageUrl: c.imageUrl || "", targetUrl: c.targetUrl || "", codeSnippet: c.codeSnippet || "",
      headline: c.headline || "", bodyText: c.bodyText || "", ctaText: c.ctaText || "",
      isActive: c.isActive, sortOrder: c.sortOrder,
    });
    setShowForm(true);
  };

  const handleToggle = async (c: AdCreative) => {
    const res = await fetch(`/api/admin/ad-creatives/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    if (res.ok) fetchCreatives();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此素材吗？")) return;
    const res = await fetch(`/api/admin/ad-creatives/${id}`, { method: "DELETE" });
    if (res.ok) fetchCreatives();
  };

  const resetForm = () => {
    setForm({
      campaignId: "", title: "", creativeType: "image",
      imageUrl: "", targetUrl: "", codeSnippet: "",
      headline: "", bodyText: "", ctaText: "",
      isActive: true, sortOrder: 0,
    });
    setEditing(null);
    setShowForm(false);
  };

  const getCampaignTitle = (id: string) => campaigns.find(c => c.id === id)?.title || id;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">广告素材管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理各广告活动的素材（图片/HTML/文案/原生）</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">
          <Plus className="w-4 h-4" /> 新建素材
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索素材名称..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-48" />
          </div>
          <select value={filters.campaignId} onChange={e => setFilters(f => ({ ...f, campaignId: e.target.value }))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">全部广告活动</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <select value={filters.creativeType} onChange={e => setFilters(f => ({ ...f, creativeType: e.target.value }))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">全部类型</option>
            {CREATIVE_TYPES.map(t => <option key={t} value={t}>{CREATIVE_TYPE_LABELS[t]}</option>)}
          </select>
          <button onClick={() => setFilters({ campaignId: "", creativeType: "", search: "" })} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 rounded-lg">重置</button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border-2 border-teal-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">{editing ? "编辑素材" : "新建素材"}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">广告活动 *</label>
              <select value={form.campaignId} onChange={e => setForm(f => ({ ...f, campaignId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">请选择</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">素材名称 *</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. 夏季促销-横幅A" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">素材类型 *</label>
              <select value={form.creativeType} onChange={e => setForm(f => ({ ...f, creativeType: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                {CREATIVE_TYPES.map(t => <option key={t} value={t}>{CREATIVE_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">排序</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>

            {form.creativeType === "image" && (
              <>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">图片 URL *</label>
                  <input type="text" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </>
            )}

            {form.creativeType === "html" && (
              <div className="sm:col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <label className="block text-xs font-medium text-amber-700">HTML 代码片段 *</label>
                </div>
                <p className="text-xs text-amber-600 mb-2">⚠️ HTML 素材将在前台直接渲染。仅允许安全标签，禁止 &lt;script&gt;、&lt;iframe&gt; 和 on* 事件。请确认代码安全后再启用。</p>
                <textarea value={form.codeSnippet} onChange={e => setForm(f => ({ ...f, codeSnippet: e.target.value }))} placeholder="<a href='...'>...</a>" rows={4} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/50" />
              </div>
            )}

            {(form.creativeType === "text" || form.creativeType === "native") && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">标题</label>
                  <input type="text" value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} placeholder="广告标题" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">CTA 文案</label>
                  <input type="text" value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} placeholder="了解更多" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">正文</label>
                  <textarea value={form.bodyText} onChange={e => setForm(f => ({ ...f, bodyText: e.target.value }))} placeholder="广告正文描述..." rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">跳转链接</label>
              <input type="text" value={form.targetUrl} onChange={e => setForm(f => ({ ...f, targetUrl: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 text-teal-600 rounded" />
              <span className="text-sm text-gray-700">启用</span>
            </label>
            <div className="flex gap-2">
              <button onClick={resetForm} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 rounded-lg">取消</button>
              <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> 加载中...</div>
        ) : creatives.length === 0 ? (
          <div className="p-8 text-center text-gray-400">暂无素材，请先创建广告活动后添加素材</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs">素材</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs hidden sm:table-cell">广告活动</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs">类型</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs hidden md:table-cell">预览</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs">状态</th>
                  <th className="px-4 py-2.5 text-right font-medium text-gray-500 text-xs">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {creatives.map(c => {
                  const TypeIcon = CREATIVE_TYPE_ICONS[c.creativeType] || ImageIcon;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-sm text-gray-900">{c.title}</div>
                        <div className="text-xs text-gray-400">排序: {c.sortOrder}</div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 hidden sm:table-cell">{getCampaignTitle(c.campaignId)}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                          <TypeIcon className="w-3 h-3" /> {CREATIVE_TYPE_LABELS[c.creativeType]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        {c.creativeType === "image" && c.imageUrl && (
                          <img src={c.imageUrl} alt={c.title} className="w-16 h-10 object-cover rounded border" />
                        )}
                        {c.creativeType === "html" && c.codeSnippet && (
                          <span className="text-xs text-amber-600 font-mono" title={c.codeSnippet}>
                            &lt;HTML&gt; {c.codeSnippet.slice(0, 30)}...
                          </span>
                        )}
                        {(c.creativeType === "text" || c.creativeType === "native") && c.headline && (
                          <span className="text-xs text-gray-600">{c.headline}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => handleToggle(c)} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${c.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {c.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />} {c.isActive ? "启用" : "停用"}
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(c)} className="p-1 text-gray-400 hover:text-teal-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(c.id)} className="p-1 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
