/**
 * ProviderTrustCard - Public trust indicators for a provider.
 * Shows verification status, claimed date, approved date, service count.
 * NEVER shows fake ratings or review scores (ProviderReview deferred).
 */
import type { TrustCardDTO } from "@/modules/service-provider/public";

const VERIFICATION_LABELS: Record<string, string> = {
  identity: "身份认证",
  company: "企业认证",
  professional: "专业资质认证",
  platform: "平台人工认证",
};

const VERIFICATION_ICONS: Record<string, string> = {
  identity: "🪪",
  company: "🏢",
  professional: "📜",
  platform: "✓",
};

export function ProviderTrustCard({ trust }: { trust: TrustCardDTO }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 sm:text-base">信任信息</h3>

      {/* Verification Status */}
      <div className="flex items-center gap-2">
        {trust.isVerified ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            已通过平台认证
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-500">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            暂未完成平台认证
          </span>
        )}
      </div>

      {/* Verification Details */}
      {trust.verifications.length > 0 && (
        <div className="mt-3 space-y-2">
          {trust.verifications.map((v) => (
            <div key={v.id} className="flex items-center gap-2 text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs">
                {VERIFICATION_ICONS[v.verificationType] ?? "✓"}
              </span>
              <span className="text-gray-700">{VERIFICATION_LABELS[v.verificationType] ?? v.verificationType}</span>
              {v.verifiedAt && (
                <span className="text-xs text-gray-400">
                  {new Date(v.verifiedAt).toLocaleDateString("zh-CN")}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Trust Facts */}
      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-3">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{trust.serviceCount > 0 ? trust.serviceCount : "—"}</div>
          <div className="text-xs text-gray-400">服务项目</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {trust.claimedAt ? new Date(trust.claimedAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" }) : "—"}
          </div>
          <div className="text-xs text-gray-400">认领时间</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {trust.approvedAt ? new Date(trust.approvedAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" }) : "—"}
          </div>
          <div className="text-xs text-gray-400">通过审核</div>
        </div>
      </div>
    </div>
  );
}
