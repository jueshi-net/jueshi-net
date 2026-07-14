"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye, Filter, Clock, CheckCircle, XCircle, Loader2, Shield } from "lucide-react";
import { track } from "@/lib/analytics";
import { WorkspacePageHeader } from "@/components/saas/WorkspacePageHeader";
import { SectionCard } from "@/components/saas/SectionCard";
import { StatusBadge } from "@/components/design-system/StatusBadge";
import { EmptyState } from "@/components/design-system/EmptyState";

interface Application {
  id: string;
  placementKey: string;
  description: string;
  materialUrl: string | null;
  materialType: string;
  status: string;
  reviewNote: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  reviewedAt: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "全部", icon: Filter },
  { value: "PENDING", label: "待审核", icon: Clock },
  { value: "APPROVED", label: "已批准", icon: CheckCircle },
  { value: "REJECTED", label: "已拒绝", icon: XCircle },
];

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'danger' | 'info' | 'neutral'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  ACTIVE: 'info',
  EXPIRED: 'neutral',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待审核",
  APPROVED: "已批准",
  REJECTED: "已拒绝",
  ACTIVE: "投放中",
  EXPIRED: "已过期",
};

export default function AdEntitlementsClient() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    const res = await fetch(`/api/admin/ad-entitlements?${params}`);
    if (res.ok) {
      const data = await res.json();
      setApplications(data.applications);
      setCounts(data.counts);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const openReview = (app: Application, action: "approve" | "reject") => {
    setSelectedApp(app);
    setReviewAction(action);
    setReviewNote("");
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedApp) return;
    setReviewingId(selectedApp.id);
    const res = await fetch(`/api/admin/ad-entitlements/${selectedApp.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: reviewAction, reviewNote }),
    });
    if (res.ok) {
      setShowReviewModal(false);
      fetchApplications();
      // Track admin review action
      track({
        eventType: reviewAction === "approve" ? "ad_entitlement_approve" : "ad_entitlement_reject",
        toolName: "ad-entitlements",
        action: reviewAction,
        path: "/admin/ad-entitlements",
        metadata: { applicationId: selectedApp.id },
      });
    } else {
      const data = await res.json();
      alert(data.error || "操作失败");
    }
    setReviewingId(null);
  };

  return (
    <div className="space-y-6">
      {/* 状态筛选 */}
      <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === opt.value
                  ? "bg-teal-600 text-white shadow-sm shadow-teal-200"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
              }`}
            >
              <opt.icon className="w-4 h-4" />
              {opt.label}
              {counts[opt.value] !== undefined && (
                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  statusFilter === opt.value ? "bg-white/20" : "bg-gray-100"
                }`}>
                  {counts[opt.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 申请列表 */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            加载中...
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            variant="no-data"
            title="暂无申请"
            description={`当前没有${statusFilter === "ALL" ? "" : STATUS_LABELS[statusFilter] + "的"}广告权益申请`}
            icon={<Clock className="w-12 h-12" />}
          />
        ) : (
          <SectionCard title="申请列表" subtitle={`共 ${applications.length} 条申请`}>
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="p-5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/30 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-gray-900">
                          {app.user.name || app.user.email}
                        </span>
                        <StatusBadge
                          label={STATUS_LABELS[app.status] || app.status}
                          variant={STATUS_VARIANT[app.status] || 'neutral'}
                          dot={app.status === 'PENDING'}
                          pulse={app.status === 'PENDING'}
                        />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>广告位: <span className="text-gray-700 font-medium">{app.placementKey}</span></span>
                        <span>素材类型: <span className="text-gray-700">{app.materialType}</span></span>
                        <span>提交时间: {new Date(app.createdAt).toLocaleString("zh-CN")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">申请说明</div>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100">{app.description}</p>
                  </div>

                  {app.materialUrl && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">素材</div>
                      {app.materialType === "image" ? (
                        <img src={app.materialUrl} alt="广告素材" className="max-h-32 rounded-lg border border-gray-200 shadow-sm" />
                      ) : (
                        <a href={app.materialUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:underline inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {app.materialUrl}
                        </a>
                      )}
                    </div>
                  )}

                  {app.startDate && (
                    <div className="text-xs text-gray-500 mb-4">
                      期望投放: {new Date(app.startDate).toLocaleDateString("zh-CN")}
                      {app.endDate && ` ~ ${new Date(app.endDate).toLocaleDateString("zh-CN")}`}
                    </div>
                  )}

                  {app.reviewNote && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">审核备注</div>
                      <p className="text-sm text-gray-600 italic bg-gray-50 rounded-lg p-2 border border-gray-100">{app.reviewNote}</p>
                    </div>
                  )}

                  {app.status === "PENDING" && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => openReview(app, "approve")}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                      >
                        <Check className="w-4 h-4" /> 批准
                      </button>
                      <button
                        onClick={() => openReview(app, "reject")}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                      >
                        <X className="w-4 h-4" /> 拒绝
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>

      {/* 审核弹窗 */}
      {showReviewModal && selectedApp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {reviewAction === "approve" ? "批准申请" : "拒绝申请"}
            </h3>
            <div className="mb-4 space-y-1">
              <div className="text-sm text-gray-600">申请人: <span className="font-medium text-gray-900">{selectedApp.user.name || selectedApp.user.email}</span></div>
              <div className="text-sm text-gray-600">广告位: <span className="font-medium text-gray-900">{selectedApp.placementKey}</span></div>
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-700 block mb-1.5 font-medium">审核备注（可选）</label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-colors"
                rows={3}
                placeholder="填写审核意见..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={submitReview}
                disabled={!!reviewingId}
                className={`px-4 py-2 text-sm text-white rounded-lg font-medium shadow-sm transition-colors ${
                  reviewAction === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-50`}
              >
                {reviewingId ? "处理中..." : reviewAction === "approve" ? "确认批准" : "确认拒绝"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
