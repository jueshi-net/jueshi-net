/**
 * Inquiry Application Service.
 *
 * Creates a ProviderInquiry + DomainEventOutbox in the SAME database
 * transaction. The outbox entry is processed asynchronously by the
 * outbox worker, which publishes to the platform event bus.
 *
 * This ensures atomicity: the inquiry and the event record are committed
 * together. Cross-module side effects (notifications, analytics) happen
 * asynchronously via the outbox, NOT in this transaction.
 */
import { prisma } from "../infrastructure/db";
import { can } from "@/platform";

export async function createServiceInquiry(
  userId: string,
  input: {
    providerId: string;
    serviceId?: string;
    sourceType?: string;
    sourceId?: string;
    message?: string;
  }
): Promise<{ inquiryId: string; outboxEventId: string }> {
  // 1. Capability check
  if (!can("service.request", { userId, userRole: "user", moduleFlagEnabled: true })) {
    throw new Error("Forbidden: service.request");
  }

  // 2. Validate provider exists, is approved, and accepts inquiries
  const provider = await prisma.serviceProvider.findUnique({
    where: { id: input.providerId },
  });
  if (!provider) throw new Error("Provider not found");
  if (provider.status !== "approved") throw new Error("Provider is not available for inquiries");

  // 3. Validate service exists and belongs to provider (if serviceId provided)
  if (input.serviceId) {
    const service = await prisma.providerService.findUnique({
      where: { id: input.serviceId },
    });
    if (!service) throw new Error("Service not found");
    if (service.providerId !== input.providerId) {
      throw new Error("Service does not belong to this provider");
    }
    if (service.status !== "published") throw new Error("Service is not available for inquiries");
  }

  // 4. Create inquiry + outbox in SAME transaction
  const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const outboxEventId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const result = await prisma.$transaction(async (tx) => {
    // Create the inquiry
    const inquiry = await tx.providerInquiry.create({
      data: {
        id: inquiryId,
        requesterUserId: userId,
        providerId: input.providerId,
        serviceId: input.serviceId ?? null,
        sourceType: input.sourceType ?? "direct",
        sourceId: input.sourceId ?? null,
        message: input.message ?? "",
        status: "new",
      },
    });

    // Create the outbox entry (same transaction = atomic)
    await tx.domainEventOutbox.create({
      data: {
        eventId: outboxEventId,
        eventType: "inquiry.created",
        aggregateType: "ProviderInquiry",
        aggregateId: inquiry.id,
        payloadJson: JSON.stringify({
          inquiryId: inquiry.id,
          requesterUserId: userId,
          providerId: input.providerId,
          serviceId: input.serviceId ?? null,
          sourceType: input.sourceType ?? "direct",
          sourceId: input.sourceId ?? null,
          message: input.message ?? "",
        }),
        status: "PENDING",
      },
    });

    return inquiry;
  });

  return { inquiryId: result.id, outboxEventId };
}
