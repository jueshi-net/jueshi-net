"use client";

import { useState, useEffect } from "react";
import { Megaphone, Plus, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface AdSlot {
  id: string;
  name: string;
  position: string;
  code: string;
  enabled: boolean;
  impressions: number;
  clicks: number;
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
];

const positionIcons: Record<string, string> = {
  TOP_BANNER: "🔝",
  SIDEBAR_LEFT: "⬅️",
  SIDEBAR_RIGHT: "➡️",
  INLINE: "📄",
  FOOTER: "⬇️",
  FLOATING: "🎈",
};

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdSlot | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "",
    position: "TOP_BANNER",
    code: "",
    enabled: true,
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/ads");
      const data = await res.json();
      setAds(data.data || []);
    } catch {
      console.error("Failed to fetch ads");
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
        setMessage({ type: "success", text: "广告位已删除" });
        fetchData();
      }
    } catch {
      setMessage({ type: "error", text: "删除失败" });
    }
  };

  const toggleEnabled = async (ad: AdSlot) => {
    setToggling(ad.id);
    try {
      const res = await fetch(`/api/ads/${ad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !ad.enabled }),
      });
      if (res.ok) fetchData();
    } catch {
      console.error("Failed to toggle");
    } finally {
      setToggling(null);
    }
  };

  const startEdit = (ad: AdSlot) => {
    setEditing(ad);
    setFormData({ name: ad.name, position: ad.position, code: ad.code, enabled: ad.enabled });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ name: "", position: "TOP_BANNER", code: "", enabled: true });
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
          className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> 添加广告位
        </button>
      </div>

      {message.text && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing ? "编辑广告位" : "添加广告位"}</h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="如：首页顶部横幅" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">位置</label>
                <select value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  {positionOptions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">广告代码</label>
                <textarea value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} rows={5} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="&lt;script&gt;...Google Adsense...&lt;/script&gt;" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="enabled" checked={formData.enabled} onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })} />
                <label htmlFor="enabled" className="text-sm text-gray-700">启用</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  保存
                </button>
                <button onClick={resetForm} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">取消</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ad Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <div key={ad.id} className={`bg-white rounded-xl border p-5 transition-all ${ad.enabled ? "border-gray-100 hover:shadow-md" : "border-gray-200 bg-gray-50"}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{positionIcons[ad.position] || "📢"}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{ad.name}</h3>
                  <p className="text-xs text-gray-500">{positionOptions.find(p => p.value === ad.position)?.label}</p>
                </div>
              </div>
              <button
                onClick={() => toggleEnabled(ad)}
                disabled={toggling === ad.id}
                className="p-1 disabled:opacity-50"
              >
                {ad.enabled ? (
                  <ToggleRight className="w-8 h-8 text-green-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>
            {ad.code && (
              <div className="bg-gray-50 rounded-lg p-2 mb-3 max-h-16 overflow-hidden">
                <code className="text-xs text-gray-500 font-mono">{ad.code.slice(0, 100)}{ad.code.length > 100 ? "..." : ""}</code>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
              <span>展示: {ad.impressions.toLocaleString()}</span>
              <span>点击: {ad.clicks.toLocaleString()}</span>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-50">
              <button onClick={() => startEdit(ad)} className="flex-1 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center justify-center gap-1">
                <Edit2 className="w-3 h-3" /> 配置
              </button>
              <button onClick={() => handleDelete(ad.id)} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {ads.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>暂无广告位，点击上方按钮添加</p>
        </div>
      )}
    </div>
  );
}
