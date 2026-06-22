"use client";

import { useState, useCallback, useTransition } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { BaseButton } from "@/components/ui/base-button";

interface CommentSectionProps {
  postId: string;
  slug: string;
  initialComments: never[];
  isLocked: boolean;
  isLoggedIn: boolean;
}

/**
 * CommentSection — 回复表单（Client Component）
 * 评论列表由页面楼层渲染，此组件只负责回复输入
 */
export default function CommentSection({
  slug,
  isLocked,
  isLoggedIn,
}: CommentSectionProps) {
  const [newContent, setNewContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess(false);

      const trimmed = newContent.trim();
      if (!trimmed) {
        setError("回复内容不能为空");
        return;
      }
      if (trimmed.length < 2) {
        setError("回复至少 2 个字符");
        return;
      }
      if (trimmed.length > 1000) {
        setError("回复最多 1000 个字符");
        return;
      }

      startTransition(async () => {
        try {
          const res = await fetch(`/api/forum/posts/${slug}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: trimmed }),
          });

          const data = await res.json();

          if (!res.ok) {
            setError(data.error || "回复失败，请重试");
            return;
          }

          setNewContent("");
          setSuccess(true);
        } catch {
          setError("网络错误，请重试");
        }
      });
    },
    [newContent, slug]
  );

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {/* Pending notice */}
      {success && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-3">
          <p className="text-sm text-amber-700">
            ✅ 回复已提交，审核通过后展示。
          </p>
        </div>
      )}

      {/* Reply form */}
      {!isLocked && isLoggedIn && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="写下你的回复..."
            maxLength={1000}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 bg-white resize-none"
          />
          <div className="flex items-center justify-between">
            {error && <p className="text-xs text-red-500">{error}</p>}
            {!error && <span className="text-xs text-gray-400">{newContent.length}/1000</span>}
            <BaseButton
              type="submit"
              variant="primary"
              size="sm"
              loading={isPending}
              disabled={isPending}
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              发表回复
            </BaseButton>
          </div>
        </form>
      )}

      {/* Guest login prompt */}
      {!isLocked && !isLoggedIn && (
        <div className="rounded-lg bg-brand/5 border border-brand/10 p-4 text-center">
          <p className="text-sm text-gray-600 mb-2">登录后参与回复</p>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/bbs/${slug}`)}`}
            className="inline-flex items-center gap-2 px-5 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
          >
            登录 / 注册
          </Link>
        </div>
      )}
    </div>
  );
}
