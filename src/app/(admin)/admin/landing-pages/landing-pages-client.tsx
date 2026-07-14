"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Search, X, Save, Loader2, Trash2, Eye, EyeOff, ExternalLink, AlertTriangle, ChevronDown, ChevronRight, ArrowUp, ArrowDown, Layout } from "lucide-react";
import { WorkspacePageHeader } from "@/components/saas/WorkspacePageHeader";
import { SectionCard } from "@/components/saas/SectionCard";
import { StatusBadge } from "@/components/design-system/StatusBadge";
import { EmptyState } from "@/components/design-system/EmptyState";
import { CompactTable } from "@/components/saas/CompactTable";

const PAGE_TYPES = ["country", "tool", "topic", "guide", "city", "postal", "landing", "checklist"];
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
  updatedAt: string;
  publishedAt: string | null;
  heroSection: any;
  faqItems: any;
  officialLinks: any;
  ctaConfig: any;
  blockVisibility: any;
  blockOrder: any;
}

// Default block definitions for landing pages
const BLOCK_DEFS = [
  { key: "hero", label: "Hero 横幅" },
  { key: "primaryTool", label: "主工具卡片" },
  { key: "hotCities", label: "热门城市" },
  { key: "relatedTools", label: "相关工具" },
  { key: "relatedTopics", label: "相关专题" },
  { key: "relatedArticles", label: "相关文章" },
  { key: "relatedChecklists", label: "相关清单" },
  { key: "faq", label: "常见问题 FAQ" },
  { key: "officialLinks", label: "官方链接" },
  { key: "cta", label: "CTA 行动号召" },
];

const KNOWN_TOOLS = [
  "shipping-calculator", "shipping-estimator", "hs-code", "sensitive-goods",
  "postal-code", "address-formatter", "invoice", "commercial-invoice",
  "quote", "quote-sheet", "calculator", "customs-generator",
  "qrcode", "exchange-rate", "tracking", "documents",
  "shipping-mark", "container", "handover-note", "receipt",
  "debit-note", "shipping-label", "inbound-receipt", "memo",
  "inbound", "zip", "video-script-sop", "document-tools",
];

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'neutral' | 'danger'> = {
  draft: 'neutral',
  published: 'success',
  hidden: 'danger',
};

const statusLabels: Record<string, string> = { draft: "草稿", published: "已发布", hidden: "已隐藏" };

