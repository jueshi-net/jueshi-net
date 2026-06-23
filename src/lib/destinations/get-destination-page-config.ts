/**
 * Destination Page Config Service
 *
 * Unified service that merges:
 * 1. DB Destination record (admin-configurable: heroTitle, heroSubtitle, SEO, guides, services, tools, moduleConfig JSON)
 * 2. Static all-countries config (timezone, currency, dialing code, postal data, etc.)
 *
 * The front-end detail page reads ONLY from this service.
 */

import { getDestinationBySlug, resolveDbSlug } from "@/lib/destinations-db";
import { getCountryBySlug, type AllCountryConfig } from "@/lib/all-countries";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ModuleConfig {
  visible: boolean;
  sortOrder: number;
  title?: string;
}

export interface OfficialLinkConfig {
  label: string;
  url: string;
  icon: string;
  type: "official" | "third-party" | "unverified";
  verified: boolean;
  category?: string;
  sortOrder: number;
}

export interface FaqConfig {
  question: string;
  answer: string;
  sortOrder: number;
}

export interface AdSlotConfig {
  id: string;
  name: string;
  placement: "hero_secondary" | "after_guides" | "sidebar_resource" | "after_tools" | "bottom_sponsor";
  enabled: boolean;
  label: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  sponsorName?: string;
  sortOrder: number;
}

export interface DestinationModuleConfig {
  modules: Record<string, ModuleConfig>;
  officialLinks?: OfficialLinkConfig[];
  faqs?: FaqConfig[];
  adSlots?: AdSlotConfig[];
  heroTagline?: string;
  heroCtas?: { label: string; href: string; icon: string }[];
}

export interface DestinationPageConfig {
  // Identity
  slug: string;
  canonicalSlug: string;
  countryName: string;
  countryNameEn: string;
  flagEmoji: string;
  countryCode: string;
  region: string;
  tier: number;

  // Hero
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  heroCtas: { label: string; href: string; icon: string }[];

  // Info card
  timezone: string;
  currencyCode: string;
  currencyName: string;
  dialingCode: string;
  postalDataStatus: string;
  postalCodeName: string;
  postalCodeFormat: string;
  addressFormatExample: string;
  majorCities: string[];

  // SEO
  seoTitle: string;
  seoDescription: string;
  indexable: boolean;

  // Content from DB
  guides: { title: string; description: string; type: string }[];
  services: { title: string; category: string; description: string; websiteUrl?: string }[];
  dbTools: { toolSlug: string; sortOrder: number }[];

  // Module config
  moduleConfig: DestinationModuleConfig;

  // Source tracking
  sources: {
    db: boolean;
    static: boolean;
  };
}

// ─── Default module config (used when DB has no moduleConfig) ────────────────

export const DEFAULT_MODULE_CONFIG: DestinationModuleConfig = {
  modules: {
    hero:           { visible: true, sortOrder: 0 },
    quickEntry:     { visible: true, sortOrder: 1 },
    guides:         { visible: true, sortOrder: 2 },
    topics:         { visible: true, sortOrder: 3 },
    checklists:     { visible: true, sortOrder: 4 },
    tools:          { visible: true, sortOrder: 5 },
    officialLinks:  { visible: true, sortOrder: 6 },
    taskChain:      { visible: true, sortOrder: 7 },
    community:      { visible: true, sortOrder: 8 },
    faq:            { visible: true, sortOrder: 9 },
    adSlots:        { visible: true, sortOrder: 10 },
    disclaimer:     { visible: true, sortOrder: 11 },
  },
  officialLinks: [],
  faqs: [],
  adSlots: [
    {
      id: "hero_secondary_ad",
      name: "Hero 下方广告位",
      placement: "hero_secondary",
      enabled: false,
      label: "广告",
      sortOrder: 0,
    },
    {
      id: "after_guides_ad",
      name: "指南后广告位",
      placement: "after_guides",
      enabled: false,
      label: "广告",
      sortOrder: 1,
    },
    {
      id: "after_tools_ad",
      name: "工具后广告位",
      placement: "after_tools",
      enabled: false,
      label: "广告",
      sortOrder: 2,
    },
    {
      id: "bottom_sponsor_ad",
      name: "底部赞助广告位",
      placement: "bottom_sponsor",
      enabled: false,
      label: "赞助",
      sortOrder: 3,
    },
  ],
};

