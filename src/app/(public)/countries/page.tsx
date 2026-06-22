import type { Metadata } from "next";
import Link from "next/link";
import { getAllCountries } from "@/lib/country-config";
import { Globe, ArrowRight, Wrench, BookOpen } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "各国邮编、地址格式与发货工具指南 - 绝世百宝箱",
  description:
    "查询加拿大、美国、日本、英国、澳大利亚、新加坡、马来西亚等国家的邮政编码、地址格式、官方邮政入口，使用HS编码、运费计算、商业发票等跨境发货工具。",
  alternates: { canonical: `${SITE_URL}/countries` },
  robots: "index,follow",
  openGraph: {
    title: "各国邮编、地址格式与发货工具指南 - 绝世百宝箱",
    description:
      "查询各国邮政编码、地址格式、官方邮政入口，使用跨境发货工具。",
    url: `${SITE_URL}/countries`,
    type: "website",
    locale: "zh_CN",
    siteName: "绝世百宝箱",
  },
};

export default function CountriesIndexPage() {
  const countries = getAllCountries();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500" aria-label="面包屑导航">
          <Link href="/" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
            <Globe className="w-4 h-4" />
            <span>首页</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">国家指南</span>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-6 h-6 text-teal-200" />
            <span className="px-2.5 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
              国家指南
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-3">
            各国邮编、地址格式与发货工具
          </h1>
          <p className="text-teal-100 text-base sm:text-lg max-w-2xl leading-relaxed">
            查询各国邮政编码、地址格式、官方邮政入口，使用HS编码、运费计算、商业发票等跨境发货工具。
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {countries.slice(0, 4).map((c) => (
              <Link
                key={c.slug}
                href={`/countries/${c.slug}`}
                className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/10 hover:bg-white/20 transition-colors"
              >
                {c.flagEmoji} {c.nameZh}
              </Link>
            ))}
          </div>
        </section>

        {/* Country Grid */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-600" />
            🌍 支持的国家与地区
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {countries.map((c) => (
              <Link
                key={c.slug}
                href={`/countries/${c.slug}`}
                className="group flex flex-col gap-3 p-5 rounded-xl border border-gray-100 bg-white hover:shadow-lg hover:border-teal-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{c.flagEmoji}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                      {c.nameZh}
                    </h3>
                    <p className="text-xs text-gray-400">{c.nameEn} · {c.countryCode}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-500">
                  <p><span className="text-gray-400">邮编叫法：</span>{c.postalCodeName}</p>
                  <p><span className="text-gray-400">格式：</span><code className="text-teal-600 bg-teal-50 px-1 rounded">{c.postalCodeFormat}</code></p>
                  <p><span className="text-gray-400">货币：</span>{c.currencyCode} {c.currencyName}</p>
                  <p><span className="text-gray-400">主要城市：</span>{c.majorCities.slice(0, 3).join("、")}</p>
                </div>
                <div className="mt-auto pt-2 flex items-center gap-1 text-sm text-teal-600 font-medium">
                  查看国家指南 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Related Tools */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600" />
            🛠 常用工具
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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

        {/* Map Reference Note */}
        <section className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            📖 地图参考说明
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            地图参考按城市/地区搜索，不代表精确邮编位置。邮编数据来源于公开数据源，结果仅供参考。正式发货前请以当地邮政或物流服务商信息为准。
          </p>
        </section>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
          <p className="text-sm text-amber-800">
            <span className="font-medium">免责声明：</span>
            本页内容仅供参考，各国政策、海关规定及平台规则可能随时变化，请以官方最新信息为准。
          </p>
        </div>
      </div>
    </div>
  );
}
