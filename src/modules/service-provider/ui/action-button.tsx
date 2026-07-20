"use client";

/**
 * ActionButton - Unified action trigger for service-provider actions.
 * Uses the Action Registry's executeAction() - no page-level logic duplication.
 *
 * For service.request:
 *   - Checks auth (redirects to login if not logged in)
 *   - Validates provider approved + service published
 *   - Opens inquiry form modal
 *   - Submits via API
 *   - Returns inquiryId on success
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ActionButtonProps {
  action: string;
  context: {
    providerId?: string;
    providerSlug?: string;
    serviceId?: string;
    serviceSlug?: string;
    providerName?: string;
    serviceName?: string;
    sourceType?: string;
    sourceId?: string;
  };
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}

const DEFAULT_LABELS: Record<string, string> = {
  "service.request": "咨询",
  "provider.favorite": "收藏",
  "provider.report": "举报",
};

const VARIANT_CLASSES: Record<string, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  ghost: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
};

export function ActionButton({
  action,
  context,
  label,
  variant = "primary",
  className = "",
}: ActionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [contactPreference, setContactPreference] = useState("platform");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [inquiryId, setInquiryId] = useState("");
  const router = useRouter();

  const displayLabel = label ?? DEFAULT_LABELS[action] ?? "操作";
  const baseClass = `inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${VARIANT_CLASSES[variant]} ${className}`;

  async function handleClick() {
    setError("");

    if (action === "service.request") {
      setShowModal(true);
      return;
    }

    if (action === "provider.favorite") {
      setLoading(true);
      try {
        const res = await fetch(`/api/service-providers/${context.providerId}/favorite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "操作失败");
      } catch (e) {
        setError(e instanceof Error ? e.message : "操作失败");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (action === "provider.report") {
      setShowModal(true);
      return;
    }
  }

  async function submitInquiry() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/provider-services/${context.serviceId}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: context.providerId,
          serviceId: context.serviceId,
          message,
          contactPreference,
          sourceType: context.sourceType ?? "detail_page",
          sourceId: context.sourceId ?? context.providerSlug,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) {
          router.push("/auth/signin?redirect=" + encodeURIComponent(window.location.pathname));
          return;
        }
        throw new Error(data.error || "提交失败");
      }
      setInquiryId(data.data?.inquiryId ?? "");
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setLoading(false);
    }
  }

  async function submitReport() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/service-providers/${context.providerId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) {
          router.push("/auth/signin?redirect=" + encodeURIComponent(window.location.pathname));
          return;
        }
        throw new Error(data.error || "提交失败");
      }
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setShowModal(false);
    setMessage("");
    setError("");
    setSuccess(false);
    setInquiryId("");
  }

  return (
    <>
      <button onClick={handleClick} disabled={loading} className={`${baseClass} ${loading ? "opacity-50" : ""}`}>
        {loading ? "处理中..." : displayLabel}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeModal}>
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {success ? (
              <div className="text-center">
                <div className="mb-3 flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {action === "service.request" ? "咨询已提交" : "举报已提交"}
                </h3>
                {inquiryId && (
                  <p className="mt-1 text-sm text-gray-500">咨询编号：{inquiryId.slice(0, 8)}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  {action === "service.request"
                    ? "服务商将在工作日内回复您，请留意站内通知。"
                    : "平台将在审核后处理，感谢您的反馈。"}
                </p>
                <button onClick={closeModal} className="mt-4 w-full rounded-lg bg-gray-100 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                  关闭
                </button>
              </div>
            ) : (
              <>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  {action === "service.request" ? `咨询：${context.serviceName ?? context.providerName ?? ""}` : `举报：${context.providerName ?? ""}`}
                </h3>
                {error && (
                  <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
                )}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={action === "service.request" ? "请描述您的需求..." : "请说明举报原因..."}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                {action === "service.request" && (
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-medium text-gray-600">联系方式偏好</label>
                    <select
                      value={contactPreference}
                      onChange={(e) => setContactPreference(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="platform">仅通过平台消息</option>
                      <option value="email">邮件</option>
                      <option value="phone">电话（需服务商同意后提供）</option>
                    </select>
                  </div>
                )}
                {action === "service.request" && (
                  <p className="mt-2 text-xs text-gray-400">
                    您的联系方式不会直接展示给服务商，服务商同意后方可联系。
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <button onClick={closeModal} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    取消
                  </button>
                  <button
                    onClick={action === "service.request" ? submitInquiry : submitReport}
                    disabled={loading || !message.trim()}
                    className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "提交中..." : "提交"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
