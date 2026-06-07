"use client";

import Link from "next/link";
import {
  MapPin,
  Hash,
  Calculator,
  Container,
  ArrowLeftRight,
  FileText,
  Package,
  Globe,
  Ship,
  Clock,
  Warehouse,
  Scale,
  Shield,
  Phone,
  BarChart3,
  QrCode,
} from "lucide-react";

const TOOLS = [
  { href: "/tools/postal-code", label: "邮编查询", icon: MapPin, color: "text-[#2563eb]" },
  { href: "/tools/hs-code", label: "HS 编码", icon: Hash, color: "text-[#059669]" },
  { href: "/tools/shipping-calculator", label: "运费计算", icon: Calculator, color: "text-[#533afd]" },
  { href: "/tools/container", label: "集装箱", icon: Container, color: "text-[#d97706]" },
  { href: "/tools/exchange-rate", label: "汇率换算", icon: ArrowLeftRight, color: "text-[#0891b2]" },
  { href: "/tools/documents", label: "单据模板", icon: FileText, color: "text-[#e11d48]" },
  { href: "/tools/sensitive-goods", label: "敏感货", icon: Package, color: "text-[#ea580c]" },
  { href: "/resources", label: "网址导航", icon: Globe, color: "text-[#4f46e5]" },
  { href: "/tracking", label: "物流追踪", icon: Ship, color: "text-[#0284c7]" },
  { href: "/tools/shipping-estimator", label: "时效查询", icon: Clock, color: "text-[#0d9488]" },
  { href: "/destinations", label: "海外仓", icon: Warehouse, color: "text-[#57534e]" },
  { href: "/tools/calculator", label: "材积计算", icon: Scale, color: "text-[#65a30d]" },
  { href: "/resources", label: "货运保险", icon: Shield, color: "text-[#dc2626]" },
  { href: "/resources", label: "报关行", icon: Phone, color: "text-[#c026d3]" },
  { href: "/tools/hs-code", label: "关税查询", icon: BarChart3, color: "text-[#ca8a04]" },
  { href: "/tools/qrcode", label: "条码生成", icon: QrCode, color: "text-[#db2777]" },
];

export default function QuickTools() {
  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[22px] font-light tracking-tight text-[#061b31] leading-tight" style={{ letterSpacing: "-0.22px" }}>
          快捷工具
        </h2>
        <Link
          href="/tools"
          className="text-[13px] font-medium text-[#533afd] hover:text-[#4434d4] transition-colors"
        >
          查看全部 →
        </Link>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col items-center gap-2 py-4 px-2 rounded-xl bg-white border border-gray-200/60 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-white hover:shadow-[0_8px_30px_rgba(83,58,253,0.08)] hover:border-gray-200/80"
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-[6px] bg-[#f6f9fc] group-hover:bg-[#f5f3ff] transition-all ${tool.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[13px] font-medium text-[#273951] group-hover:text-[#533afd] transition-colors truncate w-full text-center">
                {tool.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
