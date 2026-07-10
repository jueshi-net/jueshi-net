"use client";
import Link from "next/link";
import {
  Users, FileText, ExternalLink, ArrowUpRight,
  Bell, TrendingUp, CheckCircle,
  Activity, Award, ChevronRight, Clock, BarChart3, Shield,
  Star, Database, Settings, HeartPulse, AlertCircle, FolderOpen,
} from "lucide-react";
import type { AdminStatsData } from "@/lib/admin-stats";
import { WorkspacePageHeader } from "@/components/saas/WorkspacePageHeader";
import { SectionCard } from "@/components/saas/SectionCard";
import { MetricCard } from "@/components/saas/MetricCard";
import { StatusBadge } from "@/components/design-system/StatusBadge";
import { CompactTable } from "@/components/saas/CompactTable";
import { EmptyState } from "@/components/design-system/EmptyState";

const LEVEL_NAMES: Record<string, string> = {
  lv1: "Lv.1 新手", lv2: "Lv.2 进阶", lv3: "Lv.3 精英",
  lv4: "Lv.4 大师", lv5: "Lv.5 传奇",
};

const GROWTH_TYPE_LABELS: Record<string, string> = {
  daily_checkin: "签到", dashboard_visit: "工作台",
  review_approved: "点评通过", forum_post_approved: "帖子通过",
  forum_comment_approved: "评论通过", admin_adjust: "后台调整",
};

