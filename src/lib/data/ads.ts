// 广告数据管理 — 本地 mock 配置
// 初期不接 AdSense，不使用第三方脚本
// enabled=false 时不渲染，无匹配广告时不渲染

export type AdPlacement =
  | "home-hero"
  | "home-after-tools"
  | "home-starter-native"
  | "home-before-footer"
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
