/**
 * Public Queries - Safe read layer for service-provider module.
 *
 * All public pages and blocks MUST use these functions.
 * They NEVER expose private fields (ownerUserId, member userIds,
 * contact info, rejectionReason, internal notes).
 *
 * Only approved providers and published services are returned.
 */
import { prisma } from "../infrastructure/db";
import type {
  PublicProviderDTO,
  PublicServiceDTO,
  PublicCategoryDTO,
  PublicVerificationDTO,
  TrustCardDTO,
  ProviderFilterParams,
  PaginatedResult,
} from "../domain/public-dto";

// ─── Private helpers: Prisma row → Public DTO ───

type ProviderRow = {
  id: string;
  ownerUserId: string;
  providerType: string;
  displayName: string;
  slug: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  description: string | null;
  languages: string[];
  countries: string[];
  cities: string[];
  serviceAreas: string[];
  contactPreference: string;
  status: string;
  verificationStatus: string;
  claimedAt: Date | null;
  submittedAt: Date | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toPublicProvider(
  row: ProviderRow,
  serviceCount: number
): PublicProviderDTO {
  return {
    id: row.id,
    providerType: row.providerType.toUpperCase() as PublicProviderDTO["providerType"],
    displayName: row.displayName,
    slug: row.slug,
    handle: row.slug,
    avatarUrl: row.avatarUrl,
    coverUrl: row.coverUrl,
    description: row.description,
    languages: row.languages ?? [],
    countries: row.countries ?? [],
    cities: row.cities ?? [],
    serviceAreas: row.serviceAreas ?? [],
    contactPreference: row.contactPreference,
    verificationStatus: row.verificationStatus,
    status: row.status, // always "approved" in public queries
    claimedAt: row.claimedAt?.toISOString() ?? null,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    serviceCount,
    isVerified: row.verificationStatus === "verified",
  };
}

type ServiceRow = {
  id: string;
  providerId: string;
  categoryId: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  serviceCountries: string[];
  serviceCities: string[];
  languages: string[];
  priceMode: string;
  priceFrom: number | null;
  currency: string;
  deliveryMode: string;
  status: string;
  sortOrder: number;
  provider?: { slug: string; displayName: string; avatarUrl: string | null; providerType: string; verificationStatus: string; } | null;
  category?: { slug: string; name: string; } | null;
};

// ─── Price mode mapping (DB lowercase → DTO uppercase) ───
const PRICE_MODE_MAP: Record<string, string> = {
  quote: "CONTACT",
  fixed: "FIXED",
  range: "RANGE",
  hourly: "CONTACT",
  negotiable: "NEGOTIABLE",
  contact: "CONTACT",
};

function toPublicService(row: ServiceRow): PublicServiceDTO {
  return {
    id: row.id,
    providerId: row.providerId,
    providerSlug: row.provider?.slug ?? "",
    providerDisplayName: row.provider?.displayName ?? "",
    providerAvatarUrl: row.provider?.avatarUrl ?? null,
    providerType: (row.provider?.providerType ?? "").toUpperCase(),
    providerVerificationStatus: row.provider?.verificationStatus ?? "",
    categoryId: row.categoryId,
    categorySlug: row.category?.slug ?? "",
    categoryName: row.category?.name ?? "",
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    serviceCountries: row.serviceCountries ?? [],
    serviceCities: row.serviceCities ?? [],
    languages: row.languages ?? [],
    priceMode: (PRICE_MODE_MAP[row.priceMode] ?? row.priceMode.toUpperCase()) as PublicServiceDTO["priceMode"],
    priceFrom: row.priceFrom,
    currency: row.currency,
    deliveryMode: row.deliveryMode,
    status: row.status,
    sortOrder: row.sortOrder,
  };
}

// ─── Public Query Functions ───

/** List approved providers with filters, pagination, and sorting. */
export async function listPublicProviders(
  params: ProviderFilterParams = {}
): Promise<PaginatedResult<PublicProviderDTO>> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 12));

  const where: Record<string, unknown> = {
    status: "approved", // Only approved providers are public
  };

  if (params.q) {
    where.OR = [
      { displayName: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.providerType) where.providerType = params.providerType;
  if (params.country) where.countries = { has: params.country };
  if (params.city) where.cities = { has: params.city };
  if (params.language) where.languages = { has: params.language };
  if (params.verificationStatus) {
    where.verificationStatus = params.verificationStatus;
  }
  if (params.categoryId) {
    where.services = {
      some: { categoryId: params.categoryId, status: "published" },
    };
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  switch (params.sort) {
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "verified":
      orderBy = { verificationStatus: "desc" };
      break;
    case "services":
      orderBy = { services: { _count: "desc" } };
      break;
    case "name":
      orderBy = { displayName: "asc" };
      break;
    case "recommended":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  const [total, rows] = await Promise.all([
    prisma.serviceProvider.count({ where }),
    prisma.serviceProvider.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { services: { where: { status: "published" } } } },
      },
    }),
  ]);

  const items = rows.map((r) =>
    toPublicProvider(r as unknown as ProviderRow, (r as any)._count?.services ?? 0)
  );

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/** Get a single approved provider by slug. Returns null if not found or not approved. */
export async function getPublicProviderBySlug(
  slug: string
): Promise<PublicProviderDTO | null> {
  const row = await prisma.serviceProvider.findUnique({
    where: { slug },
    include: {
      _count: { select: { services: { where: { status: "published" } } } },
    },
  });

  if (!row || row.status !== "approved") return null;
  return toPublicProvider(row as unknown as ProviderRow, (row as any)._count?.services ?? 0);
}

