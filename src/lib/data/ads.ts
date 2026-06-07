// 广告数据管理 — 类型定义层
//
// 注意：自 v1.14 起，广告系统已迁移至 Prisma AdCampaign 模型 + API 驱动。
// 本文件仅保留类型定义，供前台组件（如 AdSlot）引用 placement 名称。
// 实际的广告获取走 /api/ads/dispatch 接口。
// 旧的 mock `ads` 数组和 `getAdsByPlacement` 已移除。

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
  | "tool-postal-code-mid"
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
  | "tool-customs-generator-bottom"
  | "footer";

export type AdVariant = "banner" | "card" | "text" | "native";

/**
 * 获取所有支持的 placement 名称
 * 用于 admin 表单的位置选择器
 */
export const ALL_PLACEMENTS: AdPlacement[] = [
  "home-hero", "home-after-tools", "home-starter-native", "home-before-footer",
  "tool-tracking-after-results", "tool-tracking-bottom",
  "tool-shipping-calculator-bottom", "tool-hs-code-bottom",
  "tool-postal-code-bottom", "tool-postal-code-mid",
  "tool-exchange-rate-bottom", "tool-memo-bottom", "tool-bottom",
  "article-top", "article-bottom",
  "resource-native", "resource-category-top",
  "documents-home-top", "documents-grid-inline",
  "document-editor-sidebar", "document-editor-bottom",
  "label-maker-top", "label-maker-bottom",
  "tool-customs-generator-bottom", "footer",
];
