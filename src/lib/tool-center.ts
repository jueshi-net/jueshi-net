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

  // Merge standalone tools (not in DB but have real pages)
  const dbSlugs = new Set(enrichedTools.map(t => t.slug));
  const standaloneMatches = STANDALONE_TOOLS
    .filter(t => !dbSlugs.has(t.slug))
    .filter(t => {
      if (!query) return true;
      const q = query.toLowerCase().trim();
      return t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        matchesAlias(t.slug, q);
    });

  const allTools = [...enrichedTools, ...standaloneMatches];

  // Re-sort after merge
  allTools.sort((a, b) => {
    if (sort === "latest") return b.updatedAt.getTime() - a.updatedAt.getTime();
    if (sort === "saves") return b.metrics.saves - a.metrics.saves;
    if (sort === "favorites") return b.favorites - a.favorites;
    if (b.score !== a.score) return b.score - a.score;
    return b.sortOrder - a.sortOrder;
  });

  return allTools;
}

export const CATEGORY_MAP: Record<string, string> = {
  documents: "外贸单据",
  logistics: "物流工具",
  general: "编码查询",
  exchange: "汇率金融",
  business: "经营工具",
  "ai-content": "AI 内容",
};

/** Standalone tools that live as dedicated pages but should appear in /tools */
export const STANDALONE_TOOLS = [
  {
    id: "standalone-postal-code",
    name: "邮编查询",
    slug: "postal-code",
    description: "全球邮编查询，支持美国 ZIP、英国 postcode、中国邮政编码等",
    category: "general",
    route: "/tools/postal-code",
    icon: "📮",
    popularityTag: "HOT",
    updatedAt: new Date("2026-06-10"),
    sortOrder: 100,
    isNew: false,
    score: 0,
    metrics: { views: 0, clicks: 0, saves: 0, favorites: 0 },
    favorites: 0,
    review: { avg: 0, count: 0 },
  },
  {
    id: "standalone-hs-code",
    name: "HS 编码查询",
    slug: "hs-code",
    description: "海关编码查询，支持中国、美国、欧盟等主要贸易国 HS Code 检索",
    category: "general",
    route: "/tools/hs-code",
    icon: "🔍",
    popularityTag: "HOT",
    updatedAt: new Date("2026-06-10"),
    sortOrder: 99,
    isNew: false,
    score: 0,
    metrics: { views: 0, clicks: 0, saves: 0, favorites: 0 },
    favorites: 0,
    review: { avg: 0, count: 0 },
  },
  {
    id: "standalone-exchange-rate",
    name: "汇率换算",
    slug: "exchange-rate",
    description: "实时汇率查询与换算，支持美元、欧元、英镑、日元等主流货币",
    category: "exchange",
    route: "/tools/exchange-rate",
    icon: "💱",
    popularityTag: "HOT",
    updatedAt: new Date("2026-06-10"),
    sortOrder: 98,
    isNew: false,
    score: 0,
    metrics: { views: 0, clicks: 0, saves: 0, favorites: 0 },
    favorites: 0,
    review: { avg: 0, count: 0 },
  },
  {
    id: "standalone-shipping-calculator",
    name: "运费计算器",
    slug: "shipping-calculator",
    description: "国际快递与海运运费估算，支持 DHL、UPS、FedEx 等主流渠道",
    category: "logistics",
    route: "/tools/shipping-calculator",
    icon: "🚢",
    popularityTag: "HOT",
    updatedAt: new Date("2026-06-10"),
    sortOrder: 97,
    isNew: false,
    score: 0,
    metrics: { views: 0, clicks: 0, saves: 0, favorites: 0 },
    favorites: 0,
    review: { avg: 0, count: 0 },
  },
  {
    id: "standalone-container",
    name: "集装箱计算器",
    slug: "container",
    description: "集装箱装柜计算，支持 20GP/40GP/40HQ 柜型，计算 CBM 和空间利用率",
    category: "logistics",
    route: "/tools/container",
    icon: "📦",
    popularityTag: null,
    updatedAt: new Date("2026-06-10"),
    sortOrder: 96,
    isNew: false,
    score: 0,
    metrics: { views: 0, clicks: 0, saves: 0, favorites: 0 },
    favorites: 0,
    review: { avg: 0, count: 0 },
  },
];
