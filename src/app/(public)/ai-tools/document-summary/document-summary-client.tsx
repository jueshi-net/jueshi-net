"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles, Loader2, AlertCircle, Copy, Check,
  AlertTriangle, FileText, ShieldCheck, BookOpen,
  ChevronRight, Home, ExternalLink, Scale,
  FileCheck, Eye,
} from "lucide-react";
import { AdSlot } from "@/components/ad-slot";
import ToolReviewPanel from "@/components/tools/tool-review-panel";

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
      const t = typeof result === "string" ? result : JSON.stringify(result, null, 2);
      navigator.clipboard.writeText(t);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO ===== */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-orange-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-amber-100 mb-6 min-h-[44px]">
            <Link href="/" className="hover:text-white transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> 首页
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/ai-learning" className="hover:text-white transition-colors">AI 工具</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">文档摘要</span>
          </nav>

          <div className="max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                <Sparkles className="w-3.5 h-3.5" /> AI 摘要
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                <FileText className="w-3.5 h-3.5" /> 合同分析
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                <AlertTriangle className="w-3.5 h-3.5" /> 风险提醒
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
              AI 合同/文件摘要助手
            </h1>
            <p className="text-lg text-amber-100/90 max-w-2xl leading-relaxed">
              粘贴合同、邮件、通知等文档内容，AI 快速提取中文摘要、重点条款和风险提醒。<br className="hidden md:block" />
              租房合同、商务协议、工作邮件都能轻松搞定。
            </p>
          </div>
        </div>
      </div>

      {/* ===== USAGE INFO ===== */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700">
              {usage ? (
                <>
                  今日剩余 <strong className="text-amber-600">{usage.remainingToday}</strong> 次
                  {usage.role === "guest" && "（游客每日限 1 次，登录获取更多次数）"}
                  {usage.role === "user" && "（注册用户每日限 3 次）"}
                  {usage.role === "member" && "（会员无限次使用）"}
                </>
              ) : (
                <>
                  游客每日 1 次，登录获取更多额度。分析结果仅供参考，重要文件请咨询专业人士。
                </>
              )}
            </p>
          </div>
          {!usage && (
            <Link href="/login" className="text-sm text-amber-600 hover:text-amber-700 font-medium whitespace-nowrap min-h-[44px] inline-flex items-center px-2">
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
                  <FileText className="w-5 h-5 text-amber-600" />
                  文档内容
                </h2>
                <p className="text-sm text-gray-500 mt-1">粘贴合同、邮件、通知等文本，AI 将自动分析并提取关键信息</p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">文档内容 <span className="text-red-400">*</span></label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="粘贴合同、邮件、通知等文本内容..."
                    rows={8}
                    maxLength={5000}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{text.length}/5000</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">文档类型</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {DOC_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !text.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 active:bg-amber-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> 分析中...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> 生成摘要</>
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
                  { icon: FileCheck, title: "合同审查", desc: "快速提取合同关键条款，识别潜在风险点" },
                  { icon: Eye, title: "长文速览", desc: "冗长文档一键生成摘要，节省阅读时间" },
                  { icon: ShieldCheck, title: "风险预警", desc: "自动识别不公平条款和隐藏风险" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.title} className="flex items-start gap-3 bg-white rounded-lg border p-4">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-amber-600" />
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
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  分析结果
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
                    <p className="text-sm">AI 正在为您分析文档…</p>
                  </div>
                )}
                {!loading && !result && !error && (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                    <FileText className="w-12 h-12 mb-3" />
                    <p className="text-sm">粘贴文档内容后点击「生成摘要」</p>
                  </div>
                )}
                {result && (
                  <div className="space-y-4">
                    {/* Summary */}
                    {result.summary && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-amber-600" /> 中文摘要
                        </h3>
                        <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 leading-relaxed whitespace-pre-wrap">{result.summary}</div>
                      </div>
                    )}

                    {/* Key Points */}
                    {result.keyPoints && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                          <FileCheck className="w-4 h-4 text-amber-600" /> 重点条款
                        </h3>
                        <ul className="space-y-2">
                          {result.keyPoints.map((p: string, i: number) => (
                            <li key={i} className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 flex gap-2">
                              <span className="text-amber-600 font-bold flex-shrink-0">{i + 1}.</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risks */}
                    {result.risks && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-semibold text-amber-700">风险提醒</span>
                        </div>
                        <ul className="space-y-1.5">
                          {result.risks.map((r: string, i: number) => (
                            <li key={i} className="text-sm text-amber-800 flex gap-2">
                              <span className="flex-shrink-0">⚠</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Disclaimer from result */}
                    {result.disclaimer && (
                      <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-500">{result.disclaimer}</div>
                    )}

                    {/* Raw output */}
                    {result.raw && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">原始输出</h3>
                        <pre className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap break-words font-sans max-h-96 overflow-auto">{result.raw}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Scale className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">免责声明</p>
                  <p className="mt-1">AI 生成的摘要和分析仅供参考，不构成任何形式的法律建议或专业意见。重要合同、协议等文件请务必咨询执业律师或其他相关专业人士。AI 可能遗漏关键条款或产生误判，使用者应自行承担审核责任。</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Related Links ===== */}
        <div className="mt-10">
          <h3 className="text-sm font-bold text-gray-900 mb-4">相关工具</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: "/ai-tools/product-copy", title: "商品文案生成", desc: "AI 生成多平台电商文案" },
              { href: "/ai-learning", title: "AI 学习中心", desc: "了解更多 AI 工具用法" },
              { href: "/", title: "返回首页", desc: "浏览更多功能" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block bg-white rounded-xl border p-4 hover:border-amber-300 hover:shadow-md transition-all group"
              >
                <h4 className="font-semibold text-sm text-gray-900 group-hover:text-amber-700 transition-colors">{link.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Tool Reviews */}
        <ToolReviewPanel toolKey="document-summary" isLoggedIn={typeof window !== 'undefined' && document.cookie.includes('next-auth')} />

        <AdSlot placement="tool-bottom" className="mt-8" variant="card" />
      </div>
    </div>
  );
}
