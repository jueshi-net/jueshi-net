"use client";

import { Map, FileText, Calculator, Ship, GraduationCap, Globe, Phone, CreditCard } from "lucide-react";

const tools = [
  {
    icon: Map,
    title: "邮编查询",
    description: "全球邮政编码快速查询",
    href: "/tools/postal-code",
    color: "from-blue-500 to-cyan-500",
    viewers: "12.5K",
  },
  {
    icon: FileText,
    title: "商业发票",
    description: "外贸单据在线生成",
    href: "/tools/commercial-invoice",
    color: "from-purple-500 to-pink-500",
    viewers: "8.3K",
  },
  {
    icon: Calculator,
    title: "汇率换算",
    description: "实时汇率计算工具",
    href: "/tools/exchange-rate",
    color: "from-green-500 to-emerald-500",
    viewers: "15.2K",
  },
  {
    icon: Ship,
    title: "运费估算",
    description: "国际物流费用计算",
    href: "/tools/shipping-estimator",
    color: "from-orange-500 to-red-500",
    viewers: "6.7K",
  },
  {
    icon: GraduationCap,
    title: "留学清单",
    description: "出国必备物品清单",
    href: "/tools/checklist",
    color: "from-indigo-500 to-purple-500",
    viewers: "9.1K",
  },
  {
    icon: Globe,
    title: "HS 编码查询",
    description: "海关编码快速检索",
    href: "/tools/hs-code",
    color: "from-teal-500 to-cyan-500",
    viewers: "4.8K",
  },
  {
    icon: Phone,
    title: "国际区号",
    description: "全球电话区号查询",
    href: "/tools/country-code",
    color: "from-pink-500 to-rose-500",
    viewers: "3.2K",
  },
  {
    icon: CreditCard,
    title: "二维码生成",
    description: "免费二维码生成器",
    href: "/tools/qrcode",
    color: "from-amber-500 to-orange-500",
    viewers: "11.4K",
  },
];

export default function JueshiV4ToolGrid() {
  return (
    <section className="px-6 lg:px-12 py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">热门工具</h2>
          <p className="text-sm text-gray-400 mt-1">海外华人最常用的实用工具</p>
        </div>
        <a href="/tools" className="text-sm text-[#6c5dd3] hover:text-[#ab99ff] transition-colors">
          查看全部 →
        </a>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <a
            key={tool.title}
            href={tool.href}
            className="group bg-[#2a2d35] border border-[#3a3e45] rounded-xl p-5 hover:border-[#6c5dd3]/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <tool.icon className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <h3 className="font-semibold text-white mb-1 group-hover:text-[#ab99ff] transition-colors">
              {tool.title}
            </h3>
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
              {tool.description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              <span>{tool.viewers} 次使用</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
