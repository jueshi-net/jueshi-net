// Programmatic SEO: 出海国家/地区 Hub 配置字典
// 每个国家生成独立落地页: /destinations/[slug]
// 数据用于动态 TDK、Hero 标题、智能工具推荐、百科指南、服务商资源等。

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
    titleTemplate: string;
    description: string;
    heroTitle: string;
    heroSubtitle: string;
    keywords: string[];
  };
  /** Recommended tool slugs */
  recommendedTools: string[];
  /** Popular trade routes / cities */
  keyCities: string[];
  /** Social proof stats */
  stats: {
    /** Active merchant count, e.g. "12,500+" */
    userCount: string;
    /** Document count, e.g. "45,000+" */
    docCount: string;
  };
  /** Guides & tutorials for this country (SEO long-tail) */
  guides: Array<{
    title: string;
    description: string;
    /** Type tag: "guide" | "regulation" | "tax" | "logistics" | "customs" */
    type: string;
  }>;
  /** Local service providers & resources */
  services: Array<{
    title: string;
    /** Category: "仓储" | "物流" | "报关" | "税务" | "合规" | "代购" */
    category: string;
    description: string;
  }>;
}

// ═══ Region group for index page ═══

export interface RegionGroup {
  key: string;
  label: string;
  emoji: string;
  description: string;
  /** Country slugs in this region */
  destinations: string[];
}

export const REGION_GROUPS: RegionGroup[] = [
  { key: "north-america", label: "北美", emoji: "🌎", description: "美国、加拿大、墨西哥", destinations: ["usa", "canada", "mexico"] },
  { key: "europe", label: "欧洲", emoji: "🇪🇺", description: "英国、德国、法国、西班牙", destinations: ["uk", "germany", "france", "spain"] },
  { key: "southeast-asia", label: "东南亚", emoji: "🌏", description: "马来西亚、泰国、越南、印尼、菲律宾", destinations: ["malaysia", "thailand", "vietnam", "indonesia", "philippines"] },
  { key: "east-asia", label: "日韩", emoji: "🗾", description: "日本、韩国", destinations: ["japan", "south-korea"] },
  { key: "latin-america", label: "拉美", emoji: "🌎", description: "巴西、阿根廷、智利", destinations: ["brazil", "argentina", "chile"] },
  { key: "middle-east", label: "中东", emoji: "🕌", description: "阿联酋、沙特阿拉伯", destinations: ["uae", "saudi-arabia"] },
  { key: "oceania", label: "澳洲", emoji: "🦘", description: "澳大利亚、新西兰", destinations: ["australia", "new-zealand"] },
];

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
    stats: { userCount: "12,500+", docCount: "45,000+" },
    guides: [
      { title: "个人行李免税申报指南", description: "新移民或留学生首次入境加拿大，如何通过 BSF186 表格申报个人行李享受免税。涵盖申报流程、表格填写要点、注意事项。", type: "customs" },
      { title: "加拿大 FBA 敏感货规则与合规要求", description: "Amazon 加拿大站 FBA 发货须知：哪些属于敏感货、液体/粉末/带电产品的申报方式、关税起征点（CAD 20 以下免征 GST）。", type: "logistics" },
      { title: "加拿大商业发票（Commercial Invoice）填写规范", description: "出口加拿大必备：发票必须包含 Harmonized System (HS) 编码、原产地声明、买卖双方完整信息。附模板与实例对照。", type: "guide" },
      { title: "加拿大 GST/HST 税务登记与申报入门", description: "在加拿大经营电商业务需要了解 GST/HST 注册门槛（年收入超过 CAD 30,000 必须注册）、申报频率、抵扣规则。", type: "tax" },
      { title: "中加跨境物流渠道对比：空运 vs 海运 vs 快递", description: "DHL/FedEx/UPS 直邮 vs 海运到温哥华/多伦多港 vs 空派专线，时效与费用对比，适合不同重量段的发货方案推荐。", type: "logistics" },
    ],
    services: [
      { title: "加拿大海外仓一件代发服务", category: "仓储", description: "温哥华、多伦多本地仓储，支持 Amazon FBA 中转、B2B/B2C 一件代发、退换货处理。" },
      { title: "加拿大报关行代理服务", category: "报关", description: "持有 CCAA 资质的报关行，代理进出口报关、关税评估、原产地证审核。" },
      { title: "加拿大跨境电商税务合规咨询", category: "税务", description: "GST/HST 注册、年度申报、跨境所得税筹划、CRA 审计应对。" },
      { title: "中加跨境专线物流服务", category: "物流", description: "中国 → 加拿大空运专线（7-10 天）、海运整柜/拼箱（25-35 天），包清关到门。" },
    ],
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
    stats: { userCount: "8,200+", docCount: "28,000+" },
    guides: [
      { title: "马来西亚 SST 销售税登记与缴纳指南", description: "在马来西亚经营电商需了解 SST（Sales and Service Tax）注册门槛（年营业额超过 MYR 500,000）、税率（5-10%）及申报流程。", type: "tax" },
      { title: "马来西亚 Shopee/Lazada 跨境卖家入驻流程", description: "中国卖家如何入驻 Shopee 马来西亚站和 Lazada 马来西亚站：资质要求、保证金、物流方案选择、回款方式。", type: "guide" },
      { title: "马来西亚海关进口申报与关税起征点", description: "马来西亚进口关税起征点（MYR 500 以下免征）、SST 征收范围、低价值商品（LVG）税新规。", type: "customs" },
      { title: "中马物流专线与清关时效参考", description: "中国 → 吉隆坡空运专线（3-5 天）、海运拼箱（7-12 天），双清包税到门服务对比。", type: "logistics" },
    ],
    services: [
      { title: "马来西亚本地仓储与一件代发", category: "仓储", description: "巴生港、吉隆坡本地仓库，支持 Shopee/Lazada 平台订单一件代发、退换货处理。" },
      { title: "马来西亚清关代理服务", category: "报关", description: "持有 K1/K2 报关资质的代理公司，代理进出口清关、SST 代缴、产地证审核。" },
      { title: "东南亚跨境物流专线", category: "物流", description: "中国 → 马来西亚专线，空运（3-5 天）、海运（7-12 天），包清关到门，支持 COD。" },
    ],
  },
};

// ═══ Helper functions ═══

export function getDestination(slug: string): DestinationHub | undefined {
  return DESTINATIONS[slug];
}

export function getAllDestinations(region?: string): DestinationHub[] {
  const all = Object.values(DESTINATIONS);
  if (!region) return all;
  return all.filter(d => d.region === region);
}

export function getAllSlugs(): string[] {
  return Object.keys(DESTINATIONS);
}

export function getRegions(): string[] {
  return Array.from(new Set(Object.values(DESTINATIONS).map(d => d.region)));
}

export function resolveTitle(template: string, dest: DestinationHub): string {
  return template.replace("{name}", dest.name).replace("{nameEn}", dest.nameEn);
}

export function getAvailableCountriesInRegion(regionKey: string): Array<{ slug: string; name: string; emoji: string }> {
  const group = REGION_GROUPS.find(r => r.key === regionKey);
  if (!group) return [];
  return group.destinations
    .map(slug => {
      const dest = DESTINATIONS[slug];
      if (!dest) return null;
      return { slug, name: dest.name, emoji: dest.emoji };
    })
    .filter(Boolean) as Array<{ slug: string; name: string; emoji: string }>;
}
