/**
 * /workspace/provider - Service provider workspace.
 * Uses existing Workspace layout (auth, sidebar, topbar).
 * Only owner and authorized members can edit.
 */
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/platform";
import { WorkspaceProviderClient } from "@/modules/service-provider/ui/workspace-provider-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "服务商中心 - 工作台", robots: { index: false, follow: false } };

export default async function WorkspaceProviderPage() {
  if (!isFeatureEnabled("FEATURE_SERVICE_PROVIDER")) {
    redirect("/workspace");
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/workspace/provider");
  }

  const userId = session.user.id;

  // Find provider where user is a member
  const membership = await prisma.providerMember.findFirst({
    where: { userId, status: "active" },
    include: {
      provider: {
        include: {
          services: { orderBy: { sortOrder: "asc" } },
          members: true,
          _count: { select: { inquiries: true, favorites: true } },
        },
      },
    },
  });

  if (!membership?.provider) {
    // No provider yet - show create form
    return (
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-bold text-gray-900">服务商中心</h1>
          <p className="mt-1 text-sm text-gray-500">您还没有创建服务商档案</p>
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 text-center">
            <p className="text-sm text-gray-500">创建您的服务商档案，开始为海外华人、留学生和跨境电商提供专业服务</p>
            <Link
              href="/api/service-providers"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              创建服务商档案
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const provider = membership.provider;
  const userRole = membership.role;

  // Get recent inquiries
  const recentInquiries = await prisma.providerInquiry.findMany({
    where: { providerId: provider.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Profile completeness
  const completenessFields = [
    { label: "头像/Logo", filled: !!provider.avatarUrl },
    { label: "简介", filled: !!provider.description },
    { label: "服务地区", filled: provider.countries.length > 0 },
    { label: "服务语言", filled: provider.languages.length > 0 },
    { label: "服务项目", filled: provider.services.length > 0 },
  ];
  const filledCount = completenessFields.filter((f) => f.filled).length;
  const completenessPct = Math.round((filledCount / completenessFields.length) * 100);

  // Pending inquiries count
  const pendingInquiriesCount = recentInquiries.filter((i) => i.status === "pending").length;

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

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">服务商中心</h1>
            <p className="mt-0.5 text-sm text-gray-500">{provider.displayName}</p>
          </div>
          <span className={`rounded-lg px-3 py-1 text-sm font-medium ${STATUS_COLORS[provider.status] ?? "bg-gray-100 text-gray-600"}`}>
            {STATUS_LABELS[provider.status] ?? provider.status}
          </span>
        </div>

        {/* Stats Overview */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-xs text-gray-400">认证状态</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {provider.verificationStatus === "verified" ? "✓ 已认证" : "未认证"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-xs text-gray-400">服务数量</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{provider.services.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-xs text-gray-400">待处理咨询</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{pendingInquiriesCount}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-xs text-gray-400">收藏数</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{(provider as any)._count?.favorites ?? 0}</p>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">档案完整度</h3>
            <span className="text-sm font-medium text-blue-600">{completenessPct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${completenessPct}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {completenessFields.map((f) => (
              <span key={f.label} className={`rounded px-2 py-0.5 text-xs ${f.filled ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
                {f.filled ? "✓" : "○"} {f.label}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        {(userRole === "OWNER" || userRole === "ADMIN" || userRole === "EDITOR") && (
          <div className="mb-4 flex flex-wrap gap-2">
            {provider.status === "draft" && (
              <button
                onClick={() => fetch(`/api/service-providers/${provider.id}/submit`, { method: "POST" }).then(() => window.location.reload())}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                提交审核
              </button>
            )}
            {provider.status === "rejected" && (
              <button
                onClick={() => fetch(`/api/service-providers/${provider.id}/submit`, { method: "POST" }).then(() => window.location.reload())}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                重新提交审核
              </button>
            )}
            <Link
              href={`/business/${provider.slug}`}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              查看公开预览
            </Link>
          </div>
        )}

        {/* Rejection reason */}
        {provider.status === "rejected" && provider.rejectionReason && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <h3 className="text-sm font-semibold text-red-700">审核驳回原因</h3>
            <p className="mt-1 text-sm text-red-600">{provider.rejectionReason}</p>
          </div>
        )}

        <WorkspaceProviderClient
          provider={{
            id: provider.id,
            displayName: provider.displayName,
            status: provider.status,
            verificationStatus: provider.verificationStatus,
            slug: provider.slug,
          }}
          services={provider.services.map((s) => ({
            id: s.id,
            title: s.title,
            status: s.status,
            sortOrder: s.sortOrder,
            priceMode: s.priceMode,
          }))}
          inquiries={recentInquiries.map((i) => ({
            id: i.id,
            status: i.status,
            message: i.message,
            createdAt: i.createdAt.toISOString(),
          }))}
          members={provider.members.map((m) => ({
            id: m.id,
            userId: m.userId,
            role: m.role,
            status: m.status,
          }))}
          userRole={userRole}
        />
      </div>
    </div>
  );
}
