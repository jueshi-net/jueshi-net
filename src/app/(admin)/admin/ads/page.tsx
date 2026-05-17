"use client";

import { useState, useEffect } from "react";
import { Megaphone, Plus, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight, Loader2, Image as ImageIcon, Code, Type, AlertCircle } from "lucide-react";

interface AdSlot {
  id: string; name: string; position: string; type: string; imageUrl: string | null;
  linkUrl: string | null; targetUrl: string | null; altText: string | null; title: string | null;
  description: string | null; buttonText: string | null; code: string | null; isActive: boolean;
  clicks: number; impressions: number; startDate: string; endDate: string | null;
  createdAt: string; updatedAt: string;
}

const positionOptions = [
  { value: "home-after-tools", label: "首页工具列表下方", desc: "首页工具网格下方卡片位" },
  { value: "home-before-footer", label: "首页底部之前", desc: "首页内容结束、页脚之前" },
  { value: "tool-bottom", label: "工具页底部", desc: "所有工具页面底部" },
  { value: "sidebar", label: "侧边栏", desc: "桌面端侧边栏广告位" },
  { value: "article-bottom", label: "文章详情页底部", desc: "文章正文下方" },
  { value: "TOP_BANNER", label: "首页顶部横幅", desc: "Hero 区域下方横幅" },
  { value: "INLINE", label: "文章内嵌广告", desc: "文章正文中间" },
  { value: "FOOTER", label: "页脚广告", desc: "全站页脚区域" },
];

