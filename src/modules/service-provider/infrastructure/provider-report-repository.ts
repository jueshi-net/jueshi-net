/**
 * ProviderReport repository.
 *
 * Wraps all ProviderReport DB access. Reports are user-submitted complaints
 * against a provider (spam, fraud, inaccurate info, etc).
 */
import { prisma } from "./db";

export interface ProviderReportCreateInput {
  reporterUserId: string;
  providerId: string;
  category: string; // spam | fraud | inaccurate | inappropriate | other
  reason: string;
  status?: string; // pending | investigating | resolved | dismissed
}

export const providerReportRepository = {
  /** Create a new report. */
  create(input: ProviderReportCreateInput) {
    return prisma.providerReport.create({
      data: {
        reporterUserId: input.reporterUserId,
        providerId: input.providerId,
        category: input.category,
        reason: input.reason,
        status: input.status ?? "pending",
      },
    });
  },

  /** Find a report by id. */
  findById(id: string) {
    return prisma.providerReport.findUnique({ where: { id } });
  },

  /** All reports for a provider (admin view). */
  findByProvider(providerId: string) {
    return prisma.providerReport.findMany({
      where: { providerId },
      orderBy: [{ createdAt: "desc" }],
      include: {
        reporter: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  },

  /** All reports across the system, paginated (admin queue). */
  async list(opts: { status?: string; cursor?: string; take?: number } = {}) {
    const take = Math.min(Math.max(opts.take ?? 50, 1), 200);
    const where: { status?: string } = {};
    if (opts.status) where.status = opts.status;
    const [items, total] = await Promise.all([
      prisma.providerReport.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        take,
        include: {
          provider: {
            select: { id: true, displayName: true, slug: true, status: true },
          },
          reporter: { select: { id: true, name: true, image: true } },
        },
      }),
      prisma.providerReport.count({ where }),
    ]);
    return { items, total };
  },

  /** Transition a report to a new status, recording resolution info. */
  updateStatus(
    id: string,
    status: string,
    extras: Partial<{
      resolution: string | null;
      resolvedBy: string | null;
      resolvedAt: Date | null;
    }> = {}
  ) {
    return prisma.providerReport.update({
      where: { id },
      data: { status, ...extras },
    });
  },
};
