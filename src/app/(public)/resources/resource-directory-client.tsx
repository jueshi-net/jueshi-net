'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink, Globe, Search, Sparkles, Tag, Wrench, DollarSign, Hash, FileText, ListChecks, Truck, Briefcase, Home, GraduationCap, MapPin, Calculator, BookOpen, TrendingUp, Star, Eye, Clock, ArrowRight } from 'lucide-react';
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

// Compact resource card for horizontal sections
function CompactResourceCard({ resource }: { resource: Resource }) {
  const logoSrc = resource.iconUrl || resource.favicon || null;
  const initial = resource.name.charAt(0).toUpperCase();

  return (
    <div className="group relative bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md hover:border-purple-200 transition-all duration-200 flex-shrink-0 w-56">
      <div className="flex items-start gap-2.5">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center overflow-hidden group-hover:from-purple-50 group-hover:to-purple-100 group-hover:border-purple-200 transition-all">
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt={resource.name} className="w-6 h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-sm font-bold text-gray-400">${initial}</span>`; }} />
          ) : (
            <span className="text-sm font-bold text-gray-400">{initial}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 truncate transition-colors">{resource.name}</h3>
          {resource.description && <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{resource.description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-50">
        <FavoriteButton resourceUrl={resource.url} title={resource.name} resourceType="url" size="sm" />
        <Link href={`/resources/site/${resource.id}`} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors" title="查看网站介绍">
          <BookOpen className="w-3 h-3" />
          <span className="hidden sm:inline">介绍</span>
        </Link>
        <a href={resource.url} target={resource.url.startsWith('http') ? '_blank' : undefined} rel={resource.url.startsWith('http') ? 'noopener noreferrer' : undefined} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors ml-auto" title="访问网站">
          <ExternalLink className="w-3 h-3" />
          <span className="hidden sm:inline">访问</span>
        </a>
      </div>
    </div>
  );
}

// Full resource card for grid sections
function ResourceCard({ resource }: { resource: Resource }) {
  const logoSrc = resource.iconUrl || resource.favicon || null;
  const initial = resource.name.charAt(0).toUpperCase();
  const catInfo = getCategoryInfo(resource.category);

  return (
    <div className="group relative bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-purple-200 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-11 h-11 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center overflow-hidden group-hover:from-purple-50 group-hover:to-purple-100 group-hover:border-purple-200 transition-all">
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt={resource.name} className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-sm font-bold text-gray-400">${initial}</span>`; }} />
          ) : (
            <span className="text-sm font-bold text-gray-400">{initial}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 truncate transition-colors">{resource.name}</h3>
          {resource.description && <p className="text-xs text-gray-400 line-clamp-2 mt-1">{resource.description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
        <FavoriteButton resourceUrl={resource.url} title={resource.name} resourceType="url" size="sm" />
        <Link href={`/resources/site/${resource.id}`} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors" title="查看网站介绍">
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">介绍</span>
        </Link>
        <a href={resource.url} target={resource.url.startsWith('http') ? '_blank' : undefined} rel={resource.url.startsWith('http') ? 'noopener noreferrer' : undefined} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors ml-auto" title="访问网站">
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">访问</span>
        </a>
      </div>
    </div>
  );
}

// Subtle ad slot that blends with content
function SubtleAdSlot({ position }: { position: string }) {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/60 rounded-xl p-4 flex items-center justify-center relative overflow-hidden">
      <div className="text-center">
        <p className="text-xs text-gray-400">广告位 · {position}</p>
      </div>
      <div className="absolute top-1 right-2 text-[9px] text-gray-300 font-medium">AD</div>
    </div>
  );
}

