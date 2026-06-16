/**
 * Resource Category Configuration
 * 
 * This is a transitional static config before backend-configurable featured slots.
 * Once admin panel supports full featured/recommended configuration, this can be
 * replaced with database-driven config.
 * 
 * 这是后台推荐位正式化前的过渡配置，不是最终硬编码方向。
 */

export interface CategoryInfo {
  key: string;
  label: string;
  description: string;
  icon: string; // lucide icon name
  color: string; // tailwind color class
  relatedTools: RelatedTool[];
  featuredIds?: string[]; // reserved for future backend config
}

export interface RelatedTool {
  name: string;
  href: string;
  description: string;
  icon: string;
}

/**
 * Category descriptions and related tools mapping.
 * Balanced across all categories - not logistics-heavy.
 */
export const CATEGORY_CONFIG: Record<string, CategoryInfo> = {
  tools: {
    key: 'tools',
    label: '实用工具',
    description: '常用计算、查询和文档工具，适合日常跨境工作快速使用。',
    icon: 'Wrench',
    color: 'purple',
    relatedTools: [
      { name: '汇率换算', href: '/tools/exchange-rate', description: '实时汇率查询与历史走势', icon: 'DollarSign' },
      { name: '全球邮编查询', href: '/tools/postal-code', description: '各国邮政编码与地址解析', icon: 'Hash' },
      { name: '单位换算', href: '/tools/calculator', description: '长度、重量、体积单位转换', icon: 'Calculator' },
      { name: '地址格式化', href: '/tools/address-formatter', description: '国际标准地址格式转换', icon: 'MapPin' },
    ],
  },
  business: {
    key: 'business',
    label: '出海经营',
    description: '跨境电商、独立站、平台运营和外贸业务相关网站。',
    icon: 'Briefcase',
    color: 'green',
    relatedTools: [
      { name: '报价单', href: '/tools/quote-sheet', description: '快速生成专业报价单', icon: 'FileText' },
      { name: 'HS Code 查询', href: '/tools/hs-code', description: '商品编码查询与归类辅助', icon: 'Hash' },
      { name: '汇率换算', href: '/tools/exchange-rate', description: '实时汇率查询与历史走势', icon: 'DollarSign' },
      { name: '商业发票', href: '/tools/commercial-invoice', description: '生成国际贸易商业发票', icon: 'FileText' },
    ],
  },
  life: {
    key: 'life',
    label: '海外生活',
    description: '海外生活、学习、工作和日常服务相关资源。',
    icon: 'Home',
    color: 'blue',
    relatedTools: [
      { name: '全球邮编查询', href: '/tools/postal-code', description: '各国邮政编码与地址解析', icon: 'Hash' },
      { name: '地址格式化', href: '/tools/address-formatter', description: '国际标准地址格式转换', icon: 'MapPin' },
      { name: '汇率换算', href: '/tools/exchange-rate', description: '实时汇率查询与历史走势', icon: 'DollarSign' },
    ],
  },
  logistics: {
    key: 'logistics',
    label: '物流追踪',
    description: '包裹追踪、国际快递和承运商查询入口，实际物流状态以第三方平台为准。',
    icon: 'Truck',
    color: 'orange',
    relatedTools: [
      { name: '物流追踪查询入口', href: '/tracking', description: '前往 17TRACK 查询全球包裹轨迹', icon: 'Globe' },
      { name: '运费估算', href: '/tools/shipping-estimator', description: '国际快递运费快速估算', icon: 'Calculator' },
      { name: '全球邮编查询', href: '/tools/postal-code', description: '各国邮政编码与地址解析', icon: 'Hash' },
    ],
  },
  education: {
    key: 'education',
    label: '教育学习',
    description: '海外学习、证件、培训和本地生活服务资源。',
    icon: 'GraduationCap',
    color: 'teal',
    relatedTools: [
      { name: '全球邮编查询', href: '/tools/postal-code', description: '各国邮政编码与地址解析', icon: 'Hash' },
      { name: '汇率换算', href: '/tools/exchange-rate', description: '实时汇率查询与历史走势', icon: 'DollarSign' },
    ],
  },
  templates: {
    key: 'templates',
    label: '外贸单据',
    description: '商业发票、报价单、装箱单和外贸单据相关工具与参考资源。',
    icon: 'FileText',
    color: 'pink',
    relatedTools: [
      { name: '商业发票', href: '/tools/commercial-invoice', description: '生成国际贸易商业发票', icon: 'FileText' },
      { name: '装箱单', href: '/tools/documents?type=packing_list', description: '生成专业装箱单', icon: 'FileText' },
      { name: '形式发票', href: '/tools/documents?type=proforma_invoice', description: '生成形式发票', icon: 'FileText' },
      { name: '报价单', href: '/tools/quote-sheet', description: '快速生成专业报价单', icon: 'FileText' },
      { name: 'HS Code 查询', href: '/tools/hs-code', description: '商品编码查询与归类辅助', icon: 'Hash' },
    ],
  },
  official: {
    key: 'official',
    label: '官方机构',
    description: '政府、海关、邮政、税务和公共机构官方网站入口。',
    icon: 'Shield',
    color: 'red',
    relatedTools: [
      { name: 'HS Code 查询', href: '/tools/hs-code', description: '商品编码查询与归类辅助', icon: 'Hash' },
      { name: '全球邮编查询', href: '/tools/postal-code', description: '各国邮政编码与地址解析', icon: 'Hash' },
    ],
  },
  payment: {
    key: 'payment',
    label: '支付收款',
    description: '跨境收款、支付、汇率结算和金融服务相关平台入口。',
    icon: 'CreditCard',
    color: 'emerald',
    relatedTools: [
      { name: '汇率换算', href: '/tools/exchange-rate', description: '实时汇率查询与历史走势', icon: 'DollarSign' },
      { name: '报价单', href: '/tools/quote-sheet', description: '快速生成专业报价单', icon: 'FileText' },
    ],
  },
  ecommerce: {
    key: 'ecommerce',
    label: '跨境电商',
    description: '主流电商平台、独立站工具和跨境电商服务资源。',
    icon: 'ShoppingCart',
    color: 'indigo',
    relatedTools: [
      { name: '报价单', href: '/tools/quote-sheet', description: '快速生成专业报价单', icon: 'FileText' },
      { name: '商业发票', href: '/tools/commercial-invoice', description: '生成国际贸易商业发票', icon: 'FileText' },
      { name: '汇率换算', href: '/tools/exchange-rate', description: '实时汇率查询与历史走势', icon: 'DollarSign' },
    ],
  },
};

/**
 * Get category info with fallback for unknown categories.
 */
export function getCategoryInfo(categoryKey: string): CategoryInfo {
  return CATEGORY_CONFIG[categoryKey] || {
    key: categoryKey,
    label: categoryKey,
    description: '',
    icon: 'Globe',
    color: 'gray',
    relatedTools: [],
  };
}

/**
 * Get all categories sorted by resource count (for display order).
 */
export function getCategoriesByCount(resourceCounts: Record<string, number>): CategoryInfo[] {
  return Object.values(CATEGORY_CONFIG)
    .sort((a, b) => (resourceCounts[b.key] || 0) - (resourceCounts[a.key] || 0));
}
