"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Eye, Heart, FileCheck, Sparkles, ArrowRight, FileText, Package, Tag, Receipt, Truck, Shield, Send, Calculator, CreditCard, Clipboard, Hash, DollarSign, Container, MapPin, QrCode, Video, Image as ImageIcon, Type, Languages, Palette, Music, Camera, Globe, Phone, Mail, Clock, Calendar, TrendingUp, BarChart3, PieChart, Activity, Zap, Target, Award, BookOpen, GraduationCap, Briefcase, ShoppingBag, Store, Landmark, Scale, Wrench, Settings, Filter, Search, Download, Upload, Share2, Link2, Copy, Scissors, Archive, FolderOpen, FileIcon, Files, FileSpreadsheet, FileBarChart, FilePieChart, FileLineChart } from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { ToolCenterItem } from "@/lib/tool-center";

// Icon mapping: Lucide icon name → component
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, Package, Tag, Receipt, Truck, Shield, Send, Calculator, CreditCard, Clipboard,
  Hash, DollarSign, Container, MapPin, QrCode, Video, ImageIcon, Type, Languages,
  Palette, Music, Camera, Globe, Phone, Mail, Clock, Calendar, TrendingUp, BarChart3,
  PieChart, Activity, Zap, Target, Award, BookOpen, GraduationCap, Briefcase,
  ShoppingBag, Store, Landmark, Scale, Wrench, Settings, Filter, Search, Download,
  Upload, Share2, Link2, Copy, Scissors, Archive, FolderOpen, FileIcon, Files,
  FileSpreadsheet, FileBarChart, FilePieChart, FileLineChart, Sparkles, FileCheck,
};

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

  // Render icon: handle both emoji strings and Lucide icon names
  const renderIcon = () => {
    if (!tool.icon) {
      // Fallback based on category
      if (tool.category === 'documents') return <FileCheck className="w-5 h-5" />;
      if (tool.category === 'ai_content') return <Sparkles className="w-5 h-5" />;
      return <span className="text-lg font-bold">{tool.name.charAt(0)}</span>;
    }

    // Check if it's an emoji (single character or contains emoji patterns)
    const isEmoji = tool.icon.length <= 4 && /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(tool.icon);
    
    if (isEmoji) {
      return <span className="text-xl">{tool.icon}</span>;
    }

    // Try to map Lucide icon name
    const IconComponent = iconMap[tool.icon];
    if (IconComponent) {
      return <IconComponent className="w-5 h-5" />;
    }

    // Fallback: show first letter
    return <span className="text-lg font-bold">{tool.name.charAt(0)}</span>;
  };

  return (
    <div className="group relative flex flex-col p-5 bg-white border border-gray-200/60 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-400/50 transition-all duration-300 h-full overflow-hidden">
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50/50 group-hover:via-purple-50/30 group-hover:to-pink-50/20 transition-all duration-500 pointer-events-none" />
      
      {/* Header */}
      <div className="relative flex items-start gap-3 mb-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white transition-all duration-300 flex-shrink-0 shadow-sm group-hover:shadow-lg group-hover:shadow-blue-500/30 group-hover:scale-110">
          {renderIcon()}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
            {tool.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[2.5em] leading-relaxed">
            {tool.description || "暂无描述"}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="relative flex flex-wrap gap-1.5 mb-4">
        {isNew && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] rounded-full font-medium shadow-sm">
            <Sparkles className="w-2.5 h-2.5" />
            已上线
          </span>
        )}
        {isHot && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] rounded-full font-medium shadow-sm">
            🔥 热门
          </span>
        )}
      </div>

      {/* Metrics */}
      <div className="relative flex items-center gap-3 mt-auto pt-4 border-t border-gray-100 text-[11px] text-gray-500">
        <span className="flex items-center gap-1 hover:text-blue-600 transition-colors" title={`Views: ${metrics.views}, Clicks: ${metrics.clicks}`}>
          <Eye className="w-3.5 h-3.5" />
          {metrics.views + metrics.clicks > 0 ? (metrics.views + metrics.clicks).toLocaleString() : "-"}
        </span>
        <span className="flex items-center gap-1 hover:text-blue-600 transition-colors" title="Saves">
          <FileCheck className="w-3.5 h-3.5" />
          {metrics.saves > 0 ? metrics.saves : "-"}
        </span>
        <span className="flex items-center gap-1 hover:text-blue-600 transition-colors" title="Favorites">
          <Heart className="w-3.5 h-3.5" />
          {favorites > 0 ? favorites : "-"}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {review.count > 0 ? (
            <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              {review.avg.toFixed(1)}
            </span>
          ) : (
            <span className="text-gray-300 text-[10px]">暂无评分</span>
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleClick}
        className="relative mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-sm font-semibold rounded-xl group-hover:from-blue-600 group-hover:to-blue-700 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-blue-500/30 group-hover:scale-[1.02]"
      >
        立即使用 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
      </button>
    </div>
  );
}
