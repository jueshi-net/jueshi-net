'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLink, Globe, Search, Sparkles, Tag, BookOpen, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { getCategoryInfo } from '@/lib/resources/category-config';
import FavoriteButton from '@/components/favorite-button';
import JueshiV4Header from '@/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Header';
import JueshiV4Footer from '@/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Footer';

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

// Large resource card for grid
function ResourceCard({ resource }: { resource: Resource }) {
  const logoSrc = resource.iconUrl || resource.favicon || null;
  const initial = resource.name.charAt(0).toUpperCase();
  const catInfo = getCategoryInfo(resource.category);

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-purple-300 transition-all duration-200">
      <div className="flex items-start gap-4 mb-4">
        <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden group-hover:from-purple-50 group-hover:to-purple-100 group-hover:border-purple-300 transition-all">
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt={resource.name} className="w-9 h-9 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-lg font-bold text-gray-400">${initial}</span>`; }} />
          ) : (
            <span className="text-lg font-bold text-gray-400">{initial}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-700 truncate transition-colors mb-1">{resource.name}</h3>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${categoryColors[resource.category] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
              {catInfo.label}
            </span>
            {resource.qualityScore > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                <TrendingUp className="w-3 h-3" />
                {resource.qualityScore}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {resource.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">{resource.description}</p>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <FavoriteButton resourceUrl={resource.url} title={resource.name} resourceType="url" size="sm" />
        <Link href={`/resources/site/${resource.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 hover:border-purple-200 transition-colors" title="查看网站介绍">
          <BookOpen className="w-4 h-4" />
          <span>介绍</span>
        </Link>
        <a href={resource.url} target={resource.url.startsWith('http') ? '_blank' : undefined} rel={resource.url.startsWith('http') ? 'noopener noreferrer' : undefined} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 transition-colors ml-auto" title="访问网站">
          <ExternalLink className="w-4 h-4" />
          <span>访问</span>
        </a>
      </div>
    </div>
  );
}

// Subtle ad slot
function SubtleAdSlot({ position }: { position: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-center relative">
      <p className="text-xs text-gray-400">广告位 · {position}</p>
      <div className="absolute top-1 right-2 text-[9px] text-gray-300 font-medium">AD</div>
    </div>
  );
}

