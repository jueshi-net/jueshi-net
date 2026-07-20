import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock prisma before any service-provider imports that trigger the import chain:
// public -> application/queries -> infrastructure/db -> lib/prisma
// lib/prisma throws if DATABASE_URL is not set, crashing the test file.
vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

import {
  defineFlag,
  setAdminOverride,
  _resetAllFlags,
  _resetModuleRegistry,
  _resetBlocks,
  _resetActions,
  _resetCapabilities,
  _resetEvents,
  getEnabledModules,
  getEnabledNavigation,
  getEnabledAdminNavigation,
  getBlocksForPage,
  getEnabledBlocks,
  wireBlockModuleChecker,
  isModuleEnabled,
  registerDefaultCapabilities,
} from "@/platform";
import { registerServiceProvider } from "@/modules/service-provider/public";
import { serviceProviderModule } from "@/modules/service-provider/module";
import { registerModule } from "@/platform";

/**
 * Feature-disabled tests.
 *
 * Verifies that when FEATURE_SERVICE_PROVIDER=false:
 *   - module not in getEnabledModules()
 *   - navigation not visible
 *   - admin navigation not visible
 *   - blocks not in getEnabledBlocks()
 *
 * And when FEATURE_SERVICE_PROVIDER=true:
 *   - everything visible
 */
describe("Feature Disabled: FEATURE_SERVICE_PROVIDER=false", () => {
  beforeEach(() => {
    _resetAllFlags();
    _resetModuleRegistry();
    _resetBlocks();
    _resetActions();
    _resetCapabilities();
    _resetEvents();
    // Ensure flag is OFF (default) - delete env var to prevent override
    delete process.env.FEATURE_SERVICE_PROVIDER;
    defineFlag("FEATURE_SERVICE_PROVIDER", false);
    registerServiceProvider();
  });

  it("module is NOT in getEnabledModules", () => {
    const enabled = getEnabledModules();
    expect(enabled.map((m) => m.id)).not.toContain("service-provider");
  });

  it("isModuleEnabled returns false", () => {
    expect(isModuleEnabled("service-provider")).toBe(false);
  });

  it("main navigation is NOT visible", () => {
    const nav = getEnabledNavigation("main");
    expect(nav.map((n) => n.label)).not.toContain("服务商");
  });

  it("workspace navigation is NOT visible", () => {
    const nav = getEnabledNavigation("workspace");
    expect(nav.map((n) => n.label)).not.toContain("服务商中心");
  });

  it("admin navigation is NOT visible", () => {
    const nav = getEnabledAdminNavigation();
    expect(nav.map((n) => n.label)).not.toContain("服务商管理");
  });

  it("blocks are NOT in getEnabledBlocks", () => {
    const blocks = getEnabledBlocks("service-providers-index");
    expect(blocks.map((b) => b.id)).not.toContain("service-provider-list");
  });

  it("blocks ARE in getBlocksForPage (raw, ignores flag)", () => {
    // Raw query ignores feature flag — blocks are registered but dormant
    const blocks = getBlocksForPage("service-providers-index");
    expect(blocks.map((b) => b.id)).toContain("service-provider-list");
  });
});

describe("Feature Enabled: FEATURE_SERVICE_PROVIDER=true", () => {
  beforeEach(() => {
    _resetAllFlags();
    _resetModuleRegistry();
    _resetBlocks();
    _resetActions();
    _resetCapabilities();
    _resetEvents();
    defineFlag("FEATURE_SERVICE_PROVIDER", true);
    registerServiceProvider();
  });

  it("module IS in getEnabledModules", () => {
    const enabled = getEnabledModules();
    expect(enabled.map((m) => m.id)).toContain("service-provider");
  });

  it("isModuleEnabled returns true", () => {
    expect(isModuleEnabled("service-provider")).toBe(true);
  });

  it("main navigation IS visible", () => {
    const nav = getEnabledNavigation("main");
    expect(nav.map((n) => n.label)).toContain("服务商");
    expect(nav.find((n) => n.label === "服务商")?.href).toBe("/service-providers");
  });

  it("workspace navigation IS visible", () => {
    const nav = getEnabledNavigation("workspace");
    expect(nav.map((n) => n.label)).toContain("服务商中心");
  });

  it("admin navigation IS visible", () => {
    const nav = getEnabledAdminNavigation();
    expect(nav.map((n) => n.label)).toContain("服务商管理");
  });

  it("blocks ARE in getEnabledBlocks", () => {
    const blocks = getEnabledBlocks("service-providers-index");
    expect(blocks.map((b) => b.id)).toContain("service-provider-list");
  });

  it("recommendations block appears on home page", () => {
    const blocks = getEnabledBlocks("home");
    expect(blocks.map((b) => b.id)).toContain("service-provider-recommendations");
  });

  it("trust-card block appears on provider-detail page", () => {
    const blocks = getEnabledBlocks("provider-detail");
    expect(blocks.map((b) => b.id)).toContain("provider-trust-card");
    expect(blocks.map((b) => b.id)).toContain("service-request-cta");
  });
});

describe("Feature Toggle Runtime Switch", () => {
  beforeEach(() => {
    _resetAllFlags();
    _resetModuleRegistry();
    _resetBlocks();
    _resetActions();
    _resetCapabilities();
    _resetEvents();
    defineFlag("FEATURE_SERVICE_PROVIDER", false);
    registerServiceProvider();
  });

  it("admin override can enable module at runtime without deploy", () => {
    expect(isModuleEnabled("service-provider")).toBe(false);

    setAdminOverride("FEATURE_SERVICE_PROVIDER", true);

    expect(isModuleEnabled("service-provider")).toBe(true);
    const nav = getEnabledNavigation("main");
    expect(nav.map((n) => n.label)).toContain("服务商");
  });
});
