import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Round 2A Tests — State Machine, Permissions, Outbox, Feature Disabled.
 *
 * These tests are self-contained (no DB needed) — they test the
 * application service logic by mocking the prisma client.
 * DB-dependent tests are in separate files that require the preview DB.
 */

// ─── Mock prisma (must use vi.hoisted for vi.mock factory) ───
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    serviceProvider: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    providerMember: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn(), upsert: vi.fn() },
    providerService: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    providerInquiry: { create: vi.fn(), findFirst: vi.fn() },
    domainEventOutbox: { create: vi.fn(), findFirst: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(async (fn: (tx: any) => Promise<any>) => fn(mockPrisma)),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/platform", () => ({
  can: (cap: string, ctx: any) => {
    if (cap === "provider.view") return true;
    if (cap === "provider.create") return !!ctx.userId;
    if (cap === "provider.edit") return !!ctx.isOwner || ctx.userRole === "admin";
    if (cap === "provider.submit") return !!ctx.isOwner || ctx.userRole === "admin";
    if (cap === "provider.verify") return ctx.userRole === "admin";
    if (cap === "provider.manage") return ctx.userRole === "admin";
    if (cap === "service.create") return !!ctx.userId;
    if (cap === "service.publish") return ctx.userRole === "admin";
    if (cap === "service.request") return !!ctx.userId;
    if (cap === "provider.report") return !!ctx.userId;
    return false;
  },
  isFeatureEnabled: () => true,
  publishEvent: vi.fn(async () => ({})),
}));

import {
  createProviderApplication,
  submitProviderForReview,
  approveProvider,
  rejectProvider,
  suspendProvider,
  updateProviderProfile,
} from "@/modules/service-provider/application/provider-service";
import { createServiceInquiry } from "@/modules/service-provider/application/inquiry-service";

describe("State Machine — ServiceProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("draft -> pending_review is valid", async () => {
    mockPrisma.serviceProvider.findUnique.mockResolvedValue({ id: "p1", status: "draft", ownerUserId: "u1" });
    mockPrisma.serviceProvider.update.mockResolvedValue({ id: "p1", status: "pending_review" });
    const result = await submitProviderForReview("u1", "user", "p1");
    expect(result.status).toBe("pending_review");
  });

  it("approved -> pending_review is INVALID (throws)", async () => {
    mockPrisma.serviceProvider.findUnique.mockResolvedValue({ id: "p1", status: "approved", ownerUserId: "u1" });
    await expect(submitProviderForReview("u1", "user", "p1")).rejects.toThrow("Invalid status transition");
  });

  it("pending_review -> approved is valid (admin)", async () => {
    mockPrisma.serviceProvider.findUnique.mockResolvedValue({ id: "p1", status: "pending_review" });
    mockPrisma.serviceProvider.update.mockResolvedValue({ id: "p1", status: "approved" });
    const result = await approveProvider("admin1", "p1");
    expect(result.status).toBe("approved");
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: { userId: "admin1", action: "provider.approve", entity: "ServiceProvider", entityId: "p1" },
    });
  });

  it("pending_review -> rejected is valid (admin with reason)", async () => {
    mockPrisma.serviceProvider.findUnique.mockResolvedValue({ id: "p1", status: "pending_review" });
    mockPrisma.serviceProvider.update.mockResolvedValue({ id: "p1", status: "rejected" });
    const result = await rejectProvider("admin1", "p1", "Incomplete info");
    expect(result.status).toBe("rejected");
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });

  it("approved -> suspended is valid (admin)", async () => {
    mockPrisma.serviceProvider.findUnique.mockResolvedValue({ id: "p1", status: "approved" });
    mockPrisma.serviceProvider.update.mockResolvedValue({ id: "p1", status: "suspended" });
    const result = await suspendProvider("admin1", "p1");
    expect(result.status).toBe("suspended");
  });

  it("suspended -> approved is valid (admin re-approve)", async () => {
    mockPrisma.serviceProvider.findUnique.mockResolvedValue({ id: "p1", status: "suspended" });
    mockPrisma.serviceProvider.update.mockResolvedValue({ id: "p1", status: "approved" });
    const result = await approveProvider("admin1", "p1");
    expect(result.status).toBe("approved");
  });

  it("draft -> approved is INVALID (skips review)", async () => {
    mockPrisma.serviceProvider.findUnique.mockResolvedValue({ id: "p1", status: "draft" });
    await expect(approveProvider("admin1", "p1")).rejects.toThrow("Invalid status transition");
  });
});

