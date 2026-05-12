// 外网新手资源数据
// 分类: starter, ai-tools, browser-extensions, video-learning, overseas-life, business-tools, security

export interface StarterResource {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  category: string;
  tags: string[];
  isRecommended?: boolean;
  platform?: string;
  language?: string;
  sourceType?: string;
}

export const starterResources: StarterResource[] = [
  // 外网新手必装软件
  {
    id: 'starter-1',
    title: 'Chrome 浏览器',
    description: '全球最流行的浏览器，扩展生态丰富',
    url: 'https://www.google.com/chrome/',
    icon: '🌐',
    category: 'starter',
    tags: ['浏览器', '必装', '新手必看'],
    isRecommended: true,
  },
  {
    id: 'starter-2',
    title: 'Bitwarden 密码管理器',
    description: '免费开源的密码管理工具，保护账号安全',
    url: 'https://bitwarden.com/',
    icon: '🔐',
    category: 'starter',
    tags: ['密码管理', '安全', '必装'],
    isRecommended: true,
  },
  {
    id: 'starter-3',
    title: 'Google 翻译',
    description: '支持 100+ 语言的即时翻译工具',
    url: 'https://translate.google.com/',
    icon: '🌍',
    category: 'starter',
    tags: ['翻译', '语言', '效率'],
  },
  {
    id: 'starter-4',
    title: 'uBlock Origin',
    description: '轻量高效的广告拦截浏览器扩展',
    url: 'https://ublockorigin.com/',
    icon: '🚫',
    category: 'starter',
    tags: ['广告拦截', '隐私', '扩展'],
  },
  {
    id: 'starter-5',
    title: 'Google Drive',
    description: '15GB 免费云存储，文档协作必备',
    url: 'https://drive.google.com/',
    icon: '📁',
    category: 'starter',
    tags: ['云存储', '协作', '文档'],
  },
  {
    id: 'starter-6',
    title: 'Signal 加密通讯',
    description: '端到端加密的即时通讯应用',
    url: 'https://signal.org/',
    icon: '💬',
    category: 'starter',
    tags: ['通讯', '隐私', '安全'],
  },

  // AI 工具
  {
    id: 'ai-1',
    title: 'ChatGPT',
    description: 'OpenAI 推出的 AI 对话助手',
    url: 'https://chat.openai.com/',
    icon: '🤖',
    category: 'ai-tools',
    tags: ['AI', '对话', '写作'],
    isRecommended: true,
  },
  {
    id: 'ai-2',
    title: 'Claude',
    description: 'Anthropic 开发的 AI 助手，擅长长文本分析',
    url: 'https://claude.ai/',
    icon: '🧠',
    category: 'ai-tools',
    tags: ['AI', '分析', '写作'],
    isRecommended: true,
  },
  {
    id: 'ai-3',
    title: 'Midjourney',
    description: 'AI 图像生成工具，输入文字即可生成高质量图片',
    url: 'https://www.midjourney.com/',
    icon: '🎨',
    category: 'ai-tools',
    tags: ['AI', '图像', '创作'],
  },
  {
    id: 'ai-4',
    title: 'Gemini',
    description: 'Google 的 AI 助手，深度整合 Google 生态',
    url: 'https://gemini.google.com/',
    icon: '✨',
    category: 'ai-tools',
    tags: ['AI', 'Google', '多模态'],
  },
  {
    id: 'ai-5',
    title: 'Copilot',
    description: 'Microsoft 的 AI 编程助手',
    url: 'https://github.com/features/copilot',
    icon: '💻',
    category: 'ai-tools',
    tags: ['AI', '编程', '开发'],
  },

  // 视频与学习平台
  {
    id: 'video-1',
    title: 'YouTube',
    description: '全球最大的视频分享平台',
    url: 'https://www.youtube.com/',
    icon: '🎬',
    category: 'video-learning',
    tags: ['视频', '学习', '娱乐'],
    isRecommended: true,
  },
  {
    id: 'video-2',
    title: 'Coursera',
    description: '全球顶尖大学的在线课程平台',
    url: 'https://www.coursera.org/',
    icon: '🎓',
    category: 'video-learning',
    tags: ['课程', '学习', '证书'],
  },
  {
    id: 'video-3',
    title: 'Khan Academy',
    description: '免费的在线教育平台，覆盖数学、科学等',
    url: 'https://www.khanacademy.org/',
    icon: '📚',
    category: 'video-learning',
    tags: ['免费', '教育', 'K12'],
  },
  {
    id: 'video-4',
    title: 'edX',
    description: '哈佛 MIT 创办的在线学习平台',
    url: 'https://www.edx.org/',
    icon: '🏛️',
    category: 'video-learning',
    tags: ['大学课程', '学习', '证书'],
  },

  // 海外华人常用网站
  {
    id: 'overseas-1',
    title: 'Wise 跨境汇款',
    description: '低手续费的国际汇款服务',
    url: 'https://wise.com/',
    icon: '💸',
    category: 'overseas-life',
    tags: ['汇款', '金融', '跨境'],
    isRecommended: true,
  },
  {
    id: 'overseas-2',
    title: 'Amazon 全球购物',
    description: '全球最大的电商平台',
    url: 'https://www.amazon.com/',
    icon: '🛒',
    category: 'overseas-life',
    tags: ['购物', '电商', '生活'],
  },
  {
    id: 'overseas-3',
    title: 'PayPal',
    description: '全球通用的在线支付工具',
    url: 'https://www.paypal.com/',
    icon: '💳',
    category: 'overseas-life',
    tags: ['支付', '金融', '收款'],
  },
  {
    id: 'overseas-4',
    title: 'X (Twitter)',
    description: '全球信息社交平台',
    url: 'https://x.com/',
    icon: '🐦',
    category: 'overseas-life',
    tags: ['社交', '资讯', '平台'],
  },

  // 出海经营工具
  {
    id: 'business-1',
    title: 'Shopify',
    description: '一站式跨境电商建站平台',
    url: 'https://www.shopify.com/',
    icon: '🛍️',
    category: 'business-tools',
    tags: ['建站', '电商', '跨境'],
    isRecommended: true,
  },
  {
    id: 'business-2',
    title: 'Stripe',
    description: '全球领先的在线支付处理商',
    url: 'https://stripe.com/',
    icon: '💰',
    category: 'business-tools',
    tags: ['支付', '收款', '金融'],
  },
  {
    id: 'business-3',
    title: 'Cloudflare',
    description: '全球 CDN 和网站安全服务',
    url: 'https://www.cloudflare.com/',
    icon: '☁️',
    category: 'business-tools',
    tags: ['CDN', '安全', '基础设施'],
  },
  {
    id: 'business-4',
    title: 'Google Analytics',
    description: '网站流量分析工具',
    url: 'https://analytics.google.com/',
    icon: '📊',
    category: 'business-tools',
    tags: ['分析', '数据', '营销'],
  },

  // 账号安全与隐私保护
  {
    id: 'security-1',
    title: 'Google Authenticator',
    description: '两步验证应用，保护账号安全',
    url: 'https://support.google.com/accounts/answer/1066447',
    icon: '🔑',
    category: 'security',
    tags: ['2FA', '安全', '认证'],
    isRecommended: true,
  },
  {
    id: 'security-2',
    title: 'ProtonMail 加密邮箱',
    description: '瑞士端到端加密邮箱服务',
    url: 'https://proton.me/mail',
    icon: '📧',
    category: 'security',
    tags: ['邮箱', '加密', '隐私'],
  },
  {
    id: 'security-3',
    title: '1Password',
    description: '付费密码管理器，家庭共享方案',
    url: 'https://1password.com/',
    icon: '🗝️',
    category: 'security',
    tags: ['密码', '管理', '安全'],
  },
  {
    id: 'security-4',
    title: 'Privacy Badger',
    description: 'EFF 开发的隐私保护浏览器扩展',
    url: 'https://privacybadger.org/',
    icon: '🦎',
    category: 'security',
    tags: ['隐私', '防追踪', '扩展'],
  },

  // 浏览器插件
  {
    id: 'ext-1',
    title: 'DeepL 翻译',
    description: '高质量 AI 翻译浏览器扩展',
    url: 'https://www.deepl.com/',
    icon: '🌐',
    category: 'browser-extensions',
    tags: ['翻译', 'AI', '效率'],
    isRecommended: true,
  },
  {
    id: 'ext-2',
    title: 'Dark Reader',
    description: '为任意网站启用暗色模式',
    url: 'https://darkreader.org/',
    icon: '🌙',
    category: 'browser-extensions',
    tags: ['暗色', '护眼', '体验'],
  },
  {
    id: 'ext-3',
    title: 'Honey 比价',
    description: '自动查找优惠券和比价',
    url: 'https://www.joinhoney.com/',
    icon: '🍯',
    category: 'browser-extensions',
    tags: ['比价', '购物', '省钱'],
  },
  {
    id: 'ext-4',
    title: 'Notion Web Clipper',
    description: '保存网页到 Notion 笔记',
    url: 'https://www.notion.so/web-clipper',
    icon: '📝',
    category: 'browser-extensions',
    tags: ['笔记', '收藏', '效率'],
  },
];

// 按分类分组
export function getResourcesByCategory(category: string): StarterResource[] {
  return starterResources.filter(r => r.category === category);
}

// 获取所有分类
export const starterCategories = [
  { id: 'starter', slug: 'starter', name: '外网新手', icon: '🛠️', description: '刚能访问外网必看的基础软件和工具' },
  { id: 'ai-tools', slug: 'ai-tools', name: 'AI 工具', icon: '🤖', description: '主流 AI 平台汇总' },
  { id: 'video-learning', slug: 'video-learning', name: '视频学习', icon: '🎬', description: 'YouTube 教程、在线课程平台' },
  { id: 'overseas-life', slug: 'overseas-life', name: '海外生活', icon: '🌐', description: '银行/购物/社交/生活办事' },
  { id: 'business-tools', slug: 'business-tools', name: '出海经营', icon: '💼', description: '建站/收款/广告/物流工具' },
  { id: 'security', slug: 'security', name: '账号安全', icon: '🔒', description: '密码管理、隐私保护、双重验证' },
  { id: 'browser-extensions', slug: 'browser-extensions', name: '浏览器插件', icon: '🧩', description: '翻译、截图、比价、笔记等效率插件' },
] as const;
