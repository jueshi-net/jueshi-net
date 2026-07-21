'use client';

import { useState, useTransition, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Globe,
  TrendingUp,
  Clock,
  Flame,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Loader2,
  Sparkles,
  Megaphone,
  ArrowRight,
} from 'lucide-react';
import { getCategoryInfo } from '@/lib/resources/category-config';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceCompactCard } from '@/components/resources/ResourceCompactCard';
import { ResourceRankingItem } from '@/components/resources/ResourceRankingItem';
import { ResourceCategoryNav } from '@/components/resources/ResourceCategoryNav';
import { ResourceSearchBar } from '@/components/resources/ResourceSearchBar';
import { ResourcePortalSection } from '@/components/resources/ResourcePortalSection';
import ResourceLogo from '@/components/resources/ResourceLogo';
import type { ResourceItem, CategoryCount, SortOption } from '@/components/resources/types';
import { getCategoryTextClass } from '@/components/resources/types';

interface Props {
  resources: ResourceItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  category: string;
  q: string;
  sort: SortOption;
  categoryCounts: CategoryCount[];
  totalResourceCount: number;
  hotResources: ResourceItem[];
  latestResources: ResourceItem[];
  featuredResources: ResourceItem[];
  adResources: ResourceItem[];
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: '综合排序' },
  { value: 'quality', label: '质量评分' },
  { value: 'latest', label: '最新收录' },
  { value: 'name', label: '名称排序' },
];

/** Build a /resources URL from filter state, omitting default values. */
function buildSearchUrl(opts: {
  category?: string;
  q?: string;
  sort?: string;
  page?: number;
}): string {
  const sp = new URLSearchParams();
  if (opts.category && opts.category !== 'all') sp.set('category', opts.category);
  if (opts.q && opts.q.trim()) sp.set('q', opts.q.trim());
  if (opts.sort && opts.sort !== 'default') sp.set('sort', opts.sort);
  if (opts.page && opts.page > 1) sp.set('page', String(opts.page));
  const qs = sp.toString();
  return qs ? `/resources?${qs}` : '/resources';
}

/** Generate compact page-number list with ellipsis. */
function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

// ── Small inline helpers ──────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-card animate-pulse">
      <div className="flex items-start gap-4 mb-3">
        <div className="w-14 h-14 rounded-xl bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded mb-2" />
      <div className="h-3 bg-gray-100 rounded w-4/5 mb-4" />
      <div className="flex gap-2 pt-3 border-t border-border-light">
        <div className="h-8 bg-gray-100 rounded w-16" />
        <div className="h-8 bg-gray-100 rounded w-16" />
      </div>
    </div>
  );
}

