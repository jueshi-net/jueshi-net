/**
 * Interaction Services - favorite and report actions.
 *
 * These are application-layer wrappers around the infrastructure repositories.
 * Route handlers call these instead of touching prisma directly.
 */
import { providerFavoriteRepository } from "../infrastructure/provider-favorite-repository";
import { providerReportRepository } from "../infrastructure/provider-report-repository";
import { publishEvent } from "@/platform";

/**
 * Toggle a favorite on a provider. Idempotent: if already favorited, un-favorites.
 * Returns { favorited: boolean } indicating the new state.
 */
export async function favoriteProvider(
  userId: string,
  providerId: string,
): Promise<{ favorited: boolean }> {
  return providerFavoriteRepository.toggle(userId, providerId);
}

/**
 * Submit a report against a provider. Publishes provider.reported event.
 */
export async function reportProvider(
  reporterUserId: string,
  providerId: string,
  category: string,
  reason: string,
): Promise<{ id: string; providerId: string; category: string; status: string; createdAt: Date }> {
  const report = await providerReportRepository.create({
    reporterUserId,
    providerId,
    category,
    reason,
  });
  await publishEvent("provider.reported", "service-provider", {
    providerId,
    reporterUserId,
    reason,
  });
  return {
    id: report.id,
    providerId: report.providerId,
    category: report.category,
    status: report.status,
    createdAt: report.createdAt,
  };
}
