"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, MessageSquare, Loader2, AlertCircle, CheckCircle } from "lucide-react";

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
}

const MAX_CHARS = 300;
const MIN_CHARS = 5;

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
        // Refresh reviews after a short delay (in case admin auto-approves)
        setTimeout(fetchReviews, 2000);
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
    <div className="space-y-4">
      {/* Rating summary */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">{avg > 0 ? avg.toFixed(1) : "—"}</div>
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i <= Math.round(avg) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">{count > 0 ? `${count} 条评价` : "暂无评价"}</div>
          </div>
          <div className="flex-1 border-l border-amber-200 pl-4">
            {!submitted && isLoggedIn && (
              showForm ? (
                <div className="space-y-2">
                  {/* Star rating */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        onClick={() => setRating(i)}
                        className="p-1"
                        type="button"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
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
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${content.length >= MIN_CHARS ? "text-gray-400" : "text-amber-500"}`}>
                      {content.length}/{MAX_CHARS}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowForm(false); setContent(""); setError(null); }}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg min-h-[44px]"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting || content.length < MIN_CHARS}
                        className="px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-1 min-h-[44px]"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        提交评价
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="flex items-center gap-1 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium min-h-[48px] w-full justify-center"
                >
                  <MessageSquare className="w-4 h-4" />
                  写短评
                </button>
              )
            )}
            {!isLoggedIn && (
              <a
                href={`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium min-h-[48px] justify-center"
              >
                <MessageSquare className="w-4 h-4" />
                登录后写短评
              </a>
            )}
            {submitted && (
              <div className="text-sm text-green-600 bg-green-50 border border-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>已提交，审核通过后展示</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review list */}
      {data?.reviews && data.reviews.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">用户评价</h3>
          {data.reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">{r.userName}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{r.content}</p>
            </div>
          ))}
          {count > 10 && (
            <p className="text-xs text-gray-400 text-center py-2">还有 {count - 10} 条评价未展示</p>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500 mb-1">暂无用户评价</p>
          <p className="text-xs text-gray-400">成为第一个评价的人吧！</p>
        </div>
      )}
    </div>
  );
}
