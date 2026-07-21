/**
 * V4 首页配置 - 扩展配置化结构
 * 
 * 对齐现有系统：
 * - src/types/homepage.ts (HomepageConfig)
 * - src/components/ads/AdSlot.tsx (placement)
 * 
 * 本配置用于 UI Lab 阶段，未来替换真实首页时可直接对接后台配置中心
 */

// ============================================================================
// 按钮配置类型
// ============================================================================

export interface ButtonConfig {
  key: string;
  label: string;
  href: string;
  enabled: boolean;
  variant: 'primary' | 'secondary' | 'ghost' | 'link';
  icon?: string;
  external: boolean;
  sortOrder: number;
  trackingKey: string;
}

// ============================================================================
// 导航配置
// ============================================================================

export interface NavItemConfig {
  key: string;
  label: string;
  href: string;
  enabled: boolean;
  icon?: string;
  external: boolean;
  sortOrder: number;
  trackingKey: string;
  priority: 'core' | 'extended';
}

// ============================================================================
// 移动端底部 Tab 配置
// ============================================================================

export interface MobileTabConfig {
  key: string;
  label: string;
  href: string;
  icon?: string;
  activeIcon?: string;
  imageUrl?: string;
  isCenterAction: boolean;
  enabled: boolean;
  sortOrder: number;
  trackingKey: string;
}

// ============================================================================
// 默认素材配置
// ============================================================================

export interface DefaultAssetsConfig {
  defaultAvatar: string;
  mobileTabCenterImage: string;
  brandLogo: string;
  brandCrabMark?: string;
}

// ============================================================================
// 广告位配置（对齐现有 AdSlot placement）
// ============================================================================

export interface AdSlotConfig {
  slotKey: string;
  placement: string; // 对齐现有 AdSlot 的 placement
  enabled: boolean;
  fallbackMode: 'hide' | 'fallback' | 'placeholder';
  sortOrder: number;
}

export interface AdGroupConfig {
  groupKey: string;
  title: string;
  description?: string;
  position: string;
  enabled: boolean;
  showLabel: boolean;
  maxTextRows: number;
  textColumns: number;
  imageColumns: number;
  mobileMode: 'full' | 'compact' | 'hidden';
  sortOrder: number;
  slots: AdSlotConfig[];
}

// ============================================================================
// 完整首页配置
// ============================================================================

export interface HomepageButtonConfig {
  // Header
  headerNav: NavItemConfig[];
  headerSearchPlaceholder: string;
  headerCheckinButton: ButtonConfig;
  headerLoginButton: ButtonConfig;
  headerNotificationButton: ButtonConfig;
  headerMenuButton: ButtonConfig;

  // Hero
  heroPrimaryCta: ButtonConfig;
  heroSecondaryCta: ButtonConfig;
  heroToolboxButtons: ButtonConfig[];

  // 工作台
  workbenchCheckinButton: ButtonConfig;
  workbenchViewButton: ButtonConfig;

  // 工具卡
  toolCardCta: ButtonConfig;

  // 任务链
  taskChainPrimaryCta: ButtonConfig;
  taskChainSecondaryCta: ButtonConfig;

  // 社区
  communityEnterButton: ButtonConfig;
  communityViewMoreButton: ButtonConfig;

  // Footer
  footerLoginButton: ButtonConfig;
  footerBrowseButton: ButtonConfig;

  // 移动端底部 Tab
  mobileTabs: MobileTabConfig[];

  // 默认素材
  defaultAssets: DefaultAssetsConfig;
}

export interface HomepageAdConfig {
  groups: AdGroupConfig[];
}

