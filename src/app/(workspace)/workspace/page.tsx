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
  Plus, ArrowRight, Flame, Trophy, CheckCircle, AlertCircle,
  Bookmark, LayoutDashboard, LogOut, HelpCircle, MessageSquare
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

  // v1.20.42.18.6.11.4: Use memberUntil for membership, not levelKey
  const isMember = user?.memberUntil && new Date(user.memberUntil) > new Date();
  const memberLevel = user?.role === "管理员" ? "管理员" : isMember ? "会员" : "免费版用户";
  const displayName = user?.name?.split("@")[0] || user?.email?.split("@")[0] || "用户";
  const levelLabel = user?.levelKey && levelLabels[user.levelKey] ? levelLabels[user.levelKey] : "Lv.1 新手";
  const todayChecked = user?.lastCheckinDate === new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      {/* 三栏布局容器 */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">
          
          {/* ===== 左栏：用户信息 + 快捷入口 ===== */}
          <aside className="space-y-6">
            {/* 用户信息卡 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-[#11142D] truncate">{displayName}</h2>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              
              {/* 等级和积分 */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">等级</span>
                  <span className="text-sm font-semibold text-[#6C5DD3]">{levelLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">积分</span>
                  <span className="text-sm font-semibold text-[#11142D]">{user?.points ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">连续签到</span>
                  <span className="text-sm font-semibold text-[#11142D]">{user?.checkinStreak ?? 0} 天</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">今日签到</span>
                  <span className={`text-sm font-semibold ${todayChecked ? 'text-green-600' : 'text-gray-400'}`}>
                    {todayChecked ? '已签到' : '未签到'}
                  </span>
                </div>
              </div>

              {/* 签到按钮 */}
              <div className="mt-4">
                <CheckinButton
                  userId={userId}
                  lastCheckinDate={user?.lastCheckinDate}
                  checkinStreak={user?.checkinStreak || 0}
                />
              </div>
            </div>

            {/* 快捷入口 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-[#11142D] mb-4">快捷入口</h3>
              <nav className="space-y-2">
                <Link 
                  href="/tools" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F6F8FC] transition-colors group"
                >
                  <Globe className="w-5 h-5 text-gray-400 group-hover:text-[#6C5DD3] transition-colors" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#6C5DD3] transition-colors">我的工具</span>
                </Link>
                <Link 
                  href="/checklists" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F6F8FC] transition-colors group"
                >
                  <CheckCircle className="w-5 h-5 text-gray-400 group-hover:text-[#6C5DD3] transition-colors" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#6C5DD3] transition-colors">我的清单</span>
                </Link>
                <Link 
                  href="/workspace/favorites" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F6F8FC] transition-colors group"
                >
                  <Bookmark className="w-5 h-5 text-gray-400 group-hover:text-[#6C5DD3] transition-colors" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#6C5DD3] transition-colors">我的收藏</span>
                </Link>
                <Link 
                  href="/workspace/settings" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F6F8FC] transition-colors group"
                >
                  <Settings className="w-5 h-5 text-gray-400 group-hover:text-[#6C5DD3] transition-colors" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#6C5DD3] transition-colors">账号设置</span>
                </Link>
              </nav>
            </div>
          </aside>

          {/* ===== 中栏：主内容区 ===== */}
          <main className="space-y-6">
            {/* 欢迎区 */}
            <div className="bg-gradient-to-br from-[#6C5DD3] via-[#5b4fc4] to-[#3F8CFF] rounded-2xl p-8 text-white shadow-lg">
              <h1 className="text-3xl font-bold mb-2">欢迎回来，{displayName} 👋</h1>
              <p className="text-white/90 mb-6">今天也要加油哦！</p>
              
              {/* 核心数据卡片 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm text-white/80">单据</span>
                  </div>
                  <p className="text-2xl font-bold">{docCount}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5" />
                    <span className="text-sm text-white/80">公司</span>
                  </div>
                  <p className="text-2xl font-bold">{companyCount}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5" />
                    <span className="text-sm text-white/80">勋章</span>
                  </div>
                  <p className="text-2xl font-bold">{badgeCount}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5" />
                    <span className="text-sm text-white/80">邀请</span>
                  </div>
                  <p className="text-2xl font-bold">{inviteCount}</p>
                </div>
              </div>
            </div>

            {/* 最近使用工具 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#11142D]">最近使用工具</h2>
                <Link href="/tools" className="text-sm text-[#6C5DD3] hover:text-[#5b4fc4] font-medium flex items-center gap-1">
                  查看全部 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <RecentTools userId={userId} />
            </div>

            {/* 进行中的清单 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#11142D]">进行中的清单</h2>
                <Link href="/checklists" className="text-sm text-[#6C5DD3] hover:text-[#5b4fc4] font-medium flex items-center gap-1">
                  查看全部 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">暂无进行中的清单</p>
                  <Link 
                    href="/checklists" 
                    className="inline-block mt-4 px-4 py-2 bg-[#6C5DD3] text-white rounded-lg text-sm font-medium hover:bg-[#5b4fc4] transition-colors"
                  >
                    浏览清单
                  </Link>
                </div>
              ) : (
                <TodayTasks initialTasks={tasks} />
              )}
            </div>

            {/* 常用工具快捷入口 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-[#11142D] mb-4">常用工具</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link 
                  href="/tools/postal-code" 
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-[#F6F8FC] transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C5DD3]/10 to-[#3F8CFF]/10 flex items-center justify-center group-hover:from-[#6C5DD3]/20 group-hover:to-[#3F8CFF]/20 transition-colors">
                    <Globe className="w-6 h-6 text-[#6C5DD3]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">邮编查询</span>
                </Link>
                <Link 
                  href="/tools/hs-code" 
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-[#F6F8FC] transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C5DD3]/10 to-[#3F8CFF]/10 flex items-center justify-center group-hover:from-[#6C5DD3]/20 group-hover:to-[#3F8CFF]/20 transition-colors">
                    <BookOpen className="w-6 h-6 text-[#6C5DD3]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">HS编码</span>
                </Link>
                <Link 
                  href="/tools/exchange-rate" 
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-[#F6F8FC] transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C5DD3]/10 to-[#3F8CFF]/10 flex items-center justify-center group-hover:from-[#6C5DD3]/20 group-hover:to-[#3F8CFF]/20 transition-colors">
                    <TrendingUp className="w-6 h-6 text-[#6C5DD3]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">汇率换算</span>
                </Link>
                <Link 
                  href="/tools/shipping-calculator" 
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-[#F6F8FC] transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C5DD3]/10 to-[#3F8CFF]/10 flex items-center justify-center group-hover:from-[#6C5DD3]/20 group-hover:to-[#3F8CFF]/20 transition-colors">
                    <Package className="w-6 h-6 text-[#6C5DD3]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">运费计算</span>
                </Link>
              </div>
            </div>
          </main>

          {/* ===== 右栏：通知 + 勋章 + 推荐 ===== */}
          <aside className="space-y-6">
            {/* 通知/提醒 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#11142D]">通知提醒</h3>
                {unreadNotifs > 0 && (
                  <span className="px-2 py-1 bg-[#FF754C] text-white text-xs font-semibold rounded-full">
                    {unreadNotifs}
                  </span>
                )}
              </div>
              {unreadNotifs === 0 ? (
                <div className="text-center py-6">
                  <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">暂无新通知</p>
                </div>
              ) : (
                <Link 
                  href="/workspace/notifications" 
                  className="block w-full text-center py-3 bg-[#F6F8FC] text-[#6C5DD3] rounded-xl text-sm font-medium hover:bg-[#6C5DD3]/10 transition-colors"
                >
                  查看 {unreadNotifs} 条未读通知
                </Link>
              )}
            </div>

            {/* 勋章/成长路径 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#11142D]">成长路径</h3>
                <Link href="/workspace/member" className="text-xs text-[#6C5DD3] hover:text-[#5b4fc4] font-medium">
                  查看全部
                </Link>
              </div>
              <div className="text-center py-4">
                <Trophy className="w-12 h-12 text-[#FF754C] mx-auto mb-3" />
                <p className="text-2xl font-bold text-[#11142D] mb-1">{badgeCount}</p>
                <p className="text-sm text-gray-500 mb-4">已获勋章</p>
                {badgeCount === 0 ? (
                  <p className="text-xs text-gray-400">继续签到和使用工具来获取勋章吧！</p>
                ) : (
                  <Link 
                    href="/workspace/member" 
                    className="inline-block px-4 py-2 bg-[#6C5DD3] text-white rounded-lg text-sm font-medium hover:bg-[#5b4fc4] transition-colors"
                  >
                    查看勋章详情
                  </Link>
                )}
              </div>
            </div>

            {/* 推荐工具 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-[#11142D] mb-4">推荐工具</h3>
              <div className="space-y-3">
                <Link 
                  href="/tools/commercial-invoice" 
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F6F8FC] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6C5DD3]/10 to-[#3F8CFF]/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#6C5DD3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-[#6C5DD3] transition-colors">商业发票</p>
                    <p className="text-xs text-gray-500">快速生成专业发票</p>
                  </div>
                </Link>
                <Link 
                  href="/tools/container" 
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F6F8FC] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6C5DD3]/10 to-[#3F8CFF]/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-[#6C5DD3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-[#6C5DD3] transition-colors">集装箱计算</p>
                    <p className="text-xs text-gray-500">计算装柜方案</p>
                  </div>
                </Link>
                <Link 
                  href="/tools/template-studio" 
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F6F8FC] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF754C]/10 to-[#FF754C]/20 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-5 h-5 text-[#FF754C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-[#FF754C] transition-colors">模板设计器</p>
                    <p className="text-xs text-gray-500">自定义单据模板</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* 新手任务/下一步建议 */}
            <div className="bg-gradient-to-br from-[#FF754C] to-[#FF754C]/80 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-base font-bold">下一步建议</h3>
              </div>
              <div className="space-y-3">
                {!todayChecked && (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">完成今日签到，获取积分和成长值</p>
                  </div>
                )}
                {docCount === 0 && (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">创建第一份单据，体验工具功能</p>
                  </div>
                )}
                {companyCount === 0 && (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">添加公司资料，快速填充单据</p>
                  </div>
                )}
                {inviteCount === 0 && (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">邀请好友，获取会员天数</p>
                  </div>
                )}
                {todayChecked && docCount > 0 && companyCount > 0 && inviteCount > 0 && (
                  <p className="text-sm">继续保持，解锁更多勋章和权益！</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
