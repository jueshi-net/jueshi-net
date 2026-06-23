import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDestinationPageConfig, getVisibleModules, getOfficialLinks, getFaqs, getAdSlots } from "@/lib/destinations/get-destination-page-config";
import { ALL_COUNTRIES } from "@/lib/all-countries";
import { CountryLocalTimeCard } from "@/components/countries/country-local-time-card";
import { SITE_URL } from "@/lib/seo";
import SmartRelatedLinks from "@/components/smart-related-links";
import Link from "next/link";
import { ArrowLeft, BookOpen, Wrench, MessageCircle, ListChecks, MapPin, ExternalLink, Globe, FileText, Package, ClipboardList, Compass, Megaphone, Clock, Phone, Coins, Building2, ChevronRight } from "lucide-react";

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
    icon: "📮",
    tools: [
      { name: "邮编查询", href: "/tools/postal-code", icon: "📮" },
      { name: "地址格式", href: "/tools/address-formatter", icon: "📝" },
    ],
  },
  {
    label: "时间/货币/电话",
    icon: "🕐",
    tools: [
      { name: "汇率换算", href: "/tools/exchange-rate", icon: "💱" },
      { name: "时间换算", href: "/tools/time-converter", icon: "🕐" },
    ],
  },
  {
    label: "跨境发货",
    icon: "🚢",
    tools: [
      { name: "HS编码查询", href: "/tools/hs-code", icon: "📋" },
      { name: "运费估算器", href: "/tools/shipping-calculator", icon: "🧮" },
      { name: "发货任务链", href: "/workspace/task-chains/shipping/new", icon: "🔗" },
    ],
  },
  {
    label: "文档生成",
    icon: "📄",
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
  { icon: "📮", label: "查地址邮编", desc: "邮编查询与地址格式", href: "/tools/postal-code" },
  { icon: "📖", label: "看生活/办事指南", desc: "入境、税务、生活", href: "#guides" },
  { icon: "🚚", label: "准备寄送资料", desc: "商业发票与装箱单", href: "#taskChain" },
  { icon: "🔗", label: "找官方资源", desc: "邮政、海关、移民", href: "#officialLinks" },
  { icon: "📋", label: "看清单", desc: "发货与地址检查", href: "#checklists" },
  { icon: "💬", label: "去社区提问", desc: "经验交流与反馈", href: "#community" },
];

