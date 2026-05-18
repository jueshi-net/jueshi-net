"use client";
import Link from "next/link";
import {
  Users, Star, FileText, Megaphone, FolderOpen, Link2, Settings, Cloud,
  BarChart3, Shield, Database, Package, ExternalLink, ArrowUpRight,
  BookOpen, Eye, MessageSquare, AlertCircle, MessageCircle, Bell,
  TrendingUp, CheckCircle, Clock, Award, ChevronRight, Activity,
} from "lucide-react";
import type { AdminStatsData } from "@/lib/admin-stats";

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
  const totalPending = s ? (s.pending.reviews + s.pending.forumPosts + s.pending.forumComments + s.pending.draftTopics) : 0;
  const pendingUrgent = s ? (s.pending.reviews + s.pending.forumPosts + s.pending.forumComments) : 0;

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold">运营总控台</h1>
            <p className="text-sm text-slate-300 mt-0.5">查看用户增长、内容审核、通知与社区运营状态</p>
          </div>
          <Link href="/" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-colors min-h-[44px] shrink-0">
            <ExternalLink className="w-4 h-4" /> 查看前台
          </Link>
        </div>
      </div>

      {/* ===== 1. 今日待处理 ===== */}
      {s ? (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            今日待处理
            {totalPending > 0 ? (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{totalPending} 项</span>
            ) : (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">全部已处理</span>
            )}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <PendingCard label="待审核点评" count={s.pending.reviews} href="/admin/tool-reviews" icon={Star} color="amber" />
            <PendingCard label="待审帖子" count={s.pending.forumPosts} href="/admin/forum" icon={MessageCircle} color="amber" />
            <PendingCard label="待审评论" count={s.pending.forumComments} href="/admin/forum" icon={MessageSquare} color="amber" />
            <PendingCard label="草稿专题" count={s.pending.draftTopics} href="/admin/topics" icon={FileText} color="gray" />
            <PendingCard label="未读通知" count={s.pending.unreadNotifications} href="/admin/notifications" icon={Bell} color="blue" />
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">运营数据加载失败，模块卡片仍可用</p>
        </div>
      )}

      {/* ===== 2. 核心数据概览 ===== */}
      {s && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            核心数据概览
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            <StatMini label="用户总数" value={s.overview.usersTotal} sub={`今日 +${s.overview.usersToday}`} color="blue" />
            <StatMini label="已发布专题" value={s.overview.topicsPublished} color="purple" />
            <StatMini label="已发布帖子" value={s.overview.forumPostsPublished} color="violet" />
            <StatMini label="已通过点评" value={s.overview.reviewsApproved} color="green" />
            <StatMini label="成长日志" value={s.overview.growthLogsTotal} sub={`今日 +${s.growth.logsToday}`} color="teal" />
            <StatMini label="通知总数" value={s.overview.notificationsTotal} sub={`未读 ${s.content.notifications.unread}`} color="indigo" />
            <StatMini label="短评总数" value={s.content.reviews.total} sub={`待审 ${s.content.reviews.pending}`} color="amber" />
          </div>
        </div>
      )}

      {/* ===== 3. 用户成长系统 ===== */}
      {s && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            用户成长系统
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Level distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> 等级分布
              </h3>
              <div className="space-y-2">
                {["lv1", "lv2", "lv3", "lv4", "lv5"].map((lv) => (
                  <div key={lv} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{LEVEL_NAMES[lv] || lv}</span>
                    <span className="font-bold text-gray-900">{s.growth.usersByLevel[lv] || 0} 人</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent growth logs */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:col-span-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-500" /> 最近成长记录
              </h3>
              {s.growth.recentLogs.length === 0 ? (
                <p className="text-xs text-gray-400">暂无成长记录</p>
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
            </div>
          </div>
        </div>
      )}

      {/* ===== 4. 内容运营 ===== */}
      {s && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-purple-500" />
            内容运营
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <ContentCard title="专题" total={s.content.topics.published + s.content.topics.draft + s.content.topics.archived} href="/admin/topics" items={[
              { label: "已发布", value: s.content.topics.published, color: "text-green-600" },
              { label: "草稿", value: s.content.topics.draft, color: "text-gray-500" },
              { label: "已归档", value: s.content.topics.archived, color: "text-gray-400" },
            ]} />
            <ContentCard title="点评" total={s.content.reviews.total} href="/admin/tool-reviews" items={[
              { label: "待审", value: s.content.reviews.pending, color: "text-amber-600" },
              { label: "已通过", value: s.content.reviews.approved, color: "text-green-600" },
              { label: "已拒绝", value: s.content.reviews.rejected, color: "text-red-500" },
              { label: "已隐藏", value: s.content.reviews.hidden, color: "text-gray-400" },
            ]} />
            <ContentCard title="论坛" total={s.content.forumPosts.total + s.content.forumComments.total} href="/admin/forum" items={[
              { label: "帖子待审", value: s.content.forumPosts.pending, color: "text-amber-600" },
              { label: "帖子已发布", value: s.content.forumPosts.published, color: "text-green-600" },
              { label: "评论待审", value: s.content.forumComments.pending, color: "text-amber-600" },
              { label: "评论已发布", value: s.content.forumComments.published, color: "text-green-600" },
            ]} />
            <ContentCard title="通知" total={s.content.notifications.total} href="/admin/notifications" items={[
              { label: "未读", value: s.content.notifications.unread, color: "text-blue-600" },
              { label: "已读", value: s.content.notifications.read, color: "text-gray-500" },
            ]} />
          </div>
        </div>
      )}

      {/* ===== 5. 快捷操作区 ===== */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-500" />
          快捷操作
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.label} href={a.href} className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all block min-h-[100px]">
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
      </div>
    </div>
  );
}

// ===== Sub-components =====

function PendingCard({ label, count, href, icon: Icon, color }: { label: string; count: number; href: string; icon: any; color: string }) {
  const colors: Record<string, { bg: string; text: string; badge: string }> = {
    amber: { bg: "bg-amber-50", text: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
    gray: { bg: "bg-gray-50", text: "text-gray-500", badge: "bg-gray-100 text-gray-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
  };
  const c = colors[color] || colors.gray;
  return (
    <Link href={href} className={`${c.bg} border border-gray-100 rounded-xl p-3 hover:shadow-sm transition-all block group min-h-[80px]`}>
      <div className="flex items-center justify-between mb-1">
        <Icon className={`w-4 h-4 ${c.text}`} />
        {count > 0 ? (
          <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${c.badge}`}>{count}</span>
        ) : (
          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
        )}
      </div>
      <div className="text-xs text-gray-600 group-hover:underline">{label}</div>
    </Link>
  );
}

function StatMini({ label, value, sub, color }: { label: string; value: number; sub?: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-600", purple: "text-purple-600", violet: "text-violet-600",
    green: "text-green-600", teal: "text-teal-600", indigo: "text-indigo-600", amber: "text-amber-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-xl font-extrabold ${colors[color] || "text-gray-900"}`}>{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function ContentCard({ title, total, href, items }: { title: string; total: number; href: string; items: Array<{ label: string; value: number; color: string }> }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <Link href={href} className="inline-flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 min-h-[44px] px-1">
          详情 <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <p className="text-lg font-extrabold text-gray-900 mb-2">{total.toLocaleString()}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{item.label}</span>
            <span className={`font-semibold ${item.color}`}>{item.value.toLocaleString()}</span>
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
  { label: "论坛管理", href: "/admin/forum", icon: MessageCircle, desc: "管理帖子、评论、分类、审核状态与锁定", bg: "bg-violet-50", iconColor: "text-violet-600" },
  { label: "专题管理", href: "/admin/topics", icon: FileText, desc: "管理专题内容、APP 评级清单与 YouTube 视频", bg: "bg-purple-50", iconColor: "text-purple-600" },
  { label: "通知管理", href: "/admin/notifications", icon: Bell, desc: "查看通知记录、发送通知给用户、群发公告", bg: "bg-indigo-50", iconColor: "text-indigo-600" },
  { label: "文章管理", href: "/admin/cms", icon: FileText, desc: "管理网站文章、指南与教程内容", bg: "bg-orange-50", iconColor: "text-orange-600" },
  { label: "系统设置", href: "/admin/settings", icon: Settings, desc: "网站基础设置与系统配置", bg: "bg-slate-50", iconColor: "text-slate-600" },
  { label: "数据备份", href: "/admin/backup", icon: Database, desc: "数据库备份管理与导出", bg: "bg-emerald-50", iconColor: "text-emerald-600" },
];
