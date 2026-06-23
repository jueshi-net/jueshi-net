import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDestinationPageConfig, getVisibleModules, getOfficialLinks, getFaqs, getAdSlots } from "@/lib/destinations/get-destination-page-config";
import { ALL_COUNTRIES } from "@/lib/all-countries";
import { CountryLocalTimeCard } from "@/components/countries/country-local-time-card";
import { SITE_URL } from "@/lib/seo";
import SmartRelatedLinks from "@/components/smart-related-links";
import Link from "next/link";
import { ArrowLeft, BookOpen, Wrench, MessageCircle, ListChecks, MapPin, ExternalLink, Globe, FileText, Package, ClipboardList, Compass, Megaphone } from "lucide-react";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  const allSlugs = new Set<string>();
  for (const c of ALL_COUNTRIES) allSlugs.add(c.slug);
  try {
    const { REGION_GROUPS } = require("@/lib/destinations-db");
    for (const g of REGION_GROUPS) for (const s of g.slugs) allSlugs.add(s);
  } catch {}
  return Array.from(allSlugs).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const config = await getDestinationPageConfig(slug);
  if (!config) return { title: "国家页面未找到" };

  const canonical = `${SITE_URL}/destinations/${slug}`;
  return {
    title: config.seoTitle,
    description: config.seoDescription,
    alternates: { canonical },
    robots: config.indexable ? "index,follow" : "noindex,nofollow",
    openGraph: {
      title: config.seoTitle,
      description: config.seoDescription,
      url: canonical,
      locale: "zh_CN",
      type: "website",
      siteName: "绝世百宝箱",
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: config.seoTitle }],
    },
  };
}

