import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  subscribeToEvent,
  publishEvent,
  publishEventSync,
  getPublishedEvents,
  _resetEvents,
} from "@/platform";

describe("Event Contract System", () => {
  beforeEach(() => {
    _resetEvents();
  });

  it("publishEvent logs to event log", async () => {
    await publishEvent("test.event", "test-module", { key: "value" });
    const events = getPublishedEvents("test.event");
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("test.event");
    expect(events[0].moduleId).toBe("test-module");
    expect(events[0].payload.key).toBe("value");
    expect(events[0].eventId).toMatch(/^evt_/);
    expect(events[0].timestamp).toBeInstanceOf(Date);
  });

  it("subscribeToEvent receives published events", async () => {
    const handler = vi.fn();
    const unsub = subscribeToEvent("inquiry.created", handler);

    await publishEvent("inquiry.created", "service-provider", {
      inquiryId: "inq-1",
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "inquiry.created",
        payload: { inquiryId: "inq-1" },
      })
    );

    unsub();
  });

  it("unsubscribe stops receiving events", async () => {
    const handler = vi.fn();
    const unsub = subscribeToEvent("test.unsub", handler);

    await publishEvent("test.unsub", "mod", {});
    expect(handler).toHaveBeenCalledTimes(1);

    unsub();
    await publishEvent("test.unsub", "mod", {});
    expect(handler).toHaveBeenCalledTimes(1); // still 1, not 2
  });

  it("multiple subscribers all receive events", async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    subscribeToEvent("multi.event", handler1);
    subscribeToEvent("multi.event", handler2);

    await publishEvent("multi.event", "mod", { n: 1 });

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it("handler errors do not break publish pipeline", async () => {
    const goodHandler = vi.fn();
    const badHandler = vi.fn(() => {
      throw new Error("handler error");
    });

    subscribeToEvent("safe.event", badHandler);
    subscribeToEvent("safe.event", goodHandler);

    // Should not throw
    await publishEvent("safe.event", "mod", {});

    // goodHandler should still be called despite badHandler throwing
    expect(badHandler).toHaveBeenCalledTimes(1);
    expect(goodHandler).toHaveBeenCalledTimes(1);
  });

  it("publishEventSync works for fire-and-forget contexts", () => {
    const handler = vi.fn();
    subscribeToEvent("sync.event", handler);

    const event = publishEventSync("sync.event", "mod", { sync: true });

    expect(event.type).toBe("sync.event");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("getPublishedEvents filters by type", async () => {
    await publishEvent("type.a", "mod", {});
    await publishEvent("type.b", "mod", {});
    await publishEvent("type.a", "mod", {});

    expect(getPublishedEvents("type.a")).toHaveLength(2);
    expect(getPublishedEvents("type.b")).toHaveLength(1);
    expect(getPublishedEvents()).toHaveLength(3); // all
  });

  it("inquiry.created event has correct contract shape", async () => {
    await publishEvent("inquiry.created", "service-provider", {
      inquiryId: "inq_test",
      requesterUserId: "u1",
      providerId: "p1",
      serviceId: null,
      sourceType: "direct",
      sourceId: null,
      message: "hello",
    });

    const [event] = getPublishedEvents("inquiry.created");
    expect(event.moduleId).toBe("service-provider");
    expect(event.payload).toMatchObject({
      inquiryId: "inq_test",
      requesterUserId: "u1",
      providerId: "p1",
      serviceId: null,
      sourceType: "direct",
      sourceId: null,
      message: "hello",
    });
  });
});
