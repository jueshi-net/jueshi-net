"use client";

import { useState } from "react";
import {
  ThumbsUp,
  Bookmark,
  Share2,
  Flag,
  AlertCircle,
} from "lucide-react";

interface PostDetailActionsProps {
  slug: string;
  initialLikeCount: number;
  initialHasLiked: boolean;
  initialHasBookmarked: boolean;
  isLoggedIn: boolean;
  isAuthor: boolean;
}

/**
 * PostDetailActions - V4 client component for post-level actions.
 * Handles like, bookmark, share, and report with real API integration.
 */
export function PostDetailActions({
  slug,
  initialLikeCount,
  initialHasLiked,
  initialHasBookmarked,
  isLoggedIn,
  isAuthor,
}: PostDetailActionsProps) {
  const [liked, setLiked] = useState(initialHasLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [bookmarked, setBookmarked] = useState(initialHasBookmarked);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/bbs/${slug}`)}`;

  function flash(msg: string) {
    setMessage(msg);
    window.setTimeout(() => setMessage(""), 3500);
  }

  async function handleLike() {
    if (!isLoggedIn) {
      window.location.href = loginUrl;
      return;
    }
    if (isAuthor) {
      flash("不能给自己的帖子点赞");
      return;
    }
    if (busy) return;
    setBusy(true);

    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
      try {
        await fetch(`/api/forum/posts/${slug}/like`, { method: "DELETE" });
      } catch {
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      try {
        const res = await fetch(`/api/forum/posts/${slug}/like`, {
          method: "POST",
        });
        if (!res.ok) {
          setLiked(false);
          setLikeCount((c) => c - 1);
          const d = await res.json().catch(() => ({}));
          flash(d.error || "操作失败");
        }
      } catch {
        setLiked(false);
        setLikeCount((c) => c - 1);
        flash("网络错误");
      }
    }
    setBusy(false);
  }

  async function handleBookmark() {
    if (!isLoggedIn) {
      window.location.href = loginUrl;
      return;
    }
    if (busy) return;
    setBusy(true);
    const method = bookmarked ? "DELETE" : "POST";
    setBookmarked((b) => !b);
    try {
      const res = await fetch(`/api/forum/posts/${slug}/bookmark`, { method });
      if (!res.ok) {
        setBookmarked((b) => !b);
        const d = await res.json().catch(() => ({}));
        flash(d.error || "操作失败");
      }
    } catch {
      setBookmarked((b) => !b);
      flash("网络错误");
    }
    setBusy(false);
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        flash("链接已复制");
      } catch {
        flash(url);
      }
    }
  }

  async function handleReport() {
    if (!isLoggedIn) {
      window.location.href = loginUrl;
      return;
    }
    if (!reportReason) {
      flash("请选择举报原因");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/forum/posts/${slug}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        flash("举报已提交");
        setShowReport(false);
        setReportReason("");
      } else {
        flash(data.error || "举报失败");
      }
    } catch {
      flash("网络错误");
    }
    setBusy(false);
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {message && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="min-w-0 break-words">{message}</span>
        </div>
      )}

      {/* Report form */}
      {showReport && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-800 mb-2">举报原因</p>
          <div className="space-y-1.5">
            {[
              { value: "spam", label: "垃圾广告" },
              { value: "inappropriate", label: "不当内容" },
              { value: "harassment", label: "人身攻击" },
              { value: "illegal", label: "违法违规" },
              { value: "other", label: "其他" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm text-amber-700 cursor-pointer"
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={opt.value}
                  checked={reportReason === opt.value}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="accent-amber-600"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleReport}
              disabled={busy}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              提交举报
            </button>
            <button
              onClick={() => {
                setShowReport(false);
                setReportReason("");
              }}
              className="px-3 py-1.5 bg-white text-gray-600 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleLike}
          disabled={busy}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors border disabled:opacity-50 ${
            liked
              ? "text-brand border-brand/30 bg-brand/5"
              : "text-slate-600 border-slate-200 hover:bg-brand/5 hover:text-brand"
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          <span>点赞</span>
          {likeCount > 0 && (
            <span className="text-xs text-slate-400">{likeCount}</span>
          )}
        </button>

        <button
          onClick={handleBookmark}
          disabled={busy}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors border disabled:opacity-50 ${
            bookmarked
              ? "text-brand border-brand/30 bg-brand/5"
              : "text-slate-600 border-slate-200 hover:bg-brand/5 hover:text-brand"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
          <span>{bookmarked ? "已收藏" : "收藏"}</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-brand/5 hover:text-brand transition-colors border border-slate-200"
        >
          <Share2 className="w-4 h-4" />
          <span>分享</span>
        </button>

        <button
          onClick={() => setShowReport((s) => !s)}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors border border-slate-200 ml-auto disabled:opacity-50"
        >
          <Flag className="w-4 h-4" />
          <span>举报</span>
        </button>
      </div>
    </div>
  );
}
