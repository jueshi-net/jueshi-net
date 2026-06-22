import type { Metadata } from "next";
import Link from "next/link";
import { getAllCountries } from "@/lib/all-countries";
import CountriesIndexClient from "@/components/countries/countries-index-client";
import {
  Globe,
  Wrench,
  BookOpen,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "各国邮编、地址格式与发货工具指南 - 绝世百宝箱",
  description:
    "覆盖全球190+国家/地区的邮编查询、地址格式、时区、货币、电话区号等参考信息。重点国家提供完整工具入口、任务链、指南和社区讨论。",
  alternates: { canonical: `${SITE_URL}/countries` },
  robots: "index,follow",
  openGraph: {
    title: "各国邮编、地址格式与发货工具指南 - 绝世百宝箱",
    description:
      "覆盖全球190+国家/地区的邮编查询、地址格式、时区、货币、电话区号等参考信息。",
    url: `${SITE_URL}/countries`,
    type: "website",
    locale: "zh_CN",
    siteName: "绝世百宝箱",
  },
};

export default function CountriesPage() {
  const countries = getAllCountries();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            首页
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">国家指南</span>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-6 sm:p-8 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            🌍 各国邮编、地址格式与发货工具
          </h1>
          <p className="text-teal-100 text-sm sm:text-base max-w-2xl">
            覆盖全球 {countries.length} 个国家/地区。重点国家提供完整邮编数据库、地址格式、当地时间、任务链和社区讨论；其他国家提供基础参考信息，资料持续补充中。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs">
              ✅ {countries.filter((c) => c.completenessTier === 1).length} 个完整页
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs">
              📊 {countries.filter((c) => c.completenessTier === 2).length} 个增强页
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs">
              🌐 {countries.filter((c) => c.completenessTier === 3).length} 个基础页
            </span>
          </div>
        </section>

        {/* Map reference note */}
        <section className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm text-gray-600">
            <MapPin className="w-4 h-4 inline mr-1 text-blue-500" />
            地图参考按城市/地区搜索，不代表精确邮编位置。邮编数据来源于公开数据源，结果仅供参考。
          </p>
        </section>

        {/* Searchable country index */}
        <CountriesIndexClient countries={countries} />

        {/* Related tools */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600" />
            🛠 常用工具
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "邮编查询", href: "/tools/postal-code", icon: "📮" },
              { name: "HS编码查询", href: "/tools/hs-code", icon: "📋" },
              { name: "运费/CBM计算", href: "/tools/shipping-calculator", icon: "🧮" },
              { name: "商业发票", href: "/tools/commercial-invoice", icon: "📄" },
              { name: "装箱单", href: "/tools/packing-list", icon: "📦" },
              { name: "地址格式化", href: "/tools/address-formatter", icon: "📝" },
              { name: "汇率换算", href: "/tools/exchange-rate", icon: "💱" },
              { name: "任务链", href: "/workspace/task-chains/shipping/new", icon: "🔗" },
            ].map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="flex flex-col items-center gap-1 p-4 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-teal-200 transition-all text-center"
              >
                <span className="text-2xl">{tool.icon}</span>
                <span className="text-sm font-medium text-gray-700">{tool.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            ❓ 常见问题
          </h2>
          <div className="space-y-3">
            <details className="group bg-white border border-gray-200 rounded-lg">
              <summary className="cursor-pointer p-4 font-medium text-gray-900 flex items-center justify-between list-none">
                国家页面分为几个层次？
                <span className="transition-transform group-open:rotate-180 text-gray-400">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-600 leading-relaxed text-sm">
                分为三个层次：完整页（7个重点国家，含邮编数据库、工具、任务链、指南、社区）、增强基础页（35个热门国家，含基础信息、官方链接）、基础页（其余国家，含名称、旗帜、时区、货币等基础参考）。
              </div>
            </details>
            <details className="group bg-white border border-gray-200 rounded-lg">
              <summary className="cursor-pointer p-4 font-medium text-gray-900 flex items-center justify-between list-none">
                所有国家都有邮编数据库吗？
                <span className="transition-transform group-open:rotate-180 text-gray-400">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-600 leading-relaxed text-sm">
                不是。目前仅部分国家（加拿大、美国、英国、澳大利亚、日本、新加坡、马来西亚）接入了邮编数据库查询。其他国家页面会标注"暂未接入可查询邮编数据库"，您仍可查看地址格式和官方资源。
              </div>
            </details>
            <details className="group bg-white border border-gray-200 rounded-lg">
              <summary className="cursor-pointer p-4 font-medium text-gray-900 flex items-center justify-between list-none">
                地图结果代表精确位置吗？
                <span className="transition-transform group-open:rotate-180 text-gray-400">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-600 leading-relaxed text-sm">
                地图参考按城市/地区搜索，不代表精确邮编位置。邮编覆盖范围可能跨越多个街区，如需精确投递请以当地邮政官方查询结果为准。
              </div>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
}
