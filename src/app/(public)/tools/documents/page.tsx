import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, Crown, AlertTriangle, Clock } from "lucide-react";
import { Metadata } from "next";
import { getCoreDocuments, getSecondTierDocuments } from "@/lib/documents/document-types";
import { getDrafts } from "@/lib/documents/storage";
import { AdSlot } from "@/components/ad-slot";

export const metadata: Metadata = {
  title: "外贸/国际物流通用单据生成器 — 海外百宝箱",
  description: "形式发票、商业发票、装箱单、销售合同、订舱委托书等常用单据模板，在线填写，自动排版，支持 PDF / Word / 图片导出。",
};

const membershipFeatures = [
  { feature: "在线填写与实时预览", guest: true, user: true, member: true },
  { feature: "导出 PDF / PNG", guest: true, user: true, member: true },
  { feature: "本地保存草稿（3份）", guest: true, user: false, member: false },
  { feature: "本地保存草稿（10份）", guest: false, user: true, member: false },
  { feature: "上传公司 Logo", guest: false, user: false, member: true },
  { feature: "多套公司信息模板", guest: false, user: false, member: true },
  { feature: "多种版式风格", guest: false, user: false, member: true },
  { feature: "去除页脚品牌标识", guest: false, user: false, member: true },
  { feature: "导出 Word (.docx)", guest: false, user: false, member: true },
  { feature: "云端保存草稿", guest: false, user: false, member: true },
];

export default function DocumentsHubPage() {
  const coreDocs = getCoreDocuments();
  const secondTierDocs = getSecondTierDocuments();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back link */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">外贸/国际物流通用单据生成器</h1>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto mb-8">
            形式发票、商业发票、装箱单、销售合同、订舱委托书等常用模板，<br />
            在线填写，自动排版，支持 PDF / Word / 图片导出。
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/tools/documents/proforma-invoice"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-700 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              开始生成单据
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#core-docs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              查看全部模板
            </a>
            <Link
              href="/tools/documents/drafts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              <Clock className="w-5 h-5" />
              我的草稿
            </Link>
          </div>
        </div>
      </div>

      {/* Ad Slot: documents-home-top */}
      <div className="max-w-6xl mx-auto px-4 -mt-4 mb-8">
        <AdSlot placement="documents-home-top" variant="banner" />
      </div>

      {/* A. 核心基础单据 */}
      <div id="core-docs" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">核心基础单据</h2>
        <p className="text-gray-500 mb-8">15 套常用单据模板，在线填写，即时导出</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {coreDocs.map((doc, idx) => (
            <Link
              key={doc.type}
              href={`/tools/documents/${doc.type}`}
              className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all relative"
            >
              <div className="text-3xl mb-3">{doc.icon}</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                {doc.titleZh}
              </h3>
              <p className="text-xs text-gray-400 mb-2">{doc.titleEn}</p>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{doc.description}</p>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${doc.isFree ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  {doc.isFree ? "免费" : "会员"}
                </span>
                <span className="text-xs text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  生成 <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* B. 第二梯队 */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">即将上线</h2>
        <p className="text-gray-500 mb-8">更多单据模板正在准备中</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {secondTierDocs.map((doc) => (
            <div
              key={doc.type}
              className="bg-gray-50 rounded-xl border border-gray-100 p-5 opacity-60"
            >
              <div className="text-3xl mb-3">{doc.icon}</div>
              <h3 className="font-semibold text-gray-700 mb-1">{doc.titleZh}</h3>
              <p className="text-xs text-gray-400 mb-2">{doc.titleEn}</p>
              <span className="inline-flex items-center px-2 py-0.5 bg-gray-200 text-gray-500 rounded text-xs">
                模板准备中
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* C. 会员能力说明 */}
      <div className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm mb-4">
              <Crown className="w-4 h-4" />
              会员专属能力
            </div>
            <h2 className="text-2xl font-bold text-gray-900">升级会员，解锁更多功能</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full max-w-3xl mx-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">功能</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500">游客</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500">注册用户</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-amber-600 flex items-center justify-center gap-1">
                    <Crown className="w-3 h-3" /> 会员
                  </th>
                </tr>
              </thead>
              <tbody>
                {membershipFeatures.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-700">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-sm">{row.guest ? "✅" : "—"}</td>
                    <td className="py-3 px-4 text-center text-sm">{row.user ? "✅" : "—"}</td>
                    <td className="py-3 px-4 text-center text-sm">{row.member ? "✅" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">免责声明</p>
              <p className="mt-1">
                本工具提供的单据模板为通用参考格式，仅用于资料整理、内部流转或业务沟通。
                不同国家、海关、银行、船公司、报关行或物流服务商可能有不同要求，
                正式用途请以相关机构要求为准。本站不对单据的合规性作出任何保证。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
