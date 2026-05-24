'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowRight, MapPin, Sparkles, Globe, ArrowUpRight, FileText, Tag, Package, DollarSign, Ship, Shield, Boxes, ClipboardList, Award, Flame, CreditCard, Truck, Mail, Container, ArrowDownUp, LucideIcon, FileText as FileTextIcon } from 'lucide-react';
import type { DestinationHub } from '@/lib/destinations-config';
import { Breadcrumb } from '@/components/breadcrumb';
import { documentTools, categoryLabels as docCategoryLabels } from '@/lib/document-tools-config';

// ═══ Unified tool data bridge ═══
// Bridges documentTools + standalone public tools into one lookup

interface HubTool {
  key: string;
  titleZh: string;
  titleEn: string;
  description: string;
  category: string;
  href: string;
  emoji: string;
  Icon: LucideIcon;
  color: { bg: string; icon: string; hover: string; badge: string };
}

const standaloneTools: Record<string, Omit<HubTool, 'Icon' | 'color'>> = {
  'postal-code': {
    key: 'postal-code',
    titleZh: '全球邮编查询',
    titleEn: 'Postal Code Lookup',
    description: '查询 200+ 国家和地区的邮政编码与邮编格式',
    category: 'query',
    href: '/tools/postal-code',
    emoji: '📮',
  },
  'shipping-calculator': {
    key: 'shipping-calculator',
    titleZh: '体积/运费计算器',
    titleEn: 'Shipping Calculator',
    description: '计算包裹体积重、材积重，对比不同渠道运费',
    category: 'logistics',
    href: '/tools/shipping-calculator',
    emoji: '📐',
  },
  'exchange-rate': {
    key: 'exchange-rate',
    titleZh: '实时汇率换算',
    titleEn: 'Exchange Rate',
    description: '30+ 货币对实时汇率，支持历史走势参考',
    category: 'finance',
    href: '/tools/exchange-rate',
    emoji: '💱',
  },
};

const lucideMap: Record<string, LucideIcon> = {
  'proforma-invoice': FileText, 'commercial-invoice': FileText, 'packing-list': Package,
  'sales-contract': FileText, 'booking-instruction': Ship, 'customs-declaration-authorization': Shield,
  'delivery-note': Truck, 'freight-statement': DollarSign, 'consolidation-inbound-receipt': ArrowDownUp,
  'consolidation-packing-list': Boxes, 'express-declaration': Mail, 'quotation': FileText,
  'shipping-instruction': ClipboardList, 'trucking-dispatch-order': Truck, 'shipping-mark': Tag,
  'container-loading-list': Container, 'return-packing-list': ArrowDownUp,
  'certificate-of-origin-template': Award, 'fumigation-certificate-template': Flame,
  'letter-of-credit-info-sheet': CreditCard, 'label-maker': Tag,
  'postal-code': MapPin, 'shipping-calculator': Package, 'exchange-rate': DollarSign,
};

