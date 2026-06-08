"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, ToggleLeft, ToggleRight, Search, Filter, X, Save, Loader2, Trash2 } from "lucide-react";

const PAGE_TYPES = ["home", "tool", "article", "topic", "landing", "yellowpage", "task", "workspace"];
const ZONES = ["hero_below", "sidebar", "result_below", "content_mid", "footer", "native_card"];
const DEVICES = ["all", "desktop", "mobile"];

interface AdPlacement {
  id: string;
  key: string;
  name: string;
  pageType: string;
  zone: string;
  device: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

export default function AdPlacementsClient() {
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdPlacement | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ pageType: "", device: "", search: "", isActive: "" });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ key: "", name: "", pageType: "home", zone: "hero_below", device: "all", description: "", isActive: true, sortOrder: 0 });

  const fetchPlacements = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.pageType) params.set("pageType", filters.pageType);
    if (filters.device) params.set("device", filters.device);
    if (filters.search) params.set("search", filters.search);
    if (filters.isActive) params.set("isActive", filters.isActive);
    
    const res = await fetch(`/api/admin/ad-placements?${params}`);
    if (res.ok) setPlacements(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchPlacements(); }, [filters]);

  const handleSubmit = async () => {
    setSaving(true);
    const url = editing ? `/api/admin/ad-placements/${editing.id}` : "/api/admin/ad-placements";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) {
      setForm({ key: "", name: "", pageType: "home", zone: "hero_below", device: "all", description: "", isActive: true, sortOrder: 0 });
      setEditing(null);
      setShowForm(false);
      fetchPlacements();
    } else {
      const data = await res.json();
      alert(data.error || "操作失败");
    }
    setSaving(false);
  };

  const handleEdit = (p: AdPlacement) => {
    setEditing(p);
    setForm({ key: p.key, name: p.name, pageType: p.pageType, zone: p.zone, device: p.device, description: p.description || "", isActive: p.isActive, sortOrder: p.sortOrder });
    setShowForm(true);
  };

  const handleToggle = async (p: AdPlacement) => {
    const res = await fetch(`/api/admin/ad-placements/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !p.isActive }) });
    if (res.ok) fetchPlacements();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此广告位吗？")) return;
    const res = await fetch(`/api/admin/ad-placements/${id}`, { method: "DELETE" });
    if (res.ok) fetchPlacements();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">广告位管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理各页面可投放广告的位置</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ key: "", name: "", pageType: "home", zone: "hero_below", device: "all", description: "", isActive: true, sortOrder: 0 }); setShowForm(!showForm); }} className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">
          <Plus className="w-4 h-4" /> 新建广告位
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索 key/名称..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-48" />
          </div>
          <select value={filters.pageType} onChange={e => setFilters(f => ({ ...f, pageType: e.target.value }))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">全部页面类型</option>
            {PAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filters.device} onChange={e => setFilters(f => ({ ...f, device: e.target.value }))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">全部设备</option>
            {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filters.isActive} onChange={e => setFilters(f => ({ ...f, isActive: e.target.value }))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">全部状态</option>
            <option value="true">启用</option>
            <option value="false">停用</option>
          </select>
          <button onClick={() => setFilters({ pageType: "", device: "", search: "", isActive: "" })} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 rounded-lg">重置</button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border-2 border-teal-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">{editing ? "编辑广告位" : "新建广告位"}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Key (唯一标识) *</label>
              <input type="text" value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value }))} placeholder="e.g. home.hero_below" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">名称 *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. 首页首屏下方" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">页面类型 *</label>
              <select value={form.pageType} onChange={e => setForm(f => ({ ...f, pageType: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                {PAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">区域 *</label>
              <select value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">设备</label>
              <select value={form.device} onChange={e => setForm(f => ({ ...f, device: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">排序</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">描述</label>
              <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="可选说明" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 text-teal-600 rounded" />
              <span className="text-sm text-gray-700">启用</span>
            </label>
            <div className="flex gap-2">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 rounded-lg">取消</button>
              <button onClick={handleSubmit} disabled={saving || !form.key || !form.name} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
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
        ) : placements.length === 0 ? (
          <div className="p-8 text-center text-gray-400">暂无广告位，点击新建创建</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs">Key</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs">名称</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs hidden sm:table-cell">页面类型</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs hidden sm:table-cell">区域</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs hidden sm:table-cell">设备</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs">状态</th>
                  <th className="px-4 py-2.5 text-right font-medium text-gray-500 text-xs">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {placements.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-700">{p.key}</td>
                    <td className="px-4 py-2.5 font-medium text-sm text-gray-900">{p.name}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 hidden sm:table-cell"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{p.pageType}</span></td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 hidden sm:table-cell">{p.zone}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 hidden sm:table-cell">{p.device}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => handleToggle(p)} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${p.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {p.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />} {p.isActive ? "启用" : "停用"}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
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
