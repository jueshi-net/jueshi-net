"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Loader2, Save, Sparkles, Plus, Trash2, Globe, BookOpen,
  Shield, Wrench, AlertCircle, ChevronDown
} from "lucide-react";

interface Guide { title: string; description: string; type: string }
interface Service { title: string; category: string; description: string }

interface FormData {
  id: string; slug: string; name: string; nameEn: string; currency: string;
  region: string; emoji: string; heroTitle: string; heroSubtitle: string;
  seoTitle: string; seoDescription: string; keywords: string; keyCities: string;
  userCount: string; docCount: string; isActive: boolean;
  tools: string[]; guides: Guide[]; services: Service[];
}

const REGION_OPTIONS = ["北美", "欧洲", "东南亚", "日韩", "拉美", "中东", "澳洲"];
const CURRENCY_OPTIONS = ["USD", "CAD", "GBP", "EUR", "MYR", "JPY", "KRW", "AUD", "NZD", "BRL", "ARS", "CLP", "AED", "SAR", "THB", "VND", "PHP", "IDR", "SGD", "INR", "MXN"];
const GUIDE_TYPES = [
  { value: "guide", label: "📖 指南" },
  { value: "regulation", label: "📜 法规" },
  { value: "tax", label: "💰 税务" },
  { value: "logistics", label: "🚢 物流" },
  { value: "customs", label: "🏛️ 报关" },
];
const SERVICE_CATEGORIES = ["仓储", "物流", "报关", "税务", "合规", "代购"];

// All available tool slugs (sync with document-tools-config + standalone)
const ALL_TOOL_SLUGS = [
  "commercial-invoice", "proforma-invoice", "packing-list", "sales-contract",
  "booking-instruction", "customs-declaration-authorization", "delivery-note",
  "freight-statement", "consolidation-inbound-receipt", "consolidation-packing-list",
  "express-declaration", "quotation", "shipping-instruction", "trucking-dispatch-order",
  "shipping-mark", "container-loading-list", "return-packing-list",
  "certificate-of-origin-template", "fumigation-certificate-template",
  "letter-of-credit-info-sheet", "label-maker", "postal-code",
  "shipping-calculator", "exchange-rate",
];

const TOOL_NAMES: Record<string, string> = {
  "commercial-invoice": "🧾 商业发票", "proforma-invoice": "📋 形式发票",
  "packing-list": "📦 装箱单", "sales-contract": "📄 销售合同",
  "booking-instruction": "🚢 订舱委托", "customs-declaration-authorization": "🏛️ 报关授权",
  "delivery-note": "🚚 送货单", "freight-statement": "💰 运费账单",
  "consolidation-inbound-receipt": "📥 集运入库单", "consolidation-packing-list": "📫 集运装箱单",
  "express-declaration": "✈️ 快递报关单", "quotation": "📝 报价单",
  "shipping-instruction": "📋 装船通知", "trucking-dispatch-order": "🚛 派车单",
  "shipping-mark": "🏷️ 唛头标签", "container-loading-list": "📦 装柜清单",
  "return-packing-list": "↩️ 退运装箱单",
  "certificate-of-origin-template": "🏅 原产地证", "fumigation-certificate-template": "🪵 熏蒸证书",
  "letter-of-credit-info-sheet": "💳 信用证信息表", "label-maker": "📌 标签生成器",
  "postal-code": "📮 邮编查询", "shipping-calculator": "📐 运费计算器",
  "exchange-rate": "💱 汇率换算",
};

