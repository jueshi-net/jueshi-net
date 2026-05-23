'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Search, Star, ExternalLink, Package, Store, Truck, Shield,
  Brain, Wrench, GraduationCap, Globe, Briefcase, FileText,
  Check, ChevronDown, ChevronUp, Hash, Coins, MapPin, QrCode,
  Calculator, Tag, Mail, Megaphone
} from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';

// ─── Mock Data ───────────────────────────────────────────────

const CATEGORIES = [
  { id: 'ecommerce', label: '电商平台', icon: Store, count: 8 },
  { id: 'logistics', label: '物流查询', icon: Truck, count: 6 },
  { id: 'compliance', label: '合规税务', icon: Shield, count: 5 },
  { id: 'selection', label: '选品工具', icon: Package, count: 4 },
  { id: 'ai', label: 'AI 效率', icon: Brain, count: 7 },
  { id: 'tools', label: '实用工具', icon: Wrench, count: 9 },
  { id: 'education', label: '学习平台', icon: GraduationCap, count: 5 },
  { id: 'life', label: '生活服务', icon: Globe, count: 6 },
  { id: 'payment', label: '跨境支付', icon: Coins, count: 4 },
  { id: 'templates', label: '模板资源', icon: FileText, count: 3 },
];

interface ResourceItem {
  id: string;
  name: string;
  desc: string;
  category: string;
  icon: React.ReactNode;
  url: string;
  tags?: string[];
}

