"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BaseButton } from "@/components/ui/base-button";
import { X, Plus } from "lucide-react";

type ForumCategory = {
  id: string;
  key: string;
  name: string;
  iconText: string | null;
};

interface PostFormProps {
  categories: ForumCategory[];
}

export default function PostForm({ categories }: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    category?: string;
    submit?: string;
  }>({});
  const [success, setSuccess] = useState(false);

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
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrors({ submit: data.error || "发布失败，请重试" });
          return;
        }

        setSuccess(true);
        // Redirect to the new post if slug is returned, otherwise to /bbs
        if (data.slug) {
          router.push(`/bbs/${data.slug}`);
        } else {
          router.push("/bbs?created=1");
        }
      } catch {
        setErrors({ submit: "网络错误，请重试" });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      {/* Content — larger area */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          帖子内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请输入帖子内容（10-3000字，纯文本）&#10;&#10;详细描述你的问题或经验，方便其他人理解和回复。"
          maxLength={3000}
          rows={12}
          className={cnInput(!!errors.content) + " resize-y min-h-[280px]"}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.content ? (
            <p className="text-xs text-red-500">{errors.content}</p>
          ) : (
            <span className="text-xs text-gray-400">不支持 HTML，纯文本即可</span>
          )}
          <span className="text-xs text-gray-400">{content.length}/3000</span>
        </div>
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
            🎉 帖子已提交！正在跳转...
          </p>
        </div>
      )}

      {/* Submit button */}
      <div className="flex items-center gap-3 pt-2">
        <BaseButton type="submit" variant="primary" size="lg" loading={isPending} disabled={isPending}>
          {isPending ? "发布中..." : "🚀 发布帖子"}
        </BaseButton>
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
