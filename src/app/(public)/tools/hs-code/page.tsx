'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Search, Package, ExternalLink, ChevronDown, ChevronUp, Loader2, Copy, Check, Clock, Truck, AlertTriangle, Bookmark, BookmarkCheck, Shield, FileText, Calculator, Link2 } from 'lucide-react';
import { PublicLandingPageFrame } from '@/components/templates/public/PublicLandingPageFrame';
import { RelatedGuidesSection } from '@/components/related-guides-section';
import { FAQSection } from '@/components/faq-section';
import { AdSlot } from '@/components/ad-slot';
import { RelatedChecklistSection } from '@/components/related-checklist-section';
import { TaskChainNextStep, TASK_CHAIN_STEPS } from '@/components/tools/task-chain-next-step';
import { TaskChainSelectDialog } from '@/components/tools/task-chain-select-dialog';
import { inputStyles, cardStyles } from "@/lib/ui-styles";
import { RelatedDiscussionsClient } from '@/components/community/related-discussions-client';
import { trackEvent } from '@/lib/analytics';
import { saveTaskChain } from '@/lib/task-chain';
import { importToolDataToTaskChain, createTaskChain } from '@/lib/task-chain-api';
import type { TaskChain } from '@/lib/task-chain-api';
import { getAliases } from '@/lib/hs-code-query-aliases';
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

// Sensitive product keywords that trigger extra warnings
const SENSITIVE_KEYWORDS_EN = ['battery', 'batteries', 'liquid', 'powder', 'food', 'medicine', 'medicinal', 'cosmetic', 'chemical', 'aerosol', 'flammable', 'lithium'];
const SENSITIVE_KEYWORDS_CN = ['电池', '液体', '粉末', '食品', '药品', '药物', '化妆品', '化学品', '喷雾', '易燃', '锂电'];

// Example products for quick search - all verified to have results in production
// 所有默认示例都已验证在生产环境有结果
const EXAMPLE_PRODUCTS = [
  { label: '玩具', query: '玩具' },
  { label: 'toys', query: 'toys' },
  { label: '衣服', query: '衣服' },
  { label: 'shirt', query: 'shirt' },
  { label: '保温', query: '保温' },
  { label: 'vacuum', query: 'vacuum' },
  { label: '手机', query: '手机' },
  { label: 'phone', query: 'phone' },
  { label: '塑料', query: '塑料' },
  { label: 'plastic', query: 'plastic' },
  { label: '灯', query: '灯' },
  { label: 'light', query: 'light' },
  { label: '陶瓷', query: '陶瓷' },
  { label: 'ceramic', query: 'ceramic' },
  { label: '书包', query: '书包' },
  { label: 'bag', query: 'bag' },
  { label: 'stainless steel', query: 'stainless steel' },
  { label: '9503', query: '9503' },
];

const RECENT_QUERIES_KEY = 'hs-code-recent-queries';
const FAVORITES_KEY = 'hs-code-favorites';
const HS_CODE_SELECTED_KEY = 'jueshi.hsCode.selectedProduct.v1';

interface RecentQuery {
  query: string;
  resultCount: number;
  timestamp: number;
}

interface FavoriteItem {
  hsCode: string;
  description: string;
  descriptionEn: string | null;
  query: string;
  note: string;
  timestamp: number;
}

// Detect if query contains sensitive product keywords
function isSensitiveQuery(query: string): boolean {
  const q = query.toLowerCase();
  return SENSITIVE_KEYWORDS_EN.some(k => q.includes(k)) ||
         SENSITIVE_KEYWORDS_CN.some(k => q.includes(k));
}

// Determine match confidence level
function getMatchLevel(item: HSCodeItem, query: string): 'high' | 'medium' | 'low' {
  const q = query.toLowerCase().trim();
  
  // Exact code match
  if (item.code === q || item.code.startsWith(q) && /^\d+$/.test(q)) {
    return 'high';
  }
  
  // Chinese description contains exact query
  if (item.description.includes(query)) {
    return 'high';
  }
  
  // English description contains exact query
  if (item.descriptionEn?.toLowerCase().includes(q)) {
    return 'medium';
  }
  
  // Partial match
  return 'low';
}

