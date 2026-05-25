import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

// 强制运行时动态生成，避免 build 时连到 Neon DB 导致空数据
export const dynamic = "force-dynamic";
export const revalidate = 3600; // 每小时缓存刷新

// ─── 静态路由清单 ────────────────────────────────────────────────
const staticRoutes = [
  // 首页 & 大盘页
  { route: "/", priority: 1.0, changeFrequency: "daily" as const },
  { route: "/destinations", priority: 0.9, changeFrequency: "weekly" as const },

  // 单据中心
  { route: "/tools/documents", priority: 0.9, changeFrequency: "weekly" as const },

  // 单据工具页
  { route: "/tools/documents/commercial-invoice", priority: 0.8, changeFrequency: "monthly" as const },
  { route: "/tools/documents/shipping-label", priority: 0.8, changeFrequency: "monthly" as const },
  { route: "/tools/documents/invoice", priority: 0.8, changeFrequency: "monthly" as const },
  { route: "/tools/documents/debit-note", priority: 0.8, changeFrequency: "monthly" as const },
  { route: "/tools/documents/handover-note", priority: 0.8, changeFrequency: "monthly" as const },
  { route: "/tools/documents/quote-sheet", priority: 0.8, changeFrequency: "monthly" as const },
  { route: "/tools/documents/receipt", priority: 0.8, changeFrequency: "monthly" as const },
  { route: "/tools/documents/inbound-receipt", priority: 0.8, changeFrequency: "monthly" as const },
  { route: "/tools/documents/inbound", priority: 0.8, changeFrequency: "monthly" as const },

  // 其他工具页
  { route: "/tools/postal-code", priority: 0.8, changeFrequency: "monthly" as const },
  { route: "/tools/hs-code", priority: 0.8, changeFrequency: "monthly" as const },
  { route: "/tools/exchange-rate", priority: 0.8, changeFrequency: "daily" as const },
  { route: "/tools/shipping-calculator", priority: 0.8, changeFrequency: "monthly" as const },
  { route: "/tools/shipping-estimator", priority: 0.8, changeFrequency: "monthly" as const },
  { route: "/tools/shipping-mark", priority: 0.8, changeFrequency: "monthly" as const },
  { route: "/tools/container", priority: 0.8, changeFrequency: "monthly" as const },
  { route: "/tools/customs-generator", priority: 0.8, changeFrequency: "monthly" as const },
  { route: "/tools/calculator", priority: 0.7, changeFrequency: "monthly" as const },
  { route: "/tools/zip", priority: 0.7, changeFrequency: "monthly" as const },
  { route: "/tools/qrcode", priority: 0.7, changeFrequency: "monthly" as const },
  { route: "/tools/memo", priority: 0.7, changeFrequency: "monthly" as const },
  { route: "/tools/quote", priority: 0.7, changeFrequency: "monthly" as const },
  { route: "/tools/address-formatter", priority: 0.7, changeFrequency: "monthly" as const },
  { route: "/tools/sensitive-goods", priority: 0.7, changeFrequency: "monthly" as const },
  { route: "/tools/video-script-sop", priority: 0.7, changeFrequency: "monthly" as const },

  // 资讯 & 收藏
  { route: "/articles", priority: 0.8, changeFrequency: "weekly" as const },
  { route: "/favorites", priority: 0.6, changeFrequency: "monthly" as const },

  // 会员 & 定价
  { route: "/pricing", priority: 0.8, changeFrequency: "weekly" as const },
  { route: "/starter", priority: 0.7, changeFrequency: "weekly" as const },

  // 法律页
  { route: "/privacy", priority: 0.5, changeFrequency: "yearly" as const },
  { route: "/terms", priority: 0.5, changeFrequency: "yearly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 动态国家路由
  let destinationSlugs: string[] = [];
  try {
    const destinations = await prisma.destination.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true },
    });
    destinationSlugs = destinations.map((d) => d.slug);
  } catch {
    // DB 不可用时跳过动态路由，保证 sitemap 基本可用
  }

  const dynamicRoutes = destinationSlugs.map((slug) => ({
    url: `${SITE_URL}/destinations/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticEntries = staticRoutes.map((r) => ({
    url: `${SITE_URL}${r.route}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  return [...staticEntries, ...dynamicRoutes];
}
