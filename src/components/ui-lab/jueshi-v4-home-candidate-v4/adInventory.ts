'use client';

/**
 * V4 广告库存 - 三层结构
 * 
 * 对齐现有系统：
 * - src/components/ads/AdSlot.tsx (placement)
 * - src/types/homepage.ts (HomepageAdsConfig)
 * 
 * 三层结构：
 * 1. AdGroup - 广告组
 * 2. AdSlot - 广告位（对齐 placement）
 * 3. AdCreative - 广告内容
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface AdCreative {
  creativeKey: string;
  slotKey: string;
  type: 'text' | 'image';
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  href: string;
  ctaText?: string;
  tag?: string;
  advertiserName?: string;
  startAt?: string;
  endAt?: string;
  sortOrder: number;
  displayDevices: ('desktop' | 'tablet' | 'mobile')[];
  nofollow: boolean;
  sponsored: boolean;
  trackingKey?: string;
  enabled: boolean;
}

export interface AdSlot {
  slotKey: string;
  groupKey: string;
  placement: string; // 对齐现有 AdSlot 的 placement
  type: 'text' | 'image';
  enabled: boolean;
  sortOrder: number;
  displayDevices: ('desktop' | 'tablet' | 'mobile')[];
  startAt?: string;
  endAt?: string;
  creatives: AdCreative[];
}

export interface AdGroup {
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
  slots: AdSlot[];
}

// ============================================================================
// Mock 数据 - 5 个广告组
// ============================================================================

export const mockAdInventory: AdGroup[] = [
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
      {
        slotKey: 'home_after_hero_text',
        groupKey: 'home_after_hero_ad_group',
        placement: 'AD_HOME_AFTER_HERO_TEXT',
        type: 'text',
        enabled: true,
        sortOrder: 10,
        displayDevices: ['desktop', 'tablet', 'mobile'],
        creatives: [
          { creativeKey: 'hero_text_01', slotKey: 'home_after_hero_text', type: 'text', title: '国际快递比价', subtitle: 'DHL/UPS/FedEx', description: '一键比价', href: '/ads/dhl-compare', ctaText: '立即比价', tag: '热门', advertiserName: '快递100', sortOrder: 1, displayDevices: ['desktop', 'tablet', 'mobile'], nofollow: true, sponsored: true, enabled: true },
          { creativeKey: 'hero_text_02', slotKey: 'home_after_hero_text', type: 'text', title: '海外开户', subtitle: 'Wise/Payoneer', description: '快速开户', href: '/ads/overseas-account', ctaText: '了解详情', tag: '推荐', advertiserName: 'Wise', sortOrder: 2, displayDevices: ['desktop', 'tablet', 'mobile'], nofollow: true, sponsored: true, enabled: true },
          { creativeKey: 'hero_text_03', slotKey: 'home_after_hero_text', type: 'text', title: '商标注册', subtitle: '全球商标', description: '专业代理', href: '/ads/trademark', ctaText: '免费咨询', tag: '专业', advertiserName: '知识产权服务', sortOrder: 3, displayDevices: ['desktop', 'tablet'], nofollow: true, sponsored: true, enabled: true },
          { creativeKey: 'hero_text_04', slotKey: 'home_after_hero_text', type: 'text', title: '外贸保险', subtitle: '货物运输险', description: '在线投保', href: '/ads/insurance', ctaText: '立即投保', tag: '保障', advertiserName: '平安保险', sortOrder: 4, displayDevices: ['desktop', 'tablet'], nofollow: true, sponsored: true, enabled: true },
          { creativeKey: 'hero_text_05', slotKey: 'home_after_hero_text', type: 'text', title: 'VPN服务', subtitle: '安全稳定', description: '全球节点', href: '/ads/vpn', ctaText: '免费试用', tag: '工具', advertiserName: 'ExpressVPN', sortOrder: 5, displayDevices: ['desktop', 'mobile'], nofollow: true, sponsored: true, enabled: true },
          { creativeKey: 'hero_text_06', slotKey: 'home_after_hero_text', type: 'text', title: '多币种钱包', subtitle: 'USD/EUR/GBP', description: '零手续费', href: '/ads/wallet', ctaText: '注册领取', tag: '优惠', advertiserName: 'Revolut', sortOrder: 6, displayDevices: ['desktop', 'tablet', 'mobile'], nofollow: true, sponsored: true, enabled: true },
          { creativeKey: 'hero_text_07', slotKey: 'home_after_hero_text', type: 'text', title: '海外租房', subtitle: '留学租房', description: '真实房源', href: '/ads/rental', ctaText: '查看房源', tag: '留学', advertiserName: '异乡好居', sortOrder: 7, displayDevices: ['desktop', 'tablet'], nofollow: true, sponsored: true, enabled: true },
          { creativeKey: 'hero_text_08', slotKey: 'home_after_hero_text', type: 'text', title: '税务咨询', subtitle: '跨境税务', description: '专业顾问', href: '/ads/tax', ctaText: '预约咨询', tag: '专业', advertiserName: '德勤税务', sortOrder: 8, displayDevices: ['desktop'], nofollow: true, sponsored: true, enabled: true },
          { creativeKey: 'hero_text_09', slotKey: 'home_after_hero_text', type: 'text', title: '翻译服务', subtitle: '多语言翻译', description: '人工翻译', href: '/ads/translation', ctaText: '获取报价', tag: '服务', advertiserName: 'Gengo', sortOrder: 9, displayDevices: ['desktop', 'tablet'], nofollow: true, sponsored: true, enabled: true },
          { creativeKey: 'hero_text_10', slotKey: 'home_after_hero_text', type: 'text', title: '云服务器', subtitle: '海外节点', description: '低至$5/月', href: '/ads/cloud', ctaText: '立即选购', tag: '技术', advertiserName: 'DigitalOcean', sortOrder: 10, displayDevices: ['desktop', 'tablet'], nofollow: true, sponsored: true, enabled: true },
        ],
      },
      {
        slotKey: 'home_after_hero_image',
        groupKey: 'home_after_hero_ad_group',
        placement: 'AD_HOME_AFTER_HERO_IMAGE',
        type: 'image',
        enabled: true,
        sortOrder: 20,
        displayDevices: ['desktop', 'tablet', 'mobile'],
        creatives: [
          { creativeKey: 'hero_image_01', slotKey: 'home_after_hero_image', type: 'image', title: '集运专线', description: '欧美专线 时效稳定', imageUrl: '/images/ads/shipping-line.jpg', href: '/ads/shipping-line', ctaText: '了解详情', tag: '物流', advertiserName: '递四方', sortOrder: 1, displayDevices: ['desktop', 'tablet', 'mobile'], nofollow: true, sponsored: true, enabled: true },
          { creativeKey: 'hero_image_02', slotKey: 'home_after_hero_image', type: 'image', title: '留学申请', description: '一站式留学服务', imageUrl: '/images/ads/study-abroad.jpg', href: '/ads/study-abroad', ctaText: '免费评估', tag: '教育', advertiserName: '新东方', sortOrder: 2, displayDevices: ['desktop', 'tablet', 'mobile'], nofollow: true, sponsored: true, enabled: true },
          { creativeKey: 'hero_image_03', slotKey: 'home_after_hero_image', type: 'image', title: '跨境电商', description: '开店指导 运营支持', imageUrl: '/images/ads/ecommerce.jpg', href: '/ads/ecommerce', ctaText: '立即咨询', tag: '电商', advertiserName: '亚马逊', sortOrder: 3, displayDevices: ['desktop', 'tablet'], nofollow: true, sponsored: true, enabled: true },
          { creativeKey: 'hero_image_04', slotKey: 'home_after_hero_image', type: 'image', title: '海外银行', description: '远程开户 多币种', imageUrl: '/images/ads/overseas-bank.jpg', href: '/ads/overseas-bank', ctaText: '预约开户', tag: '金融', advertiserName: 'HSBC', sortOrder: 4, displayDevices: ['desktop', 'tablet'], nofollow: true, sponsored: true, enabled: true },
        ],
      },
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
      {
        slotKey: 'home_after_tools_text',
        groupKey: 'home_after_tools_ad_group',
        placement: 'AD_HOME_AFTER_TOOLS_TEXT',
        type: 'text',
        enabled: true,
        sortOrder: 10,
        displayDevices: ['desktop', 'tablet', 'mobile'],
        creatives: Array.from({ length: 15 }, (_, i) => ({
          creativeKey: `tools_text_${String(i + 1).padStart(2, '0')}`,
          slotKey: 'home_after_tools_text',
          type: 'text' as const,
          title: ['ERP系统', 'CRM客户管理', '项目管理', '团队协作', '数据分析', '财务报表', '库存管理', '订单处理', '客服系统', '营销工具', 'SEO优化', '社媒管理', '邮件营销', '视频会议', '文档协作'][i],
          subtitle: ['企业级', '云端', '智能', '高效', '专业'][i % 5],
          description: '专业解决方案',
          href: `/ads/tool-service-${i + 1}`,
          ctaText: '了解详情',
          tag: ['热门', '推荐', '新品', '优惠', '专业'][i % 5],
          advertiserName: ['SAP', 'Salesforce', 'Asana', 'Slack', 'Tableau'][i % 5],
          sortOrder: i + 1,
          displayDevices: ['desktop', 'tablet', 'mobile'] as ('desktop' | 'tablet' | 'mobile')[],
          nofollow: true,
          sponsored: true,
          enabled: true,
        })),
      },
      {
        slotKey: 'home_after_tools_image',
        groupKey: 'home_after_tools_ad_group',
        placement: 'AD_HOME_AFTER_TOOLS_IMAGE',
        type: 'image',
        enabled: true,
        sortOrder: 20,
        displayDevices: ['desktop', 'tablet', 'mobile'],
        creatives: Array.from({ length: 5 }, (_, i) => ({
          creativeKey: `tools_image_${String(i + 1).padStart(2, '0')}`,
          slotKey: 'home_after_tools_image',
          type: 'image' as const,
          title: ['企业管理套件', '智能办公', '数据中台', '云协作平台', '自动化营销'][i],
          description: ['一站式企业管理', 'AI驱动办公', '数据驱动决策', '团队高效协作', '精准营销'][i],
          imageUrl: `/images/ads/tool-service-${i + 1}.jpg`,
          href: `/ads/tool-image-${i + 1}`,
          ctaText: '免费试用',
          tag: ['企业', 'AI', '数据', '协作', '营销'][i],
          advertiserName: ['钉钉', '飞书', '阿里云', '腾讯会议', 'HubSpot'][i],
          sortOrder: i + 1,
          displayDevices: ['desktop', 'tablet', 'mobile'] as ('desktop' | 'tablet' | 'mobile')[],
          nofollow: true,
          sponsored: true,
          enabled: true,
        })),
      },
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
      {
        slotKey: 'home_after_task_chain_text',
        groupKey: 'home_after_task_chain_ad_group',
        placement: 'AD_HOME_AFTER_TASK_CHAIN_TEXT',
        type: 'text',
        enabled: true,
        sortOrder: 10,
        displayDevices: ['desktop', 'tablet', 'mobile'],
        creatives: Array.from({ length: 15 }, (_, i) => ({
          creativeKey: `task_chain_text_${String(i + 1).padStart(2, '0')}`,
          slotKey: 'home_after_task_chain_text',
          type: 'text' as const,
          title: ['集运服务', '留学中介', '外贸代理', '签证办理', '海外搬家', '保险服务', '税务筹划', '法律咨询', '翻译认证', '公证服务', '机票预订', '酒店预订', '租车服务', '接机服务', '行李托运'][i],
          subtitle: ['全程服务', '专业指导', '一站式', '快速办理', '省心省力'][i % 5],
          description: '专业流程服务',
          href: `/ads/process-service-${i + 1}`,
          ctaText: '立即咨询',
          tag: ['集运', '留学', '外贸', '签证', '搬家'][i % 5],
          advertiserName: ['转运中国', '金吉列', '一达通', '签证之家', '七海国际'][i % 5],
          sortOrder: i + 1,
          displayDevices: ['desktop', 'tablet', 'mobile'] as ('desktop' | 'tablet' | 'mobile')[],
          nofollow: true,
          sponsored: true,
          enabled: true,
        })),
      },
      {
        slotKey: 'home_after_task_chain_image',
        groupKey: 'home_after_task_chain_ad_group',
        placement: 'AD_HOME_AFTER_TASK_CHAIN_IMAGE',
        type: 'image',
        enabled: true,
        sortOrder: 20,
        displayDevices: ['desktop', 'tablet', 'mobile'],
        creatives: Array.from({ length: 5 }, (_, i) => ({
          creativeKey: `task_chain_image_${String(i + 1).padStart(2, '0')}`,
          slotKey: 'home_after_task_chain_image',
          type: 'image' as const,
          title: ['集运专线', '留学全套', '外贸全流程', '签证无忧', '海外安居'][i],
          description: ['全球集运网络', '名校申请指导', '外贸一站式', '签证通过率99%', '海外安家服务'][i],
          imageUrl: `/images/ads/process-service-${i + 1}.jpg`,
          href: `/ads/process-image-${i + 1}`,
          ctaText: '了解详情',
          tag: ['物流', '教育', '贸易', '签证', '生活'][i],
          advertiserName: ['DHL', '启德教育', '阿里国际', 'VFS Global', '链家海外'][i],
          sortOrder: i + 1,
          displayDevices: ['desktop', 'tablet', 'mobile'] as ('desktop' | 'tablet' | 'mobile')[],
          nofollow: true,
          sponsored: true,
          enabled: true,
        })),
      },
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
      {
        slotKey: 'home_community_text',
        groupKey: 'home_community_ad_group',
        placement: 'AD_HOME_COMMUNITY_TEXT',
        type: 'text',
        enabled: true,
        sortOrder: 10,
        displayDevices: ['desktop', 'tablet', 'mobile'],
        creatives: Array.from({ length: 8 }, (_, i) => ({
          creativeKey: `community_text_${String(i + 1).padStart(2, '0')}`,
          slotKey: 'home_community_text',
          type: 'text' as const,
          title: ['华人社区', '留学生论坛', '外贸圈', '集运交流群', '海外生活', '求职招聘', '二手交易', '本地服务'][i],
          subtitle: ['交流分享', '互助问答', '商机对接', '经验分享', '生活指南', '职业发展', '闲置转让', '便民服务'][i],
          description: '活跃社区',
          href: `/ads/community-${i + 1}`,
          ctaText: '加入社区',
          tag: ['社区', '留学', '外贸', '集运', '生活', '求职', '二手', '本地'][i],
          advertiserName: ['华人网', '寄托天下', '福步论坛', '集运吧', '海外网'][i % 5],
          sortOrder: i + 1,
          displayDevices: ['desktop', 'tablet', 'mobile'] as ('desktop' | 'tablet' | 'mobile')[],
          nofollow: true,
          sponsored: true,
          enabled: true,
        })),
      },
      {
        slotKey: 'home_community_image',
        groupKey: 'home_community_ad_group',
        placement: 'AD_HOME_COMMUNITY_IMAGE',
        type: 'image',
        enabled: true,
        sortOrder: 20,
        displayDevices: ['desktop', 'tablet', 'mobile'],
        creatives: Array.from({ length: 4 }, (_, i) => ({
          creativeKey: `community_image_${String(i + 1).padStart(2, '0')}`,
          slotKey: 'home_community_image',
          type: 'image' as const,
          title: ['华人论坛', '留学社区', '外贸圈', '集运联盟'][i],
          description: ['百万华人在线', '留学经验交流', '外贸商机对接', '集运资源共享'][i],
          imageUrl: `/images/ads/community-${i + 1}.jpg`,
          href: `/ads/community-image-${i + 1}`,
          ctaText: '立即加入',
          tag: ['社区', '留学', '外贸', '集运'][i],
          advertiserName: ['留园网', '一亩三分地', '阿里外贸圈', '集运联盟'][i],
          sortOrder: i + 1,
          displayDevices: ['desktop', 'tablet', 'mobile'] as ('desktop' | 'tablet' | 'mobile')[],
          nofollow: true,
          sponsored: true,
          enabled: true,
        })),
      },
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
      {
        slotKey: 'home_before_footer_text',
        groupKey: 'home_before_footer_ad_group',
        placement: 'AD_HOME_BEFORE_FOOTER_TEXT',
        type: 'text',
        enabled: true,
        sortOrder: 10,
        displayDevices: ['desktop', 'tablet', 'mobile'],
        creatives: Array.from({ length: 24 }, (_, i) => ({
          creativeKey: `footer_text_${String(i + 1).padStart(2, '0')}`,
          slotKey: 'home_before_footer_text',
          type: 'text' as const,
          title: ['会员特权', '企业账户', 'API接入', '数据服务', '定制开发', '品牌合作', '广告投放', '资源置换', '联合推广', '渠道合作', '代理加盟', '技术支持', '培训服务', '咨询服务', '设计服务', '开发外包', '运维服务', '安全审计', '性能优化', 'SEO服务', '内容营销', '社媒运营', '视频制作', '摄影服务'][i],
          subtitle: ['专属权益', '企业级', '开发者', '数据驱动', '定制化', '品牌曝光'][i % 6],
          description: '专业服务',
          href: `/ads/footer-service-${i + 1}`,
          ctaText: '了解更多',
          tag: ['会员', '企业', 'API', '数据', '定制', '合作'][i % 6],
          advertiserName: ['绝世百宝箱', '阿里云', '腾讯云', '华为云', 'AWS', 'Azure'][i % 6],
          sortOrder: i + 1,
          displayDevices: ['desktop', 'tablet', 'mobile'] as ('desktop' | 'tablet' | 'mobile')[],
          nofollow: true,
          sponsored: true,
          enabled: true,
        })),
      },
      {
        slotKey: 'home_before_footer_image',
        groupKey: 'home_before_footer_ad_group',
        placement: 'AD_HOME_BEFORE_FOOTER_IMAGE',
        type: 'image',
        enabled: true,
        sortOrder: 20,
        displayDevices: ['desktop', 'tablet', 'mobile'],
        creatives: Array.from({ length: 6 }, (_, i) => ({
          creativeKey: `footer_image_${String(i + 1).padStart(2, '0')}`,
          slotKey: 'home_before_footer_image',
          type: 'image' as const,
          title: ['会员特权', '企业服务', 'API平台', '数据中心', '定制开发', '品牌合作'][i],
          description: ['专属会员权益', '企业级解决方案', '开发者平台', '数据分析服务', '定制化开发', '品牌联合推广'][i],
          imageUrl: `/images/ads/footer-service-${i + 1}.jpg`,
          href: `/ads/footer-image-${i + 1}`,
          ctaText: '立即了解',
          tag: ['会员', '企业', '开发', '数据', '定制', '合作'][i],
          advertiserName: ['绝世百宝箱', '钉钉', '阿里云', '腾讯云', '华为云', '京东'][i],
          sortOrder: i + 1,
          displayDevices: ['desktop', 'tablet', 'mobile'] as ('desktop' | 'tablet' | 'mobile')[],
          nofollow: true,
          sponsored: true,
          enabled: true,
        })),
      },
    ],
  },
];

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 获取启用的广告组
 */
export function getEnabledAdGroups(): AdGroup[] {
  return mockAdInventory.filter(group => group.enabled);
}

/**
 * 根据 groupKey 获取广告组
 */
export function getAdGroup(groupKey: string): AdGroup | undefined {
  return mockAdInventory.find(group => group.groupKey === groupKey);
}

/**
 * 获取广告组内启用的广告位
 */
export function getEnabledSlots(group: AdGroup): AdSlot[] {
  return group.slots.filter(slot => slot.enabled);
}

/**
 * 获取广告位内启用的广告内容
 */
export function getEnabledCreatives(slot: AdSlot): AdCreative[] {
  return slot.creatives.filter(creative => creative.enabled);
}
