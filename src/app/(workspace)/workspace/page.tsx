import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";
import {
  Heart, FileText, ExternalLink, Clock, Building2, Bell,
  ArrowUpRight, Sparkles, Award, ChevronRight,
  StickyNote, Globe, Package, Crown,
  Zap, Target, Gift, Star, CheckCircle2, Calendar,
  Search, User, Settings, TrendingUp, Users, Shield,
  BarChart3, Briefcase, Megaphone, BookOpen, Wrench,
  Plus, ArrowRight, Flame, Trophy, CheckCircle, AlertCircle
} from "lucide-react";
import DeleteDocButton from "@/components/workspace/DeleteDocButton";
import { TaskChainList } from "@/components/workspace/TaskChainList";
import CheckinButton from "@/components/user/CheckinButton";
import TodayTasks from "@/components/user/TodayTasks";
import RecentTools from "@/components/user/RecentTools";
import { SectionCard } from "@/components/saas/SectionCard";
import { MetricCard } from "@/components/saas/MetricCard";
import { ActionCard } from "@/components/saas/ActionCard";

export const metadata: Metadata = {
  title: "我的工作台 — 绝世百宝箱",
  description: "海外工具平台的客户运营中心：常用工具、今日待办、签到成长、业务资产",
};

const docTypeLabels: Record<string, string> = {
  "proforma-invoice": "形式发票",
  "commercial-invoice": "商业发票",
  "packing-list": "装箱单",
  "shipping-label": "外箱唛头",
  "inbound-label": "入库标签",
  "consolidation-label": "合箱标签",
  "shipping-mark": "外箱唛头",
  "quotation": "报价单",
  "sales-contract": "销售合同",
  "freight-statement": "运费账单",
  "debit-note": "借记单",
  "booking-instruction": "订舱委托书",
  "customs-declaration-authorization": "报关委托书",
  "express-declaration": "快递申报单",
  "certificate-of-origin-template": "原产地证模板",
  "fumigation-certificate-template": "熏蒸证书模板",
  "consolidation-packing-list": "合箱装箱单",
  "consolidation-inbound-receipt": "合箱入库单",
  "handover-note": "交接单",
  "inbound-receipt": "入库单",
};

const levelLabels: Record<string, string> = {
  lv1: "Lv.1 新手",
  lv2: "Lv.2 进阶",
  lv3: "Lv.3 精英",
  lv4: "Lv.4 大师",
  lv5: "Lv.5 传奇",
};