/** Section card wrapper — unified visual language matching /bbs */
function SectionCard({ id, icon, title, children, className = "" }: { id?: string; icon: React.ReactNode; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`bg-white rounded-xl border border-gray-200 p-5 md:p-6 ${className}`}>
      <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

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

  const dbGuides = config.guides;
  const dbServices = config.services;

  // Split modules: main column vs sidebar
  const MAIN_MODULES = ["guides", "topics", "checklists", "tools", "officialLinks", "taskChain", "community", "faq"];
  const mainModuleKeys = visibleModules.filter(k => MAIN_MODULES.includes(k));

  // Sidebar ad slot
  const sidebarAd = adSlots.find(s => s.placement === "sidebar_resource");
  const afterGuidesAd = adSlots.find(s => s.placement === "after_guides");
  const afterToolsAd = adSlots.find(s => s.placement === "after_tools");
  const heroSecondaryAd = adSlots.find(s => s.placement === "hero_secondary");
  const bottomSponsorAd = adSlots.find(s => s.placement === "bottom_sponsor");

  const renderAdSlot = (slot: typeof heroSecondaryAd | undefined) => {
    if (!slot) return null;
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-3 text-center">
        <span className="text-xs text-gray-400 inline-flex items-center gap-1">
          <Megaphone className="w-3 h-3" /> {slot.label || "广告位"}
          {slot.sponsorName && ` · 赞助: ${slot.sponsorName}`}
        </span>
        {slot.title && <p className="text-sm font-medium text-gray-600 mt-0.5">{slot.title}</p>}
        {slot.description && <p className="text-xs text-gray-500 mt-0.5">{slot.description}</p>}
        {slot.linkUrl && <Link href={slot.linkUrl} className="text-xs text-teal-600 hover:underline mt-0.5 inline-block">了解更多 →</Link>}
      </div>
    );
  };

  const renderMainModule = (key: string) => {
    switch (key) {
      case "guides":
        return (
          <SectionCard key="guides" id="guides" icon={<BookOpen className="w-5 h-5 text-teal-600" />} title={`${countryName}实用指南`}>
            {dbGuides.length > 0 ? (
              <div className="space-y-2">
                {/* First guide as featured card */}
                <Link href={`/guides/${countryCode.toLowerCase()}-${dbGuides[0].title.toLowerCase().replace(/\s+/g, "-")}`}
                  className="block p-4 rounded-lg border border-teal-100 bg-gradient-to-r from-teal-50/50 to-transparent hover:shadow-md hover:border-teal-200 transition-all">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{dbGuides[0].title}</p>
                      {dbGuides[0].description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{dbGuides[0].description}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 mt-1" />
                  </div>
                </Link>
                {/* Remaining guides as compact cards */}
                {dbGuides.length > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {dbGuides.slice(1).map((guide, i) => (
                      <Link key={i} href={`/guides/${countryCode.toLowerCase()}-${guide.title.toLowerCase().replace(/\s+/g, "-")}`}
                        className="block p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">{guide.title}</p>
                            {guide.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{guide.description}</p>}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">⚠️ {countryName}专属指南正在补充中。可前往社区发起讨论。</p>
            )}
          </SectionCard>
        );

      case "topics":
        return (
          <SectionCard key="topics" icon={<Package className="w-5 h-5 text-teal-600" />} title={`${countryName}专题`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { icon: "📮", label: "地址与邮编" },
                { icon: "🛠", label: "生活工具" },
                { icon: "🚢", label: `中国寄${countryName}` },
                { icon: "🛃", label: "报关资料" },
                { icon: "🔗", label: "官方资源" },
              ].map((topic, i) => (
                <Link key={i} href={`/topics?country=${countryCode}`}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 hover:shadow-sm transition-all text-center">
                  <span className="text-xl">{topic.icon}</span>
                  <span className="text-xs font-medium text-gray-700">{topic.label}</span>
                </Link>
              ))}
            </div>
          </SectionCard>
        );

      case "checklists":
        return (
          <SectionCard key="checklists" id="checklists" icon={<ClipboardList className="w-5 h-5 text-teal-600" />} title={`${countryName}清单`}>
            {tier === 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { icon: "📍", label: `${countryName}地址信息检查清单`, steps: "5 步" },
                  { icon: "📦", label: `寄${countryName}资料准备清单`, steps: "8 步" },
                  { icon: "📄", label: "商业发票检查清单", steps: "6 步" },
                  { icon: "📦", label: "装箱单检查清单", steps: "5 步" },
                ].map((item, i) => (
                  <Link key={i} href="/checklists"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 hover:shadow-sm transition-all">
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{item.label}</p>
                      <p className="text-[10px] text-gray-400">{item.steps}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">⚠️ {countryName}相关清单正在补充中。</p>
            )}
          </SectionCard>
        );

      case "tools":
        return (
          <SectionCard key="tools" icon={<Wrench className="w-5 h-5 text-teal-600" />} title={`${countryName}常用工具`}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {TOOL_GROUPS.map(group => (
                <div key={group.label} className="p-3 rounded-lg bg-gray-50/50 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">{group.icon} {group.label}</p>
                  <div className="space-y-1.5">
                    {group.tools.map(tool => (
                      <Link key={tool.href} href={tool.href}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all text-xs">
                        <span>{tool.icon}</span>
                        <span className="font-medium text-gray-700">{tool.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {config.dbTools.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {config.dbTools.map((t, i) => (
                    <Link key={i} href={`/tools/${t.toolSlug}`} className="px-2.5 py-1 text-xs text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                      → {t.toolSlug}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        );

      case "officialLinks":
        return (
          <SectionCard key="officialLinks" id="officialLinks" icon={<ExternalLink className="w-5 h-5 text-teal-600" />} title={`${countryName}常用网址`}>
            {officialLinks.length > 0 ? (
              <div className="space-y-2">
                {officialLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all">
                    <span className="text-xl">{link.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{link.label}</p>
                      <p className="text-xs text-gray-400">{link.category}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${link.type === "official" ? "bg-green-50 text-green-600 border border-green-100" : link.type === "third-party" ? "bg-gray-50 text-gray-500 border border-gray-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                      {link.type === "official" ? "官方 · 已核验" : link.type === "third-party" ? "第三方" : "待核验"}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">⚠️ 官方链接待核验，暂不展示。如需查询请前往当地邮政官网。</p>
            )}
            {dbServices.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">第三方推荐服务</p>
                <div className="flex flex-wrap gap-2">
                  {dbServices.map((svc, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs bg-gray-50 text-gray-600 rounded-lg">{svc.title}</span>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        );

      case "taskChain":
        return (
          <div key="taskChain" id="taskChain" className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 rounded-xl border border-purple-100 p-5 md:p-6">
            <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-purple-600" /> 中国寄{countryName}任务链
            </h2>
            <p className="text-sm text-gray-600 mb-4">从地址确认到发货跟踪，一步步完成跨境发货流程。</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-4">
              {TASK_CHAIN_STEPS.map(s => (
                <div key={s.step} className="bg-white/70 rounded-lg p-2 text-center">
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
          <SectionCard key="community" id="community" icon={<MessageCircle className="w-5 h-5 text-teal-600" />} title={`${countryName}社区讨论`}>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { label: `${countryName}地址邮编问题`, tag: "postal" },
                { label: `${countryName}发货经验`, tag: "shipping" },
                { label: `${countryName}报关/HS问题`, tag: "customs" },
                { label: "官方资源补充", tag: "resources" },
                { label: "工具反馈", tag: "feedback" },
              ].map(item => (
                <Link key={item.tag} href={`/bbs?country=${countryCode}&tag=${item.tag}`}
                  className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-xs hover:bg-teal-100 transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
            <Link href={`/bbs?country=${countryCode}`} className="text-sm text-teal-600 hover:underline">进入社区讨论 →</Link>
          </SectionCard>
        );

      case "faq":
        return (
          <SectionCard key="faq" icon={<span className="text-lg">❓</span>} title={`${countryName}常见问题`}>
            <div className="space-y-2">
              {faqs.map((qa, i) => (
                <details key={i} className="group rounded-lg border border-gray-100 overflow-hidden">
                  <summary className="cursor-pointer text-sm font-medium text-gray-800 hover:text-teal-600 px-3 py-2.5 flex items-center gap-2 select-none">
                    <span className="text-teal-500 shrink-0">Q{i + 1}.</span>
                    <span className="flex-1">{qa.question}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-open:rotate-90 transition-transform shrink-0" />
                  </summary>
                  <p className="text-sm text-gray-600 px-3 pb-3 pl-8">{qa.answer}</p>
                </details>
              ))}
              {tier >= 2 && <p className="text-xs text-gray-400 mt-2">⚠️ 以上为通用 FAQ，{countryName}专属 FAQ 正在补充中。</p>}
            </div>
          </SectionCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero — full width */}
      {visibleModules.includes("hero") && (
        <div className="bg-gradient-to-br from-[#0F3D5E] via-[#1a5276] to-[#2E86C1] text-white">
          <div className="max-w-[1280px] mx-auto px-4 pt-6 pb-8 md:pt-10 md:pb-12">
            <nav className="flex items-center gap-1.5 text-sm text-blue-200 mb-4">
              <Link href="/" className="hover:text-white">首页</Link>
              <span>/</span>
              <Link href="/destinations" className="hover:text-white">目的地</Link>
              <span>/</span>
              <span className="text-white">{countryName}</span>
            </nav>
            <div className="grid md:grid-cols-[1.4fr_1fr] gap-6 md:gap-8 items-start">
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
                    <Link key={cta.href} href={cta.href}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/25 transition-colors">
                      {cta.icon} {cta.label}
                    </Link>
                  ))}
                </div>
                {config.majorCities.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-blue-200">
                    <span>热门搜索:</span>
                    {config.majorCities.slice(0, 5).map((city: string) => (
                      <Link key={city} href={`/tools/postal-code?city=${encodeURIComponent(city)}`}
                        className="px-2 py-0.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
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
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-200" />
                    <div><p className="text-xs text-blue-200">时区</p><p className="text-sm font-medium text-white">{config.timezone}</p></div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-blue-200" />
                    <div><p className="text-xs text-blue-200">货币</p><p className="text-sm font-medium text-white">{config.currencyCode} {config.currencyName}</p></div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-200" />
                    <div><p className="text-xs text-blue-200">电话区号</p><p className="text-sm font-medium text-white">{config.dialingCode || "—"}</p></div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-200" />
                    <div><p className="text-xs text-blue-200">邮编数据</p><p className="text-sm font-medium text-white">{postalStatusLabel}</p></div>
                  </div>
                </div>
                {config.majorCities.length > 0 && (
                  <div className="pt-2 border-t border-white/15">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-200" />
                      <p className="text-xs text-blue-200">主要城市</p>
                    </div>
                    <p className="text-sm text-white">{config.majorCities.slice(0, 5).join(" · ")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main container — two-column on desktop */}
      <div className="max-w-[1280px] mx-auto px-4 py-6">
        <Link href="/destinations" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> 返回全球目的地
        </Link>

        {/* Quick entry — full width */}
        {visibleModules.includes("quickEntry") && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-600" /> 你可能想在{countryName}做什么？
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {QUICK_ENTRIES.map(entry => (
                <Link key={entry.href} href={entry.href}
                  className="flex flex-col items-start gap-1 p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all">
                  <span className="text-xl">{entry.icon}</span>
                  <p className="text-sm font-medium text-gray-800">{entry.label}</p>
                  <p className="text-[10px] text-gray-400">{entry.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Hero secondary ad */}
        {visibleModules.includes("adSlots") && heroSecondaryAd && (
          <div className="mb-6">{renderAdSlot(heroSecondaryAd)}</div>
        )}

        {/* Two-column layout: main (2/3) + sidebar (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* ─── LEFT: Main content ─── */}
          <div className="space-y-4 min-w-0">
            {mainModuleKeys.map((key, idx) => (
              <div key={key}>
                {renderMainModule(key)}
                {/* After-guides ad */}
                {key === "guides" && visibleModules.includes("adSlots") && afterGuidesAd && (
                  <div className="mt-4">{renderAdSlot(afterGuidesAd)}</div>
                )}
                {/* After-tools ad */}
                {key === "tools" && visibleModules.includes("adSlots") && afterToolsAd && (
                  <div className="mt-4">{renderAdSlot(afterToolsAd)}</div>
                )}
              </div>
            ))}

            {/* SmartRelatedLinks — restored legacy */}
            {visibleModules.includes("disclaimer") && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 inline mr-1 text-blue-500" />
                  <strong>数据说明：</strong>邮编和地址格式仅供参考，正式寄件请以当地邮政官方要求为准。地图参考按城市/地区搜索，不代表精确邮编位置。
                  {officialLinks.length === 0 && " 官方链接待核验，暂不展示。"}
                  {tier >= 2 && " 部分内容仍在补充中，如有疑问请前往社区讨论。"}
                </p>
              </div>
            )}
          </div>

          {/* ─── RIGHT: Sidebar (sticky) ─── */}
          <aside className="hidden lg:block">
            <div className="sticky top-4 space-y-4">
              {/* Country snapshot */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-teal-600" /> {countryName}速览
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 时区</span>
                    <span className="font-medium text-gray-800">{config.timezone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1.5"><Coins className="w-3.5 h-3.5" /> 货币</span>
                    <span className="font-medium text-gray-800">{config.currencyCode}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> 区号</span>
                    <span className="font-medium text-gray-800">{config.dialingCode || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> 邮编</span>
                    <span className="font-medium text-gray-800">{postalStatusLabel}</span>
                  </div>
                  {config.majorCities.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-gray-400 text-xs mb-1">主要城市</p>
                      <p className="text-sm text-gray-700">{config.majorCities.slice(0, 5).join(" · ")}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick tools */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-teal-600" /> 快捷工具
                </h3>
                <div className="space-y-1.5">
                  {[
                    { name: "邮编查询", href: "/tools/postal-code", icon: "📮" },
                    { name: "地址格式", href: "/tools/address-formatter", icon: "📝" },
                    { name: "汇率换算", href: "/tools/exchange-rate", icon: "💱" },
                    { name: "发货任务链", href: "/workspace/task-chains/shipping/new", icon: "🔗" },
                  ].map(tool => (
                    <Link key={tool.href} href={tool.href}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-teal-50/50 transition-colors text-sm">
                      <span>{tool.icon}</span>
                      <span className="text-gray-700">{tool.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Official resources */}
              {officialLinks.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-teal-600" /> 官方资源
                  </h3>
                  <div className="space-y-1.5">
                    {officialLinks.slice(0, 4).map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        <span>{link.icon}</span>
                        <span className="text-gray-700 flex-1">{link.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${link.type === "official" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                          {link.type === "official" ? "官方" : "待核验"}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Community entry */}
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-100 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-teal-600" /> 社区讨论
                </h3>
                <p className="text-xs text-gray-500 mb-3">有问题？去社区提问或分享经验。</p>
                <Link href={`/bbs?country=${countryCode}`}
                  className="block w-full text-center px-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                  进入{countryName}社区 →
                </Link>
              </div>

              {/* Sidebar ad */}
              {visibleModules.includes("adSlots") && sidebarAd && renderAdSlot(sidebarAd)}
            </div>
          </aside>
        </div>

        {/* SmartRelatedLinks — full width bottom */}
        <div className="mt-6">
          <SmartRelatedLinks country={countryCode} type="destination" layout="bottom" />
        </div>

        {/* Bottom sponsor ad */}
        {visibleModules.includes("adSlots") && bottomSponsorAd && (
          <div className="mt-6">{renderAdSlot(bottomSponsorAd)}</div>
        )}
      </div>
    </div>
  );
}
