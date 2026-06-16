import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";
import { Heart, FileText, ExternalLink, Clock, RotateCcw, Building2, Bell, ArrowUpRight, Sparkles, TrendingUp, DollarSign, Award, ChevronRight, StickyNote, BarChart3, Globe, Briefcase, Megaphone, Package } from "lucide-react";
import DeleteDocButton from "@/components/workspace/DeleteDocButton";
import { TaskChainList } from "@/components/workspace/TaskChainList";

export const metadata: Metadata = {
  title: "我的工作台 — 绝世百宝箱",
  description: "管理你的收藏工具、单据历史和个性化设置",
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

export default async function WorkspacePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/workspace");
  }

  const userId = session.user.id;

  const results = await Promise.allSettled([
    prisma.userFavorite.findMany({ where: { userId, resourceType: "tool" }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.userCustomNav.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.documentHistory.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }).catch(() => []),
    prisma.userCompanyProfile.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }),
    prisma.user.findUnique({ where: { id: userId }, select: { role: true, memberUntil: true, growthValue: true, levelKey: true, points: true } }),
    prisma.growthLog.count({ where: { userId } }),
    prisma.userBadgeAward.count({ where: { userId } }),
    prisma.memo.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }).catch(() => []),
  ]);

  const [favToolsRes, navLinksRes, docHistoryRes, companyProfilesRes, membershipDataRes, taskSummaryRes, badgeCountRes, memosRes] = results;

  const favTools = favToolsRes.status === "fulfilled" ? favToolsRes.value : [];
  const navLinks = navLinksRes.status === "fulfilled" ? navLinksRes.value : [];
  const docs = docHistoryRes.status === "fulfilled" ? docHistoryRes.value : [];
  const profiles = companyProfilesRes.status === "fulfilled" ? companyProfilesRes.value : [];
  const user = membershipDataRes.status === "fulfilled" ? membershipDataRes.value : null;
  const taskCount = taskSummaryRes.status === "fulfilled" ? taskSummaryRes.value : 0;
  const badgeCount = badgeCountRes.status === "fulfilled" ? badgeCountRes.value : 0;
  const recentMemos = memosRes.status === "fulfilled" ? memosRes.value : [];

  const memberLevel = user?.role === "管理员" ? "管理员" : user?.levelKey === "member" ? "会员" : "免费版用户";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">欢迎回来，{session.user.name?.split("@")[0] || session.user.email?.split("@")[0] || "用户"} 👋</h1>
          <p className="text-sm text-gray-500 mt-1">{session.user.email} · {memberLevel}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          {user?.memberUntil && (
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">会员至 {new Date(user.memberUntil).toLocaleDateString("zh-CN")}</span>
          )}
          {user?.growthValue != null && (
            <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full">成长值 {user.growthValue}</span>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/workspace/documents" className="bg-white rounded-xl border border-gray-100 p-4 hover:border-teal-200 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-500">我的单据</span></div>
          <div className="text-2xl font-bold text-gray-900">{docs.length}</div>
        </Link>
        <Link href="/workspace/favorites" className="bg-white rounded-xl border border-gray-100 p-4 hover:border-teal-200 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-2"><Heart className="w-4 h-4 text-red-500" /><span className="text-xs text-gray-500">我的收藏</span></div>
          <div className="text-2xl font-bold text-gray-900">{favTools.length + navLinks.length}</div>
        </Link>
        <Link href="/workspace/company-profiles" className="bg-white rounded-xl border border-gray-100 p-4 hover:border-teal-200 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-2"><Building2 className="w-4 h-4 text-purple-500" /><span className="text-xs text-gray-500">公司资料</span></div>
          <div className="text-2xl font-bold text-gray-900">{profiles.length}</div>
        </Link>
        <Link href="/workspace/tasks" className="bg-white rounded-xl border border-gray-100 p-4 hover:border-teal-200 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-amber-500" /><span className="text-xs text-gray-500">待办任务</span></div>
          <div className="text-2xl font-bold text-gray-900">{taskCount > 0 ? taskCount : "—"}</div>
        </Link>
      </div>

      {/* 我的成长卡片 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            <h2 className="text-sm font-bold text-gray-900">我的成长</h2>
          </div>
          <Link href="/workspace/member" className="text-xs text-teal-600 hover:underline">查看详情 →</Link>
        </div>
        <Link href="/workspace/member" className="block bg-gradient-to-r from-purple-50 to-teal-50 border border-purple-100 rounded-xl p-4 hover:shadow-sm transition-all">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500">当前等级</div>
              <div className="text-sm font-bold text-gray-900 mt-1">{user?.levelKey === 'lv1' ? 'Lv.1 新手' : user?.levelKey === 'lv2' ? 'Lv.2 进阶' : user?.levelKey === 'lv3' ? 'Lv.3 精英' : user?.levelKey === 'lv4' ? 'Lv.4 大师' : user?.levelKey === 'lv5' ? 'Lv.5 传奇' : 'Lv.1 新手'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">成长值</div>
              <div className="text-sm font-bold text-gray-900 mt-1">{user?.growthValue ?? 0}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">积分</div>
              <div className="text-sm font-bold text-gray-900 mt-1">{user?.points ?? 0}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">勋章</div>
              <div className="text-sm font-bold text-gray-900 mt-1">{badgeCount} 枚</div>
            </div>
          </div>
        </Link>
      </section>

      {/* 常用工具 / 常用网址 */}
      {(favTools.length > 0 || navLinks.length > 0) && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-500" />
              <h2 className="text-sm font-bold text-gray-900">常用工具 / 网址</h2>
            </div>
            <Link href="/workspace/favorites" className="text-xs text-teal-600 hover:underline">管理 →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favTools.map(fav => (
              <Link key={fav.id} href={`/tools/${fav.resourceUrl.replace('/tools/', '')}`} className="bg-white border border-gray-100 rounded-xl p-3 hover:border-teal-200 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-3">
                  <span className="text-base shrink-0">🔧</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate group-hover:text-teal-700">{fav.title}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">工具</div>
                  </div>
                </div>
              </Link>
            ))}
            {navLinks.map(link => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="bg-white border border-gray-100 rounded-xl p-3 hover:border-teal-200 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-3">
                  <span className="text-base shrink-0">🌐</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate group-hover:text-teal-700">{link.title}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">网址</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Favorites (original placeholder) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-gray-900">我的资源夹</h2>
          </div>
          <Link href="/workspace/favorites" className="text-xs text-teal-600 hover:underline">查看全部 →</Link>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
           <p className="text-xs text-gray-400">前往 <Link href="/workspace/favorites" className="text-teal-600 hover:underline">我的收藏</Link> 管理全部收藏</p>
        </div>
      </section>

      {/* 最近备忘 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-gray-900">最近备忘</h2>
          </div>
          <Link href="/workspace/memos" className="text-xs text-teal-600 hover:underline">全部备忘 →</Link>
        </div>
        {recentMemos.length === 0 ? (
          <Link href="/workspace/memos" className="block bg-white border border-gray-100 rounded-xl p-6 text-center hover:border-teal-200 transition-all">
            <StickyNote className="w-6 h-6 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-1">暂无备忘录</p>
            <p className="text-xs text-gray-400">点击创建你的第一条备忘</p>
          </Link>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3">
            {recentMemos.map(memo => (
              <Link key={memo.id} href="/workspace/memos" className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-sm transition-all">
                <div className="text-xs font-medium text-gray-900 truncate mb-1">{memo.title}</div>
                <div className="text-[10px] text-gray-400 line-clamp-2">{memo.content || "无内容"}</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Document History */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-gray-900">单据历史台</h2>
          </div>
          {docs.length > 0 && <Link href="/workspace/documents" className="text-xs text-teal-600 hover:underline">查看全部 →</Link>}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          {docs.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">暂无单据记录</p>
              <p className="text-xs text-gray-400 mb-3">使用单据工具填写后，点击"保存到工作台"即可存档</p>
              <Link href="/tools?cat=documents" className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs hover:bg-teal-700">
                使用单据工具 <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs">单据号</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs">类型</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs hidden sm:table-cell">时间</th>
                    <th className="px-4 py-2.5 text-right font-medium text-gray-500 text-xs">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {docs.map(doc => (
                    <tr key={doc.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-700">{doc.documentNo || "—"}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                          {docTypeLabels[doc.documentType] || doc.documentType}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 hidden sm:table-cell text-xs">{new Date(doc.createdAt).toLocaleDateString("zh-CN")}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/tools/documents/${doc.documentType}?historyId=${doc.id}`} className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 hover:underline">
                            <RotateCcw className="w-3 h-3" /> 复用
                          </Link>
                          <DeleteDocButton docId={doc.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Task Chain Drafts */}
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

      {/* Quick links */}
      <section>
        <h2 className="text-sm font-bold text-gray-900 mb-3">快速入口</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "去工具中心", href: "/tools", emoji: "🔧" },
            { label: "创建公司资料", href: "/workspace/company-profiles", emoji: "🏢" },
            { label: "查看我的单据", href: "/workspace/documents", emoji: "📄" },
            { label: "查看会员权益", href: "/workspace/member", emoji: "👑" },
          ].map(link => (
            <Link key={link.href} href={link.href} className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl p-3 hover:border-teal-200 hover:shadow-sm transition-all">
              <span className="text-lg">{link.emoji}</span>
              <span className="text-xs font-medium text-gray-700">{link.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 更多服务 / 未来能力入口 */}
      <section>
        <h2 className="text-sm font-bold text-gray-900 mb-3">更多服务</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { icon: Bell, label: "通知中心", href: "/workspace/notifications", status: "ready" as const },
            { icon: TrendingUp, label: "常用工具", href: "/workspace/favorites", status: "ready" as const },
            { icon: StickyNote, label: "备忘录", href: "/workspace/memos", status: "ready" as const },
            { icon: Sparkles, label: "任务链", status: "coming-soon" as const },
            { icon: DollarSign, label: "汇率关注", status: "coming-soon" as const },
          ].map(item => (
            item.status === "ready" ? (
              <Link key={item.label} href={item.href} className="flex items-center gap-2 bg-gradient-to-br from-teal-50 to-white border border-teal-100 rounded-xl p-3 hover:shadow-sm transition-all group">
                <item.icon className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-medium text-teal-700">{item.label}</span>
                <ChevronRight className="w-3 h-3 text-teal-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <div key={item.label} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3 opacity-60">
                <item.icon className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">{item.label}</span>
                <span className="text-[10px] text-gray-400 ml-auto">规划中</span>
              </div>
            )
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Briefcase, label: "黄页信用" },
            { icon: Megaphone, label: "广告合作" },
            { icon: Award, label: "等级与勋章" },
            { icon: BarChart3, label: "落地页运营" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 bg-gray-50/50 border border-gray-100 rounded-xl p-3 opacity-50">
              <item.icon className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">{item.label}</span>
              <span className="text-[10px] text-gray-400 ml-auto">规划中</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