// Category section component
function CategorySection({ category, resources, onViewAll }: { category: string; resources: Resource[]; onViewAll: () => void }) {
  const catInfo = getCategoryInfo(category);
  const IconComponent = iconMap[catInfo.icon] || <Globe className="w-5 h-5" />;

  if (resources.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${categoryBgColors[category] || 'bg-gray-100'} flex items-center justify-center`}>
            <span className={categoryTextColors[category] || 'text-gray-600'}>{IconComponent}</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900">{catInfo.label}</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{resources.length} 个资源</span>
        </div>
        <button onClick={onViewAll} className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
          查看全部 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Horizontal scrolling cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {resources.slice(0, 8).map((r) => (
          <CompactResourceCard key={r.id} resource={r} />
        ))}
      </div>
    </section>
  );
}

// Right sidebar component
function RightSidebar({ resources, allTags }: { resources: Resource[]; allTags: string[] }) {
  const topResources = resources.filter(r => !r.isAd).sort((a, b) => b.qualityScore - a.qualityScore).slice(0, 8);
  const latestResources = resources.filter(r => !r.isAd).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const topTags = allTags.slice(0, 20);

  return (
    <aside className="space-y-6">
      {/* Hot Rankings */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-bold text-gray-900">热门榜单</h3>
        </div>
        <div className="space-y-2">
          {topResources.map((resource, index) => {
            const logoSrc = resource.iconUrl || resource.favicon || null;
            const initial = resource.name.charAt(0).toUpperCase();
            return (
              <Link key={resource.id} href={`/resources/site/${resource.id}`} className="flex items-center gap-2 group">
                <div className={`shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${index === 0 ? 'bg-red-100 text-red-600' : index === 1 ? 'bg-orange-100 text-orange-600' : index === 2 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                  {index + 1}
                </div>
                <div className="shrink-0 w-6 h-6 rounded bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                  {logoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoSrc} alt={resource.name} className="w-4 h-4 object-contain" />
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400">{initial}</span>
                  )}
                </div>
                <span className="flex-1 text-xs text-gray-700 truncate group-hover:text-purple-600 transition-colors">{resource.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Latest Additions */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold text-gray-900">最新收录</h3>
        </div>
        <div className="space-y-2">
          {latestResources.map((resource) => {
            const logoSrc = resource.iconUrl || resource.favicon || null;
            const initial = resource.name.charAt(0).toUpperCase();
            return (
              <Link key={resource.id} href={`/resources/site/${resource.id}`} className="flex items-center gap-2 group">
                <div className="shrink-0 w-6 h-6 rounded bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                  {logoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoSrc} alt={resource.name} className="w-4 h-4 object-contain" />
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400">{initial}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-700 truncate block group-hover:text-purple-600 transition-colors">{resource.name}</span>
                  <span className="text-[10px] text-gray-400">{new Date(resource.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tag Cloud */}
      {topTags.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-bold text-gray-900">热门标签</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topTags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md hover:bg-purple-50 hover:text-purple-600 transition-colors cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ad slot */}
      <SubtleAdSlot position="侧边栏" />
    </aside>
  );
}

export default function ResourceDirectoryClient({ resources, featuredResources }: { resources: Resource[]; featuredResources: Resource[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

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

  // All tags
  const allTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    for (const r of resources) {
      if (r.isAd || !r.tags) continue;
      for (const tag of r.tags) {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      }
    }
    return Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]).map(([tag]) => tag);
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

  // Hot resources (top quality score)
  const hotResources = useMemo(() => {
    return resources.filter(r => !r.isAd).sort((a, b) => b.qualityScore - a.qualityScore).slice(0, 12);
  }, [resources]);

  // Category sections (for default view)
  const categorySections = useMemo(() => {
    if (activeCategory !== 'all' || search.trim()) return [];
    const sections: { category: string; resources: Resource[] }[] = [];
    for (const cat of dynamicCategories.slice(0, 5)) {
      const catResources = resources.filter(r => !r.isAd && r.category === cat.id).sort((a, b) => b.qualityScore - a.qualityScore).slice(0, 8);
      if (catResources.length > 0) {
        sections.push({ category: cat.id, resources: catResources });
      }
    }
    return sections;
  }, [resources, dynamicCategories, activeCategory, search]);

  // Ad resources
  const adResources = resources.filter(r => r.isAd);

  const handleViewAllCategory = (category: string) => {
    setActiveCategory(category);
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 text-white">
        <div className="max-w-[1400px] mx-auto px-4 py-10">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <Globe className="w-7 h-7 md:w-8 md:h-8" />
              网址导航大厅
            </h1>
            <p className="text-sm md:text-base text-white/80">
              精选 {resources.length} 个优质海外工具、平台与服务，助您畅行全球
            </p>
          </div>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索网址名称、描述或标签..."
              className="w-full pl-12 pr-4 py-3 bg-white text-gray-900 border-0 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <Breadcrumb />

        {/* Mobile Category Tabs */}
        <div className="lg:hidden mb-4 -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setActiveCategory('all')} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === 'all' ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              全部
            </button>
            {dynamicCategories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Recommendations (horizontal scroll) */}
        {activeCategory === 'all' && !search.trim() && featuredResources.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h2 className="text-base font-bold text-gray-900">精选推荐</h2>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {featuredResources.slice(0, 10).map((r) => (
                <CompactResourceCard key={r.id} resource={r} />
              ))}
            </div>
          </section>
        )}

        {/* Hot Resources (horizontal scroll) */}
        {activeCategory === 'all' && !search.trim() && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <h2 className="text-base font-bold text-gray-900">热门网址</h2>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {hotResources.map((r) => (
                <CompactResourceCard key={r.id} resource={r} />
              ))}
            </div>
          </section>
        )}

        {/* Subtle Ad */}
        {activeCategory === 'all' && !search.trim() && adResources.length > 0 && (
          <div className="mb-6">
            <SubtleAdSlot position="顶部横幅" />
          </div>
        )}

        {/* Two Column Layout: Main + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Category Sections (default view) */}
            {categorySections.length > 0 ? (
              <>
                {categorySections.map((section) => (
                  <CategorySection
                    key={section.category}
                    category={section.category}
                    resources={section.resources}
                    onViewAll={() => handleViewAllCategory(section.category)}
                  />
                ))}
                
                {/* More categories link */}
                {dynamicCategories.length > 5 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-2">还有 {dynamicCategories.length - 5} 个分类</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {dynamicCategories.slice(5).map((cat) => (
                        <button key={cat.id} onClick={() => handleViewAllCategory(cat.id)} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-purple-200 hover:text-purple-600 transition-colors">
                          {cat.label} ({cat.count})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Filtered view: Grid of cards */
              <>
                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filtered.slice(0, 30).map((r) => (
                      <ResourceCard key={r.id} resource={r} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Search className="w-10 h-10 mb-3 text-gray-300" />
                    <p className="text-base font-medium text-gray-500 mb-1">未找到匹配的网址</p>
                    <p className="text-sm">尝试更换关键词或切换分类</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:w-72 shrink-0">
            <RightSidebar resources={resources} allTags={allTags} />
          </div>
        </div>

        {/* Mobile Right Sidebar Content */}
        <div className="lg:hidden mt-6">
          <RightSidebar resources={resources} allTags={allTags} />
        </div>
      </div>
    </div>
  );
}