function AdBanner({ resources }: { resources: ResourceItem[] }) {
  if (resources.length === 0) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Megaphone className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-400 font-medium">推广资源</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {resources.map((r) => (
          <a
            key={r.id}
            href={r.url}
            target={r.url.startsWith('http') ? '_blank' : undefined}
            rel={r.url.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="group flex items-center gap-3 bg-white rounded-lg border border-border p-3 hover:shadow-card-hover transition-all"
          >
            <ResourceLogo src={r.iconUrl || r.favicon || null} name={r.name} size="sm" />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-title group-hover:text-brand truncate block transition-colors">
                {r.name}
              </span>
              {r.description && (
                <span className="text-xs text-subtitle truncate block">{r.description}</span>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand transition-colors shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────

export default function ResourceDirectoryClient(props: Props) {
  const {
    resources,
    totalCount,
    page,
    pageSize,
    category,
    q,
    sort,
    categoryCounts,
    totalResourceCount,
    hotResources,
    latestResources,
    featuredResources,
    adResources,
  } = props;

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const resultsRef = useRef<HTMLDivElement>(null);
  const prevPageRef = useRef(page);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const showFeatured = page === 1 && category === 'all' && !q && sort === 'default';

  // Scroll to results top when page changes (not on search/sort).
  useEffect(() => {
    if (prevPageRef.current !== page) {
      prevPageRef.current = page;
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [page]);

  const navigate = useCallback(
    (url: string) => {
      startTransition(() => {
        router.push(url);
      });
    },
    [router],
  );

  const handleSearch = useCallback(
    (value: string) => {
      navigate(buildSearchUrl({ category, q: value, sort, page: 1 }));
    },
    [navigate, category, sort],
  );

  const handleSortChange = useCallback(
    (value: SortOption) => {
      navigate(buildSearchUrl({ category, q, sort: value, page: 1 }));
    },
    [navigate, category, q],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      navigate(buildSearchUrl({ category, q, sort, page: newPage }));
    },
    [navigate, category, q, sort],
  );

  const pageNumbers = getPageNumbers(page, totalPages);
  const sortedCategories = [...categoryCounts].sort((a, b) => b.count - a.count);

  // Active category label for breadcrumb-ish context.
  const activeCatInfo = category !== 'all' ? getCategoryInfo(category) : null;

  return (
    <div className="min-h-screen bg-bg">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="bg-brand text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2.5">
              <Globe className="w-7 h-7" />
              资源中心
            </h1>
            <p className="text-sm text-white/70">
              精选 {totalResourceCount} 个优质出海资源 · 涵盖建站工具、收款服务、营销推广等
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl">
            <ResourceSearchBar initialValue={q} onSearch={handleSearch} variant="hero" />
          </div>

          {/* Quick category tags (horizontal scroll) */}
          <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-none pb-1">
            <Link
              href="/resources"
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === 'all'
                  ? 'bg-white text-brand'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              全部
            </Link>
            {sortedCategories.map((cat) => {
              const info = getCategoryInfo(cat.id);
              return (
                <Link
                  key={cat.id}
                  href={`/resources?category=${cat.id}`}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    category === cat.id
                      ? 'bg-white text-brand'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {info.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Left sidebar (desktop) */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-6">
              <ResourceCategoryNav
                categories={categoryCounts}
                activeCategory={category}
                totalCount={totalResourceCount}
              />
            </div>
          </div>

          {/* Center column */}
          <div className="flex-1 min-w-0">
            {/* Mobile category tabs */}
            <div className="lg:hidden mb-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
                <Link
                  href="/resources"
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    category === 'all'
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white text-gray-600 border-border hover:border-brand/30'
                  }`}
                >
                  全部
                </Link>
                {sortedCategories.map((cat) => {
                  const info = getCategoryInfo(cat.id);
                  return (
                    <Link
                      key={cat.id}
                      href={`/resources?category=${cat.id}`}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        category === cat.id
                          ? 'bg-brand text-white border-brand'
                          : 'bg-white text-gray-600 border-border hover:border-brand/30'
                      }`}
                    >
                      {info.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Sort toolbar */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="text-sm text-subtitle">
                {q ? (
                  <span>
                    搜索 <span className="text-title font-medium">「{q}」</span> · 找到{' '}
                    <span className="text-title font-medium">{totalCount}</span> 个结果
                  </span>
                ) : activeCatInfo ? (
                  <span>
                    <span className={getCategoryTextClass(category)}>{activeCatInfo.label}</span> · 共{' '}
                    <span className="text-title font-medium">{totalCount}</span> 个资源
                  </span>
                ) : (
                  <span>
                    共 <span className="text-title font-medium">{totalCount}</span> 个资源
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 hidden sm:inline">排序</span>
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="text-sm bg-white border border-border rounded-lg px-3 py-1.5 text-title focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Featured section — only on first page with no filters */}
            {showFeatured && featuredResources.length > 0 && (
              <ResourcePortalSection
                title="精选推荐"
                icon={<Sparkles className="w-4 h-4 text-amber-500" />}
                className="mb-6"
                bodyClassName="p-4"
                action={
                  <span className="text-xs text-gray-400">
                    {featuredResources.length} 个精选
                  </span>
                }
              >
                <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
                  {featuredResources.map((r) => (
                    <Link
                      key={r.id}
                      href={`/resources/site/${r.id}`}
                      className="group shrink-0 w-44 bg-gray-50 rounded-lg border border-border-light p-3 hover:border-brand/30 hover:shadow-card transition-all"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <ResourceLogo
                          src={r.iconUrl || r.favicon || null}
                          name={r.name}
                          size="xs"
                        />
                        <span className="text-sm font-medium text-title group-hover:text-brand truncate transition-colors">
                          {r.name}
                        </span>
                      </div>
                      {r.description && (
                        <p className="text-xs text-subtitle line-clamp-2 leading-relaxed">
                          {r.description}
                        </p>
                      )}
                      {r.qualityScore > 0 && (
                        <div className="mt-2 inline-flex items-center gap-1 text-xs text-amber-600">
                          <TrendingUp className="w-3 h-3" />
                          {r.qualityScore}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </ResourcePortalSection>
            )}

            {/* Ad banner — only on first page with no filters */}
            {showFeatured && <AdBanner resources={adResources} />}

            {/* Results grid / loading / empty */}
            <div ref={resultsRef} className="relative">
              {isPending && (
                <div className="absolute inset-0 z-20 flex items-start justify-center pt-32 bg-bg/50 backdrop-blur-[1px] rounded-xl">
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg shadow-card-hover border border-border">
                    <Loader2 className="w-4 h-4 animate-spin text-brand" />
                    <span className="text-sm text-subtitle">加载中…</span>
                  </div>
                </div>
              )}

              {!isPending && resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-base font-medium text-title mb-1">未找到匹配的资源</p>
                  <p className="text-sm text-subtitle mb-4">
                    尝试更换关键词或切换分类
                  </p>
                  <Link
                    href="/resources"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
                  >
                    查看全部资源
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : isPending && resources.length === 0 ? (
                // Initial load (no previous results to show)
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <>
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${
                      isPending ? 'opacity-50' : 'opacity-100'
                    }`}
                  >
                    {resources.map((r) => (
                      <ResourceCard key={r.id} resource={r} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1 || isPending}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-white border border-border text-gray-600 hover:border-brand/30 hover:text-brand disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">上一页</span>
                      </button>

                      {pageNumbers.map((pn, idx) =>
                        pn === 'ellipsis' ? (
                          <span
                            key={`e-${idx}`}
                            className="px-2 text-sm text-gray-400 select-none"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={pn}
                            onClick={() => handlePageChange(pn)}
                            disabled={isPending}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 ${
                              pn === page
                                ? 'bg-brand text-white'
                                : 'bg-white border border-border text-gray-600 hover:border-brand/30 hover:text-brand'
                            }`}
                          >
                            {pn}
                          </button>
                        ),
                      )}

                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages || isPending}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-white border border-border text-gray-600 hover:border-brand/30 hover:text-brand disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="hidden sm:inline">下一页</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Page info */}
                  {totalPages > 1 && (
                    <div className="mt-4 text-center text-xs text-gray-400">
                      第 {page} / {totalPages} 页 · 共 {totalCount} 个资源
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right sidebar (desktop) */}
          <div className="hidden xl:block w-64 shrink-0">
            <div className="sticky top-6 space-y-5">
              {/* Hot rankings */}
              <ResourcePortalSection
                title="热门榜单"
                icon={<Flame className="w-4 h-4 text-orange-500" />}
                bodyClassName="p-3"
              >
                <div className="space-y-0.5">
                  {hotResources.map((r, i) => (
                    <ResourceRankingItem key={r.id} resource={r} rank={i + 1} />
                  ))}
                </div>
              </ResourcePortalSection>

              {/* Latest additions */}
              <ResourcePortalSection
                title="最新收录"
                icon={<Clock className="w-4 h-4 text-blue-500" />}
                bodyClassName="p-3"
              >
                <div className="space-y-0.5">
                  {latestResources.map((r) => (
                    <ResourceCompactCard key={r.id} resource={r} />
                  ))}
                </div>
              </ResourcePortalSection>

              {/* Sidebar ad placeholder */}
              <div className="bg-gray-50 border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[120px]">
                <Megaphone className="w-5 h-5 text-gray-300 mb-2" />
                <p className="text-xs text-gray-400">广告位 · 侧边栏</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
