/**
 * ServiceProvider repository.
 *
 * All ServiceProvider DB access goes through this object. Application services
 * and route handlers must NOT call `prisma.serviceProvider.*` directly.
 */
import { prisma } from "./db";
import type { Prisma } from "@prisma/client";

export type ProviderStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "suspended"
  | "rejected";

export type ProviderVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export interface ProviderListFilter {
  status?: ProviderStatus;
  providerType?: string;
  verificationStatus?: ProviderVerificationStatus;
  /** Case-insensitive partial match on displayName. */
  search?: string;
  /** Filter by country code (membership in `countries[]`). */
  country?: string;
  /** Filter by city (membership in `cities[]`). */
  city?: string;
  /** Filter by language (membership in `languages[]`). */
  language?: string;
  /** Cursor-style pagination. */
  cursor?: string;
  take?: number;
  /** Restrict to providers owned by this user. */
  ownerUserId?: string;
}

export interface ProviderCreateInput {
  ownerUserId: string;
  providerType: string;
  displayName: string;
  slug: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  description?: string | null;
  languages?: string[];
  countries?: string[];
  cities?: string[];
  serviceAreas?: string[];
  contactPreference?: string;
  status?: string;
  verificationStatus?: string;
}

export interface ProviderUpdateInput {
  displayName?: string;
  slug?: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  description?: string | null;
  languages?: string[];
  countries?: string[];
  cities?: string[];
  serviceAreas?: string[];
  contactPreference?: string;
  providerType?: string;
}

function buildWhere(filter: ProviderListFilter): Prisma.ServiceProviderWhereInput {
  const where: Prisma.ServiceProviderWhereInput = {};
  if (filter.status) where.status = filter.status;
  if (filter.providerType) where.providerType = filter.providerType;
  if (filter.verificationStatus) where.verificationStatus = filter.verificationStatus;
  if (filter.ownerUserId) where.ownerUserId = filter.ownerUserId;
  if (filter.country) where.countries = { has: filter.country };
  if (filter.city) where.cities = { has: filter.city };
  if (filter.language) where.languages = { has: filter.language };
  if (filter.search) {
    where.displayName = { contains: filter.search, mode: "insensitive" };
  }
  return where;
}

export const providerRepository = {
  /** Find a provider by its primary key, with relations for detail views. */
  findById(id: string, includeRelations = true) {
    return prisma.serviceProvider.findUnique({
      where: { id },
      include: includeRelations
        ? {
            members: { where: { status: { not: "removed" } } },
            services: { where: { status: "published" }, orderBy: { sortOrder: "asc" } },
            verifications: true,
            owner: { select: { id: true, name: true, email: true, image: true } },
          }
        : undefined,
    });
  },

  /** Find a provider by its unique slug. */
  findBySlug(slug: string, includeRelations = true) {
    return prisma.serviceProvider.findUnique({
      where: { slug },
      include: includeRelations
        ? {
            members: { where: { status: { not: "removed" } } },
            services: { where: { status: "published" }, orderBy: { sortOrder: "asc" } },
            verifications: true,
            owner: { select: { id: true, name: true, email: true, image: true } },
          }
        : undefined,
    });
  },

  /** Paginated list with optional filters. Returns providers + total count. */
  async list(filter: ProviderListFilter = {}) {
    const take = Math.min(Math.max(filter.take ?? 20, 1), 100);
    const where = buildWhere(filter);
    const [items, total] = await Promise.all([
      prisma.serviceProvider.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        take: take + 1,
        ...(filter.cursor
          ? { cursor: { id: filter.cursor }, skip: 1 }
          : {}),
        include: {
          owner: { select: { id: true, name: true, image: true } },
        },
      }),
      prisma.serviceProvider.count({ where }),
    ]);

    const hasMore = items.length > take;
    const visible = hasMore ? items.slice(0, take) : items;
    const nextCursor = hasMore ? visible[visible.length - 1]?.id ?? null : null;
    return { items: visible, total, hasMore, nextCursor };
  },

  /** Count providers matching a filter (without fetching rows). */
  count(filter: ProviderListFilter = {}) {
    return prisma.serviceProvider.count({ where: buildWhere(filter) });
  },

  /** Insert a new provider. Throws on unique constraint (slug). */
  create(input: ProviderCreateInput) {
    return prisma.serviceProvider.create({
      data: {
        ownerUserId: input.ownerUserId,
        providerType: input.providerType,
        displayName: input.displayName,
        slug: input.slug,
        avatarUrl: input.avatarUrl ?? null,
        coverUrl: input.coverUrl ?? null,
        description: input.description ?? null,
        languages: input.languages ?? [],
        countries: input.countries ?? [],
        cities: input.cities ?? [],
        serviceAreas: input.serviceAreas ?? [],
        contactPreference: input.contactPreference ?? "inquiry",
        status: input.status ?? "draft",
        verificationStatus: input.verificationStatus ?? "unverified",
      },
    });
  },

  /** Patch a provider's editable fields. */
  update(id: string, input: ProviderUpdateInput) {
    return prisma.serviceProvider.update({
      where: { id },
      data: input,
    });
  },

  /** Transition a provider to a new lifecycle status, stamping the matching timestamp. */
  updateStatus(
    id: string,
    status: ProviderStatus,
    extras: Partial<{
      verificationStatus: ProviderVerificationStatus;
      submittedAt: Date | null;
      approvedAt: Date | null;
      rejectedAt: Date | null;
      rejectionReason: string | null;
      claimedAt: Date | null;
    }> = {}
  ) {
    return prisma.serviceProvider.update({
      where: { id },
      data: { status, ...extras },
    });
  },

  /** Hard check for slug uniqueness (used for validation before create). */
  slugExists(slug: string) {
    return prisma.serviceProvider
      .findUnique({ where: { slug }, select: { id: true } })
      .then((row) => row !== null);
  },

  /** Delete a provider (admin only - cascade removes related rows). */
  delete(id: string) {
    return prisma.serviceProvider.delete({ where: { id } });
  },
};
