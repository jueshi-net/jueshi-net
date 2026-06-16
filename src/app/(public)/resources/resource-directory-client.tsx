'use client';

import { useState, useMemo } from 'react';
import { ExternalLink, Globe, Search, Sparkles, Tag, Wrench, DollarSign, Hash, FileText, ListChecks, Truck, Briefcase, Home, GraduationCap, MapPin, Calculator } from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';
import { CATEGORY_CONFIG, getCategoryInfo } from '@/lib/resources/category-config';

interface Resource {
  id: string;
  name: string;
  url: string;
  description: string | null;
  category: string;
  tags: string[];
  sourceType: string;
  isActive: boolean;
  favicon: string | null;
  iconUrl: string | null;
  isAd: boolean;
  qualityScore: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Icon mapping for dynamic rendering
const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe className="w-5 h-5" />,
  Wrench: <Wrench className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
  Hash: <Hash className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Truck: <Truck className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  MapPin: <MapPin className="w-5 h-5" />,
  Calculator: <Calculator className="w-5 h-5" />,
  ListChecks: <ListChecks className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  life: 'bg-blue-50 text-blue-600 border-blue-200',
  logistics: 'bg-orange-50 text-orange-600 border-orange-200',
  business: 'bg-green-50 text-green-600 border-green-200',
  tools: 'bg-purple-50 text-purple-600 border-purple-200',
  templates: 'bg-pink-50 text-pink-600 border-pink-200',
  education: 'bg-teal-50 text-teal-600 border-teal-200',
  official: 'bg-red-50 text-red-600 border-red-200',
  payment: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  ecommerce: 'bg-indigo-50 text-indigo-600 border-indigo-200',
};

const categoryBgColors: Record<string, string> = {
  life: 'bg-blue-100',
  logistics: 'bg-orange-100',
  business: 'bg-green-100',
  tools: 'bg-purple-100',
  templates: 'bg-pink-100',
  education: 'bg-teal-100',
  official: 'bg-red-100',
  payment: 'bg-emerald-100',
  ecommerce: 'bg-indigo-100',
};

const categoryTextColors: Record<string, string> = {
  life: 'text-blue-600',
  logistics: 'text-orange-600',
  business: 'text-green-600',
  tools: 'text-purple-600',
  templates: 'text-pink-600',
  education: 'text-teal-600',
  official: 'text-red-600',
  payment: 'text-emerald-600',
  ecommerce: 'text-indigo-600',
};