const typeOptions = [
  { value: "image", label: "图片广告", icon: ImageIcon, desc: "图片 + 标题 + 跳转链接" },
  { value: "code", label: "HTML/JS 代码广告", icon: Code, desc: "仅 admin 可写的自定义代码" },
  { value: "text", label: "文字广告", icon: Type, desc: "标题 + 描述 + 按钮" },
];

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdSlot | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "", position: "home-after-tools", type: "image", imageUrl: "", linkUrl: "", targetUrl: "", altText: "",
    title: "", description: "", buttonText: "", code: "", isActive: true,
    startDate: new Date().toISOString().split("T")[0], endDate: "",
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/ads"); const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch");
      setAds(data.data || []);
    } catch { setMessage({ type: "error", text: "获取广告列表失败" }); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) { setMessage({ type: "error", text: "名称不能为空" }); return; }
    setSaving(true); setMessage({ type: "", text: "" });
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/ads/${editing.id}` : "/api/ads";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (data.success) { setMessage({ type: "success", text: editing ? "广告位已更新" : "广告位已创建" }); fetchData(); resetForm(); }
      else setMessage({ type: "error", text: data.error || "操作失败" });
    } catch { setMessage({ type: "error", text: "网络错误" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此广告位？")) return;
    try { const res = await fetch(`/api/ads/${id}`, { method: "DELETE" }); if (res.ok) { setMessage({ type: "success", text: "已删除" }); fetchData(); } }
    catch { setMessage({ type: "error", text: "删除失败" }); }
  };

  const handleToggle = async (id: string, current: boolean) => {
    setToggling(id);
    try { const res = await fetch(`/api/ads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !current }) }); if (res.ok) fetchData(); }
    catch { setMessage({ type: "error", text: "操作失败" }); }
    finally { setToggling(null); }
  };

  const startEdit = (ad: AdSlot) => {
    setEditing(ad);
    setFormData({ name: ad.name, position: ad.position, type: ad.type || "image", imageUrl: ad.imageUrl || "", linkUrl: ad.linkUrl || "", targetUrl: ad.targetUrl || "", altText: ad.altText || "", title: ad.title || "", description: ad.description || "", buttonText: ad.buttonText || "", code: ad.code || "", isActive: ad.isActive, startDate: ad.startDate ? new Date(ad.startDate).toISOString().split("T")[0] : "", endDate: ad.endDate ? new Date(ad.endDate).toISOString().split("T")[0] : "" });
    setShowForm(true);
  };

  const resetForm = () => { setEditing(null); setShowForm(false); setFormData({ name: "", position: "home-after-tools", type: "image", imageUrl: "", linkUrl: "", targetUrl: "", altText: "", title: "", description: "", buttonText: "", code: "", isActive: true, startDate: new Date().toISOString().split("T")[0], endDate: "" }); };

  const typeLabel = (type: string) => typeOptions.find(o => o.value === type)?.label || type;

  const enabledCount = ads.filter(a => a.isActive).length;
  const disabledCount = ads.filter(a => !a.isActive).length;
  const positionCount = new Set(ads.map(a => a.position)).size;

  if (loading) return <div className="p-6 text-center text-gray-500 flex items-center justify-center gap-2 min-h-[200px]"><Loader2 className="w-5 h-5 animate-spin" /> 加载中...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold flex items-center gap-2"><Megaphone className="w-5 h-5" /> 广告位管理</h1>
            <p className="text-sm text-green-100 mt-1">支持本站自营图片广告、文字广告、第三方 HTML/JS 代码广告。共 {ads.length} 个。</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="inline-flex items-center gap-2 px-5 py-2 bg-white text-green-700 rounded-xl text-sm font-bold hover:bg-green-50 transition-colors min-h-[44px]">
            <Plus className="w-4 h-4" /> 新建广告
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-green-700">{enabledCount}</div>
          <div className="text-xs text-green-600">启用中</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-gray-500">{disabledCount}</div>
          <div className="text-xs text-gray-400">已停用</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-blue-700">{positionCount}</div>
          <div className="text-xs text-blue-600">广告位</div>
        </div>
      </div>

      {/* Position Guide */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-bold text-gray-900 mb-3">📍 广告位说明</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {positionOptions.map(p => (
            <div key={p.value} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium">{p.label}</div>
                <div className="text-xs text-gray-500">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg text-sm ${message.type === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`}>
          {message.type === "error" && <AlertCircle className="w-4 h-4 inline mr-1" />}{message.text}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing ? "编辑广告" : "新建广告"}</h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">广告名称 *</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="如：Amazon 推广" /></div>
                <div><label className="block text-sm font-medium mb-1">广告位</label><select value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">{positionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
              </div>

              {/* Type selector */}
              <div>
                <label className="block text-sm font-medium mb-2">广告类型</label>
                <div className="flex gap-3">
                  {typeOptions.map(opt => (
                    <button key={opt.value} onClick={() => setFormData({ ...formData, type: opt.value })} className={`flex-1 py-3 px-3 rounded-lg text-sm border flex flex-col items-center gap-1 min-h-[44px] ${formData.type === opt.value ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500"}`}>
                      <opt.icon className="w-5 h-5" />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.type === "image" && (
                <>
                  <div><label className="block text-sm font-medium mb-1">标题</label><input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="广告标题" /></div>
                  <div><label className="block text-sm font-medium mb-1">图片 URL *</label><input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="https://..." /></div>
                  <div><label className="block text-sm font-medium mb-1">跳转链接</label><input value={formData.targetUrl} onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="https://..." /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">按钮文案</label><input value={formData.buttonText} onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="立即查看" /></div>
                    <div><label className="block text-sm font-medium mb-1">Alt 文本</label><input value={formData.altText} onChange={(e) => setFormData({ ...formData, altText: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="广告描述" /></div>
                  </div>
                  <div><label className="block text-sm font-medium mb-1">描述</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="广告描述/备注" /></div>
                  {formData.imageUrl && <div className="border rounded-lg p-4 bg-gray-50"><p className="text-xs text-gray-500 mb-2">预览：</p><img src={formData.imageUrl} alt="preview" className="max-w-full max-h-32 object-contain rounded" onError={(e) => (e.currentTarget.style.display = "none")} /></div>}
                </>
              )}

              {formData.type === "code" && (
                <div>
                  <label className="block text-sm font-medium mb-1">广告代码 (HTML/JS) *</label>
                  <textarea value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} rows={8} className="w-full px-3 py-2 border rounded-lg text-sm font-mono resize-none" placeholder="<script>...</script>" />
                  <p className="text-xs text-amber-600 mt-1">⚠️ 代码广告仅 admin 可写，前端将直接渲染此代码，请确保安全</p>
                </div>
              )}

              {formData.type === "text" && (
                <>
                  <div><label className="block text-sm font-medium mb-1">标题 *</label><input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="广告标题" /></div>
                  <div><label className="block text-sm font-medium mb-1">描述</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="广告描述内容" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">跳转链接</label><input value={formData.targetUrl} onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="https://..." /></div>
                    <div><label className="block text-sm font-medium mb-1">按钮文案</label><input value={formData.buttonText} onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="了解更多" /></div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">开始日期</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">结束日期（留空表示长期）</label><input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
                <label htmlFor="isActive" className="text-sm text-yellow-800 font-medium">启用此广告 — 禁用后不会在前台展示</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存
                </button>
                <button onClick={resetForm} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 min-h-[44px]">取消</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ad List */}
      <div className="space-y-4">
        {ads.length === 0 && (
          <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
            <Megaphone className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium text-gray-500 mb-1">暂无广告</p>
            <p className="text-sm">点击「新建广告」创建第一个广告。支持图片、HTML 代码、文字三种类型。</p>
          </div>
        )}
        {ads.map((ad) => (
          <div key={ad.id} className={`bg-white rounded-xl border overflow-hidden ${!ad.isActive ? "opacity-60" : ""}`}>
            <div className="p-4 flex items-start justify-between flex-wrap gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{ad.name}</h3>
                  <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">{typeLabel(ad.type)}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${ad.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>{ad.isActive ? "启用" : "已停用"}</span>
                </div>
                <p className="text-xs text-gray-500">
                  位置：{positionOptions.find(p => p.value === ad.position)?.label || ad.position}
                  {ad.title && ` · ${ad.title}`}
                </p>
                {ad.type === "image" && ad.imageUrl && <img src={ad.imageUrl} alt={ad.altText || ""} className="mt-2 max-h-20 object-contain rounded" onError={(e) => (e.currentTarget.style.display = "none")} />}
                {ad.type === "code" && ad.code && <pre className="mt-2 text-xs bg-gray-50 p-2 rounded max-h-20 overflow-auto">{ad.code.substring(0, 200)}...</pre>}
                {ad.type === "text" && <p className="mt-1 text-sm text-gray-600">{ad.description || ad.title}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggle(ad.id, ad.isActive)} disabled={toggling === ad.id} className="p-2 hover:bg-gray-100 rounded min-h-[44px]">{toggling === ad.id ? <Loader2 className="w-4 h-4 animate-spin" /> : ad.isActive ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-gray-300" />}</button>
                <button onClick={() => startEdit(ad)} className="p-2 hover:bg-gray-100 rounded text-blue-600 min-h-[44px]"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(ad.id)} className="p-2 hover:bg-gray-100 rounded text-red-600 min-h-[44px]"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="px-4 pb-3 flex items-center gap-4 text-xs text-gray-400">
              <span>点击：{ad.clicks}</span><span>展示：{ad.impressions}</span><span>创建：{new Date(ad.createdAt).toLocaleDateString("zh-CN")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