function getMatchReason(item: HSCodeItem, query: string): string {
  const q = query.toLowerCase().trim();
  
  if (/^\d+$/.test(query) && item.code.startsWith(query)) {
    return '编码前缀匹配';
  }
  if (item.description.includes(query)) {
    return '中文描述匹配';
  }
  if (item.descriptionEn?.toLowerCase().includes(q)) {
    return '英文描述匹配';
  }
  return '关键词匹配';
}

// Get suggested queries based on the current query
function getSuggestedQueries(query: string): string[] {
  const q = query.toLowerCase().trim();
  
  // Common product categories and their suggested alternatives
  const suggestions: Record<string, string[]> = {
    '保温杯': ['保温', '真空', 'vacuum', 'flask'],
    'thermos': ['vacuum', 'flask', 'insulated'],
    '手机壳': ['手机', 'phone', 'case', 'cover'],
    'phone case': ['phone', 'case', 'cover', 'mobile'],
    '塑料杯': ['塑料', '杯子', 'plastic', 'cup'],
    'plastic cup': ['plastic', 'cup', '塑料', '杯子'],
    '棉t恤': ['t恤', '衬衫', 'shirt', 'cotton'],
    'cotton shirt': ['shirt', 'cotton', 't-shirt'],
    'led灯': ['灯', 'led', 'light', 'lamp'],
    'led light': ['light', 'led', 'lamp', '灯'],
    '陶瓷杯': ['陶瓷', '杯子', 'ceramic', 'cup'],
    'ceramic cup': ['ceramic', 'cup', '陶瓷', '杯子'],
    '双肩包': ['包', '书包', 'bag', 'backpack'],
    'backpack': ['bag', 'pack', '书包', '包'],
  };
  
  // Direct match
  if (suggestions[q]) {
    return suggestions[q];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(suggestions)) {
    if (q.includes(key) || key.includes(q)) {
      return value;
    }
  }
  
  return [];
}

