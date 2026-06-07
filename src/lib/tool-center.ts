import { prisma } from "@/lib/prisma";
import { calculateToolScore } from "./tool-ranking";
import { ToolCenterItem } from "./tool-types";
import { matchesAlias } from "./tool-search-aliases";

// Re-export type for convenience in Server Components
export type { ToolCenterItem };

export async function getToolsData(query?: string, category?: string, sort?: string): Promise<ToolCenterItem[]> {
  // 1. Fetch Tools
  const where: any = { isActive: true };
  if (category && category !== "all") {
    where.category = category;
  }

  const tools = await prisma.tool.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      route: true,
      icon: true,
      popularityTag: true,
      updatedAt: true,
      sortOrder: true,
    },
  });

  // 2. Fetch Metrics (Last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const metrics = await prisma.toolMetricDaily.findMany({
    where: { date: { gte: sevenDaysAgo } },
  });

  // Aggregate metrics by slug
  const metricsMap = new Map<string, { views: number; clicks: number; saves: number; favorites: number }>();
  for (const m of metrics) {
    const current = metricsMap.get(m.toolSlug) || { views: 0, clicks: 0, saves: 0, favorites: 0 };
    metricsMap.set(m.toolSlug, {
      views: current.views + m.views,
      clicks: current.clicks + m.clicks,
      saves: current.saves + m.saves,
      favorites: current.favorites + m.favorites,
    });
  }

  // 3. Fetch Favorites Count
  const favStats = await prisma.toolFavorite.groupBy({
    by: ["toolKey"],
    _count: { id: true },
  });
  const favMap = new Map<string, number>();
  for (const f of favStats) {
    favMap.set(f.toolKey, f._count.id);
  }

  // 4. Fetch Review Stats
  const reviewStats = await prisma.toolReview.groupBy({
    by: ["toolKey"],
    where: { status: "approved" },
    _avg: { rating: true },
    _count: { id: true },
  });
  const reviewMap = new Map<string, { avg: number; count: number }>();
  for (const r of reviewStats) {
    reviewMap.set(r.toolKey, {
      avg: r._avg.rating || 0,
      count: r._count.id,
    });
  }

  // 5. Enrich and Filter
  let enrichedTools: ToolCenterItem[] = tools.map((tool) => {
    const slug = tool.slug;
    const m = metricsMap.get(slug) || { views: 0, clicks: 0, saves: 0, favorites: 0 };
    const favCount = favMap.get(slug) || 0;
    const review = reviewMap.get(slug) || { avg: 0, count: 0 };

    const score = calculateToolScore(m);
    const isNew = (Date.now() - tool.updatedAt.getTime()) / 86400000 <= 3;

    return {
      ...tool,
      description: tool.description,
      metrics: m,
      favorites: favCount,
      review: review,
      score,
      isNew,
    };
  });

  // Search filter (case insensitive + alias support)
  if (query) {
    const q = query.toLowerCase().trim();
    enrichedTools = enrichedTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        matchesAlias(t.slug, q)
    );
  }

  // Sorting
  enrichedTools.sort((a, b) => {
    if (sort === "latest") return b.updatedAt.getTime() - a.updatedAt.getTime();
    if (sort === "saves") return b.metrics.saves - a.metrics.saves;
    if (sort === "favorites") return b.favorites - a.favorites;
    // popular (default) -> score desc, then sortOrder desc
    if (b.score !== a.score) return b.score - a.score;
    return b.sortOrder - a.sortOrder;
  });

  return enrichedTools;
}

export const CATEGORY_MAP: Record<string, string> = {
  documents: "单据工具",
  "ai-content": "AI 内容",
  logistics: "物流工具",
  business: "经营工具",
  life: "生活工具",
  general: "通用工具",
};