const RESOURCES: ResourceItem[] = [
  // 电商平台
  { id: 'r1', name: 'Amazon 全球开店', desc: '官方卖家入驻与全球站点管理', category: 'ecommerce', icon: <Store className="w-5 h-5" />, url: 'https://sell.amazon.com', tags: ['官方'] },
  { id: 'r2', name: 'Shopee 虾皮', desc: '东南亚市场电商龙头', category: 'ecommerce', icon: <Store className="w-5 h-5" />, url: 'https://shopee.com' },
  { id: 'r3', name: 'Lazada', desc: '阿里系东南亚跨境平台', category: 'ecommerce', icon: <Store className="w-5 h-5" />, url: 'https://lazada.com' },
  { id: 'r4', name: 'TikTok Shop', desc: '社交电商新势力', category: 'ecommerce', icon: <Store className="w-5 h-5" />, url: 'https://shop.tiktok.com' },
  { id: 'r5', name: 'AliExpress 速卖通', desc: '面向全球买家的中国平台', category: 'ecommerce', icon: <Store className="w-5 h-5" />, url: 'https://aliexpress.com' },
  { id: 'r6', name: 'Etsy', desc: '手工艺品与创意商品平台', category: 'ecommerce', icon: <Store className="w-5 h-5" />, url: 'https://etsy.com' },
  // 物流查询
  { id: 'r7', name: '17TRACK', desc: '全球 900+ 快递商追踪', category: 'logistics', icon: <Truck className="w-5 h-5" />, url: 'https://17track.net', tags: ['推荐'] },
  { id: 'r8', name: '顺丰速运', desc: '国际快递寄件与查询', category: 'logistics', icon: <Truck className="w-5 h-5" />, url: 'https://sf-express.com' },
  { id: 'r9', name: 'DHL 全球速递', desc: '国际快递与货运服务', category: 'logistics', icon: <Truck className="w-5 h-5" />, url: 'https://dhl.com' },
  { id: 'r10', name: 'FedEx 联邦快递', desc: '全球快递与供应链管理', category: 'logistics', icon: <Truck className="w-5 h-5" />, url: 'https://fedex.com' },
  { id: 'r11', name: 'USPS 美国邮政', desc: '美国境内邮件追踪', category: 'logistics', icon: <Truck className="w-5 h-5" />, url: 'https://usps.com' },
  { id: 'r12', name: 'UPS 联合包裹', desc: '全球物流与供应链解决方案', category: 'logistics', icon: <Truck className="w-5 h-5" />, url: 'https://ups.com' },
  // 合规税务
  { id: 'r13', name: 'Avalara', desc: '自动化销售税计算与申报', category: 'compliance', icon: <Shield className="w-5 h-5" />, url: 'https://avalara.com', tags: ['推荐'] },
  { id: 'r14', name: 'TaxJar', desc: '电商销售税合规管理', category: 'compliance', icon: <Shield className="w-5 h-5" />, url: 'https://taxjar.com' },
  { id: 'r15', name: 'EU OSS Portal', desc: '欧盟一站式增值税申报', category: 'compliance', icon: <Shield className="w-5 h-5" />, url: 'https://ec.europa.eu' },
  { id: 'r16', name: 'VIES 验证', desc: '欧盟 VAT 号码在线验证', category: 'compliance', icon: <Shield className="w-5 h-5" />, url: 'https://ec.europa.eu/vies' },
  { id: 'r17', name: 'HMRC 英国税务', desc: '英国 HMRC 税务申报入口', category: 'compliance', icon: <Shield className="w-5 h-5" />, url: 'https://gov.uk' },
  // 选品工具
  { id: 'r18', name: 'Jungle Scout', desc: 'Amazon 选品与市场洞察', category: 'selection', icon: <Package className="w-5 h-5" />, url: 'https://junglescout.com', tags: ['付费'] },
  { id: 'r19', name: 'Helium 10', desc: '全链路 Amazon 运营工具', category: 'selection', icon: <Package className="w-5 h-5" />, url: 'https://helium10.com', tags: ['推荐'] },
  { id: 'r20', name: 'Keepa', desc: 'Amazon 价格历史追踪插件', category: 'selection', icon: <Package className="w-5 h-5" />, url: 'https://keepa.com' },
  { id: 'r21', name: 'Google Trends', desc: '免费选品趋势分析', category: 'selection', icon: <Package className="w-5 h-5" />, url: 'https://trends.google.com', tags: ['免费'] },
  // AI 效率
  { id: 'r22', name: 'ChatGPT', desc: 'OpenAI 对话式 AI 助手', category: 'ai', icon: <Brain className="w-5 h-5" />, url: 'https://chat.openai.com', tags: ['推荐'] },
  { id: 'r23', name: 'Claude', desc: 'Anthropic 长文本 AI', category: 'ai', icon: <Brain className="w-5 h-5" />, url: 'https://claude.ai' },
  { id: 'r24', name: 'Gemini', desc: 'Google AI 助手', category: 'ai', icon: <Brain className="w-5 h-5" />, url: 'https://gemini.google.com' },
  { id: 'r25', name: 'Midjourney', desc: 'AI 图像生成与设计', category: 'ai', icon: <Brain className="w-5 h-5" />, url: 'https://midjourney.com' },
  { id: 'r26', name: 'Perplexity', desc: 'AI 搜索引擎', category: 'ai', icon: <Brain className="w-5 h-5" />, url: 'https://perplexity.ai' },
  { id: 'r27', name: 'Notion AI', desc: 'AI 增强的笔记与文档', category: 'ai', icon: <Brain className="w-5 h-5" />, url: 'https://notion.so' },
  { id: 'r28', name: 'Grammarly', desc: 'AI 英文写作校对', category: 'ai', icon: <Brain className="w-5 h-5" />, url: 'https://grammarly.com' },
  // 实用工具
  { id: 'r29', name: '1Password', desc: '跨平台密码管理器', category: 'tools', icon: <Wrench className="w-5 h-5" />, url: 'https://1password.com' },
  { id: 'r30', name: 'DeepL 翻译', desc: '高精度 AI 翻译引擎', category: 'tools', icon: <Wrench className="w-5 h-5" />, url: 'https://deepl.com', tags: ['推荐'] },
  { id: 'r31', name: 'Canva', desc: '在线设计与海报制作', category: 'tools', icon: <Wrench className="w-5 h-5" />, url: 'https://canva.com' },
  { id: 'r32', name: 'TinyPNG', desc: '图片无损压缩工具', category: 'tools', icon: <Wrench className="w-5 h-5" />, url: 'https://tinypng.com', tags: ['免费'] },
  { id: 'r33', name: 'Remove.bg', desc: '一键去除图片背景', category: 'tools', icon: <Wrench className="w-5 h-5" />, url: 'https://remove.bg' },
  { id: 'r34', name: 'ILovePDF', desc: 'PDF 合并/拆分/压缩', category: 'tools', icon: <Wrench className="w-5 h-5" />, url: 'https://ilovepdf.com' },
  { id: 'r35', name: 'Bitly', desc: '短链接生成与分析', category: 'tools', icon: <Wrench className="w-5 h-5" />, url: 'https://bitly.com' },
  { id: 'r36', name: 'Calendly', desc: '在线预约与会议排期', category: 'tools', icon: <Wrench className="w-5 h-5" />, url: 'https://calendly.com' },
  { id: 'r37', name: 'Zapier', desc: '无代码自动化工作流', category: 'tools', icon: <Wrench className="w-5 h-5" />, url: 'https://zapier.com' },
  // 学习平台
  { id: 'r38', name: 'Coursera', desc: '全球名校在线课程', category: 'education', icon: <GraduationCap className="w-5 h-5" />, url: 'https://coursera.org', tags: ['推荐'] },
  { id: 'r39', name: 'edX', desc: '哈佛/MIT 等名校课程', category: 'education', icon: <GraduationCap className="w-5 h-5" />, url: 'https://edx.org' },
  { id: 'r40', name: 'Khan Academy', desc: '免费全科在线教育', category: 'education', icon: <GraduationCap className="w-5 h-5" />, url: 'https://khanacademy.org', tags: ['免费'] },
  { id: 'r41', name: 'Udemy', desc: '实用技能课程市场', category: 'education', icon: <GraduationCap className="w-5 h-5" />, url: 'https://udemy.com' },
  { id: 'r42', name: 'YouTube Learning', desc: 'YouTube 教育频道合集', category: 'education', icon: <GraduationCap className="w-5 h-5" />, url: 'https://youtube.com' },
  // 生活服务
  { id: 'r43', name: 'Wise 跨境汇款', desc: '低汇率损耗国际汇款', category: 'life', icon: <Globe className="w-5 h-5" />, url: 'https://wise.com', tags: ['推荐'] },
  { id: 'r44', name: 'Revolut', desc: '多币种数字银行', category: 'life', icon: <Globe className="w-5 h-5" />, url: 'https://revolut.com' },
  { id: 'r45', name: 'Zocdoc', desc: '在线预约美国医生', category: 'life', icon: <Globe className="w-5 h-5" />, url: 'https://zocdoc.com' },
  { id: 'r46', name: 'Yelp', desc: '本地商户评价与推荐', category: 'life', icon: <Globe className="w-5 h-5" />, url: 'https://yelp.com' },
  { id: 'r47', name: 'Uber', desc: '打车与外卖配送', category: 'life', icon: <Globe className="w-5 h-5" />, url: 'https://uber.com' },
  { id: 'r48', name: 'Expedia', desc: '全球机票酒店预订', category: 'life', icon: <Globe className="w-5 h-5" />, url: 'https://expedia.com' },
  // 跨境支付
  { id: 'r49', name: 'Payoneer 派安盈', desc: '多币种收款账户', category: 'payment', icon: <Coins className="w-5 h-5" />, url: 'https://payoneer.com', tags: ['推荐'] },
  { id: 'r50', name: 'PayPal', desc: '全球通用在线支付', category: 'payment', icon: <Coins className="w-5 h-5" />, url: 'https://paypal.com' },
  { id: 'r51', name: 'Stripe', desc: '开发者友好的支付 API', category: 'payment', icon: <Coins className="w-5 h-5" />, url: 'https://stripe.com' },
  { id: 'r52', name: '连连支付', desc: '合规跨境收款通道', category: 'payment', icon: <Coins className="w-5 h-5" />, url: 'https://lianlianpay.com' },
  // 模板资源
  { id: 'r53', name: '商业发票模板', desc: '可编辑的外贸发票格式', category: 'templates', icon: <FileText className="w-5 h-5" />, url: '/tools/commercial-invoice', tags: ['本站'] },
  { id: 'r54', name: '装箱单模板', desc: '标准装箱单格式参考', category: 'templates', icon: <FileText className="w-5 h-5" />, url: '/tools' },
  { id: 'r55', name: '箱唛面单模板', desc: '国际标准化唛头标签', category: 'templates', icon: <FileText className="w-5 h-5" />, url: '/tools/shipping-label', tags: ['本站'] },
];

