import { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import { FileText, Languages, FileSearch, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: buildTitle("AI 工具集"),
  description: "海外百宝箱 AI 工具集：AI 商品文案生成、多语言翻译润色、文档摘要提取。助力跨境电商、集运用户提升效率。",
  alternates: { canonical: buildCanonical("/ai-tools") },
  openGraph: {
    title: buildTitle("AI 工具集"),
    description: "AI 商品文案、翻译润色、文档摘要一键生成",
    url: buildCanonical("/ai-tools"),
  },
};

const AI_TOOLS = [
  {
    href: "/ai-tools/product-copy",
    icon: FileText,
    title: "AI 商品文案",
    desc: "一键生成多语言商品描述、Listing 文案，适配 Amazon、Shopee、Lazada 等平台规范。",
    tags: ["跨境电商", "商品描述", "Listing"],
    color: "teal",
  },
  {
    href: "/ai-tools/translate-polish",
    icon: Languages,
    title: "AI 翻译润色",
    desc: "智能翻译 + 母语级润色，让中文内容自然适配英文、日文、韩文等目标语言读者。",
    tags: ["多语言", "翻译", "润色"],
    color: "blue",
  },
  {
    href: "/ai-tools/document-summary",
    icon: FileSearch,
    title: "AI 文档摘要",
    desc: "上传 PDF/Word 文档，快速提取关键信息、要点摘要，适合合同、报告、说明书等长文档。",
    tags: ["文档处理", "摘要", "效率"],
    color: "purple",
  },
];

const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
  teal: { bg: "bg-teal-50 dark:bg-teal-900/20", icon: "text-teal-600 dark:text-teal-400", badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300" },
  blue: { bg: "bg-blue-50 dark:bg-blue-900/20", icon: "text-blue-600 dark:text-blue-400", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  purple: { bg: "bg-purple-50 dark:bg-purple-900/20", icon: "text-purple-600 dark:text-purple-400", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
};

export default function AiToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-purple-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
            <Sparkles className="w-4 h-4" /> AI 驱动 · 效率翻倍
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            AI 出海工具集
          </h1>
          <p className="text-lg text-purple-100/90 max-w-2xl leading-relaxed">
            专为跨境电商、集运用户、海外华人打造的 AI 效率工具。文案生成、翻译润色、文档摘要，一站式解决内容出海难题。
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-10 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {AI_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const c = colorMap[tool.color];
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group bg-white rounded-2xl border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div className={`p-5 ${c.bg} border-b border-gray-100`}>
                  <div className={`w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center mb-3 ${c.icon}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                    {tool.title}
                  </h2>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{tool.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tool.tags.map((tag) => (
                      <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-teal-600 group-hover:text-teal-700">
                    立即使用 <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Coming Soon */}
        <div className="mt-8 bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
          <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">更多 AI 工具正在路上…</p>
          <p className="text-xs text-gray-400 mt-1">AI 图片处理、智能客服话术、多语言 SEO 优化等</p>
        </div>
      </div>
    </div>
  );
}