/** Get published services for a provider (provider must be approved). */
export async function getPublicProviderServices(
  providerId: string
): Promise<PublicServiceDTO[]> {
  const provider = await prisma.serviceProvider.findUnique({
    where: { id: providerId },
    select: { status: true, slug: true, displayName: true, avatarUrl: true, providerType: true, verificationStatus: true },
  });

  if (!provider || provider.status !== "approved") return [];

  const rows = await prisma.providerService.findMany({
    where: { providerId, status: "published" },
    orderBy: { sortOrder: "asc" },
    include: {
      provider: { select: { slug: true, displayName: true, avatarUrl: true, providerType: true, verificationStatus: true } },
      category: { select: { slug: true, name: true } },
    },
  });

  return rows.map((r) => toPublicService(r as unknown as ServiceRow));
}

/** Get a published service by slug (provider must be approved). */
export async function getPublicServiceBySlug(
  slug: string
): Promise<PublicServiceDTO | null> {
  const row = await prisma.providerService.findUnique({
    where: { slug },
    include: {
      provider: { select: { slug: true, displayName: true, avatarUrl: true, providerType: true, verificationStatus: true, status: true } },
      category: { select: { slug: true, name: true } },
    },
  });

  if (!row || row.status !== "published") return null;
  if (!row.provider || row.provider.status !== "approved") return null;

  return toPublicService(row as unknown as ServiceRow);
}

/** List all active service categories with provider counts. */
export async function listPublicCategories(): Promise<PublicCategoryDTO[]> {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: {
          services: {
            where: {
              status: "published",
              provider: { status: "approved" },
            },
          },
        },
      },
    },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    sortOrder: c.sortOrder,
    providerCount: (c as any)._count?.services ?? 0,
  }));
}

/** Get trust card data for a provider (public-safe). */
export async function getTrustCard(
  providerId: string
): Promise<TrustCardDTO | null> {
  const provider = await prisma.serviceProvider.findUnique({
    where: { id: providerId },
    select: {
      id: true,
      slug: true,
      displayName: true,
      verificationStatus: true,
      claimedAt: true,
      approvedAt: true,
      status: true,
      _count: { select: { services: { where: { status: "published" } } } },
    },
  });

  if (!provider || provider.status !== "approved") return null;

  const verifications = await prisma.providerVerification.findMany({
    where: { providerId, status: "verified" },
    select: {
      id: true,
      type: true,
      status: true,
      verifiedAt: true,
    },
  });

  return {
    providerId: provider.id,
    providerSlug: provider.slug,
    displayName: provider.displayName,
    verificationStatus: provider.verificationStatus,
    verifications: verifications.map((v): PublicVerificationDTO => ({
      id: v.id,
      verificationType: v.type,
      status: v.status,
      verifiedAt: v.verifiedAt?.toISOString() ?? null,
    })),
    isVerified: provider.verificationStatus === "verified",
    serviceCount: (provider as any)._count?.services ?? 0,
    claimedAt: provider.claimedAt?.toISOString() ?? null,
    approvedAt: provider.approvedAt?.toISOString() ?? null,
  };
}

/** Get related providers (same category or same country). */
export async function getRelatedProviders(
  providerId: string,
  limit = 4
): Promise<PublicProviderDTO[]> {
  const provider = await prisma.serviceProvider.findUnique({
    where: { id: providerId },
    select: { countries: true, providerType: true },
  });

  if (!provider) return [];

  // Find providers sharing at least one country
  const related = await prisma.serviceProvider.findMany({
    where: {
      id: { not: providerId },
      status: "approved",
      countries: { hasSome: provider.countries },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { services: { where: { status: "published" } } } },
    },
  });

  return related.map((r) =>
    toPublicProvider(r as unknown as ProviderRow, (r as any)._count?.services ?? 0)
  );
}

/** Check if a user has favorited a provider. */
export async function isProviderFavorited(
  userId: string,
  providerId: string
): Promise<boolean> {
  const count = await prisma.providerFavorite.count({
    where: { userId, providerId },
  });
  return count > 0;
}

// ─── Management queries (authenticated, NOT public DTO) ───

/**
 * Get a provider by ID for management purposes (workspace/admin).
 * Returns full data including services, members, verifications.
 * Caller is responsible for auth/permission checks.
 */
export async function getProviderForManagement(id: string) {
  const { providerRepository } = await import("../infrastructure");
  return providerRepository.findById(id, true);
}
