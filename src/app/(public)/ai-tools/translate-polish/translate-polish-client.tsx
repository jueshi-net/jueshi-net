"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, AlertCircle, Copy, Check, Globe, Tag, TrendingUp, ExternalLink, ChevronRight, Home, Languages, PenTool, BookOpen } from "lucide-react";

import { AdSlot } from "@/components/ad-slot";
import ToolReviewPanel from "@/components/tools/tool-review-panel";

const TARGET_LANGS = ["中文", "英文"];
const STYLES = ["正式", "自然", "商务", "礼貌", "简洁"];

export default function TranslatePolishPage() {
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState("中文");
  const [style, setStyle] = useState("自然");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    if (!text.trim()) {
      setError("请输入需要翻译的文本");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolType: "translate_polish",
          input: { text: text.trim(), targetLang, style },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "翻译失败");
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
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-700 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-cyan-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-teal-100 mb-6 min-h-[44px]">
            <Link href="/" className="hover:text-white transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> 首页
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/ai-learning" className="hover:text-white transition-colors">AI 工具</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">翻译润色</span>
          </nav>

          <div className="max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                <Sparkles className="w-3.5 h-3.5" /> AI 翻译
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                <Globe className="w-3.5 h-3.5" /> 多语言
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                正式 / 商务 / 自然风格
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
              AI 翻译与润色
            </h1>
            <p className="text-lg text-teal-100/90 max-w-2xl leading-relaxed">
              智能翻译并润色文本，保留原意的同时让表达更地道、更专业。<br className="hidden md:block" />
              支持中英互译，提供正式、商务、自然等多种风格选择。
            </p>
          </div>
        </div>
      </div>

      {/* ===== USAGE INFO ===== */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Sparkles className="w-6 h-6 text-teal-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700">
              {usage ? (
                <>
                  今日剩余 <strong className="text-teal-600">{usage.remainingToday}</strong> 次
                  {usage.role === "guest" && "（游客每日限 1 次，登录获取更多次数）"}
                  {usage.role === "user" && "（注册用户每日限 3 次）"}
                  {usage.role === "member" && "（会员无限次使用）"}
                </>
              ) : (
                <>
                  游客每日 1 次，登录获取更多额度。翻译结果仅供参考，请根据实际情况修改。
                </>
              )}
            </p>
          </div>
          {!usage && (
            <Link href="/login" className="text-sm text-teal-600 hover:text-teal-700 font-medium whitespace-nowrap min-h-[44px] inline-flex items-center px-2">
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
                  <Languages className="w-5 h-5 text-teal-600" />
                  输入文本
                </h2>
                <p className="text-sm text-gray-500 mt-1">粘贴需要翻译或润色的文本，选择目标语言和风格</p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">原文 <span className="text-red-400">*</span></label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="例如：The meeting has been rescheduled to next Monday at 3 PM. Please update your calendar accordingly."
                    maxLength={2500}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{text.length}/2500</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">目标语言</label>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {TARGET_LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">风格</label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !text.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 active:bg-teal-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> 翻译中...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> 翻译润色</>
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
                  { icon: Languages, title: "跨语言沟通", desc: "邮件、文档、消息的智能翻译与润色" },
                  { icon: PenTool, title: "商务写作", desc: "正式商务信函、合同条款的地道表达" },
                  { icon: BookOpen, title: "学术翻译", desc: "论文摘要、文献综述的精准翻译" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.title} className="flex items-start gap-3 bg-white rounded-lg border p-4">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-teal-600" />
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
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  翻译结果
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
                    <p className="text-sm">AI 正在为您翻译和润色…</p>
                  </div>
                )}
                {!loading && !result && !error && (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                    <Sparkles className="w-12 h-12 mb-3" />
                    <p className="text-sm">输入文本后点击「翻译润色」</p>
                  </div>
                )}
                {result && (
                  <div className="space-y-4">
                    {result.translated && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">翻译</h3>
                        <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{result.translated}</p>
                      </div>
                    )}
                    {result.polished && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">润色版本</h3>
                        <p className="text-sm text-gray-800 bg-teal-50 border border-teal-100 rounded-lg p-3 whitespace-pre-wrap">{result.polished}</p>
                      </div>
                    )}
                    {result.notes && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">重点表达说明</h3>
                        <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3">{result.notes}</p>
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
                  <p className="mt-1">AI 翻译结果仅供参考，可能包含不准确或不完整的翻译。重要文件、法律合同、医疗资料等请专业译员审核后再使用。</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tool Reviews */}
        <ToolReviewPanel toolKey="translate-polish" isLoggedIn={typeof window !== 'undefined' && (document.cookie.includes('next-auth.session-token') || document.cookie.includes('__Secure-next-auth.session-token'))} />

        <AdSlot placement="tool-bottom" className="mt-8" variant="card" />
      </div>
    </div>
  );
}