export default async function WorkspacePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/workspace");
  }

  const userId = session.user.id;

  const results = await Promise.allSettled([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        name: true,
        email: true,
        memberUntil: true,
        growthValue: true,
        levelKey: true,
        points: true,
        checkinStreak: true,
        lastCheckinDate: true,
        badges: true,
      },
    }),
    prisma.userFavorite.findMany({ where: { userId, resourceType: "tool" }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.userCustomNav.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.documentHistory.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }).catch(() => []),
    prisma.userCompanyProfile.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }),
    prisma.userTask.findMany({
      where: { userId, status: "pending" },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 5,
    }).catch(() => []),
    prisma.userBadgeAward.count({ where: { userId } }),
    prisma.memo.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }).catch(() => []),
    prisma.notification.count({ where: { userId, readAt: null } }),
    prisma.documentHistory.count({ where: { userId } }),
    prisma.userCompanyProfile.count({ where: { userId } }),
    prisma.inviteRedemption.count({ where: { inviterUserId: userId } }),
  ]);

  const [
    userRes, favToolsRes, navLinksRes, docHistoryRes, companyProfilesRes,
    tasksRes, badgeCountRes, memosRes, unreadNotifsRes,
    docCountRes, companyCountRes, inviteCountRes,
  ] = results;

  const user = userRes.status === "fulfilled" ? userRes.value : null;
  const favTools = favToolsRes.status === "fulfilled" ? favToolsRes.value : [];
  const navLinks = navLinksRes.status === "fulfilled" ? navLinksRes.value : [];
  const docs = docHistoryRes.status === "fulfilled" ? docHistoryRes.value : [];
  const profiles = companyProfilesRes.status === "fulfilled" ? companyProfilesRes.value : [];
  const tasks = tasksRes.status === "fulfilled" ? tasksRes.value : [];
  const badgeCount = badgeCountRes.status === "fulfilled" ? badgeCountRes.value : 0;
  const recentMemos = memosRes.status === "fulfilled" ? memosRes.value : [];
  const unreadNotifs = unreadNotifsRes.status === "fulfilled" ? unreadNotifsRes.value : 0;
  const docCount = docCountRes.status === "fulfilled" ? docCountRes.value : 0;
  const companyCount = companyCountRes.status === "fulfilled" ? companyCountRes.value : 0;
  const inviteCount = inviteCountRes.status === "fulfilled" ? inviteCountRes.value : 0;

  const memberLevel = user?.role === "管理员" ? "管理员" : user?.levelKey === "member" ? "会员" : "免费版用户";
  const displayName = user?.name?.split("@")[0] || user?.email?.split("@")[0] || "用户";
  const isMember = user?.memberUntil && new Date(user.memberUntil) > new Date();
  const levelLabel = user?.levelKey && levelLabels[user.levelKey] ? levelLabels[user.levelKey] : "Lv.1 新手";
  const todayChecked = user?.lastCheckinDate === new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
      {/* ===== A. 顶部全局栏 ===== */}
      <div className="flex items-center justify-between gap-4 py-3">
        {/* 搜索 */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索工具、单据、公司..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
        {/* 快捷入口 */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/tools" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
            <Globe className="w-4 h-4" />
            <span>工具</span>
          </Link>
          <Link href="/workspace/documents" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
            <FileText className="w-4 h-4" />
            <span>单据</span>
          </Link>
          <Link href="/workspace/company-profiles" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
            <Building2 className="w-4 h-4" />
            <span>公司</span>
          </Link>
        </div>
        {/* 通知 + 用户 */}
        <div className="flex items-center gap-2">
          <Link
            href="/workspace/notifications"
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="通知中心"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Link>
          <Link
            href="/workspace/settings"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="设置"
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </Link>
          <Link
            href="/workspace/member"
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{displayName}</span>
          </Link>
        </div>
      </div>

      {/* ===== B. 用户身份横幅 ===== */}
      <section className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold">欢迎回来，{displayName} 👋</h1>
              {user?.role === "管理员" && (
                <span className="px-2 py-0.5 bg-violet-500/20 text-violet-100 text-xs rounded-full border border-violet-400/30">
                  管理员
                </span>
              )}
              {isMember && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-100 text-xs rounded-full border border-amber-400/30 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  会员
                </span>
              )}
            </div>
            <p className="text-sm text-teal-50 mb-3">{user?.email}</p>

            {/* 身份指标行 */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1">
                <Star className="w-4 h-4 text-amber-300" />
                <span className="font-semibold">{levelLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1">
                <TrendingUp className="w-4 h-4 text-emerald-300" />
                <span className="font-semibold">{user?.growthValue ?? 0}</span>
                <span className="text-teal-100">成长值</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1">
                <Zap className="w-4 h-4 text-amber-300" />
                <span className="font-semibold">{user?.points ?? 0}</span>
                <span className="text-teal-100">积分</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1">
                <Calendar className="w-4 h-4 text-teal-200" />
                <span className="font-semibold">{todayChecked ? "已签到" : "未签到"}</span>
              </div>
            </div>
          </div>

          {/* 签到按钮 */}
          <div className="flex-shrink-0">
            <CheckinButton
              userId={userId}
              lastCheckinDate={user?.lastCheckinDate}
              checkinStreak={user?.checkinStreak || 0}
            />
          </div>
        </div>
      </section>

      {/* ===== C. CTA 按钮区 ===== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <ActionCard
          title="今日签到"
          description={todayChecked ? "已完成今日签到" : "签到获得积分和成长值"}
          icon={<Calendar className="w-6 h-6" />}
          href="/workspace/tasks"
          badge={todayChecked ? "已完成" : "待完成"}
        />
        <ActionCard
          title="邀请奖励"
          description="邀请好友获得会员天数"
          icon={<Gift className="w-6 h-6" />}
          href="/workspace/invites"
          badge="推荐"
        />
        <ActionCard
          title="会员权益"
          description="查看会员特权和兑换"
          icon={<Crown className="w-6 h-6" />}
          href="/workspace/member"
          badge={!isMember ? "推荐" : undefined}
        />
        <ActionCard
          title="广告权益"
          description="申请使用广告资源"
          icon={<Megaphone className="w-6 h-6" />}
          href="/workspace/ad-entitlements"
        />
        <ActionCard
          title="新建单据"
          description="快速创建发票、装箱单等"
          icon={<FileText className="w-6 h-6" />}
          href="/tools/documents"
        />
        <ActionCard
          title="添加公司资料"
          description="管理公司信息，一键填充"
          icon={<Building2 className="w-6 h-6" />}
          href="/workspace/company-profiles"
        />
      </div>

      {/* ===== D. 核心数据卡 ===== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Link href="/workspace/documents">
          <MetricCard
            label="我的单据"
            value={docCount}
            icon={<FileText className="w-5 h-5" />}
          />
        </Link>
        <Link href="/workspace/company-profiles">
          <MetricCard
            label="公司资料"
            value={companyCount}
            icon={<Building2 className="w-5 h-5" />}
          />
        </Link>
        <Link href="/workspace/member">
          <MetricCard
            label="成长值"
            value={user?.growthValue ?? 0}
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </Link>
        <Link href="/workspace/member">
          <MetricCard
            label="勋章"
            value={badgeCount}
            icon={<Award className="w-5 h-5" />}
          />
        </Link>
        <Link href="/workspace/invites">
          <MetricCard
            label="邀请奖励"
            value={inviteCount}
            icon={<Gift className="w-5 h-5" />}
          />
        </Link>
      </div>

      {/* ===== E. 成长运营区 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 今日签到 */}
        <SectionCard title="今日签到" subtitle={`连续 ${user?.checkinStreak || 0} 天`}>
          <div className="text-center py-2">
            <CheckinButton
              userId={userId}
              lastCheckinDate={user?.lastCheckinDate}
              checkinStreak={user?.checkinStreak || 0}
            />
            <p className="text-xs text-gray-500 mt-3">每日签到可获得 5 积分 + 2 成长值</p>
          </div>
        </SectionCard>

        {/* 成长等级 */}
        <SectionCard title="成长等级" subtitle={levelLabel}>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">当前等级</span>
              <span className="font-semibold text-teal-700">{levelLabel}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(((user?.growthValue ?? 0) % 100), 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              距离下一级还需 {100 - ((user?.growthValue ?? 0) % 100)} 成长值
            </p>
          </div>
        </SectionCard>

        {/* 我的勋章 */}
        <SectionCard
          title="我的勋章"
          action={<Link href="/workspace/member" className="text-xs text-teal-600 hover:underline">查看全部</Link>}
        >
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{badgeCount}</p>
                <p className="text-xs text-gray-500">已获勋章</p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 今日任务 */}
        <SectionCard
          title="今日任务"
          action={<Link href="/workspace/tasks" className="text-xs text-teal-600 hover:underline">全部</Link>}
        >
          <TodayTasks initialTasks={tasks} />
        </SectionCard>
      </div>

      {/* ===== E2. 邀请奖励与权益区 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 邀请奖励卡 */}
        <SectionCard
          title="邀请奖励"
          subtitle="邀请好友获得会员天数"
          action={<Link href="/workspace/invites" className="text-xs text-teal-600 hover:underline">查看详情</Link>}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">已邀请</span>
              <span className="text-lg font-bold text-teal-700">{inviteCount} 人</span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• 每邀请 1 人获得 3 天会员</p>
              <p>• 好友注册获得 500 积分</p>
            </div>
            <Link
              href="/workspace/invites"
              className="block w-full text-center py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors"
            >
              查看邀请码
            </Link>
          </div>
        </SectionCard>

        {/* 会员权益卡 */}
        <SectionCard
          title="会员权益"
          subtitle={isMember ? "会员生效中" : "免费版"}
          action={<Link href="/workspace/member" className="text-xs text-teal-600 hover:underline">查看详情</Link>}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">会员状态</span>
              <span className={`text-sm font-bold ${isMember ? "text-amber-600" : "text-gray-400"}`}>
                {isMember ? "会员" : "免费版"}
              </span>
            </div>
            {isMember && user?.memberUntil && (
              <div className="text-xs text-gray-500">
                到期时间：{new Date(user.memberUntil).toLocaleDateString("zh-CN")}
              </div>
            )}
            <div className="text-xs text-gray-500 space-y-1">
              <p>• 邀请好友自动获得会员天数</p>
              <p>• 解锁更多功能和额度</p>
            </div>
            <Link
              href="/workspace/member"
              className="block w-full text-center py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
            >
              {isMember ? "查看权益" : "升级会员"}
            </Link>
          </div>
        </SectionCard>

        {/* 广告权益卡 */}
        <SectionCard
          title="广告权益"
          subtitle="申请使用广告资源"
          action={<Link href="/workspace/ad-entitlements" className="text-xs text-teal-600 hover:underline">查看详情</Link>}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">可用天数</span>
              <span className="text-lg font-bold text-teal-700">0 天</span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• 邀请好友获得广告权益</p>
              <p>• 申请使用广告资源</p>
            </div>
            <Link
              href="/workspace/ad-entitlements"
              className="block w-full text-center py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              申请使用
            </Link>
          </div>
        </SectionCard>
      </div>

      {/* ===== F. 最近工作区 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 最近单据 */}
        <SectionCard
          title="最近单据"
          action={
            docs.length > 0 ? (
              <Link href="/workspace/documents" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                全部 <ArrowRight className="w-3 h-3" />
              </Link>
            ) : undefined
          }
        >
          {docs.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">还没有单据记录</p>
              <p className="text-xs text-gray-400 mb-3">使用单据工具填写后，点击"保存到工作台"即可存档</p>
              <Link
                href="/tools?cat=documents"
                className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs hover:bg-teal-700"
              >
                使用单据工具 <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 -mt-2">
              {docs.slice(0, 4).map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {doc.documentNo || "未编号"}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded">
                        {docTypeLabels[doc.documentType] || doc.documentType}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(doc.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/tools/documents/${doc.documentType}?historyId=${doc.id}`}
                    className="flex-shrink-0 text-xs text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    查看
                  </Link>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* 公司资料摘要 */}
        <SectionCard
          title="公司资料"
          action={
            <Link href="/workspace/company-profiles" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
              管理 <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          {profiles.length === 0 ? (
            <Link
              href="/workspace/company-profiles"
              className="block text-center py-6 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">还没有公司资料</p>
              <p className="text-xs text-gray-400">创建公司资料，快速生成单据</p>
            </Link>
          ) : (
            <div className="space-y-3">
              {profiles.slice(0, 3).map((profile) => (
                <div key={profile.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profile.companyName || profile.companyNameEn || "未命名公司"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {profile.contactName || profile.email || "无联系方式"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* 常用工具 */}
        <SectionCard
          title="常用工具"
          action={
            <Link href="/tools" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
              工具中心 <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          <RecentTools userId={userId} />
        </SectionCard>

        {/* 商品资料库 */}
        <SectionCard
          title="商品资料库"
          action={
            <Link href="/workspace/products" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
              管理 <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          <div className="text-center py-4">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-1">管理你的商品信息</p>
            <p className="text-xs text-gray-400 mb-3">添加商品后可快速填充到单据中</p>
            <Link
              href="/workspace/products"
              className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs hover:bg-teal-700"
            >
              <Plus className="w-3 h-3" /> 添加商品
            </Link>
          </div>
        </SectionCard>
      </div>

      {/* ===== G. 动态区 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 通知时间线 */}
        <SectionCard
          title="通知"
          action={
            unreadNotifs > 0 ? (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadNotifs} 未读</span>
            ) : (
              <Link href="/workspace/notifications" className="text-xs text-teal-600 hover:underline">全部</Link>
            )
          }
        >
          <Link
            href="/workspace/notifications"
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {unreadNotifs > 0 ? `${unreadNotifs} 条未读通知` : "暂无新通知"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">点击查看通知详情</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </Link>
        </SectionCard>

        {/* 备忘录 */}
        <SectionCard
          title="备忘录"
          action={
            <Link href="/workspace/memos" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
              全部 <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          {recentMemos.length === 0 ? (
            <Link
              href="/workspace/memos"
              className="block text-center py-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <StickyNote className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">还没有备忘录</p>
              <p className="text-xs text-gray-400">记录重要事项和灵感</p>
            </Link>
          ) : (
            <div className="space-y-2">
              {recentMemos.slice(0, 3).map((memo) => (
                <Link
                  key={memo.id}
                  href="/workspace/memos"
                  className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900 truncate">{memo.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                    {memo.content || "无内容"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        {/* 会员权益 Banner */}
        <SectionCard title="会员权益">
          <div className="text-center py-2">
            {isMember ? (
              <>
                <Crown className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 mb-1">会员权益生效中</p>
                <p className="text-xs text-gray-500">
                  到期时间：{new Date(user!.memberUntil!).toLocaleDateString("zh-CN")}
                </p>
                <Link
                  href="/workspace/member"
                  className="inline-flex items-center gap-1 mt-3 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors"
                >
                  查看权益 <ArrowRight className="w-3 h-3" />
                </Link>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-2">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">升级会员，解锁全部功能</p>
                <p className="text-xs text-gray-500 mb-3">无限单据、高级模板、优先客服</p>
                <Link
                  href="/workspace/member"
                  className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-medium hover:from-amber-600 hover:to-orange-600 transition-colors"
                >
                  立即升级 <ArrowRight className="w-3 h-3" />
                </Link>
              </>
            )}
          </div>
        </SectionCard>
      </div>

      {/* ===== H. 跨境发货任务 ===== */}
      <SectionCard
        title="跨境发货任务"
        subtitle="跟踪你的物流进度"
      >
        <TaskChainList />
      </SectionCard>

      {/* ===== I. 推荐工具 & 快速入口 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="推荐工具" subtitle="根据你的使用习惯推荐">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "运费计算器", href: "/tools/shipping-calculator", icon: <BarChart3 className="w-5 h-5" /> },
              { label: "物流追踪", href: "/tracking", icon: <Package className="w-5 h-5" /> },
              { label: "HS 编码查询", href: "/tools/hs-code", icon: <BookOpen className="w-5 h-5" /> },
              { label: "汇率换算", href: "/tools/exchange-rate", icon: <TrendingUp className="w-5 h-5" /> },
            ].map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-teal-50 hover:border-teal-200 border border-transparent transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-teal-600">
                  {tool.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{tool.label}</span>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="快速入口">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "去工具中心", href: "/tools", icon: <Globe className="w-5 h-5" /> },
              { label: "创建公司资料", href: "/workspace/company-profiles", icon: <Building2 className="w-5 h-5" /> },
              { label: "查看我的单据", href: "/workspace/documents", icon: <FileText className="w-5 h-5" /> },
              { label: "邀请好友", href: "/workspace/invites", icon: <Users className="w-5 h-5" /> },
              { label: "提交反馈", href: "/feedback", icon: <Megaphone className="w-5 h-5" /> },
              { label: "帮助中心", href: "/topics", icon: <BookOpen className="w-5 h-5" /> },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-teal-50 hover:border-teal-200 border border-transparent transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-teal-600">
                  {link.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{link.label}</span>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