export interface V4HomepageConfig {
  buttons: HomepageButtonConfig;
  ads: HomepageAdConfig;
}

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_BUTTONS: HomepageButtonConfig = {
  // Header
  headerNav: [
    { key: 'nav_home', label: '首页', href: '/', enabled: true, external: false, sortOrder: 10, trackingKey: 'header_nav_home', priority: 'core' },
    { key: 'nav_tools', label: '工具', href: '/tools', enabled: true, external: false, sortOrder: 20, trackingKey: 'header_nav_tools', priority: 'core' },
    { key: 'nav_checklist', label: '清单', href: '/checklists', enabled: true, external: false, sortOrder: 30, trackingKey: 'header_nav_checklist', priority: 'core' },
    { key: 'nav_guides', label: '指南', href: '/guides', enabled: true, external: false, sortOrder: 40, trackingKey: 'header_nav_guides', priority: 'core' },
    { key: 'nav_resources', label: '资源', href: '/resources', enabled: true, external: false, sortOrder: 50, trackingKey: 'header_nav_resources', priority: 'core' },
    { key: 'nav_country', label: '国家', href: '/destinations', enabled: true, external: false, sortOrder: 55, trackingKey: 'header_nav_country', priority: 'core' },
    { key: 'nav_workbench', label: '我的工作台', href: '/workspace', enabled: true, icon: 'LayoutDashboard', external: false, sortOrder: 56, trackingKey: 'header_nav_workbench', priority: 'core' },
    { key: 'nav_topics', label: '专题', href: '/topics', enabled: true, external: false, sortOrder: 60, trackingKey: 'header_nav_topics', priority: 'extended' },
    { key: 'nav_service_providers', label: '服务商', href: '/service-providers', enabled: true, external: false, sortOrder: 65, trackingKey: 'header_nav_service_providers', priority: 'extended' },
    { key: 'nav_community', label: '社区', href: '/community', enabled: true, external: false, sortOrder: 70, trackingKey: 'header_nav_community', priority: 'extended' },
  ],
  headerSearchPlaceholder: '搜索工具、指南、资源、国家、城市...',
  headerCheckinButton: { key: 'header_checkin', label: '签到', href: '/workspace', enabled: true, variant: 'ghost', icon: 'Sparkles', external: false, sortOrder: 10, trackingKey: 'header_checkin' },
  headerLoginButton: { key: 'header_login', label: '登录', href: '/login', enabled: true, variant: 'primary', external: false, sortOrder: 20, trackingKey: 'header_login' },
  headerNotificationButton: { key: 'header_notification', label: '通知', href: '/notifications', enabled: true, variant: 'ghost', icon: 'Bell', external: false, sortOrder: 30, trackingKey: 'header_notification' },
  headerMenuButton: { key: 'header_menu', label: '菜单', href: '#menu', enabled: true, variant: 'ghost', icon: 'Menu', external: false, sortOrder: 40, trackingKey: 'header_menu' },

  // Hero
  heroPrimaryCta: { key: 'hero_primary_cta', label: '浏览全部工具', href: '/tools', enabled: true, variant: 'primary', icon: 'ArrowRight', external: false, sortOrder: 10, trackingKey: 'home_hero_primary_tools' },
  heroSecondaryCta: { key: 'hero_secondary_cta', label: '查看清单指南', href: '/checklists', enabled: true, variant: 'secondary', external: false, sortOrder: 20, trackingKey: 'home_hero_secondary_checklists' },
  heroToolboxButtons: [
    { key: 'hero_tool_postcode', label: '邮编查询', href: '/tools/postal-code', enabled: true, variant: 'link', icon: 'Mail', external: false, sortOrder: 10, trackingKey: 'hero_tool_postcode' },
    { key: 'hero_tool_hscode', label: 'HS编码', href: '/tools/hs-code', enabled: true, variant: 'link', icon: 'Package', external: false, sortOrder: 20, trackingKey: 'hero_tool_hscode' },
    { key: 'hero_tool_currency', label: '汇率换算', href: '/tools/exchange-rate', enabled: true, variant: 'link', icon: 'RefreshCw', external: false, sortOrder: 30, trackingKey: 'hero_tool_currency' },
    { key: 'hero_tool_shipping', label: '运费计算', href: '/tools/shipping-calculator', enabled: true, variant: 'link', icon: 'Truck', external: false, sortOrder: 40, trackingKey: 'hero_tool_shipping' },
    { key: 'hero_tool_invoice', label: '单据生成', href: '/tools/invoice', enabled: true, variant: 'link', icon: 'FileText', external: false, sortOrder: 50, trackingKey: 'hero_tool_invoice' },
    { key: 'hero_tool_checklist', label: '清单任务', href: '/tools/checklist', enabled: true, variant: 'link', icon: 'CheckSquare', external: false, sortOrder: 60, trackingKey: 'hero_tool_checklist' },
  ],

  // 工作台
  workbenchCheckinButton: { key: 'workbench_checkin', label: '签到', href: '/workspace', enabled: true, variant: 'primary', icon: 'Sparkles', external: false, sortOrder: 10, trackingKey: 'workbench_checkin' },
  workbenchViewButton: { key: 'workbench_view', label: '查看工作台', href: '/workspace', enabled: true, variant: 'secondary', icon: 'ArrowRight', external: false, sortOrder: 20, trackingKey: 'workbench_view' },

  // 工具卡
  toolCardCta: { key: 'tool_card_cta', label: '立即使用', href: '', enabled: true, variant: 'link', external: false, sortOrder: 10, trackingKey: 'tool_card_cta' },

  // 任务链
  taskChainPrimaryCta: { key: 'task_chain_primary_cta', label: '开始任务', href: '', enabled: true, variant: 'primary', icon: 'Zap', external: false, sortOrder: 10, trackingKey: 'task_chain_primary_cta' },
  taskChainSecondaryCta: { key: 'task_chain_secondary_cta', label: '查看详情', href: '', enabled: true, variant: 'secondary', icon: 'ArrowRight', external: false, sortOrder: 20, trackingKey: 'task_chain_secondary_cta' },

  // 社区
  communityEnterButton: { key: 'community_enter', label: '进入社区', href: '/community', enabled: true, variant: 'primary', external: false, sortOrder: 10, trackingKey: 'community_enter' },
  communityViewMoreButton: { key: 'community_view_more', label: '查看更多', href: '/community', enabled: true, variant: 'link', external: false, sortOrder: 20, trackingKey: 'community_view_more' },

  // Footer
  footerLoginButton: { key: 'footer_login', label: '立即登录', href: '/login', enabled: true, variant: 'primary', external: false, sortOrder: 10, trackingKey: 'footer_login' },
  footerBrowseButton: { key: 'footer_browse', label: '浏览工具', href: '/tools', enabled: true, variant: 'secondary', external: false, sortOrder: 20, trackingKey: 'footer_browse' },

  // 移动端底部 Tab
  mobileTabs: [
    { key: 'mobile_tab_home', label: '首页', href: '/', icon: 'Home', enabled: true, isCenterAction: false, sortOrder: 10, trackingKey: 'mobile_tab_home' },
    { key: 'mobile_tab_tools', label: '工具', href: '/tools', icon: 'Wrench', enabled: true, isCenterAction: false, sortOrder: 20, trackingKey: 'mobile_tab_tools' },
    { key: 'mobile_tab_center', label: '百宝箱', href: '/', imageUrl: '/brand/v2/app-mark.svg', enabled: true, isCenterAction: true, sortOrder: 30, trackingKey: 'mobile_tab_center_home' },
    { key: 'mobile_tab_checklist', label: '清单', href: '/checklists', icon: 'CheckSquare', enabled: true, isCenterAction: false, sortOrder: 40, trackingKey: 'mobile_tab_checklist' },
    { key: 'mobile_tab_profile', label: '我的', href: '/workspace', icon: 'User', enabled: true, isCenterAction: false, sortOrder: 50, trackingKey: 'mobile_tab_profile' },
  ],

  // 默认素材
  defaultAssets: {
    defaultAvatar: '/images/brand/default-avatar-crab.jpg',
    mobileTabCenterImage: '/brand/v2/app-mark.svg',
    brandLogo: '/brand/v2/logo-horizontal-color.svg',
    brandCrabMark: '/brand/v2/robot-symbol-color.svg',
  },
};

