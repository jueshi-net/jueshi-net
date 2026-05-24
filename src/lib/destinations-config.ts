// Programmatic SEO: 出海国家/地区 Hub 配置字典
// 每个国家生成独立落地页: /destinations/[slug]
// 数据用于动态 TDK、Hero 标题、智能工具推荐等。

export interface DestinationHub {
  /** URL slug, e.g. "canada" */
  slug: string;
  /** Chinese name, e.g. "加拿大" */
  name: string;
  /** English name, e.g. "Canada" */
  nameEn: string;
  /** ISO currency code, e.g. "CAD" */
  currency: string;
  /** Region grouping, e.g. "北美" */
  region: string;
  /** Emoji flag or icon */
  emoji: string;
  /** SEO metadata */
  seo: {
    /** Page title template (auto-filled with name) */
    titleTemplate: string;
    /** Meta description */
    description: string;
    /** Long-form hero headline */
    heroTitle: string;
    /** Hero sub-headline */
    heroSubtitle: string;
    /** Primary keywords for internal targeting */
    keywords: string[];
  };
  /** Recommended tool slugs to showcase on this hub page */
  recommendedTools: string[];
  /** Popular trade routes / cities for this country */
  keyCities: string[];
}

// ═══ Sample data (Phase 1: 2 countries) ═══

export const DESTINATIONS: Record<string, DestinationHub> = {
  canada: {
    slug: "canada",
    name: "加拿大",
    nameEn: "Canada",
    currency: "CAD",
    region: "北美",
    emoji: "🇨🇦",
    seo: {
      titleTemplate: "{name}出海全能工具箱 — 商业单据·物流追踪·邮编查询",
      description:
        "面向加拿大出海商家的一站式工具平台：商业发票、装箱单、销售合同在线生成，17TRACK 物流追踪，邮编查询，汇率换算。支持 CAD 货币与加拿大主要城市。",
      heroTitle: "加拿大出海全能工具箱",
      heroSubtitle: "商业单据生成 · 物流追踪 · 邮编查询 · 汇率换算 — 一站式搞定",
      keywords: ["加拿大出海", "加拿大物流", "加拿大邮编", "加拿大快递", "CAD 汇率", "加拿大报关", "加拿大商业发票"],
    },
    recommendedTools: [
      "commercial-invoice",
      "packing-list",
      "postal-code",
      "shipping-calculator",
      "exchange-rate",
      "shipping-label",
    ],
    keyCities: ["多伦多", "温哥华", "蒙特利尔", "卡尔加里", "渥太华"],
  },
  malaysia: {
    slug: "malaysia",
    name: "马来西亚",
    nameEn: "Malaysia",
    currency: "MYR",
    region: "东南亚",
    emoji: "🇲🇾",
    seo: {
      titleTemplate: "{name}出海全能工具箱 — 商业单据·物流追踪·邮编查询",
      description:
        "面向马来西亚出海商家的一站式工具平台：商业发票、装箱单、销售合同在线生成，国际物流追踪，邮编查询，汇率换算。支持 MYR 货币与马来西亚主要城市。",
      heroTitle: "马来西亚出海全能工具箱",
      heroSubtitle: "商业单据生成 · 物流追踪 · 邮编查询 · 汇率换算 — 一站式搞定",
      keywords: ["马来西亚出海", "马来西亚物流", "马来西亚邮编", "MYR 汇率", "马来西亚报关", "马来西亚商业发票"],
    },
    recommendedTools: [
      "commercial-invoice",
      "proforma-invoice",
      "packing-list",
      "postal-code",
      "exchange-rate",
      "shipping-label",
    ],
    keyCities: ["吉隆坡", "槟城", "新山", "亚庇", "马六甲"],
  },
};

// ═══ Helper functions ═══

/** Get a destination by slug, or undefined */
export function getDestination(slug: string): DestinationHub | undefined {
  return DESTINATIONS[slug];
}

/** Get all destinations, optionally filtered by region */
export function getAllDestinations(region?: string): DestinationHub[] {
  const all = Object.values(DESTINATIONS);
  if (!region) return all;
  return all.filter(d => d.region === region);
}

/** Get all slugs for generateStaticParams */
export function getAllSlugs(): string[] {
  return Object.keys(DESTINATIONS);
}

/** Get unique regions */
export function getRegions(): string[] {
  return Array.from(new Set(Object.values(DESTINATIONS).map(d => d.region)));
}

/** Resolve title template placeholders */
export function resolveTitle(template: string, dest: DestinationHub): string {
  return template.replace("{name}", dest.name).replace("{nameEn}", dest.nameEn);
}
