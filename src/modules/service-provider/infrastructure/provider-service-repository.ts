/**
 * ProviderService repository.
 *
 * Wraps all ProviderService (a service item offered by a provider) DB access.
 */
import { prisma } from "./db";
import { Prisma } from "@prisma/client";

export type ProviderServiceStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "suspended";

export interface ProviderServiceListFilter {
  providerId?: string;
  categoryId?: string;
  status?: ProviderServiceStatus;
  /** Restrict to services visible to a specific language audience. */
  language?: string;
  /** Cursor-style pagination. */
  cursor?: string;
  take?: number;
}

export interface ProviderServiceCreateInput {
  providerId: string;
  categoryId: string;
  title: string;
  slug: string;
  summary?: string | null;
  description?: string | null;
  serviceCountries?: string[];
  serviceCities?: string[];
  languages?: string[];
  priceMode?: string;
  priceFrom?: Prisma.Decimal | number | string | null;
  currency?: string;
  deliveryMode?: string | null;
  status?: string;
  sortOrder?: number;
}

export interface ProviderServiceUpdateInput {
  categoryId?: string;
  title?: string;
  slug?: string;
  summary?: string | null;
  description?: string | null;
  serviceCountries?: string[];
  serviceCities?: string[];
  languages?: string[];
  priceMode?: string;
  priceFrom?: Prisma.Decimal | number | string | null;
  currency?: string;
  deliveryMode?: string | null;
  sortOrder?: number;
}

function buildWhere(filter: ProviderServiceListFilter): Prisma.ProviderServiceWhereInput {
  const where: Prisma.ProviderServiceWhereInput = {};
  if (filter.providerId) where.providerId = filter.providerId;
  if (filter.categoryId) where.categoryId = filter.categoryId;
  if (filter.status) where.status = filter.status;
  if (filter.language) where.languages = { has: filter.language };
  return where;
}

export const providerServiceRepository = {
  /** Find a service by id, including its provider and category. */
  findById(id: string, includeRelations = true) {
    return prisma.providerService.findUnique({
      where: { id },
      include: includeRelations
        ? {
            provider: {
              select: {
                id: true,
                displayName: true,
                slug: true,
                status: true,
                avatarUrl: true,
              },
            },
            category: true,
          }
        : undefined,
    });
  },

  /** Find a service by its unique slug. */
  findBySlug(slug: string, includeRelations = true) {
    return prisma.providerService.findUnique({
      where: { slug },
      include: includeRelations
        ? {
            provider: {
              select: {
                id: true,
                displayName: true,
                slug: true,
                status: true,
                avatarUrl: true,
              },
            },
            category: true,
          }
        : undefined,
    });
  },

  /** Paginated list of services for a provider (default: published only). */
  async listByProvider(providerId: string, filter: Omit<ProviderServiceListFilter, "providerId"> = {}) {
    const take = Math.min(Math.max(filter.take ?? 50, 1), 200);
    const where = buildWhere({ ...filter, providerId });
    const [items, total] = await Promise.all([
      prisma.providerService.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take,
        include: { category: true },
      }),
      prisma.providerService.count({ where }),
    ]);
    return { items, total };
  },

  /** Generic list across all providers (admin). */
  async list(filter: ProviderServiceListFilter = {}) {
    const take = Math.min(Math.max(filter.take ?? 20, 1), 100);
    const where = buildWhere(filter);
    const [items, total] = await Promise.all([
      prisma.providerService.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        take,
        include: {
          provider: { select: { id: true, displayName: true, slug: true } },
          category: true,
        },
      }),
      prisma.providerService.count({ where }),
    ]);
    return { items, total };
  },

  /** Insert a new service. */
  create(input: ProviderServiceCreateInput) {
    return prisma.providerService.create({
      data: {
        providerId: input.providerId,
        categoryId: input.categoryId,
        title: input.title,
        slug: input.slug,
        summary: input.summary ?? null,
        description: input.description ?? null,
        serviceCountries: input.serviceCountries ?? [],
        serviceCities: input.serviceCities ?? [],
        languages: input.languages ?? [],
        priceMode: input.priceMode ?? "quote",
        priceFrom: input.priceFrom !== undefined && input.priceFrom !== null
          ? new Prisma.Decimal(input.priceFrom as string | number)
          : null,
        currency: input.currency ?? "USD",
        deliveryMode: input.deliveryMode ?? null,
        status: input.status ?? "draft",
        sortOrder: input.sortOrder ?? 0,
      },
      include: { category: true },
    });
  },

  /** Patch editable service fields. */
  update(id: string, input: ProviderServiceUpdateInput) {
    const data: Prisma.ProviderServiceUpdateInput = { ...input };
    if (input.priceFrom !== undefined && input.priceFrom !== null) {
      data.priceFrom = new Prisma.Decimal(input.priceFrom as string | number);
    }
    return prisma.providerService.update({
      where: { id },
      data,
      include: { category: true },
    });
  },

  /** Transition a service to a new lifecycle status. */
  updateStatus(
    id: string,
    status: ProviderServiceStatus,
    extras: Partial<{ submittedAt: Date | null; publishedAt: Date | null }> = {}
  ) {
    return prisma.providerService.update({
      where: { id },
      data: { status, ...extras },
    });
  },

  /** Hard check for slug uniqueness. */
  slugExists(slug: string) {
    return prisma.providerService
      .findUnique({ where: { slug }, select: { id: true } })
      .then((row) => row !== null);
  },
};
