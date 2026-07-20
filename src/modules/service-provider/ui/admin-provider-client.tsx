"use client";

import { useState } from "react";

interface AdminProviderClientProps {
  providerId: string;
  status: string;
  displayName: string;
  compact?: boolean;
}

export function AdminProviderClient({ providerId, status, displayName, compact }: AdminProviderClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showSuspend, setShowSuspend] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  async function doAction(action: string, body?: Record<string, unknown>) {
    setLoading(action);
    setError("");
    try {
      const res = await fetch(`/api/admin/service-providers/${providerId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "操作失败");
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
      setLoading(null);
    }
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {error && <span className="text-xs text-red-500">{error}</span>}
        {status === "pending_review" && (
          <>
            <button
              onClick={() => doAction("approve")}
              disabled={loading !== null}
              className="rounded bg-green-50 px-2 py-0.5 text-xs text-green-600 hover:bg-green-100"
            >
              批准
            </button>
            <button
              onClick={() => setShowReject(true)}
              disabled={loading !== null}
              className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-600 hover:bg-red-100"
            >
              驳回
            </button>
          </>
        )}
        {status === "approved" && (
          <button
            onClick={() => setShowSuspend(true)}
            disabled={loading !== null}
            className="rounded bg-orange-50 px-2 py-0.5 text-xs text-orange-600 hover:bg-orange-100"
          >
            暂停
          </button>
        )}
        {showReject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowReject(false)}>
            <div className="w-full max-w-md rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-2 text-sm font-semibold">驳回：{displayName}</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请填写驳回原因..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <div className="mt-3 flex gap-2">
                <button onClick={() => setShowReject(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm">取消</button>
                <button
                  onClick={() => doAction("reject", { reason: rejectReason })}
                  disabled={!rejectReason.trim() || loading !== null}
                  className="flex-1 rounded-lg bg-red-600 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  确认驳回
                </button>
              </div>
            </div>
          </div>
        )}
        {showSuspend && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowSuspend(false)}>
            <div className="w-full max-w-md rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-2 text-sm font-semibold">暂停：{displayName}</h3>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="请填写暂停原因..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <div className="mt-3 flex gap-2">
                <button onClick={() => setShowSuspend(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm">取消</button>
                <button
                  onClick={() => doAction("suspend", { reason: suspendReason })}
                  disabled={!suspendReason.trim() || loading !== null}
                  className="flex-1 rounded-lg bg-orange-600 py-2 text-sm text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  确认暂停
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full mode (for detail page)
  return (
    <div className="flex flex-wrap gap-2">
      {error && <span className="w-full text-sm text-red-500">{error}</span>}
      {status === "pending_review" && (
        <>
          <button
            onClick={() => doAction("approve")}
            disabled={loading !== null}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            批准
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={loading !== null}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            驳回
          </button>
        </>
      )}
      {status === "approved" && (
        <button
          onClick={() => setShowSuspend(true)}
          disabled={loading !== null}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          暂停展示
        </button>
      )}
      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowReject(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-sm font-semibold">驳回：{displayName}</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="请填写驳回原因..." rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <div className="mt-3 flex gap-2">
              <button onClick={() => setShowReject(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm">取消</button>
              <button onClick={() => doAction("reject", { reason: rejectReason })} disabled={!rejectReason.trim() || loading !== null} className="flex-1 rounded-lg bg-red-600 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50">确认驳回</button>
            </div>
          </div>
        </div>
      )}
      {showSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowSuspend(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-sm font-semibold">暂停：{displayName}</h3>
            <textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder="请填写暂停原因..." rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <div className="mt-3 flex gap-2">
              <button onClick={() => setShowSuspend(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm">取消</button>
              <button onClick={() => doAction("suspend", { reason: suspendReason })} disabled={!suspendReason.trim() || loading !== null} className="flex-1 rounded-lg bg-orange-600 py-2 text-sm text-white hover:bg-orange-700 disabled:opacity-50">确认暂停</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
