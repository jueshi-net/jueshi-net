"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, AlertCircle, Copy, Check } from "lucide-react";

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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <Link href="/" className="inline-flex items-center gap-1 text-emerald-100 hover:text-white mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> 返回首页
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-3xl font-bold">AI 翻译润色</h1>
          </div>
          <p className="text-emerald-100">翻译并润色文本，保留原意，让表达更地道</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">原文</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="粘贴需要翻译或润色的文本..."
              rows={6}
              maxLength={2500}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <div className="text-xs text-gray-400 mt-1">{text.length}/2500</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">目标语言</label>
              <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {TARGET_LANGS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">风格</label>
              <select value={style} onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> 翻译中...</> : <><Sparkles className="w-5 h-5" /> 翻译润色</>}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">翻译结果</h2>
              <button onClick={copyResult} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                {copied ? <><Check className="w-4 h-4 text-green-500" /> 已复制</> : <><Copy className="w-4 h-4" /> 复制</>}
              </button>
            </div>

            {result.translated && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-400 mb-1">翻译</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{result.translated}</div>
              </div>
            )}

            {result.polished && (
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                <div className="text-xs text-emerald-600 mb-1">润色版本</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{result.polished}</div>
              </div>
            )}

            {result.notes && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-xs text-blue-600 mb-1">重点表达说明</div>
                <div className="text-sm text-gray-700">{result.notes}</div>
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

        <div className="text-center text-xs text-gray-400 py-4">
          AI 翻译结果仅供参考，重要文件请人工确认。
        </div>
      </div>
    </div>
  );
}
