/**
 * ProviderMember repository.
 *
 * Wraps all ProviderMember DB access. Memberships are uniquely keyed by
 * [providerId, userId] so adding the same user twice is a no-op update.
 */
import { prisma } from "./db";

export interface MemberCreateInput {
  providerId: string;
  userId: string;
  role?: string;
  status?: string;
  invitedBy?: string | null;
  invitedAt?: Date | null;
  acceptedAt?: Date | null;
}

export interface MemberUpdateInput {
  role?: string;
  status?: string;
  invitedAt?: Date | null;
  acceptedAt?: Date | null;
}

export const providerMemberRepository = {
  /** All active/invited members of a provider (excludes removed). */
  findByProvider(providerId: string, includeRemoved = false) {
    return prisma.providerMember.findMany({
      where: includeRemoved ? { providerId } : { providerId, status: { not: "removed" } },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  },

  /** All providers a user is a member of. */
  findByUser(userId: string, includeRemoved = false) {
    return prisma.providerMember.findMany({
      where: includeRemoved ? { userId } : { userId, status: { not: "removed" } },
      include: {
        provider: {
          select: {
            id: true,
            displayName: true,
            slug: true,
            providerType: true,
            status: true,
            avatarUrl: true,
          },
        },
      },
    });
  },

  /** Look up a single membership row by composite key. */
  findByProviderAndUser(providerId: string, userId: string) {
    return prisma.providerMember.findUnique({
      where: { providerId_userId: { providerId, userId } },
    });
  },

  /** Insert or reactivate a membership (idempotent on [providerId, userId]). */
  async add(input: MemberCreateInput) {
    const existing = await prisma.providerMember.findUnique({
      where: {
        providerId_userId: { providerId: input.providerId, userId: input.userId },
      },
    });

    if (existing) {
      // Reactivate if previously removed; otherwise just update role/status.
      return prisma.providerMember.update({
        where: { id: existing.id },
        data: {
          role: input.role ?? existing.role,
          status: input.status ?? "active",
          invitedBy: input.invitedBy ?? existing.invitedBy,
          invitedAt: input.invitedAt ?? existing.invitedAt,
          acceptedAt: input.acceptedAt ?? existing.acceptedAt,
        },
      });
    }

    return prisma.providerMember.create({
      data: {
        providerId: input.providerId,
        userId: input.userId,
        role: input.role ?? "VIEWER",
        status: input.status ?? "active",
        invitedBy: input.invitedBy ?? null,
        invitedAt: input.invitedAt ?? null,
        acceptedAt: input.acceptedAt ?? null,
      },
    });
  },

  /** Patch role/status/acceptance on a membership. */
  update(providerId: string, userId: string, input: MemberUpdateInput) {
    return prisma.providerMember.update({
      where: { providerId_userId: { providerId, userId } },
      data: input,
    });
  },

  /** Mark a membership as removed (soft delete - preserves audit trail). */
  remove(providerId: string, userId: string) {
    return prisma.providerMember.update({
      where: { providerId_userId: { providerId, userId } },
      data: { status: "removed" },
    });
  },

  /** Count active members of a provider. */
  countActive(providerId: string) {
    return prisma.providerMember.count({
      where: { providerId, status: "active" },
    });
  },
};
