"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BaseButton } from "@/components/ui/base-button";
import { X, Plus, Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { BbsComposer } from "@/components/bbs/bbs-composer";

type ForumCategory = {
  id: string;
  key: string;
  name: string;
  iconText: string | null;
};

interface PostFormProps {
  categories: ForumCategory[];
  initialTitle?: string;
  initialContent?: string;
  initialCategoryKey?: string;
  toolContext?: string;
  editMode?: boolean;
  editSlug?: string;
  initialStatus?: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function PostForm({ categories, initialTitle = "", initialContent = "", initialCategoryKey = "", toolContext = "", editMode = false, editSlug, initialStatus }: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [categoryId, setCategoryId] = useState(() => {
    if (initialCategoryKey) {
      const cat = categories.find((c) => c.key === initialCategoryKey);
      if (cat) return cat.id;
    }
    return "";
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    category?: string;
    submit?: string;
  }>({});
  const [success, setSuccess] = useState(false);

  // Draft auto-save state
  const isDraftMode = editMode && initialStatus === "draft";
  const [draftId, setDraftId] = useState<string | null>(editMode ? editSlug || null : null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef({ title: initialTitle, content: initialContent, categoryId: "" });

  function addTag() {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setTagInput("");
      return;
    }
    if (tags.length >= 5) return;
    setTags([...tags, trimmed.slice(0, 20)]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  // --- Draft auto-save ---
  const autoSaveDraft = useCallback(async (currentTitle: string, currentContent: string, currentCategoryId: string) => {
    // Only auto-save in draft mode
    if (!isDraftMode) return;
    // Skip if nothing changed
    if (
      currentTitle === lastSavedRef.current.title &&
      currentContent === lastSavedRef.current.content &&
      currentCategoryId === lastSavedRef.current.categoryId
    ) return;

    setSaveStatus("saving");
    try {
      if (draftId) {
        // Update existing draft via PATCH
        const res = await fetch(`/api/forum/posts/${draftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: currentTitle,
            content: currentContent,
            categoryId: currentCategoryId,
            saveAsDraft: true,
          }),
        });
        if (res.ok) {
          lastSavedRef.current = { title: currentTitle, content: currentContent, categoryId: currentCategoryId };
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
        }
      } else {
        // Create new draft via POST
        const res = await fetch("/api/forum/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: currentTitle,
            content: currentContent,
            categoryId: currentCategoryId,
            saveAsDraft: true,
          }),
        });
        const data = await res.json();
        if (res.ok && data.post?.slug) {
          setDraftId(data.post.slug);
          lastSavedRef.current = { title: currentTitle, content: currentContent, categoryId: currentCategoryId };
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
        }
      }
    } catch {
      setSaveStatus("error");
    }
  }, [isDraftMode, draftId]);

  // Debounced auto-save effect for draft mode
  useEffect(() => {
    if (!isDraftMode) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      autoSaveDraft(title, content, categoryId);
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [title, content, categoryId, isDraftMode, autoSaveDraft]);

  // Save draft handler (manual button)
  async function handleSaveDraft() {
    setErrors({});
    setSaveStatus("saving");
    try {
      if (draftId) {
        const res = await fetch(`/api/forum/posts/${draftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), content: content.trim(), categoryId, saveAsDraft: true }),
        });
        const data = await res.json();
        if (res.ok) {
          setSaveStatus("saved");
          lastSavedRef.current = { title, content, categoryId };
        } else {
          setSaveStatus("error");
          setErrors({ submit: data.error || "保存失败" });
        }
      } else {
        const res = await fetch("/api/forum/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), content: content.trim(), categoryId, saveAsDraft: true }),
        });
        const data = await res.json();
        if (res.ok && data.post?.slug) {
          setDraftId(data.post.slug);
          setSaveStatus("saved");
          lastSavedRef.current = { title, content, categoryId };
        } else {
          setSaveStatus("error");
          setErrors({ submit: data.error || "保存失败" });
        }
      }
    } catch {
      setSaveStatus("error");
      setErrors({ submit: "网络错误，请重试" });
    }
  }

  // Submit draft for review
  async function handleSubmitDraftForReview() {
    setErrors({});
    if (!validate()) {
      setSaveStatus("error");
      return;
    }
    startTransition(async () => {
      try {
        // First save latest content
        const saveRes = await fetch(`/api/forum/posts/${draftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            categoryId,
            submitForReview: true,
          }),
        });
        const data = await saveRes.json();
        if (!saveRes.ok) {
          setErrors({ submit: data.error || "提交失败" });
          setSaveStatus("error");
          return;
        }
        setSuccess(true);
        router.push(`/bbs?created=1&status=${data.post?.status || "pending"}`);
      } catch {
        setErrors({ submit: "网络错误，请重试" });
        setSaveStatus("error");
      }
    });
  }

  function validate() {
    const e: typeof errors = {};

    if (!title.trim()) {
      e.title = "标题不能为空";
    } else if (title.trim().length < 5) {
      e.title = "标题至少 5 个字符";
    } else if (title.trim().length > 80) {
      e.title = "标题最多 80 个字符";
    }

    if (!content.trim()) {
      e.content = "内容不能为空";
    } else if (content.trim().length < 10) {
      e.content = "内容至少 10 个字符";
    } else if (content.trim().length > 3000) {
      e.content = "内容最多 3000 字符";
    }

    if (!categoryId) {
      e.category = "请选择分类";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    if (!validate()) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/forum/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            categoryId,
            tags: tags.length > 0 ? tags : undefined,
            relatedTool: toolContext || undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrors({ submit: data.error || "发布失败，请重试" });
          return;
        }

        // API returns { success: true, post: { id, slug, status, ... } }
        const post = data.post;
        if (!post || !post.slug || !post.status) {
          setErrors({ submit: "发布成功但返回数据异常，请返回论坛查看" });
          return;
        }

        setSuccess(true);

        // Status-aware redirect:
        // - published: go directly to the post
        // - pending/other: go to forum home with status indicator
        //   (pending posts are not publicly visible and would 404)
        if (post.status === "published") {
          router.push(`/bbs/${post.slug}`);
        } else {
          router.push(`/bbs?created=1&status=${post.status}`);
        }
      } catch {
        setErrors({ submit: "网络错误，请重试" });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tool context badge */}
      {toolContext && (
        <div data-testid="bbs-compose-tool-context" className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <span className="text-sm text-blue-600">🔗 关联工具：</span>
          <Link href={`/tools/documents/${toolContext}`} className="text-sm text-blue-700 font-medium hover:underline">
            {toolContext}
          </Link>
        </div>
      )}
      {/* Category selection — visual cards */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择分类 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left ${
                categoryId === cat.id
                  ? "border-brand bg-brand/5 text-brand ring-1 ring-brand/30"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {cat.iconText && <span className="text-base">{cat.iconText}</span>}
              <span className="truncate">{cat.name}</span>
            </button>
          ))}
        </div>
        {errors.category && (
          <p className="mt-1.5 text-xs text-red-500">{errors.category}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          帖子标题 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入帖子标题（5-80字）"
          maxLength={80}
          data-testid="bbs-compose-title"
          className={cnInput(!!errors.title)}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.title ? (
            <p className="text-xs text-red-500">{errors.title}</p>
          ) : (
            <span className="text-xs text-gray-400">简洁明了的标题能吸引更多回复</span>
          )}
          <span className="text-xs text-gray-400">{title.length}/80</span>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          标签 <span className="text-gray-400 text-xs">（可选，最多 5 个）</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="输入标签后按回车添加"
            maxLength={20}
            className={cnInput(false)}
          />
          <button
            type="button"
            onClick={addTag}
            className="shrink-0 px-3 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors inline-flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> 添加
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand/10 text-brand rounded-full text-xs font-medium"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content — BbsComposer with formatting + emoji + preview */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          帖子内容 <span className="text-red-500">*</span>
        </label>
        <BbsComposer
          value={content}
          onChange={setContent}
          placeholder={"请输入帖子内容（10-3000字）\n\n支持 Markdown 排版：**加粗** *斜体* ## 标题 - 列表 > 引用 `代码`"}
          maxLength={3000}
        />
        {errors.content ? (
          <p className="mt-1 text-xs text-red-500">{errors.content}</p>
        ) : (
          <span className="mt-1 block text-xs text-slate-500">支持 Markdown 排版，不支持 HTML</span>
        )}
      </div>

      {/* Submit error */}
      {errors.submit && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-700 font-medium mb-1">
            ✅ 帖子已提交，审核通过后将在社区公开
          </p>
          <p className="text-xs text-green-600">
            正在跳转...
          </p>
        </div>
      )}

      {/* Auto-save status indicator (draft mode only) */}
      {isDraftMode && saveStatus !== "idle" && (
        <div className="flex items-center gap-2 text-sm">
          {saveStatus === "saving" && (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-blue-600">保存中...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600">已保存</span>
            </>
          )}
          {saveStatus === "error" && (
            <>
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-600">保存失败，请手动保存</span>
            </>
          )}
        </div>
      )}

      {/* Submit buttons */}
      <div className="flex items-center gap-3 pt-2 flex-wrap">
        {isDraftMode ? (
          <>
            {/* Draft mode: Save draft + Submit for review */}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              data-testid="bbs-compose-save-draft"
            >
              <Save className="w-4 h-4" />
              保存草稿
            </button>
            <BaseButton type="button" variant="primary" size="lg" loading={isPending} disabled={isPending} onClick={handleSubmitDraftForReview} data-testid="bbs-compose-submit-review">
              {isPending ? "提交中..." : "📝 提交审核"}
            </BaseButton>
          </>
        ) : (
          <>
            {/* Normal mode: Save draft + Publish */}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              data-testid="bbs-compose-save-draft"
            >
              <Save className="w-4 h-4" />
              保存草稿
            </button>
            <BaseButton type="submit" variant="primary" size="lg" loading={isPending} disabled={isPending} data-testid="bbs-compose-submit">
              {isPending ? "发布中..." : "🚀 发布帖子"}
            </BaseButton>
          </>
        )}
        <Link
          href="/bbs"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          取消
        </Link>
        <span className="text-xs text-gray-400 ml-auto">
          普通用户发帖需审核后显示
        </span>
      </div>
    </form>
  );
}

function cnInput(hasError: boolean) {
  return [
    "w-full rounded-lg border px-3 py-2.5 text-sm transition-colors",
    "placeholder:text-gray-400",
    "focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1",
    hasError
      ? "border-red-300 bg-red-50"
      : "border-gray-300 bg-white hover:border-gray-400",
  ].join(" ");
}
