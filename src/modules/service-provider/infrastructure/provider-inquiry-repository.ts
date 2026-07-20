/**
 * ProviderInquiry repository.
 *
 * Wraps all ProviderInquiry DB access. Inquiries are consultation leads
 * submitted by users to providers. Creation is transactional with the
 * DomainEventOutbox (see inquiry-service.ts).
 */
import { prisma } from "./db";
import type { PrismaClient } from "@prisma/client";

export interface ProviderInquiryCreateInput {
  requesterUserId: string;
  providerId: string;
  serviceId?: string | null;
  sourceType?: string;
  sourceId?: string | null;
  message?: string | null;
  status?: string;
}

/**
 * Create an inquiry. Accepts an optional transaction client so the caller
 * can atomically write the inquiry + outbox entry in the same DB tx.
 */
export function createInquiry(
  input: ProviderInquiryCreateInput,
  tx?: PrismaClient | Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0]
) {
  const client = tx ?? prisma;
  return client.providerInquiry.create({
    data: {
      requesterUserId: input.requesterUserId,
      providerId: input.providerId,
      serviceId: input.serviceId ?? null,
      sourceType: input.sourceType ?? "direct",
      sourceId: input.sourceId ?? null,
      message: input.message ?? null,
      status: input.status ?? "new",
    },
  });
}

export const providerInquiryRepository = {
  /** Create an inquiry (standalone, no outbox tx). */
  create: createInquiry,

  /** Find an inquiry by id, including provider/service relations. */
  findById(id: string) {
    return prisma.providerInquiry.findUnique({
      where: { id },
      include: {
        provider: {
          select: { id: true, displayName: true, slug: true, status: true },
        },
        service: { select: { id: true, title: true, slug: true } },
        requester: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  },

  /** Paginated list of inquiries for a provider (workspace view). */
  async findByProvider(
    providerId: string,
    opts: { status?: string; cursor?: string; take?: number } = {}
  ) {
    const take = Math.min(Math.max(opts.take ?? 20, 1), 100);
    const where: { providerId: string; status?: string } = { providerId };
    if (opts.status) where.status = opts.status;
    const [items, total] = await Promise.all([
      prisma.providerInquiry.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        take,
        include: {
          service: { select: { id: true, title: true, slug: true } },
          requester: { select: { id: true, name: true, image: true } },
        },
      }),
      prisma.providerInquiry.count({ where }),
    ]);
    return { items, total };
  },

  /** All inquiries submitted by a user (for their dashboard). */
  findByUser(userId: string) {
    return prisma.providerInquiry.findMany({
      where: { requesterUserId: userId },
      orderBy: [{ createdAt: "desc" }],
      include: {
        provider: {
          select: { id: true, displayName: true, slug: true, avatarUrl: true },
        },
        service: { select: { id: true, title: true, slug: true } },
      },
    });
  },

  /** Transition an inquiry to a new status. */
  updateStatus(id: string, status: string) {
    return prisma.providerInquiry.update({
      where: { id },
      data: { status },
    });
  },

  /** Count inquiries by status for a provider (workspace dashboard). */
  async countByStatus(providerId: string) {
    const rows = await prisma.providerInquiry.groupBy({
      by: ["status"],
      where: { providerId },
      _count: { _all: true },
    });
    const map: Record<string, number> = {};
    for (const row of rows) map[row.status] = row._count._all;
    return map;
  },
};
