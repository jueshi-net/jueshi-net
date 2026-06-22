"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { AllCountryConfig, CompletenessTier } from "@/lib/all-countries";
import { Globe, Search, Filter } from "lucide-react";

interface CountriesIndexClientProps {
  countries: AllCountryConfig[];
}

const REGION_LABELS: Record<string, string> = {
  Asia: "亚洲",
  Europe: "欧洲",
  Americas: "美洲",
  Oceania: "大洋洲",
  Africa: "非洲",
  "Middle East": "中东",
};

const TIER_LABELS: Record<number, string> = {
  1: "完整页",
  2: "增强基础页",
  3: "基础页",
};

export default function CountriesIndexClient({ countries }: CountriesIndexClientProps) {
  const [query, setQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      // Search
      if (query) {
        const q = query.toLowerCase();
        if (
          !c.nameEn.toLowerCase().includes(q) &&
          !c.nameZh.includes(query) &&
          !c.countryCode.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      // Region filter
      if (regionFilter !== "all" && c.region !== regionFilter) return false;
      // Tier filter
      if (tierFilter !== "all" && c.completenessTier !== Number(tierFilter)) return false;
      return true;
    });
  }, [countries, query, regionFilter, tierFilter]);

  // Group by region for display
  const grouped = useMemo(() => {
    const map = new Map<string, AllCountryConfig[]>();
    for (const c of filtered) {
      const r = c.region || "Other";
      if (!map.has(r)) map.set(r, []);
      map.get(r)!.push(c);
    }
    return map;
  }, [filtered]);

  const featured = countries.filter((c) => c.completenessTier === 1);

  return (
    <div className="space-y-6">
      {/* Featured countries */}
      {featured.length > 0 && !query && regionFilter === "all" && tierFilter === "all" && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-600" />
            🌟 重点国家
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {featured.map((c) => (
              <Link
                key={c.slug}
                href={`/countries/${c.slug}`}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-teal-100 bg-teal-50/50 hover:bg-teal-50 hover:border-teal-300 transition-all text-center"
              >
                <span className="text-3xl">{c.flagEmoji}</span>
                <span className="text-sm font-medium text-gray-900">{c.nameZh}</span>
                <span className="text-xs text-gray-400">{c.countryCode}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Search & Filter */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索国家/地区..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
            />
          </div>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 min-w-[120px]"
          >
            <option value="all">全部地区</option>
            <option value="Asia">亚洲</option>
            <option value="Europe">欧洲</option>
            <option value="Americas">美洲</option>
            <option value="Oceania">大洋洲</option>
            <option value="Africa">非洲</option>
          </select>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 min-w-[120px]"
          >
            <option value="all">全部类型</option>
            <option value="1">完整页</option>
            <option value="2">增强基础页</option>
            <option value="3">基础页</option>
          </select>
        </div>

        {/* Result count */}
        <div className="text-sm text-gray-500">
          共 {filtered.length} 个国家/地区
        </div>
      </section>

      {/* Country list grouped by region */}
      <section className="space-y-6">
        {Array.from(grouped.entries()).map(([region, items]) => (
          <div key={region}>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4 text-teal-500" />
              {REGION_LABELS[region] || region}
              <span className="text-xs text-gray-400 font-normal">({items.length})</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {items
                .sort((a, b) => a.sortOrder - b.sortOrder || a.nameEn.localeCompare(b.nameEn))
                .map((c) => (
                  <Link
                    key={c.slug}
                    href={`/countries/${c.slug}`}
                    className="group flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 bg-white hover:shadow-sm hover:border-teal-200 transition-all"
                  >
                    <span className="text-xl flex-shrink-0">{c.flagEmoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate group-hover:text-teal-700 transition-colors">
                        {c.nameZh}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {c.nameEn} · {c.countryCode}
                      </div>
                    </div>
                    {c.completenessTier === 1 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded flex-shrink-0">完整</span>
                    )}
                    {c.completenessTier === 2 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded flex-shrink-0">增强</span>
                    )}
                  </Link>
                ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>未找到匹配的国家/地区</p>
          </div>
        )}
      </section>
    </div>
  );
}
