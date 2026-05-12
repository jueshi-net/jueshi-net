// 广告数据管理 — 本地 mock 配置
// 初期不接 AdSense，不使用第三方脚本
// enabled=false 时不渲染，无匹配广告时不渲染

export type AdPlacement =
  | "home-hero"
  | "home-after-tools"
  | "home-starter-native"
  | "home-before-footer"
  | "tool-tracking-after-results"
  | "tool-tracking-bottom"
  | "tool-shipping-calculator-bottom"
  | "tool-hs-code-bottom"
  | "tool-postal-code-bottom"
  | "tool-exchange-rate-bottom"
  | "tool-memo-bottom"
  | "tool-bottom"
  | "article-top"
  | "article-bottom"
  | "resource-native"
  | "resource-category-top"
  | "documents-home-top"
  | "documents-grid-inline"
  | "document-editor-sidebar"
  | "document-editor-bottom"
  | "label-maker-top"
  | "label-maker-bottom"
  | "footer";

export type AdVariant = "banner" | "card" | "text" | "native";

export interface AdData {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetUrl: string;
  placement: AdPlacement[];
  variant: AdVariant;
  sponsorName?: string;
  label?: "推广" | "赞助" | "推荐";
  enabled: boolean;
  startAt?: string;
  endAt?: string;
  tags?: string[];
  priority: number;
}

// Mock 广告数据 — 初期全部 enabled=false，有广告主时再开启
export const ads: AdData[] = [
  {
    id: "ad-home-tools-1",
    title: "推荐出海建站工具",
    description: "从零搭建独立站，支持多语言、多币种、全球 CDN",
    imageUrl: "",
    targetUrl: "/resources/business-tools",
    placement: ["home-after-tools"],
    variant: "card",
    sponsorName: "",
    label: "推荐",
    enabled: true,
    priority: 1,
  },
  {
    id: "ad-starter-1",
    title: "密码管理器推荐",
    description: "保护你的所有账号安全，一个主密码搞定",
    imageUrl: "",
    targetUrl: "/starter#security",
    placement: ["home-starter-native", "resource-native"],
    variant: "native",
    sponsorName: "",
    label: "推荐",
    enabled: false,
    priority: 1,
  },
  {
    id: "ad-footer-1",
    title: "海外百宝箱 — 你的出海工具箱",
    description: "物流追踪、运费计算、单据生成，一个站搞定",
    imageUrl: "",
    targetUrl: "/",
    placement: ["home-before-footer", "footer"],
    variant: "banner",
    sponsorName: "海外百宝箱",
    label: "推荐",
    enabled: true,
    priority: 1,
  },
  {
    id: "ad-tool-bottom-1",
    title: "需要批量查询物流单号？",
    description: "试试我们的物流追踪工具，支持批量整理和一键跳转",
    imageUrl: "",
    targetUrl: "/tracking",
    placement: ["tool-bottom"],
    variant: "card",
    sponsorName: "",
    label: "推荐",
    enabled: false,
    priority: 1,
  },
  {
    id: "ad-article-top-1",
    title: "跨境电商入门指南",
    description: "从选品到发货，一篇搞定",
    imageUrl: "",
    targetUrl: "/guides",
    placement: ["article-top"],
    variant: "text",
    sponsorName: "",
    label: "推荐",
    enabled: false,
    priority: 1,
  },
  // 工具页专用广告
  {
    id: "ad-tracking-1",
    title: "需要计算包裹运费？",
    description: "输入长宽高和重量，自动计算体积重和计费重，支持快递/空运/海运",
    imageUrl: "",
    targetUrl: "/tools/shipping-calculator",
    placement: ["tool-tracking-after-results", "tool-tracking-bottom"],
    variant: "card",
    sponsorName: "",
    label: "推荐",
    enabled: false,
    priority: 1,
  },
  {
    id: "ad-shipping-calc-1",
    title: "需要查询 HS 编码？",
    description: "收录 500+ 常见跨境商品海关编码候选，支持中/英/别名搜索",
    imageUrl: "",
    targetUrl: "/tools/hs-code",
    placement: ["tool-shipping-calculator-bottom"],
    variant: "card",
    sponsorName: "",
    label: "推荐",
    enabled: false,
    priority: 1,
  },
  {
    id: "ad-hs-code-1",
    title: "需要做商业发票？",
    description: "快速生成商业发票和装箱单，支持多币种、多商品，可导出 PDF",
    imageUrl: "",
    targetUrl: "/tools/invoice",
    placement: ["tool-hs-code-bottom"],
    variant: "card",
    sponsorName: "",
    label: "推荐",
    enabled: false,
    priority: 1,
  },
  {
    id: "ad-postal-1",
    title: "需要查询国际汇率？",
    description: "接入实时汇率数据，支持 9 种主流货币换算",
    imageUrl: "",
    targetUrl: "/tools/exchange-rate",
    placement: ["tool-postal-code-bottom"],
    variant: "card",
    sponsorName: "",
    label: "推荐",
    enabled: false,
    priority: 1,
  },
  {
    id: "ad-exchange-1",
    title: "需要生成唛头面单？",
    description: "8 种标签模板，支持 A4/100x150mm 等尺寸，可导出 PNG/PDF",
    imageUrl: "",
    targetUrl: "/tools/label-maker",
    placement: ["tool-exchange-rate-bottom"],
    variant: "card",
    sponsorName: "",
    label: "推荐",
    enabled: false,
    priority: 1,
  },
  {
    id: "ad-memo-1",
    title: "需要整理跨境资源？",
    description: "48 个新手必备工具，涵盖 AI、学习、生活、安全、浏览器插件",
    imageUrl: "",
    targetUrl: "/starter",
    placement: ["tool-memo-bottom"],
    variant: "card",
    sponsorName: "",
    label: "推荐",
    enabled: false,
    priority: 1,
  },
];

/**
 * 按 placement 获取广告
 * 过滤：enabled=true 且在有效期内
 * 排序：按 priority 升序
 */
export function getAdsByPlacement(
  placement: AdPlacement,
  options?: { max?: number }
): AdData[] {
  const now = new Date();
  return ads
    .filter(
      (ad) =>
        ad.enabled &&
        ad.placement.includes(placement) &&
        (!ad.startAt || new Date(ad.startAt) <= now) &&
        (!ad.endAt || new Date(ad.endAt) >= now)
    )
    .sort((a, b) => a.priority - b.priority)
    .slice(0, options?.max ?? 1);
}
