"use client";

import { useState } from "react";
import { Heart, ExternalLink, Star, Package, Truck, MapPin, FileText, Calculator, Globe } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/workspace/PageHeader";
import EmptyState from "@/components/workspace/EmptyState";

const TAB_CONFIG = [
  { key: "all", label: "全部", emoji: "📋" },
  { key: "tool", label: "常用工具", emoji: "🔧" },
  { key: "url", label: "常用网址", emoji: "🔗" },
];

// 推荐收藏工具
const RECOMMENDED_TOOLS = [
  { title: "运费计算器", desc: "国际快递运费对比", route: "/tools/shipping-calculator", icon: <Calculator className="w-5 h-5" /> },
  { title: "物流追踪", desc: "支持 17TRACK / DHL / FedEx", route: "/tracking", icon: <Truck className="w-5 h-5" /> },
  { title: "邮编查询", desc: "全球 200+ 国家邮编查询", route: "/tools/postal-code", icon: <MapPin className="w-5 h-5" /> },
  { title: "HS 编码", desc: "海关编码与税率参考", route: "/tools/hs-code", icon: <FileText className="w-5 h-5" /> },
  { title: "汇率换算", desc: "实时汇率，30+ 货币对", route: "/tools/exchange-rate", icon: <Calculator className="w-5 h-5" /> },
  { title: "资源中心", desc: "跨境工具与资源导航", route: "/resources", icon: <Globe className="w-5 h-5" /> },
];

export default function FavoritesClient({ favorites }: { favorites: any[] }) {
  const [filter, setFilter] = useState<"all" | "tool" | "url">("all");

  const filtered = filter === "all"
    ? favorites
    : filter === "tool"
      ? favorites.filter(f => f.resourceType === "tool")
      : favorites.filter(f => f.resourceType === "topic" || f.resourceType === "article");

  const counts = {
    all: favorites.length,
    tool: favorites.filter(f => f.resourceType === "tool").length,
    url: favorites.filter(f => f.resourceType === "topic" || f.resourceType === "article").length,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={<Heart className="w-5 h-5" />}
        title="我的收藏"
        description="收藏常用工具、专题和资源，方便下次快速打开"
      />

      {/* Filter tabs */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key 
                  ? "bg-teal-600 text-white" 
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.emoji} {tab.label} ({counts[tab.key as keyof typeof counts]})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <>
          <EmptyState
            icon={<Star className="w-8 h-8" />}
            title={filter === "tool" ? "还没有收藏任何工具" : filter === "url" ? "还没有收藏任何网址" : "还没有收藏任何资源"}
            description="浏览工具中心和专题库，点击收藏按钮即可添加。收藏的工具会出现在工作台，方便下次快速打开。"
            primaryAction={{ label: "去发现工具", href: "/tools" }}
            secondaryAction={{ label: "浏览资源中心", href: "/resources" }}
          />

          {/* 推荐收藏 */}
          <div className="mt-8">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              推荐收藏
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {RECOMMENDED_TOOLS.map(tool => (
                <Link
                  key={tool.route}
                  href={tool.route}
                  className="bg-white border border-gray-100 rounded-xl p-4 hover:border-teal-200 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 group-hover:text-teal-700 truncate">
                        {tool.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {tool.desc}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(fav => (
            <div key={fav.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-teal-200 hover:shadow-sm transition-all group">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl shrink-0">
                  {fav.resourceType === "topic" ? "📚" : fav.resourceType === "article" ? "📝" : "🔧"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-gray-900 group-hover:text-teal-700 truncate">
                    {fav.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {fav.resourceType} · {new Date(fav.createdAt).toLocaleDateString("zh-CN")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link 
                  href={fav.resourceUrl} 
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors"
                >
                  查看 <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
