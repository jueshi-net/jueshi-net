'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Package, ExternalLink, ChevronDown, ChevronUp, Loader2, Copy, Check, Clock, Truck } from 'lucide-react';
import { RelatedGuidesSection } from '@/components/related-guides-section';
import { FAQSection } from '@/components/faq-section';
import { AdSlot } from '@/components/ad-slot';
import { Breadcrumb } from '@/components/breadcrumb';
import { RelatedChecklistSection } from '@/components/related-checklist-section';
import { inputStyles, cardStyles } from "@/lib/ui-styles";
import { trackEvent } from '@/lib/analytics';
import Link from 'next/link';

interface HSCodeItem {
  id: string;
  code: string;
  description: string; // nameCn
  descriptionEn: string | null; // nameEn
  category: string | null;
  taxRate: number | null;
  notes: string | null;
}

// Example products for quick search
const EXAMPLE_PRODUCTS = [
  { label: '保温杯', query: '保温杯' },
  { label: '棉T恤', query: '棉T恤' },
  { label: '手机壳', query: '手机壳' },
  { label: 'LED灯', query: 'LED灯' },
  { label: '陶瓷杯', query: '陶瓷杯' },
  { label: '双肩包', query: '双肩包' },
  { label: 'stainless steel bottle', query: 'stainless steel' },
  { label: 'phone case', query: 'phone case' },
];

const RECENT_QUERIES_KEY = 'hs-code-recent-queries';

interface RecentQuery {
  query: string;
  resultCount: number;
  timestamp: number;
}

