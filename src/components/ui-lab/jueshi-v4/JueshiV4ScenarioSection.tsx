"use client";

import { Map, FileText, Calculator, Ship, GraduationCap, Globe, Phone, CreditCard, Briefcase, Home } from "lucide-react";

const scenarios = [
  { icon: Map, label: "地图导航", color: "from-blue-500 to-cyan-500" },
  { icon: FileText, label: "单据生成", color: "from-purple-500 to-pink-500" },
  { icon: Calculator, label: "汇率换算", color: "from-green-500 to-emerald-500" },
  { icon: Ship, label: "物流查询", color: "from-orange-500 to-red-500" },
  { icon: GraduationCap, label: "留学指南", color: "from-indigo-500 to-purple-500" },
  { icon: Globe, label: "官方资源", color: "from-teal-500 to-cyan-500" },
  { icon: Phone, label: "通讯联络", color: "from-pink-500 to-rose-500" },
  { icon: CreditCard, label: "支付金融", color: "from-amber-500 to-orange-500" },
  { icon: Briefcase, label: "工作求职", color: "from-slate-500 to-gray-500" },
  { icon: Home, label: "租房安居", color: "from-lime-500 to-green-500" },
];

export default function JueshiV4ScenarioSection() {
  return (
    <section className="px-6 lg:px-12 py-8 border-t border-[#3a3e45]">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">常用场景</h2>
        <p className="text-sm text-gray-400 mt-1">按使用场景快速找到所需工具</p>
      </div>

      {/* Scenario Icons - Horizontal Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {scenarios.map((scenario) => (
          <a
            key={scenario.label}
            href="/tools"
            className="flex-shrink-0 flex flex-col items-center gap-2 group"
          >
            {/* Circular Icon */}
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${scenario.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
              <scenario.icon className="w-7 h-7 text-white" />
            </div>
            {/* Label */}
            <span className="text-xs text-gray-300 group-hover:text-white transition-colors whitespace-nowrap">
              {scenario.label}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