function ResourceCard({ resource }: { resource: Resource }) {
  const logoSrc = resource.iconUrl || resource.favicon || null;
  const initial = resource.name.charAt(0).toUpperCase();
  const catInfo = getCategoryInfo(resource.category);

  return (
    <a
      href={resource.url}
      target={resource.url.startsWith('http') ? '_blank' : undefined}
      rel={resource.url.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="group relative bg-white rounded-2xl border border-gray-100 p-4 shadow-sm shadow-gray-100/50 hover:shadow-lg hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      {/* 广告标签 */}
      {resource.isAd && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-200">
            <Sparkles className="w-3 h-3" />
            Sponsored
          </span>
        </div>
      )}

      {/* Logo + 名称 */}
      <div className="flex items-start gap-3 mb-3">
        <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center overflow-hidden group-hover:from-purple-50 group-hover:to-purple-100 group-hover:border-purple-200 transition-all">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={resource.name}
              className="w-7 h-7 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-sm font-bold text-gray-400">${initial}</span>`;
              }}
            />
          ) : (
            <span className="text-sm font-bold text-gray-400">{initial}</span>
          )}
        </div>

        <div className="min-w-0 flex-1 pr-16">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 truncate transition-colors">
            {resource.name}
          </h3>
          {/* 标签 */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {resource.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 描述 */}
      {resource.description && (
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">
          {resource.description}
        </p>
      )}

      {/* 底部：分类 + 外部网站标识 */}
      <div className="mt-auto flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${categoryColors[resource.category] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
          {catInfo.label}
        </span>
        {resource.url.startsWith('http') && (
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
            <ExternalLink className="w-3 h-3" />
            外部网站
          </span>
        )}
      </div>
    </a>
  );
}

// 提取内容区域为独立组件
function ContentArea({ adResources, normalResources }: { adResources: Resource[]; normalResources: Resource[] }) {
  return (
    <>
      {/* 广告横幅区域 */}
      {adResources.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-600">赞助推荐</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {adResources.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target={r.url.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="group relative bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 hover:shadow-lg hover:border-amber-300 transition-all overflow-hidden min-w-0"
              >
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-200/30 rounded-full blur-xl" />
                <div className="flex items-start gap-3 relative min-w-0">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center overflow-hidden">
                    {r.iconUrl || r.favicon ? (
                      <img src={r.iconUrl || r.favicon || ''} alt={r.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <span className="text-sm font-bold text-amber-600">{r.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{r.name}</h3>
                      <span className="shrink-0 text-[10px] px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded font-bold">广告</span>
                    </div>
                    {r.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{r.description}</p>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 常规卡片网格 */}
      {normalResources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {normalResources.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Search className="w-12 h-12 mb-3 text-gray-300" />
          <p className="text-lg font-medium text-gray-500 mb-1">未找到匹配的网址</p>
          <p className="text-sm">尝试更换关键词或切换分类</p>
        </div>
      )}
    </>
  );
}

// 分类说明 + 相关工具组件
function CategoryContext({ categoryKey, resourceCount }: { categoryKey: string; resourceCount: number }) {
  const catInfo = getCategoryInfo(categoryKey);
  const IconComponent = iconMap[catInfo.icon] || <Globe className="w-5 h-5" />;

  return (
    <div className="mb-5 bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm min-w-0">
      <div className="flex items-start gap-3 mb-3">
        <div className={`shrink-0 w-10 h-10 rounded-xl ${categoryBgColors[categoryKey] || 'bg-gray-100'} flex items-center justify-center`}>
          <span className={categoryTextColors[categoryKey] || 'text-gray-600'}>{IconComponent}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-gray-900">{catInfo.label}</h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{resourceCount} 个资源</span>
          </div>
          {catInfo.description && (
            <p className="text-sm text-gray-500 mt-1">{catInfo.description}</p>
          )}
        </div>
      </div>

      {/* 相关站内工具 */}
      {catInfo.relatedTools.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">相关站内工具</p>
          <div className="flex flex-wrap gap-2">
            {catInfo.relatedTools.map((tool) => {
              const toolIcon = iconMap[tool.icon] || <Wrench className="w-3.5 h-3.5" />;
              return (
                <a
                  key={tool.href}
                  href={tool.href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full hover:bg-purple-100 transition-colors"
                  title={tool.description}
                >
                  {toolIcon}
                  {tool.name}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// 页面顶部精选工具 — 数据来自 DB（sortOrder < 0）或 fallback
function FeaturedTools({ featuredResources }: { featuredResources: Resource[] }) {
  if (!featuredResources || featuredResources.length === 0) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-4 sm:p-5 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h2 className="text-base font-bold text-gray-900">精选推荐</h2>
        <span className="text-xs text-gray-400 ml-auto">编辑后台 sortOrder &lt; 0 可管理</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {featuredResources.map((r) => {
          const logoSrc = r.iconUrl || r.favicon || null;
          const initial = r.name.charAt(0).toUpperCase();
          return (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all text-center min-w-0 group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 overflow-hidden">
                {logoSrc ? (
                  <img src={logoSrc} alt={r.name} className="w-6 h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <span className="text-xs font-bold text-purple-600">{initial}</span>
                )}
              </div>
              <span className="text-xs font-medium text-gray-900 truncate w-full group-hover:text-purple-700 transition-colors">{r.name}</span>
              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                <ExternalLink className="w-2.5 h-2.5" />
                外部网站
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default function ResourceDirectoryClient({ resources, featuredResources }: { resources: Resource[]; featuredResources: Resource[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  // 动态分类（按资源数量排序）
  const dynamicCategories = useMemo(() => {
    const catMap = new Map<string, number>();
    for (const r of resources) {
      if (r.isAd) continue;
      catMap.set(r.category, (catMap.get(r.category) || 0) + 1);
    }
    return Array.from(catMap.entries())
      .map(([id, count]) => ({
        id,
        label: getCategoryInfo(id).label,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [resources]);

  // 过滤
  const filtered = useMemo(() => {
    let items = resources;
    if (activeCategory !== 'all') {
      items = items.filter((r) => r.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.url.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return items;
  }, [resources, activeCategory, search]);

  // 分离广告和常规
  const adResources = filtered.filter((r) => r.isAd);
  const normalResources = filtered.filter((r) => !r.isAd);

  // 当前分类的资源数量
  const currentCategoryCount = activeCategory === 'all' 
    ? resources.filter(r => !r.isAd).length 
    : resources.filter(r => r.category === activeCategory && !r.isAd).length;

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-gray-50/50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 py-6 min-w-0">
        <Breadcrumb />

        {/* Header */}
        <div className="mb-6 min-w-0">
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-600" />
            网址导航大厅
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            精选 {resources.length} 个优质海外工具、平台与服务，助您畅行全球。
          </p>
          <p className="text-xs text-gray-400 mt-2">
            以下均为外部网站链接，点击后将跳转至第三方平台。本站不提供这些网站的内容或服务，实际结果请以第三方平台为准。
          </p>
        </div>

        {/* 页面顶部精选工具 */}
        {activeCategory === 'all' && !search.trim() && <FeaturedTools featuredResources={featuredResources} />}

        {/* 搜索 */}
        <div className="mb-5 relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索网址名称、描述或标签..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all min-w-0"
          />
        </div>

        {/* 分类说明（选择分类后显示） */}
        {activeCategory !== 'all' && (
          <CategoryContext categoryKey={activeCategory} resourceCount={currentCategoryCount} />
        )}

        {/* 移动端分类 Tab */}
        <div className="lg:hidden mb-4 -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              全部
            </button>
            {dynamicCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 桌面端：左侧分类 + 右侧内容 */}
        <div className="hidden lg:flex gap-6">
          <aside className="w-52 shrink-0">
            <div className="sticky top-6 bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                分类筛选
              </div>
              <nav className="space-y-0.5">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    activeCategory === 'all'
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>全部网址</span>
                  <span className="text-xs text-gray-400">{resources.filter(r => !r.isAd).length}</span>
                </button>
                {dynamicCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      activeCategory === cat.id
                        ? 'bg-purple-50 text-purple-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-xs text-gray-400">{cat.count}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <ContentArea adResources={adResources} normalResources={normalResources} />
          </main>
        </div>

        {/* 移动端：全宽内容区 */}
        <div className="lg:hidden min-w-0">
          <ContentArea adResources={adResources} normalResources={normalResources} />
        </div>

        {/* 底部相关站内工具推荐（当选择分类时不重复显示） */}
        {activeCategory === 'all' && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm min-w-0">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-purple-600" />
              更多站内工具
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              除了外部网站，本站还提供以下免费工具，助您高效完成跨境业务：
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <a href="/tools/exchange-rate" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all min-w-0">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">汇率换算</h3>
                  <p className="text-xs text-gray-500">实时汇率查询与历史走势</p>
                </div>
              </a>
              <a href="/tools/hs-code" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Hash className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">HS Code 查询</h3>
                  <p className="text-xs text-gray-500">商品编码查询与归类辅助</p>
                </div>
              </a>
              <a href="/tools/postal-code" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all min-w-0">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Hash className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">全球邮编查询</h3>
                  <p className="text-xs text-gray-500">各国邮政编码与地址解析</p>
                </div>
              </a>
              <a href="/tools/commercial-invoice" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all min-w-0">
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-pink-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">商业发票</h3>
                  <p className="text-xs text-gray-500">生成国际贸易商业发票</p>
                </div>
              </a>
              <a href="/tools/quote-sheet" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all min-w-0">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-teal-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">报价单</h3>
                  <p className="text-xs text-gray-500">快速生成专业报价单</p>
                </div>
              </a>
              <a href="/checklists" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all min-w-0">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <ListChecks className="w-5 h-5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">跨境清单</h3>
                  <p className="text-xs text-gray-500">开店、发货、合规全流程清单</p>
                </div>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
