import { describe, it, expect, beforeEach } from "vitest";
import {
  defineModule,
  registerModule,
  getModuleById,
  getEnabledModules,
  getAllModules,
  isModuleEnabled,
  getEnabledNavigation,
  getEnabledAdminNavigation,
  _resetModuleRegistry,
} from "@/platform";
import {
  defineFlag,
  setAdminOverride,
  clearAdminOverride,
  _resetAllFlags,
} from "@/platform";

describe("Module Registry", () => {
  beforeEach(() => {
    _resetModuleRegistry();
    _resetAllFlags();
  });

  it("defineModule creates a valid definition", () => {
    const mod = defineModule({
      id: "test-mod",
      version: "1.0.0",
      featureFlag: "FEATURE_TEST",
      capabilities: ["test.view"],
      routes: [{ path: "/test", type: "public" }],
      navigation: [{ area: "main", label: "Test", href: "/test" }],
      adminNavigation: [],
      blocks: [],
      actions: [],
      eventsPublished: [],
    });
    expect(mod.id).toBe("test-mod");
    expect(mod.version).toBe("1.0.0");
    expect(mod.featureFlag).toBe("FEATURE_TEST");
  });

  it("defineModule throws on missing id", () => {
    expect(() =>
      defineModule({
        id: "",
        version: "1.0.0",
        featureFlag: "FEATURE_TEST",
        capabilities: [],
        routes: [],
        navigation: [],
        adminNavigation: [],
        blocks: [],
        actions: [],
        eventsPublished: [],
      })
    ).toThrow();
  });

  it("defineModule throws on missing featureFlag", () => {
    expect(() =>
      defineModule({
        id: "test-mod",
        version: "1.0.0",
        featureFlag: "",
        capabilities: [],
        routes: [],
        navigation: [],
        adminNavigation: [],
        blocks: [],
        actions: [],
        eventsPublished: [],
      })
    ).toThrow();
  });

  it("registerModule + getModuleById round-trips", () => {
    const mod = defineModule({
      id: "mod-a",
      version: "1.0.0",
      featureFlag: "FEATURE_A",
      capabilities: [],
      routes: [],
      navigation: [],
      adminNavigation: [],
      blocks: [],
      actions: [],
      eventsPublished: [],
    });
    registerModule(mod);
    expect(getModuleById("mod-a")).toBe(mod);
    expect(getModuleById("nonexistent")).toBeUndefined();
  });

  it("registerModule is idempotent (no duplicate)", () => {
    const mod = defineModule({
      id: "mod-b",
      version: "1.0.0",
      featureFlag: "FEATURE_B",
      capabilities: [],
      routes: [],
      navigation: [],
      adminNavigation: [],
      blocks: [],
      actions: [],
      eventsPublished: [],
    });
    registerModule(mod);
    registerModule(mod); // second call is a no-op
    expect(getAllModules().filter((m) => m.id === "mod-b")).toHaveLength(1);
  });

  it("getEnabledModules respects feature flags", () => {
    defineFlag("FEATURE_ON", true);
    defineFlag("FEATURE_OFF", false);

    const modOn = defineModule({
      id: "mod-on",
      version: "1.0.0",
      featureFlag: "FEATURE_ON",
      capabilities: [],
      routes: [],
      navigation: [],
      adminNavigation: [],
      blocks: [],
      actions: [],
      eventsPublished: [],
    });
    const modOff = defineModule({
      id: "mod-off",
      version: "1.0.0",
      featureFlag: "FEATURE_OFF",
      capabilities: [],
      routes: [],
      navigation: [],
      adminNavigation: [],
      blocks: [],
      actions: [],
      eventsPublished: [],
    });
    registerModule(modOn);
    registerModule(modOff);

    const enabled = getEnabledModules();
    expect(enabled.map((m) => m.id)).toContain("mod-on");
    expect(enabled.map((m) => m.id)).not.toContain("mod-off");
  });

  it("isModuleEnabled returns false for unregistered module", () => {
    expect(isModuleEnabled("nonexistent")).toBe(false);
  });

  it("isModuleEnabled respects admin override", () => {
    defineFlag("FEATURE_X", false);
    const mod = defineModule({
      id: "mod-x",
      version: "1.0.0",
      featureFlag: "FEATURE_X",
      capabilities: [],
      routes: [],
      navigation: [],
      adminNavigation: [],
      blocks: [],
      actions: [],
      eventsPublished: [],
    });
    registerModule(mod);
    expect(isModuleEnabled("mod-x")).toBe(false);

    setAdminOverride("FEATURE_X", true);
    expect(isModuleEnabled("mod-x")).toBe(true);

    clearAdminOverride("FEATURE_X");
    expect(isModuleEnabled("mod-x")).toBe(false);
  });

  it("getEnabledNavigation filters by area and respects flags", () => {
    defineFlag("FEATURE_NAV", true);
    defineFlag("FEATURE_NAV_OFF", false);

    registerModule(
      defineModule({
        id: "mod-nav",
        version: "1.0.0",
        featureFlag: "FEATURE_NAV",
        capabilities: [],
        routes: [],
        navigation: [
          { area: "main", label: "Nav Main", href: "/nav-main", sortOrder: 10 },
          { area: "workspace", label: "Nav WS", href: "/nav-ws" },
        ],
        adminNavigation: [{ label: "Admin", href: "/admin/nav" }],
        blocks: [],
        actions: [],
        eventsPublished: [],
      })
    );
    registerModule(
      defineModule({
        id: "mod-nav-off",
        version: "1.0.0",
        featureFlag: "FEATURE_NAV_OFF",
        capabilities: [],
        routes: [],
        navigation: [{ area: "main", label: "Hidden", href: "/hidden" }],
        adminNavigation: [],
        blocks: [],
        actions: [],
        eventsPublished: [],
      })
    );

    const mainNav = getEnabledNavigation("main");
    expect(mainNav).toHaveLength(1);
    expect(mainNav[0].label).toBe("Nav Main");
    expect(mainNav[0].moduleId).toBe("mod-nav");

    const wsNav = getEnabledNavigation("workspace");
    expect(wsNav).toHaveLength(1);
    expect(wsNav[0].label).toBe("Nav WS");

    const adminNav = getEnabledAdminNavigation();
    expect(adminNav).toHaveLength(1);
    expect(adminNav[0].label).toBe("Admin");
  });
});
