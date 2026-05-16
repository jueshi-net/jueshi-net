"use client";

import { useState, useEffect } from "react";
import { Megaphone, Plus, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight, Loader2, Image as ImageIcon, Code, Type } from "lucide-react";

interface AdSlot {
  id: string;
  name: string;
  position: string;
  type: string;
  imageUrl: string | null;
  linkUrl: string | null;
  targetUrl: string | null;
  altText: string | null;
  title: string | null;
  description: string | null;
  buttonText: string | null;
  code: string | null;
  isActive: boolean;
  clicks: number;
  impressions: number;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const positionOptions = [
  { value: "TOP_BANNER", label: "首页顶部横幅" },
  { value: "SIDEBAR_LEFT", label: "侧边栏广告" },
  { value: "SIDEBAR_RIGHT", label: "右侧栏广告" },
  { value: "INLINE", label: "文章内嵌广告" },
  { value: "FOOTER", label: "页脚广告" },
  { value: "FLOATING", label: "悬浮广告" },
  { value: "TOOL_PAGE", label: "工具页广告" },
];

const typeOptions = [
  { value: "image", label: "图片广告", icon: ImageIcon },
  { value: "code", label: "HTML/JS 代码广告", icon: Code },
  { value: "text", label: "文字广告", icon: Type },
];

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdSlot | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    position: "TOP_BANNER",
    type: "image",
    imageUrl: "",
    linkUrl: "",
    targetUrl: "",
    altText: "",
    title: "",
    description: "",
    buttonText: "",
    code: "",
    isActive: true,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/ads");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch");
      setAds(data.data || []);
    } catch {
      setMessage({ type: "error", text: "获取广告列表失败" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "名称不能为空" });
      return;
    }
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/ads/${editing.id}` : "/api/ads";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: editing ? "广告位已更新" : "广告位已创建" });
        fetchData();
        resetForm();
      } else {
        setMessage({ type: "error", text: data.error || "操作失败" });
      }
    } catch {
      setMessage({ type: "error", text: "网络错误" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此广告位？")) return;
    try {
      const res = await fetch(`/api/ads/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "已删除" });
        fetchData();
      }
    } catch {
      setMessage({ type: "error", text: "删除失败" });
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    setToggling(id);
    try {
      const res = await fetch(`/api/ads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) fetchData();
    } catch {
      setMessage({ type: "error", text: "操作失败" });
    } finally {
      setToggling(null);
    }
  };

  const startEdit = (ad: AdSlot) => {
    setEditing(ad);
    setFormData({
      name: ad.name,
      position: ad.position,
      type: ad.type || "image",
      imageUrl: ad.imageUrl || "",
      linkUrl: ad.linkUrl || "",
      targetUrl: ad.targetUrl || "",
      altText: ad.altText || "",
      title: ad.title || "",
      description: ad.description || "",
      buttonText: ad.buttonText || "",
      code: ad.code || "",
      isActive: ad.isActive,
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().split("T")[0] : "",
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().split("T")[0] : "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setShowPreview(false);
    setFormData({
      name: "", position: "TOP_BANNER", type: "image",
      imageUrl: "", linkUrl: "", targetUrl: "", altText: "",
      title: "", description: "", buttonText: "", code: "",
      isActive: true, startDate: new Date().toISOString().split("T")[0], endDate: "",
    });
  };

  const typeIcon = (type: string) => {
    const opt = typeOptions.find(o => o.value === type);
    const Icon = opt?.icon || ImageIcon;
    return <Icon className="w-4 h-4 inline mr-1" />;
  };

  const typeLabel = (type: string) => {
    const opt = typeOptions.find(o => o.value === type);
    return opt?.label || type;
  };

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Megaphone className="w-6 h-6" />
          广告管理
        </h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> 新建广告
        </button>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg text-sm ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
          {message.text}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing ? "编辑广告" : "新建广告"}</h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">广告名称 *</label>
                  <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500" placeholder="如：Amazon 推广" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">广告位</label>
                  <select value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    {positionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">广告类型</label>
                <div className="flex gap-3">
                  {typeOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setFormData({ ...formData, type: opt.value })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm border flex items-center justify-center gap-1 ${formData.type === opt.value ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500"}`}
                    >
                      <opt.icon className="w-4 h-4" /> {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.type === "image" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                    <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="广告标题" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">图片 URL *</label>
                    <input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">跳转链接</label>
                    <input value={formData.targetUrl} onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">按钮文案</label>
                      <input value={formData.buttonText} onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="立即查看" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alt 文本</label>
                      <input value={formData.altText} onChange={(e) => setFormData({ ...formData, altText: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="广告描述" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="广告描述/备注" />
                  </div>
                </>
              )}

              {formData.type === "code" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">广告代码 (HTML/JS) *</label>
                  <textarea value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} rows={8} className="w-full px-3 py-2 border rounded-lg text-sm font-mono resize-none" placeholder="<script>...</script>" />
                </div>
              )}

              {formData.type === "text" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
                    <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="广告标题" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="广告描述内容" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">跳转链接</label>
                      <input value={formData.targetUrl} onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">按钮文案</label>
                      <input value={formData.buttonText} onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="了解更多" />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">结束日期（留空表示长期）</label>
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
                <label htmlFor="isActive" className="text-sm text-gray-700">启用此广告</label>
              </div>

              {/* Preview */}
              {formData.type === "image" && formData.imageUrl && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2">预览：</p>
                  <img src={formData.imageUrl} alt="preview" className="max-w-full max-h-32 object-contain rounded" onError={(e) => (e.currentTarget.style.display = "none")} />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存
                </button>
                <button onClick={resetForm} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">取消</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ad List */}
      <div className="space-y-4">
        {ads.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
            <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg mb-1">暂无广告</p>
            <p className="text-sm">点击上方按钮创建第一个广告。支持图片、HTML 代码、文字三种类型。</p>
          </div>
        )}
        {ads.map((ad) => (
          <div key={ad.id} className={`bg-white rounded-xl border overflow-hidden ${!ad.isActive ? "opacity-60" : ""}`}>
            <div className="p-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{ad.name}</h3>
                  <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">{typeIcon(ad.type)}{typeLabel(ad.type)}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${ad.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {ad.isActive ? "启用" : "已停用"}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  位置：{positionOptions.find(p => p.value === ad.position)?.label || ad.position}
                  {ad.title && ` · ${ad.title}`}
                </p>
                {ad.type === "image" && ad.imageUrl && (
                  <img src={ad.imageUrl} alt={ad.altText || ""} className="mt-2 max-h-20 object-contain rounded" onError={(e) => (e.currentTarget.style.display = "none")} />
                )}
                {ad.type === "code" && ad.code && (
                  <pre className="mt-2 text-xs bg-gray-50 p-2 rounded max-h-20 overflow-hidden">{ad.code.substring(0, 200)}...</pre>
                )}
                {ad.type === "text" && (
                  <p className="mt-1 text-sm text-gray-600">{ad.description || ad.title}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => handleToggle(ad.id, ad.isActive)} disabled={toggling === ad.id} className="p-2 hover:bg-gray-100 rounded">
                  {toggling === ad.id ? <Loader2 className="w-4 h-4 animate-spin" /> : ad.isActive ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-gray-300" />}
                </button>
                <button onClick={() => startEdit(ad)} className="p-2 hover:bg-gray-100 rounded text-blue-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(ad.id)} className="p-2 hover:bg-gray-100 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="px-4 pb-3 flex items-center gap-4 text-xs text-gray-400">
              <span>点击：{ad.clicks}</span>
              <span>展示：{ad.impressions}</span>
              <span>创建：{new Date(ad.createdAt).toLocaleDateString("zh-CN")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
