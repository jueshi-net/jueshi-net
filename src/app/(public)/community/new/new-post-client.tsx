"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

interface Category { id: string; name: string; key: string; iconText: string | null; }

export function NewPostClient({ categories, defaultCategoryId }: { categories: Category[]; defaultCategoryId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId || categories[0]?.id || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!title.trim() || title.trim().length < 5) { setError("标题至少 5 个字符"); return; }
    if (title.trim().length > 80) { setError("标题最多 80 个字符"); return; }
    if (!content.trim() || content.trim().length < 10) { setError("内容至少 10 个字符"); return; }
    if (!categoryId) { setError("请选择分类"); return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), categoryId }),
      });
      const data = await res.json();
      if (res.ok && data.post) {
        router.push(`/community/t/${data.post.slug}`);
      } else {
        setError(data.error || "发帖失败");
      }
    } catch { setError("网络错误"); }
    setSubmitting(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link href="/community" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> 返回社区
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">发帖</h1>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分类 *</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {categories.map(c => <option key={c.id} value={c.id}>{c.iconText} {c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">标题 * (5-80 字)</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={80}
            placeholder="简明扼要描述你的问题或分享主题"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <span className="text-xs text-gray-400">{title.length}/80</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">内容 * (10-3000 字)</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} maxLength={3000}
            placeholder="详细描述你的问题、经验或分享..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[200px] resize-y" />
          <span className="text-xs text-gray-400">{content.length}/3000</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSubmit} disabled={submitting}
            className="inline-flex items-center gap-1 px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
            <Send className="w-4 h-4" /> {submitting ? "发布中..." : "发布"}
          </button>
          <Link href="/community" className="px-4 py-2 text-sm text-gray-500">取消</Link>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          📌 帖子发布后将进入审核队列。管理员审核通过后，帖子将在社区公开展示。
          新用户每日最多发帖 5 条，发帖间隔不少于 1 分钟。
        </div>
      </div>
    </div>
  );
}
