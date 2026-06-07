"use client";

import { Search } from "lucide-react";

export default function ToolEmptyState({ query }: { query?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">没有找到相关工具</h3>
      <p className="text-gray-500 text-sm max-w-xs mx-auto">
        {query ? `未找到与“${query}”匹配的结果，请尝试其他关键词` : "暂时没有可用工具，请稍后再看"}
      </p>
    </div>
  );
}
