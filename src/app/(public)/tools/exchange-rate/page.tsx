"use client";
import { AdSlot } from '@/components/ad-slot';
import SmartRelatedLinks from '@/components/smart-related-links';
import { RelatedChecklistSection } from '@/components/related-checklist-section';
import { TaskChainNextStep, TASK_CHAIN_STEPS } from '@/components/tools/task-chain-next-step';

import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeftRight, RotateCcw, DollarSign, AlertTriangle, RefreshCw, Info, TrendingUp, Copy, Check, Clock, Truck, Bell, BellRing, Calculator, Globe, Bookmark, Trash2, Eye } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { FAQSection } from '@/components/faq-section';
import { Breadcrumb } from '@/components/breadcrumb';
import { trackEvent } from '@/lib/analytics';
import { saveTaskChain } from '@/lib/task-chain';
import { buttonVariants, inputStyles, cardStyles, labelStyles } from "@/lib/ui-styles";
import Link from 'next/link';

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

// Tab types
type TabKey = 'converter' | 'multi-quote' | 'cost-estimate';

// Watch item type
interface WatchItem {
  id: string;
  from: string;
  to: string;
  targetRate: number;
  direction: 'above' | 'below';
  note: string;
  createdAt: number;
}

export default function ExchangeRatePage() {
  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<TabKey>('converter');

  // ── Core converter state ──
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
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // ── Manual rate fallback ──
  const [useManualRate, setUseManualRate] = useState(false);
  const [manualRate, setManualRate] = useState("");

  // ── Currency search dropdowns ──
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ── Recent conversions ──
  const [recentConversions, setRecentConversions] = useState<{ from: string; to: string; amount: string; result: string; timestamp: number }[]>([]);

  // ── Multi-currency quote ──
  const [multiBaseAmount, setMultiBaseAmount] = useState("1000");
  const [multiBaseCurrency, setMultiBaseCurrency] = useState("USD");
  const [multiTargetCurrencies, setMultiTargetCurrencies] = useState<string[]>(["USD", "CAD", "EUR", "GBP", "JPY", "CNY"]);
  const [multiCopied, setMultiCopied] = useState<string | null>(null);

  // ── Cost estimation ──
  const [costPurchasePrice, setCostPurchasePrice] = useState("100");
  const [costPurchaseCurrency, setCostPurchaseCurrency] = useState("CNY");
  const [costShipping, setCostShipping] = useState("50");
  const [costShippingCurrency, setCostShippingCurrency] = useState("CNY");
  const [costPlatformFee, setCostPlatformFee] = useState("5");
  const [costTaxRate, setCostTaxRate] = useState("0");
  const [costProfitMargin, setCostProfitMargin] = useState("30");
  const [costSellCurrency, setCostSellCurrency] = useState("USD");

  // ── Watch / Alert ──
  const [watchItems, setWatchItems] = useState<WatchItem[]>([]);
  const [watchFrom, setWatchFrom] = useState("USD");
  const [watchTo, setWatchTo] = useState("CNY");
  const [watchTarget, setWatchTarget] = useState("7.2");
  const [watchDirection, setWatchDirection] = useState<'above' | 'below'>('below');
  const [watchNote, setWatchNote] = useState("");

  useEffect(() => { setMounted(true); }, []);

  // Load localStorage data
  useEffect(() => {
    try {
      const saved = localStorage.getItem('exchange-rate-recent');
      if (saved) setRecentConversions(JSON.parse(saved));
    } catch { /* empty */ }
    try {
      const saved = localStorage.getItem('exchange-rate-watch');
      if (saved) setWatchItems(JSON.parse(saved));
    } catch { /* empty */ }
  }, []);

  // Track Tool_View on mount
  useEffect(() => {
    trackEvent.custom('exchange-rate', 'view');
  }, []);

  // Quick currency buttons
  const QUICK_CURRENCIES = ['USD', 'CAD', 'CNY', 'EUR', 'GBP', 'JPY', 'AUD', 'HKD', 'SGD', 'MYR'];

  // Quick amount buttons
  const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000];

  // Common rate card pairs
  const COMMON_RATE_PAIRS = [
    { from: 'USD', to: 'CNY', label: '美元→人民币' },
    { from: 'CNY', to: 'USD', label: '人民币→美元' },
    { from: 'CAD', to: 'CNY', label: '加元→人民币' },
    { from: 'USD', to: 'CAD', label: '美元→加元' },
    { from: 'EUR', to: 'CNY', label: '欧元→人民币' },
    { from: 'GBP', to: 'CNY', label: '英镑→人民币' },
    { from: 'JPY', to: 'CNY', label: '日元→人民币' },
    { from: 'AUD', to: 'CNY', label: '澳元→人民币' },
  ];

  // Scenario quick entries
  const SCENARIOS = [
    { from: 'USD', to: 'CAD', label: 'USD→CAD' },
    { from: 'CAD', to: 'CNY', label: 'CAD→CNY' },
    { from: 'CNY', to: 'CAD', label: 'CNY→CAD' },
    { from: 'USD', to: 'CNY', label: 'USD→CNY' },
    { from: 'GBP', to: 'CNY', label: 'GBP→CNY' },
  ];

  const copyText = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
      trackEvent.custom('exchange-rate', 'copy_result');
    });
  }, []);

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

  // Auto-trigger from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    const to = params.get('to');
    const amt = params.get('amount');
    const q = params.get('q');
    const tab = params.get('tab');

    if (tab && ['converter', 'multi-quote', 'cost-estimate'].includes(tab)) {
      setActiveTab(tab as TabKey);
    }
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
      setError("网络错误，请稍后重试。你可以使用手动汇率模式继续计算。");
      setRateData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (from: string, to: string) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/exchange-rate/history?from=${from}&to=${to}&days=30`);
      if (!res.ok) throw new Error("history unavailable");
      const json = await res.json();
      const chartData: { date: string; rate: number }[] = json.points || [];
      setHistoryData(chartData);
      setShowChart(true);
      trackEvent.custom('exchange-rate', 'view_history');
    } catch {
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

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

  const getRate = useCallback((from: string, to: string): number | null => {
    if (useManualRate && manualRate && from === fromCurrency && to === toCurrency) {
      const mr = parseFloat(manualRate);
      if (mr > 0) return mr;
    }
    if (!rateData) return null;
    const fromRate = rateData.rates[from];
    const toRate = rateData.rates[to];
    if (!fromRate || !toRate) return null;
    return toRate / fromRate;
  }, [rateData, useManualRate, manualRate, fromCurrency, toCurrency]);

  const doConvert = (rates: Record<string, number>) => {
    const amt = parseFloat(amount) || 0;
    let rate: number;

    if (useManualRate && manualRate) {
      rate = parseFloat(manualRate) || 0;
    } else {
      const fromRate = rates[fromCurrency];
      const toRate = rates[toCurrency];
      if (fromRate === undefined || toRate === undefined) return;
      rate = toRate / fromRate;
    }

    if (rate <= 0) return;
    const inBase = amt / (useManualRate ? 1 : (rates[fromCurrency] || 1));
    const converted = useManualRate ? amt * rate : inBase * (rates[toCurrency] || 1);
    setResult({ amount: converted, rate });

    // Save to recent conversions
    const entry = {
      from: fromCurrency,
      to: toCurrency,
      amount: amount,
      result: `${amount} ${fromCurrency} = ${converted.toFixed(2)} ${toCurrency}`,
      timestamp: Date.now(),
    };
    const updated = [entry, ...recentConversions.filter(
      r => !(r.from === entry.from && r.to === entry.to && r.amount === entry.amount)
    )].slice(0, 5);
    setRecentConversions(updated);
    try { localStorage.setItem('exchange-rate-recent', JSON.stringify(updated)); } catch { /* empty */ }

    // Save to task chain
    saveTaskChain({
      sourceTool: 'exchange-rate',
      declaredValue: amount,
      currency: fromCurrency,
      exchangeRate: rate.toFixed(4),
      convertedValue: converted.toFixed(2),
    });
    trackEvent.custom('exchange-rate', 'task_chain_save_context');
  };

  const convert = () => {
    if (useManualRate && manualRate) {
      const rate = parseFloat(manualRate);
      const amt = parseFloat(amount) || 0;
      if (rate > 0 && amt > 0) {
        const converted = amt * rate;
        setResult({ amount: converted, rate });
        const entry = {
          from: fromCurrency, to: toCurrency, amount,
          result: `${amount} ${fromCurrency} = ${converted.toFixed(2)} ${toCurrency}`,
          timestamp: Date.now(),
        };
        const updated = [entry, ...recentConversions.filter(
          r => !(r.from === entry.from && r.to === entry.to && r.amount === entry.amount)
        )].slice(0, 5);
        setRecentConversions(updated);
        try { localStorage.setItem('exchange-rate-recent', JSON.stringify(updated)); } catch { /* empty */ }
        trackEvent.custom('exchange-rate', 'manual_rate_used');
      }
    } else if (rateData) {
      doConvert(rateData.rates);
    }
  };

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    trackEvent.custom('exchange-rate', 'swap');
  };

  const reset = () => {
    setAmount("1000");
    setFromCurrency("USD");
    setToCurrency("CNY");
    setResult(null);
    setFromSearch("");
    setToSearch("");
    setUseManualRate(false);
    setManualRate("");
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

  // ── Multi-currency quote calculation ──
  const multiQuoteResults = useMemo(() => {
    const amt = parseFloat(multiBaseAmount) || 0;
    if (amt <= 0) return [];
    return multiTargetCurrencies.map(code => {
      const rate = getRate(multiBaseCurrency, code);
      const c = CURRENCIES.find(x => x.code === code);
      return {
        code,
        name: c?.name || code,
        flag: c?.flag || '',
        symbol: c?.symbol || '',
        rate,
        amount: rate ? amt * rate : null,
      };
    });
  }, [multiBaseAmount, multiBaseCurrency, multiTargetCurrencies, getRate]);

  const toggleMultiTarget = (code: string) => {
    setMultiTargetCurrencies(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const copyMultiQuoteTable = () => {
    const lines = multiQuoteResults
      .filter(r => r.rate !== null)
      .map(r => `${r.flag} ${r.code}: ${r.symbol}${r.amount?.toFixed(2)} (1 ${multiBaseCurrency} = ${r.rate?.toFixed(4)} ${r.code})`);
    const text = `${multiBaseAmount} ${multiBaseCurrency} 多币种报价\n${'─'.repeat(30)}\n${lines.join('\n')}\n\n数据来源：绝世百宝箱 | 仅供参考`;
    navigator.clipboard.writeText(text).then(() => {
      setMultiCopied('all');
      setTimeout(() => setMultiCopied(null), 1500);
      trackEvent.custom('exchange-rate', 'multi_currency_quote');
    });
  };

  // ── Cost estimation calculation ──
  const costResult = useMemo(() => {
    const purchase = parseFloat(costPurchasePrice) || 0;
    const shipping = parseFloat(costShipping) || 0;
    const platformFeePct = parseFloat(costPlatformFee) || 0;
    const taxPct = parseFloat(costTaxRate) || 0;
    const profitPct = parseFloat(costProfitMargin) || 0;

    if (purchase <= 0) return null;

    // Convert purchase and shipping to sell currency
    const purchaseRate = getRate(costPurchaseCurrency, costSellCurrency);
    const shippingRate = getRate(costShippingCurrency, costSellCurrency);

    if (!purchaseRate || !shippingRate) return null;

    const purchaseInSell = purchase * purchaseRate;
    const shippingInSell = shipping * shippingRate;
    const subtotal = purchaseInSell + shippingInSell;
    const withPlatformFee = subtotal * (1 + platformFeePct / 100);
    const withTax = withPlatformFee * (1 + taxPct / 100);
    const suggestedPrice = withTax * (1 + profitPct / 100);
    const profit = suggestedPrice - withTax;
    const profitMargin = suggestedPrice > 0 ? (profit / suggestedPrice) * 100 : 0;

    return {
      purchaseInSell,
      shippingInSell,
      subtotal,
      withPlatformFee,
      withTax,
      suggestedPrice,
      profit,
      profitMargin,
      rate: purchaseRate,
    };
  }, [costPurchasePrice, costPurchaseCurrency, costShipping, costShippingCurrency, costPlatformFee, costTaxRate, costProfitMargin, costSellCurrency, getRate]);

  const copyCostSummary = () => {
    if (!costResult) return;
    const c = CURRENCIES.find(x => x.code === costSellCurrency);
    const text = `成本估算摘要
