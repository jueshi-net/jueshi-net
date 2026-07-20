/**
 * /admin/service-providers/[id] - Provider detail for admin review.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/platform";
import { AdminProviderClient } from "@/modules/service-provider/ui/admin-provider-client";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  pending_review: "审核中",
  approved: "已通过",
  rejected: "已驳回",
  suspended: "已暂停",
};

export default async function AdminProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isFeatureEnabled("FEATURE_SERVICE_PROVIDER")) notFound();

  const { id } = await params;
  const provider = await prisma.serviceProvider.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true, email: true, image: true } },
      services: { orderBy: { sortOrder: "asc" } },
      members: true,
      verifications: true,
      reports: { orderBy: { createdAt: "desc" }, take: 10 },
      _count: { select: { inquiries: true, favorites: true } },
    },
  });

  if (!provider) notFound();

  // Check for audit logs
  const auditLogs = await prisma.auditLog.findMany({
    where: { OR: [{ action: { contains: "provider" } }, { action: { contains: "Provider" } }] },
    orderBy: { createdAt: "desc" },
    take: 10,
  }).catch(() => []);

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-3 flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/admin/service-providers" className="hover:text-gray-600">服务商管理</Link>
          <span>/</span>
          <span className="text-gray-600">{provider.displayName}</span>
        </nav>

        {/* Header */}
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">{provider.displayName}</h1>
              <p className="mt-0.5 text-sm text-gray-500">Slug: {provider.slug}</p>
              <div className="mt-1 flex gap-2">
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {provider.providerType === "PROFESSIONAL" ? "专业人员" : provider.providerType === "OFFICIAL" ? "官方" : "企业"}
                </span>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {STATUS_LABELS[provider.status] ?? provider.status}
                </span>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {provider.verificationStatus === "verified" ? "✓ 已认证" : "未认证"}
                </span>
              </div>
            </div>
            <AdminProviderClient
              providerId={provider.id}
              status={provider.status}
              displayName={provider.displayName}
            />
          </div>

          {/* Rejection reason */}
          {provider.rejectionReason && (
            <div className="mt-3 rounded-lg bg-red-50 p-3">
              <p className="text-xs font-medium text-red-600">驳回原因</p>
              <p className="mt-1 text-sm text-red-700">{provider.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Provider info */}
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">服务商信息</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-gray-400">所有者</dt>
              <dd className="text-gray-700">{provider.owner?.name ?? "—"} ({provider.owner?.email ?? "—"})</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">创建时间</dt>
              <dd className="text-gray-700">{new Date(provider.createdAt).toLocaleString("zh-CN")}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">提交时间</dt>
              <dd className="text-gray-700">{provider.submittedAt ? new Date(provider.submittedAt).toLocaleString("zh-CN") : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">通过时间</dt>
              <dd className="text-gray-700">{provider.approvedAt ? new Date(provider.approvedAt).toLocaleString("zh-CN") : "—"}</dd>
            </div>
          </dl>

          {provider.description && (
            <div className="mt-3">
              <dt className="text-xs text-gray-400">简介</dt>
              <dd className="mt-1 text-sm text-gray-600">{provider.description}</dd>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {provider.countries.map((c) => <span key={c} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{c}</span>)}
            {provider.cities.map((c) => <span key={c} className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-500">{c}</span>)}
            {provider.languages.map((l) => <span key={l} className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{l}</span>)}
          </div>
        </div>

        {/* Services */}
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">服务项目 ({provider.services.length})</h2>
          <div className="space-y-2">
            {provider.services.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-2">
                <span className="text-sm text-gray-700">{s.title}</span>
                <span className="text-xs text-gray-400">{s.status} · {s.priceMode}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verifications */}
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">认证记录 ({provider.verifications.length})</h2>
          {provider.verifications.length === 0 ? (
            <p className="text-sm text-gray-400">暂无认证记录</p>
          ) : (
            <div className="space-y-2">
              {provider.verifications.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-2">
                  <span className="text-sm text-gray-700">{v.verificationType}</span>
                  <span className="text-xs text-gray-400">{v.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reports */}
        {provider.reports.length > 0 && (
          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">举报 ({provider.reports.length})</h2>
            <div className="space-y-2">
              {provider.reports.map((r) => (
                <div key={r.id} className="rounded-lg border border-gray-100 p-2">
                  <p className="text-sm text-gray-600">{r.reason}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{new Date(r.createdAt).toLocaleString("zh-CN")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Log */}
        {auditLogs.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">审计记录</h2>
            <div className="space-y-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{log.action}</span>
                  <span className="text-gray-400">{new Date(log.createdAt).toLocaleString("zh-CN")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
