import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";
import { Heart, FileText, ExternalLink, Clock, RotateCcw, Building2 } from "lucide-react";
import DeleteDocButton from "@/components/workspace/DeleteDocButton";

export const metadata: Metadata = {
  title: "我的工作台 — 海外百宝箱",
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

  const [favorites, docHistory, companyProfiles, membershipData, taskSummary] = await Promise.allSettled([
    prisma.userFavorite.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.documentHistory.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }).catch(() => []),
    prisma.userCompanyProfile.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }),
    prisma.user.findUnique({ where: { id: userId }, select: { role: true, memberUntil: true, growthValue: true, levelKey: true } }),
    prisma.growthLog.count({ where: { userId } }),
  ]);

  const favs = favorites.status === "fulfilled" ? favorites.value : [];
  const docs = docHistory.status === "fulfilled" ? docHistory.value : [];
  const profiles = companyProfiles.status === "fulfilled" ? companyProfiles.value : [];
  const user = membershipData.status === "fulfilled" ? membershipData.value : null;
  const taskCount = taskSummary.status === "fulfilled" ? taskSummary.value : 0;

  const memberLevel = user?.levelKey === "member" ? "会员" : user?.levelKey === "admin" ? "管理员" : "免费版用户";

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
          <div className="text-2xl font-bold text-gray-900">{favs.length}</div>
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

      {/* Favorites */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-gray-900">我的资源夹</h2>
          </div>
          {favs.length > 0 && <Link href="/workspace/favorites" className="text-xs text-teal-600 hover:underline">查看全部 →</Link>}
        </div>

        {favs.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
            <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-1">还没有收藏任何资源</p>
            <p className="text-xs text-gray-400 mb-3">浏览工具中心，点击收藏按钮即可添加到资源夹</p>
            <Link href="/tools" className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs hover:bg-teal-700">
              去发现工具 <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favs.map(fav => (
              <Link key={fav.id} href={fav.resourceUrl} className="bg-white border border-gray-100 rounded-xl p-4 hover:border-teal-200 hover:shadow-sm transition-all group">
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0 mt-0.5">{fav.resourceType === "topic" ? "📚" : fav.resourceType === "article" ? "📝" : "🔧"}</span>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-gray-900 group-hover:text-teal-700 truncate">{fav.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{fav.resourceType} · {new Date(fav.createdAt).toLocaleDateString("zh-CN")}</div>
                  </div>
                </div>
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
    </div>
  );
}
