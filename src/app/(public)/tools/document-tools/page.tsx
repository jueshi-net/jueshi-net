import { Metadata } from "next";
import Link from "next/link";
import { FileText, Receipt, ClipboardList, Package, FileBadge, Shield, Plane, Video, ArrowRight, Building2, Crown } from "lucide-react";

export const metadata: Metadata = {
  title: "单据工具箱 — 海外百宝箱",
  description: "报价单、商业发票、出货交接单、唛头标签、Debit Note、短视频 SOP 脚本等外贸/物流单据在线生成工具。",
};

const toolCards = [
  { icon: Receipt, title: "供应链报价单", sub: "Quote Sheet", href: "/tools/quote-sheet", desc: "重量段、渠道、时效、备注，支持导出 Excel", color: "blue" },
  { icon: Package, title: "商品入库单", sub: "Inbound Receipt", href: "/tools/inbound-receipt", desc: "客户单位、货品名称、数量、日期、入库章样式", color: "green" },
  { icon: ClipboardList, title: "出货交接单", sub: "Handover Note", href: "/tools/handover-note", desc: "发货方、收货方、追踪号、品名、件数、签字栏", color: "orange" },
  { icon: FileBadge, title: "外贸发票", sub: "Commercial Invoice", href: "/tools/commercial-invoice", desc: "公司信息、客户信息、商品项目、税费、运费、打印/PDF", color: "teal" },
  { icon: Shield, title: "唛头标签打印", sub: "Shipping Label", href: "/tools/shipping-label", desc: "纸张尺寸、公司名、单号、渠道、品名、打印数量、分页", color: "purple" },
  { icon: FileText, title: "Debit Note", sub: "Debit Note", href: "/tools/debit-note", desc: "客户信息、运输明细、费用项、银行信息、保存/打印", color: "indigo" },
  { icon: Video, title: "短视频 SOP 脚本", sub: "Video Script SOP", href: "/tools/video-script-sop", desc: "价格反差型、猎奇重工型、生成导货脚本", color: "pink" },
];

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200" },
  green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-200" },
  orange: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-200" },
  teal: { bg: "bg-teal-50", icon: "text-teal-600", border: "border-teal-200" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-200" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", border: "border-indigo-200" },
  pink: { bg: "bg-pink-50", icon: "text-pink-600", border: "border-pink-200" },
};

export default function DocumentToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-cyan-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
          <div className="flex items-center gap-2 text-sm text-teal-100 mb-6">
            <Link href="/tools" className="hover:text-white transition-colors">工具</Link>
            <span>/</span>
            <span className="text-white">单据工具箱</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            <Building2 className="w-8 h-8 inline-block mr-2" />
            单据工具箱
          </h1>
          <p className="text-lg text-teal-100 max-w-2xl">
            外贸报价单、商业发票、出货交接单、唛头标签等常用单据在线生成，支持公司资料管理和历史记录恢复。
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-teal-200">
            <Crown className="w-4 h-4" />
            会员可上传公司 Logo，普通用户可使用文字 Logo
          </div>
        </div>
      </div>

      {/* Draft Reminder */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
          <FileText className="w-4 h-4 shrink-0" />
          已保存的草稿可在 <Link href="/dashboard/documents" className="font-semibold underline">我的工作台 → 我的单据</Link> 中继续编辑
        </div>
      </div>

      {/* Tool Cards */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolCards.map((tool) => {
            const Icon = tool.icon;
            const c = colorMap[tool.color] || colorMap.blue;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className={`group rounded-xl border ${c.border} ${c.bg} p-6 hover:shadow-md transition-all block`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center ${c.icon} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{tool.title}</h3>
                <p className="text-sm text-gray-400 mt-0.5">{tool.sub}</p>
                <p className="text-sm text-gray-600 mt-2">{tool.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
