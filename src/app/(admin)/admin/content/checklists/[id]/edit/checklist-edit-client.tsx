"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, Plus, Trash2, ArrowUp, ArrowDown, Eye } from "lucide-react";

type Step = {
  title: string;
  description: string;
  optional: boolean;
  toolLink: string;
};

type Checklist = {
  id: string; slug: string; title: string; summary: string | null;
  steps: any; status: string;
  relatedTools: string[]; relatedTaskChain: string | null;
  relatedGuides: string[]; relatedTopics: string[];
  seoTitle: string | null; seoDescription: string | null;
  canonicalUrl: string | null; robots: string;
  metadataJson: any;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "草稿" },
  { value: "published", label: "已发布" },
  { value: "archived", label: "已归档" },
];

const ROBOTS_OPTIONS = [
  { value: "index,follow", label: "index,follow" },
  { value: "noindex,follow", label: "noindex,follow" },
  { value: "noindex,nofollow", label: "noindex,nofollow" },
  { value: "index,nofollow", label: "index,nofollow" },
];

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

function normalizeStep(raw: any): Step {
  return {
    title: raw?.title || "",
    description: raw?.description || "",
    optional: !!raw?.optional,
    toolLink: raw?.toolLink || "",
  };
}

function newStep(): Step {
  return { title: "", description: "", optional: false, toolLink: "" };
}