const MAX_FAVORITES = 20;

// ─── Toast System ────────────────────────────────────────────

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'info';
}

function Toast({ toast }: { toast: ToastState }) {
  if (!toast.show) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[10000] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-xl text-sm font-medium border ${
        toast.type === 'success'
          ? 'bg-white border-teal-200 text-teal-800'
          : 'bg-white border-gray-200 text-gray-700'
      }`}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
          toast.type === 'success' ? 'bg-teal-100' : 'bg-gray-100'
        }`}>
          {toast.type === 'success'
            ? <Check className="w-3 h-3 text-teal-600" />
            : <Megaphone className="w-3 h-3 text-gray-600" />
          }
        </div>
        {toast.message}
      </div>
    </div>
  );
}

// ─── ResourceCard ────────────────────────────────────────────

function ResourceCard({
  resource,
  isFavorited,
  onToggle,
}: {
  resource: ResourceItem;
  isFavorited: boolean;
  onToggle: () => void;
}) {
  return (
    <a
      href={resource.url}
      target={resource.url.startsWith('http') ? '_blank' : undefined}
      rel={resource.url.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="group relative flex items-start gap-3 bg-white rounded-xl border border-gray-100 p-4 shadow-sm shadow-gray-100/30 hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Icon */}
      <div className="shrink-0 w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
        {resource.icon}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 truncate">
            {resource.name}
          </h3>
          {resource.tags?.map(tag => (
            <span key={tag} className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ${
              tag === '推荐' ? 'bg-teal-50 text-teal-600' :
              tag === '免费' ? 'bg-green-50 text-green-600' :
              tag === '付费' ? 'bg-amber-50 text-amber-600' :
              tag === '本站' ? 'bg-blue-50 text-blue-600' :
              'bg-gray-100 text-gray-500'
            }`}>
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{resource.desc}</p>
      </div>

      {/* Favorite Button */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
        className="shrink-0 p-1 rounded-lg text-gray-300 hover:text-amber-500 hover:bg-amber-50 transition-all"
        aria-label={isFavorited ? '取消收藏' : '收藏'}
      >
        <Star className={`w-4 h-4 transition-all ${
          isFavorited
            ? 'fill-amber-400 text-amber-400 scale-110'
            : 'stroke-[1.5]'
        }`} />
      </button>
    </a>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
  }, []);

  const handleToggleFavorite = useCallback((resourceId: string) => {
    setFavorites(prev => {
      const isFavorited = prev.has(resourceId);
      if (isFavorited) {
        prev.delete(resourceId);
        showToast('已取消收藏', 'info');
      } else {
        if (prev.size >= MAX_FAVORITES) {
          showToast(`收藏上限 ${MAX_FAVORITES} 个，请先取消其他收藏`, 'info');
          return prev;
        }
        prev.add(resourceId);
        showToast(`✅ 已添加到个人工作台 (容量：${prev.size}/${MAX_FAVORITES})`);
      }
      return new Set(prev);
    });
  }, [showToast]);

  const filteredResources = useMemo(() => {
    let items = RESOURCES;
    if (activeCategory !== 'all') {
      items = items.filter(r => r.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.desc.toLowerCase().includes(q) ||
        r.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return items;
  }, [activeCategory, searchQuery]);

  const allCategory = { id: 'all', label: '全部资源', icon: Globe, count: RESOURCES.length };
  const sidebarItems = [allCategory, ...CATEGORIES];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumb />
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              严选资源库
            </h1>
            <p className="mt-1 text-sm text-gray-500">编辑筛选，只推荐真正好用的海外工具与服务</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              已收藏 {favorites.size}/{MAX_FAVORITES}
            </span>
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              {mobileSidebarOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="在资源库中搜索..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 shadow-sm"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`
            ${mobileSidebarOpen ? 'block' : 'hidden'}
            lg:block shrink-0 w-56
          `}>
            <nav className="sticky top-20 space-y-1">
              {sidebarItems.map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setMobileSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                    <span className="flex-1 text-left truncate">{cat.label}</span>
                    <span className={`text-xs ${isActive ? 'text-teal-500' : 'text-gray-400'}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content Grid */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-4">
              {activeCategory === 'all' ? '全部资源' : CATEGORIES.find(c => c.id === activeCategory)?.label}
              {searchQuery && ` · 搜索 "${searchQuery}"`}
              <span className="ml-2">共 {filteredResources.length} 项</span>
            </p>

            {filteredResources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="w-12 h-12 text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium">未找到匹配的资源</p>
                <p className="text-sm text-gray-400 mt-1">试试其他关键词或切换分类</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredResources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isFavorited={favorites.has(resource.id)}
                    onToggle={() => handleToggleFavorite(resource.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast toast={toast} />
    </div>
  );
}
