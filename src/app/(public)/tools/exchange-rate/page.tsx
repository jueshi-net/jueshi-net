"use client";
import { AdSlot } from '@/components/ad-slot';

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

const CURRENCIES = [
  { code: "USD", name: "美元", symbol: "$" },
  { code: "CNY", name: "人民币", symbol: "¥" },
  { code: "CAD", name: "加元", symbol: "C$" },
  { code: "EUR", name: "欧元", symbol: "€" },
  { code: "GBP", name: "英镑", symbol: "£" },
  { code: "AUD", name: "澳元", symbol: "A$" },
  { code: "NZD", name: "新西兰元", symbol: "NZ$" },
  { code: "JPY", name: "日元", symbol: "¥" },
  { code: "HKD", name: "港币", symbol: "HK$" },
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb />
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">汇率查询</h1>
          <p className="text-gray-500 mt-1">参考汇率转换，支持主流货币对</p>
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

          {/* Conversion form */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end mb-6">
            <div>
              <label className={labelStyles.field}>持有货币</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className={inputStyles}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                ))}
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`${inputStyles} mt-2 text-2xl font-bold`}
                placeholder="0.00"
              />
            </div>

            <button onClick={swap} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <ArrowLeftRight className="w-5 h-5 text-gray-600" />
            </button>

            <div>
              <label className={labelStyles.field}>目标货币</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className={inputStyles}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                ))}
              </select>
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
              <div className="grid grid-cols-3 gap-2 divide-y divide-gray-100">
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