const categoryColorMap: Record<string, { bg: string; icon: string; hover: string; badge: string }> = {
  trade: { bg: 'bg-teal-50', icon: 'text-teal-600', hover: 'hover:border-teal-300', badge: 'bg-teal-50 text-teal-700 border-teal-100' },
  logistics: { bg: 'bg-blue-50', icon: 'text-blue-600', hover: 'hover:border-blue-300', badge: 'bg-blue-50 text-blue-700 border-blue-100' },
  customs: { bg: 'bg-purple-50', icon: 'text-purple-600', hover: 'hover:border-purple-300', badge: 'bg-purple-50 text-purple-700 border-purple-100' },
  consolidation: { bg: 'bg-indigo-50', icon: 'text-indigo-600', hover: 'hover:border-indigo-300', badge: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  finance: { bg: 'bg-orange-50', icon: 'text-orange-600', hover: 'hover:border-orange-300', badge: 'bg-orange-50 text-orange-700 border-orange-100' },
  label: { bg: 'bg-amber-50', icon: 'text-amber-600', hover: 'hover:border-amber-300', badge: 'bg-amber-50 text-amber-700 border-amber-100' },
  query: { bg: 'bg-slate-50', icon: 'text-slate-600', hover: 'hover:border-slate-300', badge: 'bg-slate-50 text-slate-700 border-slate-100' },
};

const emojiMap: Record<string, string> = {
  'proforma-invoice': '📋', 'commercial-invoice': '🧾', 'packing-list': '📦',
  'sales-contract': '📄', 'booking-instruction': '🚢', 'customs-declaration-authorization': '🏛️',
  'delivery-note': '🚚', 'freight-statement': '💰', 'consolidation-inbound-receipt': '📥',
  'consolidation-packing-list': '📫', 'express-declaration': '✈️', 'quotation': '📝',
  'shipping-instruction': '📋', 'trucking-dispatch-order': '🚛', 'shipping-mark': '🏷️',
  'container-loading-list': '📦', 'return-packing-list': '↩️',
  'certificate-of-origin-template': '🏅', 'fumigation-certificate-template': '🪵',
  'letter-of-credit-info-sheet': '💳', 'label-maker': '📌',
  'postal-code': '📮', 'shipping-calculator': '📐', 'exchange-rate': '💱',
};

function getToolByKey(key: string): HubTool | null {
  // Check documentTools first
  const docTool = documentTools.find(t => t.key === key);
  if (docTool) {
    const colors = categoryColorMap[docTool.category] || categoryColorMap.trade;
    const Icon = lucideMap[docTool.key] || FileText;
    let href = `/tools/documents/${docTool.key}`;
    if (docTool.key === 'label-maker') href = '/tools/documents/shipping-label';
    return {
      key: docTool.key,
      titleZh: docTool.titleZh,
      titleEn: docTool.titleEn,
      description: docTool.description,
      category: docTool.category,
      href,
      emoji: emojiMap[docTool.key] || '📄',
      Icon,
      color: colors,
    };
  }
  // Check standalone tools
  const standalone = standaloneTools[key];
  if (standalone) {
    const colors = categoryColorMap[standalone.category] || categoryColorMap.query;
    const Icon = lucideMap[key] || FileText;
    return {
      ...standalone,
      Icon,
      color: colors,
    };
  }
  return null;
}

// ═══ Tool Card Component ═══

const allCategoryLabels: Record<string, string> = {
  ...docCategoryLabels,
  query: '通用查询',
};

function ToolCard({ tool }: { tool: HubTool }) {
  const Icon = tool.Icon;
  const label = allCategoryLabels[tool.category] || tool.category;

  return (
    <Link
      href={tool.href}
      className={`group relative bg-white rounded-xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] ${tool.color.hover} transition-all duration-300 hover:-translate-y-[2px] p-4 flex items-start gap-3.5`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${tool.color.bg} ${tool.color.icon} group-hover:scale-105 group-hover:ring-1 group-hover:ring-gray-100`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
            {tool.titleZh}
          </h3>
          {/* Category badge */}
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border flex-shrink-0 ${tool.color.badge}`}>
            {label}
          </span>
        </div>
        <p className="text-[11px] text-gray-400 truncate">{tool.titleEn}</p>
        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{tool.description}</p>
      </div>

      {/* Arrow */}
      <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-1 group-hover:text-purple-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
    </Link>
  );
}

// ═══ Main Hero Component ═══

export default function DestinationHero({ dest }: { dest: DestinationHub }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const slug = query
      .trim()
      .toLowerCase()
      .replace(/[\s\u3000]+/g, '-')
      .replace(/[^\w\u4e00-\u9fff-]/g, '');
    router.push(`/destinations/${slug}`);
  };

  // Resolve recommended tools from both config sources
  const resolvedTools = dest.recommendedTools
    .map(key => getToolByKey(key))
    .filter((t): t is HubTool => t !== null);

  return (
    <>
      {/* ===== HERO ===== */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-800 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 pb-16 md:pt-12 md:pb-20">
          <Breadcrumb />

          <div className="mt-6 flex flex-wrap items-center gap-3 mb-5">
            <span className="text-4xl">{dest.emoji}</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
              <Globe className="w-3 h-3" /> {dest.region}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            {dest.seo.heroTitle}
          </h1>

          <p className="text-lg md:text-xl text-indigo-100/90 max-w-2xl leading-relaxed mb-8">
            {dest.seo.heroSubtitle}
          </p>

          {/* Smart Search */}
          <form onSubmit={handleSearch} className="relative max-w-xl">
            <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden focus-within:border-white/40 focus-within:bg-white/15 transition-all shadow-lg">
              <div className="pl-5 text-indigo-200"><Search className="w-5 h-5" /></div>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="搜索其他国家，如「日本」「美国」「英国」..."
                className="flex-1 px-4 py-4 bg-transparent text-white placeholder:text-indigo-200/60 text-sm md:text-base focus:outline-none min-h-[48px]"
              />
              <button type="submit" className="mr-2 px-5 py-2.5 bg-white text-purple-700 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center gap-1.5 min-h-[44px]">
                <span className="hidden sm:inline">前往</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-indigo-200/50 pl-1">输入国家/地区名称，快速跳转专属工具箱</p>
          </form>

          {dest.keyCities.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="text-xs text-indigo-200/60 font-medium self-center mr-1">热门城市：</span>
              {dest.keyCities.map(city => (
                <span key={city} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-xs text-indigo-100/80 border border-white/5 hover:bg-white/15 transition-colors cursor-default">
                  <MapPin className="w-2.5 h-2.5" /> {city}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== Recommended Tools Grid ===== */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">{dest.name}常用工具推荐</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          以下 {resolvedTools.length} 个工具最适合 {dest.name} 出海商家使用，支持 {dest.currency} 货币格式
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resolvedTools.map(tool => (
            <ToolCard key={tool.key} tool={tool} />
          ))}
        </div>
      </div>

      {/* ===== MODULE A: Social Proof Bar ===== */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border-y border-purple-100/50">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-base md:text-lg text-gray-700 leading-relaxed">
            已有 <span className="font-bold text-purple-700 text-lg md:text-xl">{dest.stats?.userCount || '—'}</span>{' '}
            跨境商家在本站使用 <span className="font-semibold">{dest.name}</span> 相关工具，
            累计生成 <span className="font-bold text-indigo-700 text-lg md:text-xl">{dest.stats?.docCount || '—'}</span> 份单据
          </p>
          <p className="text-xs text-gray-400 mt-2">数据实时更新，值得信赖</p>
        </div>
      </div>

      {/* ===== MODULE B: Guides & Encyclopedia (Accordion) ===== */}
      {dest.guides && dest.guides.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
            <h2 className="text-xl font-bold text-gray-900">{dest.name}出海百科与指南</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            {dest.guides.length} 篇实操指南与政策解读，助你合规出海
          </p>

          <div className="space-y-3">
            {dest.guides.map((guide, i) => (
              <details key={i} className="group bg-white rounded-xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <summary className="flex items-start gap-3 p-4 cursor-pointer list-none select-none hover:bg-gray-50/50 transition-colors min-h-[44px]">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    guide.type === 'customs' ? 'bg-purple-50 text-purple-600' :
                    guide.type === 'tax' ? 'bg-amber-50 text-amber-600' :
                    guide.type === 'logistics' ? 'bg-blue-50 text-blue-600' :
                    'bg-teal-50 text-teal-600'
                  }`}>
                    {guide.type === 'customs' ? '🏛️' : guide.type === 'tax' ? '💰' : guide.type === 'logistics' ? '🚢' : '📖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug">{guide.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{guide.description}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      guide.type === 'customs' ? 'bg-purple-50 text-purple-600' :
                      guide.type === 'tax' ? 'bg-amber-50 text-amber-600' :
                      guide.type === 'logistics' ? 'bg-blue-50 text-blue-600' :
                      'bg-teal-50 text-teal-600'
                    }`}>
                      {guide.type === 'customs' ? '报关' : guide.type === 'tax' ? '税务' : guide.type === 'logistics' ? '物流' : '指南'}
                    </span>
                    <svg className="w-4 h-4 text-gray-300 group-open:rotate-180 transition-transform flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </summary>
                <div className="px-4 pb-4 pt-0">
                  <div className="pl-11 pr-2 text-sm text-gray-600 leading-relaxed">
                    {guide.description}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* ===== MODULE C: Local Service Providers ===== */}
      {dest.services && dest.services.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 py-10 pb-16">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">{dest.name}当地服务商与资源</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            精选合规服务商，涵盖仓储、物流、报关、税务等核心环节
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dest.services.map((svc, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 hover:shadow-md hover:border-gray-200 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{svc.title}</h3>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-600 flex-shrink-0">
                        {svc.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{svc.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
