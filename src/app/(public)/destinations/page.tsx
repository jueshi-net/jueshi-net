import Link from "next/link";
import { ArrowRight, Globe, FileText, Package, MapPin, DollarSign, Sparkles, ChevronRight } from "lucide-react";
import { REGION_GROUPS, getAllDestinationsActive } from "@/lib/destinations-db";
import { buildCanonical, buildTitle } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: buildTitle("全球出海市场大盘"),
  description: "按地区浏览专题与工具 — 北美、欧洲、东南亚、日韩、拉美、中东、澳洲，一站式出海解决方案。",
  alternates: { canonical: buildCanonical("/destinations") },
  openGraph: {
    title: buildTitle("全球出海市场大盘"),
    description: "按地区浏览专题与工具 — 北美、欧洲、东南亚、日韩、拉美、中东、澳洲，一站式出海解决方案。",
    url: buildCanonical("/destinations"),
  },
};

const TOP_TOOLS = [
  { key: "commercial-invoice", titleZh: "商业发票", emoji: "🧾", href: "/tools/documents/commercial-invoice", Icon: FileText, color: "text-teal-600 bg-teal-50" as const },
  { key: "packing-list", titleZh: "装箱单", emoji: "📦", href: "/tools/documents/packing-list", Icon: Package, color: "text-blue-600 bg-blue-50" as const },
  { key: "shipping-label", titleZh: "唛头标签", emoji: "📌", href: "/tools/documents/shipping-label", Icon: MapPin, color: "text-amber-600 bg-amber-50" as const },
  { key: "exchange-rate", titleZh: "汇率换算", emoji: "💱", href: "/tools/exchange-rate", Icon: DollarSign, color: "text-orange-600 bg-orange-50" as const },
];

export default async function DestinationsIndexPage() {
  let destinations: Awaited<ReturnType<typeof getAllDestinationsActive>> = [];
  try {
    destinations = await getAllDestinationsActive();
  } catch {
    // DB unreachable during build — render with empty state
  }
  const destMap = new Map(destinations.map(d => [d.slug, d]));
  const totalCountries = destinations.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO ===== */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-800 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-14 md:pt-16 md:pb-20">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
              <Globe className="w-3.5 h-3.5" /> 全球覆盖
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            🌐 全球出海市场大盘
          </h1>

          <p className="text-lg md:text-xl text-indigo-100/90 max-w-2xl leading-relaxed">
            按地区浏览专题与工具 — 覆盖 {totalCountries} 个国家/地区，{REGION_GROUPS.length} 大出海区域
          </p>
        </div>
      </div>

      {/* ===== REGION GRID ===== */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {REGION_GROUPS.map(group => {
            const availableCountries = group.slugs
              .map(slug => destMap.get(slug))
              .filter(Boolean);
            const count = availableCountries.length;
            const firstTwo = availableCountries.slice(0, 3);

            return (
              <div
                key={group.key}
                className="bg-white rounded-xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-md hover:border-gray-200 transition-all"
              >
                {/* Region header */}
                <div className="p-4 pb-3 border-b border-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{group.emoji}</span>
                    <h2 className="text-sm font-bold text-gray-900">{group.label}</h2>
                  </div>
                  <p className="text-xs text-gray-400">{group.description}</p>
                </div>

                {/* Countries list */}
                <div className="p-3 pt-2">
                  {firstTwo.length > 0 ? (
                    <div className="space-y-1.5">
                      {firstTwo.map(dest => (
                        <Link
                          key={dest!.slug}
                          href={`/destinations/${dest!.slug}`}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group min-h-[44px]"
                        >
                          <span className="text-base">{dest!.emoji}</span>
                          <span className="text-xs font-medium text-gray-700 group-hover:text-purple-700 transition-colors">{dest!.name}</span>
                          <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-purple-500 transition-colors ml-auto" />
                        </Link>
                      ))}
                      {count > 3 && (
                        <div className="text-[10px] text-gray-300 px-2 py-1 text-center">
                          +{count - 3} 个国家即将上线
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-300 px-2 py-1 text-center">
                      即将上线
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-3 pb-2 pt-0.5">
                  <span className="text-[10px] text-gray-300">{count} 个专题</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== TOP TOOLS ===== */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">常用工具箱</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">精选最高频的出海工具，即点即用</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TOP_TOOLS.map(tool => (
            <Link
              key={tool.key}
              href={tool.href}
              className="group bg-white rounded-xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-gray-200 transition-all p-4 flex flex-col items-center text-center gap-2"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tool.color}`}>
                {tool.emoji}
              </div>
              <span className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{tool.titleZh}</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-purple-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
