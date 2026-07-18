import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";
import {
  FileText, ExternalLink, Building2, Bell,
  StickyNote, Crown,
  Gift, Star,
  Plus, ArrowRight,
  ListChecks,
  Bookmark,
  Activity
} from "lucide-react";
import CheckinButton from "@/components/user/CheckinButton";
import TodayTasks from "@/components/user/TodayTasks";
import RecentTools from "@/components/user/RecentTools";
import { SectionCard } from "@/components/saas/SectionCard";

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

const levelThresholds: Record<string, number> = {
  lv1: 0,
  lv2: 100,
  lv3: 300,
  lv4: 600,
  lv5: 1000,
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
    prisma.taskChainDraft.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }).catch(() => []),
  ]);

  const [
    userRes, favToolsRes, navLinksRes, docHistoryRes, companyProfilesRes,
    tasksRes, badgeCountRes, memosRes, unreadNotifsRes,
    docCountRes, companyCountRes, inviteCountRes, taskChainsRes,
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
  const taskChains = taskChainsRes.status === "fulfilled" ? taskChainsRes.value : [];

  const memberLevel = user?.role === "管理员" ? "管理员" : user?.levelKey === "member" ? "会员" : "免费版用户";
  const displayName = user?.name?.split("@")[0] || user?.email?.split("@")[0] || "用户";
  const isMember = user?.memberUntil && new Date(user.memberUntil) > new Date();
  const levelKey = user?.levelKey || "lv1";
  const levelLabel = levelLabels[levelKey] || "Lv.1 新手";
  const todayChecked = user?.lastCheckinDate === new Date().toISOString().split("T")[0];
  
  // Calculate progress to next level
  const currentThreshold = levelThresholds[levelKey] || 0;
  const nextLevelKey = levelKey === "lv1" ? "lv2" : levelKey === "lv2" ? "lv3" : levelKey === "lv3" ? "lv4" : levelKey === "lv4" ? "lv5" : null;
  const nextThreshold = nextLevelKey ? (levelThresholds[nextLevelKey] || 1000) : currentThreshold;
  const progressToNext = nextThreshold > currentThreshold 
    ? Math.min(100, Math.round(((user?.growthValue ?? 0) - currentThreshold) / (nextThreshold - currentThreshold) * 100))
    : 100;
  const remainingToNext = nextThreshold > currentThreshold 
    ? Math.max(0, nextThreshold - (user?.growthValue ?? 0))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-4 pb-20 md:pb-4">
      
      {/* ═══════════════════════════════════════════════════════
          SECTION 1: User Overview Banner
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1D6B] via-[#0d2580] to-[#1a3a9f] p-4 sm:p-5 text-white shadow-lg">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Left: User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg sm:text-xl font-bold truncate">
                欢迎回来，{displayName}
              </h1>
              {isMember && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-semibold rounded-full border border-amber-400/30">
                  <Crown className="w-3 h-3" />
                  会员
                </span>
              )}
            </div>
            <p className="text-white/60 text-xs sm:text-sm truncate mb-3">{user?.email}</p>
            
            {/* Level Progress */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                <Star className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-semibold text-xs">{levelLabel}</span>
              </div>
              <div className="flex-1 max-w-[140px] sm:max-w-[180px]">
                <div className="flex items-center justify-between text-[10px] text-white/60 mb-1">
                  <span>成长进度</span>
                  <span>{progressToNext}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                {nextLevelKey && (
                  <p className="text-[10px] text-white/50 mt-1">
                    距下一级还需 {remainingToNext} 成长值
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Stats + Checkin */}
          <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold">{user?.points ?? 0}</p>
                <p className="text-[10px] text-white/60">积分</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold">{user?.checkinStreak || 0}</p>
                <p className="text-[10px] text-white/60">连续签到</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold">{badgeCount}</p>
                <p className="text-[10px] text-white/60">勋章</p>
              </div>
            </div>
            <CheckinButton
              userId={userId}
              lastCheckinDate={user?.lastCheckinDate}
              checkinStreak={user?.checkinStreak || 0}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: Core Metrics Row
          ═══════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        <Link href="/workspace/documents" className="group">
          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 hover:shadow-md hover:border-[#0A1D6B]/20 transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-[11px] text-gray-500">单据</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{docCount}</p>
          </div>
        </Link>
        <Link href="/workspace/company-profiles" className="group">
          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 hover:shadow-md hover:border-[#0A1D6B]/20 transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-[11px] text-gray-500">公司</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{companyCount}</p>
          </div>
        </Link>
        <Link href="/workspace/task-chains" className="group">
          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 hover:shadow-md hover:border-[#0A1D6B]/20 transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Activity className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-[11px] text-gray-500">任务链</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{taskChains.length}</p>
          </div>
        </Link>
        <Link href="/workspace/favorites" className="group">
          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 hover:shadow-md hover:border-[#0A1D6B]/20 transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                <Bookmark className="w-4 h-4 text-rose-600" />
              </div>
              <span className="text-[11px] text-gray-500">收藏</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{favTools.length}</p>
          </div>
        </Link>
        <Link href="/workspace/invites" className="group col-span-2 sm:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 hover:shadow-md hover:border-[#0A1D6B]/20 transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Gift className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-[11px] text-gray-500">邀请</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{inviteCount}</p>
          </div>
        </Link>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: Quick Actions
          ═══════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">快速操作</h2>
          <Link href="/tools" className="text-xs text-[#6C5DD3] hover:text-[#5b4fc4] font-medium flex items-center gap-1">
            全部工具 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link href="/tools/documents" className="group">
            <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 hover:shadow-md hover:border-[#0A1D6B]/20 transition-all h-full">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-[#0A1D6B]" />
              </div>
              <p className="text-sm font-semibold text-gray-900">新建单据</p>
              <p className="text-[11px] text-gray-500 mt-0.5">发票、装箱单等</p>
            </div>
          </Link>
          <Link href="/workspace/company-profiles" className="group">
            <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 hover:shadow-md hover:border-[#0A1D6B]/20 transition-all h-full">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">公司资料</p>
              <p className="text-[11px] text-gray-500 mt-0.5">管理公司信息</p>
            </div>
          </Link>
          <Link href="/workspace/task-chains" className="group">
            <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 hover:shadow-md hover:border-[#0A1D6B]/20 transition-all h-full">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <ListChecks className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">任务链</p>
              <p className="text-[11px] text-gray-500 mt-0.5">自动化工作流</p>
            </div>
          </Link>
          <Link href="/workspace/member" className="group relative">
            {!isMember && (
              <span className="absolute top-2 right-2 text-[9px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">推荐</span>
            )}
            <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 hover:shadow-md hover:border-[#0A1D6B]/20 transition-all h-full">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Crown className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">会员中心</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{isMember ? "会员权益" : "解锁更多功能"}</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4: Main Content - Two Column Layout
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column - Primary Content */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Recent Documents */}
          <SectionCard
            title="最近单据"
            action={
              docs.length > 0 ? (
                <Link href="/workspace/documents" className="text-xs text-[#6C5DD3] hover:text-[#5b4fc4] font-medium flex items-center gap-1">
                  查看全部 <ArrowRight className="w-3 h-3" />
                </Link>
              ) : undefined
            }
          >
            {docs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 mb-1">还没有单据记录</p>
                <p className="text-xs text-gray-400 mb-4">使用单据工具填写后，点击"保存到工作台"即可存档</p>
                <Link
                  href="/tools?cat=documents"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0A1D6B] text-white rounded-lg text-xs font-medium hover:bg-[#0d2580] transition-colors"
                >
                  使用单据工具 <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 -mt-2">
                {docs.slice(0, 4).map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {doc.documentNo || "未编号"}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded font-medium">
                          {docTypeLabels[doc.documentType] || doc.documentType}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(doc.createdAt).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/tools/documents/${doc.documentType}?historyId=${doc.id}`}
                      className="flex-shrink-0 text-xs text-[#6C5DD3] hover:text-[#5b4fc4] font-medium"
                    >
                      查看
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Task Chains */}
          <SectionCard
            title="任务链"
            action={
              <Link href="/workspace/task-chains" className="text-xs text-[#6C5DD3] hover:text-[#5b4fc4] font-medium flex items-center gap-1">
                管理 <ArrowRight className="w-3 h-3" />
              </Link>
            }
          >
            {taskChains.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-2">
                  <ListChecks className="w-6 h-6 text-purple-300" />
                </div>
                <p className="text-sm text-gray-500 mb-1">还没有任务链</p>
                <p className="text-xs text-gray-400 mb-3">创建自动化工作流，批量处理单据</p>
                <Link
                  href="/workspace/task-chains"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6C5DD3] text-white rounded-lg text-xs font-medium hover:bg-[#5b4fc4] transition-colors"
                >
                  <Plus className="w-3 h-3" /> 创建任务链
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {taskChains.slice(0, 3).map((chain) => (
                  <Link
                    key={chain.id}
                    href={`/workspace/task-chains/${chain.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{chain.title}</p>
                      <p className="text-[11px] text-gray-500">
                        {chain.status === "completed" ? "已完成" : chain.status === "active" ? "进行中" : "已归档"} · {new Date(chain.updatedAt).toLocaleDateString("zh-CN")}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Recent Tools */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">常用工具</h3>
              <Link href="/tools" className="text-xs text-[#6C5DD3] hover:text-[#5b4fc4] font-medium flex items-center gap-1">
                工具中心 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <RecentTools userId={userId} embedded />
          </div>
        </div>

        {/* Right Column - Secondary Content */}
        <div className="space-y-4">
          
          {/* Notifications */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">通知</h3>
              {unreadNotifs > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-medium">
                  {unreadNotifs}
                </span>
              )}
            </div>
            <Link
              href="/workspace/notifications"
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#6C5DD3]/10 flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4 text-[#6C5DD3]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {unreadNotifs > 0 ? `${unreadNotifs} 条未读通知` : '暂无新通知'}
                </p>
                <p className="text-[11px] text-gray-500">点击查看详情</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </Link>
          </div>

          {/* Company Profiles */}
          <SectionCard
            title="公司资料"
            action={
              <Link href="/workspace/company-profiles" className="text-xs text-[#6C5DD3] hover:text-[#5b4fc4] font-medium">
                管理
              </Link>
            }
          >
            {profiles.length === 0 ? (
              <Link
                href="/workspace/company-profiles"
                className="block text-center py-5 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-sm text-gray-500 mb-0.5">还没有公司资料</p>
                <p className="text-[11px] text-gray-400">创建后可快速填充到单据</p>
              </Link>
            ) : (
              <div className="space-y-2">
                {profiles.slice(0, 3).map((profile) => (
                  <div key={profile.id} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {profile.companyName || profile.companyNameEn || "未命名"}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {profile.contactName || profile.email || ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Today Tasks */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">今日待办</h3>
              <Link href="/workspace/tasks" className="text-xs text-[#6C5DD3] hover:text-[#5b4fc4] font-medium">
                全部
              </Link>
            </div>
            <TodayTasks initialTasks={tasks} embedded />
          </div>

          {/* Recent Memos */}
          {recentMemos.length > 0 && (
            <SectionCard
              title="备忘录"
              action={
                <Link href="/workspace/memos" className="text-xs text-[#6C5DD3] hover:text-[#5b4fc4] font-medium">
                  全部
                </Link>
              }
            >
              <div className="space-y-1.5">
                {recentMemos.slice(0, 3).map((memo) => (
                  <Link
                    key={memo.id}
                    href={`/workspace/memos/${memo.id}`}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <StickyNote className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{memo.title}</p>
                      <p className="text-[11px] text-gray-500">
                        {new Date(memo.updatedAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
