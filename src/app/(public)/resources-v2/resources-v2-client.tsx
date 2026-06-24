"use client";

import { useState, useMemo } from "react";
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
}: {
  scenarios: Scenario[];
  countries: Country[];
  tools: Tool[];
  resources: ResourceItem[];
  officialResources: SimpleResource[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredResources = useMemo(() => {
    if (!searchQuery) return resources;
    const q = searchQuery.toLowerCase();
    return resources.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }, [searchQuery, resources]);

  const categories = useMemo(() => {
    const cats = new Set(resources.map((r) => r.category));
    return Array.from(cats);
  }, [resources]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
            placeholder="搜索资源、工具、指南..."
            className="w-full rounded-full border-0 px-5 py-3 text-sm text-gray-900 shadow-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            data-testid="resources-v2-search"
          />
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">选择你的任务场景</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
          {scenarios.map((s) => (
            <Link
              key={s.slug}
              href={`/resources-v2/scene/${s.slug}`}
              className={`flex flex-col items-start rounded-xl border p-4 transition-all ${s.color}`}
              data-testid={`scenario-card-${s.slug}`}
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="mt-2 font-medium text-gray-900">{s.title}</span>
              <span className="mt-1 text-xs text-gray-500">{s.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Countries */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">热门国家</h2>
        <div className="flex flex-wrap gap-2">
          {countries.map((c) => (
            <Link
              key={c.code}
              href={`/destinations/${c.code === "CA" ? "canada" : c.code === "US" ? "usa" : c.code === "AU" ? "australia" : c.code === "GB" ? "uk" : c.code === "JP" ? "japan" : "germany"}`}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50"
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
                data-testid={`official-resource-${r.id}`}
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

      {/* Recommended Resources */}
      {filteredResources.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">推荐资源</h2>
            {categories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                    !selectedCategory
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  全部
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(selectedCategory
              ? filteredResources.filter((r) => r.category === selectedCategory)
              : filteredResources
            ).map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-md"
                data-testid={`resource-card-${r.id}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 line-clamp-1">
                    {r.name}
                  </span>
                  <span
                    className={`ml-2 rounded px-1.5 py-0.5 text-xs ${
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
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Related Tools */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">相关工具推荐</h2>
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
        <p>资源导航 V2 — 跨境任务型导航原型 (staging)</p>
        <p className="mt-1">数据来源：平台资源库 + 工具系统 | 仅供参考</p>
      </div>
    </div>
  );
}
