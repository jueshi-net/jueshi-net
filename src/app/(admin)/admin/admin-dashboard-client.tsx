"use client";
import Link from "next/link";
import { Users, Star, FileText, Megaphone, FolderOpen, Link2, Settings, Cloud, BarChart3, Shield, Database, Package, ExternalLink, ArrowUpRight, BookOpen, Eye, MessageSquare, AlertCircle, MessageCircle, Bell } from "lucide-react";
import type { AdminStatsData } from "@/lib/admin-stats";

interface QuickAction {
  label: string;
  href: string;
  icon: any;
  color: string;
  desc: string;
}

interface ModuleCard {
  name: string;
  path: string;
  icon: any;
  status: "online" | "partial" | "planned";
  statusLabel: string;
  description: string;
  frontendPath?: string;
  color: string;
}

const quickActions: QuickAction[] = [
  { label: "写文章", href: "/admin/cms", icon: FileText, color: "orange", desc: "管理指南内容" },
  { label: "添加资源", href: "/admin/resources", icon: FolderOpen, color: "purple", desc: "管理资源库" },
  { label: "添加广告", href: "/admin/ads", icon: Megaphone, color: "green", desc: "配置广告位" },
  { label: "审核短评", href: "/admin/tool-reviews", icon: Star, color: "yellow", desc: "审核用户评论" },
  { label: "论坛管理", href: "/admin/forum", icon: MessageCircle, color: "violet", desc: "帖子/评论/分类" },
  { label: "管理用户", href: "/admin/users", icon: Users, color: "blue", desc: "用户与会员" },
];

const modules: ModuleCard[] = [
  { name: "用户管理", path: "/admin/users", icon: Users, status: "online", statusLabel: "已上线", description: "查看/编辑用户、角色、积分、会员到期时间", frontendPath: "/dashboard", color: "blue" },
  { name: "短评审核", path: "/admin/tool-reviews", icon: Star, status: "online", statusLabel: "已上线", description: "审核用户提交的工具短评（通过/隐藏/拒绝）", frontendPath: "/tools/[name] → 短评", color: "yellow" },
  { name: "论坛管理", path: "/admin/forum", icon: MessageCircle, status: "online", statusLabel: "已上线", description: "管理论坛帖子、评论、分类和社区规范", frontendPath: "/bbs", color: "violet" },
  { name: "文章管理", path: "/admin/cms", icon: FileText, status: "online", statusLabel: "已上线", description: "管理网站文章/指南/教程", frontendPath: "/guides 和 /guides/[slug]", color: "orange" },
  { name: "广告管理", path: "/admin/ads", icon: Megaphone, status: "online", statusLabel: "已上线", description: "管理广告位。支持图片、文字、HTML/JS 代码广告", frontendPath: "AdSlot 组件自动展示", color: "green" },
  { name: "资源库", path: "/admin/resources", icon: FolderOpen, status: "online", statusLabel: "已上线", description: "管理资源库内容", frontendPath: "/resources 和 /resources/[slug]", color: "purple" },
  { name: "链接管理", path: "/admin/links", icon: Link2, status: "online", statusLabel: "已上线", description: "管理链接收藏、分类、标签", frontendPath: "导航/首页", color: "teal" },
  { name: "分类/标签", path: "/admin/categories", icon: BarChart3, status: "online", statusLabel: "已上线", description: "管理链接分类和标签", frontendPath: "导航/首页", color: "indigo" },
  { name: "单据/唛头模板", path: "/tools/label-maker", icon: Package, status: "partial", statusLabel: "代码级管理", description: "8 种唛头/标签类型 + 6 种视觉风格", frontendPath: "/tools/label-maker", color: "gray" },
  { name: "数据导入", path: "/admin/import", icon: BookOpen, status: "online", statusLabel: "已上线", description: "批量导入链接/书签", frontendPath: "无", color: "cyan" },
  { name: "反馈管理", path: "/admin/feedback", icon: MessageSquare, status: "online", statusLabel: "已上线", description: "查看用户反馈", frontendPath: "/feedback", color: "pink" },
  { name: "系统设置", path: "/admin/settings", icon: Settings, status: "online", statusLabel: "已上线", description: "网站基础设置", frontendPath: "无", color: "slate" },
  { name: "数据备份", path: "/admin/backup", icon: Database, status: "online", statusLabel: "已上线", description: "数据库备份管理", frontendPath: "无", color: "emerald" },
  { name: "审计日志", path: "/admin/audit", icon: Shield, status: "online", statusLabel: "已上线", description: "操作审计与安全日志", frontendPath: "无", color: "red" },
  { name: "系统健康", path: "/admin/health", icon: Eye, status: "online", statusLabel: "已上线", description: "系统健康检查", frontendPath: "无", color: "lime" },
  { name: "专题管理", path: "/admin/topics", icon: FileText, status: "online", statusLabel: "已上线", description: "管理专题内容、APP 条目、YouTube 视频。数据来源: topics, topic_items, topic_sections", frontendPath: "/topics", color: "purple" },
  { name: "通知管理", path: "/admin/notifications", icon: Bell, status: "online", statusLabel: "已上线", description: "查看通知记录、发送通知给用户、群发系统通知", frontendPath: "/dashboard/notifications", color: "blue" },
];

