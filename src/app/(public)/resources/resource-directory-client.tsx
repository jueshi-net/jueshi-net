'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink, Globe, Search, Sparkles, Tag, Wrench, DollarSign, Hash, FileText, ListChecks, Truck, Briefcase, Home, GraduationCap, MapPin, Calculator, BookOpen, TrendingUp, Star, Eye } from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';
import { getCategoryInfo } from '@/lib/resources/category-config';
import FavoriteButton from '@/components/favorite-button';

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
    <div
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
            // eslint-disable-next-line @next/next/no-img-element
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
      <div className="mt-auto flex items-center justify-between mb-3">
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

      {/* 操作按钮区域 */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {/* 收藏按钮 */}
        <FavoriteButton
          resourceUrl={resource.url}
          title={resource.name}
          resourceType="url"
          size="sm"
        />

        {/* 网站介绍按钮 */}
        <Link
          href={`/resources/site/${resource.id}`}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 hover:border-purple-200 transition-colors min-h-[32px]"
          title="查看网站介绍"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">介绍</span>
        </Link>

        {/* 访问网站按钮 */}
        <a
          href={resource.url}
          target={resource.url.startsWith('http') ? '_blank' : undefined}
          rel={resource.url.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 transition-colors min-h-[32px] ml-auto"
          title="访问网站"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">访问</span>
        </a>
      </div>
    </div>
  );
}

// 广告位组件
function AdSlot({ position, size = 'banner' }: { position: string; size?: 'banner' | 'square' | 'sidebar' }) {
  const sizeClasses = {
    banner: 'h-24',
    square: 'h-64',
    sidebar: 'h-48',
  };

  return (
    <div className={`bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-200 rounded-xl ${sizeClasses[size]} flex flex-col items-center justify-center relative overflow-hidden`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]" />
      <Sparkles className="w-8 h-8 text-amber-400 mb-2 relative z-10" />
      <p className="text-sm font-medium text-amber-700 relative z-10">广告位预留</p>
      <p className="text-xs text-amber-600 mt-1 relative z-10">{position}</p>
      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-amber-200 text-amber-800 text-[10px] font-bold rounded uppercase">
        Ad
      </div>
    </div>
  );
}