export const DEFAULT_ADS: HomepageAdConfig = {
  groups: [
    {
      groupKey: 'home_after_hero_ad_group',
      title: '推荐服务',
      description: '精选跨境服务推荐',
      position: 'after_hero',
      enabled: true,
      showLabel: true,
      maxTextRows: 2,
      textColumns: 5,
      imageColumns: 4,
      mobileMode: 'compact',
      sortOrder: 1,
      slots: [
        { slotKey: 'home_after_hero_text', placement: 'AD_HOME_AFTER_HERO_TEXT', enabled: true, fallbackMode: 'hide', sortOrder: 10 },
        { slotKey: 'home_after_hero_image', placement: 'AD_HOME_AFTER_HERO_IMAGE', enabled: true, fallbackMode: 'hide', sortOrder: 20 },
      ],
    },
    {
      groupKey: 'home_after_tools_ad_group',
      title: '工具服务推荐',
      description: '提升工作效率的专业工具',
      position: 'after_tools',
      enabled: true,
      showLabel: true,
      maxTextRows: 4,
      textColumns: 5,
      imageColumns: 5,
      mobileMode: 'compact',
      sortOrder: 2,
      slots: [
        { slotKey: 'home_after_tools_text', placement: 'AD_HOME_AFTER_TOOLS_TEXT', enabled: true, fallbackMode: 'hide', sortOrder: 10 },
        { slotKey: 'home_after_tools_image', placement: 'AD_HOME_AFTER_TOOLS_IMAGE', enabled: true, fallbackMode: 'hide', sortOrder: 20 },
      ],
    },
    {
      groupKey: 'home_after_task_chain_ad_group',
      title: '流程服务推荐',
      description: '集运、留学、外贸全流程服务',
      position: 'after_task_chain',
      enabled: true,
      showLabel: true,
      maxTextRows: 4,
      textColumns: 5,
      imageColumns: 5,
      mobileMode: 'compact',
      sortOrder: 3,
      slots: [
        { slotKey: 'home_after_task_chain_text', placement: 'AD_HOME_AFTER_TASK_CHAIN_TEXT', enabled: true, fallbackMode: 'hide', sortOrder: 10 },
        { slotKey: 'home_after_task_chain_image', placement: 'AD_HOME_AFTER_TASK_CHAIN_IMAGE', enabled: true, fallbackMode: 'hide', sortOrder: 20 },
      ],
    },
    {
      groupKey: 'home_community_ad_group',
      title: '社区合作伙伴',
      description: '社区服务与合作商家推荐',
      position: 'community',
      enabled: true,
      showLabel: true,
      maxTextRows: 2,
      textColumns: 4,
      imageColumns: 4,
      mobileMode: 'compact',
      sortOrder: 4,
      slots: [
        { slotKey: 'home_community_text', placement: 'AD_HOME_COMMUNITY_TEXT', enabled: true, fallbackMode: 'hide', sortOrder: 10 },
        { slotKey: 'home_community_image', placement: 'AD_HOME_COMMUNITY_IMAGE', enabled: true, fallbackMode: 'hide', sortOrder: 20 },
      ],
    },
    {
      groupKey: 'home_before_footer_ad_group',
      title: '商业合作与会员',
      description: '会员特权与商业合作机会',
      position: 'before_footer',
      enabled: true,
      showLabel: true,
      maxTextRows: 5,
      textColumns: 6,
      imageColumns: 6,
      mobileMode: 'full',
      sortOrder: 5,
      slots: [
        { slotKey: 'home_before_footer_text', placement: 'AD_HOME_BEFORE_FOOTER_TEXT', enabled: true, fallbackMode: 'hide', sortOrder: 10 },
        { slotKey: 'home_before_footer_image', placement: 'AD_HOME_BEFORE_FOOTER_IMAGE', enabled: true, fallbackMode: 'hide', sortOrder: 20 },
      ],
    },
  ],
};

export const V4_DEFAULT_CONFIG: V4HomepageConfig = {
  buttons: DEFAULT_BUTTONS,
  ads: DEFAULT_ADS,
};
