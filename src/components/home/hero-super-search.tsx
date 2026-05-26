'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Truck, MapPin, Hash, Coins, MessageSquare, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TABS = [
  { id: 'all', label: '综合检索', icon: Search, placeholder: '搜索工具、场景包、指南...', btn: '搜索' },
  { id: 'tracking', label: '包裹追踪', icon: Truck, placeholder: '输入快递单号，如：YT123456789...', btn: '查询' },
  { id: 'postal', label: '查邮编', icon: MapPin, placeholder: '输入国家/城市或邮编...', btn: '查询' },
  { id: 'hs', label: '查HS码', icon: Hash, placeholder: '输入商品名称或编码...', btn: '查询' },
  { id: 'rate', label: '查汇率', icon: Coins, placeholder: '如：USD 转 CNY...', btn: '换算' },
  { id: 'community', label: '问社区', icon: MessageSquare, placeholder: '如：东南亚TikTok怎么开店？', btn: '发帖' },
];

// Typewriter placeholders
const TYPEWRITER_PLACEHOLDERS = [
  '搜"加拿大海关发票"...',
  '搜"英国留学生行李托运"...',
  '搜"实时汇率换算"...',
];

// Apple pill hot tags
const HOT_TAGS = [
  { label: '🧾 形式发票一键生成', href: '/tools/documents/proforma-invoice', status: 'ready' as const },
  { label: '📦 商业发票/装箱单', href: '/tools/documents/commercial-invoice', status: 'ready' as const },
  { label: '📮 唛头标签生成器', href: '/tools/documents/shipping-label', status: 'ready' as const },
  { label: '🎓 留学生专区', href: '/scenario/student', status: 'ready' as const },
  { label: '💱 实时汇率', href: '/tools/exchange-rate', status: 'ready' as const },
  { label: '🌐 全球邮编查询', href: '/tools/postal-code', status: 'ready' as const },
];

// Internal Site Directory for Autocomplete
const SITE_DIRECTORY = [
  { title: '形式发票', url: '/tools/documents/proforma-invoice', tags: ['invoice', 'proforma', 'pi'] },
  { title: '商业发票', url: '/tools/documents/commercial-invoice', tags: ['invoice', 'ci'] },
  { title: '装箱单', url: '/tools/documents/packing-list', tags: ['packing', 'pl'] },
  { title: '外贸销售合同', url: '/tools/documents/sales-contract', tags: ['contract'] },
  { title: '唛头标签生成', url: '/tools/documents/shipping-label', tags: ['label', 'shipping', 'mark'] },
  { title: '全球邮编查询', url: '/tools/postal-code', tags: ['postal', 'zip', 'code', '邮编'] },
  { title: '实时汇率换算', url: '/tools/exchange-rate', tags: ['rate', 'exchange', 'currency', '汇率'] },
  { title: 'HS编码查询', url: '/tools/hs-code', tags: ['hs', 'code', 'customs', '海关'] },
  { title: '体积/运费计算器', url: '/tools/shipping-calculator', tags: ['shipping', 'calculator', 'cbm'] },
  { title: '敏感货查询', url: '/tools/sensitive-goods', tags: ['sensitive', 'goods'] },
  { title: '地址格式化工具', url: '/tools/address-formatter', tags: ['address'] },
  { title: '快递追踪', url: '/tracking', tags: ['tracking'] },
  { title: 'AI翻译润色', url: '/ai-tools/translate-polish', tags: ['translate', 'ai'] },
  { title: 'AI文件摘要', url: '/ai-tools/document-summary', tags: ['summary', 'ai'] },
  { title: '留学生专区', url: '/scenario/student', tags: ['student', '留学'] },
  { title: '跨境商家专区', url: '/scenario/merchant', tags: ['merchant', '商家'] },
];

