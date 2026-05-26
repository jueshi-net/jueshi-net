import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";
import { Heart, FileText, ExternalLink, Clock, LayoutDashboard, RotateCcw, Trash2 } from "lucide-react";
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

  const favorites = await prisma.userFavorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const docHistory = await prisma.documentHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  }).catch(() => []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="w-6 h-6 text-teal-600" />
            <h1 className="text-2xl font-bold text-gray-900">我的工作台</h1>
          </div>
          <p className="text-gray-500">欢迎回来，{session.user.email || "用户"}。管理你的收藏与单据历史。</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* 我的资源夹 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-lg font-bold text-gray-900">我的资源夹</h2>
            <span className="text-xs text-gray-400">({favorites.length} 项)</span>
          </div>

          {favorites.length === 0 ? (
            <div className="bg-white border rounded-xl p-10 text-center">
              <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">还没有收藏任何资源</p>
              <p className="text-sm text-gray-400 mb-4">浏览工具中心和专题库，点击红心图标即可收藏</p>
              <Link href="/tools" className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">
                去发现工具 <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {favorites.map(fav => (
                <Link key={fav.id} href={fav.resourceUrl}
                  className="bg-white border rounded-xl p-4 hover:border-teal-200 hover:shadow-sm transition-all group">
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">
                      {fav.resourceType === "topic" ? "📚" : fav.resourceType === "article" ? "📝" : "🔧"}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-gray-900 group-hover:text-teal-700 truncate">
                        {fav.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {fav.resourceType} · {new Date(fav.createdAt).toLocaleDateString("zh-CN")}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 单据历史台 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">单据历史台</h2>
            <span className="text-xs text-gray-400">({docHistory.length} 条)</span>
          </div>

          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">单据号</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">单据类型</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 hidden sm:table-cell">生成时间</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {docHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>暂无单据记录</p>
                        <p className="text-xs mt-1">使用单据工具填写后，点击"保存到工作台"即可存档</p>
                      </td>
                    </tr>
                  ) : (
                    docHistory.map(doc => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">{doc.documentNo || "—"}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                            {docTypeLabels[doc.documentType] || doc.documentType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs">
                          {new Date(doc.createdAt).toLocaleString("zh-CN")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/tools/documents/${doc.documentType}?historyId=${doc.id}`}
                              className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 hover:underline"
                            >
                              <RotateCcw className="w-3 h-3" /> 复用
                            </Link>
                            <DeleteDocButton docId={doc.id} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