// ─── Canonical slug aliases ──────────────────────────────────────────────────

const SLUG_ALIASES: Record<string, string> = {
  "united-states": "usa",
  "united-kingdom": "uk",
  "united-arab-emirates": "uae",
};

// ─── Main function ───────────────────────────────────────────────────────────

export async function getDestinationPageConfig(slug: string): Promise<DestinationPageConfig | null> {
  // Try DB
  let dest: Awaited<ReturnType<typeof getDestinationBySlug>> | null = null;
  try {
    dest = await getDestinationBySlug(slug);
  } catch {}

  // Try static config
  const aliasSlug = SLUG_ALIASES[slug] || slug;
  const staticConfig = getCountryBySlug(aliasSlug) || getCountryBySlug(slug);

  if (!dest && !staticConfig) return null;

  // Merge module config: DB overrides defaults
  const dbModuleConfig = (dest as any)?.moduleConfig as DestinationModuleConfig | null;
  const moduleConfig: DestinationModuleConfig = dbModuleConfig
    ? {
        ...DEFAULT_MODULE_CONFIG,
        ...dbModuleConfig,
        modules: { ...DEFAULT_MODULE_CONFIG.modules, ...(dbModuleConfig.modules || {}) },
        adSlots: dbModuleConfig.adSlots?.length ? dbModuleConfig.adSlots : DEFAULT_MODULE_CONFIG.adSlots,
      }
    : DEFAULT_MODULE_CONFIG;

  const countryName = dest?.name || staticConfig?.nameZh || slug;
  const countryNameEn = dest?.nameEn || staticConfig?.nameEn || "";
  const flagEmoji = staticConfig?.flagEmoji || dest?.emoji || "🏳️";
  const countryCode = staticConfig?.countryCode || slug.substring(0, 2).toUpperCase();
  const region = staticConfig?.region || dest?.region || "";
  const tier = staticConfig?.completenessTier || 2;

  return {
    slug,
    canonicalSlug: slug,
    countryName,
    countryNameEn,
    flagEmoji,
    countryCode,
    region,
    tier,

    heroTitle: dest?.heroTitle || staticConfig?.heroTitle || `${countryName}综合信息与实用工具`,
    heroSubtitle: dest?.heroSubtitle || staticConfig?.heroSubtitle || `${countryName}邮编查询、地址格式、时区、货币与生活工具参考`,
    heroTagline: moduleConfig.heroTagline || `${countryName}综合信息与实用工具入口`,
    heroCtas: moduleConfig.heroCtas?.length ? moduleConfig.heroCtas : [
      { label: "查询邮编/地址", href: "/tools/postal-code", icon: "🔍" },
      { label: "查看指南", href: "#guides", icon: "📖" },
      { label: "查看清单", href: "#checklists", icon: "📋" },
      { label: "进入社区", href: `/bbs?country=${countryCode}`, icon: "💬" },
    ],

    timezone: staticConfig?.defaultTimezone || "待补充",
    currencyCode: staticConfig?.currencyCode || dest?.currency || "",
    currencyName: staticConfig?.currencyName || "",
    dialingCode: staticConfig?.dialingCode ? `+${staticConfig.dialingCode}` : "",
    postalDataStatus: staticConfig?.postalDataStatus || "unknown",
    postalCodeName: staticConfig?.postalCodeName || "Postal Code",
    postalCodeFormat: staticConfig?.postalCodeFormat || "",
    addressFormatExample: staticConfig?.addressFormatExample || "",
    majorCities: staticConfig?.majorCities || dest?.keyCities || [],

    seoTitle: dest?.seoTitle || staticConfig?.seoTitle || `${countryName}地址邮编、时间、货币与实用工具 - 绝世百宝箱`,
    seoDescription: dest?.seoDescription || staticConfig?.seoDescription || `${countryName}邮编查询、地址格式、时区、货币、生活工具与发货参考。`,
    indexable: staticConfig?.indexable ?? true,

    guides: (dest?.guides || []).map((g: any) => ({ title: g.title, description: g.description, type: g.type })),
    services: (dest?.services || []).map((s: any) => ({ title: s.title, category: s.category, description: s.description, websiteUrl: s.websiteUrl })),
    dbTools: (dest?.tools || []).map((t: any) => ({ toolSlug: t.toolSlug, sortOrder: t.sortOrder })),

    moduleConfig,
    sources: {
      db: !!dest,
      static: !!staticConfig,
    },
  };
}

