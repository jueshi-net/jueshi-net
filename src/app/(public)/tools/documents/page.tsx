import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, Crown, AlertTriangle, Clock } from "lucide-react";
import { Metadata } from "next";
import { getCoreDocuments, getSecondTierDocuments } from "@/lib/documents/document-types";
import { AdSlot } from "@/components/ad-slot";
import { Breadcrumb } from "@/components/breadcrumb";
import { FAQSection } from "@/components/faq-section";
import RecentlyUsedWidget from "@/components/recently-used-docs";
import DocumentGrid from "@/components/document-grid";

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

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <Breadcrumb />
      </div>

      {/* Ad Slot: documents-home-top */}
      <div className="max-w-6xl mx-auto px-4 -mt-4 mb-8">
        <AdSlot placement="documents-home-top" variant="banner" />
      </div>

      {/* Recently used widget */}
      <RecentlyUsedWidget />

      {/* Document Grid with Search & Filter */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <DocumentGrid coreDocs={coreDocs} secondTierDocs={secondTierDocs} />
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

      {/* Label-maker CTA */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <Link href="/tools/label-maker" className="block bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">📦 需要生成箱唛/面单？</h3>
              <p className="text-blue-100">外箱唛头、仓库标签、集运入库贴、合箱标签、寄件信息贴纸，一站式生成</p>
            </div>
            <div className="text-3xl">→</div>
          </div>
        </Link>
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

      {/* FAQ */}
      <FAQSection title="单据中心常见问题" items={[
        {
          question: "这些单据模板可以用于正式报关/银行议付吗？",
          answer: "本工具提供的是通用参考模板，适合资料整理、内部流转和业务沟通。正式报关、银行信用证议付等场景对单据格式有严格要求，请以相关机构的具体要求为准，或咨询专业报关行/银行。",
        },
        {
          question: "草稿会保存多久？",
          answer: "游客可保存3份草稿，注册用户10份，会员不限。草稿保存在浏览器本地存储（localStorage），清除浏览器数据会丢失。建议重要单据及时导出。",
        },
        {
          question: "可以导出什么格式？",
          answer: "支持导出 PDF、PNG 图片格式。会员还可上传公司 Logo，多套公司信息模板，导出带品牌标识的专业单据。",
        },
        { question: "商业发票和形式发票有什么区别？", answer: "商业发票（Commercial Invoice）是实际交易后出具的正式单据，用于报关结算；形式发票（Proforma Invoice）是成交前出具的预估单据，供买方参考或申请进口许可。" },
        { question: "装箱单（Packing List）需要包含哪些信息？", answer: "装箱单应包含：货物名称、规格型号、数量、毛重、净重、包装方式、箱号、唛头等。注意与商业发票的品名和数量保持一致。" },
      ]} />
    </div>
  );
}