export default function ChecklistEditClient({ checklist }: { checklist: Checklist }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Normalize steps from JSON
  const initialSteps: Step[] = Array.isArray(checklist.steps) && checklist.steps.length > 0
    ? checklist.steps.map(normalizeStep)
    : [newStep()];

  const [form, setForm] = useState({
    title: checklist.title,
    slug: checklist.slug,
    summary: checklist.summary || "",
    status: checklist.status,
    seoTitle: checklist.seoTitle || "",
    seoDescription: checklist.seoDescription || "",
    canonicalUrl: checklist.canonicalUrl || "",
    robots: checklist.robots || "index,follow",
    relatedTools: (checklist.relatedTools || []).join(", "),
    relatedTaskChain: checklist.relatedTaskChain || "",
    relatedGuides: (checklist.relatedGuides || []).join(", "),
    relatedTopics: (checklist.relatedTopics || []).join(", "),
    // v1.20.42.18.6.16.6.81: SEO/GEO fields from metadataJson.contentOps.seo
    metaKeywords: checklist.metadataJson?.contentOps?.seo?.metaKeywords || "",
    primaryKeyword: checklist.metadataJson?.contentOps?.primaryKeyword || "",
    secondaryKeywords: (checklist.metadataJson?.contentOps?.secondaryKeywords || []).join(", "),
    searchIntent: checklist.metadataJson?.contentOps?.seo?.searchIntent || "informational",
    targetAudience: checklist.metadataJson?.contentOps?.seo?.targetAudience || "",
    audienceStage: checklist.metadataJson?.contentOps?.seo?.audienceStage || "准备出国阶段",
    targetCountries: (checklist.metadataJson?.contentOps?.seo?.targetCountries || []).join(", "),
    targetSearchEngines: (checklist.metadataJson?.contentOps?.seo?.targetSearchEngines || ["Google", "Baidu", "Bing"]).join(", "),
  });
  const [steps, setSteps] = useState<Step[]>(initialSteps);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  // Step manipulation
  const addStep = () => setSteps((s) => [...s, newStep()]);
  const removeStep = (idx: number) => setSteps((s) => s.filter((_, i) => i !== idx));
  const moveStep = (idx: number, dir: -1 | 1) => {
    setSteps((s) => {
      const target = idx + dir;
      if (target < 0 || target >= s.length) return s;
      const arr = [...s];
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };
  const updateStep = (idx: number, field: keyof Step, value: string | boolean) => {
    setSteps((s) => s.map((step, i) => (i === idx ? { ...step, [field]: value } : step)));
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.title.trim()) { setError("标题为必填项"); return; }
    if (!form.slug.trim()) { setError("slug 为必填项"); return; }

    const validSteps = steps.filter((s) => s.title.trim());
    if (validSteps.length === 0) { setError("至少需要一个步骤"); return; }

    // Publish validation warnings
    if (form.status === "published" && checklist.metadataJson?.contentOps) {
      const ops = checklist.metadataJson.contentOps;
      const warnings: string[] = [];
      
      if (ops.qualityScore !== undefined && ops.qualityScore < 80) {
        warnings.push(`质量评分 ${ops.qualityScore} 低于 80`);
      }
      if (ops.faq?.length > 0 && ops.faq.length < 3) {
        warnings.push(`FAQ 只有 ${ops.faq.length} 个，建议至少 3 个`);
      }
      if (ops.internalLinks?.length > 0 && ops.internalLinks.length < 3) {
        warnings.push(`内链只有 ${ops.internalLinks.length} 个，建议至少 3 个`);
      }
      
      if (warnings.length > 0) {
        const confirmed = window.confirm(
          `发布警告：\n${warnings.join('\n')}\n\n确定要继续发布吗？`
        );
        if (!confirmed) return;
      }
    }

    setSaving(true);
    try {
      // v1.20.42.18.6.16.6.81: Build metadataJson.contentOps.seo from form
      const existingMetadata = checklist.metadataJson || {};
      const existingContentOps = existingMetadata.contentOps || {};
      
      const seoData = {
        metaKeywords: form.metaKeywords.trim() || undefined,
        searchIntent: form.searchIntent || undefined,
        targetAudience: form.targetAudience.trim() || undefined,
        audienceStage: form.audienceStage || undefined,
        targetCountries: form.targetCountries.split(",").map(s => s.trim()).filter(Boolean),
        targetSearchEngines: form.targetSearchEngines.split(",").map(s => s.trim()).filter(Boolean),
      };
      
      const updatedMetadataJson = {
        ...existingMetadata,
        contentOps: {
          ...existingContentOps,
          primaryKeyword: form.primaryKeyword.trim() || existingContentOps.primaryKeyword,
          secondaryKeywords: form.secondaryKeywords.split(",").map(s => s.trim()).filter(Boolean),
          seo: {
            ...existingContentOps.seo,
            ...seoData,
          },
        },
      };
      
      const payload: any = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        summary: form.summary.trim() || null,
        steps: validSteps.map((s) => ({
          title: s.title.trim(),
          description: s.description.trim(),
          optional: s.optional,
          toolLink: s.toolLink.trim(),
        })),
        status: form.status,
        seoTitle: form.seoTitle.trim() || null,
        seoDescription: form.seoDescription.trim() || null,
        relatedTools: form.relatedTools.split(",").map((s) => s.trim()).filter(Boolean),
        relatedTaskChain: form.relatedTaskChain.trim() || null,
        relatedGuides: form.relatedGuides.split(",").map((s) => s.trim()).filter(Boolean),
        relatedTopics: form.relatedTopics.split(",").map((s) => s.trim()).filter(Boolean),
        metadataJson: updatedMetadataJson,
      };

      const res = await fetch(`/api/admin/checklists/${checklist.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "更新失败");

      router.push("/admin/content/checklists");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/content/checklists" className="p-2 hover:bg-gray-100 rounded-lg" title="返回">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">编辑清单</h1>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg mb-4 flex items-center gap-2 bg-red-50 text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>标题 *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              className={inputCls} placeholder="清单标题" />
          </div>
          <div>
            <label className={labelCls}>slug *</label>
            <input value={form.slug} onChange={(e) => set("slug", e.target.value)}
              className={inputCls} placeholder="如 shipping-checklist" />
          </div>
        </div>

        <div>
          <label className={labelCls}>摘要</label>
          <textarea value={form.summary} onChange={(e) => set("summary", e.target.value)}
            className={inputCls} rows={2} placeholder="一句话描述清单内容" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>状态</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>关联任务链</label>
            <input value={form.relatedTaskChain} onChange={(e) => set("relatedTaskChain", e.target.value)}
              className={inputCls} placeholder="任务链模板 key" />
          </div>
        </div>

        {/* Steps Editor */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">步骤编辑器 ({steps.length} 个步骤)</h2>
            <button onClick={addStep} type="button"
              className="flex items-center gap-1 text-sm text-teal-600 hover:underline font-medium">
              <Plus className="w-4 h-4" /> 添加步骤
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">步骤 {idx + 1}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} type="button"
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30" title="上移">
                      <ArrowUp className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1} type="button"
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30" title="下移">
                      <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button onClick={() => removeStep(idx)} disabled={steps.length === 1} type="button"
                      className="p-1 rounded hover:bg-red-50 disabled:opacity-30" title="删除步骤">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <input value={step.title} onChange={(e) => updateStep(idx, "title", e.target.value)}
                    className={`${inputCls} text-sm`} placeholder="步骤标题 *" />
                  <textarea value={step.description} onChange={(e) => updateStep(idx, "description", e.target.value)}
                    className={`${inputCls} text-sm`} rows={2} placeholder="步骤描述（可选）" />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-sm text-gray-600">
                      <input type="checkbox" checked={step.optional}
                        onChange={(e) => updateStep(idx, "optional", e.target.checked)}
                        className="rounded" />
                      可选步骤
                    </label>
                    <input value={step.toolLink} onChange={(e) => updateStep(idx, "toolLink", e.target.value)}
                      className={`${inputCls} text-sm flex-1`} placeholder="关联工具链接（可选）" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEO & Relations */}
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>SEO 标题</label>
              <input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)}
                className={inputCls} placeholder="SEO 标题" />
            </div>
            <div>
              <label className={labelCls}>关联工具</label>
              <input value={form.relatedTools} onChange={(e) => set("relatedTools", e.target.value)}
                className={inputCls} placeholder="逗号分隔的工具 slug" />
            </div>
          </div>

          <div>
            <label className={labelCls}>SEO 描述</label>
            <textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)}
              className={inputCls} rows={2} placeholder="SEO 描述" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>关联指南</label>
              <input value={form.relatedGuides} onChange={(e) => set("relatedGuides", e.target.value)}
                className={inputCls} placeholder="逗号分隔的指南 slug" />
            </div>
            <div>
              <label className={labelCls}>关联专题</label>
              <input value={form.relatedTopics} onChange={(e) => set("relatedTopics", e.target.value)}
                className={inputCls} placeholder="逗号分隔的专题 slug" />
            </div>
          </div>
        </div>

        {/* v1.20.42.18.6.16.6.81: SEO / GEO 设置 */}
        <div className="border-t pt-4 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">SEO / GEO 设置</h2>
          
          <div>
            <label className={labelCls}>Meta Keywords</label>
            <input value={form.metaKeywords} onChange={(e) => set("metaKeywords", e.target.value)}
              className={inputCls} placeholder="逗号分隔，5-15 个关键词" />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">逗号分隔，5-15 个关键词</span>
              {form.metaKeywords && (
                <span className={`text-xs ${form.metaKeywords.split(",").filter(Boolean).length > 15 ? 'text-red-600' : 'text-gray-500'}`}>
                  ⚠️ 当前 {form.metaKeywords.split(",").filter(Boolean).length} 个关键词
                  {form.metaKeywords.split(",").filter(Boolean).length > 15 && ' — 超过 15 个'}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Primary Keyword</label>
              <input value={form.primaryKeyword} onChange={(e) => set("primaryKeyword", e.target.value)}
                className={inputCls} placeholder="主关键词" />
            </div>
            <div>
              <label className={labelCls}>Search Intent</label>
              <select value={form.searchIntent} onChange={(e) => set("searchIntent", e.target.value)} className={inputCls}>
                <option value="informational">informational</option>
                <option value="navigational">navigational</option>
                <option value="transactional">transactional</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Secondary Keywords</label>
            <input value={form.secondaryKeywords} onChange={(e) => set("secondaryKeywords", e.target.value)}
              className={inputCls} placeholder="逗号分隔，5-10 个关键词" />
            <span className="text-xs text-gray-500 mt-1 block">逗号分隔，5-10 个关键词</span>
          </div>

          <div>
            <label className={labelCls}>Target Audience</label>
            <input value={form.targetAudience} onChange={(e) => set("targetAudience", e.target.value)}
              className={inputCls} placeholder="如：即将出国留学的学生和家长" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Audience Stage</label>
              <select value={form.audienceStage} onChange={(e) => set("audienceStage", e.target.value)} className={inputCls}>
                <option value="未出海了解阶段">未出海了解阶段</option>
                <option value="准备出国阶段">准备出国阶段</option>
                <option value="已在海外阶段">已在海外阶段</option>
                <option value="家长/亲属关注阶段">家长/亲属关注阶段</option>
                <option value="跨境经营阶段">跨境经营阶段</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Target Countries</label>
              <input value={form.targetCountries} onChange={(e) => set("targetCountries", e.target.value)}
                className={inputCls} placeholder="逗号分隔，如：加拿大,美国,英国" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Target Search Engines</label>
            <input value={form.targetSearchEngines} onChange={(e) => set("targetSearchEngines", e.target.value)}
              className={inputCls} placeholder="逗号分隔，如：Google,Baidu,Bing" />
            <span className="text-xs text-gray-500 mt-1 block">逗号分隔，如：Google,Baidu,Bing,360,Sogou</span>
          </div>
        </div>

        {/* ContentOps Metadata Display */}
        {checklist.metadataJson?.contentOps && (
          <div className="border-t pt-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">ContentOps 元数据（只读）</h2>
            <div className="space-y-3 bg-gray-50 rounded-lg p-4">
              {/* Quality Score */}
              {checklist.metadataJson.contentOps.qualityScore !== undefined && (
                <div>
                  <span className="text-xs font-medium text-gray-500">质量评分：</span>
                  <span className={`text-sm font-semibold ${
                    checklist.metadataJson.contentOps.qualityScore >= 80 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {checklist.metadataJson.contentOps.qualityScore}/100
                  </span>
                  {checklist.metadataJson.contentOps.qualityScore < 80 && (
                    <span className="ml-2 text-xs text-orange-600">⚠️ 低于 80 分，建议优化后再发布</span>
                  )}
                </div>
              )}

              {/* Primary Keyword */}
              {checklist.metadataJson.contentOps.primaryKeyword && (
                <div>
                  <span className="text-xs font-medium text-gray-500">主关键词：</span>
                  <span className="text-sm text-gray-900">{checklist.metadataJson.contentOps.primaryKeyword}</span>
                </div>
              )}

              {/* Secondary Keywords */}
              {checklist.metadataJson.contentOps.secondaryKeywords?.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-500">次要关键词：</span>
                  <span className="text-sm text-gray-700">
                    {checklist.metadataJson.contentOps.secondaryKeywords.join(', ')}
                  </span>
                </div>
              )}

              {/* FAQ Count */}
              {checklist.metadataJson.contentOps.faq?.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-500">FAQ：</span>
                  <span className="text-sm text-gray-900">{checklist.metadataJson.contentOps.faq.length} 个问题</span>
                  {checklist.metadataJson.contentOps.faq.length < 3 && (
                    <span className="ml-2 text-xs text-orange-600">⚠️ 建议至少 3 个 FAQ</span>
                  )}
                </div>
              )}

              {/* Internal Links Count */}
              {checklist.metadataJson.contentOps.internalLinks?.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-500">内链：</span>
                  <span className="text-sm text-gray-900">{checklist.metadataJson.contentOps.internalLinks.length} 个链接</span>
                  {checklist.metadataJson.contentOps.internalLinks.length < 3 && (
                    <span className="ml-2 text-xs text-orange-600">⚠️ 建议至少 3 个内链</span>
                  )}
                </div>
              )}

              {/* GEO Answer Block */}
              {checklist.metadataJson.contentOps.geoAnswerBlock && (
                <div>
                  <span className="text-xs font-medium text-gray-500">GEO 答案块：</span>
                  <span className="text-sm text-gray-700">
                    {checklist.metadataJson.contentOps.geoAnswerBlock.directAnswer?.substring(0, 100)}
                    {checklist.metadataJson.contentOps.geoAnswerBlock.directAnswer?.length > 100 && '...'}
                  </span>
                </div>
              )}

              {/* Video Pack */}
              {checklist.metadataJson.contentOps.videoPack && (
                <div>
                  <span className="text-xs font-medium text-gray-500">视频包：</span>
                  <span className="text-sm text-gray-700">
                    {checklist.metadataJson.contentOps.videoPack.youtubeTitle?.substring(0, 80)}
                    {checklist.metadataJson.contentOps.videoPack.youtubeTitle?.length > 80 && '...'}
                  </span>
                </div>
              )}

              {/* Structured Data */}
              {checklist.metadataJson.contentOps.structuredData && (
                <div>
                  <span className="text-xs font-medium text-gray-500">结构化数据：</span>
                  <span className="text-sm text-gray-700">
                    {checklist.metadataJson.contentOps.structuredData['@type']} (JSON-LD)
                  </span>
                </div>
              )}

              {/* Social Media Prompts */}
              {checklist.metadataJson.contentOps.socialMediaPrompts && (
                <div>
                  <span className="text-xs font-medium text-gray-500">社交媒体文案：</span>
                  <span className="text-sm text-gray-700">
                    {Object.keys(checklist.metadataJson.contentOps.socialMediaPrompts).join(', ')}
                  </span>
                </div>
              )}

              {/* Publish Checklist */}
              {checklist.metadataJson.contentOps.publishChecklist?.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-500">发布检查清单：</span>
                  <div className="mt-1 space-y-1">
                    {checklist.metadataJson.contentOps.publishChecklist.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className={item.checked ? 'text-green-600' : 'text-gray-400'}>
                          {item.checked ? '✓' : '○'}
                        </span>
                        <span className={item.checked ? 'text-gray-900' : 'text-gray-500'}>
                          {item.item}
                        </span>
                        {item.note && (
                          <span className="text-xs text-gray-500">({item.note})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 min-h-[44px]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "保存中..." : "保存"}
          </button>
          {form.status === "draft" && (
            <a
              href={`/checklists/${form.slug}?preview=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 min-h-[44px]"
              title="在新窗口预览草稿（不会发布内容）"
            >
              <Eye className="w-4 h-4" />
              预览草稿
            </a>
          )}
          <Link href="/admin/content/checklists"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 min-h-[44px]">
            取消
          </Link>
        </div>
      </div>
    </div>
  );
}