// ─── Helper: get visible modules sorted by sortOrder ─────────────────────────

export function getVisibleModules(config: DestinationPageConfig): string[] {
  return Object.entries(config.moduleConfig.modules)
    .filter(([, m]) => m.visible)
    .sort((a, b) => a[1].sortOrder - b[1].sortOrder)
    .map(([key]) => key);
}

// ─── Helper: get official links (from config or static fallback) ──────────────

export function getOfficialLinks(config: DestinationPageConfig): OfficialLinkConfig[] {
  if (config.moduleConfig.officialLinks?.length) {
    return config.moduleConfig.officialLinks.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  // Fallback to static config
  const staticConfig = getCountryBySlug(SLUG_ALIASES[config.slug] || config.slug) || getCountryBySlug(config.slug);
  if (!staticConfig) return [];

  const links: OfficialLinkConfig[] = [];
  if (staticConfig.officialPostalUrl) {
    links.push({ label: "官方邮政", url: staticConfig.officialPostalUrl, icon: "📮", type: "official", verified: true, category: "邮政", sortOrder: 0 });
  }
  if (staticConfig.officialCustomsUrl) {
    links.push({ label: "海关/边境", url: staticConfig.officialCustomsUrl, icon: "🛃", type: "official", verified: true, category: "海关", sortOrder: 1 });
  }
  if (staticConfig.officialImmigrationUrl) {
    links.push({ label: "移民/签证", url: staticConfig.officialImmigrationUrl, icon: "🛂", type: "official", verified: true, category: "移民", sortOrder: 2 });
  }
  return links;
}

// ─── Helper: get FAQs (from config or fallback to generic) ───────────────────

export function getFaqs(config: DestinationPageConfig): FaqConfig[] {
  if (config.moduleConfig.faqs?.length) {
    return config.moduleConfig.faqs.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  // Fallback generic FAQ
  const name = config.countryName;
  const postalOk = config.postalDataStatus === "full";
  return [
    { question: `如何查询${name}邮编？`, answer: `使用本站邮编查询工具，输入城市名或地区名即可搜索。${postalOk ? "当前国家支持数据库查询。" : "当前国家暂未接入数据库，可查看地址格式参考。"}`, sortOrder: 0 },
    { question: `寄${name}需要什么资料？`, answer: "通常需要商业发票（Commercial Invoice）、装箱单（Packing List）、收件人完整地址。建议使用任务链功能逐步完成。", sortOrder: 1 },
    { question: `${name}地址格式怎么写？`, answer: config.addressFormatExample ? "请参考上方地址格式示例。" : "地址格式正在补充中，正式寄件请以当地邮政要求为准。", sortOrder: 2 },
    { question: "地图结果是否代表精确邮编位置？", answer: "地图参考按城市/地区搜索，不代表精确邮编位置。邮编覆盖范围可能跨越多个街区，如需精确投递请以当地邮政官方查询结果为准。", sortOrder: 3 },
  ];
}

// ─── Helper: get ad slots ────────────────────────────────────────────────────

export function getAdSlots(config: DestinationPageConfig): AdSlotConfig[] {
  return (config.moduleConfig.adSlots || []).filter(s => s.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
}
