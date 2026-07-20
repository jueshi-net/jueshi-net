import { describe, it, expect, beforeEach } from "vitest";
import {
  executeAction,
  registerAction,
  getAction,
  _resetActions,
  _resetCapabilities,
  registerDefaultCapabilities,
  _resetEvents,
  getPublishedEvents,
  type ActionContext,
} from "@/platform";
import { registerServiceProviderActions } from "@/modules/service-provider/actions";

describe("Action Registry — service.request", () => {
  beforeEach(() => {
    _resetActions();
    _resetCapabilities();
    _resetEvents();
    registerDefaultCapabilities();
    registerServiceProviderActions();
  });

  it("unknown action returns UNKNOWN_ACTION", async () => {
    const result = await executeAction("nonexistent.action", {}, { userId: "u1" });
    expect(result.success).toBe(false);
    expect(result.code).toBe("UNKNOWN_ACTION");
  });

  it("service.request without userId returns FORBIDDEN (capability gate)", async () => {
    const result = await executeAction(
      "service.request",
      { providerId: "p1" },
      {} as ActionContext
    );
    expect(result.success).toBe(false);
    expect(result.code).toBe("FORBIDDEN");
  });

  it("service.request without providerId returns VALIDATION error", async () => {
    const result = await executeAction(
      "service.request",
      {},
      { userId: "u1" }
    );
    expect(result.success).toBe(false);
    expect(result.code).toBe("VALIDATION");
  });

  it("service.request with valid input creates inquiry and returns inquiryId", async () => {
    const result = await executeAction(
      "service.request",
      {
        providerId: "prov-123",
        serviceId: "svc-456",
        sourceType: "tool",
        sourceId: "tracking-calculator",
        message: "I need help with shipping",
      },
      { userId: "user-789" }
    );
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    const data = result.data as { inquiryId: string; nextStep: string };
    expect(data.inquiryId).toMatch(/^inq_/);
    expect(data.nextStep).toBe("conversation");
  });

  it("service.request publishes inquiry.created event", async () => {
    await executeAction(
      "service.request",
      {
        providerId: "prov-evt",
        message: "test event",
      },
      { userId: "user-evt" }
    );
    const events = getPublishedEvents("inquiry.created");
    expect(events).toHaveLength(1);
    expect(events[0].moduleId).toBe("service-provider");
    expect(events[0].payload.providerId).toBe("prov-evt");
    expect(events[0].payload.requesterUserId).toBe("user-evt");
  });

  it("service.request works without serviceId (direct provider inquiry)", async () => {
    const result = await executeAction(
      "service.request",
      { providerId: "p1" },
      { userId: "u1" }
    );
    expect(result.success).toBe(true);
    const events = getPublishedEvents("inquiry.created");
    expect(events[0].payload.serviceId).toBeNull();
  });
});

describe("Action Registry — provider.report", () => {
  beforeEach(() => {
    _resetActions();
    _resetCapabilities();
    _resetEvents();
    registerDefaultCapabilities();
    registerServiceProviderActions();
  });

  it("provider.report requires providerId and reason", async () => {
    const result = await executeAction(
      "provider.report",
      { providerId: "p1" }, // missing reason
      { userId: "u1" }
    );
    expect(result.success).toBe(false);
    expect(result.code).toBe("VALIDATION");
  });

  it("provider.report publishes provider.reported event", async () => {
    const result = await executeAction(
      "provider.report",
      { providerId: "p1", reason: "Spam listings", category: "spam" },
      { userId: "u1" }
    );
    expect(result.success).toBe(true);
    const events = getPublishedEvents("provider.reported");
    expect(events).toHaveLength(1);
    expect(events[0].payload.providerId).toBe("p1");
    expect(events[0].payload.reason).toBe("Spam listings");
  });
});

describe("Action Registry — provider.favorite", () => {
  beforeEach(() => {
    _resetActions();
    _resetCapabilities();
    _resetEvents();
    registerDefaultCapabilities();
    registerServiceProviderActions();
  });

  it("provider.favorite requires providerId", async () => {
    const result = await executeAction(
      "provider.favorite",
      {},
      { userId: "u1" }
    );
    expect(result.success).toBe(false);
    expect(result.code).toBe("VALIDATION");
  });

  it("provider.favorite returns success with valid input", async () => {
    const result = await executeAction(
      "provider.favorite",
      { providerId: "p1" },
      { userId: "u1" }
    );
    expect(result.success).toBe(true);
    expect((result.data as { providerId: string }).providerId).toBe("p1");
  });
});

describe("Action Registry — handler error handling", () => {
  it("handler throw returns INTERNAL_ERROR", async () => {
    _resetActions();
    _resetCapabilities();
    registerDefaultCapabilities();

    registerAction({
      id: "test.throw",
      moduleId: "test",
      handler: async () => {
        throw new Error("boom");
      },
    });

    const result = await executeAction("test.throw", {}, { userId: "u1" });
    expect(result.success).toBe(false);
    expect(result.code).toBe("INTERNAL_ERROR");
    expect(result.error).toBe("boom");
  });
});
