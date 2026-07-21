import { prisma } from "@/lib/prisma";
import ResourceDirectoryClient from "./resource-directory-client";
import type { Metadata } from "next";
import type { SortOption } from "@/components/resources/types";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "https://jueshi.net/resources" },
};

const PAGE_SIZE = 24;

const VALID_SORTS: SortOption[] = ["default", "quality", "latest", "name"];

/**
 * Build Prisma orderBy from the sort URL param.
 * The default sort keeps isAd-first semantics but the main directory query
 * already excludes ad resources (isAd: false), so we only need sortOrder.
 */
function buildOrderBy(sort: SortOption) {
  switch (sort) {
    case "quality":
      return [{ qualityScore: "desc" as const }, { createdAt: "desc" as const }];
    case "latest":
      return [{ createdAt: "desc" as const }];
    case "name":
      return [{ name: "asc" as const }];
    default:
      return [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];
  }
}

interface SearchParams {
  page?: string;
  category?: string;
  q?: string;
  sort?: string;
}

export default async function ResourceDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const now = new Date();
  const params = await searchParams;

  // --- Parse URL params ---
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const category = params.category && params.category !== "all" ? params.category : "all";
  const q = (params.q || "").trim();
  const sort: SortOption = VALID_SORTS.includes(params.sort as SortOption)
    ? (params.sort as SortOption)
    : "default";

  // --- Build where clause for the paginated main query (non-ad resources) ---
  const where = {
    isActive: true,
    isAd: false,
    ...(category !== "all" ? { category } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { url: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  // --- Main query: paginated resources + total count ---
  const [resources, totalCount] = await Promise.all([
    prisma.resource.findMany({
      where,
      orderBy: buildOrderBy(sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.resource.count({ where }),
  ]);

  // --- Category counts for the sidebar nav (non-ad active resources) ---
  const categoryGroups = await prisma.resource.groupBy({
    by: ["category"],
    where: { isActive: true, isAd: false },
    _count: { _all: true },
  });
  const categoryCounts = categoryGroups.map((g) => ({
    id: g.category,
    count: g._count._all,
  }));
  const totalResourceCount = categoryGroups.reduce((sum, g) => sum + g._count._all, 0);

  // --- Sidebar: hot rankings (top by qualityScore) ---
  const hotResources = await prisma.resource.findMany({
    where: { isActive: true, isAd: false },
    orderBy: [{ qualityScore: "desc" }, { createdAt: "desc" }],
    take: 10,
  });

  // --- Sidebar: latest additions ---
  const latestResources = await prisma.resource.findMany({
    where: { isActive: true, isAd: false },
    orderBy: [{ createdAt: "desc" }],
    take: 8,
  });

  // --- Featured resources (hero strip) ---
  // isFeatured=true with optional time-based scheduling; fallback to high-quality.
  let featuredResources = await prisma.resource.findMany({
    where: {
      isActive: true,
      isAd: false,
      isFeatured: true,
      OR: [
        { featuredStartAt: null, featuredEndAt: null },
        { featuredStartAt: { lte: now }, featuredEndAt: null },
        { featuredStartAt: null, featuredEndAt: { gte: now } },
        { featuredStartAt: { lte: now }, featuredEndAt: { gte: now } },
      ],
    },
    orderBy: [{ featuredOrder: "asc" }, { qualityScore: "desc" }],
    take: 12,
  });

  if (featuredResources.length === 0) {
    featuredResources = await prisma.resource.findMany({
      where: { isActive: true, isAd: false, qualityScore: { gte: 70 } },
      orderBy: [{ qualityScore: "desc" }, { createdAt: "desc" }],
      take: 6,
    });
  }

  // --- Ad resources (sponsored slots) ---
  const adResources = await prisma.resource.findMany({
    where: { isActive: true, isAd: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 3,
  });

  return (
    <ResourceDirectoryClient
      resources={resources}
      totalCount={totalCount}
      page={page}
      pageSize={PAGE_SIZE}
      category={category}
      q={q}
      sort={sort}
      categoryCounts={categoryCounts}
      totalResourceCount={totalResourceCount}
      hotResources={hotResources}
      latestResources={latestResources}
      featuredResources={featuredResources}
      adResources={adResources}
    />
  );
}