export default function HeroSuperSearch() {
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');
  const [twIndex, setTwIndex] = useState(0);
  const [twText, setTwText] = useState('');
  const [twDeleting, setTwDeleting] = useState(false);
  const [suggestions, setSuggestions] = useState<{ title: string; url: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Typewriter effect
  useEffect(() => {
    const current = TYPEWRITER_PLACEHOLDERS[twIndex];
    if (!twDeleting) {
      if (twText.length < current.length) {
        const timeout = setTimeout(() => setTwText(current.slice(0, twText.length + 1)), 80);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setTwDeleting(true), 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (twText.length > 0) {
        const timeout = setTimeout(() => setTwText(current.slice(0, twText.length - 1)), 40);
        return () => clearTimeout(timeout);
      } else {
        setTwDeleting(false);
        setTwIndex((prev) => (prev + 1) % TYPEWRITER_PLACEHOLDERS.length);
      }
    }
  }, [twText, twIndex, twDeleting]);

  // Search Logic with Autocomplete
  useEffect(() => {
    if (activeTab !== 'all' || !query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const lowerQ = query.toLowerCase();
    const filtered = SITE_DIRECTORY.filter(item => 
      item.title.toLowerCase().includes(lowerQ) || 
      item.tags.some(t => t.includes(lowerQ))
    );
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [query, activeTab]);

  const handleSelect = (url: string) => {
    setQuery('');
    setShowSuggestions(false);
    router.push(url);
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    if (activeTab === 'community') {
      window.open(`https://bbs.jueshi.net/search?q=${encodeURIComponent(query)}`, '_blank');
    } else if (activeTab === 'tracking') {
      window.open(`/tracking?track_no=${encodeURIComponent(query)}`, '_self');
    } else if (activeTab === 'postal') {
      window.open(`/tools/postal-code?q=${encodeURIComponent(query)}`, '_self');
    } else if (activeTab === 'hs') {
      window.open(`/tools/hs-code?q=${encodeURIComponent(query)}`, '_self');
    } else if (activeTab === 'rate') {
      window.open(`/tools/exchange-rate?q=${encodeURIComponent(query)}`, '_self');
    } else if (suggestions.length > 0) {
      // If there are exact matches, go to the first one
      handleSelect(suggestions[0].url);
    } else {
      // Fallback to tools directory or specific search pages if implemented later
      router.push(`/tools?q=${encodeURIComponent(query)}`);
    }
  };

  const tab = TABS.find(t => t.id === activeTab) || TABS[0];
  const Icon = tab.icon;

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 pt-8 sm:pt-12 pb-8" ref={wrapperRef}>
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

        {/* Title — 全域化定位 */}
        <h1 className="mb-2 text-center text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
          海外百宝箱
          <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent"> · </span>
          全域出国基础设施
        </h1>
        <p className="mb-8 text-center text-base text-gray-500 dark:text-gray-400">
          无论您是跨境商户、留学生还是数字游民，这里都有为您定制的出海解法
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

        {/* Search Box with Autocomplete */}
        <div className="relative">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/40 dark:shadow-gray-900/50 border border-gray-200/80 dark:border-gray-700 p-1.5 transition-shadow focus-within:shadow-2xl focus-within:shadow-teal-500/10 focus-within:border-teal-300">
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${activeTab === 'all' ? 'text-teal-600' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSearch();
                    if (e.key === 'Escape') setShowSuggestions(false);
                    if (e.key === 'ArrowDown' && showSuggestions) {
                      e.preventDefault();
                      // simple focus handling could go here
                    }
                  }}
                  onFocus={() => { if (suggestions.length > 0 && activeTab === 'all') setShowSuggestions(true); }}
                  placeholder={twText || tab.placeholder}
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

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 overflow-hidden">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.url)}
                  className="w-full px-4 py-2.5 text-left hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 group"
                >
                  <Search className="w-4 h-4 text-gray-400 group-hover:text-teal-500" />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{item.title}</span>
                  <ArrowRight className="w-3 h-3 ml-auto text-gray-300 group-hover:text-teal-500 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Apple Pill Hot Tags */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {HOT_TAGS.map(tag => (
            <a
              key={tag.label}
              href={tag.href}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer text-gray-600 dark:text-gray-300 bg-white/60 hover:bg-white dark:bg-gray-800/60 dark:hover:bg-gray-800 backdrop-blur-md hover:shadow-sm hover:-translate-y-0.5 border border-gray-200/60 dark:border-gray-700/60"
            >
              {tag.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
