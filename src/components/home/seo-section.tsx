import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

const GUIDES = [
  { title: "什么是 Commercial Invoice", desc: "商业发票是跨境贸易中最核心的单据之一，用于海关申报、货物估值和税务计算。了解如何正确填写 Commercial Invoice 的关键字段，避免清关延误。", href: "/tools/commercial-invoice" },
  { title: "如何填写 Shipping Label", desc: "快递面单包含发件人、收件人、包裹重量和追踪号等关键信息。掌握 Shipping Label 的标准格式要求，确保包裹顺利派送。", href: "/tools/shipping-label" },
  { title: "加拿大邮编查询指南", desc: "加拿大邮政编码采用 A1A 1A1 格式，前三个字符代表 FSA（前缀排序区），后三个字符代表 LDU。学会正确使用邮编校验工具。", href: "/tools/postal-code" },
  { title: "海外仓入库单怎么写", desc: "入库单（Inbound Receipt）是海外仓接收货物的凭证，记录 SKU 数量、批次和质检结果。规范填写可避免库存差异和丢失。", href: "/tools/inbound-receipt" },
  { title: "Debit Note 使用场景", desc: "借记单（Debit Note）用于记录应付未付款项，常见于物流费用结算、仓储费和操作费的财务对账。了解其与国际 Invoice 的区别。", href: "/tools/debit-note" },
  { title: "短视频 SOP 模板", desc: "短视频 SOP（标准操作流程）帮助团队高效产出内容，涵盖选题、脚本、拍摄、剪辑全流程。适用于 TikTok 和小红书运营。", href: "/tools/video-script-sop" },
];

export default function SEOSection() {
  return (
    <section className="w-full bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            海外华人常用工具指南
          </h2>
          <p className="mt-1.5 text-sm text-gray-500">实用教程，帮你快速上手核心工具</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GUIDES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="group p-4 bg-[#f8fafc] border border-gray-200 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors mb-1.5">
                {g.title}
              </div>
              <div className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                {g.desc}
              </div>
              <div className="mt-2 text-xs text-teal-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                查看工具 <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