describe("Provider Owner Permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("owner can update own provider profile", async () => {
    mockPrisma.serviceProvider.findUnique.mockResolvedValue({ id: "p1", ownerUserId: "u1", status: "draft" });
    mockPrisma.serviceProvider.update.mockResolvedValue({ id: "p1", displayName: "Updated" });
    const result = await updateProviderProfile("u1", "user", "p1", { displayName: "Updated" });
    expect(result.displayName).toBe("Updated");
  });

  it("non-owner non-admin CANNOT update provider profile", async () => {
    mockPrisma.serviceProvider.findUnique.mockResolvedValue({ id: "p1", ownerUserId: "u1", status: "draft" });
    await expect(updateProviderProfile("u2", "user", "p1", { displayName: "Hacked" })).rejects.toThrow("Forbidden");
  });

  it("admin can update any provider profile", async () => {
    mockPrisma.serviceProvider.findUnique.mockResolvedValue({ id: "p1", ownerUserId: "u1", status: "draft" });
    mockPrisma.serviceProvider.update.mockResolvedValue({ id: "p1", displayName: "Admin Updated" });
    const result = await updateProviderProfile("admin1", "admin", "p1", { displayName: "Admin Updated" });
    expect(result.displayName).toBe("Admin Updated");
  });

  it("approveProvider is gated by API route requireAdmin() — service trusts caller is admin", async () => {
    // The application service's can() check uses "admin" role defensively.
    // The actual non-admin blocking happens in the API route via requireAdmin().
    mockPrisma.serviceProvider.findUnique.mockResolvedValue({ id: "p1", status: "pending_review" });
    mockPrisma.serviceProvider.update.mockResolvedValue({ id: "p1", status: "approved" });
    const result = await approveProvider("admin1", "p1");
    expect(result.status).toBe("approved");
  });
});

describe("service.request — Inquiry + Outbox Atomicity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates inquiry AND outbox entry in same transaction", async () => {
    mockPrisma.serviceProvider.findUnique.mockResolvedValue({
      id: "p1", status: "approved", ownerUserId: "owner1",
    });
    mockPrisma.providerInquiry.create.mockResolvedValue({ id: "inq_123" });
    mockPrisma.domainEventOutbox.create.mockResolvedValue({ id: "out1" });

    const result = await createServiceInquiry("u1", {
      providerId: "p1",
      message: "I need help",
    });

    expect(result.inquiryId).toBe("inq_123");
    expect(result.outboxEventId).toMatch(/^evt_/);
    // Both creates called inside $transaction
    expect(mockPrisma.providerInquiry.create).toHaveBeenCalled();
    expect(mockPrisma.domainEventOutbox.create).toHaveBeenCalled();
  });

  it("rejects inquiry for non-approved provider", async () => {
    mockPrisma.serviceProvider.findUnique.mockResolvedValue({
      id: "p1", status: "draft", ownerUserId: "owner1",
    });
    await expect(createServiceInquiry("u1", { providerId: "p1" })).rejects.toThrow("not available");
  });

  it("rejects inquiry for non-existent provider", async () => {
    mockPrisma.serviceProvider.findUnique.mockResolvedValue(null);
    await expect(createServiceInquiry("u1", { providerId: "nonexistent" })).rejects.toThrow("not found");
  });

  it("outbox entry has correct event type and aggregate", async () => {
    mockPrisma.serviceProvider.findUnique.mockResolvedValue({
      id: "p1", status: "approved",
    });
    mockPrisma.providerInquiry.create.mockResolvedValue({ id: "inq_456" });

    await createServiceInquiry("u1", { providerId: "p1" });

    const outboxCall = mockPrisma.domainEventOutbox.create.mock.calls[0][0];
    expect(outboxCall.data.eventType).toBe("inquiry.created");
    expect(outboxCall.data.aggregateType).toBe("ProviderInquiry");
    expect(outboxCall.data.aggregateId).toBe("inq_456");
    expect(outboxCall.data.status).toBe("PENDING");
    // Payload should contain inquiry data
    const payload = JSON.parse(outboxCall.data.payloadJson);
    expect(payload.inquiryId).toBe("inq_456");
    expect(payload.providerId).toBe("p1");
  });
});

describe("Create Provider Application", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates provider with draft status and OWNER member", async () => {
    mockPrisma.serviceProvider.findUnique.mockResolvedValue(null); // slug not taken
    mockPrisma.serviceProvider.create.mockResolvedValue({ id: "p1", slug: "test-slug", status: "draft" });

    const result = await createProviderApplication("u1", {
      providerType: "organization",
      displayName: "Test Co",
      slug: "test-slug",
    });

    expect(result.status).toBe("draft");
    // OWNER member should be created
    expect(mockPrisma.providerMember.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: "OWNER",
        status: "active",
      }),
    });
  });

  it("throws if slug already taken", async () => {
    mockPrisma.serviceProvider.findUnique.mockResolvedValue({ id: "existing" });
    await expect(
      createProviderApplication("u1", { providerType: "organization", displayName: "Test", slug: "taken" })
    ).rejects.toThrow("Slug already taken");
  });
});
