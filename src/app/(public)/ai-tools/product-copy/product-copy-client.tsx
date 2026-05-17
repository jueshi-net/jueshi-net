"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, AlertCircle, Copy, Check, Globe, Tag, TrendingUp, ExternalLink, ChevronRight, Home } from "lucide-react";

import { AdSlot } from "@/components/ad-slot";
import ToolReviewPanel from "@/components/tools/tool-review-panel";

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
      {/* ===== HERO ===== */}
      <div className="bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-purple-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-purple-100 mb-6 min-h-[44px]">
            <Link href="/" className="hover:text-white transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> 首页
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/ai-learning" className="hover:text-white transition-colors">AI 工具</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">商品文案</span>
          </nav>

          <div className="max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                <Sparkles className="w-3.5 h-3.5" /> AI 生成
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                <Globe className="w-3.5 h-3.5" /> 多语言
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                Amazon / TikTok / Shopify
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
              AI 商品文案生成器
            </h1>
            <p className="text-lg text-purple-100/90 max-w-2xl leading-relaxed">
              输入商品信息，一键生成标题、五点描述、视频脚本和 SEO 关键词。<br className="hidden md:block" />
              适合 Amazon、TikTok、Shopify、小红书等多平台运营。
            </p>
          </div>
        </div>
      </div>

      {/* ===== USAGE INFO ===== */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700">
              {usage ? (
                <>
                  今日剩余 <strong className="text-purple-600">{usage.remainingToday}</strong> 次
                  {usage.role === "guest" && "（游客每日限 1 次，登录获取更多次数）"}
                  {usage.role === "user" && "（注册用户每日限 3 次）"}
                  {usage.role === "member" && "（会员无限次使用）"}
                </>
              ) : (
                <>
                  游客每日 1 次，登录获取更多额度。生成结果仅供参考，请根据实际情况修改。
                </>
              )}
            </p>
          </div>
          {!usage && (
            <Link href="/login" className="text-sm text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap min-h-[44px] inline-flex items-center px-2">
              登录获取更多次数 <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* ===== INPUT + OUTPUT ===== */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-600" />
                  商品信息
                </h2>
                <p className="text-sm text-gray-500 mt-1">填写商品基本信息，AI 将自动生成多平台适配文案</p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">商品名称 <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="例如：无线蓝牙降噪耳机"
                    maxLength={100}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">{productName.length}/100</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">商品卖点 <span className="text-red-400">*</span></label>
                  <textarea
                    value={sellingPoints}
                    onChange={(e) => setSellingPoints(e.target.value)}
                    placeholder="描述商品的 3-5 个核心卖点，例如：主动降噪、40小时续航、轻量化设计"
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">{sellingPoints.length}/500</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">目标平台</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">输出语言</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !productName.trim() || !sellingPoints.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 active:bg-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> 生成中...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> 一键生成文案</>
                  )}
                </button>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Usage scenarios */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">适用场景</h3>
              <div className="space-y-3">
                {[
                  { icon: Tag, title: "电商上新", desc: "快速生成多平台商品文案，缩短上新周期" },
                  { icon: Globe, title: "多语言拓展", desc: "一键生成中英双语，降低翻译成本" },
                  { icon: TrendingUp, title: "SEO 优化", desc: "自动提取 SEO 关键词，提升搜索排名" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.title} className="flex items-start gap-3 bg-white rounded-lg border p-4">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">{s.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border shadow-sm min-h-[300px]">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  生成结果
                </h2>
                {result && (
                  <button
                    onClick={copyResult}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors min-h-[44px]"
                  >
                    {copied ? <><Check className="w-4 h-4 text-green-600" /> 已复制</> : <><Copy className="w-4 h-4" /> 复制</>}
                  </button>
                )}
              </div>
              <div className="p-5">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-3" />
                    <p className="text-sm">AI 正在为您生成文案…</p>
                  </div>
                )}
                {!loading && !result && !error && (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                    <Sparkles className="w-12 h-12 mb-3" />
                    <p className="text-sm">填写商品信息后点击「一键生成文案」</p>
                  </div>
                )}
                {result && (
                  <div className="space-y-4">
                    {result.title && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">商品标题</h3>
                        <p className="text-base font-bold text-gray-900 bg-gray-50 rounded-lg p-3">{result.title}</p>
                      </div>
                    )}
                    {result.bullets && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">五点描述</h3>
                        <ul className="space-y-2">
                          {result.bullets.map((b: string, i: number) => (
                            <li key={i} className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.videoScript && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">视频脚本思路</h3>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{result.videoScript}</p>
                      </div>
                    )}
                    {result.seoKeywords && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">SEO 关键词</h3>
                        <div className="flex flex-wrap gap-2">
                          {result.seoKeywords.map((k: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">{k}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.raw && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">原始输出</h3>
                        <pre className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap break-words font-sans">{result.raw}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">免责声明</p>
                  <p className="mt-1">AI 生成内容仅供参考，可能包含不准确或不完整的信息。正式发布前请务必人工审核，并遵守各平台的内容政策。</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tool Reviews */}
        <ToolReviewPanel toolKey="product-copy" isLoggedIn={typeof window !== 'undefined' && document.cookie.includes('next-auth')} />

        <AdSlot placement="tool-bottom" className="mt-8" variant="card" />
      </div>
    </div>
  );
}
