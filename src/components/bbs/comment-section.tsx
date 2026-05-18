"use client";

import { useState, useCallback, useTransition } from "react";
import Link from "next/link";
import { MessageSquare, Send } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { BaseButton } from "@/components/ui/base-button";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
};

interface CommentSectionProps {
  postId: string;
  slug: string;
  initialComments: Comment[];
  isLocked: boolean;
  isLoggedIn: boolean;
}

/**
 * CommentSection — 评论区（Client Component）
 */
export default function CommentSection({
  postId,
  slug,
  initialComments,
  isLocked,
  isLoggedIn,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [newContent, setNewContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      const trimmed = newContent.trim();
      if (!trimmed) {
        setError("评论内容不能为空");
        return;
      }
      if (trimmed.length < 2) {
        setError("评论至少 2 个字符");
        return;
      }
      if (trimmed.length > 1000) {
        setError("评论最多 1000 个字符");
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
            setError(data.error || "评论失败，请重试");
            return;
          }

          // 评论提交后进入待审核状态，不立即显示在列表中
          setNewContent("");
          setSuccess(true);
        } catch {
          setError("网络错误，请重试");
        }
      });
    },
    [newContent, postId]
  );

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <MessageSquare className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          评论 ({comments.length})
        </h3>
      </div>

      {/* Locked notice */}
      {isLocked && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 mb-5">
          <p className="text-sm text-gray-500">
            🔒 该帖已锁定，不能继续评论
          </p>
        </div>
      )}

      {/* Pending comment notice */}
      {success && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 mb-5">
          <p className="text-sm text-amber-700">
            ✅ 评论已提交，审核通过后展示。
          </p>
        </div>
      )}

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-lg border border-gray-100 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                  {(comment.user.name || comment.user.email)[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {comment.user.name || maskEmail(comment.user.email)}
                </span>
                <time
                  dateTime={comment.createdAt.toString()}
                  className="text-xs text-gray-400 ml-auto"
                >
                  {formatDateTime(comment.createdAt)}
                </time>
              </div>
              <div className="whitespace-pre-wrap break-words text-sm text-gray-700 leading-relaxed pl-9">
                {comment.content}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-8 text-center mb-6">
          <p className="text-sm text-gray-400">暂无评论，来做第一个评论的人吧！</p>
        </div>
      )}

      {/* Comment form */}
      {!isLocked && isLoggedIn && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="写下你的评论..."
            maxLength={1000}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 bg-white"
          />
          <div className="flex items-center justify-between">
            {error && <p className="text-xs text-red-500">{error}</p>}
            {!error && <span />}
            <BaseButton
              type="submit"
              variant="primary"
              size="sm"
              loading={isPending}
              disabled={isPending}
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              发表评论
            </BaseButton>
          </div>
        </form>
      )}

      {/* Guest login prompt */}
      {!isLocked && !isLoggedIn && (
        <div className="rounded-lg bg-teal-50 border border-teal-100 p-5 text-center">
          <p className="text-sm text-gray-600 mb-3">登录后参与评论</p>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/bbs/${slug}`)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            登录 / 注册
          </Link>
        </div>
      )}
    </div>
  );
}

function maskEmail(email: string): string {
  if (!email) return "匿名用户";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}
