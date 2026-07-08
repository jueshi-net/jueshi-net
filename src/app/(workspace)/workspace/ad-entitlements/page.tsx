import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Calendar, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { SectionCard, MetricCard } from "@/components/saas";
import { EmptyState } from "@/components/design-system";

export const metadata: Metadata = {
  title: "广告权益 — 绝世百宝箱",
  description: "管理你的广告权益，申请使用广告资源",
};

export default async function AdEntitlementsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/workspace/ad-entitlements");
  }

  const userId = session.user.id;

  // 查询用户的广告申请
  const [adApplications, user] = await Promise.allSettled([
    prisma.adApplication.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        memberUntil: true,
        role: true,
      },
    }),
  ]);

  const applications = adApplications.status === "fulfilled" ? adApplications.value : [];
  const userData = user.status === "fulfilled" ? user.value : null;

  const statusLabels: Record<string, string> = {
    PENDING: "待审核",
    APPROVED: "已通过",
    REJECTED: "已拒绝",
    USED: "已使用",
    EXPIRED: "已过期",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between gap-4 py-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-teal-600" />
            广告权益
          </h1>
          <p className="text-sm text-gray-500 mt-1">管理你的广告权益，申请使用广告资源</p>
        </div>
        <Link
          href="/workspace/invites"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          邀请好友获得权益
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="可用权益天数"
          value={0}
          icon={<Calendar className="w-5 h-5" />}
        />
        <MetricCard
          label="已使用天数"
          value={0}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <MetricCard
          label="申请记录"
          value={applications.length}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      {/* 权益说明 */}
      <SectionCard title="广告权益说明">
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">如何获得广告权益？</p>
              <p className="text-gray-600 mt-1">
                邀请好友注册可获得广告权益。每成功邀请一位好友，您将获得 <span className="font-bold text-teal-600">7 天广告权益</span>。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">广告权益有什么用？</p>
              <p className="text-gray-600 mt-1">
                广告权益可用于在平台展示您的广告，提升品牌曝光度。具体权益内容请联系管理员了解。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">申请流程</p>
              <p className="text-gray-600 mt-1">
                如果您有可用权益，可以点击"申请使用"按钮提交申请。管理员审核通过后，权益将自动生效。
              </p>
              <p className="text-xs text-gray-500 mt-1">
                申请功能即将开放，敬请期待。
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 申请入口 */}
      <SectionCard title="申请使用广告权益">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-700">
              您有 <span className="font-bold text-teal-600">0 天</span> 可用广告权益
            </p>
            <p className="text-xs text-gray-500 mt-1">
              邀请好友注册可获得广告权益，申请功能即将开放
            </p>
          </div>
          <button
            disabled
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
            title="申请功能即将开放"
          >
            申请功能即将开放
          </button>
        </div>
      </SectionCard>

      {/* 申请记录 */}
      <SectionCard
        title="申请记录"
        action={
          applications.length > 0 && (
            <span className="text-xs text-gray-500">最近 {applications.length} 条</span>
          )
        }
      >
        {applications.length === 0 ? (
          <EmptyState
            variant="no-data"
            title="暂无申请记录"
            description="您还没有提交过广告权益申请"
            icon={<Megaphone className="w-12 h-12" />}
          />
        ) : (
          <div className="space-y-3">
            {applications.map((app: any) => (
              <div
                key={app.id}
                className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      申请 {app.durationDays || 0} 天权益
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      app.status === "APPROVED" ? "bg-green-100 text-green-700" :
                      app.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                      app.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {statusLabels[app.status] || app.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(app.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                  {app.reason && (
                    <p className="text-xs text-gray-600 mt-1 truncate">{app.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
