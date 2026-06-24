"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

interface Scenario {
  slug: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
}

interface Country {
  code: string;
  name: string;
  flag: string;
}

interface Tool {
  name: string;
  route: string;
  icon: string;
}

interface ResourceItem {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  sourceType: string;
  usage: string;
  tags: string[];
}

interface SimpleResource {
  id: string;
  name: string;
  url: string;
  description: string;
}

export default function ResourcesV2Client({
  scenarios,
  countries,
  tools,
  resources,
  officialResources,
  error = false,
}: {
  scenarios: Scenario[];
  countries: Country[];
  tools: Tool[];
  resources: ResourceItem[];
  officialResources: SimpleResource[];
  error?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  // Brief loading indicator when filters change (debounced)
  useEffect(() => {
    if (searchQuery || selectedCategory || selectedCountry) {
      setIsFiltering(true);
      const timer = setTimeout(() => setIsFiltering(false), 250);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, selectedCategory, selectedCountry]);

  // Derive categories from actual data
  const categories = useMemo(() => {
    const cats = new Set(resources.map((r) => r.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [resources]);

  // Derive country/region options from actual data (using tags as proxy —
  // the Resource model has no dedicated `country` field, so tags serve as
  // the closest multi-value dimension for region/topic filtering).
  const countryOptions = useMemo(() => {
    const tagSet = new Set<string>();
    resources.forEach((r) => {
      (r.tags || []).forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [resources]);

  // Filter resources by search, category, and country (tag)
  const filteredResources = useMemo(() => {
    let result = resources;

    if (selectedCategory) {
      result = result.filter((r) => r.category === selectedCategory);
    }

    if (selectedCountry) {
      result = result.filter((r) => (r.tags || []).includes(selectedCountry));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          (r.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [searchQuery, selectedCategory, selectedCountry, resources]);

  // Stats computed from the full dataset (before filtering)
  const stats = useMemo(() => {
    const total = resources.length;
    const official = resources.filter(
      (r) => r.sourceType === "official"
    ).length;
    const countryCount = countryOptions.length;
    return { total, official, countryCount };
  }, [resources, countryOptions]);

  const hasActiveFilters = Boolean(
    searchQuery || selectedCategory || selectedCountry
  );

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedCountry(null);
  };

  // ── Error state ──────────────────────────────────────────────
  if (error) {
    return (
      <div
        data-testid="resources-v2-page"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="text-lg font-semibold text-red-800">
            数据加载失败
          </h2>
          <p className="mt-2 text-sm text-red-600">
            资源数据暂时无法加载，请稍后刷新页面重试。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="resources-v2-page"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-12 text-center shadow-lg sm:px-12">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          跨境任务型资源导航
        </h1>
        <p className="mt-2 text-blue-100">
          你需要完成什么任务？选择场景，找到资源和工具
        </p>
        <div className="mx-auto mt-6 max-w-xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索资源名称、描述、分类、标签..."
            className="w-full rounded-full border-0 px-5 py-3 text-sm text-gray-900 shadow-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            data-testid="resources-v2-search"
          />
        </div>
      </div>

      {/* Stats */}
      <div
        data-testid="resources-v2-stats"
        className="mt-6 grid grid-cols-3 gap-3"
      >
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.total}
          </div>
          <div className="mt-1 text-xs text-gray-500">资源总数</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">
            {stats.official}
          </div>
          <div className="mt-1 text-xs text-gray-500">官方资源</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {stats.countryCount}
          </div>
          <div className="mt-1 text-xs text-gray-500">标签/地区</div>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          选择你的任务场景
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
          {scenarios.map((s) => (
            <Link
              key={s.slug}
              href={`/resources-v2/scenarios/${s.slug}`}
              className={`flex flex-col items-start rounded-xl border p-4 transition-all ${s.color}`}
              data-testid="resources-v2-scenario-card"
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="mt-2 font-medium text-gray-900">
                {s.title}
              </span>
              <span className="mt-1 text-xs text-gray-500">{s.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Countries */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          热门国家
        </h2>
        <div className="flex flex-wrap gap-2">
          {countries.map((c) => (
            <Link
              key={c.code}
              href={`/destinations/${c.code === "CA" ? "canada" : c.code === "US" ? "usa" : c.code === "AU" ? "australia" : c.code === "GB" ? "uk" : c.code === "JP" ? "japan" : "germany"}`}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-300 hover:bg-blue-50"
              data-testid={`country-card-${c.code}`}
            >
              <span className="text-lg">{c.flag}</span>
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Official Resources */}
      {officialResources.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            🏛️ 官方资源专区
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {officialResources.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-amber-200 bg-amber-50 p-4 transition hover:border-amber-400 hover:bg-amber-100"
                data-testid="resources-v2-resource-card"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-amber-200 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                    官方
                  </span>
                  <span className="text-sm font-medium text-gray-900 line-clamp-1">
                    {r.name}
                  </span>
                </div>
                {r.description && (
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    {r.description}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Filters + Recommended Resources */}
      <div className="mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">推荐资源</h2>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div
              data-testid="resources-v2-category-filter"
              className="flex gap-2 overflow-x-auto"
            >
              <button
                onClick={() => setSelectedCategory(null)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ${
                  !selectedCategory
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                全部分类
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Country / Tag Filter */}
        {countryOptions.length > 0 && (
          <div
            data-testid="resources-v2-country-filter"
            className="mb-4 flex flex-wrap gap-2"
          >
            <button
              onClick={() => setSelectedCountry(null)}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${
                !selectedCountry
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-white text-gray-500 hover:border-emerald-200"
              }`}
            >
              全部标签
            </button>
            {countryOptions.slice(0, 20).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedCountry(tag)}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${
                  selectedCountry === tag
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-emerald-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Active filter clear bar */}
        {hasActiveFilters && (
          <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
            <span>
              筛选中：{searchQuery && `「${searchQuery}」`}
              {selectedCategory && ` 分类=${selectedCategory}`}
              {selectedCountry && ` 标签=${selectedCountry}`}
            </span>
            <button
              onClick={clearFilters}
              className="text-blue-500 underline hover:text-blue-700"
            >
              清除筛选
            </button>
          </div>
        )}

        {/* Loading state (brief, during filter transitions) */}
        {isFiltering ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-full rounded bg-gray-100" />
                <div className="mt-1 h-3 w-1/2 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : filteredResources.length > 0 ? (
          /* Resource grid */
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-md"
                data-testid="resources-v2-resource-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 line-clamp-1">
                    {r.name}
                  </span>
                  <span
                    className={`ml-2 shrink-0 rounded px-1.5 py-0.5 text-xs ${
                      r.sourceType === "official"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {r.sourceType === "official" ? "官方" : "第三方"}
                  </span>
                </div>
                {r.description && (
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    {r.description}
                  </p>
                )}
                {r.usage && (
                  <p className="mt-1 text-xs text-blue-500 line-clamp-1">
                    💡 {r.usage}
                  </p>
                )}
                {r.tags && r.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div
            data-testid="resources-v2-empty-state"
            className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center"
          >
            <div className="mb-3 text-4xl">🔍</div>
            <h3 className="text-sm font-semibold text-gray-700">
              {resources.length === 0
                ? "暂无资源数据"
                : "未找到匹配的资源"}
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              {resources.length === 0
                ? "资源库正在建设中，请稍后再来查看。"
                : "尝试调整搜索关键词或清除筛选条件。"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
              >
                清除所有筛选
              </button>
            )}
          </div>
        )}
      </div>

      {/* Related Tools */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          相关工具推荐
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tools.map((t) => (
            <Link
              key={t.route}
              href={t.route}
              className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center transition hover:border-blue-300 hover:shadow-md"
              data-testid={`tool-card-${t.route.split("/").pop()}`}
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="mt-2 text-xs font-medium text-gray-700">
                {t.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
        <p>资源导航 V2 — 跨境任务型导航 (staging)</p>
        <p className="mt-1">
          数据来源：平台资源库 + 工具系统 | 仅供参考
        </p>
      </div>
    </div>
  );
}