const statusColors: Record<string, string> = {
  online: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  planned: "bg-gray-100 text-gray-500",
};

const colorMap: Record<string, { bg: string; icon: string; border: string; hover: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200", hover: "hover:border-blue-400 hover:shadow-blue-100" },
  yellow: { bg: "bg-yellow-50", icon: "text-yellow-600", border: "border-yellow-200", hover: "hover:border-yellow-400 hover:shadow-yellow-100" },
  orange: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-200", hover: "hover:border-orange-400 hover:shadow-orange-100" },
  green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-200", hover: "hover:border-green-400 hover:shadow-green-100" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-200", hover: "hover:border-purple-400 hover:shadow-purple-100" },
  teal: { bg: "bg-teal-50", icon: "text-teal-600", border: "border-teal-200", hover: "hover:border-teal-400 hover:shadow-teal-100" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", border: "border-indigo-200", hover: "hover:border-indigo-400 hover:shadow-indigo-100" },
  gray: { bg: "bg-gray-50", icon: "text-gray-600", border: "border-gray-200", hover: "" },
  sky: { bg: "bg-sky-50", icon: "text-sky-600", border: "border-sky-200", hover: "" },
  slate: { bg: "bg-slate-50", icon: "text-slate-600", border: "border-slate-200", hover: "hover:border-slate-400 hover:shadow-slate-100" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200", hover: "hover:border-emerald-400 hover:shadow-emerald-100" },
  red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-200", hover: "hover:border-red-400 hover:shadow-red-100" },
  cyan: { bg: "bg-cyan-50", icon: "text-cyan-600", border: "border-cyan-200", hover: "hover:border-cyan-400 hover:shadow-cyan-100" },
  pink: { bg: "bg-pink-50", icon: "text-pink-600", border: "border-pink-200", hover: "hover:border-pink-400 hover:shadow-pink-100" },
  lime: { bg: "bg-lime-50", icon: "text-lime-600", border: "border-lime-200", hover: "hover:border-lime-400 hover:shadow-lime-100" },
  violet: { bg: "bg-violet-50", icon: "text-violet-600", border: "border-violet-200", hover: "hover:border-violet-400 hover:shadow-violet-100" },
};

export default function AdminDashboardClient({ stats }: { stats: AdminStatsData | null }) {
  const s = stats;

  return (
    <div className="space-y-8">
      {/* ===== A. HEADER ===== */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">运营后台</h1>
            <p className="text-sm text-slate-300 mt-1">管理文章、资源、广告、用户、审核与系统配置</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-colors min-h-[44px]">
              <ExternalLink className="w-4 h-4" /> 查看网站首页
            </Link>
          </div>
        </div>
      </div>

      {/* ===== B. STATS ===== */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">运营概览</h2>
        {s ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard icon={Users} label="用户总数" value={s.users.total} sub={`${s.users.members} 会员 / ${s.users.admins} 管理员`} color="text-blue-600" bg="bg-blue-50" link="/admin/users" linkLabel="查看详情 →" />
            <StatCard icon={FileText} label="文章" value={s.articles.total} sub={`${s.articles.published} 已发布 / ${s.articles.draft} 草稿`} color="text-orange-600" bg="bg-orange-50" link="/admin/cms" linkLabel="查看文章 →" />
            <StatCard icon={FolderOpen} label="资源" value={s.resources.total} sub={`${s.resources.active} 启用 / ${s.resources.categories} 分类`} color="text-purple-600" bg="bg-purple-50" link="/admin/resources" linkLabel="查看资源 →" />
            <StatCard icon={Megaphone} label="广告位" value={s.ads.total} sub={`${s.ads.active} 启用 / ${s.ads.inactive} 停用`} color="text-green-600" bg="bg-green-50" link="/admin/ads" linkLabel="管理广告 →" />
            <StatCard icon={Star} label="短评待审" value={s.reviews.pending} sub={`共 ${s.reviews.total} / ${s.reviews.approved} 已通过`} color="text-amber-600" bg="bg-amber-50" link="/admin/tool-reviews" linkLabel="前往审核 →" />
            <StatCard icon={BarChart3} label="积分流水" value={s.points.ledgerCount} sub={`发放 ${s.points.totalIssued} / 消耗 ${s.points.totalSpent}`} color="text-teal-600" bg="bg-teal-50" link="/admin/users" linkLabel="查看用户 →" />
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">统计加载失败，但模块卡片仍可用</p>
          </div>
        )}
      </div>

      {/* ===== C. QUICK ACTIONS ===== */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">快捷操作</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const c = colorMap[action.color] || colorMap.gray;
            return (
              <Link key={action.label} href={action.href} className={`${c.bg} border ${c.border} rounded-xl p-4 hover:shadow-md transition-all block group min-h-[100px]`}>
                <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-2 ${c.icon} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-semibold text-gray-900 text-sm">{action.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{action.desc}</div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ===== D. MODULE CARDS ===== */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">全部模块</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {modules.map((m) => {
            const Icon = m.icon;
            const isPlanned = m.status === "planned";
            const c = colorMap[m.color] || colorMap.gray;

            if (isPlanned) {
              return (
                <div key={m.name} className={`rounded-xl border ${c.border} ${c.bg} p-4 opacity-60`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                    <h3 className="font-semibold text-gray-700 text-sm">{m.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{m.description}</p>
                  <span className={`px-2 py-0.5 rounded text-xs ${statusColors[m.status]}`}>{m.statusLabel}</span>
                </div>
              );
            }

            return (
              <Link key={m.name} href={m.path} className={`rounded-xl border ${c.border} bg-white p-4 ${c.hover} hover:shadow-md transition-all block group`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                    <h3 className="font-semibold text-gray-900 text-sm">{m.name}</h3>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                <p className="text-xs text-gray-500 mb-1">{m.description}</p>
                {m.frontendPath && (
                  <p className="text-xs text-gray-400 mb-2">前台: {m.frontendPath}</p>
                )}
                <span className={`px-2 py-0.5 rounded text-xs ${statusColors[m.status]}`}>{m.statusLabel}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ===== E. CONTENT MAP ===== */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-bold text-gray-900 mb-4">📍 内容从哪里来？</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {[
            { from: "/admin/cms", to: "/guides", desc: "后台写文章 → 前台展示指南内容" },
            { from: "/admin/resources", to: "/resources", desc: "后台管理资源 → 前台展示资源库" },
            { from: "/admin/ads", to: "AdSlot 组件", desc: "后台配广告 → 前台自动展示" },
            { from: "用户前台提交", to: "/admin/tool-reviews", desc: "用户写短评 → 后台审核" },
            { from: "注册/登录", to: "/admin/users", desc: "用户注册 → 后台管理角色与权限" },
            { from: "代码配置", to: "/tools/label-maker", desc: "模板在代码里配置 → 前台生成单据" },
            { from: "/admin/topics", to: "/topics/[slug]", desc: "后台管理专题 → 前台展示 APP 评级清单" },
            { from: "/admin/forum", to: "/bbs", desc: "后台管理帖子/评论/分类 → 前台展示社区论坛" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-mono bg-gray-200 px-2 py-1 rounded text-gray-700 whitespace-nowrap">{item.from}</div>
              <div className="text-gray-400">→</div>
              <div className="text-xs font-mono bg-teal-100 px-2 py-1 rounded text-teal-700 whitespace-nowrap">{item.to}</div>
              <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, bg, link, linkLabel }: { icon: any; label: string; value: number; sub: string; color: string; bg: string; link: string; linkLabel: string }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-extrabold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      {link && (
        <Link href={link} className="text-xs text-teal-600 hover:text-teal-700 mt-1 inline-block">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
