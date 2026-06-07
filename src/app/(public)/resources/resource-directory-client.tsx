'use client';

import { useState, useMemo } from 'react';
import { ExternalLink, Globe, Search, Sparkles, Tag } from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';

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

// 分类图标映射
const categoryIcons: Record<string, React.ReactNode> = {
  life: <Globe className="w-4 h-4" />,
  logistics: <Globe className="w-4 h-4" />,
  business: <Globe className="w-4 h-4" />,
  tools: <Globe className="w-4 h-4" />,
  templates: <Globe className="w-4 h-4" />,
  education: <Globe className="w-4 h-4" />,
};

const categoryLabels: Record<string, string> = {
  life: '海外生活',
  logistics: '跨境物流',
  business: '出海经营',
  tools: '实用工具',
  templates: '模板资源',
  education: '教育学习',
};

const categoryColors: Record<string, string> = {
  life: 'bg-blue-50 text-blue-600 border-blue-200',
  logistics: 'bg-orange-50 text-orange-600 border-orange-200',
  business: 'bg-green-50 text-green-600 border-green-200',
  tools: 'bg-purple-50 text-purple-600 border-purple-200',
  templates: 'bg-pink-50 text-pink-600 border-pink-200',
  education: 'bg-teal-50 text-teal-600 border-teal-200',
};

function ResourceCard({ resource }: { resource: Resource }) {
  const logoSrc = resource.iconUrl || resource.favicon || null;
  const initial = resource.name.charAt(0).toUpperCase();

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

      {/* 底部：分类 + 外链图标 */}
      <div className="mt-auto flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${categoryColors[resource.category] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
          {categoryLabels[resource.category] || resource.category}
        </span>
        <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-purple-500 transition-colors" />
      </div>
    </a>
  );
}

export default function ResourceDirectoryClient({ resources }: { resources: Resource[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  // 动态分类
  const dynamicCategories = useMemo(() => {
    const catMap = new Map<string, number>();
    for (const r of resources) {
      if (r.isAd) continue; // 广告不参与分类计数
      catMap.set(r.category, (catMap.get(r.category) || 0) + 1);
    }
    return Array.from(catMap.entries())
      .map(([id, count]) => ({
        id,
        label: categoryLabels[id] || id,
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

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumb />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-600" />
            网址导航大厅
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            精选 {resources.length} 个优质海外工具、平台与服务，助您畅行全球。
          </p>
        </div>

        {/* 搜索 */}
        <div className="mb-5 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索网址名称、描述或标签..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
          />
        </div>

        <div className="flex gap-6">
          {/* 左侧分类菜单 */}
          <aside className="hidden lg:block w-52 shrink-0">
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
                  <span className="text-xs text-gray-400">{resources.length - adResources.length}</span>
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

          {/* 移动端分类 Tab */}
          <div className="lg:hidden w-full">
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
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

          {/* 右侧内容区 */}
          <main className="flex-1 min-w-0">
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
                      className="group relative bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 hover:shadow-lg hover:border-amber-300 transition-all overflow-hidden"
                    >
                      {/* 广告背景装饰 */}
                      <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-200/30 rounded-full blur-xl" />

                      <div className="flex items-start gap-3 relative">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center overflow-hidden">
                          {r.iconUrl || r.favicon ? (
                            <img
                              src={r.iconUrl || r.favicon || ''}
                              alt={r.name}
                              className="w-6 h-6 object-contain"
                            />
                          ) : (
                            <span className="text-sm font-bold text-amber-600">{r.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">{r.name}</h3>
                            <span className="shrink-0 text-[10px] px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded font-bold">广告</span>
                          </div>
                          {r.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{r.description}</p>
                          )}
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
          </main>
        </div>
      </div>
    </div>
  );
}
