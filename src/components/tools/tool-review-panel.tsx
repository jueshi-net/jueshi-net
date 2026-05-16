"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, MessageSquare, Loader2, AlertCircle } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  userName: string;
}

interface ReviewData {
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
}

interface ToolReviewPanelProps {
  toolKey: string;
  isLoggedIn?: boolean;
  onFavorite?: () => void;
}

const MAX_CHARS = 140;
const MIN_CHARS = 10;

export default function ToolReviewPanel({ toolKey, isLoggedIn }: ToolReviewPanelProps) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/tools/reviews?toolKey=${encodeURIComponent(toolKey)}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [toolKey]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/tools/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolKey, rating, content }),
      });
      const d = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setShowForm(false);
      } else {
        setError(d.error || "提交失败");
      }
    } catch {
      setError("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        加载中...
      </div>
    );
  }

  const avg = data?.avgRating || 0;
  const count = data?.reviewCount || 0;

  return (
    <div className="space-y-3">
      {/* Rating summary */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i <= Math.round(avg) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-700">{avg > 0 ? avg.toFixed(1) : "暂无"}</span>
        <span className="text-sm text-gray-400">({count} 条短评)</span>
      </div>

      {/* Review form or CTA */}
      {!submitted && isLoggedIn && (
        <div>
          {showForm ? (
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              {/* Star rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    onClick={() => setRating(i)}
                    className="p-0.5"
                    type="button"
                  >
                    <Star
                      className={`w-6 h-6 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
              {/* Textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`说说你对这个工具的看法（${MIN_CHARS}-${MAX_CHARS}字）...`}
                maxLength={MAX_CHARS}
                rows={3}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex items-center justify-between">
                <span className={`text-xs ${content.length >= MIN_CHARS ? "text-gray-400" : "text-amber-500"}`}>
                  {content.length}/{MAX_CHARS}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowForm(false); setContent(""); setError(null); }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || content.length < MIN_CHARS}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    提交
                  </button>
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <MessageSquare className="w-4 h-4" />
              写短评
            </button>
          )}
        </div>
      )}

      {!isLoggedIn && (
        <a
          href={`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <MessageSquare className="w-4 h-4" />
          登录后写短评
        </a>
      )}

      {submitted && (
        <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
          ✅ 已提交，等待审核
        </div>
      )}

      {/* Review list */}
      {data?.reviews && data.reviews.length > 0 && (
        <div className="space-y-2">
          {data.reviews.slice(0, 3).map((r) => (
            <div key={r.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">{r.userName}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </div>
              <p className="text-sm text-gray-700">{r.content}</p>
            </div>
          ))}
          {count > 3 && (
            <p className="text-xs text-gray-400 text-center">还有 {count - 3} 条短评</p>
          )}
        </div>
      )}
    </div>
  );
}
