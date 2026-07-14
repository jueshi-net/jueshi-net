import Link from "next/link";
import { ArrowRight, Globe, FileText, Package, MapPin, DollarSign, Search, Hash, Calculator } from "lucide-react";
import { getAllDestinationsActive } from "@/lib/destinations-db";
import { ALL_COUNTRIES, type AllCountryConfig } from "@/lib/all-countries";
import { buildCanonical, buildTitle } from "@/lib/seo";
import type { Metadata } from "next";
import DestinationsIndexClient from "./destinations-index-client";
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';
import PublicCategoryPageFrame from '@/components/templates/PublicCategoryPageFrame';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: buildTitle("全球目的地工具导航"),
  description: "按地区浏览出海工具 — 北美、欧洲、东南亚、日韩、拉美、中东、澳洲,邮编查询、地址格式化、运费计算、商业发票、HS编码,一站式出海解决方案。",
  alternates: { canonical: buildCanonical("/destinations") },
  robots: "index,follow",
  openGraph: {
    title: buildTitle("全球目的地工具导航"),
    description: "按地区浏览出海工具 — 北美、欧洲、东南亚、日韩、拉美、中东、澳洲,一站式出海解决方案。",
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

const REGION_LABELS: Record<string, string> = {
  Asia: "亚洲",
  Europe: "欧洲",
  Americas: "美洲",
  Oceania: "大洋洲",
  Africa: "非洲",
  "Middle East": "中东",
};

export default async function DestinationsIndexPage() {
  // Fetch DB destinations
  let dbDestinations: Awaited<ReturnType<typeof getAllDestinationsActive>> = [];
  try {
    dbDestinations = await getAllDestinationsActive();
  } catch {
    // DB unreachable during build — render with static config only
  }

  // Build a map of DB destination slugs for enrichment
  const dbSlugMap = new Map(dbDestinations.map(d => [d.slug, d]));

  // Merge: all-countries config + DB destinations
  // For countries in both, DB data takes priority for display fields
  // For countries only in all-countries, use static config
  const mergedCountries: AllCountryConfig[] = ALL_COUNTRIES.map(c => {
    // Check if this country also exists in DB (by slug or alias)
    const dbDest = dbSlugMap.get(c.slug) || dbSlugMap.get(c.countryCode.toLowerCase());
    if (dbDest) {
      return {
        ...c,
        heroTitle: dbDest.name || c.nameZh,
        // DB has richer data, keep config for fields DB doesn't have
      };
    }
    return c;
  });

  // Also add DB destinations not in all-countries config (if any)
  const existingSlugs = new Set(ALL_COUNTRIES.map(c => c.slug));
  for (const d of dbDestinations) {
    if (!existingSlugs.has(d.slug)) {
      // This destination exists in DB but not in all-countries — add it
      mergedCountries.push({
        slug: d.slug,
        countryCode: d.slug.substring(0, 2).toUpperCase(),
        nameEn: d.name,
        nameZh: d.name,
        flagEmoji: d.emoji || "🏳️",
        capital: "",
        majorCities: [],
        timezones: [],
        defaultTimezone: "UTC",
        currencyCode: "",
        currencyName: "",
        dialingCode: "",
        languages: [],
        postalDataStatus: "none",
        postalRecordCount: 0,
        postalCodeName: "Postal Code",
        postalCodeFormat: "—",
        addressFormatExample: "",
        officialPostalUrl: "",
        officialCustomsUrl: null,
        officialImmigrationUrl: null,
        heroTitle: d.name,
        heroSubtitle: d.name + "出海工具与指南",
        seoTitle: d.name + "出海工具与指南 - 绝世百宝箱",
        seoDescription: d.name + "邮编查询、地址格式、运费计算等出海工具。",
        relatedToolSlugs: ["postal-code", "hs-code", "shipping-estimator", "commercial-invoice", "packing-list", "exchange-rate"],
        relatedGuideSlugs: [],
        faqItems: [],
        hotSearches: [],
        sortOrder: 50,
        region: d.region || "Other",
        subregion: "",
        completenessTier: 2,
        isPublished: true,
        indexable: true,
      });
    }
  }

  const featured = mergedCountries.filter(c => c.completenessTier === 1);

  return (
    <JueshiV4PublicShell>
      <PublicCategoryPageFrame
        title="🌍 全球目的地工具导航"
        description="按地区查找出海常用工具 — 邮编查询、地址格式化、运费计算、商业发票、HS 编码,一站式解决。"
        icon={<Globe className="w-6 h-6" />}
      >
        {/* ===== SEARCHABLE COUNTRY INDEX ===== */}
        <div className="-mt-6 relative z-10 mb-10">
          <DestinationsIndexClient countries={mergedCountries} featured={featured} />
        </div>

        {/* ===== COMMON SCENARIOS ===== */}
        <div className="pb-8">
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
      </PublicCategoryPageFrame>
    </JueshiV4PublicShell>
  );
}
