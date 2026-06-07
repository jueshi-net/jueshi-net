"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Eye, Heart, FileCheck, Sparkles, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { ToolCenterItem } from "@/lib/tool-center";

interface ToolCardProps {
  tool: ToolCenterItem;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const router = useRouter();

  const handleClick = () => {
    // Fire tracking
    trackEvent("Tool_Click", {
      toolSlug: tool.slug,
      toolName: tool.name,
      source: "tool_center",
    });
    
    // Navigate
    if (tool.route) {
      router.push(tool.route);
    }
  };

  const { metrics, favorites, review } = tool;
  const score = tool.score;

  // Determine tags
  const isNew = tool.isNew;
  const isHot = score > 50;
  // Removed "isSaved = favorites > 0" because favorites > 0 means *someone* favorited it, not the current user.
  // Without user context, we cannot show "已收藏".

  return (
    <div className="group flex flex-col p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all duration-200 h-full">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors flex-shrink-0">
           {/* Simple icon fallback or dynamic import if needed, for now generic icon based on category */}
           {tool.category === 'documents' ? <FileCheck className="w-5 h-5" /> : 
            tool.category === 'ai-content' ? <Sparkles className="w-5 h-5" /> : 
            <span className="text-lg font-bold">{tool.name.charAt(0)}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {tool.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 min-h-[2.5em]">
            {tool.description || "暂无描述"}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {isNew && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-medium">已上线</span>}
        {isHot && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded font-medium">热门</span>}
        {/* Removed "已收藏" tag. It incorrectly showed when ANY user favorited the tool. */}
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-100 text-[11px] text-gray-500">
        <span className="flex items-center gap-1" title={`Views: ${metrics.views}, Clicks: ${metrics.clicks}`}>
          <Eye className="w-3 h-3" />
          {metrics.views + metrics.clicks > 0 ? (metrics.views + metrics.clicks).toLocaleString() : "-"}
        </span>
        <span className="flex items-center gap-1" title="Saves">
          <FileCheck className="w-3 h-3" />
          {metrics.saves > 0 ? metrics.saves : "-"}
        </span>
        <span className="flex items-center gap-1" title="Favorites">
          <Heart className="w-3 h-3" />
          {favorites > 0 ? favorites : "-"}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {review.count > 0 ? (
            <span className="flex items-center gap-0.5 text-orange-500 font-medium">
              <Star className="w-3 h-3 fill-current" />
              {review.avg.toFixed(1)}
            </span>
          ) : (
            <span className="text-gray-300">暂无评分</span>
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleClick}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"
      >
        立即使用 <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}
