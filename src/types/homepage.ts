export interface HomepageHeroConfig {
  title: string;
  highlightedText: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  trustItems: string[];
}

export interface HomepageStatsConfig {
  mode: "auto" | "manual";
  toolsCount?: string;
  usersCount?: string;
  documentsCount?: string;
  topicsCount?: string;
  postsCount?: string;
}

export interface HomepageToolsConfig {
  sortMode: "auto" | "manual";
  maxDisplay?: number;
  pinnedSlugs?: string[];
  hiddenSlugs?: string[];
}

export interface HomepageTopicsConfig {
  mode: "latest" | "popular" | "curated" | "manual";
  manualSlugs?: string[];
  maxDisplay?: number;
}

export interface HomepageMembershipConfig {
  title: string;
  subtitle: string;
  freeFeatures: string[];
  proFeatures: string[];
  ctaText: string;
  ctaUrl: string;
  showWeeklyUpgrades: boolean;
}

export interface HomepageAdsConfig {
  [slot: string]: {
    enabled: boolean;
    fallbackMode: "hide" | "fallback" | "placeholder";
  };
}

export interface HomepageConfig {
  hero: HomepageHeroConfig;
  stats: HomepageStatsConfig;
  tools: HomepageToolsConfig;
  topics: HomepageTopicsConfig;
  membership: HomepageMembershipConfig;
  ads: HomepageAdsConfig;
}

export const DEFAULT_CONFIG: HomepageConfig = {
  hero: {
    title: "海外华人工作效率工具箱",
    highlightedText: "数字百宝箱",
    subtitle: "集运、物流、外贸单据、跨境电商、海外生活工具，一个账号全部搞定",
    primaryButtonText: "立即使用工具",
    primaryButtonUrl: "/tools",
    secondaryButtonText: "免费注册",
    secondaryButtonUrl: "/register",
    trustItems: ["专业单据工具持续更新", "草稿永久保存", "支持公司资料复用"],
  },
  stats: { mode: "auto" },
  tools: { sortMode: "auto", maxDisplay: 16, pinnedSlugs: [], hiddenSlugs: [] },
  topics: { mode: "latest", maxDisplay: 6 },
  membership: {
    title: "会员专属能力",
    subtitle: "免费够用，会员更强",
    freeFeatures: ["基础工具使用", "基础单据生成", "社区浏览", "草稿限制 (3个)", "有广告"],
    proFeatures: ["Logo上传", "公司资料库", "高级模板", "无限草稿", "AI工具优先体验", "专属客服", "无广告"],
    ctaText: "立即升级会员",
    ctaUrl: "/pricing",
    showWeeklyUpgrades: false,
  },
  ads: {
    AD_HOME_HERO: { enabled: true, fallbackMode: "hide" },
    AD_HOME_POPULAR: { enabled: true, fallbackMode: "hide" },
    AD_HOME_TOPIC_NATIVE: { enabled: true, fallbackMode: "hide" },
    AD_HOME_FORUM_NATIVE: { enabled: true, fallbackMode: "hide" },
    AD_HOME_FOOTER_PARTNER: { enabled: true, fallbackMode: "fallback" },
  },
};
