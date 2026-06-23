import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDestinationBySlug, getAllDestinationSlugs, resolveDbSlug } from "@/lib/destinations-db";
import { getCountryBySlug as getCmsCountry } from "@/lib/cms-utils";
import { getCountryBySlug as getStaticCountry, ALL_COUNTRIES, type AllCountryConfig } from "@/lib/all-countries";
import { CountryLocalTimeCard } from "@/components/countries/country-local-time-card";
import { SITE_URL } from "@/lib/seo";
import Link from "next/link";
import { ArrowLeft, BookOpen, Wrench, MessageCircle, ListChecks, MapPin, ExternalLink, Globe, FileText, Package, ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

// Canonical slug aliases — DB uses short slugs, URLs use full canonical
const SLUG_ALIASES: Record<string, string> = {
  "united-states": "usa",
  "united-kingdom": "uk",
  "united-arab-emirates": "uae",
};

export function generateStaticParams() {
  const allSlugs = new Set<string>();
  for (const c of ALL_COUNTRIES) {
    allSlugs.add(c.slug);
  }
  // Also add DB slugs (resolved to canonical)
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

  let dest: Awaited<ReturnType<typeof getDestinationBySlug>> | null = null;
  try {
    dest = await getDestinationBySlug(slug);
  } catch {}

  const aliasSlug = SLUG_ALIASES[slug] || slug;
  const staticConfig = getStaticCountry(aliasSlug) || getStaticCountry(slug);
  const cmsCountry = getCmsCountry(slug) || (aliasSlug !== slug ? getCmsCountry(aliasSlug) : null);

  if (!dest && !staticConfig && !cmsCountry) {
    return { title: "国家页面未找到" };
  }

  const name = dest?.name || staticConfig?.nameZh || cmsCountry?.frontmatter.title || slug;
  const title = dest?.seoTitle || staticConfig?.seoTitle || `${name}地址邮编、时间、货币与发货工具 - 绝世百宝箱`;
  const description = dest?.seoDescription || staticConfig?.seoDescription || `${name}邮编查询、地址格式、时区、货币与发货工具参考。`;
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

/** Unified tool list — single source of truth, no duplicates */
const UNIFIED_TOOLS = [
  { name: "邮编查询", href: "/tools/postal-code", icon: "📮" },
  { name: "地址格式", href: "/tools/address-formatter", icon: "📝" },
  { name: "HS编码查询", href: "/tools/hs-code", icon: "📋" },
  { name: "运费估算器", href: "/tools/shipping-calculator", icon: "🧮" },
  { name: "商业发票", href: "/tools/documents/commercial-invoice", icon: "📄" },
  { name: "装箱单生成", href: "/tools/documents/packing-list", icon: "📦" },
  { name: "汇率换算", href: "/tools/exchange-rate", icon: "💱" },
  { name: "发货任务链", href: "/workspace/task-chains/shipping/new", icon: "🔗" },
];

/** Task chain steps */
const TASK_CHAIN_STEPS = [
  { step: 1, label: "商品信息", desc: "确认品名、数量、价值" },
  { step: 2, label: "HS 编码", desc: "查找海关商品编码" },
  { step: 3, label: "合规检查", desc: "确认进口要求与限制" },
  { step: 4, label: "CBM 计算", desc: "计算体积重与运费" },
  { step: 5, label: "地址邮编", desc: "核实收件人地址与邮编" },
  { step: 6, label: "商业发票", desc: "生成 Commercial Invoice" },
  { step: 7, label: "装箱单", desc: "生成 Packing List" },
  { step: 8, label: "成本估算", desc: "汇总税费与运费" },
];

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Try DB destination
  let dest: Awaited<ReturnType<typeof getDestinationBySlug>> | null = null;
  try {
    dest = await getDestinationBySlug(slug);
  } catch {}

  // Try all-countries static config
  const aliasSlug = SLUG_ALIASES[slug] || slug;
  const staticConfig = getStaticCountry(aliasSlug) || getStaticCountry(slug);

  // Try CMS content
  const cmsCountry = getCmsCountry(slug) || (aliasSlug !== slug ? getCmsCountry(aliasSlug) : null);

  if (!dest && !staticConfig && !cmsCountry) {
    notFound();
  }

  const countryCode = staticConfig?.countryCode || cmsCountry?.frontmatter.country || (dest && 'code' in dest ? (dest as any).code : slug.substring(0, 2)).toUpperCase();
  const countryName = dest?.name || staticConfig?.nameZh || cmsCountry?.frontmatter.title || slug;
  const flagEmoji = staticConfig?.flagEmoji || cmsCountry?.frontmatter.flag || dest?.emoji || "🏳️";
  const tier = staticConfig?.completenessTier || 2;
  const region = staticConfig?.region || dest?.region || "";

  // Build official links — from static config, no fabrication
  const officialLinks: { label: string; url: string; icon: string; verified: boolean }[] = [];
  if (staticConfig?.officialPostalUrl && staticConfig.officialPostalUrl.trim()) {
    officialLinks.push({ label: "官方邮政", url: staticConfig.officialPostalUrl, icon: "📮", verified: true });
  }
  if (staticConfig?.officialCustomsUrl && staticConfig.officialCustomsUrl.trim()) {
    officialLinks.push({ label: "海关/边境", url: staticConfig.officialCustomsUrl, icon: "🛃", verified: true });
  }
  if (staticConfig?.officialImmigrationUrl && staticConfig.officialImmigrationUrl.trim()) {
    officialLinks.push({ label: "移民/签证", url: staticConfig.officialImmigrationUrl, icon: "🛂", verified: true });
  }

  // DB guides → related articles
  const dbGuides = dest?.guides || [];
  // DB services → could be related resources
  const dbServices = dest?.services || [];

  // CMS related tools (merge into unified, no duplicate section)
  const cmsRelatedTools = cmsCountry?.frontmatter.related_tools || [];

  // Postal data status label
  const postalStatusLabel = staticConfig?.postalDataStatus === 'full' ? '✅ 可查' : staticConfig?.postalDataStatus === 'partial' ? '⚠️ 部分可查' : '❌ 暂未接入';
  const addressFormatAvailable = staticConfig?.addressFormatExample && !staticConfig.addressFormatExample.includes('being collected');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ═══════════════════════════════════════════════════════
          HERO INTELLIGENCE AREA
          Left: name + tagline + CTAs + hot searches
          Right: local time + info card (currency, dialing code, etc)
          ═══════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-[#0F3D5E] via-[#1a5276] to-[#2E86C1] text-white">
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-8 md:pt-10 md:pb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">首页</Link>
            <span>/</span>
            <Link href="/destinations" className="hover:text-white">目的地</Link>
            <span>/</span>
            <span className="text-white">{countryName}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
            {/* ─── LEFT: Name + tagline + CTAs ─── */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl md:text-5xl">{flagEmoji}</span>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold">{countryName}</h1>
                  {staticConfig?.nameEn && staticConfig.nameEn !== countryName && (
                    <p className="text-blue-200 text-sm">{staticConfig.nameEn}</p>
                  )}
                </div>
              </div>
              <p className="text-base md:text-lg text-blue-100/90 mb-4 max-w-lg">
                {staticConfig?.heroSubtitle || `${countryName}邮编查询、地址格式、时区、货币与发货工具参考`}
              </p>
              {/* CTAs */}
              <div className="flex flex-wrap gap-2 mb-3">
                <Link href="/tools/postal-code" className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/25 transition-colors">
                  🔍 查询邮编/地址
                </Link>
                <Link href="/tools/address-formatter" className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/25 transition-colors">
                  📝 查看地址格式
                </Link>
                <Link href="/workspace/task-chains/shipping/new" className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/25 transition-colors">
                  🚚 开始发货任务链
                </Link>
                <Link href={`/bbs?country=${countryCode}`} className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/25 transition-colors">
                  💬 进入社区讨论
                </Link>
              </div>
              {/* Hot searches */}
              {staticConfig?.majorCities && staticConfig.majorCities.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-blue-200">
                  <span>热门搜索:</span>
                  {staticConfig.majorCities.slice(0, 5).map((city: string) => (
                    <Link key={city} href={`/tools/postal-code?city=${encodeURIComponent(city)}`}
                      className="px-2 py-0.5 bg-white/10 rounded hover:bg-white/20 transition-colors">
                      {city} 邮编
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* ─── RIGHT: Local time + info card ─── */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-5 space-y-4">
              {/* Local time — in Hero right side, NOT bottom */}
              {staticConfig && staticConfig.defaultTimezone && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-blue-200" />
                    <h2 className="text-sm font-bold text-white">🕐 {countryName}当地时间</h2>
                  </div>
                  <CountryLocalTimeCard
                    timezone={staticConfig.defaultTimezone}
                    referenceCity={staticConfig.capital || staticConfig.nameEn}
                  />
                </div>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/15">
                <div>
                  <p className="text-xs text-blue-200 mb-0.5">时区</p>
                  <p className="text-sm font-medium text-white">{staticConfig?.defaultTimezone || "待补充"}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-200 mb-0.5">货币</p>
                  <p className="text-sm font-medium text-white">{staticConfig?.currencyCode || "—"} {staticConfig?.currencyName || ""}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-200 mb-0.5">电话区号</p>
                  <p className="text-sm font-medium text-white">+{staticConfig?.dialingCode || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-200 mb-0.5">邮编数据</p>
                  <p className="text-sm font-medium text-white">{postalStatusLabel}</p>
                </div>
              </div>

              {/* Major cities */}
              {staticConfig?.majorCities && staticConfig.majorCities.length > 0 && (
                <div className="pt-2 border-t border-white/15">
                  <p className="text-xs text-blue-200 mb-1">主要城市</p>
                  <p className="text-sm text-white">{staticConfig.majorCities.slice(0, 5).join(" · ")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MAIN CONTENT — single column, no sidebar
          ═══════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/destinations" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 mb-6 min-h-[44px]">
          <ArrowLeft className="w-4 h-4" /> 返回全球目的地
        </Link>

        <div className="space-y-6">

          {/* ─── 1. SINGLE TOOLS SECTION (merged, no duplicates) ─── */}
          <div className="bg-white rounded-xl border p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-teal-600" /> 🛠 {countryName}常用工具
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {UNIFIED_TOOLS.map(tool => (
                <Link key={tool.href} href={tool.href}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all text-center">
                  <span className="text-xl">{tool.icon}</span>
                  <span className="text-xs font-medium text-gray-700">{tool.name}</span>
                </Link>
              ))}
            </div>
            {/* Merge DB tools and CMS related tools into this section, no separate sections */}
            {dest?.tools && dest.tools.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">更多工具推荐</p>
                <div className="flex flex-wrap gap-2">
                  {dest.tools.map((tool: any, i: number) => (
                    <Link key={i} href={tool.href || `/tools/${tool.slug}`}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                      → {tool.name || tool.label || tool.slug}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── 2. TASK CHAIN ─── */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-purple-600" /> 🔗 中国寄{countryName}任务链
            </h2>
            <p className="text-sm text-gray-600 mb-4">从地址确认到发货跟踪，一步步完成跨境发货流程。</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {TASK_CHAIN_STEPS.map(s => (
                <div key={s.step} className="bg-white/60 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <span className="w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center font-bold">{s.step}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-800">{s.label}</p>
                  <p className="text-[10px] text-gray-500">{s.desc}</p>
                </div>
              ))}
            </div>
            <Link href="/workspace/task-chains/shipping/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
              开始任务链 →
            </Link>
          </div>

          {/* ─── 3. ADDRESS & POSTAL ─── */}
          {staticConfig && (
            <div className="bg-white rounded-xl border p-5 md:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" /> 📍 {countryName}地址与邮编
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
                  <p className="text-xs text-gray-400 mb-1">邮编数据库</p>
                  <p className="text-sm font-medium text-gray-900">{postalStatusLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">地址格式</p>
                  <p className="text-sm font-medium text-gray-900">{addressFormatAvailable ? "✅ 已配置" : "⚠️ 待补"}</p>
                </div>
              </div>
              {addressFormatAvailable && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-400 mb-1">地址格式示例</p>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{staticConfig.addressFormatExample}</pre>
                </div>
              )}
              <div className="flex gap-2">
                <Link href="/tools/postal-code" className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm hover:bg-teal-100 transition-colors">
                  查询邮编 →
                </Link>
                <Link href="/tools/address-formatter" className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm hover:bg-teal-100 transition-colors">
                  地址格式化 →
                </Link>
              </div>
            </div>
          )}

          {/* ─── 4. OFFICIAL LINKS / 常用网址 ─── */}
          <div className="bg-white rounded-xl border p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-teal-600" /> 🔗 {countryName}常用网址
            </h2>
            {officialLinks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {officialLinks.map(link => (
                  <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                    <span className="text-lg">{link.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{link.label}</p>
                      <p className="text-xs text-gray-400">官方 · 已核验</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">⚠️ 官方链接待核验，暂不展示。如需查询请前往当地邮政官网。</p>
            )}
            {/* DB services as additional resources (clearly labeled as third-party) */}
            {dbServices.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">第三方推荐服务</p>
                <div className="flex flex-wrap gap-2">
                  {dbServices.map((svc: any, i: number) => (
                    <span key={i} className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-lg">
                      {svc.name || svc.title || svc.slug}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── 5. RELATED CHECKLISTS ─── */}
          <div className="bg-white rounded-xl border p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-teal-600" /> 📋 {countryName}相关清单
            </h2>
            {tier === 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href="/checklists/shipping-prep" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                  <span>📦</span>
                  <span className="text-sm text-gray-700">寄{countryName}前资料检查清单</span>
                </Link>
                <Link href="/checklists/commercial-invoice" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                  <span>📄</span>
                  <span className="text-sm text-gray-700">商业发票检查清单</span>
                </Link>
                <Link href="/checklists/packing-list" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                  <span>📦</span>
                  <span className="text-sm text-gray-700">装箱单检查清单</span>
                </Link>
                <Link href="/checklists/address-info" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                  <span>📍</span>
                  <span className="text-sm text-gray-700">地址信息检查清单</span>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-400">⚠️ {countryName}相关清单正在补充中。</p>
            )}
          </div>

          {/* ─── 6. RELATED TOPICS ─── */}
          <div className="bg-white rounded-xl border p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-teal-600" /> 📦 {countryName}相关专题
            </h2>
            {tier === 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href={`/topics?country=${countryCode}`} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                  <span>🚢</span>
                  <span className="text-sm text-gray-700">中国寄{countryName}</span>
                </Link>
                <Link href={`/topics?country=${countryCode}`} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                  <span>📮</span>
                  <span className="text-sm text-gray-700">{countryName}地址邮编</span>
                </Link>
                <Link href={`/topics?country=${countryCode}`} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                  <span>🛃</span>
                  <span className="text-sm text-gray-700">{countryName}清关资料</span>
                </Link>
                <Link href={`/topics?country=${countryCode}`} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                  <span>🛠</span>
                  <span className="text-sm text-gray-700">{countryName}生活工具</span>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-400">⚠️ {countryName}相关专题正在补充中。</p>
            )}
          </div>

          {/* ─── 7. RELATED ARTICLES / GUIDES ─── */}
          <div className="bg-white rounded-xl border p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" /> 📖 {countryName}相关文章
            </h2>
            {dbGuides.length > 0 ? (
              <div className="space-y-2">
                {dbGuides.map((guide: any, i: number) => (
                  <Link key={i} href={guide.href || `/guides/${guide.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <FileText className="w-4 h-4 text-teal-500" />
                    <span className="text-sm text-gray-700">{guide.title || guide.name || guide.slug}</span>
                  </Link>
                ))}
              </div>
            ) : cmsCountry?.content ? (
              <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-a:text-teal-600">
                {cmsCountry.content.split('\n').slice(0, 20).map((line, i) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-lg font-bold text-gray-900 mt-4 mb-2">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-base font-semibold text-gray-800 mt-3 mb-2">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('|')) return null;
                  if (line.trim() === '') return null;
                  return <p key={i} className="text-sm text-gray-700 leading-relaxed mb-1">{line}</p>;
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">⚠️ {countryName}相关文章正在补充中。可前往社区发起讨论。</p>
            )}
          </div>

          {/* ─── 8. COMMUNITY DISCUSSION (→ /bbs only) ─── */}
          <div className="bg-white rounded-xl border p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-teal-600" /> 💬 {countryName}社区讨论
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <Link href={`/bbs?country=${countryCode}&tag=shipping`} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm hover:bg-teal-100 transition-colors">
                {countryName}发货经验
              </Link>
              <Link href={`/bbs?country=${countryCode}&tag=postal`} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm hover:bg-teal-100 transition-colors">
                {countryName}地址邮编问题
              </Link>
              <Link href={`/bbs?country=${countryCode}&tag=customs`} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm hover:bg-teal-100 transition-colors">
                {countryName}报关/HS问题
              </Link>
            </div>
            <Link href={`/bbs?country=${countryCode}`} className="text-sm text-teal-600 hover:underline">
              进入社区讨论 →
            </Link>
          </div>

          {/* ─── 9. FAQ ─── */}
          <div className="bg-white rounded-xl border p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">❓ {countryName}常见问题</h2>
            <div className="space-y-3">
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-800 hover:text-teal-600 flex items-center gap-2">
                  <span className="text-teal-500">Q1.</span> 如何查询{countryName}邮编？
                </summary>
                <p className="text-sm text-gray-600 mt-1 pl-6">使用本站邮编查询工具，输入城市名或地区名即可搜索。{postalStatusLabel === '✅ 可查' ? '当前国家支持数据库查询。' : '当前国家暂未接入数据库，可查看地址格式参考。'}</p>
              </details>
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-800 hover:text-teal-600 flex items-center gap-2">
                  <span className="text-teal-500">Q2.</span> 寄{countryName}需要什么资料？
                </summary>
                <p className="text-sm text-gray-600 mt-1 pl-6">通常需要商业发票（Commercial Invoice）、装箱单（Packing List）、收件人完整地址。建议使用任务链功能逐步完成。</p>
              </details>
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-800 hover:text-teal-600 flex items-center gap-2">
                  <span className="text-teal-500">Q3.</span> {countryName}地址格式怎么写？
                </summary>
                <p className="text-sm text-gray-600 mt-1 pl-6">{addressFormatAvailable ? '请参考上方地址格式示例。' : '地址格式正在补充中，正式寄件请以当地邮政要求为准。'}</p>
              </details>
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-800 hover:text-teal-600 flex items-center gap-2">
                  <span className="text-teal-500">Q4.</span> 地图结果是否代表精确邮编位置？
                </summary>
                <p className="text-sm text-gray-600 mt-1 pl-6">地图参考按城市/地区搜索，不代表精确邮编位置。邮编覆盖范围可能跨越多个街区，如需精确投递请以当地邮政官方查询结果为准。</p>
              </details>
              {tier >= 2 && (
                <p className="text-xs text-gray-400 mt-2">⚠️ 以上为通用 FAQ，{countryName}专属 FAQ 正在补充中。</p>
              )}
            </div>
          </div>

          {/* ─── 10. DATA DISCLAIMER ─── */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-blue-500" />
              <strong>数据说明：</strong>邮编和地址格式仅供参考，正式寄件请以当地邮政官方要求为准。地图参考按城市/地区搜索，不代表精确邮编位置。
              {officialLinks.length === 0 && ' 官方链接待核验，暂不展示。'}
              {tier >= 2 && ' 部分内容仍在补充中，如有疑问请前往社区讨论。'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