export default function HSCodePage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<HSCodeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [savedProduct, setSavedProduct] = useState<string | null>(null);
  const [aliasUsed, setAliasUsed] = useState<string | null>(null); // Track if alias was used
  const [taskChainCreating, setTaskChainCreating] = useState<string | null>(null);
  const [showTaskChainDialog, setShowTaskChainDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HSCodeItem | null>(null);
  
  // Request sequence guard + AbortController
  const requestSeqRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Load recent queries and favorites
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_QUERIES_KEY);
      if (saved) setRecentQueries(JSON.parse(saved));
    } catch { /* empty */ }
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      if (saved) setFavorites(JSON.parse(saved));
    } catch { /* empty */ }
  }, []);

  // Track Tool_View on mount
  useEffect(() => {
    trackEvent.custom('hs-code', 'view');
  }, []);

  const fetchCodes = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setActiveQuery('');
      setError(null);
      setLoading(false);
      setAliasUsed(null);
      return;
    }
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Increment sequence and create new AbortController
    const currentSeq = ++requestSeqRef.current;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    // Set loading state and clear stale results
    setActiveQuery(q);
    setLoading(true);
    setError(null);
    setResults([]);
    setAliasUsed(null);
    
    try {
      // Try original query first
      const res = await fetch(`/api/tools/hs-code?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      const json = await res.json();
      
      // Only update if this is still the latest request
      if (currentSeq !== requestSeqRef.current) return;
      
      if (json.success) {
        // If original query has results, use them
        if (json.data.length > 0) {
          setResults(json.data);
          trackEvent.custom('hs-code', 'search_success');
          // Save to recent queries
          const entry: RecentQuery = { query: q, resultCount: json.data.length, timestamp: Date.now() };
          setRecentQueries(prev => {
            const updated = [entry, ...prev.filter(r => r.query !== q)].slice(0, 10);
            try { localStorage.setItem(RECENT_QUERIES_KEY, JSON.stringify(updated)); } catch { /* empty */ }
            return updated;
          });
          // Save to task chain
          saveTaskChain({ sourceTool: 'hs-code', productName: q });
        } else {
          // No results from original query, try aliases
          const aliases = getAliases(q);
          let foundWithAlias = false;
          
          for (const alias of aliases) {
            // Check if request was cancelled
            if (currentSeq !== requestSeqRef.current) return;
            
            try {
              const aliasRes = await fetch(`/api/tools/hs-code?q=${encodeURIComponent(alias)}`, {
                signal: controller.signal,
              });
              const aliasJson = await aliasRes.json();
              
              if (currentSeq !== requestSeqRef.current) return;
              
              if (aliasJson.success && aliasJson.data.length > 0) {
                setResults(aliasJson.data);
                setAliasUsed(alias);
                trackEvent.custom('hs-code', 'search_alias_fallback');
                // Save to recent queries with original query
                const entry: RecentQuery = { query: q, resultCount: aliasJson.data.length, timestamp: Date.now() };
                setRecentQueries(prev => {
                  const updated = [entry, ...prev.filter(r => r.query !== q)].slice(0, 10);
                  try { localStorage.setItem(RECENT_QUERIES_KEY, JSON.stringify(updated)); } catch { /* empty */ }
                  return updated;
                });
                saveTaskChain({ sourceTool: 'hs-code', productName: q });
                foundWithAlias = true;
                break;
              }
            } catch (aliasErr) {
              // Continue to next alias
              continue;
            }
          }
          
          if (!foundWithAlias) {
            trackEvent.custom('hs-code', 'search_no_result');
          }
        }
      } else {
        setError('查询失败，请稍后重试');
      }
    } catch (e: unknown) {
      const err = e as { name?: string };
      // Ignore abort errors
      if (err?.name === 'AbortError') return;
      // Only update if this is still the latest request
      if (currentSeq !== requestSeqRef.current) return;
      console.error(e);
      setError('网络错误，请检查连接后重试');
    } finally {
      // Only clear loading if this is still the latest request
      if (currentSeq === requestSeqRef.current) {
        setLoading(false);
      }
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

  const copyText = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
      trackEvent.custom('hs-code', field.startsWith('code-') ? 'copy_code' : 'copy_description');
      // If copying an HS code, save to task chain
      if (field.startsWith('code-')) {
        const code = text;
        const item = results.find(r => r.code === code);
        saveTaskChain({ hsCode: code, productDescription: item?.descriptionEn || item?.description || '' });
        trackEvent.custom('hs-code', 'task_chain_save_context');
      }
    });
  }, [results]);

  const isFavorite = useCallback((code: string) => {
    return favorites.some(f => f.hsCode === code);
  }, [favorites]);

  const toggleFavorite = useCallback((item: HSCodeItem) => {
    const exists = favorites.some(f => f.hsCode === item.code);
    let updated: FavoriteItem[];
    
    if (exists) {
      updated = favorites.filter(f => f.hsCode !== item.code);
    } else {
      updated = [{
        hsCode: item.code,
        description: item.description,
        descriptionEn: item.descriptionEn,
        query: activeQuery,
        note: '',
        timestamp: Date.now(),
      }, ...favorites].slice(0, 20);
      trackEvent.custom('hs-code', 'save_local_candidate');
    }
    
    setFavorites(updated);
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated)); } catch { /* empty */ }
  }, [favorites, activeQuery]);

  const saveToProductLibrary = useCallback((item: HSCodeItem) => {
    // Save to localStorage as a candidate product
    const product = {
      hsCode: item.code,
      descriptionZh: item.description,
      descriptionEn: item.descriptionEn,
      query: activeQuery,
      source: 'hs-code-tool',
      createdAt: Date.now(),
    };
    
    // Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('hs-code-product-candidates') || '[]');
      const updated = [product, ...existing.filter((p: { hsCode: string }) => p.hsCode !== item.code)].slice(0, 50);
      localStorage.setItem('hs-code-product-candidates', JSON.stringify(updated));
    } catch { /* empty */ }
    
    setSavedProduct(item.code);
    setTimeout(() => setSavedProduct(null), 2000);
    trackEvent.custom('hs-code', 'save_product_candidate');
  }, [activeQuery]);

  const carryToQuoteSheet = useCallback((item: HSCodeItem) => {
    const payload = {
      hsCode: item.code,
      descriptionZh: item.description,
      descriptionEn: item.descriptionEn,
      query: activeQuery,
      source: 'hs-code-tool',
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
    };
    try {
      localStorage.setItem(HS_CODE_SELECTED_KEY, JSON.stringify(payload));
    } catch { /* empty */ }
    
    // Also copy to clipboard for immediate use
    const text = `HS Code: ${item.code}\n商品: ${item.description}\nEnglish: ${item.descriptionEn || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopiedField(`carry-qs-${item.code}`);
    setTimeout(() => setCopiedField(null), 1500);
    trackEvent.custom('hs-code', 'related_tool_click');
  }, [activeQuery]);

  const carryToCommercialInvoice = useCallback((item: HSCodeItem) => {
    const payload = {
      hsCode: item.code,
      descriptionZh: item.description,
      descriptionEn: item.descriptionEn,
      query: activeQuery,
      source: 'hs-code-tool',
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 60 * 1000,
    };
    try {
      localStorage.setItem(HS_CODE_SELECTED_KEY, JSON.stringify(payload));
    } catch { /* empty */ }
    
    const text = `HS Code: ${item.code}\n商品: ${item.description}\nEnglish: ${item.descriptionEn || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopiedField(`carry-ci-${item.code}`);
    setTimeout(() => setCopiedField(null), 1500);
    trackEvent.custom('hs-code', 'related_tool_click');
  }, [activeQuery]);

  const clearRecentQueries = useCallback(() => {
    setRecentQueries([]);
    try { localStorage.removeItem(RECENT_QUERIES_KEY); } catch { /* empty */ }
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    try { localStorage.removeItem(FAVORITES_KEY); } catch { /* empty */ }
  }, []);

  const joinShippingTaskChain = useCallback((item: HSCodeItem) => {
    if (sessionStatus === 'loading') return;
    if (!session?.user) {
      // Redirect to login
      router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
    setSelectedItem(item);
    setShowTaskChainDialog(true);
  }, [session, sessionStatus, router]);

  const handleSelectTaskChain = useCallback(async (taskChain: TaskChain) => {
    if (!selectedItem) return;
    setTaskChainCreating(selectedItem.code);
    try {
      await importToolDataToTaskChain(taskChain.id, 'hs-tool', {
        hsCode: selectedItem.code,
        productDescription: selectedItem.descriptionEn || selectedItem.description,
        productName: activeQuery,
      });
      trackEvent.custom('hs-code', 'join_shipping_task_chain');
      setShowTaskChainDialog(false);
      setSelectedItem(null);
      router.push(`/workspace/task-chains/shipping/${taskChain.id}`);
    } catch (e) {
      console.error(e);
      alert('导入数据到任务链失败，请稍后重试');
    } finally {
      setTaskChainCreating(null);
    }
  }, [selectedItem, activeQuery, router]);

  const handleCreateNewTaskChain = useCallback(async (title: string): Promise<TaskChain> => {
    if (!selectedItem) throw new Error('No item selected');
    const newChain = await createTaskChain({
      title,
      sourceTool: 'hs-code',
      context: {
        hsCode: selectedItem.code,
        productDescription: selectedItem.descriptionEn || selectedItem.description,
        productName: activeQuery,
      },
    });
    return newChain;
  }, [selectedItem, activeQuery]);

  const sensitiveQuery = isSensitiveQuery(activeQuery);

  return (
    <PublicLandingPageFrame
      title="HS Code 商品归类查询"
      subtitle="输入商品中文名、英文名或 HS 编码，查询可能的商品归类结果"
    >
      <div className="pb-16">
        
        {/* Primary Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-medium mb-1">免责声明</p>
              <p>HS Code 查询结果仅供参考，不构成海关、税务或法律意见。正式报关前请以目的国海关、报关行或专业归类意见为准。同一商品可能因材质、用途、规格不同而归入不同编码。</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className={cardStyles.base + " mb-6"}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              className={inputStyles + " pl-10 pr-10 text-base"} 
              placeholder="输入商品名称（如：玩具、toys）或 HS 编码（如：9503）..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {results.length > 0 ? `找到 ${results.length} 条匹配结果` : activeQuery && !loading ? '未找到匹配结果' : '支持中文、英文和编码前缀查询'}
          </p>

          {/* Example products */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-gray-400">快速查询：</span>
            {EXAMPLE_PRODUCTS.map((p) => (
              <button
                key={p.query + p.label}
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
              {recentQueries.slice(0, 5).map((rq, i) => (
                <button
                  key={i}
                  onClick={() => setSearch(rq.query)}
                  className="px-2.5 py-1 text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-md transition-colors"
                >
                  {rq.query} ({rq.resultCount})
                </button>
              ))}
              <button onClick={clearRecentQueries} className="text-xs text-gray-400 hover:text-red-500 ml-auto">
                清空
              </button>
            </div>
          )}
        </div>

        {/* Sensitive Product Warning */}
        {sensitiveQuery && results.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800 dark:text-red-300">
                <p className="font-medium mb-1">⚠️ 敏感商品提示</p>
                <p>你的查询可能涉及特殊商品（如电池、液体、粉末、食品、药品、化妆品、化学品等）。此类商品通常需要额外的监管许可、安全认证或特殊包装要求。</p>
                <ul className="mt-2 text-xs space-y-1 list-disc list-inside">
                  <li>锂电池产品需提供 UN38.3 测试报告</li>
                  <li>食品/药品需符合目的国食品安全标准</li>
                  <li>液体/粉末可能有航空运输限制</li>
                  <li>化妆品需提供成分表和安全评估</li>
                </ul>
                <p className="mt-2 text-xs">请在申报前确认相关监管要求，必要时咨询报关行或物流服务商。</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && activeQuery && (
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                当前查询：<span className="font-medium text-teal-700 dark:text-teal-400">&quot;{activeQuery}&quot;</span>
                <span className="ml-2 text-gray-400">({results.length} 条结果)</span>
              </p>
            </div>
            {aliasUsed && (
              <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 未找到 &quot;{activeQuery}&quot; 的直接匹配，已使用同义词 &quot;<span className="font-medium">{aliasUsed}</span>&quot; 搜索。结果仅供参考，请以实际商品属性为准。
                </p>
              </div>
            )}
          </div>
        )}
        <div className="space-y-3">
          {results.map((item) => {
            const isExpanded = expandedId === item.code;
            const matchLevel = getMatchLevel(item, activeQuery);
            const matchReason = getMatchReason(item, activeQuery);
            const favorited = isFavorite(item.code);
            
            return (
              <div key={item.code} className={`${cardStyles.base.replace("p-5", "")} overflow-hidden`}>
                <div className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                  onClick={() => setExpandedId(isExpanded ? null : item.code)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg">📦</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 dark:text-white">{item.description}</p>
                        {/* Match level badge */}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          matchLevel === 'high' ? 'bg-green-100 text-green-700' :
                          matchLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {matchLevel === 'high' ? '高匹配' : matchLevel === 'medium' ? '可能匹配' : '需确认'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate font-mono">{item.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.taxRate && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        税率 {item.taxRate}%
                      </span>
                    )}
                    {/* Favorite button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
                      className={`p-1.5 rounded-lg transition-colors ${favorited ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`}
                      title={favorited ? '取消收藏' : '收藏此编码'}
                    >
                      {favorited ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t dark:border-gray-700 pt-4 space-y-4">
                    {/* Match info */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">💡 {matchReason}</span>
                      {item.category && <span className="text-gray-400">分类: {item.category}</span>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">中文描述</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">{item.description}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyText(item.description, `cn-${item.code}`); }}
                            className="p-1 text-gray-400 hover:text-teal-600 rounded flex-shrink-0"
                            title="复制中文描述"
                          >
                            {copiedField === `cn-${item.code}` ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">英文申报名</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono text-blue-600 dark:text-blue-400 flex-1">{item.descriptionEn || '—'}</p>
                          {item.descriptionEn && (
                            <button
                              onClick={(e) => { e.stopPropagation(); copyText(item.descriptionEn!, `en-${item.code}`); }}
                              className="p-1 text-gray-400 hover:text-teal-600 rounded flex-shrink-0"
                              title="复制英文描述"
                            >
                              {copiedField === `en-${item.code}` ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* HS Code with copy */}
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <span className="text-xs text-gray-500">HS编码：</span>
                      <span className="font-mono text-xl font-bold text-teal-600">{item.code}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); copyText(item.code, `code-${item.code}`); }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-colors border border-teal-200"
                      >
                        {copiedField === `code-${item.code}` ? <><Check className="w-3 h-3" /> 已复制</> : <><Copy className="w-3 h-3" /> 复制编码</>}
                      </button>
                      {item.descriptionEn && (
                        <button
                          onClick={(e) => { e.stopPropagation(); copyText(`${item.code} - ${item.descriptionEn}`, `full-${item.code}`); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
                        >
                          {copiedField === `full-${item.code}` ? <><Check className="w-3 h-3" /> 已复制</> : <><Copy className="w-3 h-3" /> 复制完整描述</>}
                        </button>
                      )}
                    </div>

                    {/* Notes */}
                    {item.notes && item.notes !== '无特殊要求' && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">申报要素 / 监管条件</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 border dark:border-gray-600 font-mono text-xs whitespace-pre-wrap">{item.notes}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={(e) => { e.stopPropagation(); carryToQuoteSheet(item); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors border border-purple-200"
                      >
                        <Calculator className="w-3 h-3" />
                        {copiedField === `carry-qs-${item.code}` ? '已复制' : '带入报价单'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); carryToCommercialInvoice(item); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors border border-indigo-200"
                      >
                        <FileText className="w-3 h-3" />
                        {copiedField === `carry-ci-${item.code}` ? '已复制' : '带入商业发票'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); saveToProductLibrary(item); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200"
                      >
                        <Bookmark className="w-3 h-3" />
                        {savedProduct === item.code ? '已保存' : '保存到商品资料库'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); joinShippingTaskChain(item); }}
                        disabled={taskChainCreating === item.code}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {taskChainCreating === item.code ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Link2 className="w-3 h-3" />
                        )}
                        {sessionStatus !== 'authenticated' ? '登录后继续' : '加入发货任务链'}
                      </button>
                    </div>

                    {/* Risk warning */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        <strong>⚠️ 风险提示：</strong>此编码为系统根据关键词匹配的结果，仅供辅助参考。不同国家/地区可能采用不同位数和扩展编码。正式申报前请与报关行或目的国海关确认。
                      </p>
                    </div>

                    {/* Official verification links */}
                    <div className="flex flex-wrap gap-3 text-xs">
                      <a href="https://www.customs.gov.cn" target="_blank" rel="noopener noreferrer"
                        onClick={() => trackEvent.custom('hs-code', 'click_verify')}
                        className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700">
                        <ExternalLink className="w-3 h-3" /> 中国海关总署核验
                      </a>
                      <a href="https://hts.usitc.gov/" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700">
                        <ExternalLink className="w-3 h-3" /> 美国 HTS 查询
                      </a>
                      <a href="https://www.wcoomd.org/en/topics/nomenclature/hs-nomenclature/hs-nomenclature-2022-edition.aspx" target="_blank" rel="noopener noreferrer"
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

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">正在查询 &quot;{activeQuery}&quot;...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <p className="text-red-500 mb-2">{error}</p>
            <p className="text-sm text-gray-400">请检查网络连接后重试</p>
          </div>
        )}

        {/* No results state */}
        {results.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            {activeQuery ? (
              <>
                <p className="text-gray-500 mb-2">未找到匹配 &quot;{activeQuery}&quot; 的海关数据</p>
                <p className="text-sm text-gray-400 mb-3">建议尝试：</p>
                <ul className="text-xs text-gray-400 space-y-1 mb-4">
                  <li>• 使用不同的关键词（中文或英文）</li>
                  <li>• 使用 HS 编码前缀查询（如 9503、8471）</li>
                  <li>• 简化搜索词（如 &quot;杯&quot; 而非 &quot;不锈钢保温杯&quot;）</li>
                  <li>• 使用材质或用途描述（如 &quot;塑料&quot;、&quot;陶瓷&quot;）</li>
                </ul>
                {/* Contextual suggestions based on query */}
                {getSuggestedQueries(activeQuery).length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">针对 &quot;{activeQuery}&quot; 的建议查询：</p>
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {getSuggestedQueries(activeQuery).map(suggestion => (
                        <button 
                          key={suggestion} 
                          onClick={() => setSearch(suggestion)}
                          className="px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 mb-3">或尝试以下热门查询：</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {EXAMPLE_PRODUCTS.slice(0, 6).map(p => (
                    <button key={p.query + p.label} onClick={() => setSearch(p.query)}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-colors">
                      {p.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-500 mb-2">输入商品名称或 HS 编码前缀开始查询</p>
                <p className="text-xs text-gray-400">支持中文（如：玩具）、英文（如：toys）或编码（如：9503）</p>
              </>
            )}
          </div>
        )}

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className={cardStyles.base + " mt-6"}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className={cardStyles.header}>
                <BookmarkCheck className="w-4 h-4 text-yellow-600" />
                收藏的 HS 编码 ({favorites.length})
              </h2>
              <button onClick={clearFavorites} className="text-xs text-gray-400 hover:text-red-500">
                清空
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-3">当前收藏仅保存在本机浏览器。后续商品资料库上线后可同步到工作台。</p>
              <div className="space-y-2">
                {favorites.map(fav => (
                  <div key={fav.hsCode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-600">{fav.hsCode}</span>
                        <span className="text-sm text-gray-700 truncate">{fav.description}</span>
                      </div>
                      {fav.descriptionEn && <p className="text-xs text-gray-400 truncate mt-0.5">{fav.descriptionEn}</p>}
                      <p className="text-[10px] text-gray-400 mt-0.5">查询: {fav.query} · {new Date(fav.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => copyText(fav.hsCode, `fav-${fav.hsCode}`)}
                        className="p-1.5 text-gray-400 hover:text-teal-600 rounded"
                        title="复制编码"
                      >
                        {copiedField === `fav-${fav.hsCode}` ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => toggleFavorite({ id: '', code: fav.hsCode, description: fav.description, descriptionEn: fav.descriptionEn, category: null, taxRate: null, notes: null })}
                        className="p-1.5 text-yellow-500 hover:text-red-500 rounded"
                        title="取消收藏"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data Source Info */}
        <div className={cardStyles.base + " mt-6"}>
          <div className="p-4 border-b border-gray-100">
            <h2 className={cardStyles.header}>
              <ExternalLink className="w-4 h-4 text-green-600" />
              数据来源与官方入口
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>📋 数据来源说明：</strong>当前结果基于公开资料和平台整理数据，仅供辅助参考。非官方海关数据库，不保证完整性和时效性。
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </div>
        
        {/* FAQ */}
        <FAQSection title="HS编码常见问题" items={[
          { question: "HS编码是什么？", answer: "HS编码（Harmonized System Code）是国际通用的商品分类编码体系，由世界海关组织（WCO）维护。前6位全球统一，各国可在此基础上扩展到8-10位。用于海关报关、关税计算、贸易统计等。" },
          { question: "为什么同一个商品可能有不同编码？", answer: "HS 编码前 6 位是全球统一的，但各国可以扩展至 8-10 位。同一商品在不同国家可能有不同的后几位编码。此外，商品如果有多重用途或材质，可能归入不同类别。" },
          { question: "查询结果可以直接用于报关吗？", answer: "不建议直接用于报关。本工具基于关键词匹配，结果仅供辅助参考。正式报关前请咨询专业报关行或向海关申请预归类，以确保归类准确。" },
          { question: "如何确定商品的正确HS编码？", answer: "确定HS编码需要综合考虑：商品材质、用途、加工工艺、包装方式等。本工具提供关键词匹配结果供参考，但最终归类应以海关或专业报关行的判断为准。如有疑问，可申请海关预归类。" },
          { question: "HS编码和关税有什么关系？", answer: "HS编码决定了商品适用的关税税率。不同编码对应不同的最惠国税率、暂定税率、协定税率等。正确归类可以避免多缴税或被处罚。" },
          { question: "收藏的商品会同步到工作台吗？", answer: "当前收藏仅保存在本机浏览器中。商品资料库同步功能规划中，上线后可将收藏的 HS 编码同步到工作台，方便在报价单、商业发票等单据中复用。" },
        ]} />

        {/* Related Tools - Enhanced */}
        <div className={cardStyles.base + " mt-8"}>
          <div className="p-4 border-b border-gray-100">
            <h2 className={cardStyles.header}>
              <Truck className="w-4 h-4 text-blue-600" />
              下一步推荐工具
            </h2>
            <p className="text-xs text-gray-500 mt-1">找到可能的 HS Code 后，你可以继续填写商业发票、生成报价单或准备装箱单。</p>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/tools/documents/commercial-invoice"
              onClick={() => trackEvent.custom('hs-code', 'click_related_commercial-invoice')}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-teal-50 rounded-xl border border-gray-200 hover:border-teal-200 transition-all">
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">商业发票</p>
                <p className="text-xs text-gray-500">生成报关用发票</p>
              </div>
            </Link>
            <Link href="/tools/documents/quotation"
              onClick={() => trackEvent.custom('hs-code', 'click_related_quotation')}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-teal-50 rounded-xl border border-gray-200 hover:border-teal-200 transition-all">
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">报价单</p>
                <p className="text-xs text-gray-500">外贸报价参考</p>
              </div>
            </Link>
            <Link href="/tools/documents/packing-list"
              onClick={() => trackEvent.custom('hs-code', 'click_related_packing-list')}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-teal-50 rounded-xl border border-gray-200 hover:border-teal-200 transition-all">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">装箱单</p>
                <p className="text-xs text-gray-500">准备装箱清单</p>
              </div>
            </Link>
            <Link href="/tools/shipping-calculator"
              onClick={() => trackEvent.custom('hs-code', 'click_related_shipping-calculator')}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-teal-50 rounded-xl border border-gray-200 hover:border-teal-200 transition-all">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">运费计算</p>
                <p className="text-xs text-gray-500">估算集运费用</p>
              </div>
            </Link>
            <Link href="/tools/postal-code"
              onClick={() => trackEvent.custom('hs-code', 'click_related_postal-code')}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-teal-50 rounded-xl border border-gray-200 hover:border-teal-200 transition-all">
              <span className="text-2xl">📮</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">邮编查询</p>
                <p className="text-xs text-gray-500">全球邮编检索</p>
              </div>
            </Link>
            <Link href="/tools/exchange-rate"
              onClick={() => trackEvent.custom('hs-code', 'click_related_exchange-rate')}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-teal-50 rounded-xl border border-gray-200 hover:border-teal-200 transition-all">
              <span className="text-2xl">💱</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">汇率换算</p>
                <p className="text-xs text-gray-500">多币种报价</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Related Checklist */}
        <RelatedChecklistSection
          toolSlug="hs-code"
          sourcePath="hs-code"
        />

        {/* Task Chain Next Step */}
        <div className="mt-8">
          <TaskChainNextStep
            sourceTool="hs-code"
            steps={TASK_CHAIN_STEPS['hs-code'].map(s => ({
              ...s,
              href: s.href.includes('commercial-invoice')
                ? `/tools/documents/commercial-invoice?from=task-chain&productName=${encodeURIComponent(search)}&hsCode=${encodeURIComponent(results.find(r => r.code === expandedId)?.code || '')}`
                : s.href
            }))}
          />
        </div>

        <AdSlot placement="tool-hs-code-bottom" className="mb-4" />
      </div>

      <RelatedDiscussionsClient tool="hs-code" />

      <TaskChainSelectDialog
        isOpen={showTaskChainDialog}
        onClose={() => { setShowTaskChainDialog(false); setSelectedItem(null); }}
        onSelect={handleSelectTaskChain}
        onCreateNew={handleCreateNewTaskChain}
        sourceTool="hs-code"
      />
    </PublicLandingPageFrame>
  );
}
