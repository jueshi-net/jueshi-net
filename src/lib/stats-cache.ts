import { prisma } from "@/lib/prisma";

interface StatsCache {
  data: Record<string, number>;
  timestamp: number;
}

let cache: StatsCache | null = null;
const TTL = 30_000; // 30 seconds

export async function getSiteStats(): Promise<Record<string, number>> {
  const now = Date.now();

  if (cache && now - cache.timestamp < TTL) {
    return cache.data;
  }

  const [linkCount, articleCount, postalCount, userCount] = await Promise.all([
    prisma.linkItem.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.postalCode.count(),
    prisma.user.count(),
  ]);

  const data = { linkCount, articleCount, postalCount, userCount };
  cache = { data, timestamp: now };
  return data;
}
