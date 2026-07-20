import { describe, it, expect, beforeEach } from "vitest";
import {
  can,
  defineCapability,
  registerDefaultCapabilities,
  isCapabilityDefined,
  getAllCapabilities,
  _resetCapabilities,
  type CapabilityContext,
} from "@/platform";

describe("Capability / Permission API", () => {
  beforeEach(() => {
    _resetCapabilities();
    registerDefaultCapabilities();
  });

  it("unknown capability is denied", () => {
    expect(can("unknown.capability", { userId: "u1" })).toBe(false);
  });

  it("isCapabilityDefined checks registration", () => {
    expect(isCapabilityDefined("provider.view")).toBe(true);
    expect(isCapabilityDefined("nonexistent.cap")).toBe(false);
  });

  describe("provider.view (public)", () => {
    it("anonymous can view", () => {
      expect(can("provider.view", {})).toBe(true);
    });
    it("authenticated can view", () => {
      expect(can("provider.view", { userId: "u1" })).toBe(true);
    });
  });

  describe("provider.create (authenticated)", () => {
    it("anonymous cannot create", () => {
      expect(can("provider.create", {})).toBe(false);
    });
    it("authenticated can create", () => {
      expect(can("provider.create", { userId: "u1" })).toBe(true);
    });
  });

  describe("provider.edit (owner or admin)", () => {
    it("anonymous cannot edit", () => {
      expect(can("provider.edit", {})).toBe(false);
    });
    it("non-owner non-admin cannot edit", () => {
      expect(can("provider.edit", { userId: "u1", isOwner: false })).toBe(false);
    });
    it("owner can edit", () => {
      expect(can("provider.edit", { userId: "u1", isOwner: true })).toBe(true);
    });
    it("admin can edit", () => {
      expect(can("provider.edit", { userId: "u1", userRole: "admin" })).toBe(true);
    });
  });

  describe("provider.submit (owner or admin)", () => {
    it("non-owner cannot submit", () => {
      expect(can("provider.submit", { userId: "u1", isOwner: false })).toBe(false);
    });
    it("owner can submit", () => {
      expect(can("provider.submit", { userId: "u1", isOwner: true })).toBe(true);
    });
  });

  describe("provider.verify (admin only)", () => {
    it("non-admin cannot verify", () => {
      expect(can("provider.verify", { userId: "u1", userRole: "user" })).toBe(false);
    });
    it("admin can verify", () => {
      expect(can("provider.verify", { userId: "u1", userRole: "admin" })).toBe(true);
    });
  });

  describe("provider.manage (admin only)", () => {
    it("non-admin cannot manage", () => {
      expect(can("provider.manage", { userId: "u1", userRole: "user" })).toBe(false);
    });
    it("admin can manage", () => {
      expect(can("provider.manage", { userId: "u1", userRole: "admin" })).toBe(true);
    });
  });

  describe("service.publish (admin only)", () => {
    it("owner cannot publish (needs admin)", () => {
      expect(can("service.publish", { userId: "u1", isOwner: true })).toBe(false);
    });
    it("admin can publish", () => {
      expect(can("service.publish", { userId: "u1", userRole: "admin" })).toBe(true);
    });
  });

  describe("service.request (authenticated)", () => {
    it("anonymous cannot request", () => {
      expect(can("service.request", {})).toBe(false);
    });
    it("authenticated can request", () => {
      expect(can("service.request", { userId: "u1" })).toBe(true);
    });
  });

  describe("provider.report (authenticated)", () => {
    it("anonymous cannot report", () => {
      expect(can("provider.report", {})).toBe(false);
    });
    it("authenticated can report", () => {
      expect(can("provider.report", { userId: "u1" })).toBe(true);
    });
  });

  it("defineCapability allows custom capabilities", () => {
    defineCapability("custom.action", (ctx) => ctx.extra?.magicKey === "secret");
    expect(can("custom.action", { extra: { magicKey: "secret" } })).toBe(true);
    expect(can("custom.action", { extra: { magicKey: "wrong" } })).toBe(false);
  });

  it("getAllCapabilities returns all registered", () => {
    const caps = getAllCapabilities();
    expect(caps).toContain("provider.view");
    expect(caps).toContain("provider.create");
    expect(caps).toContain("provider.edit");
    expect(caps).toContain("provider.verify");
    expect(caps.length).toBeGreaterThanOrEqual(11);
  });
});
