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
  Home, Mail, RefreshCw, MapPin, Truck, Receipt, Container,
  ListChecks, Layers, Landmark, CreditCard, ShoppingBag,
  Coffee, GraduationCap, Menu, X
} from "lucide-react";
import DeleteDocButton from "@/components/workspace/DeleteDocButton";
import { TaskChainList } from "@/components/workspace/TaskChainList";
import CheckinButton from "@/components/user/CheckinButton";
import TodayTasks from "@/components/user/TodayTasks";
import RecentTools from "@/components/user/RecentTools";
import { SectionCard } from "@/components/saas/SectionCard";
import { MetricCard } from "@/components/saas/MetricCard";
import { ActionCard } from "@/components/design-system/ActionCard";
import WorkspaceRightRail from "@/components/workspace/WorkspaceRightRail";
import WorkspacePageFrame from "@/components/workspace/WorkspacePageFrame";

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
    <WorkspacePageFrame
      rightRail={
        <WorkspaceRightRail
          unreadNotifs={unreadNotifs}
          badgeCount={badgeCount}
          recentMemos={recentMemos}
          userId={userId}
        />
      }
    >
      <div className="space-y-5 pb-4">
      {/* Welcome Section */}
        <section className="bg-gradient-to-br from-[#6C5DD3] via-[#5b4fc4] to-[#3F8CFF] rounded-2xl p-5 md:p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold mb-1">
                欢迎回来，{displayName} 👋
              </h2>
              <p className="text-white/80 text-sm mb-3">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-md px-2.5 py-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-300" />
                  <span className="font-semibold text-xs">{levelLabel}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-md px-2.5 py-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="font-semibold text-xs">{user?.growthValue ?? 0}</span>
                  <span className="text-white/70 text-xs">成长值</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-md px-2.5 py-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span className="font-semibold text-xs">{user?.points ?? 0}</span>
                  <span className="text-white/70 text-xs">积分</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-md px-2.5 py-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-200" />
                  <span className="font-semibold text-xs">
                    {todayChecked ? "已签到" : "未签到"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <CheckinButton
                userId={userId}
                lastCheckinDate={user?.lastCheckinDate}
                checkinStreak={user?.checkinStreak || 0}
              />
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="text-[15px] font-semibold text-[#11142D] mb-3">快速操作</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ActionCard
              title="今日签到"
              description={todayChecked ? "已完成" : "签到获得积分"}
              icon={<Calendar className="w-5 h-5" />}
              href="/workspace/member"
              badge={todayChecked ? "已完成" : "待完成"}
            />
            <ActionCard
              title="新建单据"
              description="快速创建发票"
              icon={<FileText className="w-5 h-5" />}
              href="/tools/documents"
            />
            <ActionCard
              title="公司资料"
              description="管理公司信息"
              icon={<Building2 className="w-5 h-5" />}
              href="/workspace/company-profiles"
            />
            <ActionCard
              title="升级会员"
              description="解锁更多功能"
              icon={<Crown className="w-5 h-5" />}
              href="/workspace/member"
              badge={!isMember ? "推荐" : undefined}
            />
          </div>
        </section>

        {/* Core Metrics */}
        <section>
          <h3 className="text-[15px] font-semibold text-[#11142D] mb-3">核心数据</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Link href="/workspace/documents">
              <MetricCard
                label="我的单据"
                value={docCount}
                icon={<FileText className="w-4 h-4" />}
              />
            </Link>
            <Link href="/workspace/company-profiles">
              <MetricCard
                label="公司资料"
                value={companyCount}
                icon={<Building2 className="w-4 h-4" />}
              />
            </Link>
            <Link href="/workspace/member">
              <MetricCard
                label="成长值"
                value={user?.growthValue ?? 0}
                icon={<TrendingUp className="w-4 h-4" />}
              />
            </Link>
            <Link href="/workspace/member">
              <MetricCard
                label="勋章"
                value={badgeCount}
                icon={<Award className="w-4 h-4" />}
              />
            </Link>
            <Link href="/workspace/invites">
              <MetricCard
                label="邀请奖励"
                value={inviteCount}
                icon={<Gift className="w-4 h-4" />}
              />
            </Link>
          </div>
        </section>

        {/* Growth Operations */}
        <section>
          <h3 className="text-[15px] font-semibold text-[#11142D] mb-3">成长运营</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <SectionCard title="今日签到" subtitle={`连续 ${user?.checkinStreak || 0} 天`}>
              <div className="text-center py-3">
                <CheckinButton
                  userId={userId}
                  lastCheckinDate={user?.lastCheckinDate}
                  checkinStreak={user?.checkinStreak || 0}
                />
                <p className="text-[11px] text-[#808191] mt-2">每日签到可获得 5 积分 + 2 成长值</p>
              </div>
            </SectionCard>

            <SectionCard title="成长等级" subtitle={levelLabel}>
              <div className="space-y-2 py-1">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#808191]">当前等级</span>
                  <span className="font-semibold text-[#6C5DD3]">{levelLabel}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(((user?.growthValue ?? 0) % 100), 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#808191]">
                  距离下一级还需 {100 - ((user?.growthValue ?? 0) % 100)} 成长值
                </p>
              </div>
            </SectionCard>

            <SectionCard
              title="我的勋章"
              action={<Link href="/workspace/member" className="text-[11px] text-[#6C5DD3] hover:underline font-medium">查看全部</Link>}
            >
              <div className="flex items-center justify-center py-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-7 h-7 text-amber-500" />
                  <div>
                    <p className="text-xl font-bold text-[#11142D]">{badgeCount}</p>
                    <p className="text-[11px] text-[#808191]">已获勋章</p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="今日任务"
              action={<Link href="/workspace/tasks" className="text-[11px] text-[#6C5DD3] hover:underline font-medium">全部</Link>}
            >
              <TodayTasks initialTasks={tasks} />
            </SectionCard>
          </div>
        </section>

        {/* Recent Work */}
        <section>
          <h3 className="text-[15px] font-semibold text-[#11142D] mb-3">最近工作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SectionCard
              title="最近单据"
              action={
                docs.length > 0 ? (
                  <Link href="/workspace/documents" className="text-xs text-[#6C5DD3] hover:underline flex items-center gap-1">
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
                    className="inline-flex items-center gap-1 px-4 py-2 bg-[#6C5DD3] text-white rounded-lg text-xs hover:bg-[#5b4fc4]"
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
                        className="flex-shrink-0 text-xs text-[#6C5DD3] hover:text-[#5b4fc4] hover:underline"
                      >
                        查看
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="公司资料"
              action={
                <Link href="/workspace/company-profiles" className="text-xs text-[#6C5DD3] hover:underline flex items-center gap-1">
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

            <SectionCard
              title="常用工具"
              action={
                <Link href="/tools" className="text-xs text-[#6C5DD3] hover:underline flex items-center gap-1">
                  工具中心 <ArrowRight className="w-3 h-3" />
                </Link>
              }
            >
              <RecentTools userId={userId} />
            </SectionCard>

            <SectionCard
              title="商品资料库"
              action={
                <Link href="/workspace/products" className="text-xs text-[#6C5DD3] hover:underline flex items-center gap-1">
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
                  className="inline-flex items-center gap-1 px-4 py-2 bg-[#6C5DD3] text-white rounded-lg text-xs hover:bg-[#5b4fc4]"
                >
                  <Plus className="w-3 h-3" /> 添加商品
                </Link>
              </div>
            </SectionCard>
          </div>
        </section>
      </div>
    </WorkspacePageFrame>
  );
}
