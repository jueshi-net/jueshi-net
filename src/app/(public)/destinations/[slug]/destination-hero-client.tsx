'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowRight, MapPin, Sparkles, Globe } from 'lucide-react';
import type { DestinationHub } from '@/lib/destinations-config';
import { Breadcrumb } from '@/components/breadcrumb';

export default function DestinationHero({ dest }: { dest: DestinationHub }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Simple slugify: trim, lowercase, replace spaces/special chars with hyphens
    const slug = query
      .trim()
      .toLowerCase()
      .replace(/[\s\u3000]+/g, '-')
      .replace(/[^\w\u4e00-\u9fff-]/g, '');
    router.push(`/destinations/${slug}`);
  };

  return (
    <>
      {/* ===== HERO ===== */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-800 text-white relative overflow-hidden">
        {/* Background texture */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 pb-16 md:pt-12 md:pb-20">
          {/* Breadcrumb */}
          <Breadcrumb />

          {/* Country badge */}
          <div className="mt-6 flex flex-wrap items-center gap-3 mb-5">
            <span className="text-4xl">{dest.emoji}</span>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                <Globe className="w-3 h-3" /> {dest.region}
              </span>
            </div>
          </div>

          {/* Dynamic H1 */}
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            {dest.seo.heroTitle}
          </h1>

          <p className="text-lg md:text-xl text-indigo-100/90 max-w-2xl leading-relaxed mb-8">
            {dest.seo.heroSubtitle}
          </p>

          {/* ===== Smart Search Box ===== */}
          <form onSubmit={handleSearch} className="relative max-w-xl">
            <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden focus-within:border-white/40 focus-within:bg-white/15 transition-all shadow-lg">
              <div className="pl-5 text-indigo-200">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="搜索其他国家，如「日本」「美国」「英国」..."
                className="flex-1 px-4 py-4 bg-transparent text-white placeholder:text-indigo-200/60 text-sm md:text-base focus:outline-none min-h-[48px]"
              />
              <button
                type="submit"
                className="mr-2 px-5 py-2.5 bg-white text-purple-700 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center gap-1.5 min-h-[44px]"
              >
                <span className="hidden sm:inline">前往</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {/* Search hint */}
            <p className="mt-2 text-xs text-indigo-200/50 pl-1">
              输入国家/地区名称，快速跳转专属工具箱
            </p>
          </form>

          {/* Key cities */}
          {dest.keyCities.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="text-xs text-indigo-200/60 font-medium self-center mr-1">热门城市：</span>
              {dest.keyCities.map(city => (
                <span
                  key={city}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-xs text-indigo-100/80 border border-white/5 hover:bg-white/15 transition-colors cursor-default"
                >
                  <MapPin className="w-2.5 h-2.5" /> {city}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== Recommended Tools (placeholder for next phase) ===== */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">{dest.name}常用工具推荐</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          以下工具最适合 {dest.name} 出海商家使用，支持 {dest.currency} 货币格式
        </p>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
          <p>🔧 工具卡片模块 — 将在 Phase 2 接入 document-tools-config 动态渲染</p>
          <p className="text-xs mt-2">
            当前推荐: {dest.recommendedTools.map(t => `"${t}"`).join(', ')}
          </p>
        </div>
      </div>
    </>
  );
}
