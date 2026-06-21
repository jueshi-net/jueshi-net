"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";

const CATEGORIES = [
  { value: "general", label: "通用" },
  { value: "shipping", label: "跨境寄送" },
  { value: "customs", label: "海关清关" },
  { value: "logistics", label: "物流仓储" },
  { value: "life", label: "海外生活" },
  { value: "business", label: "出海经营" },
  { value: "templates", label: "模板" },
];

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

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export default function NewGuidePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "", slug: "", summary: "", body: "", category: "general",
    tags: "", status: "draft",
    seoTitle: "", seoDescription: "", canonicalUrl: "", robots: "index,follow",
    relatedTools: "", relatedTopics: "", relatedChecklists: "", relatedGuides: "",
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setError("");

    if (!form.title.trim()) { setError("标题为必填项"); return; }
    if (!form.slug.trim()) { setError("slug 为必填项"); return; }
    if (!form.body.trim()) { setError("正文为必填项"); return; }

    setSaving(true);
    try {
      const payload: any = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        summary: form.summary.trim() || undefined,
        body: form.body,
        category: form.category,
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        status: form.status,
        seoTitle: form.seoTitle.trim() || undefined,
        seoDescription: form.seoDescription.trim() || undefined,
        canonicalUrl: form.canonicalUrl.trim() || undefined,
        robots: form.robots,
        relatedTools: form.relatedTools.split(",").map((s) => s.trim()).filter(Boolean),
        relatedTopics: form.relatedTopics.split(",").map((s) => s.trim()).filter(Boolean),
        relatedChecklists: form.relatedChecklists.split(",").map((s) => s.trim()).filter(Boolean),
        relatedGuides: form.relatedGuides.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const res = await fetch("/api/admin/guides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "创建失败");

      router.push("/admin/content/guides");
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
        <Link href="/admin/content/guides" className="p-2 hover:bg-gray-100 rounded-lg" title="返回">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">新建指南</h1>
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
              className={inputCls} placeholder="指南标题" />
          </div>
          <div>
            <label className={labelCls}>slug *</label>
            <input value={form.slug} onChange={(e) => set("slug", e.target.value)}
              className={inputCls} placeholder="如 shipping-guide" />
          </div>
        </div>

        <div>
          <label className={labelCls}>摘要</label>
          <textarea value={form.summary} onChange={(e) => set("summary", e.target.value)}
            className={inputCls} rows={2} placeholder="一句话描述指南内容" />
        </div>

        <div>
          <label className={labelCls}>正文 *</label>
          <textarea value={form.body} onChange={(e) => set("body", e.target.value)}
            className={`${inputCls} font-mono`} rows={10} placeholder="支持 Markdown 格式正文" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>分类</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>状态</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>标签</label>
            <input value={form.tags} onChange={(e) => set("tags", e.target.value)}
              className={inputCls} placeholder="逗号分隔，如 寄送,物流" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>SEO 标题</label>
            <input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)}
              className={inputCls} placeholder="SEO 标题" />
          </div>
          <div>
            <label className={labelCls}>canonical URL</label>
            <input value={form.canonicalUrl} onChange={(e) => set("canonicalUrl", e.target.value)}
              className={inputCls} placeholder="https://..." />
          </div>
        </div>

        <div>
          <label className={labelCls}>SEO 描述</label>
          <textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)}
            className={inputCls} rows={2} placeholder="SEO 描述" />
        </div>

        <div>
          <label className={labelCls}>robots</label>
          <select value={form.robots} onChange={(e) => set("robots", e.target.value)} className={inputCls}>
            {ROBOTS_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>关联工具</label>
            <input value={form.relatedTools} onChange={(e) => set("relatedTools", e.target.value)}
              className={inputCls} placeholder="逗号分隔的工具 slug" />
          </div>
          <div>
            <label className={labelCls}>关联专题</label>
            <input value={form.relatedTopics} onChange={(e) => set("relatedTopics", e.target.value)}
              className={inputCls} placeholder="逗号分隔的专题 slug" />
          </div>
          <div>
            <label className={labelCls}>关联清单</label>
            <input value={form.relatedChecklists} onChange={(e) => set("relatedChecklists", e.target.value)}
              className={inputCls} placeholder="逗号分隔的清单 slug" />
          </div>
          <div>
            <label className={labelCls}>关联指南</label>
            <input value={form.relatedGuides} onChange={(e) => set("relatedGuides", e.target.value)}
              className={inputCls} placeholder="逗号分隔的指南 slug" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[44px]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "保存中..." : "创建指南"}
          </button>
          <Link href="/admin/content/guides"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 min-h-[44px]">
            取消
          </Link>
        </div>
      </div>
    </div>
  );
}