export default function DestinationEditPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState<"basic" | "guides" | "services" | "tools">("basic");

  const [form, setForm] = useState<FormData>({
    id: "", slug: "", name: "", nameEn: "", currency: "USD",
    region: "", emoji: "", heroTitle: "", heroSubtitle: "",
    seoTitle: "", seoDescription: "", keywords: "", keyCities: "",
    userCount: "0", docCount: "0", isActive: true,
    tools: [], guides: [], services: [],
  });

  const isEditMode = slug !== "new";

  const [countryInput, setCountryInput] = useState("");

  useEffect(() => {
    if (isEditMode && slug) fetchData();
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/destinations?slug=${slug}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const d = data.data;
      if (!d) {
        setMessage({ type: "error", text: `未找到国家 "${slug}"` });
        setLoading(false);
        return;
      }
      setForm({
        id: d.id || "", slug: d.slug, name: d.name, nameEn: d.nameEn,
        currency: d.currency, region: d.region, emoji: d.emoji,
        heroTitle: d.heroTitle, heroSubtitle: d.heroSubtitle,
        seoTitle: d.seoTitle, seoDescription: d.seoDescription,
        keywords: (d.keywords || []).join(", "),
        keyCities: (d.keyCities || []).join(", "),
        userCount: d.userCount, docCount: d.docCount,
        isActive: d.isActive,
        tools: (d.tools || []).map((t: any) => t.toolSlug),
        guides: (d.guides || []).map((g: any) => ({ title: g.title, description: g.description, type: g.type })),
        services: (d.services || []).map((s: any) => ({ title: s.title, category: s.category, description: s.description })),
      });
    } catch (e: any) {
      setMessage({ type: "error", text: `获取数据失败: ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!countryInput.trim()) {
      setMessage({ type: "error", text: "请先输入国家名称" });
      return;
    }
    setGenerating(true);
    setMessage({ type: "", text: "" });
    try {
      const [namePart, enPart] = countryInput.trim().split(/[\s/（(]+/);
      const res = await fetch("/api/admin/destinations/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryName: namePart || countryInput, countryEn: enPart || "" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const g = data.data;
      setForm(prev => ({
        ...prev,
        slug: g.slug || prev.slug || (g.nameEn || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        name: g.name || prev.name,
        nameEn: g.nameEn || prev.nameEn,
        currency: g.currency || prev.currency,
        region: g.region || prev.region,
        emoji: g.emoji || prev.emoji,
        heroTitle: g.heroTitle || prev.heroTitle,
        heroSubtitle: g.heroSubtitle || prev.heroSubtitle,
        seoTitle: g.seoTitle || prev.seoTitle,
        seoDescription: g.seoDescription || prev.seoDescription,
        keywords: (g.keywords || []).join(", "),
        keyCities: (g.keyCities || []).join(", "),
        userCount: g.userCount || prev.userCount,
        docCount: g.docCount || prev.docCount,
        guides: (g.guides || []).map((gi: any) => ({ title: gi.title, description: gi.description, type: gi.type })),
        services: (g.services || []).map((si: any) => ({ title: si.title, category: si.category, description: si.description })),
        tools: g.tools || prev.tools,
      }));
      setMessage({ type: "success", text: "✨ AI 数据已填入表单，请检查修改后保存" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!form.slug.trim() || !form.name.trim() || !form.nameEn.trim()) {
      setMessage({ type: "error", text: "slug、名称、英文名不能为空" });
      return;
    }
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const body: any = {
        slug: form.slug.trim(), name: form.name.trim(), nameEn: form.nameEn.trim(),
        currency: form.currency, region: form.region, emoji: form.emoji,
        heroTitle: form.heroTitle, heroSubtitle: form.heroSubtitle,
        seoTitle: form.seoTitle, seoDescription: form.seoDescription,
        keywords: form.keywords.split(/[,，\n]/).map(s => s.trim()).filter(Boolean),
        keyCities: form.keyCities.split(/[,，\n]/).map(s => s.trim()).filter(Boolean),
        userCount: form.userCount, docCount: form.docCount,
        isActive: form.isActive,
        tools: form.tools,
        guides: form.guides.map(g => ({ title: g.title, description: g.description, type: g.type })),
        services: form.services.map(s => ({ title: s.title, category: s.category, description: s.description })),
      };
      if (form.id) body.id = form.id;

      const method = form.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/destinations", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "✅ 保存成功！" });
        setForm(prev => ({ ...prev, id: data.data.id }));
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "网络错误" });
    } finally {
      setSaving(false);
    }
  };

  // Guides CRUD
  const addGuide = () => setForm(f => ({ ...f, guides: [...f.guides, { title: "", description: "", type: "guide" }] }));
  const updateGuide = (i: number, field: keyof Guide, value: string) =>
    setForm(f => ({ ...f, guides: f.guides.map((g, j) => j === i ? { ...g, [field]: value } : g) }));
  const removeGuide = (i: number) => setForm(f => ({ ...f, guides: f.guides.filter((_, j) => j !== i) }));

  // Services CRUD
  const addService = () => setForm(f => ({ ...f, services: [...f.services, { title: "", category: "仓储", description: "" }] }));
  const updateService = (i: number, field: keyof Service, value: string) =>
    setForm(f => ({ ...f, services: f.services.map((s, j) => j === i ? { ...s, [field]: value } : s) }));
  const removeService = (i: number) => setForm(f => ({ ...f, services: f.services.filter((_, j) => j !== i) }));

  // Tools toggle
  const toggleTool = (toolSlug: string) =>
    setForm(f => ({ ...f, tools: f.tools.includes(toolSlug) ? f.tools.filter(t => t !== toolSlug) : [...f.tools, toolSlug] }));

  if (loading) return (
    <div className="p-6 text-center text-gray-500 flex items-center justify-center gap-2 min-h-[300px]">
      <Loader2 className="w-5 h-5 animate-spin" /> 加载中...
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/destinations")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              {isEditMode ? (form.name ? `✏️ 编辑国家: ${form.emoji || ''} ${form.name}` : "✏️ 编辑国家") : "✨ 新增国家"}
            </h1>
            {form.slug && <p className="text-xs text-gray-400 font-mono">/{form.slug}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/admin/destinations")} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">取消</button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} <Save className="w-4 h-4" /> 保存并发布
          </button>
        </div>
      </div>

      {/* AI Generator Bar */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border border-purple-200 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 text-sm font-semibold text-purple-700">
            <Sparkles className="w-4 h-4" /> AI 一键生成
          </div>
          <div className="flex-1 flex gap-2 w-full sm:w-auto">
            <input
              value={countryInput} onChange={e => setCountryInput(e.target.value)}
              placeholder="输入国家名称，如「英国」「日本」「澳大利亚」..."
              className="flex-1 px-3 py-2 border border-purple-200 rounded-lg text-sm bg-white focus:border-purple-400 focus:outline-none"
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
            />
            <button
              onClick={handleGenerate} disabled={generating}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "AI 生成中..." : "一键生成全套数据"}
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-3 rounded-lg text-sm ${message.type === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`}>
          {message.type === "error" && <AlertCircle className="w-4 h-4 inline mr-1" />}{message.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {[
          { key: "basic" as const, label: "基础与 SEO", icon: Globe },
          { key: "guides" as const, label: `百科指南 (${form.guides.length})`, icon: BookOpen },
          { key: "services" as const, label: `服务商 (${form.services.length})`, icon: Shield },
          { key: "tools" as const, label: `工具挂载 (${form.tools.length})`, icon: Wrench },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${activeTab === tab.key ? "bg-white shadow text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {activeTab === "basic" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Slug *</label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="united-kingdom" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">中文名 *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="英国" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">英文名 *</label>
                <input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="United Kingdom" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Emoji</label>
                <input value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm text-center" placeholder="🇬🇧" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">区域</label>
                <div className="relative">
                  <select value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm appearance-none bg-white">
                    <option value="">选择区域</option>
                    {REGION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">货币</label>
                <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">商家数</label>
                  <input value={form.userCount} onChange={e => setForm({ ...form, userCount: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="12,500+" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">单据数</label>
                  <input value={form.docCount} onChange={e => setForm({ ...form, docCount: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="45,000+" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Hero 标题</label>
                <input value={form.heroTitle} onChange={e => setForm({ ...form, heroTitle: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Hero 副标题</label>
                <input value={form.heroSubtitle} onChange={e => setForm({ ...form, heroSubtitle: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">热门城市（逗号分隔）</label>
              <input value={form.keyCities} onChange={e => setForm({ ...form, keyCities: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">SEO Title</label>
                <input value={form.seoTitle} onChange={e => setForm({ ...form, seoTitle: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">SEO Keywords（逗号分隔）</label>
                <input value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">SEO Description</label>
              <textarea value={form.seoDescription} onChange={e => setForm({ ...form, seoDescription: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                发布上线
              </label>
            </div>
          </div>
        )}

        {activeTab === "guides" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{form.guides.length} 条指南</p>
              <button onClick={addGuide} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> 新增指南
              </button>
            </div>
            {form.guides.map((g, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">指南 #{i + 1}</span>
                  <button onClick={() => removeGuide(i)} className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <input value={g.title} onChange={e => updateGuide(i, "title", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm font-medium" placeholder="指南标题" />
                <textarea value={g.description} onChange={e => updateGuide(i, "description", e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="80-150字描述..." />
                <div className="flex gap-1 flex-wrap">
                  {GUIDE_TYPES.map(gt => (
                    <button key={gt.value} onClick={() => updateGuide(i, "type", gt.value)}
                      className={`px-2 py-1 rounded text-xs border transition-colors ${g.type === gt.value ? "bg-blue-50 text-blue-700 border-blue-200" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                      {gt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {form.guides.length === 0 && <p className="text-center text-gray-400 py-8">暂无指南，点击上方按钮添加</p>}
          </div>
        )}

        {activeTab === "services" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{form.services.length} 个服务商</p>
              <button onClick={addService} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> 新增服务商
              </button>
            </div>
            {form.services.map((s, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">服务商 #{i + 1}</span>
                  <button onClick={() => removeService(i)} className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <input value={s.title} onChange={e => {
                  const svcs = [...form.services];
                  svcs[i] = { ...svcs[i], title: e.target.value };
                  setForm({ ...form, services: svcs });
                }} className="w-full px-3 py-2 border rounded-lg text-sm font-medium" placeholder="服务商标题" />
                <textarea value={s.description} onChange={e => {
                  const svcs = [...form.services];
                  svcs[i] = { ...svcs[i], description: e.target.value };
                  setForm({ ...form, services: svcs });
                }} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="50-80字描述..." />
                <div className="flex gap-1 flex-wrap">
                  {SERVICE_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => {
                      const svcs = [...form.services];
                      svcs[i] = { ...svcs[i], category: cat };
                      setForm({ ...form, services: svcs });
                    }}
                      className={`px-2 py-1 rounded text-xs border transition-colors ${s.category === cat ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {form.services.length === 0 && <p className="text-center text-gray-400 py-8">暂无服务商，点击上方按钮添加</p>}
          </div>
        )}

        {activeTab === "tools" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">勾选需要在此国家页面展示的工具（{form.tools.length} 个已选）</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {ALL_TOOL_SLUGS.map(tool => {
                const selected = form.tools.includes(tool);
                return (
                  <button
                    key={tool}
                    onClick={() => toggleTool(tool)}
                    className={`px-3 py-2.5 rounded-lg text-sm border text-left transition-all ${selected
                      ? "bg-blue-50 border-blue-300 text-blue-700 shadow-sm"
                      : "border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium truncate">{TOOL_NAMES[tool] || tool}</div>
                    <div className="text-[10px] text-gray-400 font-mono truncate">{tool}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4">
        <button onClick={() => router.push("/admin/destinations")} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">← 返回列表</button>
        <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
          {saving && <Loader2 className="w-5 h-5 animate-spin" />} <Save className="w-5 h-5" /> 保存并发布
        </button>
      </div>
    </div>
  );
}
