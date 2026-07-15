'use client';

import Link from "next/link";
import { ArrowRight, Hash, MapPin, Calculator, FileText, Search, DollarSign } from "lucide-react";

export default function AdditionalContentClient() {
  const scenarios = [
    { 
      title: "发货到海外", 
      desc: "运费计算、集装箱装柜、物流追踪", 
      tools: [
        { label: "运费计算", href: "/tools/shipping-calculator" },
        { label: "集装箱计算", href: "/tools/container" },
        { label: "物流追踪", href: "/tracking" },
      ]
    },
    { 
      title: "清关报关", 
      desc: "商业发票、装箱单、HS编码", 
      tools: [
        { label: "商业发票", href: "/tools/documents/commercial-invoice" },
        { label: "装箱单", href: "/tools/documents/packing-list" },
        { label: "HS编码", href: "/tools/hs-code" },
      ]
    },
    { 
      title: "地址填写", 
      desc: "邮编查询、地址格式化、唛头模板", 
      tools: [
        { label: "邮编查询", href: "/tools/postal-code" },
        { label: "地址格式化", href: "/tools/address-formatter" },
        { label: "唛头模板", href: "/tools/documents/shipping-mark" },
      ]
    },
    { 
      title: "收款结汇", 
      desc: "汇率换算、报价单、形式发票", 
      tools: [
        { label: "汇率换算", href: "/tools/exchange-rate" },
        { label: "报价单", href: "/tools/documents/quotation" },
        { label: "形式发票", href: "/tools/documents/proforma-invoice" },
      ]
    },
  ];

  return (
    <>
      {/* ===== COMMON SCENARIOS ===== */}
      <div className="pb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">常见出海场景</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map(scenario => (
            <div key={scenario.title} className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-1">{scenario.title}</h3>
              <p className="text-xs text-gray-500 mb-3">{scenario.desc}</p>
              <div className="space-y-1.5">
                {scenario.tools.map(tool => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 hover:underline min-h-[32px]"
                  >
                    <ArrowRight className="w-3 h-3" />
                    {tool.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== ALL TOOLS CTA ===== */}
      <div className="pb-16">
        <Link href="/tools" className="block bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">🔧 浏览全部工具</h3>
              <p className="text-teal-100 text-sm">邮编、HS编码、汇率、运费、单据模板,一个站搞定</p>
            </div>
            <ArrowRight className="w-6 h-6 flex-shrink-0" />
          </div>
        </Link>
      </div>
    </>
  );
}