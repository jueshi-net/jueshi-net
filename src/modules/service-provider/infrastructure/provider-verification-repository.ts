/**
 * ProviderVerification repository.
 *
 * Wraps all ProviderVerification DB access. Verification records track
 * identity / business / professional / platform checks per provider.
 */
import { prisma } from "./db";

export interface ProviderVerificationCreateInput {
  providerId: string;
  type: string; // identity | business | professional | platform
  status?: string; // pending | verified | rejected
  evidenceUrl?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: Date | null;
  notes?: string | null;
}

export const providerVerificationRepository = {
  /** Create a new verification record. */
  create(input: ProviderVerificationCreateInput) {
    return prisma.providerVerification.create({
      data: {
        providerId: input.providerId,
        type: input.type,
        status: input.status ?? "pending",
        evidenceUrl: input.evidenceUrl ?? null,
        verifiedBy: input.verifiedBy ?? null,
        verifiedAt: input.verifiedAt ?? null,
        notes: input.notes ?? null,
      },
    });
  },

  /** All verification records for a provider. */
  findByProvider(providerId: string) {
    return prisma.providerVerification.findMany({
      where: { providerId },
      orderBy: [{ createdAt: "desc" }],
    });
  },

  /** Find a single verification record by id. */
  findById(id: string) {
    return prisma.providerVerification.findUnique({ where: { id } });
  },

  /** Transition a verification to a new status, stamping verifier info. */
  updateStatus(
    id: string,
    status: string,
    extras: Partial<{
      verifiedBy: string | null;
      verifiedAt: Date | null;
      notes: string | null;
    }> = {}
  ) {
    return prisma.providerVerification.update({
      where: { id },
      data: { status, ...extras },
    });
  },
};
