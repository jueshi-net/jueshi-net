"use client";

import { useState } from "react";
import { Heart, ExternalLink, Star, Package, Truck, MapPin, FileText, Calculator, Globe, Bookmark, Layers, Search, Zap, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { MetricCard } from "@/components/saas/MetricCard";
import { SectionCard } from "@/components/saas/SectionCard";
import { ActionCard } from "@/components/saas/ActionCard";
import { WorkspacePageHeader } from "@/components/saas/WorkspacePageHeader";
import { StatusBadge } from "@/components/saas/StatusBadge";
import { SaasEmptyState } from "@/components/saas/SaasEmptyState";

const TAB_CONFIG = [
  { key: "all", label: "全部", emoji: "📋" },
  { key: "tool", label: "常用工具", emoji: "🔧" },
  { key: "url", label: "常用网址", emoji: "🔗" },
];

// 推荐收藏工具
const RECOMMENDED_TOOLS = [
  { title: "运费计算器", desc: "国际快递运费对比", route: "/tools/shipping-calculator", icon: <Calculator className="w-5 h-5" />, badge: "热门" },
  { title: "物流追踪", desc: "支持 17TRACK / DHL / FedEx", route: "/tracking", icon: <Truck className="w-5 h-5" />, badge: "推荐" },
  { title: "邮编查询", desc: "全球 200+ 国家邮编查询", route: "/tools/postal-code", icon: <MapPin className="w-5 h-5" /> },
  { title: "HS 编码", desc: "海关编码与税率参考", route: "/tools/hs-code", icon: <FileText className="w-5 h-5" />, badge: "常用" },
  { title: "汇率换算", desc: "实时汇率，30+ 货币对", route: "/tools/exchange-rate", icon: <Calculator className="w-5 h-5" /> },
  { title: "资源中心", desc: "跨境工具与资源导航", route: "/resources", icon: <Globe className="w-5 h-5" /> },
];

// 工具分类图标映射
const TOOL_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  tool: <Zap className="w-4 h-4 text-amber-500" />,
  topic: <Star className="w-4 h-4 text-blue-500" />,
  article: <FileText className="w-4 h-4 text-green-500" />,
};

export default function FavoritesClient({ favorites }: { favorites: any[] }) {
  const [filter, setFilter] = useState<"all" | "tool" | "url">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = favorites.filter(f => {
    // Type filter
    if (filter === "tool" && f.resourceType !== "tool") return false;
    if (filter === "url" && f.resourceType !== "topic" && f.resourceType !== "article") return false;
    // Search filter
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      if (!f.title?.toLowerCase().includes(s) && !f.resourceUrl?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const counts = {
    all: favorites.length,
    tool: favorites.filter(f => f.resourceType === "tool").length,
    url: favorites.filter(f => f.resourceType === "topic" || f.resourceType === "article").length,
  };

  const toolCount = favorites.filter(f => f.resourceType === "tool").length;
  const urlCount = favorites.filter(f => f.resourceType === "topic" || f.resourceType === "article").length;

  // Recent favorites (last 7 days)
  const recentCount = favorites.filter(f => {
    const diff = Date.now() - new Date(f.createdAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="max-w-7xl mx-auto">
      <WorkspacePageHeader
        title="工具收藏中心"
        subtitle="收藏常用工具、专题和资源，方便下次快速打开"
        icon={<Heart className="w-5 h-5" />}
        breadcrumbs={[
          { label: '工作台', href: '/workspace' },
          { label: '我的收藏' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/tools" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Search className="w-3.5 h-3.5" /> 发现工具
            </Link>
            <Link href="/resources" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Globe className="w-3.5 h-3.5" /> 资源中心
            </Link>
          </div>
        }
      />

      <div className="px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="总收藏数"
            value={favorites.length}
            icon={<Heart className="w-5 h-5" />}
          />
          <MetricCard
            label="工具收藏"
            value={toolCount}
            icon={<Layers className="w-5 h-5" />}
          />
          <MetricCard
            label="网址收藏"
            value={urlCount}
            icon={<Bookmark className="w-5 h-5" />}
          />
          <MetricCard
            label="近7天新增"
            value={recentCount}
            icon={<TrendingUp className="w-5 h-5" />}
            trend={{ value: recentCount > 0 ? '活跃' : '—', positive: recentCount > 0 }}
          />
        </div>

        {/* Search + Filter */}
        <SectionCard title="我的收藏" subtitle="快速访问你收藏的工具和资源">
          <div className="space-y-3">
            {/* Search */}
            {favorites.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索收藏..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
              {TAB_CONFIG.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filter === tab.key
                      ? "bg-teal-600 text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.emoji} {tab.label} ({counts[tab.key as keyof typeof counts]})
                </button>
              ))}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  清除搜索
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-xs text-gray-500">
                找到 {filtered.length} 条匹配结果
              </p>
            )}
          </div>
        </SectionCard>

        {/* Favorites Grid or Empty */}
        {filtered.length === 0 ? (
          <>
            {searchTerm ? (
              <SaasEmptyState
                variant="no-results"
                title="未找到匹配的收藏"
                description="尝试其他搜索关键词"
              />
            ) : (
              <>
                <SaasEmptyState
                  variant="no-data"
                  title={filter === "tool" ? "还没有收藏任何工具" : filter === "url" ? "还没有收藏任何网址" : "还没有收藏任何资源"}
                  description="浏览工具中心和专题库，点击收藏按钮即可添加"
                  primaryAction={{ label: '去发现工具', href: '/tools' }}
                  secondaryAction={{ label: '浏览资源中心', href: '/resources' }}
                />

                {/* 推荐收藏 */}
                <SectionCard title="推荐收藏" subtitle="热门工具与资源，一键收藏">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {RECOMMENDED_TOOLS.map(tool => (
                      <ActionCard
                        key={tool.route}
                        title={tool.title}
                        description={tool.desc}
                        icon={tool.icon}
                        href={tool.route}
                        badge={tool.badge}
                      />
                    ))}
                  </div>
                </SectionCard>
              </>
            )}
          </>
        ) : (
          <SectionCard title={`收藏列表 (${filtered.length})`}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(fav => (
                <div key={fav.id} className="border border-gray-100 rounded-xl p-3.5 hover:border-teal-200 hover:shadow-sm transition-all group">
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      {TOOL_CATEGORY_ICONS[fav.resourceType] || <Star className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-gray-900 group-hover:text-teal-700 truncate">
                        {fav.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <StatusBadge
                          label={fav.resourceType === "tool" ? "工具" : fav.resourceType === "topic" ? "专题" : "文章"}
                          variant={fav.resourceType === "tool" ? "info" : "neutral"}
                          size="sm"
                        />
                        <span className="text-[10px] text-gray-400">
                          {new Date(fav.createdAt).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={fav.resourceUrl}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors"
                  >
                    查看 <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
