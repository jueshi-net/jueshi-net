"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, AlertCircle, Copy, Check, AlertTriangle } from "lucide-react";

const DOC_TYPES = ["租房合同", "工作邮件", "学校通知", "商务合同", "其他"];

export default function DocumentSummaryPage() {
  const [text, setText] = useState("");
  const [docType, setDocType] = useState("租房合同");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    if (!text.trim()) {
      setError("请粘贴需要分析的文档内容");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolType: "document_summary",
          input: { text: text.trim(), docType },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "分析失败");
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
      <div className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <Link href="/" className="inline-flex items-center gap-1 text-blue-100 hover:text-white mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> 返回首页
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-3xl font-bold">AI 合同/文件摘要助手</h1>
          </div>
          <p className="text-blue-100">粘贴文档内容，快速获得中文摘要、重点条款和风险提醒</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">文档内容</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="粘贴合同、邮件、通知等文本内容..."
              rows={8}
              maxLength={5000}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="text-xs text-gray-400 mt-1">{text.length}/5000</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">文档类型</label>
            <select value={docType} onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {DOC_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> 分析中...</> : <><Sparkles className="w-5 h-5" /> 生成摘要</>}
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
              <h2 className="font-semibold text-gray-900">分析结果</h2>
              <button onClick={copyResult} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                {copied ? <><Check className="w-4 h-4 text-green-500" /> 已复制</> : <><Copy className="w-4 h-4" /> 复制</>}
              </button>
            </div>

            {result.summary && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-400 mb-1">中文摘要</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{result.summary}</div>
              </div>
            )}

            {result.keyPoints && (
              <div>
                <div className="text-xs text-gray-400 mb-2">重点条款</div>
                <ul className="space-y-2">
                  {result.keyPoints.map((p: string, i: number) => (
                    <li key={i} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 flex gap-2">
                      <span className="text-blue-500 font-bold">{i + 1}.</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.risks && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <div className="text-xs text-amber-700 font-medium">风险提醒</div>
                </div>
                <ul className="space-y-1">
                  {result.risks.map((r: string, i: number) => (
                    <li key={i} className="text-sm text-amber-800 flex gap-2">
                      <span>•</span><span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.disclaimer && (
              <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-500">{result.disclaimer}</div>
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

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>免责声明：</strong>以上摘要和分析仅供参考，不构成法律建议。重要文件请咨询专业律师。
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 py-4">
          AI 不存储您的文档内容，分析仅用于当次生成。
        </div>
      </div>
    </div>
  );
}
