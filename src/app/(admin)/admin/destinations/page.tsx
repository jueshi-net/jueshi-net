"use client";

import { useState, useEffect } from "react";
import {
  Globe, Plus, Edit2, ToggleLeft, ToggleRight, Loader2, AlertCircle, X, Save, ChevronDown, Search
} from "lucide-react";

interface Destination {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  currency: string;
  region: string;
  emoji: string;
  heroTitle: string;
  heroSubtitle: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  keyCities: string[];
  userCount: string;
  docCount: string;
  isActive: boolean;
  sortOrder: number;
  _count: { tools: number; guides: number; services: number };
}

const REGION_OPTIONS = [
  "北美", "欧洲", "东南亚", "日韩", "拉美", "中东", "澳洲"
];

const CURRENCY_OPTIONS = [
  "USD", "CAD", "GBP", "EUR", "MYR", "JPY", "KRW", "AUD", "NZD",
  "BRL", "ARS", "CLP", "AED", "SAR", "THB", "VND", "PHP", "IDR", "SGD",
];

export default function AdminDestinationsPage() {
  const [dests, setDests] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    slug: "", name: "", nameEn: "", currency: "USD", region: "", emoji: "",
    heroTitle: "", heroSubtitle: "", seoTitle: "", seoDescription: "",
    keywords: "", keyCities: "", userCount: "0", docCount: "0",
    isActive: true,
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/destinations");
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setDests(data.data || []);
    } catch {
      setMessage({ type: "error", text: "获取数据失败" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.slug.trim() || !formData.name.trim() || !formData.nameEn.trim()) {
      setMessage({ type: "error", text: "slug、名称、英文名不能为空" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const method = editing ? "PUT" : "POST";
      const body: any = {
        slug: formData.slug.trim(), name: formData.name.trim(), nameEn: formData.nameEn.trim(),
        currency: formData.currency, region: formData.region, emoji: formData.emoji,
        heroTitle: formData.heroTitle || formData.name, heroSubtitle: formData.heroSubtitle,
        seoTitle: formData.seoTitle, seoDescription: formData.seoDescription,
        keywords: formData.keywords.split(/[,，\n]/).map(s => s.trim()).filter(Boolean),
        keyCities: formData.keyCities.split(/[,，\n]/).map(s => s.trim()).filter(Boolean),
        userCount: formData.userCount, docCount: formData.docCount,
        isActive: formData.isActive,
      };
      if (editing) body.id = editing.id;

      const res = await fetch("/api/admin/destinations", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: editing ? "已更新" : "已创建" });
        fetchData();
        resetForm();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "网络错误" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await fetch("/api/admin/destinations", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      });
      fetchData();
    } catch {
      setMessage({ type: "error", text: "操作失败" });
    }
  };

  const startEdit = (d: Destination) => {
    setEditing(d);
    setFormData({
      slug: d.slug, name: d.name, nameEn: d.nameEn, currency: d.currency,
      region: d.region, emoji: d.emoji, heroTitle: d.heroTitle,
      heroSubtitle: d.heroSubtitle, seoTitle: d.seoTitle,
      seoDescription: d.seoDescription, keywords: d.keywords.join(", "),
      keyCities: d.keyCities.join(", "), userCount: d.userCount,
      docCount: d.docCount, isActive: d.isActive,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null); setShowForm(false);
    setFormData({
      slug: "", name: "", nameEn: "", currency: "USD", region: "", emoji: "",
      heroTitle: "", heroSubtitle: "", seoTitle: "", seoDescription: "",
      keywords: "", keyCities: "", userCount: "0", docCount: "0", isActive: true,
    });
  };

  const filtered = dests.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.slug.toLowerCase().includes(search.toLowerCase()) ||
    d.region.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="p-6 text-center text-gray-500 flex items-center justify-center gap-2 min-h-[200px]">
      <Loader2 className="w-5 h-5 animate-spin" /> 加载中...
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold flex items-center gap-2">
              <Globe className="w-5 h-5" /> 国家/地区管理 (pSEO CMS)
            </h1>
            <p className="text-sm text-blue-100 mt-1">
              管理全球出海市场大盘 — 增删改查国家专题、百科指南与服务商
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> 新增国家
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-blue-700">{dests.length}</div>
          <div className="text-xs text-blue-600">总数</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-green-700">{dests.filter(d => d.isActive).length}</div>
          <div className="text-xs text-green-600">已发布</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-gray-500">{dests.filter(d => !d.isActive).length}</div>
          <div className="text-xs text-gray-400">草稿</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-purple-700">{dests.reduce((s, d) => s + d._count.tools, 0)}</div>
          <div className="text-xs text-purple-600">工具总数</div>
        </div>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg text-sm ${message.type === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`}>
          {message.type === "error" && <AlertCircle className="w-4 h-4 inline mr-1" />}{message.text}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="搜索国家名称、slug 或区域..."
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
        />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">状态</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">国家</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">区域</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">工具</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">指南</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">服务商</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(d.id, d.isActive)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {d.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      {d.isActive ? '已发布' : '草稿'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{d.emoji}</span>
                      <div>
                        <div className="font-semibold">{d.name}</div>
                        <div className="text-xs text-gray-400 font-mono">/{d.slug} · {d.currency}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{d.region}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{d._count.tools}</span></td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded text-xs">{d._count.guides}</span></td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">{d._count.services}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`/destinations/${d.slug}`} target="_blank" rel="noopener" className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors">预览</a>
                      <button onClick={() => startEdit(d)} className="p-1 hover:bg-gray-100 rounded transition-colors"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">暂无数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold">{editing ? "编辑国家" : "新增国家"}</h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded min-h-[44px]"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Slug *</label>
                  <input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="canada" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">中文名 *</label>
                  <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="加拿大" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">英文名 *</label>
                  <input value={formData.nameEn} onChange={e => setFormData({ ...formData, nameEn: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Canada" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Emoji</label>
                  <input value={formData.emoji} onChange={e => setFormData({ ...formData, emoji: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm text-center" placeholder="🇨🇦" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">区域</label>
                  <div className="relative">
                    <select value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm appearance-none">
                      <option value="">选择区域</option>
                      {REGION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">货币</label>
                  <select value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">商家数</label>
                    <input value={formData.userCount} onChange={e => setFormData({ ...formData, userCount: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="12,500+" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">单据数</label>
                    <input value={formData.docCount} onChange={e => setFormData({ ...formData, docCount: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="45,000+" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Hero 标题</label>
                <input value={formData.heroTitle} onChange={e => setFormData({ ...formData, heroTitle: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="加拿大出海全能工具箱" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Hero 副标题</label>
                <input value={formData.heroSubtitle} onChange={e => setFormData({ ...formData, heroSubtitle: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="商业单据生成 · 物流追踪 · 邮编查询" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">热门城市（逗号分隔）</label>
                <input value={formData.keyCities} onChange={e => setFormData({ ...formData, keyCities: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="多伦多, 温哥华, 蒙特利尔" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">SEO Keywords（逗号分隔）</label>
                <input value={formData.keywords} onChange={e => setFormData({ ...formData, keywords: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">SEO Description</label>
                <textarea value={formData.seoDescription} onChange={e => setFormData({ ...formData, seoDescription: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
                  发布上线
                </label>
                <div className="flex gap-2">
                  <button onClick={resetForm} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 min-h-[44px]">取消</button>
                  <button onClick={handleSubmit} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 min-h-[44px]">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}<Save className="w-4 h-4" />{editing ? "保存" : "创建"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
