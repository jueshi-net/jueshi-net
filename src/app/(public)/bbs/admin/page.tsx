import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle } from "@/lib/seo";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import BreadcrumbBar from "@/components/design-system/BreadcrumbBar";
import { ModerationQueue } from "@/components/bbs/moderation-queue";
import type { Metadata } from "next";
import { Shield, AlertTriangle, BarChart3, ScanSearch } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: buildTitle("审核管理 - 社区"),
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminModerationPage({ searchParams }: PageProps) {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  if (!isAdmin) {
    return (
      <JueshiV4PublicShell>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-[1200px] mx-auto px-4 py-2.5">
              <BreadcrumbBar
                items={[
                  { title: "首页", href: "/" },
                  { title: "社区论坛", href: "/bbs" },
                  { title: "审核管理", current: true },
                ]}
              />
            </div>
          </div>
          <div className="max-w-[1200px] mx-auto px-4 py-12">
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                需要管理员权限
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                此页面仅对管理员开放
              </p>
              <Link
                href="/bbs"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark"
              >
                返回论坛
              </Link>
            </div>
          </div>
        </div>
      </JueshiV4PublicShell>
    );
  }

  const params = await searchParams;
  const status = params.status || "pending";

  // Fetch pending posts
  const validStatuses = ["pending", "rejected", "hidden", "all"];
  const filterStatus = validStatuses.includes(status) ? status : "pending";
  const where =
    filterStatus === "all"
      ? { status: { in: ["pending", "rejected", "hidden"] } }
      : { status: filterStatus };

  const [posts, total, counts] = await Promise.all([
    prisma.forumPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, key: true, name: true } },
        moderationLogs: {
          where: { action: "reject" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { reason: true, createdAt: true, adminId: true },
        },
      },
    }),
    prisma.forumPost.count({ where }),
    prisma.forumPost.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  // Build status count map
  const statusCounts: Record<string, number> = {
    pending: 0,
    rejected: 0,
    hidden: 0,
    published: 0,
    deleted: 0,
  };
  for (const c of counts) {
    statusCounts[c.status] = c._count.id;
  }

  // Get admin names for rejection logs
  const adminIds = Array.from(
    new Set(
      posts
        .flatMap((p) => p.moderationLogs.map((m) => m.adminId))
        .filter(Boolean)
    )
  );
  const admins = adminIds.length
    ? await prisma.user.findMany({
        where: { id: { in: adminIds } },
        select: { id: true, name: true },
      })
    : [];
  const adminMap = new Map(admins.map((a) => [a.id, a]));

  const serializedPosts = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    content: p.content,
    excerpt: p.excerpt,
    status: p.status,
    isPinned: p.isPinned,
    isLocked: p.isLocked,
    isFeatured: p.isFeatured,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    category: p.category,
    author: {
      id: p.user.id,
      name: p.user.name,
      email: p.user.email,
    },
    rejectionReason: p.moderationLogs[0]?.reason || null,
    rejectedAt: p.moderationLogs[0]?.createdAt.toISOString() || null,
    rejectedBy: p.moderationLogs[0]
      ? adminMap.get(p.moderationLogs[0].adminId)?.name || "管理员"
      : null,
  }));

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1200px] mx-auto px-4 py-2.5">
            <BreadcrumbBar
              items={[
                { title: "首页", href: "/" },
                { title: "社区论坛", href: "/bbs" },
                { title: "审核管理", current: true },
              ]}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-brand" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                审核管理
              </h1>
            </div>
            <div className="flex gap-2">
              <Link
                href="/bbs/admin/content-quality"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                <ScanSearch className="w-4 h-4" />
                <span className="hidden sm:inline">内容质量巡检</span>
              </Link>
              <Link
                href="/bbs/operations"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">运营面板</span>
              </Link>
            </div>
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-0.5">待审核</div>
              <div className="text-2xl font-bold text-amber-600">{statusCounts.pending || 0}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-0.5">已驳回</div>
              <div className="text-2xl font-bold text-red-600">{statusCounts.rejected || 0}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-0.5">已隐藏</div>
              <div className="text-2xl font-bold text-gray-600">{statusCounts.hidden || 0}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-0.5">已发布</div>
              <div className="text-2xl font-bold text-green-600">{statusCounts.published || 0}</div>
            </div>
          </div>

          <ModerationQueue
            initialPosts={serializedPosts}
            initialTotal={total}
            statusCounts={statusCounts}
            currentStatus={filterStatus}
            isAdmin={true}
          />
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