/** Unified tool list — single source, grouped by category */
const TOOL_GROUPS = [
  {
    label: "地址与邮编",
    tools: [
      { name: "邮编查询", href: "/tools/postal-code", icon: "📮" },
      { name: "地址格式", href: "/tools/address-formatter", icon: "📝" },
    ],
  },
  {
    label: "时间/货币/电话",
    tools: [
      { name: "汇率换算", href: "/tools/exchange-rate", icon: "💱" },
      { name: "时间换算", href: "/tools/time-converter", icon: "🕐" },
    ],
  },
  {
    label: "跨境发货",
    tools: [
      { name: "HS编码查询", href: "/tools/hs-code", icon: "📋" },
      { name: "运费估算器", href: "/tools/shipping-calculator", icon: "🧮" },
      { name: "发货任务链", href: "/workspace/task-chains/shipping/new", icon: "🔗" },
    ],
  },
  {
    label: "文档生成",
    tools: [
      { name: "商业发票", href: "/tools/documents/commercial-invoice", icon: "📄" },
      { name: "装箱单生成", href: "/tools/documents/packing-list", icon: "📦" },
    ],
  },
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

/** Quick entry cards */
const QUICK_ENTRIES = [
  { icon: "📮", label: "查地址邮编", href: "/tools/postal-code" },
  { icon: "📖", label: "看生活/办事指南", href: "#guides" },
  { icon: "🚚", label: "准备寄送资料", href: "#taskChain" },
  { icon: "🔗", label: "找官方资源", href: "#officialLinks" },
  { icon: "📋", label: "看清单", href: "#checklists" },
  { icon: "💬", label: "去社区提问", href: "#community" },
];

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = await getDestinationPageConfig(slug);
  if (!config) notFound();

  const visibleModules = getVisibleModules(config);
  const officialLinks = getOfficialLinks(config);
  const faqs = getFaqs(config);
  const adSlots = getAdSlots(config);

  const { countryName, flagEmoji, countryCode, tier } = config;
  const postalStatusLabel = config.postalDataStatus === "full" ? "✅ 可查" : config.postalDataStatus === "partial" ? "⚠️ 部分可查" : "❌ 暂未接入";
  const addressFormatAvailable = config.addressFormatExample && !config.addressFormatExample.includes("being collected");

  // DB guides → articles
  const dbGuides = config.guides;
  const dbServices = config.services;

  const renderModule = (key: string) => {
    if (!visibleModules.includes(key)) return null;

    switch (key) {
      case "hero":
        return (
          <div key="hero" className="bg-gradient-to-br from-[#0F3D5E] via-[#1a5276] to-[#2E86C1] text-white">
            <div className="max-w-6xl mx-auto px-4 pt-6 pb-8 md:pt-10 md:pb-12">
              <nav className="flex items-center gap-1.5 text-sm text-blue-200 mb-4">
                <Link href="/" className="hover:text-white">首页</Link>
                <span>/</span>
                <Link href="/destinations" className="hover:text-white">目的地</Link>
                <span>/</span>
                <span className="text-white">{countryName}</span>
              </nav>
              <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
                {/* LEFT: Name + tagline + CTAs */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl md:text-5xl">{flagEmoji}</span>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-extrabold">{countryName}</h1>
                      {config.countryNameEn && config.countryNameEn !== countryName && (
                        <p className="text-blue-200 text-sm">{config.countryNameEn}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-base md:text-lg text-blue-100/90 mb-4 max-w-lg">{config.heroSubtitle}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {config.heroCtas.map(cta => (
                      <Link key={cta.href} href={cta.href} className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/25 transition-colors">
                        {cta.icon} {cta.label}
                      </Link>
                    ))}
                  </div>
                  {config.majorCities.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-blue-200">
                      <span>热门搜索:</span>
                      {config.majorCities.slice(0, 5).map((city: string) => (
                        <Link key={city} href={`/tools/postal-code?city=${encodeURIComponent(city)}`} className="px-2 py-0.5 bg-white/10 rounded hover:bg-white/20 transition-colors">
                          {city} 邮编
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                {/* RIGHT: Local time + info card */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-5 space-y-4">
                  {config.timezone && config.timezone !== "待补充" && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-5 h-5 text-blue-200" />
                        <h2 className="text-sm font-bold text-white">🕐 {countryName}当地时间</h2>
                      </div>
                      <CountryLocalTimeCard timezone={config.timezone} referenceCity={config.majorCities[0] || config.countryNameEn} />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/15">
                    <div><p className="text-xs text-blue-200 mb-0.5">时区</p><p className="text-sm font-medium text-white">{config.timezone}</p></div>
                    <div><p className="text-xs text-blue-200 mb-0.5">货币</p><p className="text-sm font-medium text-white">{config.currencyCode} {config.currencyName}</p></div>
                    <div><p className="text-xs text-blue-200 mb-0.5">电话区号</p><p className="text-sm font-medium text-white">{config.dialingCode || "—"}</p></div>
                    <div><p className="text-xs text-blue-200 mb-0.5">邮编数据</p><p className="text-sm font-medium text-white">{postalStatusLabel}</p></div>
                  </div>
                  {config.majorCities.length > 0 && (
                    <div className="pt-2 border-t border-white/15">
                      <p className="text-xs text-blue-200 mb-1">主要城市</p>
                      <p className="text-sm text-white">{config.majorCities.slice(0, 5).join(" · ")}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "quickEntry":
        return (
          <div key="quickEntry" className="bg-white rounded-xl border p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-600" /> 你可能想在{countryName}做什么？
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {QUICK_ENTRIES.map(entry => (
                <Link key={entry.href} href={entry.href} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                  <span className="text-lg">{entry.icon}</span>
                  <span className="text-sm text-gray-700">{entry.label}</span>
                </Link>
              ))}
            </div>
          </div>
        );

      case "guides":
        return (
          <div key="guides" id="guides" className="bg-white rounded-xl border p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" /> 📖 {countryName}实用指南
            </h2>
            {dbGuides.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dbGuides.map((guide, i) => (
                  <Link key={i} href={`/guides/${countryCode.toLowerCase()}-${guide.title.toLowerCase().replace(/\s+/g, "-")}`} className="block p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{guide.title}</p>
                        {guide.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{guide.description}</p>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">⚠️ {countryName}专属指南正在补充中。可前往社区发起讨论。</p>
            )}
          </div>
        );

      case "topics":
        return (
          <div key="topics" className="bg-white rounded-xl border p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-teal-600" /> 📦 {countryName}专题
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: "📮", label: `${countryName}地址与邮编` },
                { icon: "🛠", label: `${countryName}生活工具` },
                { icon: "🚢", label: `中国寄${countryName}` },
                { icon: "🛃", label: `${countryName}报关资料` },
                { icon: "🔗", label: `${countryName}常用官方资源` },
              ].map((topic, i) => (
                <Link key={i} href={`/topics?country=${countryCode}`} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                  <span>{topic.icon}</span>
                  <span className="text-sm text-gray-700">{topic.label}</span>
                </Link>
              ))}
            </div>
          </div>
        );

      case "checklists":
        return (
          <div key="checklists" id="checklists" className="bg-white rounded-xl border p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-teal-600" /> 📋 {countryName}清单
            </h2>
            {tier === 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: "📍", label: `${countryName}地址信息检查清单` },
                  { icon: "📦", label: `寄${countryName}资料准备清单` },
                  { icon: "📄", label: "商业发票检查清单" },
                  { icon: "📦", label: "装箱单检查清单" },
                ].map((item, i) => (
                  <Link key={i} href="/checklists" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                    <span>{item.icon}</span>
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">⚠️ {countryName}相关清单正在补充中。</p>
            )}
          </div>
        );

      case "tools":
        return (
          <div key="tools" className="bg-white rounded-xl border p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-teal-600" /> 🛠 {countryName}常用工具
            </h2>
            <div className="space-y-4">
              {TOOL_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="text-xs text-gray-400 mb-2">{group.label}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {group.tools.map(tool => (
                      <Link key={tool.href} href={tool.href} className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all text-center">
                        <span className="text-lg">{tool.icon}</span>
                        <span className="text-xs font-medium text-gray-700">{tool.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* DB tools merged here, no separate section */}
            {config.dbTools.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">更多工具</p>
                <div className="flex flex-wrap gap-2">
                  {config.dbTools.map((t, i) => (
                    <Link key={i} href={`/tools/${t.toolSlug}`} className="px-3 py-1 text-xs text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                      → {t.toolSlug}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "officialLinks":
        return (
          <div key="officialLinks" id="officialLinks" className="bg-white rounded-xl border p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-teal-600" /> 🔗 {countryName}常用网址
            </h2>
            {officialLinks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {officialLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                    <span className="text-lg">{link.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{link.label}</p>
                      <p className="text-xs text-gray-400">
                        {link.type === "official" ? "官方 · 已核验" : link.type === "third-party" ? "第三方" : "待核验"}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">⚠️ 官方链接待核验，暂不展示。如需查询请前往当地邮政官网。</p>
            )}
            {dbServices.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">第三方推荐服务</p>
                <div className="flex flex-wrap gap-2">
                  {dbServices.map((svc, i) => (
                    <span key={i} className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-lg">{svc.title}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "taskChain":
        return (
          <div key="taskChain" id="taskChain" className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-5 md:p-6">
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
            <Link href="/workspace/task-chains/shipping/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
              开始任务链 →
            </Link>
          </div>
        );

      case "community":
        return (
          <div key="community" id="community" className="bg-white rounded-xl border p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-teal-600" /> 💬 {countryName}社区讨论
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <Link href={`/bbs?country=${countryCode}&tag=postal`} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm hover:bg-teal-100 transition-colors">{countryName}地址邮编问题</Link>
              <Link href={`/bbs?country=${countryCode}&tag=shipping`} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm hover:bg-teal-100 transition-colors">{countryName}发货经验</Link>
              <Link href={`/bbs?country=${countryCode}&tag=customs`} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm hover:bg-teal-100 transition-colors">{countryName}报关/HS问题</Link>
              <Link href={`/bbs?country=${countryCode}&tag=resources`} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm hover:bg-teal-100 transition-colors">官方资源补充</Link>
              <Link href={`/bbs?country=${countryCode}&tag=feedback`} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm hover:bg-teal-100 transition-colors">工具反馈</Link>
            </div>
            <Link href={`/bbs?country=${countryCode}`} className="text-sm text-teal-600 hover:underline">进入社区讨论 →</Link>
          </div>
        );

      case "faq":
        return (
          <div key="faq" className="bg-white rounded-xl border p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">❓ {countryName}常见问题</h2>
            <div className="space-y-3">
              {faqs.map((qa, i) => (
                <details key={i} className="group">
                  <summary className="cursor-pointer text-sm font-medium text-gray-800 hover:text-teal-600 flex items-center gap-2">
                    <span className="text-teal-500">Q{i + 1}.</span> {qa.question}
                  </summary>
                  <p className="text-sm text-gray-600 mt-1 pl-6">{qa.answer}</p>
                </details>
              ))}
              {tier >= 2 && <p className="text-xs text-gray-400 mt-2">⚠️ 以上为通用 FAQ，{countryName}专属 FAQ 正在补充中。</p>}
            </div>
          </div>
        );

      case "adSlots":
        return adSlots.length > 0 ? (
          <div key="adSlots" className="space-y-3">
            {adSlots.map(slot => (
              <div key={slot.id} className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center">
                <span className="text-xs text-gray-400 inline-flex items-center gap-1">
                  <Megaphone className="w-3 h-3" /> {slot.label || "广告位"}
                  {slot.sponsorName && ` · 赞助: ${slot.sponsorName}`}
                </span>
                {slot.title && <p className="text-sm font-medium text-gray-600 mt-1">{slot.title}</p>}
                {slot.description && <p className="text-xs text-gray-500 mt-0.5">{slot.description}</p>}
                {slot.linkUrl && <Link href={slot.linkUrl} className="text-xs text-teal-600 hover:underline mt-1 inline-block">了解更多 →</Link>}
              </div>
            ))}
          </div>
        ) : null;

      case "disclaimer":
        return (
          <div key="disclaimer" className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-blue-500" />
              <strong>数据说明：</strong>邮编和地址格式仅供参考，正式寄件请以当地邮政官方要求为准。地图参考按城市/地区搜索，不代表精确邮编位置。
              {officialLinks.length === 0 && " 官方链接待核验，暂不展示。"}
              {tier >= 2 && " 部分内容仍在补充中，如有疑问请前往社区讨论。"}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/destinations" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 mb-6 min-h-[44px]">
          <ArrowLeft className="w-4 h-4" /> 返回全球目的地
        </Link>

        {/* Render modules in config-specified order */}
        <div className="space-y-6">
          {visibleModules.map(key => renderModule(key))}
        </div>

        {/* Smart interlinking (restored from legacy) */}
        <div className="mt-8">
          <SmartRelatedLinks country={countryCode} type="destination" layout="bottom" />
        </div>
      </div>
    </div>
  );
}
