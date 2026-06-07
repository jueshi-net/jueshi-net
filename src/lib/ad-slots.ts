/**
 * 统一广告位命名规范 (v1.20.41)
 * 禁止在组件中硬编码字符串，统一使用此常量。
 */
export const AD_SLOTS = {
  HOME_HERO: "AD_HOME_HERO",
  HOME_POPULAR: "AD_HOME_POPULAR",
  HOME_TOPIC_NATIVE: "AD_HOME_TOPIC_NATIVE",
  HOME_FORUM_NATIVE: "AD_HOME_FORUM_NATIVE",
  HOME_FOOTER_PARTNER: "AD_HOME_FOOTER_PARTNER",
} as const;

export type AdSlotKey = (typeof AD_SLOTS)[keyof typeof AD_SLOTS];

// 映射到实际 DB placement 名称（兼容旧系统）
export const AD_SLOT_PLACEMENTS: Record<AdSlotKey, string> = {
  [AD_SLOTS.HOME_HERO]: "home-hero",
  [AD_SLOTS.HOME_POPULAR]: "home-after-tools",
  [AD_SLOTS.HOME_TOPIC_NATIVE]: "home-topic-native",
  [AD_SLOTS.HOME_FORUM_NATIVE]: "home-forum-native",
  [AD_SLOTS.HOME_FOOTER_PARTNER]: "home-footer-partner",
};
