'use client';

import { useState } from 'react';
import { Search, Truck, MapPin, Hash, Coins, MessageSquare, ArrowRight } from 'lucide-react';

const TABS = [
  { id: 'all', label: '综合检索', icon: Search, placeholder: '搜索工具、场景包、指南或任意关键词...', btn: '搜索' },
  { id: 'tracking', label: '包裹追踪', icon: Truck, placeholder: '输入快递单号，如：YT123456789...', btn: '查询' },
  { id: 'postal', label: '查邮编', icon: MapPin, placeholder: '输入国家/城市或邮编...', btn: '查询' },
  { id: 'hs', label: '查HS码', icon: Hash, placeholder: '输入商品名称或编码，如：8471...', btn: '查询' },
  { id: 'rate', label: '查汇率', icon: Coins, placeholder: '如：USD 转 CNY, EUR 转 JPY...', btn: '换算' },
  { id: 'community', label: '问社区', icon: MessageSquare, placeholder: '如：东南亚TikTok怎么开店？', btn: '发帖' },
];

export default function HeroSuperSearch() {
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');

  const tab = TABS.find(t => t.id === activeTab) || TABS[0];
  const Icon = tab.icon;

  const handleSearch = () => {
    if (!query.trim()) return;
    if (activeTab === 'community') {
      window.open(`https://bbs.jueshi.net/search?q=${encodeURIComponent(query)}`, '_blank');
    } else if (activeTab === 'all') {
      window.open(`https://www.google.com/search?q=site:jueshi.net+${encodeURIComponent(query)}`, '_blank');
    } else if (activeTab === 'tracking') {
      window.open(`/tracking?num=${encodeURIComponent(query)}`, '_self');
    } else if (activeTab === 'postal') {
      window.open(`/tools/postal-code?q=${encodeURIComponent(query)}`, '_self');
    } else if (activeTab === 'hs') {
      window.open(`/tools/hs-code?q=${encodeURIComponent(query)}`, '_self');
    } else if (activeTab === 'rate') {
      window.open(`/tools/exchange-rate?q=${encodeURIComponent(query)}`, '_self');
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 pt-8 sm:pt-12 pb-8">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full bg-blue-200/15 blur-3xl" />

      <div className="relative">
        {/* Badge */}
        <div className="mb-4 flex justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" />
            持续更新中 · 每日新增工具与资源
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-2 text-center text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
          海外百宝箱
          <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent"> · </span>
          瑞士军刀式工具箱
        </h1>
        <p className="mb-8 text-center text-base text-gray-500 dark:text-gray-400">
          留学生 · 跨境卖家 · 出海务工 · 海外生活
        </p>

        {/* Tabs */}
        <div className="mb-4 flex flex-wrap justify-center gap-1.5">
          {TABS.map(t => {
            const TIcon = t.icon;
            const isActive = t.id === activeTab;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[40px] ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-500/25'
                    : 'bg-white text-gray-600 shadow-sm border border-gray-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200'
                }`}
              >
                <TIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/40 dark:shadow-gray-900/50 border border-gray-200/80 dark:border-gray-700 p-1.5 transition-shadow focus-within:shadow-2xl focus-within:shadow-teal-500/10 focus-within:border-teal-300">
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${activeTab === 'all' ? 'text-teal-600' : 'text-gray-400'}`} />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={tab.placeholder}
                className="w-full pl-12 pr-4 py-3 bg-transparent rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-base"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!query.trim()}
              className="flex items-center gap-1.5 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white rounded-xl font-semibold transition-all shadow-md shadow-teal-500/20 min-w-[100px] disabled:shadow-none"
            >
              {tab.btn}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Links & Ads */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-gray-400">热门：</span>
          {[
            { label: '邮编查询', href: '/tools/postal-code' },
            { label: 'HS编码', href: '/tools/hs-code' },
            { label: '商业发票', href: '/tools/commercial-invoice' },
            { label: '实时汇率', href: '/tools/exchange-rate' },
          ].map(item => (
            <a key={item.label} href={item.href} className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700">
              {item.label}
            </a>
          ))}
          <span className="mx-1 h-4 w-px bg-gray-200" />
          {[
            { label: '跨境物流专线 8折起', href: '#' },
            { label: 'TikTok 小店代运营', href: '#' },
          ].map(ad => (
            <a key={ad.label} href={ad.href} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100">
              <span className="text-[10px]">📢</span> {ad.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
