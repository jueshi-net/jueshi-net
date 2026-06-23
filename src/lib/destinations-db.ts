/**
 * Server-side data fetching for pSEO destinations.
 * Uses Prisma directly — only call from Server Components or Route Handlers.
 */

import { prisma } from "@/lib/prisma";

/** Canonical slug aliases — DB uses short slugs, URLs use full canonical slugs */
const SLUG_ALIASES: Record<string, string> = {
  "united-states": "usa",
  "united-kingdom": "uk",
  "united-arab-emirates": "uae",
};

/** Reverse map: DB slug → canonical slug */
const DB_TO_CANONICAL: Record<string, string> = {
  "usa": "united-states",
  "uk": "united-kingdom",
  "uae": "united-arab-emirates",
};

/** Resolve a URL slug to the DB slug (handles aliases) */
export function resolveDbSlug(urlSlug: string): string {
  return SLUG_ALIASES[urlSlug] || urlSlug;
}

/** Resolve a DB slug to the canonical URL slug */
export function resolveCanonicalSlug(dbSlug: string): string {
  return DB_TO_CANONICAL[dbSlug] || dbSlug;
}

export async function getAllDestinationsActive() {
  return prisma.destination.findMany({
    where: { isActive: true },
    include: {
      tools: { orderBy: { sortOrder: "asc" } },
      guides: { orderBy: { sortOrder: "asc" } },
      services: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: [{ region: "asc" }, { sortOrder: "asc" }],
  });
}

export async function getDestinationBySlug(slug: string) {
  const dbSlug = resolveDbSlug(slug);
  return prisma.destination.findUnique({
    where: { slug: dbSlug, isActive: true },
    include: {
      tools: { orderBy: { sortOrder: "asc" } },
      guides: { orderBy: { sortOrder: "asc" } },
      services: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getAllDestinationSlugs() {
  const rows = await prisma.destination.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  // Return canonical slugs so generateStaticParams uses canonical URLs
  return rows.map(r => resolveCanonicalSlug(r.slug));
}

export async function getDestinationStats() {
  const [total, active] = await Promise.all([
    prisma.destination.count(),
    prisma.destination.count({ where: { isActive: true } }),
  ]);
  return { total, active };
}

/** Region group mapping for index page (static, mirrors destinations-config.ts) */
export const REGION_GROUPS = [
  { key: "north-america", label: "北美", emoji: "🌎", description: "美国、加拿大、墨西哥", slugs: ["united-states", "canada", "mexico"] },
  { key: "europe", label: "欧洲", emoji: "🇪🇺", description: "英国、德国、法国、西班牙", slugs: ["united-kingdom", "germany", "france", "spain"] },
  { key: "southeast-asia", label: "东南亚", emoji: "🌏", description: "马来西亚、泰国、越南、印尼、菲律宾", slugs: ["malaysia", "thailand", "vietnam", "indonesia", "philippines"] },
  { key: "east-asia", label: "日韩", emoji: "🗾", description: "日本、韩国", slugs: ["japan", "south-korea"] },
  { key: "latin-america", label: "拉美", emoji: "🌎", description: "巴西、阿根廷、智利", slugs: ["brazil", "argentina", "chile"] },
  { key: "middle-east", label: "中东", emoji: "🕌", description: "阿联酋、沙特阿拉伯", slugs: ["united-arab-emirates", "saudi-arabia"] },
  { key: "oceania", label: "澳洲", emoji: "🦘", description: "澳大利亚、新西兰", slugs: ["australia", "new-zealand"] },
];
