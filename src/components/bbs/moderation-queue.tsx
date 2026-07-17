"use client";

import { useState, useTransition, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Shield,
  AlertCircle,
  Clock,
  User,
  Ban,
  RotateCcw,
  Pin,
  Star,
  Lock,
  Unlock,
} from "lucide-react";
import Link from "next/link";

interface PendingPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  status: string;
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  category: { id: string; key: string; name: string };
  author: { id: string; name: string | null; email: string };
  rejectionReason: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
}

interface ModerationQueueProps {
  initialPosts: PendingPost[];
  initialTotal: number;
  statusCounts: Record<string, number>;
  currentStatus: string;
  isAdmin: boolean;
}

export function ModerationQueue({
  initialPosts,
  initialTotal,
  statusCounts,
  currentStatus,
  isAdmin,
}: ModerationQueueProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [batchRejectReason, setBatchRejectReason] = useState("");
  const [showBatchReject, setShowBatchReject] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, startTransition] = useTransition();

  function flash(msg: string) {
    setMessage(msg);
    window.setTimeout(() => setMessage(""), 4000);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === posts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(posts.map((p) => p.id)));
    }
  }

  const refresh = useCallback(() => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/forum/admin/pending?status=${currentStatus}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
          setTotal(data.total || 0);
          setSelected(new Set());
        }
      } catch {
        flash("刷新失败");
      }
    });
  }, [currentStatus]);

  async function handleApprove(postId: string) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/forum/admin/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, action: "approve" }),
        });
        const data = await res.json();
        if (res.ok) {
          flash("已通过审核");
          refresh();
        } else {
          flash(data.error || "操作失败");
        }
      } catch {
        flash("网络错误");
      }
    });
  }

  async function handleReject(postId: string) {
    if (!rejectReason.trim() || rejectReason.trim().length < 2) {
      flash("驳回原因至少 2 个字符");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/forum/admin/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId,
            action: "reject",
            reason: rejectReason.trim(),
          }),
        });
        const data = await res.json();
        if (res.ok) {
          flash("已驳回");
          setRejectId(null);
          setRejectReason("");
          refresh();
        } else {
          flash(data.error || "操作失败");
        }
      } catch {
        flash("网络错误");
      }
    });
  }

  async function handleBatchApprove() {
    if (selected.size === 0) {
      flash("请先选择帖子");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/forum/admin/pending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "approve",
            postIds: Array.from(selected),
          }),
        });
        const data = await res.json();
        if (res.ok) {
          flash(`已批量通过 ${data.processed} 篇`);
          refresh();
        } else {
          flash(data.error || "操作失败");
        }
      } catch {
        flash("网络错误");
      }
    });
  }

  async function handleBatchReject() {
    if (selected.size === 0) {
      flash("请先选择帖子");
      return;
    }
    if (!batchRejectReason.trim() || batchRejectReason.trim().length < 2) {
      flash("驳回原因至少 2 个字符");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/forum/admin/pending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reject",
            postIds: Array.from(selected),
            reason: batchRejectReason.trim(),
          }),
        });
        const data = await res.json();
        if (res.ok) {
          flash(`已批量驳回 ${data.processed} 篇`);
          setShowBatchReject(false);
          setBatchRejectReason("");
          refresh();
        } else {
          flash(data.error || "操作失败");
        }
      } catch {
        flash("网络错误");
      }
    });
  }

  async function handleModerate(
    postId: string,
    action: "hide" | "restore" | "pin" | "unpin" | "feature" | "unfeature" | "lock" | "unlock"
  ) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/forum/admin/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, action }),
        });
        const data = await res.json();
        if (res.ok) {
          flash("操作成功");
          refresh();
        } else {
          flash(data.error || "操作失败");
        }
      } catch {
        flash("网络错误");
      }
    });
  }

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-700 mb-2">无权访问</p>
        <p className="text-sm text-gray-500">此页面仅管理员可用</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Flash message */}
      {message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "pending", label: "待审核", count: statusCounts.pending || 0 },
          { key: "rejected", label: "已驳回", count: statusCounts.rejected || 0 },
          { key: "hidden", label: "已隐藏", count: statusCounts.hidden || 0 },
          { key: "all", label: "全部", count: (statusCounts.pending || 0) + (statusCounts.rejected || 0) + (statusCounts.hidden || 0) },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/bbs/admin?status=${tab.key}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentStatus === tab.key
                ? "bg-brand text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-75">({tab.count})</span>
          </Link>
        ))}
      </div>

      {/* Batch actions */}
      {posts.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-200 p-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.size === posts.length && posts.length > 0}
              onChange={toggleSelectAll}
              className="accent-brand"
            />
            全选 ({selected.size}/{posts.length})
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleBatchApprove}
              disabled={busy || selected.size === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium hover:bg-green-100 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              批量通过
            </button>
            <button
              onClick={() => setShowBatchReject((v) => !v)}
              disabled={busy || selected.size === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium hover:bg-red-100 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              批量驳回
            </button>
          </div>
          {showBatchReject && (
            <div className="flex flex-wrap items-center gap-2 w-full mt-2">
              <input
                type="text"
                value={batchRejectReason}
                onChange={(e) => setBatchRejectReason(e.target.value)}
                placeholder="输入驳回原因（至少 2 个字符）"
                maxLength={200}
                className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <button
                onClick={handleBatchReject}
                disabled={busy}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                确认驳回
              </button>
            </div>
          )}
        </div>
      )}

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">
            暂无待审核帖子
          </p>
          <p className="text-sm text-gray-500 mt-1">所有帖子均已处理</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-white rounded-xl border p-4 transition-colors ${
                selected.has(post.id)
                  ? "border-brand ring-2 ring-brand/20"
                  : "border-gray-200"
              }`}
            >
              {/* Header row */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected.has(post.id)}
                  onChange={() => toggleSelect(post.id)}
                  className="mt-1 accent-brand"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        post.status === "pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : post.status === "rejected"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-gray-50 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {post.status === "pending"
                        ? "待审核"
                        : post.status === "rejected"
                        ? "已驳回"
                        : post.status === "hidden"
                        ? "已隐藏"
                        : post.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-100">
                      {post.category.name}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 break-words mb-1">
                    {post.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author.name || post.author.email}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(post.createdAt).toLocaleString("zh-CN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rejection reason */}
              {post.rejectionReason && (
                <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-xs font-medium text-red-700 mb-1">
                    驳回原因{post.rejectedBy ? `（${post.rejectedBy}）` : ""}
                  </p>
                  <p className="text-sm text-red-600">{post.rejectionReason}</p>
                </div>
              )}

              {/* Content preview */}
              {expandedId === post.id && (
                <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {post.content}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => handleApprove(post.id)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-medium hover:bg-green-100 disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  通过
                </button>
                <button
                  onClick={() => {
                    setRejectId(rejectId === post.id ? null : post.id);
                    setRejectReason("");
                  }}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  驳回
                </button>
                <button
                  onClick={() =>
                    setExpandedId(expandedId === post.id ? null : post.id)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-100"
                >
                  {expandedId === post.id ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" /> 收起
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" /> 预览
                    </>
                  )}
                </button>
                <Link
                  href={`/bbs/${post.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-100"
                >
                  <Eye className="w-3.5 h-3.5" />
                  查看
                </Link>
                {/* Admin moderation actions */}
                {post.status === "published" && (
                  <>
                    <button
                      onClick={() => handleModerate(post.id, post.isPinned ? "unpin" : "pin")}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-xs font-medium hover:bg-purple-100 disabled:opacity-50"
                    >
                      <Pin className="w-3.5 h-3.5" />
                      {post.isPinned ? "取消置顶" : "置顶"}
                    </button>
                    <button
                      onClick={() => handleModerate(post.id, post.isFeatured ? "unfeature" : "feature")}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium hover:bg-amber-100 disabled:opacity-50"
                    >
                      <Star className="w-3.5 h-3.5" />
                      {post.isFeatured ? "取消精华" : "精华"}
                    </button>
                    <button
                      onClick={() => handleModerate(post.id, post.isLocked ? "unlock" : "lock")}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-100 disabled:opacity-50"
                    >
                      {post.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      {post.isLocked ? "解锁" : "锁定"}
                    </button>
                    <button
                      onClick={() => handleModerate(post.id, "hide")}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-medium hover:bg-orange-100 disabled:opacity-50"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      隐藏
                    </button>
                  </>
                )}
                {post.status === "hidden" && (
                  <button
                    onClick={() => handleModerate(post.id, "restore")}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-medium hover:bg-green-100 disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    恢复
                  </button>
                )}
              </div>

              {/* Reject form */}
              {rejectId === post.id && (
                <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-xs font-medium text-red-700 mb-2">
                    驳回原因（用户将看到此原因）
                  </p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="请输入驳回原因..."
                    maxLength={200}
                    rows={2}
                    className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleReject(post.id)}
                      disabled={busy}
                      className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      确认驳回
                    </button>
                    <button
                      onClick={() => {
                        setRejectId(null);
                        setRejectReason("");
                      }}
                      className="px-4 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Total count */}
      {total > 0 && (
        <p className="text-center text-sm text-gray-500">
          共 {total} 条记录
        </p>
      )}
    </div>
  );
}


