"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wand2, Loader2, Copy, Check, Video, Sparkles, AlertCircle } from "lucide-react";
import { useFreemiumGate } from "@/hooks/use-freemium-gate";
import PaywallModal from "@/components/ui/paywall-modal";

interface GeneratedSop {
  hook: string;
  painPoint: string;
  solution: string;
  sellingPoints: string[];
  script: string;
  visualCues: string[];
  cta: string;
  hashtags: string[];
  postingTips: string;
}

const PLATFORMS = ["抖音", "TikTok", "小红书", "视频号", "快手", "YouTube Shorts", "Instagram Reels"];
const STYLES = ["口播带货", "剧情演绎", "产品测评", "开箱展示", "对比评测", "知识科普"];

export default function VideoScriptSopClient() {
  const router = useRouter();
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("");
  const [style, setStyle] = useState("");
  const [result, setResult] = useState<GeneratedSop | null>(null);
  const [rawResult, setRawResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const freemium = useFreemiumGate({
    limit: 2,
    storageKey: "video_sop_count",
  });

  // Try to parse raw result
  useEffect(() => {
    if (!rawResult) return;
    try {
      // Try to extract JSON from the response (might have markdown code fences)
      const jsonMatch = rawResult.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : rawResult;
      const parsed = JSON.parse(jsonStr.trim());
      setResult(parsed);
    } catch {
      // If JSON parse fails, show raw text
      setResult(null);
    }
  }, [rawResult]);

  const handleGenerate = useCallback(() => {
    freemium.handleProtectedAction(() => {
      doGenerate();
    });
  }, [freemium]);

  const doGenerate = async () => {
    if (!product.trim()) {
      setError("请输入产品或服务名称");
      return;
    }
    if (!audience.trim()) {
      setError("请输入目标受众");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setRawResult(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolType: "video_script_sop",
          input: {
            product: product.trim(),
            audience: audience.trim(),
            platform: platform || "抖音/TikTok/小红书",
            style: style || "口播带货",
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login?callbackUrl=/tools/video-script-sop";
          return;
        }
        setError(data.error || "生成失败，请稍后再试");
        return;
      }

      setRawResult(data.result);
    } catch {
      setError("网络错误，请检查网络连接后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!rawResult) return;
    navigator.clipboard.writeText(rawResult).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setProduct("");
    setAudience("");
    setPlatform("");
    setStyle("");
    setResult(null);
    setRawResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-teal-900/10">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/tools" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 min-h-[44px]">
              <ArrowLeft className="w-4 h-4" /> 返回
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Video className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">短视频 SOP 生成器</h1>
            </div>
          </div>
          {freemium.mounted && freemium.remaining > 0 && !document.cookie.includes("next-auth.session-token") && !document.cookie.includes("__Secure-next-auth.session-token") && (
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
              剩余免费 {freemium.remaining} 次
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span>产品与受众信息</span>
          </div>

          {/* Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              产品 / 服务名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="例如：便携式折叠水杯、AI 翻译耳机、海外仓一件代发服务"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              目标受众 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="例如：25-35 岁北美华人宝妈、东南亚跨境电商新手"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">发布平台</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(platform === p ? "" : p)}
                  className={`px-3 py-1.5 rounded-lg text-sm border min-h-[44px] transition-all ${
                    platform === p
                      ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/20"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-teal-400"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">视频风格</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(style === s ? "" : s)}
                  className={`px-3 py-1.5 rounded-lg text-sm border min-h-[44px] transition-all ${
                    style === s
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-emerald-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AI 正在生成爆款 SOP...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                生成爆款 SOP
              </>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-sm overflow-hidden">
            {/* Result Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/30">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                AI 生成结果
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors min-h-[44px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "已复制" : "复制"}
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Hook */}
              <div>
                <h3 className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">🎯 黄金钩子（前3秒）</h3>
                <p className="text-sm text-gray-900 dark:text-gray-100 bg-teal-50/50 dark:bg-teal-900/20 rounded-lg p-3">{result.hook}</p>
              </div>

              {/* Pain Point */}
              <div>
                <h3 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">😰 用户痛点</h3>
                <p className="text-sm text-gray-900 dark:text-gray-100 bg-red-50/50 dark:bg-red-900/20 rounded-lg p-3">{result.painPoint}</p>
              </div>

              {/* Solution */}
              <div>
                <h3 className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">💡 解决方案</h3>
                <p className="text-sm text-gray-900 dark:text-gray-100 bg-green-50/50 dark:bg-green-900/20 rounded-lg p-3">{result.solution}</p>
              </div>

              {/* Selling Points */}
              <div>
                <h3 className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">⭐ 核心卖点</h3>
                <ul className="space-y-1.5">
                  {result.sellingPoints?.map((sp, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                      {sp}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Script */}
              <div>
                <h3 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">📝 完整口播文案</h3>
                <div className="text-sm text-gray-900 dark:text-gray-100 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-4 whitespace-pre-wrap leading-relaxed">{result.script}</div>
              </div>

              {/* Visual Cues */}
              <div>
                <h3 className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">🎬 画面建议</h3>
                <ul className="space-y-1.5">
                  {result.visualCues?.map((vc, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-amber-500 shrink-0">▸</span>
                      {vc}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div>
                <h3 className="text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider mb-1">📢 行动号召（CTA）</h3>
                <p className="text-sm text-gray-900 dark:text-gray-100 bg-pink-50/50 dark:bg-pink-900/20 rounded-lg p-3 font-medium">{result.cta}</p>
              </div>

              {/* Hashtags */}
              <div>
                <h3 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1"># 推荐标签</h3>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags?.map((tag, i) => (
                    <span key={i} className="text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Posting Tips */}
              <div>
                <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">📋 发布注意事项</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 whitespace-pre-wrap">{result.postingTips}</p>
              </div>
            </div>
          </div>
        )}

        {/* Raw result fallback */}
        {rawResult && !result && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/30">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI 原始输出</span>
              <button onClick={handleCopy} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors min-h-[44px]">
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "已复制" : "复制"}
              </button>
            </div>
            <div className="p-6 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900/50 max-h-96 overflow-y-auto">
              {rawResult}
            </div>
          </div>
        )}

        {/* Reset */}
        {(result || rawResult) && (
          <button
            onClick={handleReset}
            className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            ← 重新生成
          </button>
        )}
      </main>

      {/* Freemium Paywall Modal */}
      <PaywallModal
        isOpen={freemium.showPaywall}
        onClose={() => freemium.setShowPaywall(false)}
        title="免费试用次数已用尽"
        description="您已使用 2 次免费 SOP 生成。登录解锁无限生成，或升级高级版解锁全部 AI 工具。"
        onLogin={() => { freemium.setShowPaywall(false); router.push("/login?callbackUrl=/tools/video-script-sop"); }}
        onUpgrade={() => { freemium.setShowPaywall(false); router.push("/pricing"); }}
      />
    </div>
  );
}