// 右侧榜单组件
function RankingSidebar({ resources }: { resources: Resource[] }) {
  const topResources = resources
    .filter(r => !r.isAd)
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 10);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-20">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-amber-500" />
        <h3 className="text-base font-bold text-gray-900">热门榜单</h3>
      </div>
      
      <div className="space-y-3">
        {topResources.map((resource, index) => {
          const logoSrc = resource.iconUrl || resource.favicon || null;
          const initial = resource.name.charAt(0).toUpperCase();
          
          return (
            <Link
              key={resource.id}
              href={`/resources/site/${resource.id}`}
              className="flex items-center gap-3 group"
            >
              <div className={`shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                index === 0 ? 'bg-red-100 text-red-600' :
                index === 1 ? 'bg-orange-100 text-orange-600' :
                index === 2 ? 'bg-amber-100 text-amber-600' :
                'bg-gray-100 text-gray-500'
              }`}>
                {index + 1}
              </div>
              
              <div className="shrink-0 w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                {logoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoSrc} alt={resource.name} className="w-5 h-5 object-contain" />
                ) : (
                  <span className="text-xs font-bold text-gray-400">{initial}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                  {resource.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs text-gray-500">{resource.qualityScore}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 广告位 */}
      <div className="mt-6">
        <AdSlot position="榜单下方" size="sidebar" />
      </div>
    </div>
  );
}

// 左侧分类导航
function CategoryNav({ categories, activeCategory, onCategoryChange, resourceCounts }: {
  categories: { id: string; label: string; count: number }[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  resourceCounts: Record<string, number>;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-20">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-purple-600" />
        <h3 className="text-base font-bold text-gray-900">资源分类</h3>
      </div>
      
      <div className="space-y-1">
        <button
          onClick={() => onCategoryChange('all')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
            activeCategory === 'all'
              ? 'bg-purple-50 text-purple-700 font-semibold'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span>全部资源</span>
          <span className="text-xs text-gray-400">{Object.values(resourceCounts).reduce((a, b) => a + b, 0)}</span>
        </button>
        
        {categories.map((cat) => {
          const catInfo = getCategoryInfo(cat.id);
          const IconComponent = iconMap[catInfo.icon] || <Globe className="w-4 h-4" />;
          
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                activeCategory === cat.id
                  ? 'bg-purple-50 text-purple-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={categoryTextColors[cat.id] || 'text-gray-600'}>{IconComponent}</span>
                {cat.label}
              </span>
              <span className="text-xs text-gray-400">{cat.count}</span>
            </button>
          );
        })}
      </div>

      {/* 广告位 */}
      <div className="mt-6">
        <AdSlot position="分类下方" size="sidebar" />
      </div>
    </div>
  );
}

export default function ResourceDirectoryClient({ resources, featuredResources }: { resources: Resource[]; featuredResources: Resource[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [displayCount, setDisplayCount] = useState(30); // 初始显示 30 个
  const ITEMS_PER_PAGE = 30; // 每次加载 30 个

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

  // 分类资源计数
  const resourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of resources) {
      if (r.isAd) continue;
      counts[r.category] = (counts[r.category] || 0) + 1;
    }
    return counts;
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
  
  // 分页显示
  const displayedResources = normalResources.slice(0, displayCount);
  const hasMore = displayCount < normalResources.length;
  
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };
  
  // 切换分类或搜索时重置显示数量
  useEffect(() => {
    setDisplayCount(30);
  }, [activeCategory, search]);

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-gray-50/50 overflow-x-hidden">
      {/* Hero 搜索区 */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center justify-center gap-3">
              <Globe className="w-8 h-8 md:w-10 md:h-10" />
              网址导航大厅
            </h1>
            <p className="text-base md:text-lg text-white/90">
              精选 {resources.length} 个优质海外工具、平台与服务，助您畅行全球
            </p>
          </div>
          
          {/* 搜索框 */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索网址名称、描述或标签..."
              className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 border-0 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl transition-all"
            />
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb />

        {/* 精选推荐 */}
        {activeCategory === 'all' && !search.trim() && featuredResources.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">精选推荐</h2>
              <span className="text-xs text-gray-500 ml-auto">编辑精选 · 品质保证</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {featuredResources.slice(0, 6).map((r) => {
                const logoSrc = r.iconUrl || r.favicon || null;
                const initial = r.name.charAt(0).toUpperCase();
                return (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all text-center group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {logoSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoSrc} alt={r.name} className="w-7 h-7 object-contain" />
                      ) : (
                        <span className="text-sm font-bold text-purple-600">{initial}</span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-900 truncate w-full group-hover:text-purple-700 transition-colors">{r.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* 顶部广告位 */}
        <div className="mb-8">
          <AdSlot position="顶部横幅" size="banner" />
        </div>

        {/* 三栏布局 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧分类导航 */}
          <div className="hidden lg:block lg:w-64 shrink-0">
            <CategoryNav
              categories={dynamicCategories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              resourceCounts={resourceCounts}
            />
          </div>

          {/* 移动端分类 Tab */}
          <div className="lg:hidden mb-4">
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

          {/* 中间资源区 */}
          <div className="flex-1 min-w-0">
            {/* 广告资源 */}
            {adResources.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-600">赞助推荐</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {adResources.map((r) => (
                    <a
                      key={r.id}
                      href={r.url}
                      target={r.url.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="group relative bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 hover:shadow-lg hover:border-amber-300 transition-all overflow-hidden"
                    >
                      <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-200/30 rounded-full blur-xl" />
                      <div className="flex items-start gap-3 relative min-w-0">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center overflow-hidden">
                          {r.iconUrl || r.favicon ? (
                            // eslint-disable-next-line @next/next/no-img-element
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

            {/* 常规资源卡片 */}
            {displayedResources.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {displayedResources.map((r) => (
                    <ResourceCard key={r.id} resource={r} />
                  ))}
                </div>
                
                {/* 加载更多按钮 */}
                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all shadow-sm"
                    >
                      <span>加载更多</span>
                      <span className="text-xs text-gray-400">
                        （已显示 {displayedResources.length} / {normalResources.length}）
                      </span>
                    </button>
                  </div>
                )}
                
                {/* 已加载完毕提示 */}
                {!hasMore && normalResources.length > 30 && (
                  <div className="mt-8 text-center text-sm text-gray-400">
                    已显示全部 {normalResources.length} 个资源
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Search className="w-12 h-12 mb-3 text-gray-300" />
                <p className="text-lg font-medium text-gray-500 mb-1">未找到匹配的网址</p>
                <p className="text-sm">尝试更换关键词或切换分类</p>
              </div>
            )}

            {/* 中间广告位 */}
            {normalResources.length > 6 && (
              <div className="mt-8">
                <AdSlot position="资源列表中间" size="banner" />
              </div>
            )}
          </div>

          {/* 右侧榜单 */}
          <div className="hidden lg:block lg:w-72 shrink-0">
            <RankingSidebar resources={resources} />
          </div>
        </div>
      </div>
    </div>
  );
}
