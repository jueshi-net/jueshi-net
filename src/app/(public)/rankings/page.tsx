import Link from "next/link";
import { ArrowLeft, ExternalLink, Star, TrendingUp, MessageSquare, Heart } from "lucide-react";
import { Metadata } from "next";
import { SCENARIO_PACKAGES } from "@/data/scenario-packages";

export const metadata: Metadata = {
  title: "工具排行榜 — 海外百宝箱",
  description: "根据评分、收藏和短评热度综合排序的工具排行榜",
};

// Build toolKey → scenario info map
const toolInfoMap = new Map<string, { name: string; scenario: string; href: string; tags: string[] }>();
for (const pkg of SCENARIO_PACKAGES) {
  for (const group of pkg.toolGroups) {
    for (const tool of group.tools) {
      if (tool.toolKey) {
        toolInfoMap.set(tool.toolKey, {
          name: tool.name,
          scenario: pkg.title,
          href: tool.url.startsWith("/") ? tool.url : `/starter/${pkg.slug}`,
          tags: tool.tags.slice(0, 2),
        });
      }
    }
  }
}

export default async function RankingsPage() {
  let rankings: any[] = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const res = await fetch(`${baseUrl}/api/tools/rankings`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      rankings = data.rankings || [];
    }
  } catch {
    // Ignore
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <Link href="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-8 h-8" />
            <h1 className="text-3xl font-bold">海外百宝箱工具排行榜</h1>
          </div>
          <p className="text-white/80">根据评分、收藏和短评热度综合排序</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {rankings.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h2 className="font-semibold text-gray-900 mb-1">暂无排行榜数据</h2>
            <p className="text-sm text-gray-500">工具短评和收藏数据积累后将自动生成排行榜</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rankings.map((r, idx) => {
              const info = toolInfoMap.get(r.toolKey);
              const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;
              return (
                <div
                  key={r.toolKey}
                  className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-10 text-center">
                      {medal ? (
                        <span className="text-2xl">{medal}</span>
                      ) : (
                        <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {info?.name || r.toolKey}
                        </h3>
                        {info?.tags.map((t) => (
                          <span key={t} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{info?.scenario || "工具"}</p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          {r.avgRating > 0 ? r.avgRating.toFixed(1) : "暂无"}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <MessageSquare className="w-4 h-4" />
                          {r.reviewCount} 短评
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Heart className="w-4 h-4" />
                          {r.favoriteCount} 收藏
                        </span>
                        <span className="text-xs text-gray-400">
                          综合得分 {r.score}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0">
                      {info?.href ? (
                        <Link
                          href={info.href}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                          打开
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          排行榜根据：平均分 × 20 + 收藏数 × 2 + 短评数 × 3 综合计算
        </p>
      </div>
    </div>
  );
}
