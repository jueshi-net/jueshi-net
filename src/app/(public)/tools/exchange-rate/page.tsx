"use client";

import { useState, useEffect } from "react";
import { ArrowLeftRight, RotateCcw, DollarSign, AlertTriangle, RefreshCw, Info } from "lucide-react";

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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">汇率查询</h1>
          <p className="text-gray-500 mt-1">参考汇率转换，支持主流货币对</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">持有货币</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                ))}
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl font-bold"
                placeholder="0.00"
              />
            </div>

            <button onClick={swap} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <ArrowLeftRight className="w-5 h-5 text-gray-600" />
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">目标货币</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={convert}
              disabled={!rateData || loading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              转换
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
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
              <div className="grid grid-cols-3 gap-2">
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
      </div>
    </div>
  );
}
