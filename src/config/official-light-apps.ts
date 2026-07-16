/**
 * 官方轻应用注册表
 * 
 * 静态配置，不使用数据库
 * 状态只允许：published | hidden
 */

export interface LightAppViewport {
  desktopHeight: number;
  tabletHeight: number;
  mobileHeight: number;
  mobileMode: 'responsive' | 'canvas-scroll';
}

export interface OfficialLightApp {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  entry: string;
  icon: string;
  capabilities: string[];
  featured: boolean;
  status: 'published' | 'hidden';
  privacyNote: string;
  viewport: LightAppViewport;
}

export const OFFICIAL_LIGHT_APPS: OfficialLightApp[] = [
  {
    slug: 'label-printer',
    name: '物流标签与唛头打印',
    shortDescription: '快速生成物流标签和唛头，支持多种纸张尺寸',
    longDescription: '专业的物流标签打印工具，支持自定义纸张尺寸、安全留白、公司名、唛头内容、打印数量等。适用于国际物流、仓储管理场景。',
    category: '打印工具',
    entry: '/tools/apps/label-printer',
    icon: '️',
    capabilities: ['edit', 'print'],
    featured: true,
    status: 'published',
    privacyNote: '本工具在当前浏览器中运行，填写的数据不会自动保存到绝世百宝箱账户。请及时打印或下载结果。',
    viewport: {
      desktopHeight: 820,
      tabletHeight: 820,
      mobileHeight: 720,
      mobileMode: 'responsive'
    }
  },
  {
    slug: 'quotation-builder',
    name: '国际物流报价单',
    shortDescription: '快速生成国际物流报价单，支持动态费用行',
    longDescription: '专业的国际物流报价单生成工具，支持编辑公司与客户信息、航线信息、动态增加/删除费用行、自动汇总、打印和图片导出。',
    category: '外贸单据',
    entry: '/tools/apps/quotation-builder',
    icon: '📋',
    capabilities: ['edit', 'dynamic-rows', 'print', 'download-image'],
    featured: true,
    status: 'published',
    privacyNote: '本工具在当前浏览器中运行，填写的数据不会自动保存到绝世百宝箱账户。请及时打印或下载结果。',
    viewport: {
      desktopHeight: 980,
      tabletHeight: 900,
      mobileHeight: 760,
      mobileMode: 'canvas-scroll'
    }
  },
  {
    slug: 'delivery-note',
    name: '出货交接单',
    shortDescription: '快速生成出货交接单，支持 Logo 上传和动态货物行',
    longDescription: '专业的出货交接单生成工具，支持上传 Logo、编辑收发货信息、动态货物行、件数合计、打印和图片导出。适用于仓储物流场景。',
    category: '仓储物流',
    entry: '/tools/apps/delivery-note',
    icon: '📦',
    capabilities: ['edit', 'upload-logo', 'dynamic-rows', 'print', 'download-image'],
    featured: true,
    status: 'published',
    privacyNote: '本工具在当前浏览器中运行，填写的数据不会自动保存到绝世百宝箱账户。请及时打印或下载结果。',
    viewport: {
      desktopHeight: 980,
      tabletHeight: 900,
      mobileHeight: 760,
      mobileMode: 'canvas-scroll'
    }
  }
];

export const getLightAppBySlug = (slug: string): OfficialLightApp | undefined => {
  return OFFICIAL_LIGHT_APPS.find(app => app.slug === slug);
};

export const getPublishedLightApps = (): OfficialLightApp[] => {
  return OFFICIAL_LIGHT_APPS.filter(app => app.status === 'published');
};

export const getFeaturedLightApps = (): OfficialLightApp[] => {
  return OFFICIAL_LIGHT_APPS.filter(app => app.featured && app.status === 'published');
};
