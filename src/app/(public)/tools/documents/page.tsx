import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, Crown, AlertTriangle, Clock, Tag, Receipt, Plane, Shield, Sparkles } from "lucide-react";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { documentTools, getToolHref, getToolIcon, getToolEmoji, getToolColor, onlineToolCount } from "@/lib/document-tools-config";
import { AdSlot } from "@/components/ad-slot";
import { Breadcrumb } from "@/components/breadcrumb";
import { FAQSection } from "@/components/faq-section";
import RecentlyUsedWidget from "@/components/recently-used-docs";
import ToolReviewServer from "@/components/tools/tool-review-server";

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

const documentScenarios = [
  { icon: Receipt, title: "出口报关", desc: "商业发票 + 装箱单 + 报关资料，一套搞定", href: "/tools/documents/commercial-invoice" },
  { icon: Plane, title: "国际物流", desc: "订舱委托书、装运通知，货代对接更轻松", href: "/tools/documents/booking-instruction" },
  { icon: Tag, title: "跨境电商", desc: "形式发票、销售合同，平台入驻必备", href: "/tools/documents/proforma-invoice" },
  { icon: Shield, title: "银行议付", desc: "信用证要求的全套单据，格式规范", href: "/tools/documents/commercial-invoice" },
];

export default async function DocumentsHubPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  // 统一工具列表 — 从全局配置读取
  const onlineTools = documentTools.filter(t => t.isOnline);

  // 常用 7 个（featured cards）
  const featuredKeys = [
    "commercial-invoice", "proforma-invoice", "packing-list",
    "sales-contract", "booking-instruction", "customs-declaration-authorization", "label-maker",
  ];
  const featuredTools = featuredKeys
    .map(k => onlineTools.find(t => t.key === k))
    .filter(Boolean)
    .slice(0, 7);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO ===== */}
      <div className="bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-indigo-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
          {/* Breadcrumb */}
          <Breadcrumb />

          <div className="mt-6 max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                <FileText className="w-3.5 h-3.5" /> 外贸单据
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                国际物流
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                报关资料
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                PDF/Word 导出
              </span>
            </div>

            <h1 className="text-2xl md:text-2xl font-extrabold mb-3 leading-tight">
              外贸/国际物流通用单据生成器
            </h1>
            <p className="text-lg text-indigo-100/90 max-w-2xl leading-relaxed">
              商业发票、装箱单、销售合同、订舱委托书等常用单据模板。<br className="hidden md:block" />
              在线填写，自动排版，支持 PDF / Word / 图片导出。
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href="#tools-grid"
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] bg-white text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-colors shadow-lg cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                开始生成单据
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/dashboard/documents"
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
              >
                <Clock className="w-5 h-5" />
                我的草稿
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SCENARIO CARDS ===== */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">适合谁使用</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {documentScenarios.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.title}
                  href={s.href}
                  className="group flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-purple-50 hover:border-purple-200 border border-transparent transition-all duration-200 min-h-[44px]"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                    <Icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 group-hover:text-purple-700 transition-colors">{s.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ad Slot */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <AdSlot placement="documents-home-top" variant="banner" />
      </div>

      {/* Recently used widget */}
      <RecentlyUsedWidget />

      {/* ===== DOCUMENT TYPE CARDS ===== */}
      <div id="tools-grid" className="max-w-6xl mx-auto px-4 py-8 scroll-mt-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            常用单据模板
          </h2>
          <span className="text-sm text-gray-400">共 {onlineToolCount} 种</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredTools.map((tool) => {
            const Icon = getToolIcon(tool!);
            const colors = getToolColor(tool!);
            return (
              <Link
                key={tool!.key}
                href={isLoggedIn ? getToolHref(tool!) : `/tools/documents/${tool!.key === 'label-maker' ? 'shipping-label' : tool!.key}`}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 hover:shadow-lg hover:border-purple-200 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${colors.bg} ${colors.icon} group-hover:scale-105`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{tool!.titleZh}</h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{tool!.titleEn}</p>
                    <p className="text-sm text-gray-500 mt-2">{tool!.description}</p>
                    <div className="flex items-center gap-1 mt-3 text-sm font-medium text-purple-600 group-hover:text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      立即生成 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ===== FULL TOOL GRID (from unified config) ===== */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">全部单据工具</h2>
        <p className="text-gray-500 mb-6">{onlineToolCount} 套 · 在线填写 · 自动排版 · 导出 PDF/PNG/Word</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {onlineTools.map(doc => {
            const Icon = getToolIcon(doc);
            const emoji = getToolEmoji(doc);
            return (
              <Link
                key={doc.key}
                href={isLoggedIn ? getToolHref(doc) : `/tools/documents/${doc.key === 'label-maker' ? 'shipping-label' : doc.key}`}
                className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all relative"
              >
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                  {doc.titleZh}
                </h3>
                <p className="text-xs text-gray-400 mb-2">{doc.titleEn}</p>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{doc.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">免费</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Shipping Label CTA (integrated) */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <Link href="/tools/documents/shipping-label" className="block bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">📦 需要生成箱唛/面单？</h3>
              <p className="text-indigo-100 text-sm">外箱唛头、仓库标签、集运入库贴、合箱标签、寄件信息贴纸，一站式生成</p>
            </div>
            <ArrowRight className="w-6 h-6 flex-shrink-0" />
          </div>
        </Link>
      </div>

      {/* ===== MEMBERSHIP ===== */}
      <div className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm mb-4">
              <Crown className="w-4 h-4" />
              会员专属能力
            </div>
            <h2 className="text-xl font-bold text-gray-900">升级会员，解锁更多功能</h2>
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
      <div className="max-w-6xl mx-auto px-4 pb-8">
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

      {/* Tool Reviews */}
      <ToolReviewServer toolKey="documents" />

      <AdSlot placement="footer" variant="banner" className="mt-8 mb-8" />
    </div>
  );
}