${'─'.repeat(30)}
采购价: ${c?.symbol || ''}${costResult.purchaseInSell.toFixed(2)} ${costSellCurrency}
运费: ${c?.symbol || ''}${costResult.shippingInSell.toFixed(2)} ${costSellCurrency}
平台费 (${costPlatformFee}%): ${c?.symbol || ''}${(costResult.withPlatformFee - costResult.subtotal).toFixed(2)} ${costSellCurrency}
税费 (${costTaxRate}%): ${c?.symbol || ''}${(costResult.withTax - costResult.withPlatformFee).toFixed(2)} ${costSellCurrency}
总成本: ${c?.symbol || ''}${costResult.withTax.toFixed(2)} ${costSellCurrency}
利润率 (${costProfitMargin}%): 建议售价 ${c?.symbol || ''}${costResult.suggestedPrice.toFixed(2)} ${costSellCurrency}
毛利: ${c?.symbol || ''}${costResult.profit.toFixed(2)} ${costSellCurrency}
使用汇率: 1 ${costPurchaseCurrency} = ${costResult.rate?.toFixed(4)} ${costSellCurrency}

数据来源：绝世百宝箱 | 仅供参考`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField('cost');
      setTimeout(() => setCopiedField(null), 1500);
      trackEvent.custom('exchange-rate', 'cost_estimate');
    });
  };

  // ── Watch / Alert functions ──
  const addWatchItem = () => {
    const target = parseFloat(watchTarget);
    if (!target || target <= 0) return;
    const item: WatchItem = {
      id: `watch-${Date.now()}`,
      from: watchFrom,
      to: watchTo,
      targetRate: target,
      direction: watchDirection,
      note: watchNote,
      createdAt: Date.now(),
    };
    const updated = [item, ...watchItems].slice(0, 10);
    setWatchItems(updated);
    try { localStorage.setItem('exchange-rate-watch', JSON.stringify(updated)); } catch { /* empty */ }
    setWatchNote("");
    trackEvent.custom('exchange-rate', 'watch_local_save');
  };

  const removeWatchItem = (id: string) => {
    const updated = watchItems.filter(w => w.id !== id);
    setWatchItems(updated);
    try { localStorage.setItem('exchange-rate-watch', JSON.stringify(updated)); } catch { /* empty */ }
  };

  const clearWatchItems = () => {
    setWatchItems([]);
    try { localStorage.setItem('exchange-rate-watch', JSON.stringify([])); } catch { /* empty */ }
  };

  // Get current rate for a watch pair
  const getWatchCurrentRate = (from: string, to: string): number | null => {
    return getRate(from, to);
  };

  // Tab definitions
  const TABS: { key: TabKey; label: string; icon: typeof DollarSign }[] = [
    { key: 'converter', label: '汇率换算', icon: DollarSign },
    { key: 'multi-quote', label: '多币种报价', icon: Globe },
    { key: 'cost-estimate', label: '成本估算', icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">海外换汇与多币种报价助手</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Exchange Rate &amp; Multi-currency Quote Helper
          </p>
          <p className="text-gray-400 mt-1 text-xs">
            查询常用货币汇率，估算换汇金额、跨境成本和外贸报价。适用于海外生活、跨境收款、外贸报价和电商成本核算。
          </p>
        </div>

        {/* Disclaimer - top */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
          <p className="text-xs text-amber-800">
            <strong>免责声明：</strong>汇率数据仅供参考，实际换汇、收款和结算请以银行、支付平台或服务商最终成交价为准。
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-200 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); trackEvent.custom('exchange-rate', `tab_${tab.key}`); }}
                className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 1: CONVERTER */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'converter' && (
          <>
            {/* Quick amount buttons */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">快捷金额：</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => { setAmount(String(amt)); trackEvent.custom('exchange-rate', 'quick_amount'); }}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      amount === String(amt)
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:text-green-700'
                    }`}
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick currency buttons */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">常用币种：</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_CURRENCIES.map(code => {
                  const c = CURRENCIES.find(x => x.code === code);
                  return (
                    <button
                      key={code}
                      onClick={() => { setFromCurrency(code); trackEvent.custom('exchange-rate', 'quick_currency'); }}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        fromCurrency === code
                          ? 'bg-green-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:text-green-700'
                      }`}
                    >
                      {c?.flag} {code}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scenario quick entries */}
            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-2">常用场景：</p>
              <div className="flex flex-wrap gap-2">
                {SCENARIOS.map(s => (
                  <button
                    key={s.label}
                    onClick={() => { setFromCurrency(s.from); setToCurrency(s.to); trackEvent.custom('exchange-rate', 'scenario_click'); }}
                    className="px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
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
              {loading && !rateData && !useManualRate && (
                <div className="mb-4 bg-gray-50 rounded-xl p-4 text-center">
                  <RefreshCw className="w-5 h-5 text-gray-400 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">正在获取汇率数据...</p>
                </div>
              )}

              {/* Error with manual fallback */}
              {error && !rateData && (
                <div className="mb-4 bg-red-50 rounded-xl p-4 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700">{error}</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={fetchRates} className="text-sm text-red-600 hover:text-red-800 underline">
                        重新尝试
                      </button>
                      <button
                        onClick={() => setUseManualRate(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        使用手动汇率
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual rate toggle */}
              {useManualRate && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">手动汇率模式</span>
                  </div>
                  <p className="text-xs text-yellow-700 mb-2">手动输入，仅供本次计算。数据不会保存。</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={manualRate}
                      onChange={(e) => setManualRate(e.target.value)}
                      className={`${inputStyles} flex-1`}
                      placeholder={`1 ${fromCurrency} = ? ${toCurrency}`}
                      step="0.0001"
                    />
                    <button
                      onClick={() => { setUseManualRate(false); setManualRate(""); }}
                      className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              {/* Conversion form */}
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
                  disabled={(!rateData && !useManualRate) || loading}
                  className={`${buttonVariants.primary} flex-1`}
                >
                  转换
                </button>
                <button onClick={reset} className={buttonVariants.secondary}>
                  <RotateCcw className="w-4 h-4" />
                  重置
                </button>
              </div>

              {/* Result */}
              {result && (
                <div className="bg-green-50 rounded-xl p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-green-600">转换结果</p>
                      <p className="text-3xl font-bold text-green-900 mt-1">
                        {CURRENCIES.find((c) => c.code === toCurrency)?.symbol}
                        {result.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-green-500 mt-2">
                        {useManualRate ? '手动汇率' : '参考汇率'}: 1 {fromCurrency} = {result.rate.toFixed(4)} {toCurrency}
                      </p>
                      {useManualRate && (
                        <p className="text-xs text-yellow-600 mt-1">⚠ 手动输入，仅供本次计算</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-green-600">
                      <p>{amount} {fromCurrency}</p>
                      <p className="text-2xl font-bold text-green-900">= {result.amount.toFixed(2)} {toCurrency}</p>
                    </div>
                  </div>
                  {/* Copy buttons */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-green-200">
                    <button
                      onClick={() => copyText(`${amount} ${fromCurrency} = ${result.amount.toFixed(2)} ${toCurrency}`, 'result')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-white hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200"
                    >
                      {copiedField === 'result' ? <><Check className="w-3 h-3" /> 已复制</> : <><Copy className="w-3 h-3" /> 复制结果</>}
                    </button>
                    <button
                      onClick={() => copyText(`1 ${fromCurrency} = ${result.rate.toFixed(4)} ${toCurrency}`, 'rate')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-white hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200"
                    >
                      {copiedField === 'rate' ? <><Check className="w-3 h-3" /> 已复制</> : <><Copy className="w-3 h-3" /> 复制汇率</>}
                    </button>
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
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} stroke="#9ca3af" />
                          <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} stroke="#9ca3af" tickFormatter={(v: number) => v.toFixed(4)} />
                          <Tooltip
                            formatter={(value: unknown) => typeof value === 'number' ? value.toFixed(4) : String(value)}
                            labelFormatter={(label: unknown) => String(label)}
                            contentStyle={{ fontSize: 12, borderRadius: 8 }}
                          />
                          {currentRate && (
                            <ReferenceLine y={currentRate} stroke="#3b82f6" strokeDasharray="4 4"
                              label={{ value: `当前 ${currentRate.toFixed(4)}`, position: 'right', fontSize: 10, fill: '#3b82f6' }}
                            />
                          )}
                          <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
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

            {/* Common Rate Cards */}
            {rateData && (
              <div className={cardStyles.base + " mt-6"}>
                <div className="p-4 border-b border-gray-100">
                  <h2 className={cardStyles.header}>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    常用汇率卡片
                  </h2>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {COMMON_RATE_PAIRS.map(pair => {
                    const rate = getRate(pair.from, pair.to);
                    const fromC = CURRENCIES.find(c => c.code === pair.from);
                    const toC = CURRENCIES.find(c => c.code === pair.to);
                    return (
                      <div key={`${pair.from}-${pair.to}`} className="bg-gray-50 rounded-xl p-3 border border-gray-100 hover:border-green-200 transition-colors">
                        <p className="text-xs text-gray-500 mb-1">{pair.label}</p>
                        <p className="text-lg font-bold text-gray-900">
                          {rate ? rate.toFixed(4) : '—'}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">1 {fromC?.flag}{pair.from} = ? {toC?.flag}{pair.to}</p>
                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => { setFromCurrency(pair.from); setToCurrency(pair.to); setAmount('1000'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="flex-1 text-[10px] px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                          >
                            带入换算
                          </button>
                          <button
                            onClick={() => {
                              const target = rate ? (rate * 0.95).toFixed(4) : '';
                              setWatchFrom(pair.from);
                              setWatchTo(pair.to);
                              setWatchTarget(target);
                              setWatchDirection('below');
                              setActiveTab('converter');
                            }}
                            className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                            title="关注此汇率"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 2: MULTI-CURRENCY QUOTE */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'multi-quote' && (
          <div className={cardStyles.base}>
            <div className="p-4 border-b border-gray-100">
              <h2 className={cardStyles.header}>
                <Globe className="w-4 h-4 text-blue-600" />
                多币种报价生成
              </h2>
              <p className="text-xs text-gray-500 mt-1">输入基准金额和币种，选择目标币种，一键生成多币种报价表。适合外贸和跨境卖家快速给客户报价。</p>
            </div>
            <div className="p-4 space-y-4">
              {/* Base amount */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyles.field}>基准金额</label>
                  <input
                    type="number"
                    value={multiBaseAmount}
                    onChange={(e) => setMultiBaseAmount(e.target.value)}
                    className={`${inputStyles} text-xl font-bold`}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={labelStyles.field}>基准币种</label>
                  <select
                    value={multiBaseCurrency}
                    onChange={(e) => setMultiBaseCurrency(e.target.value)}
                    className={`${inputStyles} cursor-pointer`}
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target currencies */}
              <div>
                <label className={labelStyles.field}>选择目标币种（点击切换）</label>
                <div className="flex flex-wrap gap-2">
                  {['USD', 'CAD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'HKD', 'SGD', 'MYR', 'KRW', 'TWD'].map(code => {
                    const c = CURRENCIES.find(x => x.code === code);
                    const selected = multiTargetCurrencies.includes(code);
                    return (
                      <button
                        key={code}
                        onClick={() => toggleMultiTarget(code)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          selected
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-blue-50'
                        }`}
                      >
                        {c?.flag} {code}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Results table */}
              {multiQuoteResults.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">币种</th>
                        <th className="text-right py-2 px-3 text-gray-500 font-medium">汇率</th>
                        <th className="text-right py-2 px-3 text-gray-500 font-medium">折算金额</th>
                        <th className="text-right py-2 px-3 text-gray-500 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {multiQuoteResults.map(r => (
                        <tr key={r.code} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2.5 px-3">
                            <span className="mr-1">{r.flag}</span>
                            <span className="font-medium">{r.code}</span>
                            <span className="text-gray-400 ml-1 text-xs">{r.name}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-xs text-gray-500">
                            {r.rate ? r.rate.toFixed(4) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                            {r.amount ? `${r.symbol}${r.amount.toFixed(2)}` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {r.amount !== null && r.amount !== undefined && (
                              <button
                                onClick={() => {
                                  const amt = r.amount as number;
                                  navigator.clipboard.writeText(`${r.symbol}${amt.toFixed(2)} ${r.code}`);
                                  setMultiCopied(r.code);
                                  setTimeout(() => setMultiCopied(null), 1000);
                                }}
                                className="text-xs px-2 py-1 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-700 rounded transition-colors"
                              >
                                {multiCopied === r.code ? <><Check className="w-3 h-3 inline" /> 已复制</> : <><Copy className="w-3 h-3 inline" /> 复制</>}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Copy all */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={copyMultiQuoteTable}
                  className={`${buttonVariants.primary} flex-1`}
                >
                  {multiCopied === 'all' ? <><Check className="w-4 h-4" /> 已复制全部</> : <><Copy className="w-4 h-4" /> 复制全部报价表</>}
                </button>
              </div>

              {/* Link to Quote Sheet */}
              <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  需要生成正式报价单？复制结果后可前往{' '}
                  <Link href="/tools/documents/quotation" className="underline font-medium hover:text-blue-900">报价单工具</Link>
                  {' '}继续。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 3: COST ESTIMATION */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'cost-estimate' && (
          <div className={cardStyles.base}>
            <div className="p-4 border-b border-gray-100">
              <h2 className={cardStyles.header}>
                <Calculator className="w-4 h-4 text-purple-600" />
                跨境成本估算 & 建议售价
              </h2>
              <p className="text-xs text-gray-500 mt-1">输入采购价、运费、平台费、税费和目标利润率，自动计算建议售价。适合跨境电商和外贸报价参考。</p>
            </div>
            <div className="p-4 space-y-4">
              {/* Purchase price */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyles.field}>采购价</label>
                  <input
                    type="number"
                    value={costPurchasePrice}
                    onChange={(e) => setCostPurchasePrice(e.target.value)}
                    className={`${inputStyles} text-lg font-bold`}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={labelStyles.field}>采购币种</label>
                  <select
                    value={costPurchaseCurrency}
                    onChange={(e) => setCostPurchaseCurrency(e.target.value)}
                    className={`${inputStyles} cursor-pointer`}
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Shipping */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyles.field}>运费</label>
                  <input
                    type="number"
                    value={costShipping}
                    onChange={(e) => setCostShipping(e.target.value)}
                    className={`${inputStyles}`}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={labelStyles.field}>运费币种</label>
                  <select
                    value={costShippingCurrency}
                    onChange={(e) => setCostShippingCurrency(e.target.value)}
                    className={`${inputStyles} cursor-pointer`}
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Platform fee & Tax */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyles.field}>平台费 (%)</label>
                  <input
                    type="number"
                    value={costPlatformFee}
                    onChange={(e) => setCostPlatformFee(e.target.value)}
                    className={`${inputStyles}`}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className={labelStyles.field}>税费 (%)</label>
                  <input
                    type="number"
                    value={costTaxRate}
                    onChange={(e) => setCostTaxRate(e.target.value)}
                    className={`${inputStyles}`}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                </div>
              </div>

              {/* Profit margin & sell currency */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyles.field}>目标利润率 (%)</label>
                  <input
                    type="number"
                    value={costProfitMargin}
                    onChange={(e) => setCostProfitMargin(e.target.value)}
                    className={`${inputStyles}`}
                    placeholder="30"
                    min="0"
                    max="1000"
                    step="1"
                  />
                </div>
                <div>
                  <label className={labelStyles.field}>销售币种</label>
                  <select
                    value={costSellCurrency}
                    onChange={(e) => setCostSellCurrency(e.target.value)}
                    className={`${inputStyles} cursor-pointer`}
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result */}
              {costResult && (
                <div className="bg-purple-50 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-purple-900">成本估算结果</h3>
                    <span className="text-xs text-purple-500">
                      汇率: 1 {costPurchaseCurrency} = {costResult.rate?.toFixed(4)} {costSellCurrency}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between bg-white rounded-lg p-2.5">
                      <span className="text-gray-500">采购价</span>
                      <span className="font-medium">{CURRENCIES.find(c => c.code === costSellCurrency)?.symbol}{costResult.purchaseInSell.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between bg-white rounded-lg p-2.5">
                      <span className="text-gray-500">运费</span>
                      <span className="font-medium">{CURRENCIES.find(c => c.code === costSellCurrency)?.symbol}{costResult.shippingInSell.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between bg-white rounded-lg p-2.5">
                      <span className="text-gray-500">平台费 ({costPlatformFee}%)</span>
                      <span className="font-medium">{CURRENCIES.find(c => c.code === costSellCurrency)?.symbol}{(costResult.withPlatformFee - costResult.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between bg-white rounded-lg p-2.5">
                      <span className="text-gray-500">税费 ({costTaxRate}%)</span>
                      <span className="font-medium">{CURRENCIES.find(c => c.code === costSellCurrency)?.symbol}{(costResult.withTax - costResult.withPlatformFee).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between bg-white rounded-lg p-2.5 sm:col-span-2">
                      <span className="text-gray-500">总成本</span>
                      <span className="font-bold text-gray-900">{CURRENCIES.find(c => c.code === costSellCurrency)?.symbol}{costResult.withTax.toFixed(2)} {costSellCurrency}</span>
                    </div>
                  </div>

                  {/* Suggested price */}
                  <div className="bg-green-100 rounded-xl p-4 mt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700">建议售价（利润率 {costProfitMargin}%）</p>
                        <p className="text-3xl font-bold text-green-900 mt-1">
                          {CURRENCIES.find(c => c.code === costSellCurrency)?.symbol}{costResult.suggestedPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600">毛利</p>
                        <p className="text-xl font-bold text-green-800">
                          {CURRENCIES.find(c => c.code === costSellCurrency)?.symbol}{costResult.profit.toFixed(2)}
                        </p>
                        <p className="text-xs text-green-500">毛利率 {costResult.profitMargin.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Copy */}
                  <button
                    onClick={copyCostSummary}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {copiedField === 'cost' ? <><Check className="w-4 h-4" /> 已复制</> : <><Copy className="w-4 h-4" /> 复制成本摘要</>}
                  </button>
                </div>
              )}

              {!costResult && (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <Calculator className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">请输入采购价以查看成本估算结果</p>
                  {(!rateData && !useManualRate) && (
                    <p className="text-xs text-amber-600 mt-2">⚠ 汇率数据未加载，部分计算可能不可用</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* WATCH / ALERT SECTION (always visible) */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className={cardStyles.base + " mt-6"}>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className={cardStyles.header}>
              <Bell className="w-4 h-4 text-yellow-600" />
              汇率关注 & 目标价提醒
            </h2>
            {watchItems.length > 0 && (
              <button onClick={clearWatchItems} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> 清空
              </button>
            )}
          </div>
          <div className="p-4 space-y-4">
            {/* Add watch form */}
            <div className="bg-yellow-50 rounded-xl p-4 space-y-3">
              <p className="text-xs text-yellow-800 font-medium">设置汇率关注</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <select value={watchFrom} onChange={e => setWatchFrom(e.target.value)} className={`${inputStyles} text-sm`}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
                <select value={watchTo} onChange={e => setWatchTo(e.target.value)} className={`${inputStyles} text-sm`}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
                <input type="number" value={watchTarget} onChange={e => setWatchTarget(e.target.value)} className={`${inputStyles} text-sm`} placeholder="目标汇率" step="0.0001" />
                <select value={watchDirection} onChange={e => setWatchDirection(e.target.value as 'above' | 'below')} className={`${inputStyles} text-sm`}>
                  <option value="below">低于</option>
                  <option value="above">高于</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input type="text" value={watchNote} onChange={e => setWatchNote(e.target.value)} className={`${inputStyles} flex-1 text-sm`} placeholder="备注（可选，如：换汇时机）" />
                <button onClick={addWatchItem} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                  <BellRing className="w-3.5 h-3.5" /> 关注
                </button>
              </div>
              <p className="text-[10px] text-yellow-600">
                当前提醒仅保存在本机浏览器中。后续可登录同步到工作台。
              </p>
            </div>

            {/* Watch list */}
            {watchItems.length > 0 && (
              <div className="space-y-2">
                {watchItems.map(item => {
                  const currentRate = getWatchCurrentRate(item.from, item.to);
                  const fromC = CURRENCIES.find(c => c.code === item.from);
                  const toC = CURRENCIES.find(c => c.code === item.to);
                  const reached = currentRate && (
                    item.direction === 'below' ? currentRate <= item.targetRate : currentRate >= item.targetRate
                  );
                  return (
                    <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${reached ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-medium whitespace-nowrap">
                          {fromC?.flag} {item.from}→{toC?.flag} {item.to}
                        </span>
                        <span className="text-xs text-gray-500">
                          目标: {item.direction === 'below' ? '≤' : '≥'} {item.targetRate}
                        </span>
                        {currentRate && (
                          <span className={`text-xs font-medium ${reached ? 'text-green-600' : 'text-gray-400'}`}>
                            当前: {currentRate.toFixed(4)}
                          </span>
                        )}
                        {reached && <span className="text-xs text-green-600 font-medium">✓ 已达标</span>}
                        {item.note && <span className="text-xs text-gray-400 truncate hidden sm:inline">{item.note}</span>}
                      </div>
                      <button onClick={() => removeWatchItem(item.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {watchItems.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">暂无关注汇率，添加后会在本页显示当前汇率与目标对比。</p>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* DISCLAIMER (bottom) */}
        {/* ═══════════════════════════════════════════════════════ */}
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

        {/* Recent Conversions */}
        {recentConversions.length > 0 && (
          <div className={cardStyles.base + " mt-6"}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className={cardStyles.header}>
                <Clock className="w-4 h-4 text-gray-500" />
                最近换算
              </h2>
              <button
                onClick={() => { setRecentConversions([]); try { localStorage.removeItem('exchange-rate-recent'); } catch { /* empty */ } }}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> 清空
              </button>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {recentConversions.map((rc, i) => (
                  <button
                    key={i}
                    onClick={() => { setFromCurrency(rc.from); setToCurrency(rc.to); setAmount(rc.amount); setActiveTab('converter'); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-green-50 hover:text-green-700 rounded-lg text-sm text-gray-600 transition-colors border border-gray-200"
                  >
                    <span className="font-medium text-green-600">{rc.from}→{rc.to}</span>
                    <span className="text-xs text-gray-400">{rc.amount}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Related Tools */}
        <div className={cardStyles.base + " mt-6"}>
          <div className="p-4 border-b border-gray-100">
            <h2 className={cardStyles.header}>
              <Truck className="w-4 h-4 text-blue-600" />
              下一步推荐工具
            </h2>
            <p className="text-xs text-gray-500 mt-1">完成汇率换算后，你可以继续生成报价单、计算运费或制作商业发票。</p>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/tools/documents/quotation"
              onClick={() => trackEvent.custom('exchange-rate', 'click_related_quotation')}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-green-50 rounded-xl border border-gray-200 hover:border-green-200 transition-all">
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">报价单</p>
                <p className="text-xs text-gray-500">外贸报价参考</p>
              </div>
            </Link>
            <Link href="/tools/documents/commercial-invoice"
              onClick={() => trackEvent.custom('exchange-rate', 'click_related_commercial-invoice')}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-green-50 rounded-xl border border-gray-200 hover:border-green-200 transition-all">
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">商业发票</p>
                <p className="text-xs text-gray-500">跨境单据生成</p>
              </div>
            </Link>
            <Link href="/tools/shipping-calculator"
              onClick={() => trackEvent.custom('exchange-rate', 'click_related_shipping-calculator')}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-green-50 rounded-xl border border-gray-200 hover:border-green-200 transition-all">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">运费计算</p>
                <p className="text-xs text-gray-500">集运费用估算</p>
              </div>
            </Link>
            <Link href="/tools/quote-sheet"
              onClick={() => trackEvent.custom('exchange-rate', 'click_related_quote-sheet')}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-green-50 rounded-xl border border-gray-200 hover:border-green-200 transition-all">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">Quote Sheet</p>
                <p className="text-xs text-gray-500">专业报价表</p>
              </div>
            </Link>
            <Link href="/tools/address-formatter"
              onClick={() => trackEvent.custom('exchange-rate', 'click_related_address-formatter')}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-green-50 rounded-xl border border-gray-200 hover:border-green-200 transition-all">
              <span className="text-2xl">📝</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">地址格式化</p>
                <p className="text-xs text-gray-500">规范国际地址</p>
              </div>
            </Link>
            <Link href="/tools/unit-converter"
              onClick={() => trackEvent.custom('exchange-rate', 'click_related_unit-converter')}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-green-50 rounded-xl border border-gray-200 hover:border-green-200 transition-all">
              <span className="text-2xl">📏</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">单位换算</p>
                <p className="text-xs text-gray-500">重量/尺寸/体积</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Smart Contextual Interlinking */}
        <div className="mt-6">
          <SmartRelatedLinks tool="exchange-rate" country={fromCurrency} type="tool" layout="bottom" />
        </div>

        {/* Related Checklist */}
        <RelatedChecklistSection toolSlug="exchange-rate" sourcePath="exchange-rate" />

        {/* Task Chain Next Step */}
        <div className="mt-6">
          <TaskChainNextStep sourceTool="exchange-rate" steps={TASK_CHAIN_STEPS['exchange-rate']} />
        </div>

        {/* FAQ */}
        <FAQSection title="汇率换算常见问题" items={[
          {
            question: "汇率多久更新一次？",
            answer: "本站接入 ExchangeRate-API 的每日更新汇率数据，本站缓存约 30 分钟。实际更新时间以数据源返回为准。如需更实时更新的汇率，建议使用银行或持牌金融机构的实时汇率接口。",
          },
          {
            question: "为什么和银行的汇率不一样？",
            answer: "本站使用的是国际市场中间汇率（mid-market rate），银行实际交易时会在这个基础上加点差（spread）。例如中间汇率是 1 USD = 7.2 CNY，银行卖出价可能是 7.25，买入价可能是 7.15。本站汇率仅作为参考，实际交易请以银行报价为准。",
          },
          {
            question: "多币种报价表怎么用？",
            answer: "切换到「多币种报价」Tab，输入你的基准金额和币种，选择需要展示的目标币种，即可一键生成多币种报价表。适合外贸卖家快速给客户展示不同货币的价格。你可以复制全部报价表或单行结果。",
          },
          {
            question: "成本估算功能适合什么场景？",
            answer: "适合跨境电商卖家估算产品售价。输入采购价、运费、平台费（如亚马逊佣金）、税费和目标利润率，系统会自动换算币种并计算建议售价和毛利。帮助你快速判断产品定价是否合理。",
          },
          {
            question: "汇率关注功能会发通知吗？",
            answer: "当前版本仅在本机浏览器中保存你的关注汇率，并在页面上实时对比当前汇率与目标价。不会发送邮件或推送通知。登录同步和自动通知功能规划中。",
          },
          {
            question: "支持哪些货币？",
            answer: "当前支持 70+ 种全球法币，覆盖美元、人民币、加元、欧元、英镑、日元、澳元、港币、新加坡元、马来西亚林吉特等海外华人最常用币种。",
          },
          {
            question: "可以用这个汇率做跨境结算吗？",
            answer: "不建议。本站汇率仅供参考和学习使用，不构成任何金融建议或结算依据。跨境结算请使用银行、PayPal、Wise 等持牌金融机构提供的实时汇率。",
          },
          {
            question: "能看到汇率的历史走势吗？",
            answer: "可以。在「汇率换算」Tab 中点击「查看走势」按钮即可查看最近 30 天的汇率走势图，数据来源于欧洲央行（ECB）公开汇率。当前汇率以蓝色虚线标注在图表上，方便你对比历史水平。",
          },
        ]} />

        {/* Tool-specific ads */}
        <AdSlot placement="tool-exchange-rate-bottom" className="mt-8 mb-8" />
      </div>
    </div>
  );
}