export default function HSCodePage() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<HSCodeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);

  // Load recent queries
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_QUERIES_KEY);
      if (saved) setRecentQueries(JSON.parse(saved));
    } catch {}
  }, []);

  // Track Tool_View on mount
  useEffect(() => {
    trackEvent.custom('hs-code', 'view');
  }, []);

  const fetchCodes = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/tools/hs-code?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
        // Save to recent queries
        if (json.data.length > 0) {
          const entry: RecentQuery = { query: q, resultCount: json.data.length, timestamp: Date.now() };
          const updated = [entry, ...recentQueries.filter(r => r.query !== q)].slice(0, 5);
          setRecentQueries(updated);
          try { localStorage.setItem(RECENT_QUERIES_KEY, JSON.stringify(updated)); } catch {}
        }
        trackEvent.custom('hs-code', 'query');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [recentQueries]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCodes(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, fetchCodes]);

  // Auto-trigger from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) setSearch(q);
  }, []);

  const copyText = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
      trackEvent.custom('hs-code', 'copy_result');
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">全球海关HS编码查询引擎</h1>
          <p className="text-lg text-teal-100">辅助查询商品 HS 编码和报关分类信息，适合跨境电商、外贸和集运发货前参考</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        <div className="mb-4"><Breadcrumb /></div>
        
        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>免责声明：</strong>HS 编码结果仅供参考，最终以海关、报关行或官方归类结果为准。本工具提供全量海关数据检索，列出的编码为系统匹配结果，实际归类需结合商品材质、用途、加工工艺等综合判断。
          </p>
        </div>

        {/* Search */}
        <div className={cardStyles.base + " mb-6"}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              className={inputStyles + " pl-10 pr-10"} 
              placeholder="输入中文品名（如：保温杯）或 HS 编码前缀（如：8429）..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />}
          </div>
          <p className="text-xs text-gray-400 mt-2">共匹配 {results.length} 条海关数据</p>

          {/* Example products */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-gray-400">示例商品：</span>
            {EXAMPLE_PRODUCTS.map((p) => (
              <button
                key={p.query}
                onClick={() => { setSearch(p.query); trackEvent.custom('hs-code', 'click_example'); }}
                className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Recent queries */}
          {recentQueries.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-400">最近查询：</span>
              {recentQueries.map((rq, i) => (
                <button
                  key={i}
                  onClick={() => setSearch(rq.query)}
                  className="px-2.5 py-1 text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-md transition-colors"
                >
                  {rq.query} ({rq.resultCount})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-3">
          {results.map((item) => {
            const isExpanded = expandedId === item.code;
            return (
              <div key={item.code} className={`${cardStyles.base.replace("p-5", "")} overflow-hidden`}>
                <div className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                  onClick={() => setExpandedId(isExpanded ? null : item.code)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg">📦</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">{item.description}</p>
                      <p className="text-xs text-gray-400 truncate font-mono">{item.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {item.taxRate ? `税率 ${item.taxRate}%` : '税率待定'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t dark:border-gray-700 pt-4 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">英文申报名</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono text-blue-600 dark:text-blue-400 flex-1">{item.descriptionEn || '—'}</p>
                          {item.descriptionEn && (
                            <button
                              onClick={(e) => { e.stopPropagation(); copyText(item.descriptionEn!, `en-${item.code}`); }}
                              className="p-1 text-gray-400 hover:text-teal-600 rounded"
                              title="复制英文描述"
                            >
                              {copiedField === `en-${item.code}` ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">所属类别</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{item.category || '—'}</p>
                      </div>
                    </div>

                    {/* Copy HS Code button */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">HS编码：</span>
                      <span className="font-mono text-lg font-bold text-teal-600">{item.code}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); copyText(item.code, `code-${item.code}`); }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 rounded transition-colors"
                      >
                        {copiedField === `code-${item.code}` ? <><Check className="w-3 h-3" /> 已复制</> : <><Copy className="w-3 h-3" /> 复制编码</>}
                      </button>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">申报要素 / 监管条件</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 border dark:border-gray-600 font-mono text-xs whitespace-pre-wrap">{item.notes || '无特殊要求'}</p>
                    </div>

                    {/* Result explanation */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>💡 说明：</strong>此编码为系统根据关键词匹配的结果，可能包含多个相关编码。实际报关时请结合商品材质、用途、加工工艺等综合判断，或咨询专业报关行。
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs">
                      <a href={`https://www.customs.gov.cn`} target="_blank" rel="noopener noreferrer"
                        onClick={() => trackEvent.custom('hs-code', 'click_verify')}
                        className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700">
                        <ExternalLink className="w-3 h-3" /> 前往海关总署核验
                      </a>
                      <a href={`https://www.wcoomd.org/en/topics/nomenclature/hs-nomenclature/hs-nomenclature-2022-edition.aspx`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700">
                        <ExternalLink className="w-3 h-3" /> WCO 国际协调制度
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            {search ? (
              <>
                <p className="text-gray-500 mb-2">未找到匹配 &quot;{search}&quot; 的海关数据</p>
                <p className="text-sm text-gray-400">你可以试试：</p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {EXAMPLE_PRODUCTS.slice(0, 5).map(p => (
                    <button key={p.query} onClick={() => setSearch(p.query)}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-colors">
                      {p.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500">输入商品名称或 HS 编码前缀开始查询</p>
            )}
          </div>
        )}

        {/* Official Links */}
        <div className={cardStyles.base + " mt-8"}>
          <div className="p-4 border-b border-gray-100">
            <h2 className={cardStyles.header}>
              <ExternalLink className="w-4 h-4 text-green-600" />
              各国海关官方查询入口
            </h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="https://www.customs.gov.cn/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-green-50 rounded-lg text-sm text-gray-700 hover:text-green-700 transition-colors border border-gray-200">
              🇨🇳 中国海关总署
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
            <a href="https://hts.usitc.gov/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-green-50 rounded-lg text-sm text-gray-700 hover:text-green-700 transition-colors border border-gray-200">
              🇺🇸 美国 HTS 查询
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
            <a href="https://www.gov.uk/trade-tariff" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-green-50 rounded-lg text-sm text-gray-700 hover:text-green-700 transition-colors border border-gray-200">
              🇬🇧 英国 Trade Tariff
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
            <a href="https://www.wcoomd.org/en/topics/nomenclature/hs-nomenclature/hs-nomenclature-2022-edition.aspx" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-green-50 rounded-lg text-sm text-gray-700 hover:text-green-700 transition-colors border border-gray-200">
              🌐 WCO 国际协调制度
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
          </div>
        </div>
        
        {/* FAQ */}
        <FAQSection title="HS编码常见问题" items={[
          { question: "HS编码是什么？", answer: "HS编码（Harmonized System Code）是国际通用的商品分类编码体系，由世界海关组织（WCO）维护。前6位全球统一，各国可在此基础上扩展到8-10位。用于海关报关、关税计算、贸易统计等。" },
          { question: "为什么同一个商品可能有不同编码？", answer: "HS 编码前 6 位是全球统一的，但各国可以扩展至 8-10 位。同一商品在不同国家可能有不同的后几位编码。此外，商品如果有多重用途或材质，可能归入不同类别。" },
          { question: "HS编码可以直接用于报关吗？", answer: "HS编码是报关的必要信息之一，但报关还需要提供商品价值、数量、原产地、收发货人等信息。建议使用本工具查询的编码作为参考，最终归类请咨询专业报关行或海关。" },
          { question: "如何确定商品的正确HS编码？", answer: "确定HS编码需要综合考虑：商品材质、用途、加工工艺、包装方式等。本工具提供关键词匹配结果供参考，但最终归类应以海关或专业报关行的判断为准。如有疑问，可申请海关预归类。" },
          { question: "HS编码和关税有什么关系？", answer: "HS编码决定了商品适用的关税税率。不同编码对应不同的最惠国税率、暂定税率、协定税率等。正确归类可以避免多缴税或被处罚。" },
          { question: "查询结果不准确怎么办？", answer: "本工具基于关键词匹配，可能存在多个相关结果。建议：1) 尝试不同关键词；2) 使用编码前缀查询；3) 参考英文申报名；4) 最终咨询专业报关行确认。" },
        ]} />

        {/* Related Tools */}
        <div className={cardStyles.base + " mt-8"}>
          <div className="p-4 border-b border-gray-100">
            <h2 className={cardStyles.header}>
              <Truck className="w-4 h-4 text-blue-600" />
              下一步推荐工具
            </h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/tools/documents/commercial-invoice"
              onClick={() => trackEvent.custom('hs-code', 'click_related_commercial-invoice')}
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-teal-50 rounded-xl border border-gray-200 hover:border-teal-200 transition-all">
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">商业发票</p>
                <p className="text-xs text-gray-500">生成报关用商业发票</p>
              </div>
            </Link>
            <Link href="/tools/documents/quotation"
              onClick={() => trackEvent.custom('hs-code', 'click_related_quotation')}
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-teal-50 rounded-xl border border-gray-200 hover:border-teal-200 transition-all">
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">报价单</p>
                <p className="text-xs text-gray-500">快速生成外贸报价单</p>
              </div>
            </Link>
            <Link href="/tools/shipping-calculator"
              onClick={() => trackEvent.custom('hs-code', 'click_related_shipping-calculator')}
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-teal-50 rounded-xl border border-gray-200 hover:border-teal-200 transition-all">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">运费计算</p>
                <p className="text-xs text-gray-500">估算集运/快递费用</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Related Checklist */}
        <RelatedChecklistSection
          toolSlug="hs-code"
          sourcePath="hs-code"
        />

        <AdSlot placement="tool-hs-code-bottom" className="mb-4" />
      </div>
    </div>
  );
}
