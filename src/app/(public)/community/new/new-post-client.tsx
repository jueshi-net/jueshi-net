"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Tag as TagIcon,
  Wrench,
  BookOpen,
  ListChecks,
  Link2,
  Eye,
  EyeOff,
  X,
  AlertCircle,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  key: string;
  iconText: string | null;
}

const TOOL_OPTIONS = [
  { value: "", label: "不关联工具" },
  { value: "hs-code", label: "HS 编码查询" },
  { value: "cbm-calculator", label: "CBM 体积计算器" },
  { value: "commercial-invoice", label: "商业发票" },
  { value: "packing-list", label: "装箱单" },
  { value: "address-postal", label: "地址邮编查询" },
];

const TASK_CHAIN_OPTIONS = [
  { value: "", label: "无" },
  { value: "shipping", label: "海运/物流任务链" },
];

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 20;

export function NewPostClient({
  categories,
  defaultCategoryId,
}: {
  categories: Category[];
  defaultCategoryId: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(
    defaultCategoryId || categories[0]?.id || ""
  );
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [relatedTool, setRelatedTool] = useState("");
  const [relatedGuideId, setRelatedGuideId] = useState("");
  const [relatedChecklistId, setRelatedChecklistId] = useState("");
  const [relatedTaskChainType, setRelatedTaskChainType] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function commitTagInput(raw: string) {
    // Split on commas, trim, dedupe, enforce max length per tag & max count.
    const parts = raw
      .split(/[，,]/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, MAX_TAGS)
      .map((t) => t.slice(0, MAX_TAG_LENGTH));
    const merged: string[] = [];
    for (const p of parts) {
      if (!merged.includes(p) && merged.length < MAX_TAGS) merged.push(p);
    }
    setTags(merged);
    // Keep leftover (un-committed) text after the last comma out of chips.
    const lastFragment = raw.split(/[，,]/).pop() ?? "";
    setTagInput(tags.length + merged.length >= MAX_TAGS ? "" : lastFragment.trim());
  }

  function addTagFromInput() {
    const value = tagInput.trim().slice(0, MAX_TAG_LENGTH);
    if (!value) return;
    if (tags.includes(value)) {
      setTagInput("");
      return;
    }
    if (tags.length >= MAX_TAGS) return;
    setTags((prev) => [...prev, value]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTagFromInput();
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  async function handleSubmit() {
    if (!title.trim() || title.trim().length < 5) {
      setError("标题至少 5 个字符");
      return;
    }
    if (title.trim().length > 80) {
      setError("标题最多 80 个字符");
      return;
    }
    if (!content.trim() || content.trim().length < 10) {
      setError("内容至少 10 个字符");
      return;
    }
    if (content.trim().length > 3000) {
      setError("内容最多 3000 个字符");
      return;
    }
    if (!categoryId) {
      setError("请选择分类");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          categoryId,
          tags: tags.length > 0 ? tags : undefined,
          relatedTool: relatedTool || undefined,
          relatedGuideId: relatedGuideId.trim() || undefined,
          relatedChecklistId: relatedChecklistId.trim() || undefined,
          relatedTaskChainType: relatedTaskChainType || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.post) {
        router.push(`/community/t/${data.post.slug}`);
      } else {
        setError(data.error || "发帖失败");
      }
    } catch {
      setError("网络错误");
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link
        href="/community"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> 返回社区
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">发帖</h1>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* 分类 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            分类 *
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.iconText} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* 标题 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              标题 * (5-80 字)
            </label>
            <span
              className={`text-xs ${
                title.length > 80 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {title.length}/80
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder="简明扼要描述你的问题或分享主题"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* 内容 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              内容 * (10-3000 字)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
              >
                {showPreview ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                {showPreview ? "关闭预览" : "实时预览"}
              </button>
              <span
                className={`text-xs ${
                  content.length > 3000 ? "text-red-500" : "text-gray-400"
                }`}
              >
                {content.length}/3000
              </span>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={3000}
            placeholder="详细描述你的问题、经验或分享..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[200px] resize-y"
          />
        </div>

        {/* 实时预览 */}
        {showPreview && (
          <div className="rounded-lg border border-teal-200 bg-teal-50/40 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-teal-700 mb-2">
              <Eye className="w-3.5 h-3.5" /> 预览
            </div>
            {content.trim() ? (
              <div className="prose prose-sm max-w-none">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {title.trim() || "（未填写标题）"}
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {content}
                </p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-xs"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">在上方输入内容后将显示预览...</p>
            )}
          </div>
        )}

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="inline-flex items-center gap-1">
              <TagIcon className="w-3.5 h-3.5" /> 标签（逗号分隔，最多 {MAX_TAGS} 个）
            </span>
          </label>
          <div className="flex flex-wrap items-center gap-1.5 px-2 py-2 border border-gray-300 rounded-lg bg-white min-h-[42px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-xs"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-teal-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {tags.length < MAX_TAGS && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v.includes(",") || v.includes("，")) {
                    commitTagInput(v);
                  } else {
                    setTagInput(v.slice(0, MAX_TAG_LENGTH));
                  }
                }}
                onKeyDown={handleTagKeyDown}
                onBlur={addTagFromInput}
                placeholder={
                  tags.length === 0 ? "如：shipping,cbm,清关" : "继续添加..."
                }
                className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
              />
            )}
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            {tags.length}/{MAX_TAGS} 个标签 · 按逗号或回车确认
          </span>
        </div>

        {/* 关联资源 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 关联工具 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="inline-flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" /> 关联工具
              </span>
            </label>
            <select
              value={relatedTool}
              onChange={(e) => setRelatedTool(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              {TOOL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 任务链类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="inline-flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5" /> 关联任务链类型
              </span>
            </label>
            <select
              value={relatedTaskChainType}
              onChange={(e) => setRelatedTaskChainType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              {TASK_CHAIN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 关联指南 ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="inline-flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> 关联指南 ID
              </span>
            </label>
            <input
              type="text"
              value={relatedGuideId}
              onChange={(e) => setRelatedGuideId(e.target.value)}
              placeholder="可选，填写指南 ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* 关联清单 ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="inline-flex items-center gap-1">
                <ListChecks className="w-3.5 h-3.5" /> 关联清单 ID
              </span>
            </label>
            <input
              type="text"
              value={relatedChecklistId}
              onChange={(e) => setRelatedChecklistId(e.target.value)}
              placeholder="可选，填写清单 ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1 px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {submitting ? "发布中..." : "发布"}
          </button>
          <Link
            href="/community"
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            取消
          </Link>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          📌 帖子发布后将进入审核队列。管理员审核通过后，帖子将在社区公开展示。
          新用户每日最多发帖 5 条，发帖间隔不少于 1 分钟。
        </div>
      </div>
    </div>
  );
}
