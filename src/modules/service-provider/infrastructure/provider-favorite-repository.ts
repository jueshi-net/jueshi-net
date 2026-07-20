/**
 * ProviderFavorite repository.
 *
 * Wraps all ProviderFavorite DB access. Favorites are user bookmarks on
 * providers, uniquely keyed by [userId, providerId]. `toggle` is idempotent:
 * if a favorite exists it is removed, otherwise it is created.
 */
import { prisma } from "./db";

export const providerFavoriteRepository = {
  /**
   * Toggle a favorite on/off. Returns { favorited: boolean } indicating the
   * resulting state (true = now favorited, false = now un-favorited).
   */
  async toggle(userId: string, providerId: string): Promise<{ favorited: boolean }> {
    const existing = await prisma.providerFavorite.findUnique({
      where: { userId_providerId: { userId, providerId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.providerFavorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await prisma.providerFavorite.create({ data: { userId, providerId } });
    return { favorited: true };
  },

  /** Has the user favorited this provider? */
  async isFavorited(userId: string, providerId: string): Promise<boolean> {
    const row = await prisma.providerFavorite.findUnique({
      where: { userId_providerId: { userId, providerId } },
      select: { id: true },
    });
    return row !== null;
  },

  /** All providers favorited by a user. */
  findByUser(userId: string) {
    return prisma.providerFavorite.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }],
      include: {
        provider: {
          select: {
            id: true,
            displayName: true,
            slug: true,
            providerType: true,
            status: true,
            avatarUrl: true,
            cities: true,
            countries: true,
          },
        },
      },
    });
  },

  /** All users who favorited a provider (admin view). */
  findByProvider(providerId: string) {
    return prisma.providerFavorite.findMany({
      where: { providerId },
      orderBy: [{ createdAt: "desc" }],
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });
  },

  /** Total favorite count for a provider. */
  countForProvider(providerId: string) {
    return prisma.providerFavorite.count({ where: { providerId } });
  },
};
