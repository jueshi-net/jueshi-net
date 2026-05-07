"use client";

import { useState } from "react";
import { ArrowLeftRight, RotateCcw, DollarSign } from "lucide-react";

const currencies = [
  { code: "USD", name: "美元", symbol: "$", rate: 7.2444 },
  { code: "EUR", name: "欧元", symbol: "€", rate: 7.8921 },
  { code: "GBP", name: "英镑", symbol: "£", rate: 9.1234 },
  { code: "JPY", name: "日元", symbol: "¥", rate: 0.0483 },
  { code: "CNY", name: "人民币", symbol: "¥", rate: 1.0 },
  { code: "HKD", name: "港币", symbol: "HK$", rate: 0.9283 },
  { code: "KRW", name: "韩元", symbol: "₩", rate: 0.0054 },
  { code: "AUD", name: "澳元", symbol: "A$", rate: 4.7123 },
  { code: "CAD", name: "加元", symbol: "C$", rate: 5.2345 },
  { code: "SGD", name: "新元", symbol: "S$", rate: 5.4321 },
];

export default function ExchangeRatePage() {
  const [amount, setAmount] = useState("1000");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("CNY");
  const [result, setResult] = useState<{ amount: number; rate: number } | null>(null);

  const convert = () => {
    const amt = parseFloat(amount) || 0;
    const from = currencies.find((c) => c.code === fromCurrency)!;
    const to = currencies.find((c) => c.code === toCurrency)!;

    // Convert via CNY
    const inCNY = amt * from.rate;
    const converted = inCNY / to.rate;
    const rate = from.rate / to.rate;

    setResult({ amount: converted, rate });
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">汇率查询</h1>
          <p className="text-gray-500 mt-1">实时汇率转换，支持主流货币对</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">持有货币</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currencies.map((c) => (
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

            <button
              onClick={swap}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <ArrowLeftRight className="w-5 h-5 text-gray-600" />
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">目标货币</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={convert}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
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

          {result && (
            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">转换结果</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {currencies.find((c) => c.code === toCurrency)?.symbol}
                    {result.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-green-500 mt-2">
                    汇率: 1 {fromCurrency} = {result.rate.toFixed(4)} {toCurrency}
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
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">常用汇率 (对CNY)</h3>
            <div className="grid grid-cols-3 gap-2">
              {currencies.filter((c) => c.code !== "CNY").map((c) => (
                <div key={c.code} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">{c.code}</p>
                  <p className="text-lg font-bold text-gray-900">{c.rate.toFixed(4)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
