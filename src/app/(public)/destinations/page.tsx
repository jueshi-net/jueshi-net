import Link from "next/link";
import { ArrowRight, Globe, FileText, Package, MapPin, DollarSign, Sparkles, ChevronRight, Calculator, Hash, Search } from "lucide-react";
import { REGION_GROUPS, getAllDestinationsActive } from "@/lib/destinations-db";
import { buildCanonical, buildTitle } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: buildTitle("全球目的地工具导航"),
  description: "按地区浏览出海工具 — 北美、欧洲、东南亚、日韩、拉美、中东、澳洲，邮编查询、地址格式化、运费计算、商业发票、HS编码，一站式出海解决方案。",
  alternates: { canonical: buildCanonical("/destinations") },
  openGraph: {
    title: buildTitle("全球目的地工具导航"),
    description: "按地区浏览出海工具 — 北美、欧洲、东南亚、日韩、拉美、中东、澳洲，一站式出海解决方案。",
    url: buildCanonical("/destinations"),
  },
};

/** Each region gets recommended tool CTAs */
const REGION_TOOL_CTAS = [
  { label: "邮编查询", href: "/tools/postal-code", icon: Hash },
  { label: "地址格式化", href: "/tools/address-formatter", icon: MapPin },
  { label: "运费计算", href: "/tools/shipping-calculator", icon: Calculator },
  { label: "商业发票", href: "/tools/documents/commercial-invoice", icon: FileText },
  { label: "HS 编码", href: "/tools/hs-code", icon: Search },
  { label: "汇率换算", href: "/tools/exchange-rate", icon: DollarSign },
];

export default async function DestinationsIndexPage() {
  let destinations: Awaited<ReturnType<typeof getAllDestinationsActive>> = [];
  try {
    destinations = await getAllDestinationsActive();
  } catch {
    // DB unreachable during build — render with empty state
  }
  const destMap = new Map(destinations.map(d => [d.slug, d]));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO ===== */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-800 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-14 md:pt-16 md:pb-20">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
              <Globe className="w-3.5 h-3.5" /> 全球覆盖
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            🌍 全球目的地工具导航
          </h1>

          <p className="text-lg md:text-xl text-indigo-100/90 max-w-2xl leading-relaxed">
            按地区查找出海常用工具 — 邮编查询、地址格式化、运费计算、商业发票、HS 编码，一站式解决。
          </p>
        </div>
      </div>

      {/* ===== REGION GRID ===== */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {REGION_GROUPS.map(group => {
            const availableCountries = group.slugs
              .map(slug => destMap.get(slug))
              .filter(Boolean);

            return (
              <div
                key={group.key}
                className="bg-white rounded-xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-md hover:border-gray-200 transition-all"
              >
                {/* Region header */}
                <div className="p-4 pb-3 border-b border-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{group.emoji}</span>
                    <h2 className="text-sm font-bold text-gray-900">{group.label}</h2>
                  </div>
                  <p className="text-xs text-gray-400">{group.description}</p>
                </div>

                {/* Countries list (if any) */}
                {availableCountries.length > 0 && (
                  <div className="px-3 pt-2">
                    <div className="space-y-1">
                      {availableCountries.slice(0, 3).map(dest => (
                        <Link
                          key={dest!.slug}
                          href={`/destinations/${dest!.slug}`}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group min-h-[36px]"
                        >
                          <span className="text-sm">{dest!.emoji}</span>
                          <span className="text-xs font-medium text-gray-700 group-hover:text-purple-700 transition-colors">{dest!.name}</span>
                          <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-purple-500 transition-colors ml-auto" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tool CTAs — always present */}
                <div className="p-3 pt-2">
                  <p className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-wide font-medium">常用工具</p>
                  <div className="flex flex-wrap gap-1.5">
                    {REGION_TOOL_CTAS.slice(0, 4).map(cta => {
                      const Icon = cta.icon;
                      return (
                        <Link
                          key={cta.href}
                          href={cta.href}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors"
                        >
                          <Icon className="w-3 h-3" />
                          {cta.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== COMMON SCENARIOS ===== */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">常见出海场景</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "发货到海外", desc: "运费计算、集装箱装柜、物流追踪", tools: [
              { label: "运费计算", href: "/tools/shipping-calculator" },
              { label: "集装箱计算", href: "/tools/container" },
              { label: "物流追踪", href: "/tracking" },
            ]},
            { title: "清关报关", desc: "商业发票、装箱单、HS编码", tools: [
              { label: "商业发票", href: "/tools/documents/commercial-invoice" },
              { label: "装箱单", href: "/tools/documents/packing-list" },
              { label: "HS编码", href: "/tools/hs-code" },
            ]},
            { title: "地址填写", desc: "邮编查询、地址格式化、唛头模板", tools: [
              { label: "邮编查询", href: "/tools/postal-code" },
              { label: "地址格式化", href: "/tools/address-formatter" },
              { label: "唛头模板", href: "/tools/documents/shipping-mark" },
            ]},
            { title: "收款结汇", desc: "汇率换算、报价单、形式发票", tools: [
              { label: "汇率换算", href: "/tools/exchange-rate" },
              { label: "报价单", href: "/tools/documents/quotation" },
              { label: "形式发票", href: "/tools/documents/proforma-invoice" },
            ]},
          ].map(scenario => (
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
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <Link href="/tools" className="block bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">🔧 浏览全部工具</h3>
              <p className="text-teal-100 text-sm">邮编、HS编码、汇率、运费、单据模板，一个站搞定</p>
            </div>
            <ArrowRight className="w-6 h-6 flex-shrink-0" />
          </div>
        </Link>
      </div>
    </div>
  );
}
