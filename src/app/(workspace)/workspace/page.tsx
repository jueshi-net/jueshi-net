import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";
import { 
  Heart, FileText, ExternalLink, Clock, RotateCcw, Building2, Bell, 
  ArrowUpRight, Sparkles, TrendingUp, DollarSign, Award, ChevronRight, 
  StickyNote, BarChart3, Globe, Briefcase, Megaphone, Package, Crown,
  Zap, Target, Gift, Star, CheckCircle2, Calendar
} from "lucide-react";
import DeleteDocButton from "@/components/workspace/DeleteDocButton";
import { TaskChainList } from "@/components/workspace/TaskChainList";
import CheckinButton from "@/components/user/CheckinButton";
import TodayTasks from "@/components/user/TodayTasks";
import RecentTools from "@/components/user/RecentTools";

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
  lv1: 'Lv.1 新手',
  lv2: 'Lv.2 进阶',
  lv3: 'Lv.3 精英',
  lv4: 'Lv.4 大师',
  lv5: 'Lv.5 传奇',
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
      } 
    }),
    prisma.userFavorite.findMany({ where: { userId, resourceType: "tool" }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.userCustomNav.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.documentHistory.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }).catch(() => []),
    prisma.userCompanyProfile.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }),
    prisma.userTask.findMany({ 
      where: { userId, status: "pending" }, 
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }], 
      take: 5 
    }).catch(() => []),
    prisma.userBadgeAward.count({ where: { userId } }),
    prisma.memo.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }).catch(() => []),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  const [userRes, favToolsRes, navLinksRes, docHistoryRes, companyProfilesRes, tasksRes, badgeCountRes, memosRes, unreadNotifsRes] = results;

  const user = userRes.status === "fulfilled" ? userRes.value : null;
  const favTools = favToolsRes.status === "fulfilled" ? favToolsRes.value : [];
  const navLinks = navLinksRes.status === "fulfilled" ? navLinksRes.value : [];
  const docs = docHistoryRes.status === "fulfilled" ? docHistoryRes.value : [];
  const profiles = companyProfilesRes.status === "fulfilled" ? companyProfilesRes.value : [];
  const tasks = tasksRes.status === "fulfilled" ? tasksRes.value : [];
  const badgeCount = badgeCountRes.status === "fulfilled" ? badgeCountRes.value : 0;
  const recentMemos = memosRes.status === "fulfilled" ? memosRes.value : [];
  const unreadNotifs = unreadNotifsRes.status === "fulfilled" ? unreadNotifsRes.value : 0;

  const memberLevel = user?.role === "管理员" ? "管理员" : user?.levelKey === "member" ? "会员" : "免费版用户";
  const displayName = user?.name?.split("@")[0] || user?.email?.split("@")[0] || "用户";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* A. 用户身份横幅 */}
      <section className="bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl font-bold">欢迎回来，{displayName} 👋</h1>
              {user?.role === "管理员" && (
                <span className="px-2 py-0.5 bg-violet-500/20 text-violet-100 text-xs rounded-full border border-violet-400/30">
                  管理员
                </span>
              )}
              {user?.memberUntil && new Date(user.memberUntil) > new Date() && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-100 text-xs rounded-full border border-amber-400/30">
                  会员
                </span>
              )}
            </div>
            <p className="text-sm text-teal-50 mb-3">{user?.email}</p>
            
            {/* 成长值进度 */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-300" />
                <span className="font-semibold">{user?.growthValue ?? 0}</span>
                <span className="text-teal-100">成长值</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-300" />
                <span className="font-semibold">{user?.points ?? 0}</span>
                <span className="text-teal-100">积分</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-300" />
                <span className="font-semibold">{badgeCount}</span>
                <span className="text-teal-100">勋章</span>
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
        
        {/* 快捷操作 */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
          <Link 
            href="/tools/documents" 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            新建单据
          </Link>
          <Link 
            href="/tools" 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            工具中心
          </Link>
          <Link 
            href="/workspace/company-profiles" 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" />
            公司资料
          </Link>
          <Link 
            href="/feedback" 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            提交反馈
          </Link>
        </div>
      </section>

      {/* B. 第一屏四个核心卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 今日待办 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold text-gray-900">今日待办</h2>
            </div>
            <Link href="/workspace/tasks" className="text-xs text-teal-600 hover:underline">
              全部 →
            </Link>
          </div>
          <TodayTasks initialTasks={tasks} />
        </div>

        {/* 最近使用工具 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-gray-900">最近使用</h2>
            </div>
            <Link href="/tools" className="text-xs text-teal-600 hover:underline">
              工具中心 →
            </Link>
          </div>
          <RecentTools userId={userId} />
        </div>

        {/* 最近单据 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-gray-900">最近单据</h2>
            </div>
            {docs.length > 0 && (
              <Link href="/workspace/documents" className="text-xs text-teal-600 hover:underline">
                全部 →
              </Link>
            )}
          </div>
          {docs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">还没有单据记录</p>
              <p className="text-xs text-gray-400 mb-3">使用单据工具填写后，点击"保存到工作台"即可存档</p>
              <Link 
                href="/tools?cat=documents" 
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs hover:bg-teal-700"
              >
                使用单据工具 <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-50">
                {docs.slice(0, 3).map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 hover:bg-gray-50/50 transition-colors">
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
            </div>
          )}
        </div>

        {/* 我的收藏 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-600" />
              <h2 className="text-sm font-bold text-gray-900">我的收藏</h2>
            </div>
            {(favTools.length > 0 || navLinks.length > 0) && (
              <Link href="/workspace/favorites" className="text-xs text-teal-600 hover:underline">
                管理 →
              </Link>
            )}
          </div>
          {(favTools.length === 0 && navLinks.length === 0) ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">还没有收藏任何工具</p>
              <p className="text-xs text-gray-400 mb-3">收藏常用工具后，它们会出现在工作台，方便下次快速打开</p>
              <Link 
                href="/tools" 
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs hover:bg-teal-700"
              >
                去工具中心 <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-2 gap-2 p-3">
                {favTools.slice(0, 4).map(fav => (
                  <Link 
                    key={fav.id} 
                    href={`/tools/${fav.resourceUrl.replace('/tools/', '')}`} 
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-base">🔧</span>
                    <span className="text-xs font-medium text-gray-900 truncate group-hover:text-teal-700">
                      {fav.title}
                    </span>
                  </Link>
                ))}
                {navLinks.slice(0, 4 - favTools.length).map(link => (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-base">🌐</span>
                    <span className="text-xs font-medium text-gray-900 truncate group-hover:text-teal-700">
                      {link.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* C. 第二屏工作资产 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 公司资料 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-gray-900">公司资料</h2>
            </div>
            <Link href="/workspace/company-profiles" className="text-xs text-teal-600 hover:underline">
              管理 →
            </Link>
          </div>
          {profiles.length === 0 ? (
            <Link 
              href="/workspace/company-profiles" 
              className="block bg-white rounded-xl border border-gray-100 p-6 text-center hover:border-teal-200 transition-all"
            >
              <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">还没有公司资料</p>
              <p className="text-xs text-gray-400">创建公司资料，快速生成单据</p>
            </Link>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{profiles.length} 个公司资料</span>
                <Link href="/workspace/company-profiles" className="text-xs text-teal-600 hover:underline">
                  查看
                </Link>
              </div>
              {profiles[0] && (
                <div className="text-xs text-gray-500 truncate">
                  默认: {profiles[0].companyName || profiles[0].companyNameEn}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 备忘录 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-gray-900">备忘录</h2>
            </div>
            <Link href="/workspace/memos" className="text-xs text-teal-600 hover:underline">
              全部 →
            </Link>
          </div>
          {recentMemos.length === 0 ? (
            <Link 
              href="/workspace/memos" 
              className="block bg-white rounded-xl border border-gray-100 p-6 text-center hover:border-teal-200 transition-all"
            >
              <StickyNote className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">还没有备忘录</p>
              <p className="text-xs text-gray-400">记录重要事项和灵感</p>
            </Link>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
              {recentMemos.slice(0, 2).map(memo => (
                <Link 
                  key={memo.id} 
                  href="/workspace/memos" 
                  className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-xs font-medium text-gray-900 truncate">{memo.title}</div>
                  <div className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                    {memo.content || "无内容"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 通知中心 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-600" />
              <h2 className="text-sm font-bold text-gray-900">通知中心</h2>
            </div>
            {unreadNotifs > 0 && (
              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                {unreadNotifs}
              </span>
            )}
          </div>
          <Link 
            href="/workspace/notifications" 
            className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-teal-200 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {unreadNotifs > 0 ? `${unreadNotifs} 条未读通知` : "暂无新通知"}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </Link>
        </div>
      </div>

      {/* 跨境发货任务 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-gray-900">跨境发货任务</h2>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <TaskChainList />
        </div>
      </section>

      {/* 快速入口 */}
      <section>
        <h2 className="text-sm font-bold text-gray-900 mb-3">快速入口</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "去工具中心", href: "/tools", emoji: "🔧" },
            { label: "创建公司资料", href: "/workspace/company-profiles", emoji: "🏢" },
            { label: "查看我的单据", href: "/workspace/documents", emoji: "📄" },
            { label: "查看会员权益", href: "/workspace/member", emoji: "👑" },
          ].map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl p-3 hover:border-teal-200 hover:shadow-sm transition-all"
            >
              <span className="text-lg">{link.emoji}</span>
              <span className="text-xs font-medium text-gray-700">{link.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
