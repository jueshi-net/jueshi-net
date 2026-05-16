"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, AlertCircle, Copy, Check } from "lucide-react";

const PLATFORMS = ["Amazon", "TikTok", "Shopify", "小红书", "通用"];
const LANGUAGES = ["中文", "英文", "中英双语"];

export default function ProductCopyPage() {
  const [productName, setProductName] = useState("");
  const [sellingPoints, setSellingPoints] = useState("");
  const [platform, setPlatform] = useState("Amazon");
  const [language, setLanguage] = useState("中文");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    if (!productName.trim() || !sellingPoints.trim()) {
      setError("请填写商品名称和卖点");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolType: "product_copy",
          input: { productName: productName.trim(), sellingPoints: sellingPoints.trim(), platform, language },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "生成失败");
        return;
      }
      // Try to parse JSON result
      try {
        setResult(JSON.parse(data.result));
      } catch {
        setResult({ raw: data.result });
      }
      setUsage(data.usage);
    } catch {
      setError("请求失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (result) {
      const text = typeof result === "string" ? result : JSON.stringify(result, null, 2);
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <Link href="/" className="inline-flex items-center gap-1 text-purple-100 hover:text-white mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> 返回首页
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-3xl font-bold">AI 商品文案生成器</h1>
          </div>
          <p className="text-purple-100">输入商品信息，一键生成标题、五点描述、视频脚本和 SEO 关键词</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Input Form */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">商品名称</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="例如：无线蓝牙降噪耳机"
              maxLength={100}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">商品卖点</label>
            <textarea
              value={sellingPoints}
              onChange={(e) => setSellingPoints(e.target.value)}
              placeholder="描述商品的主要特点和优势..."
              rows={4}
              maxLength={1500}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <div className="text-xs text-gray-400 mt-1">{sellingPoints.length}/1500</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">目标平台</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">输出语言</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> 生成中...</> : <><Sparkles className="w-5 h-5" /> 生成文案</>}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">生成结果</h2>
              <button onClick={copyResult} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                {copied ? <><Check className="w-4 h-4 text-green-500" /> 已复制</> : <><Copy className="w-4 h-4" /> 复制</>}
              </button>
            </div>

            {result.title && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-400 mb-1">商品标题</div>
                <div className="font-medium text-gray-900">{result.title}</div>
              </div>
            )}

            {result.bullets && (
              <div>
                <div className="text-xs text-gray-400 mb-2">五点描述</div>
                <ul className="space-y-2">
                  {result.bullets.map((b: string, i: number) => (
                    <li key={i} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.videoScript && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-400 mb-1">短视频脚本</div>
                <div className="text-sm text-gray-700">{result.videoScript}</div>
              </div>
            )}

            {result.seoKeywords && (
              <div>
                <div className="text-xs text-gray-400 mb-2">SEO 关键词</div>
                <div className="flex flex-wrap gap-2">
                  {result.seoKeywords.map((k: string, i: number) => (
                    <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{k}</span>
                  ))}
                </div>
              </div>
            )}

            {result.raw && (
              <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">{result.raw}</pre>
            )}

            {usage && (
              <div className="text-xs text-gray-400 pt-2 border-t">
                今日剩余：{usage.remainingToday ?? "∞"} 次 | 消耗积分：{usage.pointsUsed}
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-center text-xs text-gray-400 py-4">
          AI 生成内容仅供参考，请根据实际情况调整。避免使用夸大或违规广告词。
        </div>
      </div>
    </div>
  );
}
