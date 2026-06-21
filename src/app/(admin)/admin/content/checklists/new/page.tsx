"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

type Step = {
  title: string;
  description: string;
  optional: boolean;
  toolLink: string;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "草稿" },
  { value: "published", label: "已发布" },
  { value: "archived", label: "已归档" },
];

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

function newStep(): Step {
  return { title: "", description: "", optional: false, toolLink: "" };
}

export default function NewChecklistPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "", slug: "", summary: "", status: "draft",
    seoTitle: "", seoDescription: "",
    relatedTools: "", relatedTaskChain: "", relatedGuides: "", relatedTopics: "",
  });
  const [steps, setSteps] = useState<Step[]>([newStep()]);

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

    setSaving(true);
    try {
      const payload: any = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        summary: form.summary.trim() || undefined,
        steps: validSteps.map((s) => ({
          title: s.title.trim(),
          description: s.description.trim(),
          optional: s.optional,
          toolLink: s.toolLink.trim(),
        })),
        status: form.status,
        seoTitle: form.seoTitle.trim() || undefined,
        seoDescription: form.seoDescription.trim() || undefined,
        relatedTools: form.relatedTools.split(",").map((s) => s.trim()).filter(Boolean),
        relatedTaskChain: form.relatedTaskChain.trim() || undefined,
        relatedGuides: form.relatedGuides.split(",").map((s) => s.trim()).filter(Boolean),
        relatedTopics: form.relatedTopics.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const res = await fetch("/api/admin/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "创建失败");

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
        <h1 className="text-xl font-bold text-gray-900">新建清单</h1>
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

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 min-h-[44px]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "保存中..." : "创建清单"}
          </button>
          <Link href="/admin/content/checklists"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 min-h-[44px]">
            取消
          </Link>
        </div>
      </div>
    </div>
  );
}
