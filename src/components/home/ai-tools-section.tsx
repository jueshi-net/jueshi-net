"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, FileText, Languages, FileSearch } from "lucide-react";

const aiTools = [
  {
    title: "AI 商品文案",
    href: "/ai-tools/product-copy",
    icon: FileText,
    color: "from-purple-500 to-indigo-600",
    bg: "bg-purple-50",
    badge: "商家",
    desc: "输入商品信息，生成标题、五点描述、视频脚本",
  },
  {
    title: "AI 翻译润色",
    href: "/ai-tools/translate-polish",
    icon: Languages,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    badge: "通用",
    desc: "翻译文本并按风格润色，保留原意更地道",
  },
  {
    title: "AI 合同/文件摘要",
    href: "/ai-tools/document-summary",
    icon: FileSearch,
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50",
    badge: "华人/学生",
    desc: "粘贴合同或文件，快速获得中文摘要和风险提醒",
  },
];

export function AiToolsSection() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm mb-3">
            <Sparkles className="w-4 h-4" />
            站内 AI 工具
          </div>
          <h2 className="text-2xl font-bold text-gray-900">AI 帮你完成任务</h2>
          <p className="text-gray-500 mt-1">不跳转、不复制，直接在站内生成结果</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group ${tool.bg} rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center`}>
                  <tool.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs bg-white px-2 py-0.5 rounded text-gray-500">{tool.badge}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">{tool.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{tool.desc}</p>
              <div className="flex items-center gap-1 text-sm text-purple-600 font-medium">
                立即使用 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