export default function LandingPagesClient() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LandingPage | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ pageType: "", status: "", search: "" });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ slug: "", title: "", seoTitle: "", seoDescription: "", pageType: "landing", status: "draft", primaryTool: "", relatedTools: "", relatedTopics: "", relatedArticles: "", heroSectionJson: "", blockVisibility: "{}", blockOrder: "[]" });

  // Structured editing state for checklists
  const [editMode, setEditMode] = useState<"structured" | "json">("structured");
  const [checklistForm, setChecklistForm] = useState<any>({});
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

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

  // Sync checklistForm with heroSection JSON
  const initChecklistForm = (heroJson: string) => {
    try {
      const hs = heroJson ? JSON.parse(heroJson) : {};
      setChecklistForm({
        checklistType: hs.checklistType || "",
        audience: hs.audience || "",
        region: hs.region || "",
        city: hs.city || "",
        scenario: hs.scenario || "",
        difficulty: hs.difficulty || "medium",
        estimatedTime: hs.estimatedTime || "",
        quickAnswer: hs.quickAnswer || "",
        lastReviewedAt: hs.lastReviewedAt || "",
        requiresHumanReview: hs.requiresHumanReview ?? true,
        sections: Array.isArray(hs.sections) ? hs.sections.map((s: any) => ({
          ...s,
          items: Array.isArray(s.items) ? s.items : []
        })) : [],
        avoidPitfalls: Array.isArray(hs.avoidPitfalls) ? hs.avoidPitfalls : [],
        nextSteps: Array.isArray(hs.nextSteps) ? hs.nextSteps.map((s: any) => typeof s === "string" ? { title: s, url: "", type: "checklist" as const } : s) : [],
        officialLinks: Array.isArray(hs.officialLinks) ? hs.officialLinks.map((l: any) => ({ ...l, needsReview: l.needsReview ?? (!l.url || l.url === "") })) : [],
        internalLinks: hs.internalLinks || { backToTopic: "", relatedTools: [], relatedArticles: [], nextChecklists: [] },
      });
    } catch {
      setChecklistForm({ sections: [], avoidPitfalls: [], nextSteps: [], officialLinks: [], internalLinks: {} });
    }
  };

  const syncChecklistToJson = () => {
    const hs = {
      checklistType: checklistForm.checklistType,
      audience: checklistForm.audience,
      region: checklistForm.region,
      city: checklistForm.city || "",
      scenario: checklistForm.scenario,
      difficulty: checklistForm.difficulty,
      estimatedTime: checklistForm.estimatedTime,
      quickAnswer: checklistForm.quickAnswer,
      lastReviewedAt: checklistForm.lastReviewedAt,
      requiresHumanReview: checklistForm.requiresHumanReview,
      sections: checklistForm.sections || [],
      avoidPitfalls: checklistForm.avoidPitfalls || [],
      nextSteps: (checklistForm.nextSteps || []).map((s: any) => typeof s === "string" ? s : s.title),
      officialLinks: (checklistForm.officialLinks || []).map((l: any) => ({ label: l.label, url: l.url || "" })),
      internalLinks: checklistForm.internalLinks || {},
    };
    setForm(f => ({ ...f, heroSectionJson: JSON.stringify(hs, null, 2) }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    // If in structured mode, sync to JSON first
    if (form.pageType === "checklist" && editMode === "structured") {
      syncChecklistToJson();
    }
    const data: any = {
      slug: form.slug, title: form.title,
      seoTitle: form.seoTitle || null, seoDescription: form.seoDescription || null,
      pageType: form.pageType, status: form.status,
      primaryTool: form.primaryTool || null,
      relatedTools: form.relatedTools.split(",").map(s => s.trim()).filter(Boolean),
      relatedTopics: form.relatedTopics.split(",").map(s => s.trim()).filter(Boolean),
      relatedArticles: form.relatedArticles.split(",").map(s => s.trim()).filter(Boolean),
    };
    // Parse block visibility and order
    try {
      const bv = JSON.parse(form.blockVisibility || "{}");
      if (Object.keys(bv).length > 0) data.blockVisibility = bv;
    } catch {}
    try {
      const bo = JSON.parse(form.blockOrder || "[]");
      if (Array.isArray(bo) && bo.length > 0) data.blockOrder = bo;
    } catch {}
    if (form.pageType === "checklist" && form.heroSectionJson) {
      try {
        data.heroSection = JSON.parse(form.heroSectionJson);
      } catch (e) {
        alert("清单 JSON 格式错误: " + (e as Error).message);
        setSaving(false);
        return;
      }
    }

    // Publish gate: validate checklist before allowing published
    if (data.status === "published" && data.pageType === "checklist") {
      const tempPage: LandingPage = {
        ...editing,
        ...data,
        id: editing?.id || "",
        relatedTools: data.relatedTools,
        relatedTopics: data.relatedTopics,
        relatedArticles: data.relatedArticles,
      };
      const publishErrors = validateChecklistPublish(tempPage);
      if (publishErrors.length > 0) {
        alert("清单发布审核未通过，以下问题必须解决后才能发布为 published：\n\n" + publishErrors.join("\n"));
        setSaving(false);
        return;
      }
    }

    const url = editing ? `/api/admin/landing-pages/${editing.id}` : "/api/admin/landing-pages";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) {
      setForm({ slug: "", title: "", seoTitle: "", seoDescription: "", pageType: "landing", status: "draft", primaryTool: "", relatedTools: "", relatedTopics: "", relatedArticles: "", heroSectionJson: "", blockVisibility: "{}", blockOrder: "[]" });
      setEditing(null);
      setShowForm(false);
      setEditMode("structured");
      fetchPages();
    } else {
      const err = await res.json();
      alert(err.error || "操作失败");
    }
    setSaving(false);
  };

  const handleEdit = (p: LandingPage) => {
    setEditing(p);
    const heroJson = p.heroSection ? JSON.stringify(p.heroSection, null, 2) : "";
    setForm({ slug: p.slug, title: p.title, seoTitle: p.seoTitle || "", seoDescription: p.seoDescription || "", pageType: p.pageType, status: p.status, primaryTool: p.primaryTool || "", relatedTools: (p.relatedTools || []).join(", "), relatedTopics: (p.relatedTopics || []).join(", "), relatedArticles: (p.relatedArticles || []).join(", "), heroSectionJson: heroJson, blockVisibility: JSON.stringify(p.blockVisibility || {}), blockOrder: JSON.stringify(p.blockOrder || []) });
    if (p.pageType === "checklist") {
      initChecklistForm(heroJson);
      setEditMode("structured");
    }
    setShowForm(true);
  };

  const handleStatus = async (p: LandingPage, newStatus: string) => {
    // Publish gate for checklist
    if (newStatus === "published" && p.pageType === "checklist") {
      const publishErrors = validateChecklistPublish(p);
      if (publishErrors.length > 0) {
        alert("清单发布审核未通过，以下问题必须解决后才能发布为 published：\n\n" + publishErrors.join("\n"));
        return;
      }
    }
    const res = await fetch(`/api/admin/landing-pages/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
    if (res.ok) fetchPages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此落地页配置吗？")) return;
    const res = await fetch(`/api/admin/landing-pages/${id}`, { method: "DELETE" });
    if (res.ok) fetchPages();
  };

  const getSlugWarnings = (p: LandingPage) => {
    const warnings: string[] = [];
    const invalidTools = (p.relatedTools || []).filter(s => !KNOWN_TOOLS.includes(s));
    if (invalidTools.length > 0) warnings.push(`无效工具 slug: ${invalidTools.join(", ")}`);
    if (p.primaryTool && !KNOWN_TOOLS.includes(p.primaryTool)) warnings.push(`无效主工具 slug: ${p.primaryTool}`);
    // Internal linking warnings for checklists
    if (p.pageType === "checklist") {
      if ((p.relatedTools || []).length < 2) warnings.push(`清单相关工具少于 2 个，建议增加内链`);
      const hs = p.heroSection || {};
      if (!(p.relatedTopics || []).length && !hs.internalLinks?.backToTopic) warnings.push(`清单缺少所属专题链接`);
      if (!hs.nextSteps || hs.nextSteps.length === 0) warnings.push(`清单缺少下一步推荐`);
    }
    return warnings;
  };

  // Checklist publish gate validation — blocks published status
  const validateChecklistPublish = (page: LandingPage): string[] => {
    const errors: string[] = [];
    if (page.pageType !== "checklist") return errors;
    const hs = page.heroSection || {};

    if (hs.requiresHumanReview === true) {
      errors.push("❌ 清单标记为「需人工核验」，必须完成所有人工核验项后才允许发布。");
    }

    const ol = page.officialLinks || [];
    const emptyUrls = ol.filter((l: any) => !l.url || l.url === "");
    const needsReview = ol.filter((l: any) => l.needsReview === true);
    if (emptyUrls.length > 0) {
      errors.push(`❌ 有 ${emptyUrls.length} 个官方链接 URL 为空，必须填写完整后才允许发布。`);
    }
    if (needsReview.length > 0) {
      errors.push(`❌ 有 ${needsReview.length} 个官方链接标记为「待核验」，必须完成核验后才允许发布。`);
    }

    const sections = hs.sections || [];
    if (!Array.isArray(sections) || sections.length < 3) {
      errors.push(`❌ 分组数量不足（${Array.isArray(sections) ? sections.length : 0} < 3），至少需要 3 个分组。`);
    }

    const totalItems = Array.isArray(sections)
      ? sections.reduce((sum: number, s: any) => sum + (Array.isArray(s.items) ? s.items.length : 0), 0)
      : 0;
    if (totalItems < 10) {
      errors.push(`❌ 清单步骤数量不足（${totalItems} < 10），至少需要 10 个步骤。`);
    }

    const faqs = Array.isArray(page.faqItems) ? page.faqItems.length : 0;
    if (faqs < 5) {
      errors.push(`❌ FAQ 数量不足（${faqs} < 5），至少需要 5 个。`);
    }

    const pitfalls = Array.isArray(hs.avoidPitfalls) ? hs.avoidPitfalls.length : 0;
    if (pitfalls < 5) {
      errors.push(`❌ 避坑提醒数量不足（${pitfalls} < 5），至少需要 5 条。`);
    }

    const tools = Array.isArray(page.relatedTools) ? page.relatedTools.length : 0;
    if (tools < 3) {
      errors.push(`❌ 相关工具数量不足（${tools} < 3），至少需要 3 个。`);
    }

    if (!page.seoTitle) errors.push("❌ SEO 标题为空。");
    if (!page.seoDescription) errors.push("❌ SEO 描述为空。");

    return errors;
  };

  // Warnings (non-blocking) for checklist editing
  const getChecklistPublishWarnings = (page: LandingPage): string[] => {
    const warnings: string[] = [];
    if (page.pageType !== "checklist") return warnings;
    const hs = page.heroSection || {};

    if (!(hs.internalLinks?.backToTopic)) {
      warnings.push("⚠️ 所属专题链接为空，建议填写以增强内链。");
    }

    if (!hs.nextSteps || hs.nextSteps.length === 0) {
      warnings.push("⚠️ 下一步推荐为空，建议添加以提高页面间导航。");
    }

    if (!page.relatedArticles || page.relatedArticles.length === 0) {
      warnings.push("⚠️ 未关联相关文章，建议添加以增强内容深度。");
    }

    return warnings;
  };

  const getPreviewSummary = (p: LandingPage) => {
    const hero = p.heroSection as { title?: string; ctaText?: string } | null;
    const faqs = Array.isArray(p.faqItems) ? p.faqItems.length : 0;
    const links = Array.isArray(p.officialLinks) ? p.officialLinks.length : 0;
    const hasCta = !!p.ctaConfig;
    return `Hero: ${hero?.title || "无"} | 工具: ${(p.relatedTools || []).length}+主 | 专题: ${(p.relatedTopics || []).length} | 文章: ${(p.relatedArticles || []).length} | FAQ: ${faqs} | 外链: ${links} | CTA: ${hasCta ? "有" : "无"}`;
  };

  // ─── Structured Checklist Editor ───
  const renderChecklistStructured = () => {
    const cf = checklistForm;
    const setCF = (field: string, value: any) => {
      setChecklistForm((prev: any) => ({ ...prev, [field]: value }));
    };

    const addSection = () => setCF("sections", [...(cf.sections || []), { id: `sec-${Date.now()}`, title: "新分组", description: "", items: [] }]);
    const removeSection = (idx: number) => setCF("sections", (cf.sections || []).filter((_: any, i: number) => i !== idx));
    const updateSection = (idx: number, field: string, value: any) => {
      const sections = [...(cf.sections || [])];
      sections[idx] = { ...sections[idx], [field]: value };
      setCF("sections", sections);
    };

    const addItem = (secIdx: number) => {
      const sections = [...(cf.sections || [])];
      sections[secIdx] = { ...sections[secIdx], items: [...(sections[secIdx].items || []), { id: `item-${Date.now()}`, title: "新步骤", description: "", required: true, priority: "medium", timing: "", warning: "", relatedToolSlug: "", officialLink: {}, completedDefault: false }] };
      setCF("sections", sections);
    };
    const removeItem = (secIdx: number, itemIdx: number) => {
      const sections = [...(cf.sections || [])];
      sections[secIdx] = { ...sections[secIdx], items: (sections[secIdx].items || []).filter((_: any, i: number) => i !== itemIdx) };
      setCF("sections", sections);
    };
    const updateItem = (secIdx: number, itemIdx: number, field: string, value: any) => {
      const sections = [...(cf.sections || [])];
      sections[secIdx] = { ...sections[secIdx], items: [...(sections[secIdx].items || []).map((item: any, i: number) => i === itemIdx ? { ...item, [field]: value } : item)] };
      setCF("sections", sections);
    };

    const toggleSection = (idx: number) => {
      setCollapsedSections(prev => {
        const next = new Set(prev);
        const key = `sec-${idx}`;
        next.has(key) ? next.delete(key) : next.add(key);
        return next;
      });
    };

    const addPitfall = () => setCF("avoidPitfalls", [...(cf.avoidPitfalls || []), ""]);
    const updatePitfall = (idx: number, v: string) => { const a = [...(cf.avoidPitfalls || [])]; a[idx] = v; setCF("avoidPitfalls", a); };
    const removePitfall = (idx: number) => setCF("avoidPitfalls", (cf.avoidPitfalls || []).filter((_: any, i: number) => i !== idx));

    const addNextStep = () => setCF("nextSteps", [...(cf.nextSteps || []), { title: "", url: "", type: "checklist" }]);
    const updateNextStep = (idx: number, field: string, v: string) => { const a = [...(cf.nextSteps || [])]; a[idx] = { ...a[idx], [field]: v }; setCF("nextSteps", a); };
    const removeNextStep = (idx: number) => setCF("nextSteps", (cf.nextSteps || []).filter((_: any, i: number) => i !== idx));

    const addOfficialLink = () => setCF("officialLinks", [...(cf.officialLinks || []), { label: "", url: "", needsReview: true }]);
    const updateOfficialLink = (idx: number, field: string, v: string | boolean) => { const a = [...(cf.officialLinks || [])]; a[idx] = { ...a[idx], [field]: v }; setCF("officialLinks", a); };
    const removeOfficialLink = (idx: number) => setCF("officialLinks", (cf.officialLinks || []).filter((_: any, i: number) => i !== idx));

    const updateInternalLink = (field: string, v: string) => setCF("internalLinks", { ...(cf.internalLinks || {}), [field]: v });

    const inputCls = "w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-colors";
    const labelCls = "block text-xs font-medium text-gray-500 mb-0.5";

    return (
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button onClick={() => setEditMode("structured")} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${editMode === "structured" ? "bg-teal-50 text-teal-700 border border-teal-200" : "text-gray-500 hover:bg-gray-50"}`}>📝 结构化编辑</button>
          <button onClick={() => { syncChecklistToJson(); setEditMode("json"); }} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${editMode === "json" ? "bg-teal-50 text-teal-700 border border-teal-200" : "text-gray-500 hover:bg-gray-50"}`}>{`{ } JSON 高级模式`}</button>
        </div>

        {/* Basic Fields */}
        <div className="grid sm:grid-cols-3 gap-3">
          <div><label className={labelCls}>清单类型</label><select value={cf.checklistType || ""} onChange={e => setCF("checklistType", e.target.value)} className={inputCls}><option value="">选择类型</option><option value="shipping">集运/物流</option><option value="student">留学</option><option value="city">城市生活</option><option value="ecommerce">电商</option><option value="travel">旅行</option><option value="life">生活</option></select></div>
          <div><label className={labelCls}>适用人群</label><input value={cf.audience || ""} onChange={e => setCF("audience", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>地区</label><input value={cf.region || ""} onChange={e => setCF("region", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>城市</label><input value={cf.city || ""} onChange={e => setCF("city", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>场景</label><input value={cf.scenario || ""} onChange={e => setCF("scenario", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>难度</label><select value={cf.difficulty || "medium"} onChange={e => setCF("difficulty", e.target.value)} className={inputCls}><option value="easy">简单</option><option value="medium">中等</option><option value="hard">困难</option></select></div>
          <div><label className={labelCls}>预估时间</label><input value={cf.estimatedTime || ""} onChange={e => setCF("estimatedTime", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>最后更新</label><input type="date" value={cf.lastReviewedAt || ""} onChange={e => setCF("lastReviewedAt", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>需人工核验</label><select value={cf.requiresHumanReview ? "true" : "false"} onChange={e => setCF("requiresHumanReview", e.target.value === "true")} className={inputCls}><option value="true">是</option><option value="false">否</option></select></div>
        </div>
        <div><label className={labelCls}>快速答案</label><textarea value={cf.quickAnswer || ""} onChange={e => setCF("quickAnswer", e.target.value)} rows={2} className={`${inputCls} w-full`} /></div>

        {/* Internal Links Hint */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          💡 内链建议：清单应至少关联 2 个工具、1 个专题或下一步清单，避免孤岛页面。
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className={labelCls}>所属专题 (backToTopic)</label><input value={cf.internalLinks?.backToTopic || ""} onChange={e => updateInternalLink("backToTopic", e.target.value)} placeholder="/topics/xxx" className={inputCls} /></div>
          <div><label className={labelCls}>内部链接 (JSON)</label><input value={JSON.stringify(cf.internalLinks || {})} onChange={e => { try { setCF("internalLinks", JSON.parse(e.target.value)); } catch {} }} className={`${inputCls} font-mono text-xs`} /></div>
        </div>

        {/* Sections */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-700">📋 分组与步骤 ({(cf.sections || []).length} 个分组)</h3>
            <button onClick={addSection} className="text-xs text-teal-600 hover:underline font-medium">+ 新增分组</button>
          </div>
          <div className="space-y-3">
            {(cf.sections || []).map((sec: any, si: number) => {
              const collapsed = collapsedSections.has(`sec-${si}`);
              return (
                <div key={sec.id || si} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between bg-gray-50 px-3 py-2">
                    <button onClick={() => toggleSection(si)} className="flex items-center gap-2 text-sm font-medium text-gray-700 flex-1 text-left">
                      {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      <span>{sec.title || "未命名分组"}</span>
                      <span className="text-xs text-gray-400">({(sec.items || []).length} 步)</span>
                    </button>
                    <button onClick={() => removeSection(si)} className="p-1 text-red-400 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  {!collapsed && (
                    <div className="p-3 space-y-3">
                      <div className="grid sm:grid-cols-2 gap-2">
                        <input value={sec.title || ""} onChange={e => updateSection(si, "title", e.target.value)} placeholder="分组标题" className={inputCls} />
                        <input value={sec.description || ""} onChange={e => updateSection(si, "description", e.target.value)} placeholder="分组说明" className={inputCls} />
                      </div>
                      <div className="space-y-2">
                        {(sec.items || []).map((item: any, ii: number) => (
                          <div key={item.id || ii} className="bg-gray-50 rounded-lg p-2.5 space-y-1.5 border border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-500">步骤 {ii + 1}</span>
                              <button onClick={() => removeItem(si, ii)} className="p-0.5 text-red-400 hover:text-red-600 rounded"><Trash2 className="w-3 h-3" /></button>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-1.5">
                              <input value={item.title || ""} onChange={e => updateItem(si, ii, "title", e.target.value)} placeholder="标题" className={`${inputCls} text-xs`} />
                              <input value={item.description || ""} onChange={e => updateItem(si, ii, "description", e.target.value)} placeholder="说明" className={`${inputCls} text-xs`} />
                              <input value={item.timing || ""} onChange={e => updateItem(si, ii, "timing", e.target.value)} placeholder="时机" className={`${inputCls} text-xs`} />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={item.required} onChange={e => updateItem(si, ii, "required", e.target.checked)} /> 必做</label>
                              <select value={item.priority || "medium"} onChange={e => updateItem(si, ii, "priority", e.target.value)} className="px-1.5 py-0.5 border border-gray-200 text-xs rounded-lg"><option value="high">高优</option><option value="medium">中</option><option value="low">低</option></select>
                              <input value={item.relatedToolSlug || ""} onChange={e => updateItem(si, ii, "relatedToolSlug", e.target.value)} placeholder="关联工具 slug" className={`${inputCls} text-xs w-32`} />
                              <input value={item.warning || ""} onChange={e => updateItem(si, ii, "warning", e.target.value)} placeholder="警告" className={`${inputCls} text-xs flex-1`} />
                            </div>
                          </div>
                        ))}
                        <button onClick={() => addItem(si)} className="text-xs text-teal-600 hover:underline font-medium">+ 添加步骤</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pitfalls */}
        <div>
          <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-gray-700">⚠️ 避坑提醒 ({(cf.avoidPitfalls || []).length})</h3><button onClick={addPitfall} className="text-xs text-teal-600 hover:underline font-medium">+ 添加</button></div>
          <div className="space-y-1">
            {(cf.avoidPitfalls || []).map((p: string, i: number) => (
              <div key={i} className="flex items-center gap-2"><input value={p} onChange={e => updatePitfall(i, e.target.value)} className={`${inputCls} flex-1`} /><button onClick={() => removePitfall(i)} className="p-1 text-red-400 hover:text-red-600 rounded"><X className="w-3.5 h-3.5" /></button></div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div>
          <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-gray-700">👣 下一步 ({(cf.nextSteps || []).length})</h3><button onClick={addNextStep} className="text-xs text-teal-600 hover:underline font-medium">+ 添加</button></div>
          <div className="space-y-1">
            {(cf.nextSteps || []).map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <input value={s.title || ""} onChange={e => updateNextStep(i, "title", e.target.value)} placeholder="标题" className={`${inputCls} flex-1`} />
                <select value={s.type || "checklist"} onChange={e => updateNextStep(i, "type", e.target.value)} className="px-1.5 py-1.5 border border-gray-200 text-xs rounded-lg"><option value="checklist">清单</option><option value="tool">工具</option><option value="guide">指南</option><option value="topic">专题</option></select>
                <input value={s.url || ""} onChange={e => updateNextStep(i, "url", e.target.value)} placeholder="URL/slug" className={`${inputCls} w-32 text-xs`} />
                <button onClick={() => removeNextStep(i)} className="p-1 text-red-400 hover:text-red-600 rounded"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Official Links */}
        <div>
          <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-gray-700">🔗 官方链接 ({(cf.officialLinks || []).length})</h3><button onClick={addOfficialLink} className="text-xs text-teal-600 hover:underline font-medium">+ 添加</button></div>
          <div className="space-y-1">
            {(cf.officialLinks || []).map((l: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <input value={l.label || ""} onChange={e => updateOfficialLink(i, "label", e.target.value)} placeholder="名称" className={`${inputCls} flex-1`} />
                <input value={l.url || ""} onChange={e => updateOfficialLink(i, "url", e.target.value)} placeholder="URL (留空需人工填)" className={`${inputCls} flex-1 text-xs font-mono`} />
                {l.needsReview && <span className="text-xs text-amber-600 font-medium">待核验</span>}
                <button onClick={() => removeOfficialLink(i)} className="p-1 text-red-400 hover:text-red-600 rounded"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-colors";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-sm text-teal-800">
        <div className="flex items-start gap-2">
          <span className="text-base">💡</span>
          <div>
            <span className="font-medium">公开页面:</span> <a href="/lp/[slug]" className="text-teal-700 hover:underline font-mono text-xs">/lp/[slug]</a> | <span className="font-medium">清单:</span> <a href="/checklists/[slug]" className="text-teal-700 hover:underline font-mono text-xs">/checklists/[slug]</a>
            <div className="text-xs text-teal-600 mt-1">清单提示：可使用 Hermes ContentOps 生成 checklist draft JSON，人工审核后再发布为 published。</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <SectionCard>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索 slug/标题..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 w-48 transition-colors" />
          </div>
          <select value={filters.pageType} onChange={e => setFilters(f => ({ ...f, pageType: e.target.value }))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-colors">
            <option value="">全部类型</option>
            {PAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-colors">
            <option value="">全部状态</option>
            {STATUSES.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
          </select>
          <button onClick={() => setFilters({ pageType: "", status: "", search: "" })} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">重置</button>
        </div>
      </SectionCard>

      {/* Form */}
      {showForm && (
        <SectionCard title={editing ? "编辑落地页" : "新建落地页"} className="border-teal-200 border-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Slug (唯一) *</label>
                <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. canada-logistics" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>标题 *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>SEO 标题</label>
                <input type="text" value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>页面类型</label>
                <select value={form.pageType} onChange={e => setForm(f => ({ ...f, pageType: e.target.value }))} className={inputCls}>
                  {PAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>状态</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
                  {STATUSES.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>主工具 (slug)</label>
                <input type="text" value={form.primaryTool} onChange={e => setForm(f => ({ ...f, primaryTool: e.target.value }))} placeholder="e.g. commercial-invoice" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>相关工具 (逗号分隔)</label>
                <input type="text" value={form.relatedTools} onChange={e => setForm(f => ({ ...f, relatedTools: e.target.value }))} placeholder="tracking, hs-code" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>相关专题 (逗号分隔)</label>
                <input type="text" value={form.relatedTopics} onChange={e => setForm(f => ({ ...f, relatedTopics: e.target.value }))} placeholder="vpn-guide, sim-card" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>相关文章 (逗号分隔)</label>
                <input type="text" value={form.relatedArticles} onChange={e => setForm(f => ({ ...f, relatedArticles: e.target.value }))} placeholder="article-slug-1, article-slug-2" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>SEO 描述</label>
                <textarea value={form.seoDescription} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} rows={2} className={`${inputCls} w-full`} />
              </div>
              {/* Block Visibility & Order Controls */}
              <div className="sm:col-span-2 border-t border-gray-100 pt-4">
                <label className={labelCls}>📦 模块显示与排序</label>
                <p className="text-xs text-gray-400 mb-3">开关控制模块是否在前台显示，拖拽调整显示顺序。未勾选的模块将不会在公开页面中渲染。</p>
                <div className="space-y-1.5">
                  {(() => {
                    let bv: Record<string, boolean> = {};
                    let bo: string[] = [];
                    try { bv = JSON.parse(form.blockVisibility || "{}"); } catch {}
                    try { bo = JSON.parse(form.blockOrder || "[]"); } catch {}
                    const ordered = [...bo.filter(k => BLOCK_DEFS.some(d => d.key === k))];
                    BLOCK_DEFS.forEach(d => { if (!ordered.includes(d.key)) ordered.push(d.key); });
                    return ordered.map((key, idx) => {
                      const def = BLOCK_DEFS.find(d => d.key === key);
                      if (!def) return null;
                      const visible = bv[key] !== false;
                      return (
                        <div key={key} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                          <span className="text-xs text-gray-400 w-5 text-center font-mono">{idx + 1}</span>
                          <label className="flex items-center gap-2 flex-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={visible}
                              onChange={e => {
                                const newBv = { ...bv, [key]: e.target.checked };
                                setForm(f => ({ ...f, blockVisibility: JSON.stringify(newBv) }));
                              }}
                              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className={`text-sm ${visible ? "text-gray-700" : "text-gray-400 line-through"}`}>{def.label}</span>
                          </label>
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                const newBo = [...ordered];
                                [newBo[idx - 1], newBo[idx]] = [newBo[idx], newBo[idx - 1]];
                                setForm(f => ({ ...f, blockOrder: JSON.stringify(newBo) }));
                              }}
                              className="p-1 text-gray-400 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                              title="上移"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === ordered.length - 1}
                              onClick={() => {
                                const newBo = [...ordered];
                                [newBo[idx], newBo[idx + 1]] = [newBo[idx + 1], newBo[idx]];
                                setForm(f => ({ ...f, blockOrder: JSON.stringify(newBo) }));
                              }}
                              className="p-1 text-gray-400 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                              title="下移"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
              {form.pageType === "checklist" && (
                <div className="sm:col-span-2">
                  {editMode === "structured" ? renderChecklistStructured() : (
                    <div>
                      <label className={labelCls}>清单数据结构 (JSON 高级模式)</label>
                      <textarea value={form.heroSectionJson} onChange={e => setForm(f => ({ ...f, heroSectionJson: e.target.value }))} rows={12} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400" />
                      <p className="text-xs text-gray-400 mt-1">结构化编辑模式已切换为 JSON 直接编辑。修改后切换回结构化模式将自动解析。</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
              {editing && editing.status === "published" && (
                <a href={editing.pageType === 'checklist' ? `/checklists/${editing.slug}` : `/lp/${editing.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors">
                  <ExternalLink className="w-4 h-4" /> 打开公开页
                </a>
              )}
              <button onClick={() => { setShowForm(false); setEditing(null); setEditMode("structured"); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">取消</button>
              <button onClick={handleSubmit} disabled={saving || !form.slug || !form.title} className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存
              </button>
            </div>

            {/* Warnings & Preview */}
            {editing && (
              <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                {/* Checklist Publish Gate Banner */}
                {editing.pageType === "checklist" && (() => {
                  const errors = validateChecklistPublish(editing);
                  const warnings = getChecklistPublishWarnings(editing);
                  if (errors.length > 0) {
                    return (
                      <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold mb-1">🚫 清单发布审核未通过 — 以下问题必须解决后才允许发布为 published：</div>
                          <div className="space-y-0.5">
                            {errors.map((e, i) => <div key={i}>{e}</div>)}
                          </div>
                          <div className="mt-2 text-gray-600">
                            提示：清单发布前必须完成人工核验——官方链接、政策/法律/海关/签证相关内容、内链、FAQ。
                          </div>
                        </div>
                      </div>
                    );
                  }
                  if (warnings.length > 0) {
                    return (
                      <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold mb-1">⚠️ 发布审核通过，但有以下改进建议：</div>
                          <div className="space-y-0.5">
                            {warnings.map((w, i) => <div key={i}>{w}</div>)}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="flex items-start gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                      <span className="text-base">✅</span>
                      <span>清单发布审核通过，所有必填项已完成。可以安全发布。</span>
                    </div>
                  );
                })()}

                {getSlugWarnings(editing).length > 0 && (
                  <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      {getSlugWarnings(editing).map((w, i) => <div key={i}>⚠ {w}</div>)}
                    </div>
                  </div>
                )}
                <h3 className="text-xs font-bold text-gray-500">📋 预览摘要</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-xs space-y-1 text-gray-600 border border-gray-100">
                  <p><span className="font-medium">Hero:</span> {(editing.heroSection as any)?.title || "未配置"}</p>
                  <p><span className="font-medium">热门城市:</span> {Array.isArray((editing.heroSection as any)?.hotCities) ? (editing.heroSection as any).hotCities.join(", ") : "未配置"}</p>
                  <p><span className="font-medium">主工具:</span> {editing.primaryTool || "未配置"}</p>
                  <p><span className="font-medium">相关工具:</span> {(editing.relatedTools || []).length > 0 ? (editing.relatedTools || []).join(", ") : "无"}</p>
                  <p><span className="font-medium">相关专题:</span> {(editing.relatedTopics || []).length > 0 ? (editing.relatedTopics || []).join(", ") : "无"}</p>
                  <p><span className="font-medium">相关文章:</span> {(editing.relatedArticles || []).length > 0 ? (editing.relatedArticles || []).join(", ") : "无"}</p>
                  <p><span className="font-medium">相关清单:</span> {Array.isArray((editing.ctaConfig as any)?.relatedChecklists) ? (editing.ctaConfig as any).relatedChecklists.join(", ") : "未配置"}</p>
                  <p><span className="font-medium">FAQ:</span> {Array.isArray(editing.faqItems) ? `${editing.faqItems.length} 个问答` : "未配置"}</p>
                  <p><span className="font-medium">官方链接:</span> {Array.isArray(editing.officialLinks) ? `${editing.officialLinks.length} 个` : "未配置"}</p>
                  <p><span className="font-medium">CTA:</span> {editing.ctaConfig ? "已配置" : "未配置"}</p>
                  <p><span className="font-medium">最后更新:</span> {new Date(editing.updatedAt).toLocaleDateString('zh-CN')}</p>
                </div>
              </div>
            )}
          </SectionCard>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            加载中...
          </div>
        ) : pages.length === 0 ? (
          <EmptyState
            variant="no-data"
            title="暂无落地页配置"
            description="点击「新建落地页」创建第一个落地页"
            icon={<Layout className="w-12 h-12" />}
            primaryAction={{ label: '新建落地页', onClick: () => setShowForm(true) }}
          />
        ) : (
          <SectionCard title="落地页列表" subtitle={`共 ${pages.length} 个落地页`}>
            <div className="overflow-x-auto -mx-6 -mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">Slug</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">标题</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">类型</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">状态</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">公开 URL</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs uppercase tracking-wider hidden xl:table-cell">发布</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs uppercase tracking-wider hidden xl:table-cell">预览摘要</th>
                    <th className="px-4 py-2.5 text-right font-medium text-gray-500 text-xs uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pages.map(p => {
                    const warnings = getSlugWarnings(p);
                    return (
                      <tr key={p.id} className={`hover:bg-gray-50/60 transition-colors ${warnings.length > 0 ? "bg-amber-50/30" : ""}`}>
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-700">{p.slug}</td>
                        <td className="px-4 py-2.5 font-medium text-sm text-gray-900">
                          {p.title}
                          {warnings.length > 0 && (
                            <div className="text-xs text-amber-600 mt-0.5" title={warnings.join("; ")}>⚠ {warnings.length} 个提示</div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-500 hidden lg:table-cell">
                          <StatusBadge
                            label={p.pageType === 'checklist' ? '清单' : p.pageType}
                            variant={p.pageType === 'checklist' ? 'processing' : 'info'}
                            size="sm"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge
                            label={statusLabels[p.status]}
                            variant={STATUS_VARIANT[p.status] || 'neutral'}
                            size="sm"
                            dot={p.status === 'published'}
                          />
                        </td>
                        <td className="px-4 py-2.5 text-xs hidden lg:table-cell">
                          {p.status === "published" ? (
                            <a href={p.pageType === 'checklist' ? `/checklists/${p.slug}` : `/lp/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline flex items-center gap-1 font-mono text-xs">
                              {p.pageType === 'checklist' ? `/checklists/` : `/lp/`}{p.slug} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-500 hidden xl:table-cell">{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("zh-CN") : "—"}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500 hidden xl:table-cell max-w-xs truncate" title={getPreviewSummary(p)}>
                          {getPreviewSummary(p)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {p.status === "published" && (
                              <a href={p.pageType === 'checklist' ? `/checklists/${p.slug}` : `/lp/${p.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-teal-500 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-colors" title="打开公开页"><Eye className="w-3.5 h-3.5" /></a>
                            )}
                            {p.status !== "published" && <button onClick={() => handleStatus(p, "published")} className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors" title="发布"><Eye className="w-3.5 h-3.5" /></button>}
                            {p.status !== "hidden" && <button onClick={() => handleStatus(p, "hidden")} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="隐藏"><EyeOff className="w-3.5 h-3.5" /></button>}
                            {p.status !== "draft" && <button onClick={() => handleStatus(p, "draft")} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="草稿"><X className="w-3.5 h-3.5" /></button>}
                            <button onClick={() => handleEdit(p)} className="p-1.5 text-gray-400 hover:text-teal-600 rounded-lg hover:bg-teal-50 transition-colors" title="编辑"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="删除"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
    </div>
  );
}