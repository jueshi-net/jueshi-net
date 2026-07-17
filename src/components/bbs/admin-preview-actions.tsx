"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle,
  XCircle,
  Ban,
  RotateCcw,
  Pin,
  Star,
  Lock,
  Unlock,
  AlertCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface AdminPreviewActionsProps {
  postId: string;
  postTitle: string;
  postStatus: string;
}

export function AdminPreviewActions({
  postId,
  postTitle,
  postStatus,
}: AdminPreviewActionsProps) {
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, startTransition] = useTransition();

  function flash(msg: string) {
    setMessage(msg);
    window.setTimeout(() => setMessage(""), 4000);
  }

  async function handleAction(
    action: "approve" | "reject" | "hide" | "restore" | "pin" | "unpin" | "feature" | "unfeature" | "lock" | "unlock",
    reason?: string
  ) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/forum/admin/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, action, reason }),
        });
        const data = await res.json();
        if (res.ok) {
          flash(
            action === "approve"
              ? "已通过审核"
              : action === "reject"
              ? "已驳回"
              : "操作成功"
          );
          setShowReject(false);
          setRejectReason("");
        } else {
          flash(data.error || "操作失败");
        }
      } catch {
        flash("网络错误");
      }
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      {/* Flash message */}
      {message && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 mr-2">
          审核操作：
        </span>

        {/* Approve */}
        {postStatus !== "published" && (
          <button
            onClick={() => handleAction("approve")}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium hover:bg-green-100 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            通过审核
          </button>
        )}

        {/* Reject */}
        {postStatus !== "rejected" && (
          <button
            onClick={() => setShowReject((v) => !v)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium hover:bg-red-100 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            驳回
          </button>
        )}

        {/* Hide */}
        {postStatus === "published" && (
          <button
            onClick={() => handleAction("hide")}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium hover:bg-orange-100 disabled:opacity-50"
          >
            <Ban className="w-4 h-4" />
            隐藏
          </button>
        )}

        {/* Restore */}
        {postStatus === "hidden" && (
          <button
            onClick={() => handleAction("restore")}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium hover:bg-green-100 disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            恢复
          </button>
        )}

        {/* View public page */}
        {postStatus === "published" && (
          <Link
            href={`/bbs/${postId}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-100"
          >
            <Eye className="w-4 h-4" />
            查看公开页
          </Link>
        )}
      </div>

      {/* Reject form */}
      {showReject && (
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
              onClick={() => {
                if (!rejectReason.trim() || rejectReason.trim().length < 2) {
                  flash("驳回原因至少 2 个字符");
                  return;
                }
                handleAction("reject", rejectReason.trim());
              }}
              disabled={busy}
              className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              确认驳回
            </button>
            <button
              onClick={() => {
                setShowReject(false);
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
  );
}
