import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getDestinationBySlug, getAllDestinationSlugs } from "@/lib/destinations-db";
import { getCountryBySlug as getCmsCountry } from "@/lib/cms-utils";
import { getCountryBySlug as getStaticCountry, ALL_COUNTRIES, type AllCountryConfig } from "@/lib/all-countries";
import SmartRelatedLinks from "@/components/smart-related-links";
import { CountryLocalTimeCard } from "@/components/countries/country-local-time-card";
import { SITE_URL } from "@/lib/seo";
import DestinationHero from "./destination-hero-client";
import Link from "next/link";
import { ArrowLeft, BookOpen, Wrench, MessageCircle, ListChecks, MapPin, ExternalLink, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

// Slug aliases: old destinations DB uses different slugs than all-countries config
const SLUG_ALIASES: Record<string, string> = {
  "usa": "united-states",
  "uk": "united-kingdom",
};
const REVERSE_ALIASES: Record<string, string> = {
  "united-states": "usa",
  "united-kingdom": "uk",
};

export function generateStaticParams() {
  const allSlugs = new Set<string>();
  // From all-countries config (192 countries)
  for (const c of ALL_COUNTRIES) {
    allSlugs.add(c.slug);
  }
  // From REGION_GROUPS (destinations-db)
  try {
    const { REGION_GROUPS } = require("@/lib/destinations-db");
    for (const g of REGION_GROUPS) {
      for (const s of g.slugs) allSlugs.add(s);
    }
  } catch {}
  return Array.from(allSlugs).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  // Try DB
  let dest: Awaited<ReturnType<typeof getDestinationBySlug>> | null = null;
  try {
    dest = await getDestinationBySlug(slug);
  } catch {}

  // Try all-countries static config (also check alias)
  const aliasSlug = SLUG_ALIASES[slug] || slug;
  const staticConfig = getStaticCountry(aliasSlug) || getStaticCountry(slug);

  // Try CMS
  const cmsCountry = getCmsCountry(slug) || (aliasSlug !== slug ? getCmsCountry(aliasSlug) : null);

  if (!dest && !staticConfig && !cmsCountry) {
    return { title: "国家页面未找到" };
  }

  const name = dest?.name || staticConfig?.nameZh || cmsCountry?.frontmatter.title || slug;
  const title = dest?.seoTitle || staticConfig?.seoTitle || `${name}出海工具与指南 - 绝世百宝箱`;
  const description = dest?.seoDescription || staticConfig?.seoDescription || `${name}邮编查询、地址格式、运费计算等出海工具。`;
  const canonical = `${SITE_URL}/destinations/${slug}`;
  const indexable = staticConfig?.indexable ?? true;

  return {
    title,
    description,
    keywords: dest?.keywords?.join(", ") || undefined,
    alternates: { canonical },
    robots: indexable ? "index,follow" : "noindex,nofollow",
    openGraph: {
      title,
      description,
      url: canonical,
      locale: "zh_CN",
      type: "website",
      siteName: "绝世百宝箱",
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: title }],
    },
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Try DB destination
  let dest: Awaited<ReturnType<typeof getDestinationBySlug>> | null = null;
  try {
    dest = await getDestinationBySlug(slug);
  } catch {}

  // Try all-countries static config (also check alias)
  const aliasSlug = SLUG_ALIASES[slug] || slug;
  const staticConfig = getStaticCountry(aliasSlug) || getStaticCountry(slug);

  // Try CMS content
  const cmsCountry = getCmsCountry(slug) || (aliasSlug !== slug ? getCmsCountry(aliasSlug) : null);

  // If nothing found, 404
  if (!dest && !staticConfig && !cmsCountry) {
    notFound();
  }

  const countryCode = staticConfig?.countryCode || cmsCountry?.frontmatter.country || (dest && 'code' in dest ? (dest as any).code : slug.substring(0, 2)).toUpperCase();
  const countryName = dest?.name || staticConfig?.nameZh || cmsCountry?.frontmatter.title || slug;
  const flagEmoji = staticConfig?.flagEmoji || cmsCountry?.frontmatter.flag || dest?.emoji || "🏳️";
  const tier = staticConfig?.completenessTier || 2;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero — use existing DestinationHero if DB dest exists, otherwise static */}
      {dest && <DestinationHero dest={dest as any} />}

      {/* For countries without DB destination, show a simple hero */}
      {!dest && staticConfig && (
        <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-800 text-white">
          <div className="max-w-6xl mx-auto px-4 pt-8 pb-10 md:pt-12 md:pb-14">
            <nav className="flex items-center gap-1.5 text-sm text-indigo-200 mb-4">
              <Link href="/destinations" className="hover:text-white">目的地</Link>
              <span>/</span>
              <span className="text-white">{countryName}</span>
            </nav>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl md:text-5xl">{flagEmoji}</span>
              <div>
                <h1 className="text-2xl md:text-4xl font-extrabold">{countryName}</h1>
                {staticConfig.nameEn && staticConfig.nameEn !== countryName && (
                  <p className="text-indigo-200 text-sm md:text-base">{staticConfig.nameEn}</p>
                )}
              </div>
            </div>
            <p className="text-lg text-indigo-100/90 max-w-2xl">
              {staticConfig.heroSubtitle || `${countryName}邮编查询、地址格式、时区、货币与发货工具参考`}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/tools/postal-code" className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/25 transition-colors">
                🔍 查询邮编
              </Link>
              <Link href="/tools/address-formatter" className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/25 transition-colors">
                📝 地址格式
              </Link>
              <Link href="/workspace/task-chains/shipping/new" className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/25 transition-colors">
                🚚 开始任务链
              </Link>
              <Link href="/bbs" className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/25 transition-colors">
                💬 社区讨论
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link href="/destinations" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 mb-6 min-h-[44px]">
          <ArrowLeft className="w-4 h-4" /> 返回全球目的地
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* CMS Article Content (if exists) */}
            {cmsCountry && (
              <div className="bg-white rounded-xl border p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                  {cmsCountry.frontmatter.flag} {cmsCountry.frontmatter.title}
                </h1>
                {cmsCountry.frontmatter.subtitle && (
                  <p className="text-lg text-gray-500 mb-6">{cmsCountry.frontmatter.subtitle}</p>
                )}
                <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-a:text-teal-600 prose-strong:text-gray-900">
                  {cmsCountry.content.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return <h2 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b">{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={i} className="text-lg font-semibold text-gray-800 mt-6 mb-3">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('|')) return null;
                    if (line.startsWith('- **[')) {
                      const match = line.match(/- \*\*\[(.+?)\]\((.+?)\)\*\*\s*—?\s*(.*)/);
                      if (match) {
                        return (
                          <div key={i} className="flex items-start gap-2 py-2">
                            <span className="text-teal-500 mt-0.5">→</span>
                            <Link href={match[2]} className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline">
                              {match[1]}
                            </Link>
                            {match[3] && <span className="text-xs text-gray-500">{match[3]}</span>}
                          </div>
                        );
                      }
                    }
                    if (line.trim() === '') return <br key={i} />;
                    if (line.startsWith('- ')) {
                      return <p key={i} className="text-sm text-gray-700 pl-4 before:content-['•'] before:mr-2 before:text-gray-400">{line.replace('- ', '')}</p>;
                    }
                    return <p key={i} className="text-sm text-gray-700 leading-relaxed mb-2">{line}</p>;
                  })}
                </div>
              </div>
            )}

            {/* Local Time Card (new module) */}
            {staticConfig && staticConfig.defaultTimezone && (
              <div className="bg-white rounded-xl border p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600" /> 🕐 {countryName}当地时间
                </h2>
                <CountryLocalTimeCard
                  timezone={staticConfig.defaultTimezone}
                  referenceCity={staticConfig.capital || staticConfig.nameEn}
                />
              </div>
            )}

            {/* Address Format (new module, from static config) */}
            {staticConfig && staticConfig.addressFormatExample && !staticConfig.addressFormatExample.includes('being collected') && (
              <div className="bg-white rounded-xl border p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600" /> 📍 {countryName}地址格式
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">邮编叫法</p>
                    <p className="text-sm font-medium text-gray-900">{staticConfig.postalCodeName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">邮编格式</p>
                    <p className="text-sm font-medium text-gray-900">{staticConfig.postalCodeFormat}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">货币</p>
                    <p className="text-sm font-medium text-gray-900">{staticConfig.currencyCode} {staticConfig.currencyName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">电话区号</p>
                    <p className="text-sm font-medium text-gray-900">+{staticConfig.dialingCode}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">地址格式示例</p>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{staticConfig.addressFormatExample}</pre>
                </div>
              </div>
            )}

            {/* Tools Section (new module) */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-teal-600" /> 🛠 {countryName}常用工具
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "邮编查询", href: "/tools/postal-code", icon: "📮" },
                  { name: "HS编码查询", href: "/tools/hs-code", icon: "📋" },
                  { name: "运费估算器", href: "/tools/shipping-calculator", icon: "🧮" },
                  { name: "发票生成器", href: "/tools/documents/commercial-invoice", icon: "📄" },
                  { name: "装箱单生成", href: "/tools/documents/packing-list", icon: "📦" },
                  { name: "汇率换算", href: "/tools/exchange-rate", icon: "💱" },
                  { name: "地址格式化", href: "/tools/address-formatter", icon: "📝" },
                  { name: "任务链", href: "/workspace/task-chains/shipping/new", icon: "🔗" },
                ].map(tool => (
                  <Link key={tool.href} href={tool.href}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all text-center">
                    <span className="text-xl">{tool.icon}</span>
                    <span className="text-xs font-medium text-gray-700">{tool.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Task Chain Entry (new module) */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-purple-600" /> 🔗 中国寄{countryName}任务链
              </h2>
              <p className="text-sm text-gray-600 mb-3">从地址确认到发货跟踪，一步步完成跨境发货流程。</p>
              <Link href="/workspace/task-chains/shipping/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                开始任务链 →
              </Link>
            </div>

            {/* Official Resources (new module) */}
            {staticConfig && (staticConfig.officialPostalUrl || staticConfig.officialCustomsUrl || staticConfig.officialImmigrationUrl) && (
              <div className="bg-white rounded-xl border p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-teal-600" /> 🔗 {countryName}官方资源
                </h2>
                <div className="space-y-2">
                  {staticConfig.officialPostalUrl && (
                    <a href={staticConfig.officialPostalUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <span>📮</span>
                      <span className="text-sm text-teal-600 hover:underline">官方邮政</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                  )}
                  {staticConfig.officialCustomsUrl && (
                    <a href={staticConfig.officialCustomsUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <span>🛃</span>
                      <span className="text-sm text-teal-600 hover:underline">海关/边境</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                  )}
                  {staticConfig.officialImmigrationUrl && (
                    <a href={staticConfig.officialImmigrationUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <span>🛂</span>
                      <span className="text-sm text-teal-600 hover:underline">移民/签证</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Community Discussion (new module) */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-teal-600" /> 💬 {countryName}相关社区讨论
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                <Link href="/bbs" className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm hover:bg-teal-100 transition-colors">
                  {countryName}发货经验
                </Link>
                <Link href="/bbs" className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm hover:bg-teal-100 transition-colors">
                  {countryName}地址邮编问题
                </Link>
                <Link href="/bbs" className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm hover:bg-teal-100 transition-colors">
                  {countryName}报关/HS问题
                </Link>
              </div>
              <Link href="/bbs" className="text-sm text-teal-600 hover:underline">
                进入社区讨论 →
              </Link>
            </div>

            {/* Data Status Notice (for Tier 2/3) */}
            {tier >= 2 && staticConfig && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-2">📊 数据覆盖说明</h2>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>邮编数据库：{staticConfig.postalDataStatus === 'full' ? '✅ 可查' : staticConfig.postalDataStatus === 'partial' ? '⚠️ 部分可查' : '❌ 暂未接入可查询邮编数据库'}</p>
                  <p>地址格式：{staticConfig.addressFormatExample && !staticConfig.addressFormatExample.includes('being collected') ? '✅ 已配置' : '⚠️ 基础参考，待补'}</p>
                  <p>官方链接：{staticConfig.officialPostalUrl && staticConfig.officialPostalUrl.trim() ? '✅ 已确认' : '⚠️ 待确认'}</p>
                  <p>指南/清单：{tier === 1 ? '✅ 已有' : '⚠️ 正在补充'}</p>
                </div>
              </div>
            )}

            {/* Map Reference Note */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-gray-600">
                <MapPin className="w-4 h-4 inline mr-1 text-blue-500" />
                地图参考按城市/地区搜索，不代表精确邮编位置。邮编覆盖范围可能跨越多个街区，如需精确投递请以当地邮政官方查询结果为准。
              </p>
            </div>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {/* DB destination tools/guides/services (existing) */}
            {dest && dest.tools && dest.tools.length > 0 && (
              <div className="bg-white border rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-teal-600" /> 相关工具
                </h3>
                <div className="space-y-2">
                  {dest.tools.map((tool: any, i: number) => (
                    <Link key={i} href={tool.href || `/tools/${tool.slug}`}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                      → {tool.name || tool.label || tool.slug}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* DB destination guides (existing) */}
            {dest && dest.guides && dest.guides.length > 0 && (
              <div className="bg-white border rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-600" /> 相关指南
                </h3>
                <div className="space-y-2">
                  {dest.guides.map((guide: any, i: number) => (
                    <Link key={i} href={guide.href || `/guides/${guide.slug}`}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                      → {guide.title || guide.name || guide.slug}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Smart interlinking (existing) */}
            <SmartRelatedLinks
              country={countryCode}
              tags={cmsCountry?.frontmatter.tags}
              type="destination"
              layout="sidebar"
            />

            {/* Related tools from CMS (existing) */}
            {cmsCountry?.frontmatter.related_tools && cmsCountry.frontmatter.related_tools.length > 0 && (
              <div className="bg-white border rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-600" /> 相关工具
                </h3>
                <div className="space-y-2">
                  {cmsCountry.frontmatter.related_tools.map((tool: string, i: number) => (
                    <Link key={i} href={`/tools/${tool}`}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                      → {tool}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom related links (existing) */}
        <div className="mt-10">
          <SmartRelatedLinks
            country={countryCode}
            tags={cmsCountry?.frontmatter.tags}
            type="destination"
            layout="bottom"
          />
        </div>
      </div>
    </div>
  );
}
