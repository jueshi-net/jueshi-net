"use client";

import { useState, useEffect } from "react";
import {
  Megaphone, Plus, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight,
  Loader2, Image as ImageIcon, Code, ChevronDown, AlertCircle, BarChart3,
  Globe, Link as LinkIcon
} from "lucide-react";

interface AdCampaign {
  id: string;
  title: string;
  adType: "DIRECT" | "NETWORK";
  imageUrl: string | null;
  targetUrl: string | null;
  codeSnippet: string | null;
  placements: string[];
  targetCountries: string[];
  isActive: boolean;
  impressions: number;
  clicks: number;
  priority: number;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// All supported countries (sync with SUPPORTED_COUNTRIES)
const COUNTRY_OPTIONS = [
  { code: "CA", name: "🇨🇦 加拿大" }, { code: "US", name: "🇺🇸 美国" },
  { code: "GB", name: "🇬🇧 英国" }, { code: "DE", name: "🇩🇪 德国" },
  { code: "FR", name: "🇫🇷 法国" }, { code: "AU", name: "🇦🇺 澳大利亚" },
  { code: "NZ", name: "🇳🇿 新西兰" }, { code: "JP", name: "🇯🇵 日本" },
  { code: "KR", name: "🇰🇷 韩国" }, { code: "SG", name: "🇸🇬 新加坡" },
  { code: "MY", name: "🇲🇾 马来西亚" }, { code: "TH", name: "🇹🇭 泰国" },
  { code: "VN", name: "🇻🇳 越南" }, { code: "PH", name: "🇵🇭 菲律宾" },
  { code: "ID", name: "🇮🇩 印尼" }, { code: "IN", name: "🇮🇳 印度" },
  { code: "AE", name: "🇦🇪 阿联酋" }, { code: "BR", name: "🇧🇷 巴西" },
];

// Placement options (sync with AdPlacement type)
const PLACEMENT_OPTIONS = [
  { value: "home-hero", label: "首页 Hero 区域" },
  { value: "home-after-tools", label: "首页工具列表下方" },
  { value: "home-before-footer", label: "首页底部之前" },
  { value: "tool-tracking-bottom", label: "物流追踪页底部" },
  { value: "tool-shipping-calculator-bottom", label: "运费计算器页底部" },
  { value: "tool-hs-code-bottom", label: "HS编码页底部" },
  { value: "tool-postal-code-bottom", label: "邮编页底部" },
  { value: "tool-postal-code-mid", label: "邮编页中部" },
  { value: "tool-exchange-rate-bottom", label: "汇率页底部" },
  { value: "tool-memo-bottom", label: "备忘录页底部" },
  { value: "tool-bottom", label: "工具页通用底部" },
  { value: "article-top", label: "文章顶部" },
  { value: "article-bottom", label: "文章底部" },
  { value: "documents-home-top", label: "单据中心顶部" },
  { value: "document-editor-sidebar", label: "单据编辑器侧边栏" },
  { value: "document-editor-bottom", label: "单据编辑器底部" },
  { value: "footer", label: "全站页脚" },
];

type AdType = "DIRECT" | "NETWORK";

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdCampaign | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    title: "",
    adType: "DIRECT" as AdType,
    imageUrl: "",
    targetUrl: "",
    codeSnippet: "",
    placements: [] as string[],
    targetCountries: [] as string[],
    isActive: true,
    priority: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/ads");
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
    if (!formData.title.trim()) {
      setMessage({ type: "error", text: "广告名称不能为空" });
      return;
    }
    if (formData.placements.length === 0) {
      setMessage({ type: "error", text: "至少选择一个投放位置" });
      return;
    }
    if (formData.adType === "DIRECT" && !formData.imageUrl.trim()) {
      setMessage({ type: "error", text: "直投广告需要填写图片 URL" });
      return;
    }
    if (formData.adType === "NETWORK" && !formData.codeSnippet.trim()) {
      setMessage({ type: "error", text: "网盟广告需要填写代码片段" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? "/api/admin/ads" : "/api/admin/ads";
      const payload = editing ? { ...formData, id: editing.id } : formData;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: editing ? "广告已更新" : "广告已创建" });
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
    if (!confirm("确定删除此广告？")) return;
    try {
      const res = await fetch(`/api/admin/ads/${id}`, { method: "DELETE" });
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
      await fetch(`/api/admin/ads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      fetchData();
    } catch {
      setMessage({ type: "error", text: "操作失败" });
    } finally {
      setToggling(null);
    }
  };

  const startEdit = (ad: AdCampaign) => {
    setEditing(ad);
    setFormData({
      title: ad.title,
      adType: ad.adType,
      imageUrl: ad.imageUrl || "",
      targetUrl: ad.targetUrl || "",
      codeSnippet: ad.codeSnippet || "",
      placements: ad.placements || [],
      targetCountries: ad.targetCountries || [],
      isActive: ad.isActive,
      priority: ad.priority,
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().split("T")[0] : "",
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().split("T")[0] : "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({
      title: "",
      adType: "DIRECT",
      imageUrl: "",
      targetUrl: "",
      codeSnippet: "",
      placements: [],
      targetCountries: [],
      isActive: true,
      priority: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    });
    setShowCountryDropdown(false);
  };

  const toggleCountry = (code: string) => {
    setFormData(prev => ({
      ...prev,
      targetCountries: prev.targetCountries.includes(code)
        ? prev.targetCountries.filter(c => c !== code)
        : [...prev.targetCountries, code],
    }));
  };

  const togglePlacement = (value: string) => {
    setFormData(prev => ({
      ...prev,
      placements: prev.placements.includes(value)
        ? prev.placements.filter(p => p !== value)
        : [...prev.placements, value],
    }));
  };

  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);
  const enabledCount = ads.filter(a => a.isActive).length;

  if (loading) return (
    <div className="p-6 text-center text-gray-500 flex items-center justify-center gap-2 min-h-[200px]">
      <Loader2 className="w-5 h-5 animate-spin" /> 加载中...
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold flex items-center gap-2">
              <Megaphone className="w-5 h-5" /> 广告管理中台
            </h1>
            <p className="text-sm text-green-100 mt-1">
              双轨制广告系统 — 直投（图片+链接）与网盟（HTML/JS 代码）并行
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-green-700 rounded-xl text-sm font-bold hover:bg-green-50 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> 新建广告
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-green-700">{enabledCount}</div>
          <div className="text-xs text-green-600">启用中</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-gray-500">{ads.length - enabledCount}</div>
          <div className="text-xs text-gray-400">已停用</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-blue-700">{totalImpressions.toLocaleString()}</div>
          <div className="text-xs text-blue-600">总曝光</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-purple-700">{totalClicks.toLocaleString()}</div>
          <div className="text-xs text-purple-600">总点击</div>
        </div>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === "error"
            ? "bg-red-50 text-red-600 border border-red-200"
            : "bg-green-50 text-green-600 border border-green-200"
        }`}>
          {message.type === "error" && <AlertCircle className="w-4 h-4 inline mr-1" />}{message.text}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {editing ? "编辑广告" : "新建广告"}
                <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                  formData.adType === "DIRECT" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                }`}>
                  {formData.adType === "DIRECT" ? "直投" : "网盟"}
                </span>
              </h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded min-h-[44px]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Ad Type Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">广告类型</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, adType: "DIRECT" })}
                    className={`flex-1 py-3 px-3 rounded-lg text-sm border flex items-center justify-center gap-2 min-h-[44px] transition-colors ${
                      formData.adType === "DIRECT"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                    直投广告（图片+链接）
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, adType: "NETWORK" })}
                    className={`flex-1 py-3 px-3 rounded-lg text-sm border flex items-center justify-center gap-2 min-h-[44px] transition-colors ${
                      formData.adType === "NETWORK"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Code className="w-5 h-5" />
                    代码片段广告（Google Ads）
                  </button>
                </div>
              </div>

              {/* Common fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">广告名称 *</label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="如：Amazon 大促推广"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">优先级</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    min={0}
                  />
                </div>
              </div>

              {/* Placements */}
              <div>
                <label className="block text-sm font-medium mb-2">投放位置（可多选）*</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto border rounded-lg p-2">
                  {PLACEMENT_OPTIONS.map(p => (
                    <label
                      key={p.value}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${
                        formData.placements.includes(p.value)
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.placements.includes(p.value)}
                        onChange={() => togglePlacement(p.value)}
                        className="rounded"
                      />
                      <span className="truncate">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Country Targeting */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  定向国家 <span className="text-gray-400 font-normal">（不选=通投全球）</span>
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-left flex items-center justify-between min-h-[44px]"
                  >
                    <span className="flex flex-wrap gap-1">
                      {formData.targetCountries.length === 0 ? (
                        <span className="text-gray-400">通投所有国家</span>
                      ) : (
                        formData.targetCountries.map(code => {
                          const c = COUNTRY_OPTIONS.find(o => o.code === code);
                          return (
                            <span key={code} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                              {c?.name || code}
                              <button onClick={(e) => { e.stopPropagation(); toggleCountry(code); }} className="ml-0.5">×</button>
                            </span>
                          );
                        })
                      )}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>

                  {showCountryDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-52 overflow-y-auto p-1">
                      <div className="grid grid-cols-2 gap-0.5">
                        {COUNTRY_OPTIONS.map(c => (
                          <button
                            key={c.code}
                            onClick={() => toggleCountry(c.code)}
                            className={`text-left px-3 py-2 rounded text-sm min-h-[36px] ${
                              formData.targetCountries.includes(c.code)
                                ? "bg-blue-50 text-blue-700"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {formData.targetCountries.includes(c.code) ? "✓ " : ""}{c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* DIRECT ad fields */}
              {formData.adType === "DIRECT" && (
                <div className="space-y-4 border border-blue-100 rounded-xl p-4 bg-blue-50/30">
                  <h3 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> 直投广告配置
                  </h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">图片 URL *</label>
                    <input
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                      placeholder="https://..."
                    />
                    {formData.imageUrl && (
                      <div className="mt-2 border rounded-lg p-2 bg-white">
                        <p className="text-xs text-gray-500 mb-1">预览：</p>
                        <img
                          src={formData.imageUrl}
                          alt="preview"
                          className="max-w-full max-h-32 object-contain rounded"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                      <LinkIcon className="w-3.5 h-3.5" /> 落地页链接
                    </label>
                    <input
                      value={formData.targetUrl}
                      onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}

              {/* NETWORK ad fields */}
              {formData.adType === "NETWORK" && (
                <div className="space-y-3 border border-purple-100 rounded-xl p-4 bg-purple-50/30">
                  <h3 className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                    <Code className="w-4 h-4" /> 网盟代码配置
                  </h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">广告代码 (HTML/JS) *</label>
                    <textarea
                      value={formData.codeSnippet}
                      onChange={(e) => setFormData({ ...formData, codeSnippet: e.target.value })}
                      rows={10}
                      className="w-full px-3 py-2 border rounded-lg text-sm font-mono resize-none"
                      placeholder={"<!-- Google AdSense 示例 -->\n<ins class=\"adsbygoogle\"\n     style=\"display:block\"\n     data-ad-client=\"ca-pub-XXXX\"\n     data-ad-slot=\"XXXX\"\n     data-ad-format=\"auto\"\n     data-full-width-responsive=\"true\"></ins>\n<script>\n(adsbygoogle = window.adsbygoogle || []).push({});\n</script>"}
                    />
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ 代码广告将在前台通过 dangerouslySetInnerHTML + 动态 script 注入渲染，请确保代码安全
                    </p>
                  </div>
                </div>
              )}

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">开始日期</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">结束日期（留空=长期有效）</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm text-yellow-800 font-medium">
                  启用此广告 — 禁用后不会在前台展示
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 min-h-[44px]"
                >
                  取消
                </button>
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
            <p className="text-sm">点击「新建广告」创建第一个广告。支持直投和网盟两种模式。</p>
          </div>
        )}
        {ads.map((ad) => (
          <div
            key={ad.id}
            className={`bg-white rounded-xl border overflow-hidden transition-opacity ${
              !ad.isActive ? "opacity-60" : ""
            }`}
          >
            <div className="p-4 flex items-start justify-between flex-wrap gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                    ad.adType === "DIRECT"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {ad.adType === "DIRECT" ? "直投" : "网盟"}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    ad.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                  }`}>
                    {ad.isActive ? "启用" : "已停用"}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-1">
                  投放位置：{ad.placements.map(p => {
                    const opt = PLACEMENT_OPTIONS.find(o => o.value === p);
                    return opt?.label || p;
                  }).join("、")}
                </p>

                {ad.targetCountries.length > 0 && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    定向：{ad.targetCountries.map(code => {
                      const c = COUNTRY_OPTIONS.find(o => o.code === code);
                      return c?.name || code;
                    }).join("、")}
                  </p>
                )}

                {ad.adType === "DIRECT" && ad.imageUrl && (
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="mt-2 max-h-16 object-contain rounded"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                {ad.adType === "NETWORK" && ad.codeSnippet && (
                  <pre className="mt-2 text-xs bg-gray-50 p-2 rounded max-h-16 overflow-auto font-mono">
                    {ad.codeSnippet.substring(0, 150)}...
                  </pre>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(ad.id, ad.isActive)}
                  disabled={toggling === ad.id}
                  className="p-2 hover:bg-gray-100 rounded min-h-[44px]"
                >
                  {toggling === ad.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : ad.isActive
                      ? <ToggleRight className="w-6 h-6 text-green-500" />
                      : <ToggleLeft className="w-6 h-6 text-gray-300" />
                  }
                </button>
                <button
                  onClick={() => startEdit(ad)}
                  className="p-2 hover:bg-gray-100 rounded text-blue-600 min-h-[44px]"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="p-2 hover:bg-gray-100 rounded text-red-600 min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-4 pb-3 flex items-center gap-4 text-xs text-gray-400 border-t">
              <span className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" /> 曝光：{ad.impressions.toLocaleString()}
              </span>
              <span>点击：{ad.clicks.toLocaleString()}</span>
              <span>优先级：{ad.priority}</span>
              <span className="ml-auto">
                创建：{new Date(ad.createdAt).toLocaleDateString("zh-CN")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
