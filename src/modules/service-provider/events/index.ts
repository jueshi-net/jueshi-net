/**
 * service-provider event contract.
 *
 * Defines the event types this module publishes and subscribes to.
 * The actual pub/sub is handled by the platform event bus; this module
 * just declares the contract and provides typed helpers.
 */
import { subscribeToEvent, type EventHandler, type PlatformEvent } from "@/platform";

/** Event types published by this module. */
export const SERVICE_PROVIDER_EVENTS_PUBLISHED = [
  "provider.created",
  "provider.submitted",
  "provider.verified",
  "provider.rejected",
  "service.created",
  "service.published",
  "inquiry.created",
  "provider.reported",
] as const;

/** Event types this module subscribes to. */
export const SERVICE_PROVIDER_EVENTS_SUBSCRIBED = [
  "inquiry.created",
] as const;

/** Typed payload for inquiry.created events. */
export interface InquiryCreatedPayload {
  inquiryId: string;
  requesterUserId: string;
  providerId: string;
  serviceId: string | null;
  sourceType: string;
  sourceId: string | null;
  message: string;
}

/**
 * Subscribe to inquiry.created events.
 *
 * First-version subscribers (wired in Round 2):
 *   - notification adapter  -> send provider a notification
 *   - analytics adapter      -> record source attribution
 *   - provider pending-count -> increment provider's pending inquiry count
 *
 * @returns unsubscribe function
 */
export function onInquiryCreated(handler: (payload: InquiryCreatedPayload, event: PlatformEvent) => void): () => void {
  const wrapped: EventHandler = (event) => {
    handler(event.payload as unknown as InquiryCreatedPayload, event);
  };
  return subscribeToEvent("inquiry.created", wrapped);
}

/**
 * Register default event subscribers for the service-provider module.
 * Round 1: logs to the platform event log (for audit). Round 2 will wire
 * real notification/analytics adapters.
 */
export function registerServiceProviderEventSubscribers(): void {
  onInquiryCreated((_payload, _event) => {
    // Round 2: trigger notification + analytics + pending-count update.
    // For Round 1, subscription existence is verified via the event log.
  });
}
