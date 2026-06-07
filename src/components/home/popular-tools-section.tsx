import Link from "next/link";
import { TrendingUp, ArrowRight, Star, MessageSquare, Heart } from "lucide-react";
import { SCENARIO_PACKAGES } from "@/data/scenario-packages";

// Build toolKey → info map
const toolInfoMap = new Map<string, { name: string; href: string; scenario: string }>();
for (const pkg of SCENARIO_PACKAGES) {
  for (const group of pkg.toolGroups) {
    for (const tool of group.tools) {
      if (tool.toolKey) {
        toolInfoMap.set(tool.toolKey, {
          name: tool.name,
          href: tool.url.startsWith("/") ? tool.url : `/starter/${pkg.slug}`,
          scenario: pkg.title,
        });
      }
    }
  }
}

export default async function PopularToolsSection() {
  let rankings: any[] = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const res = await fetch(`${baseUrl}/api/tools/rankings`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      rankings = (data.rankings || []).slice(0, 5);
    }
  } catch {
    // Ignore
  }

  if (rankings.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold text-gray-900">本周热门工具</h2>
          <span className="text-sm text-gray-400">根据评分、收藏和短评综合排序</span>
        </div>
        <Link href="/rankings" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          查看完整排行榜 <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {rankings.map((r, idx) => {
          const info = toolInfoMap.get(r.toolKey);
          const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
          return (
            <Link
              key={r.toolKey}
              href={info?.href || "/rankings"}
              className="bg-white rounded-xl border p-4 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{medal}</span>
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {info?.name || r.toolKey}
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {r.avgRating > 0 ? r.avgRating.toFixed(1) : "-"}
                </span>
                <span className="flex items-center gap-0.5">
                  <MessageSquare className="w-3 h-3" />
                  {r.reviewCount}
                </span>
                <span className="flex items-center gap-0.5">
                  <Heart className="w-3 h-3" />
                  {r.favoriteCount}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1 truncate">{info?.scenario}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
