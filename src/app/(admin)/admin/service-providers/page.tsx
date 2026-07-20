/**
 * /admin/service-providers - Admin management for service providers.
 * Layout handles admin auth check. Uses application services via API.
 */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/platform";
import { AdminProviderClient } from "@/modules/service-provider/ui/admin-provider-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "服务商管理 - 后台", robots: { index: false, follow: false } };

const STATUS_TABS = [
  { value: "all", label: "全部" },
  { value: "pending_review", label: "待审核" },
  { value: "approved", label: "已通过" },
  { value: "rejected", label: "已驳回" },
  { value: "suspended", label: "已暂停" },
  { value: "draft", label: "草稿" },
];

export default async function AdminServiceProvidersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (!isFeatureEnabled("FEATURE_SERVICE_PROVIDER")) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-400">服务商模块未启用</p>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const statusFilter = params.status ?? "all";
  const q = params.q;

  const where: Record<string, unknown> = {};
  if (statusFilter !== "all") where.status = statusFilter;
  if (q) {
    where.OR = [
      { displayName: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  const [providers, stats] = await Promise.all([
    prisma.serviceProvider.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        owner: { select: { name: true, email: true, image: true } },
        _count: { select: { services: true, inquiries: true, reports: true } },
      },
    }),
    prisma.serviceProvider.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const statusCounts: Record<string, number> = {};
  stats.forEach((s) => { statusCounts[s.status] = s._count; });

  const STATUS_LABELS: Record<string, string> = {
    draft: "草稿",
    pending_review: "审核中",
    approved: "已通过",
    rejected: "已驳回",
    suspended: "已暂停",
  };

  const STATUS_COLORS: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    pending_review: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    suspended: "bg-orange-100 text-orange-700",
  };

  const serializedProviders = providers.map((p) => ({
    id: p.id,
    displayName: p.displayName,
    slug: p.slug,
    providerType: p.providerType,
    status: p.status,
    verificationStatus: p.verificationStatus,
    createdAt: p.createdAt.toISOString(),
    ownerName: p.owner?.name ?? "—",
    ownerEmail: p.owner?.email ?? "—",
    serviceCount: (p as any)._count?.services ?? 0,
    inquiryCount: (p as any)._count?.inquiries ?? 0,
    reportCount: (p as any)._count?.reports ?? 0,
    rejectionReason: p.rejectionReason,
  }));

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">服务商管理</h1>
          <p className="mt-0.5 text-sm text-gray-500">管理服务商入驻审核、认证和举报</p>
        </div>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/service-providers${tab.value !== "all" ? `?status=${tab.value}` : ""}`}
              className={`rounded-xl border p-3 ${statusFilter === tab.value ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"}`}
            >
              <p className="text-xs text-gray-400">{tab.label}</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {tab.value === "all"
                  ? Object.values(statusCounts).reduce((a, b) => a + b, 0)
                  : statusCounts[tab.value] ?? 0}
              </p>
            </Link>
          ))}
        </div>

        {/* Search + Table */}
        <div className="rounded-xl border border-gray-200 bg-white">
          {/* Search */}
          <div className="border-b border-gray-200 p-3">
            <form method="GET" action="/admin/service-providers" className="flex gap-2">
              {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
              <input
                type="text"
                name="q"
                defaultValue={q ?? ""}
                placeholder="搜索服务商名称或 slug..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button type="submit" className="rounded-lg bg-gray-100 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-200">
                搜索
              </button>
            </form>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-400">
                  <th className="px-4 py-2 font-medium">服务商</th>
                  <th className="px-4 py-2 font-medium">类型</th>
                  <th className="px-4 py-2 font-medium">状态</th>
                  <th className="px-4 py-2 font-medium">认证</th>
                  <th className="px-4 py-2 font-medium">服务</th>
                  <th className="px-4 py-2 font-medium">咨询</th>
                  <th className="px-4 py-2 font-medium">举报</th>
                  <th className="px-4 py-2 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {serializedProviders.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <Link href={`/admin/service-providers/${p.id}`} className="font-medium text-blue-600 hover:underline">
                        {p.displayName}
                      </Link>
                      <p className="text-xs text-gray-400">{p.slug}</p>
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {p.providerType === "PROFESSIONAL" ? "专业人员" : p.providerType === "OFFICIAL" ? "官方" : "企业"}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`rounded px-1.5 py-0.5 text-xs ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {p.verificationStatus === "verified" ? "✓ 已认证" : "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{p.serviceCount}</td>
                    <td className="px-4 py-2 text-gray-600">{p.inquiryCount}</td>
                    <td className="px-4 py-2 text-gray-600">{p.reportCount}</td>
                    <td className="px-4 py-2">
                      <AdminProviderClient
                        providerId={p.id}
                        status={p.status}
                        displayName={p.displayName}
                        compact
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-gray-100 md:hidden">
            {serializedProviders.map((p) => (
              <div key={p.id} className="p-3">
                <div className="flex items-center justify-between">
                  <Link href={`/admin/service-providers/${p.id}`} className="font-medium text-blue-600">
                    {p.displayName}
                  </Link>
                  <span className={`rounded px-1.5 py-0.5 text-xs ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[p.status] ?? p.status}
                  </span>
                </div>
                <div className="mt-1 flex gap-3 text-xs text-gray-400">
                  <span>服务 {p.serviceCount}</span>
                  <span>咨询 {p.inquiryCount}</span>
                  <span>举报 {p.reportCount}</span>
                </div>
                <div className="mt-2">
                  <AdminProviderClient
                    providerId={p.id}
                    status={p.status}
                    displayName={p.displayName}
                    compact
                  />
                </div>
              </div>
            ))}
          </div>

          {serializedProviders.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">暂无数据</div>
          )}
        </div>
      </div>
    </div>
  );
}
