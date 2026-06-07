import Link from "next/link";
import { FileText, ArrowRight, Package, Receipt, Tag, Truck, Sparkles } from "lucide-react";

const DOC_TOOLS = [
  { name: "Commercial Invoice", desc: "自动生成商业发票，符合各国海关要求", icon: FileText, href: "/tools/commercial-invoice" },
  { name: "Shipping Label", desc: "快递面单批量生成，支持多承运商格式", icon: Package, href: "/tools/shipping-label" },
  { name: "Quote Sheet", desc: "标准外贸报价单模板，快速制作专业报价", icon: Tag, href: "/tools/quote-sheet" },
  { name: "Inbound Receipt", desc: "入库出库单据管理，仓库收发一目了然", icon: Receipt, href: "/tools/inbound-receipt" },
  { name: "Handover Note", desc: "提单确认书生成，跨境交接标准文档", icon: Truck, href: "/tools/handover-note" },
  { name: "Debit Note", desc: "借记单快速制作，财务结算必备工具", icon: FileText, href: "/tools/debit-note" },
  { name: "Video SOP", desc: "短视频脚本 SOP 模板，提升内容产出效率", icon: Sparkles, href: "/tools/video-script-sop" },
];

export default function DocumentToolsSection() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">外贸单据工具箱</h2>
          <p className="mt-1.5 text-sm text-gray-500">专业外贸与集运文件生成，一键导出标准格式</p>
          <Link href="/tools?cat=documents" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
            查看更多单据工具 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {DOC_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.name}
                className="group flex flex-col p-4 bg-[#f8fafc] border border-gray-200 rounded-[20px] hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-100">
                    <Icon className="w-5 h-5 text-teal-600" />
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-900 mb-1">{tool.name}</div>
                <div className="text-xs text-gray-500 leading-relaxed flex-1">{tool.desc}</div>
                <Link
                  href={tool.href}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  立即使用 <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
