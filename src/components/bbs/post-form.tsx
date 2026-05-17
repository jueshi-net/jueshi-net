"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BaseButton } from "@/components/ui/base-button";

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
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    category?: string;
    submit?: string;
  }>({});
  const [success, setSuccess] = useState(false);

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
      e.content = "内容最多 3000 个字符";
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
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrors({ submit: data.error || "发布失败，请重试" });
          return;
        }

        setSuccess(true);
        router.push("/bbs?created=1");
      } catch {
        setErrors({ submit: "网络错误，请重试" });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Category select */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          分类 <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={cnInput(!!errors.category)}
        >
          <option value="">请选择分类</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.iconText ? `${cat.iconText} ` : ""}
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-xs text-red-500">{errors.category}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          标题 <span className="text-red-500">*</span>
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
            <span />
          )}
          <span className="text-xs text-gray-400">{title.length}/80</span>
        </div>
      </div>

      {/* Content */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请输入帖子内容（10-3000字，纯文本）"
          maxLength={3000}
          rows={8}
          className={cnInput(!!errors.content)}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.content ? (
            <p className="text-xs text-red-500">{errors.content}</p>
          ) : (
            <span />
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
        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
          <p className="text-sm text-green-600">
            🎉 发布成功！正在跳转到论坛首页...
          </p>
        </div>
      )}

      {/* Submit button */}
      <div className="flex items-center gap-3 pt-2">
        <BaseButton type="submit" variant="primary" size="lg" loading={isPending} disabled={isPending}>
          {isPending ? "发布中..." : "发布帖子"}
        </BaseButton>
        <span className="text-xs text-gray-400">
          普通用户发帖需审核后显示，管理员帖子直接发布
        </span>
      </div>
    </form>
  );
}

function cnInput(hasError: boolean) {
  return [
    "w-full rounded-lg border px-3 py-2.5 text-sm transition-colors",
    "placeholder:text-gray-400",
    "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1",
    hasError
      ? "border-red-300 bg-red-50"
      : "border-gray-300 bg-white hover:border-gray-400",
  ].join(" ");
}
