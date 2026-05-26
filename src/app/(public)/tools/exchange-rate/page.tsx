"use client";
import { AdSlot } from '@/components/ad-slot';
import SmartRelatedLinks from '@/components/smart-related-links';

import { useState, useEffect, useMemo } from "react";
import { ArrowLeftRight, RotateCcw, DollarSign, AlertTriangle, RefreshCw, Info, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { FAQSection } from '@/components/faq-section';
import { Breadcrumb } from '@/components/breadcrumb';
import { trackEvent } from '@/lib/analytics';
import { buttonVariants, inputStyles, cardStyles, labelStyles } from "@/lib/ui-styles";

interface RateResponse {
  source: string;
  base: string;
  date: string;
  updatedAt: string;
  rates: Record<string, number>;
  isStale: boolean;
  error?: string;
}

const CURRENCIES: { code: string; name: string; symbol: string; flag: string }[] = [
  { code: "USD", name: "美元", symbol: "$", flag: "🇺🇸" },
  { code: "CNY", name: "人民币", symbol: "¥", flag: "🇨🇳" },
  { code: "CAD", name: "加元", symbol: "C$", flag: "🇨🇦" },
  { code: "EUR", name: "欧元", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "英镑", symbol: "£", flag: "🇬🇧" },
  { code: "AUD", name: "澳元", symbol: "A$", flag: "🇦🇺" },
  { code: "NZD", name: "新西兰元", symbol: "NZ$", flag: "🇳🇿" },
  { code: "JPY", name: "日元", symbol: "¥", flag: "🇯🇵" },
  { code: "HKD", name: "港币", symbol: "HK$", flag: "🇭🇰" },
  { code: "KRW", name: "韩元", symbol: "₩", flag: "🇰🇷" },
  { code: "SGD", name: "新加坡元", symbol: "S$", flag: "🇸🇬" },
  { code: "MYR", name: "马来西亚林吉特", symbol: "RM", flag: "🇲🇾" },
  { code: "THB", name: "泰铢", symbol: "฿", flag: "🇹🇭" },
  { code: "TWD", name: "新台币", symbol: "NT$", flag: "🇹🇼" },
  { code: "INR", name: "印度卢比", symbol: "₹", flag: "🇮🇳" },
  { code: "IDR", name: "印尼盾", symbol: "Rp", flag: "🇮🇩" },
  { code: "PHP", name: "菲律宾比索", symbol: "₱", flag: "🇵🇭" },
  { code: "VND", name: "越南盾", symbol: "₫", flag: "🇻🇳" },
  { code: "BRL", name: "巴西雷亚尔", symbol: "R$", flag: "🇧🇷" },
  { code: "MXN", name: "墨西哥比索", symbol: "MX$", flag: "🇲🇽" },
  { code: "RUB", name: "俄罗斯卢布", symbol: "₽", flag: "🇷🇺" },
  { code: "TRY", name: "土耳其里拉", symbol: "₺", flag: "🇹🇷" },
  { code: "ZAR", name: "南非兰特", symbol: "R", flag: "🇿🇦" },
  { code: "CHF", name: "瑞士法郎", symbol: "CHF", flag: "🇨🇭" },
  { code: "SEK", name: "瑞典克朗", symbol: "kr", flag: "🇸🇪" },
  { code: "NOK", name: "挪威克朗", symbol: "kr", flag: "🇳🇴" },
  { code: "DKK", name: "丹麦克朗", symbol: "kr", flag: "🇩🇰" },
  { code: "PLN", name: "波兰兹罗提", symbol: "zł", flag: "🇵🇱" },
  { code: "CZK", name: "捷克克朗", symbol: "Kč", flag: "🇨🇿" },
  { code: "HUF", name: "匈牙利福林", symbol: "Ft", flag: "🇭🇺" },
  { code: "RON", name: "罗马尼亚列伊", symbol: "lei", flag: "🇷🇴" },
  { code: "BGN", name: "保加利亚列弗", symbol: "лв", flag: "🇧🇬" },
  { code: "HRK", name: "克罗地亚库纳", symbol: "kn", flag: "🇭🇷" },
  { code: "ILS", name: "以色列新谢克尔", symbol: "₪", flag: "🇮🇱" },
  { code: "AED", name: "阿联酋迪拉姆", symbol: "د.إ", flag: "🇦🇪" },
  { code: "SAR", name: "沙特里亚尔", symbol: "﷼", flag: "🇸🇦" },
  { code: "QAR", name: "卡塔尔里亚尔", symbol: "﷼", flag: "🇶🇦" },
  { code: "KWD", name: "科威特第纳尔", symbol: "د.ك", flag: "🇰🇼" },
  { code: "BHD", name: "巴林第纳尔", symbol: ".د.ب", flag: "🇧🇭" },
  { code: "OMR", name: "阿曼里亚尔", symbol: "﷼", flag: "🇴🇲" },
  { code: "JOD", name: "约旦第纳尔", symbol: "د.ا", flag: "🇯🇴" },
  { code: "EGP", name: "埃及镑", symbol: "£", flag: "🇪🇬" },
  { code: "NGN", name: "尼日利亚奈拉", symbol: "₦", flag: "🇳🇬" },
  { code: "KES", name: "肯尼亚先令", symbol: "KSh", flag: "🇰🇪" },
  { code: "GHS", name: "加纳塞地", symbol: "₵", flag: "🇬🇭" },
  { code: "MAD", name: "摩洛哥迪拉姆", symbol: "د.م.", flag: "🇲🇦" },
  { code: "TND", name: "突尼斯第纳尔", symbol: "د.ت", flag: "🇹🇳" },
  { code: "ARS", name: "阿根廷比索", symbol: "$", flag: "🇦🇷" },
  { code: "CLP", name: "智利比索", symbol: "$", flag: "🇨🇱" },
  { code: "COP", name: "哥伦比亚比索", symbol: "$", flag: "🇨🇴" },
  { code: "PEN", name: "秘鲁索尔", symbol: "S/", flag: "🇵🇪" },
  { code: "UYU", name: "乌拉圭比索", symbol: "$U", flag: "🇺🇾" },
  { code: "PKR", name: "巴基斯坦卢比", symbol: "₨", flag: "🇵🇰" },
  { code: "BDT", name: "孟加拉塔卡", symbol: "৳", flag: "🇧🇩" },
  { code: "LKR", name: "斯里兰卡卢比", symbol: "₨", flag: "🇱🇰" },
  { code: "NPR", name: "尼泊尔卢比", symbol: "₨", flag: "🇳🇵" },
  { code: "MMK", name: "缅甸缅元", symbol: "K", flag: "🇲🇲" },
  { code: "KHR", name: "柬埔寨瑞尔", symbol: "៛", flag: "🇰🇭" },
  { code: "LAK", name: "老挝基普", symbol: "₭", flag: "🇱🇦" },
  { code: "MOP", name: "澳门元", symbol: "MOP$", flag: "🇲🇴" },
  { code: "BND", name: "文莱元", symbol: "B$", flag: "🇧🇳" },
  { code: "FJD", name: "斐济元", symbol: "FJ$", flag: "🇫🇯" },
  { code: "PGK", name: "巴布亚新几内亚基那", symbol: "K", flag: "🇵🇬" },
  { code: "ISK", name: "冰岛克朗", symbol: "kr", flag: "🇮🇸" },
  { code: "UAH", name: "乌克兰格里夫纳", symbol: "₴", flag: "🇺🇦" },
  { code: "KZT", name: "哈萨克斯坦坚戈", symbol: "₸", flag: "🇰🇿" },
  { code: "UZS", name: "乌兹别克斯坦索姆", symbol: "so'm", flag: "🇺🇿" },
  { code: "GEL", name: "格鲁吉亚拉里", symbol: "₾", flag: "🇬🇪" },
  { code: "AMD", name: "亚美尼亚德拉姆", symbol: "֏", flag: "🇦🇲" },
  { code: "AZN", name: "阿塞拜疆马纳特", symbol: "₼", flag: "🇦🇿" },
];

export default function ExchangeRatePage() {
  const [amount, setAmount] = useState("1000");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("CNY");
  const [result, setResult] = useState<{ amount: number; rate: number } | null>(null);
  const [rateData, setRateData] = useState<RateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<{ date: string; rate: number }[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);

  // ── Currency search dropdowns ──
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filteredFromCurrencies = useMemo(() => {
    if (!fromSearch) return CURRENCIES;
    const q = fromSearch.toLowerCase();
    return CURRENCIES.filter(c => c.code.toLowerCase().includes(q) || c.name.includes(q) || c.flag.includes(q));
  }, [fromSearch]);

  const filteredToCurrencies = useMemo(() => {
    if (!toSearch) return CURRENCIES;
    const q = toSearch.toLowerCase();
    return CURRENCIES.filter(c => c.code.toLowerCase().includes(q) || c.name.includes(q) || c.flag.includes(q));
  }, [toSearch]);

  // Auto-trigger from URL params (?from=USD&to=CAD&amount=100 or ?q=USD转CNY)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    const to = params.get('to');
    const amt = params.get('amount');
    const q = params.get('q');

    if (from && CURRENCIES.some(c => c.code === from)) setFromCurrency(from);
    if (to && CURRENCIES.some(c => c.code === to)) setToCurrency(to);
    if (amt) setAmount(amt);

    if (q) {
      const pairMatch = q.match(/([A-Z]{3})[\s\-\u8f6c\u5230to]+([A-Z]{3})/i);
      if (pairMatch) {
        const f = pairMatch[1].toUpperCase();
        const t = pairMatch[2].toUpperCase();
        if (CURRENCIES.some(c => c.code === f)) setFromCurrency(f);
        if (CURRENCIES.some(c => c.code === t)) setToCurrency(t);
      }
    }
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/exchange-rate");
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "无法获取汇率数据");
        setRateData(null);
        return;
      }
      const data: RateResponse = await res.json();
      setRateData(data);
      if (amount && fromCurrency && toCurrency) {
        doConvert(data.rates);
      }
    } catch {
      setError("网络错误，请稍后重试");
      setRateData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch 30-day history via our backend proxy (eliminates CORS noise)
  const fetchHistory = async (from: string, to: string) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/exchange-rate/history?from=${from}&to=${to}&days=30`);
      if (!res.ok) throw new Error("history unavailable");
      const json = await res.json();

      // API returns { points: [{ date, rate }] }
      const chartData: { date: string; rate: number }[] = json.points || [];
      setHistoryData(chartData);
      setShowChart(true);
      trackEvent.custom('exchange-rate', 'view_history');
    } catch {
      // Silent fail — chart is optional
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Current rate for reference line on chart
  const currentRate = useMemo(() => {
    if (!rateData) return null;
    const fromRate = rateData.rates[fromCurrency];
    const toRate = rateData.rates[toCurrency];
    if (!fromRate || !toRate) return null;
    return toRate / fromRate;
  }, [rateData, fromCurrency, toCurrency]);

  useEffect(() => {
    fetchRates();
  }, []);

  const doConvert = (rates: Record<string, number>) => {
    const amt = parseFloat(amount) || 0;
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    if (fromRate === undefined || toRate === undefined) return;

    // 通过 CNY 中转换算
    const inCNY = amt / fromRate;
    const converted = inCNY * toRate;
    const rate = toRate / fromRate;
    setResult({ amount: converted, rate });
  };

  const convert = () => {
    if (rateData) doConvert(rateData.rates);
  };

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const reset = () => {
    setAmount("1000");
    setFromCurrency("USD");
    setToCurrency("CNY");
    setResult(null);
    setFromSearch("");
    setToSearch("");
  };

  const selectFromCurrency = (code: string) => {
    setFromCurrency(code);
    setFromSearch("");
    setFromDropdownOpen(false);
  };
  const selectToCurrency = (code: string) => {
    setToCurrency(code);
    setToSearch("");
    setToDropdownOpen(false);
  };

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString("zh-CN", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("zh-CN", {
      year: "numeric", month: "2-digit", day: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb />
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">实时国际汇率转换器 & 结汇精算</h1>
          <p className="text-gray-500 mt-2">支持 150+ 全球法币 · 双向转换 · URL 参数直达</p>
        </div>

        <div className={cardStyles.base}>
          {/* Data source bar */}
          {rateData && (
            <div className="mb-4 bg-blue-50 rounded-xl p-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700 space-y-0.5">
                <p>数据来源: {rateData.source} | 数据基准: {rateData.base}</p>
                <p>汇率日期: {formatDate(rateData.date)} | 本站更新: {formatDateTime(rateData.updatedAt)}</p>
                {rateData.isStale && (
                  <p className="text-amber-600 font-medium">⚠ 数据已过期（API 暂不可用，显示为缓存内容）</p>
                )}
                {!rateData.isStale && (
                  <p>本站缓存约 30 分钟，实际更新时间以数据源返回为准</p>
                )}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && !rateData && (
            <div className="mb-4 bg-gray-50 rounded-xl p-4 text-center">
              <RefreshCw className="w-5 h-5 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">正在获取汇率数据...</p>
            </div>
          )}

          {/* Error */}
          {error && !rateData && (
            <div className="mb-4 bg-red-50 rounded-xl p-4 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-700">{error}</p>
                <button onClick={fetchRates} className="mt-2 text-sm text-red-600 hover:text-red-800 underline">
                  重新尝试
                </button>
              </div>
            </div>
          )}

          {/* Conversion form — widescreen layout with searchable dropdowns */}
          <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-end mb-6">
            {/* From currency */}
            <div className="relative">
              <label className={labelStyles.field}>持有货币</label>
              <div className="relative">
                <input
                  type="text"
                  value={fromSearch || `${CURRENCIES.find(c => c.code === fromCurrency)?.flag || ''} ${fromCurrency} - ${CURRENCIES.find(c => c.code === fromCurrency)?.name || ''}`}
                  onChange={(e) => { setFromSearch(e.target.value); setFromDropdownOpen(true); }}
                  onFocus={() => { setFromSearch(""); setFromDropdownOpen(true); }}
                  onBlur={() => setTimeout(() => setFromDropdownOpen(false), 200)}
                  className={`${inputStyles} cursor-pointer`}
                  placeholder="搜索货币..."
                />
                {fromDropdownOpen && mounted && (
                  <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredFromCurrencies.slice(0, 20).map((c) => (
                      <button key={c.code}
                        onMouseDown={() => selectFromCurrency(c.code)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center gap-2 ${fromCurrency === c.code ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>
                        <span>{c.flag}</span>
                        <span className="font-mono font-bold">{c.code}</span>
                        <span className="text-gray-500">{c.name}</span>
                      </button>
                    ))}
                    {filteredFromCurrencies.length === 0 && (
                      <div className="px-3 py-4 text-center text-sm text-gray-400">未找到匹配货币</div>
                    )}
                  </div>
                )}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`${inputStyles} mt-2 text-2xl font-bold`}
                placeholder="0.00"
              />
            </div>

            <button onClick={swap} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors min-h-[44px]">
              <ArrowLeftRight className="w-5 h-5 text-gray-600" />
            </button>

            {/* To currency */}
            <div className="relative">
              <label className={labelStyles.field}>目标货币</label>
              <div className="relative">
                <input
                  type="text"
                  value={toSearch || `${CURRENCIES.find(c => c.code === toCurrency)?.flag || ''} ${toCurrency} - ${CURRENCIES.find(c => c.code === toCurrency)?.name || ''}`}
                  onChange={(e) => { setToSearch(e.target.value); setToDropdownOpen(true); }}
                  onFocus={() => { setToSearch(""); setToDropdownOpen(true); }}
                  onBlur={() => setTimeout(() => setToDropdownOpen(false), 200)}
                  className={`${inputStyles} cursor-pointer`}
                  placeholder="搜索货币..."
                />
                {toDropdownOpen && mounted && (
                  <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredToCurrencies.slice(0, 20).map((c) => (
                      <button key={c.code}
                        onMouseDown={() => selectToCurrency(c.code)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center gap-2 ${toCurrency === c.code ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>
                        <span>{c.flag}</span>
                        <span className="font-mono font-bold">{c.code}</span>
                        <span className="text-gray-500">{c.name}</span>
                      </button>
                    ))}
                    {filteredToCurrencies.length === 0 && (
                      <div className="px-3 py-4 text-center text-sm text-gray-400">未找到匹配货币</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => { convert(); trackEvent.exchangeConvert(); }}
              disabled={!rateData || loading}
              className={`${buttonVariants.primary} flex-1`}
            >
              转换
            </button>
            <button
              onClick={reset}
              className={buttonVariants.secondary}
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">转换结果</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {CURRENCIES.find((c) => c.code === toCurrency)?.symbol}
                    {result.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-green-500 mt-2">
                    参考汇率: 1 {fromCurrency} = {result.rate.toFixed(4)} {toCurrency}
                  </p>
                </div>
                <div className="text-right text-sm text-green-600">
                  <p>{amount} {fromCurrency}</p>
                  <p className="text-2xl font-bold text-green-900">= {result.amount.toFixed(2)} {toCurrency}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Rates Table */}
          {rateData && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">常用参考汇率 (1 CNY = ?)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 divide-y divide-gray-100">
                {CURRENCIES.filter((c) => c.code !== "CNY").map((c) => {
                  const rate = rateData.rates[c.code];
                  if (rate === undefined) return null;
                  return (
                    <div key={c.code} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">{c.code}</p>
                      <p className="text-lg font-bold text-gray-900">{rate.toFixed(4)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 30-Day History Chart */}
          {rateData && (
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  30 天汇率走势
                </h3>
                <button
                  onClick={() => {
                    if (!showChart) {
                      fetchHistory(fromCurrency, toCurrency);
                    } else {
                      setShowChart(false);
                    }
                  }}
                  disabled={historyLoading}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  {historyLoading ? "加载中..." : showChart ? "收起" : "查看走势"}
                </button>
              </div>

              {showChart && historyData.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-3">
                    1 {fromCurrency} = ? {toCurrency}（数据来源：欧洲央行，仅参考）
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={historyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v: string) => v.slice(5)}
                        stroke="#9ca3af"
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        domain={['auto', 'auto']}
                        stroke="#9ca3af"
                        tickFormatter={(v: number) => v.toFixed(4)}
                      />
                      <Tooltip
                        formatter={(value: unknown) => typeof value === 'number' ? value.toFixed(4) : String(value)}
                        labelFormatter={(label: unknown) => String(label)}
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      />
                      {currentRate && (
                        <ReferenceLine
                          y={currentRate}
                          stroke="#3b82f6"
                          strokeDasharray="4 4"
                          label={{
                            value: `当前 ${currentRate.toFixed(4)}`,
                            position: 'right',
                            fontSize: 10,
                            fill: '#3b82f6',
                          }}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {showChart && historyData.length === 0 && !historyLoading && (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <p className="text-sm text-gray-500">近期无可用历史数据（周末和节假日无报价）</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">免责声明</p>
              <p className="mt-1">
                本站汇率数据由 ExchangeRate-API 提供，仅供参考，不构成任何金融建议或结算承诺。实际交易汇率请以银行或持牌金融机构提供的汇率为准。本站不对汇率数据的准确性、及时性或完整性作任何保证。
              </p>
            </div>
          </div>
        </div>

        {/* Smart Contextual Interlinking */}
        <div className="mt-8">
          <SmartRelatedLinks tool="exchange-rate" country={fromCurrency} type="tool" layout="bottom" />
        </div>

        {/* FAQ */}
        <FAQSection title="汇率查询常见问题" items={[
          {
            question: "汇率多久更新一次？",
            answer: "本站接入 ExchangeRate-API 的每日更新汇率数据，本站缓存约 30 分钟。实际更新时间以数据源返回为准。如需更实时更新的汇率，建议使用银行或持牌金融机构的实时汇率接口。",
          },
          {
            question: "为什么和银行的汇率不一样？",
            answer: "本站使用的是国际市场中间汇率（mid-market rate），银行实际交易时会在这个基础上加点差（spread）。例如中间汇率是 1 USD = 7.2 CNY，银行卖出价可能是 7.25，买入价可能是 7.15。本站汇率仅作为参考，实际交易请以银行报价为准。",
          },
          {
            question: "支持哪些货币？",
            answer: "当前支持 9 种主流货币：美元 (USD)、人民币 (CNY)、加元 (CAD)、欧元 (EUR)、英镑 (GBP)、澳元 (AUD)、新西兰元 (NZD)、日元 (JPY)、港币 (HKD)。覆盖海外华人最常用的币种。",
          },
          {
            question: "可以用这个汇率做跨境结算吗？",
            answer: "不建议。本站汇率仅供参考和学习使用，不构成任何金融建议或结算依据。跨境结算请使用银行、PayPal、Wise 等持牌金融机构提供的实时汇率。",
          },
          {
            question: "能看到汇率的历史走势吗？",
            answer: "可以。点击「查看走势」按钮即可查看最近 30 天的汇率走势图，数据来源于欧洲央行（ECB）公开汇率。当前汇率以蓝色虚线标注在图表上，方便你对比历史水平。",
          },
        ]} />

        {/* Tool-specific ads */}
        <AdSlot placement="tool-exchange-rate-bottom" className="mt-8 mb-8" />
      </div>
    </div>
  );
}
