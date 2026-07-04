"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, Eye } from "lucide-react";

type Topic = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  status: string;
  templateType: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  robots: string;
  tags: string[] | null;
  suitableFor: string[] | null;
  relatedTools: string[] | null;
  relatedGuides: string[] | null;
  relatedChecklists: string[] | null;
  metadataJson: any;
  items: any[];
  sections: any[];
};

const STATUS_OPTIONS = [
  { value: "draft", label: "草稿" },
  { value: "published", label: "已发布" },
  { value: "archived", label: "已归档" },
];

const ROBOTS_OPTIONS = [
  { value: "index,follow", label: "index,follow" },
  { value: "noindex,nofollow", label: "noindex,nofollow" },
  { value: "index,nofollow", label: "index,nofollow" },
  { value: "noindex,follow", label: "noindex,follow" },
];

const TEMPLATE_OPTIONS = [
  { value: "rating_list", label: "评级列表 (rating_list)" },
  { value: "general", label: "通用 (general)" },
  { value: "", label: "未设置" },
];

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export default function TopicEditClient({ topic }: { topic: Topic }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: topic.title,
    slug: topic.slug,
    subtitle: topic.subtitle || "",
    summary: topic.summary || "",
    status: topic.status,
    templateType: topic.templateType || "",
    seoTitle: topic.seoTitle || "",
    seoDescription: topic.seoDescription || "",
    canonicalUrl: topic.canonicalUrl || "",
    robots: topic.robots || "index,follow",
    tags: (topic.tags || []).join(", "),
    suitableFor: (topic.suitableFor || []).join(", "),
    relatedTools: (topic.relatedTools || []).join(", "),
    relatedGuides: (topic.relatedGuides || []).join(", "),
    relatedChecklists: (topic.relatedChecklists || []).join(", "),
    // SEO/GEO fields from metadataJson.contentOps.seo
    metaKeywords: topic.metadataJson?.contentOps?.seo?.metaKeywords || "",
    primaryKeyword: topic.metadataJson?.contentOps?.primaryKeyword || "",
    secondaryKeywords: (
      topic.metadataJson?.contentOps?.secondaryKeywords || []
    ).join(", "),
    searchIntent:
      topic.metadataJson?.contentOps?.seo?.searchIntent || "informational",
    targetAudience: topic.metadataJson?.contentOps?.seo?.targetAudience || "",
    audienceStage:
      topic.metadataJson?.contentOps?.seo?.audienceStage || "准备出海阶段",
    targetCountries: (
      topic.metadataJson?.contentOps?.seo?.targetCountries || []
    ).join(", "),
    targetSearchEngines: (
      topic.metadataJson?.contentOps?.seo?.targetSearchEngines || [
        "Google",
        "Baidu",
        "Bing",
      ]
    ).join(", "),
  });

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setError("");

    if (!form.title.trim()) {
      setError("标题为必填项");
      return;
    }
    if (!form.slug.trim()) {
      setError("slug 为必填项");
      return;
    }

    setSaving(true);
    try {
      // Build metadataJson with SEO/GEO data
      const metadataJson = {
        ...(topic.metadataJson || {}),
        contentOps: {
          ...(topic.metadataJson?.contentOps || {}),
          seo: {
            metaKeywords: form.metaKeywords,
            searchIntent: form.searchIntent,
            targetAudience: form.targetAudience,
            audienceStage: form.audienceStage,
            targetCountries: form.targetCountries
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            targetSearchEngines: form.targetSearchEngines
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          },
          primaryKeyword: form.primaryKeyword,
          secondaryKeywords: form.secondaryKeywords
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          internalLinks: topic.metadataJson?.contentOps?.internalLinks || [],
          faq: topic.metadataJson?.contentOps?.faq || [],
          pitfalls: topic.metadataJson?.contentOps?.pitfalls || [],
        },
      };

      const res = await fetch(`/api/admin/topics/${topic.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          subtitle: form.subtitle || null,
          summary: form.summary || null,
          status: form.status,
          templateType: form.templateType || null,
          seoTitle: form.seoTitle || null,
          seoDescription: form.seoDescription || null,
          canonicalUrl: form.canonicalUrl || null,
          robots: form.robots,
          tags: form.tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          suitableFor: form.suitableFor
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          relatedTools: form.relatedTools
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          relatedGuides: form.relatedGuides
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          relatedChecklists: form.relatedChecklists
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          metadataJson,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `保存失败 (${res.status})`);
      }

      router.push("/admin/content");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = `/topics/${topic.slug}?preview=true`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/content"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">编辑专题</h1>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                form.status === "published"
                  ? "bg-green-100 text-green-700"
                  : form.status === "archived"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {STATUS_OPTIONS.find((o) => o.value === form.status)?.label ||
                form.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={previewUrl}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              预览
            </Link>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              保存
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">基本信息</h2>
          <div>
            <label className={labelCls}>标题 *</label>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="专题标题"
            />
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input
              className={inputCls}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="topic-slug"
            />
          </div>
          <div>
            <label className={labelCls}>副标题</label>
            <input
              className={inputCls}
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder="专题副标题"
            />
          </div>
          <div>
            <label className={labelCls}>摘要</label>
            <textarea
              className={`${inputCls} min-h-[80px]`}
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="专题摘要"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>状态</label>
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>模板类型</label>
              <select
                className={inputCls}
                value={form.templateType}
                onChange={(e) => set("templateType", e.target.value)}
              >
                {TEMPLATE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Robots</label>
            <select
              className={inputCls}
              value={form.robots}
              onChange={(e) => set("robots", e.target.value)}
            >
              {ROBOTS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">SEO 设置</h2>
          <div>
            <label className={labelCls}>SEO 标题</label>
            <input
              className={inputCls}
              value={form.seoTitle}
              onChange={(e) => set("seoTitle", e.target.value)}
              placeholder="搜索引擎标题"
            />
          </div>
          <div>
            <label className={labelCls}>SEO 描述</label>
            <textarea
              className={`${inputCls} min-h-[60px]`}
              value={form.seoDescription}
              onChange={(e) => set("seoDescription", e.target.value)}
              placeholder="搜索引擎描述"
            />
          </div>
          <div>
            <label className={labelCls}>Canonical URL</label>
            <input
              className={inputCls}
              value={form.canonicalUrl}
              onChange={(e) => set("canonicalUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* GEO / ContentOps */}
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">
            GEO / ContentOps
          </h2>
          <div>
            <label className={labelCls}>Meta Keywords (逗号分隔)</label>
            <input
              className={inputCls}
              value={form.metaKeywords}
              onChange={(e) => set("metaKeywords", e.target.value)}
              placeholder="关键词1, 关键词2, ..."
            />
          </div>
          <div>
            <label className={labelCls}>主关键词</label>
            <input
              className={inputCls}
              value={form.primaryKeyword}
              onChange={(e) => set("primaryKeyword", e.target.value)}
              placeholder="primary keyword"
            />
          </div>
          <div>
            <label className={labelCls}>次要关键词 (逗号分隔)</label>
            <input
              className={inputCls}
              value={form.secondaryKeywords}
              onChange={(e) => set("secondaryKeywords", e.target.value)}
              placeholder="keyword1, keyword2, ..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>搜索意图</label>
              <select
                className={inputCls}
                value={form.searchIntent}
                onChange={(e) => set("searchIntent", e.target.value)}
              >
                <option value="informational">informational</option>
                <option value="transactional">transactional</option>
                <option value="navigational">navigational</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>目标受众</label>
              <input
                className={inputCls}
                value={form.targetAudience}
                onChange={(e) => set("targetAudience", e.target.value)}
                placeholder="如：即将出国的留学生"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>受众阶段</label>
            <input
              className={inputCls}
              value={form.audienceStage}
              onChange={(e) => set("audienceStage", e.target.value)}
              placeholder="如：准备出海阶段"
            />
          </div>
          <div>
            <label className={labelCls}>目标国家 (逗号分隔)</label>
            <input
              className={inputCls}
              value={form.targetCountries}
              onChange={(e) => set("targetCountries", e.target.value)}
              placeholder="新加坡, 日本, 美国"
            />
          </div>
          <div>
            <label className={labelCls}>目标搜索引擎 (逗号分隔)</label>
            <input
              className={inputCls}
              value={form.targetSearchEngines}
              onChange={(e) => set("targetSearchEngines", e.target.value)}
              placeholder="Google, Baidu, Bing"
            />
          </div>
        </div>

        {/* Relations */}
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">关联内容</h2>
          <div>
            <label className={labelCls}>标签 (逗号分隔)</label>
            <input
              className={inputCls}
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="tag1, tag2, ..."
            />
          </div>
          <div>
            <label className={labelCls}>适用人群 (逗号分隔)</label>
            <input
              className={inputCls}
              value={form.suitableFor}
              onChange={(e) => set("suitableFor", e.target.value)}
              placeholder="留学生, 工作者, ..."
            />
          </div>
          <div>
            <label className={labelCls}>相关工具 (逗号分隔)</label>
            <input
              className={inputCls}
              value={form.relatedTools}
              onChange={(e) => set("relatedTools", e.target.value)}
              placeholder="tool-slug-1, tool-slug-2"
            />
          </div>
          <div>
            <label className={labelCls}>相关指南 (逗号分隔)</label>
            <input
              className={inputCls}
              value={form.relatedGuides}
              onChange={(e) => set("relatedGuides", e.target.value)}
              placeholder="guide-slug-1, guide-slug-2"
            />
          </div>
          <div>
            <label className={labelCls}>相关清单 (逗号分隔)</label>
            <input
              className={inputCls}
              value={form.relatedChecklists}
              onChange={(e) => set("relatedChecklists", e.target.value)}
              placeholder="checklist-slug-1, checklist-slug-2"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            内容统计
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600">
                {topic.items?.length || 0}
              </div>
              <div className="text-xs text-gray-500">APP/资源数</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">
                {topic.sections?.length || 0}
              </div>
              <div className="text-xs text-gray-500">章节数</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">
                {topic.metadataJson?.contentOps?.faq?.length || 0}
              </div>
              <div className="text-xs text-gray-500">FAQ 数</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
