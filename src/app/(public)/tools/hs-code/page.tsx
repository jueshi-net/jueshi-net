'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Package, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { RelatedGuidesSection } from '@/components/related-guides-section';
import { FAQSection } from '@/components/faq-section';
import { AdSlot } from '@/components/ad-slot';
import { Breadcrumb } from '@/components/breadcrumb';
import { inputStyles, cardStyles } from "@/lib/ui-styles";
import { trackEvent } from '@/lib/analytics';

interface HSCodeItem {
  id: string;
  code: string;
  description: string; // nameCn
  descriptionEn: string | null; // nameEn
  category: string | null;
  taxRate: number | null;
  notes: string | null;
}

export default function HSCodePage() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<HSCodeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">全球海关HS编码查询引擎</h1>
          <p className="text-lg text-teal-100">十万级海关大数据，支持中文品名模糊检索与编码前缀匹配</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        <div className="mb-4"><Breadcrumb /></div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            本工具提供全量海关数据检索。列出的编码为系统匹配结果，实际归类需结合商品材质、用途、加工工艺等综合判断。
          </p>
        </div>

        {/* Search */}
        <div className={cardStyles.base + " mb-6"}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              className={inputStyles + " pl-10 pr-10"} 
              placeholder="输入中文品名（如：挖掘机）或 HS 编码前缀（如：8429）..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />}
          </div>
          <p className="text-xs text-gray-400 mt-2">共匹配 {results.length} 条海关数据</p>
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
                        <p className="text-sm font-mono text-blue-600 dark:text-blue-400">{item.descriptionEn || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">所属类别</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{item.category || '—'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">申报要素 / 监管条件</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 border dark:border-gray-600 font-mono text-xs whitespace-pre-wrap">{item.notes || '无特殊要求'}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <a href={`https://www.customs.gov.cn`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700">
                        <ExternalLink className="w-3 h-3" /> 前往海关总署核验
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
            <p className="text-gray-500">请输入关键词开始查询</p>
          </div>
        )}
        
        {/* FAQ & Footer */}
        <FAQSection title="HS编码常见问题" items={[
          { question: "HS编码是什么？", answer: "HS编码（Harmonized System Code）是国际通用的商品分类编码体系..." },
          { question: "为什么同一个商品有多个编码？", answer: "HS 编码前 6 位是全球统一的，但各国可以扩展至 8-10 位..." },
        ]} />

        <AdSlot placement="tool-hs-code-bottom" className="mb-4" />
      </div>
    </div>
  );
}