export default function AdminDashboardClient({ stats }: { stats: AdminStatsData | null }) {
  const s = stats;

  // Calculate total pending
  const totalPending = s ? (s.pending.reviews + s.pending.draftTopics) : 0;

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <WorkspacePageHeader
        title="运营总控台"
        subtitle="查看用户增长、内容审核、通知与社区运营状态"
        icon={<Shield className="w-5 h-5" />}
        actions={
          <Link href="/" className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors min-h-[44px]">
            <ExternalLink className="w-4 h-4" /> 查看前台
          </Link>
        }
      />

      {/* ===== 1. 今日待处理 ===== */}
      {s ? (
        <SectionCard
          title="今日待处理"
          action={
            totalPending > 0 ? (
              <StatusBadge label={`${totalPending} 项`} variant="warning" dot pulse />
            ) : (
              <StatusBadge label="全部已处理" variant="success" dot />
            )
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <PendingCard label="待审核点评" count={s.pending.reviews} href="/admin/tool-reviews" icon={Star} variant="warning" />
            <PendingCard label="草稿专题" count={s.pending.draftTopics} href="/admin/topics" icon={FileText} variant="neutral" />
            <PendingCard label="未读通知" count={s.pending.unreadNotifications} href="/admin/notifications" icon={Bell} variant="info" />
          </div>
        </SectionCard>
      ) : (
        <EmptyState
          variant="error"
          title="运营数据加载失败"
          description="模块卡片仍可用，数据加载异常不影响基础功能"
          icon={<AlertCircle className="w-12 h-12" />}
        />
      )}

      {/* ===== 2. 核心数据概览 ===== */}
      {s && (
        <SectionCard
          title="核心数据概览"
          action={<BarChart3 className="w-5 h-5 text-blue-500" />}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            <MetricCard label="用户总数" value={s.overview.usersTotal} icon={<Users className="w-5 h-5" />} />
            <MetricCard label="已发布专题" value={s.overview.topicsPublished} icon={<FileText className="w-5 h-5" />} />
            <MetricCard label="已通过点评" value={s.overview.reviewsApproved} icon={<CheckCircle className="w-5 h-5" />} />
            <MetricCard label="成长日志" value={s.overview.growthLogsTotal} icon={<Activity className="w-5 h-5" />} />
            <MetricCard label="通知总数" value={s.overview.notificationsTotal} icon={<Bell className="w-5 h-5" />} />
            <MetricCard label="短评总数" value={s.content.reviews.total} icon={<Star className="w-5 h-5" />} />
            <MetricCard label="生成单据" value={s.documents.total} icon={<FileText className="w-5 h-5" />} />
          </div>
        </SectionCard>
      )}

      {/* ===== 3. 用户成长系统 ===== */}
      {s && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Level distribution */}
          <SectionCard title="等级分布" action={<Award className="w-5 h-5 text-amber-500" />}>
            <div className="space-y-3">
              {["lv1", "lv2", "lv3", "lv4", "lv5"].map((lv) => (
                <div key={lv} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{LEVEL_NAMES[lv] || lv}</span>
                  <span className="font-bold text-gray-900">{s.growth.usersByLevel[lv] || 0} 人</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Recent growth logs */}
          <SectionCard title="最近成长记录" action={<Activity className="w-5 h-5 text-teal-500" />} className="lg:col-span-2">
            {s.growth.recentLogs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">暂无成长记录</p>
            ) : (
              <div className="space-y-1.5">
                {s.growth.recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`font-bold ${log.value > 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {log.value > 0 ? "+" : ""}{log.value}
                      </span>
                      <span className="text-gray-500 truncate">{GROWTH_TYPE_LABELS[log.type] || log.type}</span>
                      <span className="text-gray-400 truncate hidden sm:inline">{log.userEmail}</span>
                    </div>
                    <span className="text-gray-400 shrink-0 ml-2">
                      {new Date(log.createdAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* ===== 4. 内容运营 ===== */}
      {s && (
        <SectionCard
          title="内容运营"
          action={<FolderOpen className="w-5 h-5 text-purple-500" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ContentCard title="专题" total={s.content.topics.published + s.content.topics.draft + s.content.topics.archived} href="/admin/topics" items={[
              { label: "已发布", value: s.content.topics.published, variant: "success" as const },
              { label: "草稿", value: s.content.topics.draft, variant: "neutral" as const },
              { label: "已归档", value: s.content.topics.archived, variant: "neutral" as const },
            ]} />
            <ContentCard title="点评" total={s.content.reviews.total} href="/admin/tool-reviews" items={[
              { label: "待审", value: s.content.reviews.pending, variant: "warning" as const },
              { label: "已通过", value: s.content.reviews.approved, variant: "success" as const },
              { label: "已拒绝", value: s.content.reviews.rejected, variant: "danger" as const },
              { label: "已隐藏", value: s.content.reviews.hidden, variant: "neutral" as const },
            ]} />
            <ContentCard title="通知" total={s.content.notifications.total} href="/admin/notifications" items={[
              { label: "未读", value: s.content.notifications.unread, variant: "info" as const },
              { label: "已读", value: s.content.notifications.read, variant: "neutral" as const },
            ]} />
          </div>
        </SectionCard>
      )}

      {/* ===== 5. 单据生成流水 ===== */}
      {s && (
        <SectionCard
          title="单据生成流水"
          subtitle={`最近 ${s.documents.recent.length} 条`}
          action={<FileText className="w-5 h-5 text-rose-500" />}
        >
          <CompactTable
            columns={[
              { key: "documentType", header: "单据类型", render: (doc: any) => <span className="font-medium text-gray-700">{doc.documentType}</span> },
              { key: "documentNo", header: "单据号", render: (doc: any) => <span className="font-mono text-gray-500">{doc.documentNo || "—"}</span> },
              { key: "userEmail", header: "用户", render: (doc: any) => <span className="text-gray-500 truncate max-w-[180px] block">{doc.userEmail}</span> },
              { key: "createdAt", header: "生成时间", render: (doc: any) => <span className="text-gray-400">{new Date(doc.createdAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</span> },
            ]}
            data={s.documents.recent}
            rowKey={(doc: any) => doc.id}
            emptyText="暂无单据记录"
            density="compact"
          />
        </SectionCard>
      )}

      {/* ===== 6. 快捷操作区 ===== */}
      <SectionCard
        title="快捷操作"
        action={<Settings className="w-5 h-5 text-slate-500" />}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.label} href={a.href} className="group bg-gray-50 rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 hover:bg-white transition-all block min-h-[100px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.bg} ${a.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                <div className="font-semibold text-gray-900 text-sm">{a.label}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{a.desc}</div>
              </Link>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

// ===== Sub-components =====

function PendingCard({ label, count, href, icon: Icon, variant }: { label: string; count: number; href: string; icon: any; variant: "warning" | "neutral" | "info" }) {
  return (
    <Link href={href} className="group bg-gray-50 border border-gray-100 rounded-xl p-4 hover:shadow-sm hover:border-gray-200 transition-all block min-h-[80px]">
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5 text-gray-500" />
        {count > 0 ? (
          <StatusBadge label={String(count)} variant={variant} size="sm" dot />
        ) : (
          <StatusBadge label="完成" variant="success" size="sm" dot />
        )}
      </div>
      <div className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">{label}</div>
    </Link>
  );
}

function ContentCard({ title, total, href, items }: { title: string; total: number; href: string; items: Array<{ label: string; value: number; variant: "success" | "warning" | "danger" | "neutral" | "info" }> }) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 hover:shadow-sm hover:border-gray-200 transition-all">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <Link href={href} className="inline-flex items-center gap-0.5 text-xs text-teal-600 hover:text-teal-700 min-h-[44px] px-1">
          详情 <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-3">{total.toLocaleString()}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{item.label}</span>
            <StatusBadge label={item.value.toLocaleString()} variant={item.variant} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Quick actions =====
interface QuickAction { label: string; href: string; icon: any; desc: string; bg: string; iconColor: string }
const QUICK_ACTIONS: QuickAction[] = [
  { label: "用户管理", href: "/admin/users", icon: Users, desc: "查看/编辑用户、角色、积分、会员到期时间", bg: "bg-blue-50", iconColor: "text-blue-600" },
  { label: "等级勋章", href: "/admin/levels", icon: Award, desc: "管理等级规则、勋章库与用户授予", bg: "bg-amber-50", iconColor: "text-amber-600" },
  { label: "成长日志", href: "/admin/growth-logs", icon: TrendingUp, desc: "查看用户成长流水、类型筛选与搜索", bg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { label: "点评审核", href: "/admin/tool-reviews", icon: Star, desc: "审核用户提交的工具评价，通过后发放成长值", bg: "bg-yellow-50", iconColor: "text-yellow-600" },
  { label: "广告管理", href: "/admin/ads", icon: ExternalLink, desc: "管理广告位、广告活动与投放状态", bg: "bg-rose-50", iconColor: "text-rose-600" },
  { label: "邀请码管理", href: "/admin/invites", icon: Shield, desc: "生成/停用邀请码、查看注册进度", bg: "bg-cyan-50", iconColor: "text-cyan-600" },
  { label: "专题管理", href: "/admin/topics", icon: FileText, desc: "管理专题内容、APP 评级清单与 YouTube 视频", bg: "bg-purple-50", iconColor: "text-purple-600" },
  { label: "通知管理", href: "/admin/notifications", icon: Bell, desc: "查看通知记录、发送通知给用户、群发公告", bg: "bg-indigo-50", iconColor: "text-indigo-600" },
  { label: "文章管理", href: "/admin/cms", icon: FileText, desc: "管理网站文章、指南与教程内容", bg: "bg-orange-50", iconColor: "text-orange-600" },
  { label: "系统设置", href: "/admin/settings", icon: Settings, desc: "网站基础设置与系统配置", bg: "bg-slate-50", iconColor: "text-slate-600" },
  { label: "数据备份", href: "/admin/backup", icon: Database, desc: "数据库备份管理与导出", bg: "bg-emerald-50", iconColor: "text-emerald-600" },
];
