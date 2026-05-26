/**
 * Server-side data fetching for pSEO destinations.
 * Uses Prisma directly — only call from Server Components or Route Handlers.
 */

import { prisma } from "@/lib/prisma";

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
  return prisma.destination.findUnique({
    where: { slug, isActive: true },
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
  return rows.map(r => r.slug);
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
  { key: "north-america", label: "北美", emoji: "🌎", description: "美国、加拿大、墨西哥", slugs: ["usa", "canada", "mexico"] },
  { key: "europe", label: "欧洲", emoji: "🇪🇺", description: "英国、德国、法国、西班牙", slugs: ["uk", "germany", "france", "spain"] },
  { key: "southeast-asia", label: "东南亚", emoji: "🌏", description: "马来西亚、泰国、越南、印尼、菲律宾", slugs: ["malaysia", "thailand", "vietnam", "indonesia", "philippines"] },
  { key: "east-asia", label: "日韩", emoji: "🗾", description: "日本、韩国", slugs: ["japan", "south-korea"] },
  { key: "latin-america", label: "拉美", emoji: "🌎", description: "巴西、阿根廷、智利", slugs: ["brazil", "argentina", "chile"] },
  { key: "middle-east", label: "中东", emoji: "🕌", description: "阿联酋、沙特阿拉伯", slugs: ["uae", "saudi-arabia"] },
  { key: "oceania", label: "澳洲", emoji: "🦘", description: "澳大利亚、新西兰", slugs: ["australia", "new-zealand"] },
];
