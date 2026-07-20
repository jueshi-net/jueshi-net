/**
 * service-provider action registrations.
 *
 * Registers the 3 actions declared by the module. Each action has a
 * capability gate (checked centrally by executeAction) and a handler.
 *
 * service.request is the entry point for inquiry lead creation. Its output
 * is designed to be connectable to a unified conversation module later:
 *   { inquiryId, nextStep: "conversation" | "waitlist" }
 *
 * The handler does NOT directly modify cross-module tables. It:
 *   1. Validates auth (via capability gate)
 *   2. Validates provider/service state
 *   3. Creates the inquiry lead (Round 2 — needs DB model)
 *   4. Publishes inquiry.created event
 *   5. Returns inquiryId + nextStep
 */
import {
  registerAction,
  publishEvent,
  type ActionContext,
  type ActionResult,
} from "@/platform";

export const SERVICE_PROVIDER_ACTIONS = [
  "service.request",
  "provider.favorite",
  "provider.report",
] as const;

/**
 * service.request — create an inquiry lead for a service.
 *
 * Input: { providerId, serviceId?, sourceType, sourceId?, message }
 * Context: userId (required via capability)
 * Output: { success, data: { inquiryId, nextStep } }
 */
async function handleServiceRequest(
  input: Record<string, unknown>,
  ctx: ActionContext
): Promise<ActionResult> {
  const { providerId, serviceId, sourceType, sourceId, message } = input as {
    providerId?: string;
    serviceId?: string;
    sourceType?: string;
    sourceId?: string;
    message?: string;
  };

  if (!providerId) {
    return { success: false, error: "providerId is required", code: "VALIDATION" };
  }
  if (!ctx.userId) {
    return { success: false, error: "Authentication required", code: "UNAUTHORIZED" };
  }

  // Round 2: validate provider exists, is active, and accepts inquiries.
  // Round 2: create ProviderInquiry record in DB.
  // For Round 1 skeleton, we generate a placeholder inquiryId and publish the event.
  const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Publish inquiry.created — subscribers (notification adapter, analytics
  // adapter, provider pending-count updater) react to this.
  await publishEvent("inquiry.created", "service-provider", {
    inquiryId,
    requesterUserId: ctx.userId,
    providerId,
    serviceId: serviceId ?? null,
    sourceType: sourceType ?? "direct",
    sourceId: sourceId ?? null,
    message: message ?? "",
  });

  return {
    success: true,
    data: {
      inquiryId,
      nextStep: "conversation", // future: route to unified conversation module
    },
  };
}

/**
 * provider.favorite — toggle favorite on a provider.
 * Round 2: persist to ProviderFavorite (or reuse UserFavorite).
 */
async function handleProviderFavorite(
  input: Record<string, unknown>,
  ctx: ActionContext
): Promise<ActionResult> {
  const { providerId } = input as { providerId?: string };
  if (!providerId) {
    return { success: false, error: "providerId is required", code: "VALIDATION" };
  }
  if (!ctx.userId) {
    return { success: false, error: "Authentication required", code: "UNAUTHORIZED" };
  }
  // Round 2: toggle favorite in DB.
  return { success: true, data: { providerId, favorited: true } };
}

/**
 * provider.report — submit a report against a provider.
 * Round 2: persist to ProviderReport, publish provider.reported.
 */
async function handleProviderReport(
  input: Record<string, unknown>,
  ctx: ActionContext
): Promise<ActionResult> {
  const { providerId, reason, category } = input as {
    providerId?: string;
    reason?: string;
    category?: string;
  };
  if (!providerId || !reason) {
    return { success: false, error: "providerId and reason are required", code: "VALIDATION" };
  }
  if (!ctx.userId) {
    return { success: false, error: "Authentication required", code: "UNAUTHORIZED" };
  }
  // Round 2: create ProviderReport record.
  await publishEvent("provider.reported", "service-provider", {
    providerId,
    reporterUserId: ctx.userId,
    reason,
    category: category ?? "other",
  });
  return { success: true, data: { reported: true } };
}

/** Register all service-provider actions. Idempotent. */
export function registerServiceProviderActions(): void {
  registerAction({
    id: "service.request",
    moduleId: "service-provider",
    capability: "service.request",
    handler: handleServiceRequest,
  });

  registerAction({
    id: "provider.favorite",
    moduleId: "service-provider",
    capability: "provider.report", // any authenticated user can favorite
    handler: handleProviderFavorite,
  });

  registerAction({
    id: "provider.report",
    moduleId: "service-provider",
    capability: "provider.report",
    handler: handleProviderReport,
  });
}