// Left sidebar category navigation
function LeftSidebar({ categories, activeCategory, onCategoryChange, resourceCounts }: {
  categories: { id: string; label: string; count: number }[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  resourceCounts: Record<string, number>;
}) {
  return (
    <aside className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <Tag className="w-5 h-5 text-purple-600" />
        <h3 className="text-sm font-bold text-gray-900">资源分类</h3>
      </div>
      
      <nav className="space-y-1">
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
        
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
              activeCategory === cat.id
                ? 'bg-purple-50 text-purple-700 font-semibold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className={categoryTextColors[cat.id] || 'text-gray-600'}>{cat.label}</span>
            <span className="text-xs text-gray-400">{cat.count}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

// Right sidebar with rankings
function RightSidebar({ resources }: { resources: Resource[] }) {
  const topResources = resources.filter(r => !r.isAd).sort((a, b) => b.qualityScore - a.qualityScore).slice(0, 10);
  const latestResources = resources.filter(r => !r.isAd).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  return (
    <aside className="space-y-6">
      {/* Hot Rankings */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm font-bold text-gray-900">热门榜单</h3>
        </div>
        <div className="space-y-3">
          {topResources.map((resource, index) => {
            const logoSrc = resource.iconUrl || resource.favicon || null;
            const initial = resource.name.charAt(0).toUpperCase();
            return (
              <Link key={resource.id} href={`/resources/site/${resource.id}`} className="flex items-center gap-3 group">
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
                <span className="flex-1 text-sm text-gray-700 truncate group-hover:text-purple-600 transition-colors">{resource.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Latest Additions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <Clock className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-bold text-gray-900">最新收录</h3>
        </div>
        <div className="space-y-3">
          {latestResources.map((resource) => {
            const logoSrc = resource.iconUrl || resource.favicon || null;
            const initial = resource.name.charAt(0).toUpperCase();
            return (
              <Link key={resource.id} href={`/resources/site/${resource.id}`} className="flex items-center gap-3 group">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                  {logoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoSrc} alt={resource.name} className="w-5 h-5 object-contain" />
                  ) : (
                    <span className="text-xs font-bold text-gray-400">{initial}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-700 truncate block group-hover:text-purple-600 transition-colors">{resource.name}</span>
                  <span className="text-xs text-gray-400">{new Date(resource.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Ad slot */}
      <SubtleAdSlot position="侧边栏" />
    </aside>
  );
}

export default function ResourceDirectoryClient({ resources, featuredResources }: { resources: Resource[]; featuredResources: Resource[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [displayCount, setDisplayCount] = useState(20);
  const ITEMS_PER_PAGE = 20;

  // Dynamic categories
  const dynamicCategories = useMemo(() => {
    const catMap = new Map<string, number>();
    for (const r of resources) {
      if (r.isAd) continue;
      catMap.set(r.category, (catMap.get(r.category) || 0) + 1);
    }
    return Array.from(catMap.entries())
      .map(([id, count]) => ({ id, label: getCategoryInfo(id).label, count }))
      .sort((a, b) => b.count - a.count);
  }, [resources]);

  // Resource counts
  const resourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of resources) {
      if (r.isAd) continue;
      counts[r.category] = (counts[r.category] || 0) + 1;
    }
    return counts;
  }, [resources]);

  // Filter
  const filtered = useMemo(() => {
    let items = resources.filter(r => !r.isAd);
    if (activeCategory !== 'all') {
      items = items.filter((r) => r.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((r) => r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q) || r.url.toLowerCase().includes(q) || r.tags?.some((t) => t.toLowerCase().includes(q)));
    }
    return items;
  }, [resources, activeCategory, search]);

  // Hot resources (only one horizontal section)
  const hotResources = useMemo(() => {
    return resources.filter(r => !r.isAd).sort((a, b) => b.qualityScore - a.qualityScore).slice(0, 12);
  }, [resources]);

  // Reset display count when filter changes
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setDisplayCount(ITEMS_PER_PAGE);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setDisplayCount(ITEMS_PER_PAGE);
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };

  const displayedResources = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  return (
    <>
      <JueshiV4Header />
      <div className="min-h-screen bg-gray-50">
        {/* Compact Hero */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="max-w-[1480px] mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  网址导航
                </h1>
                <p className="text-sm text-white/80">精选 {resources.length} 个优质海外工具与服务</p>
              </div>
            </div>
            <div className="max-w-2xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="搜索网址名称、描述或标签..."
                className="w-full pl-12 pr-4 py-3 bg-white text-gray-900 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Main Content: Three Column Layout */}
        <div className="max-w-[1480px] mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Left Sidebar: Category Navigation */}
            <div className="hidden lg:block w-56 shrink-0">
              <LeftSidebar
                categories={dynamicCategories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                resourceCounts={resourceCounts}
              />
            </div>

            {/* Center: Main Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile Category Tabs */}
              <div className="lg:hidden mb-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button onClick={() => handleCategoryChange('all')} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${activeCategory === 'all' ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                    全部
                  </button>
                  {dynamicCategories.map((cat) => (
                    <button key={cat.id} onClick={() => handleCategoryChange(cat.id)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${activeCategory === cat.id ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hot Resources (only one horizontal section) */}
              {activeCategory === 'all' && !search.trim() && (
                <section className="mb-6 bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      <h2 className="text-base font-bold text-gray-900">热门网址</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {hotResources.slice(0, 8).map((r) => {
                      const logoSrc = r.iconUrl || r.favicon || null;
                      const initial = r.name.charAt(0).toUpperCase();
                      return (
                        <Link key={r.id} href={`/resources/site/${r.id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                          <div className="shrink-0 w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                            {logoSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={logoSrc} alt={r.name} className="w-5 h-5 object-contain" />
                            ) : (
                              <span className="text-xs font-bold text-gray-400">{initial}</span>
                            )}
                          </div>
                          <span className="flex-1 text-sm text-gray-700 truncate group-hover:text-purple-600">{r.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Ad slot */}
              {activeCategory === 'all' && !search.trim() && (
                <div className="mb-6">
                  <SubtleAdSlot position="顶部横幅" />
                </div>
              )}

              {/* Resource Grid */}
              {filtered.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedResources.map((r) => (
                      <ResourceCard key={r.id} resource={r} />
                    ))}
                  </div>

                  {/* Load more button */}
                  {hasMore && (
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={handleLoadMore}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors shadow-sm"
                      >
                        <span>加载更多</span>
                        <span className="text-xs text-gray-400">（已显示 {displayedResources.length} / {filtered.length}）</span>
                      </button>
                    </div>
                  )}

                  {/* All loaded indicator */}
                  {!hasMore && filtered.length > ITEMS_PER_PAGE && (
                    <div className="mt-8 text-center text-sm text-gray-400">
                      已显示全部 {filtered.length} 个资源
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Search className="w-12 h-12 mb-3 text-gray-300" />
                  <p className="text-base font-medium text-gray-500 mb-1">未找到匹配的网址</p>
                  <p className="text-sm">尝试更换关键词或切换分类</p>
                </div>
              )}
            </div>

            {/* Right Sidebar: Rankings */}
            <div className="hidden xl:block w-64 shrink-0">
              <RightSidebar resources={resources} />
            </div>
          </div>
        </div>
      </div>
      <JueshiV4Footer />
    </>
  );
}
