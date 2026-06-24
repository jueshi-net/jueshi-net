"use client";

import { useState } from "react";
import { getToolContent, type ToolContent } from "@/lib/tool-content/tool-content-registry";

interface ToolContentSectionProps {
  toolSlug: string;
  toolName: string;
}

export default function ToolContentSection({ toolSlug, toolName }: ToolContentSectionProps) {
  const [activeTab, setActiveTab] = useState<"guide" | "faq" | "errors" | "examples">("guide");
  const content: ToolContent | null = getToolContent(toolSlug);

  if (!content) return null;

  const severityColors: Record<string, string> = {
    error: "bg-red-50 border-red-200 text-red-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  const hasExamples = content.examples && content.examples.length > 0;

  return (
    <div className="mt-6" data-testid="tool-content-section">
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          {content.guide.length > 0 && (
            <button
              onClick={() => setActiveTab("guide")}
              data-testid="tool-content-guide"
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "guide" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              📖 使用指南
            </button>
          )}
          {content.faq.length > 0 && (
            <button
              onClick={() => setActiveTab("faq")}
              data-testid="tool-content-faq"
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "faq" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              ❓ FAQ
            </button>
          )}
          {content.errors.length > 0 && (
            <button
              onClick={() => setActiveTab("errors")}
              data-testid="tool-content-errors"
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "errors" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              ⚠️ 常见错误
            </button>
          )}
          {hasExamples && (
            <button
              onClick={() => setActiveTab("examples")}
              data-testid="tool-content-examples"
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "examples" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              📝 示例
            </button>
          )}
        </div>

        <div className="p-5">
          {activeTab === "guide" && (
            <div className="space-y-3">
              {content.guide.map((g, i) => (
                <div key={i}>
                  <h4 className="font-semibold text-gray-800 mb-1">{g.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{g.content}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "faq" && (
            <div className="space-y-3">
              {content.faq.map((f, i) => (
                <div key={i} className="border-b pb-2 last:border-0">
                  <p className="font-medium text-gray-800 text-sm">Q: {f.q}</p>
                  <p className="text-sm text-gray-600 mt-1">A: {f.a}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "errors" && (
            <div className="space-y-3">
              {content.errors.map((e, i) => (
                <div key={i} className={`rounded-lg border p-3 ${severityColors[e.severity] || severityColors.info}`}>
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-sm mt-1 opacity-90">{e.desc}</p>
                  <p className="text-sm mt-1">💡 {e.solution}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "examples" && hasExamples && (
            <div className="space-y-3">
              {content.examples!.map((ex, i) => (
                <div key={i} className="border rounded-lg p-3 bg-gray-50">
                  <p className="font-medium text-sm text-gray-800">{ex.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{ex.description}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {Object.entries(ex.fields).map(([k, v]) => (
                      <div key={k} className="text-xs">
                        <span className="text-gray-400">{k}:</span>{" "}
                        <span className="text-gray-700 font-mono">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Resources */}
        {content.relatedResources && content.relatedResources.length > 0 && (
          <div className="border-t p-4" data-testid="tool-content-related-resources">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">📚 相关资源</h4>
            <div className="flex flex-wrap gap-2">
              {content.relatedResources.map((r, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Discussions */}
        {content.relatedDiscussions && (
          <div className="border-t p-4" data-testid="tool-content-related-discussions">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">💬 相关讨论</h4>
            <p className="text-xs text-gray-400">见下方社区讨论区</p>
          </div>
        )}
      </div>
    </div>
  );
}
