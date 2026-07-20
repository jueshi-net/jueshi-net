import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isFeatureEnabled,
  defineFlag,
  setAdminOverride,
  clearAdminOverride,
  addUserToWhitelist,
  removeUserFromWhitelist,
  emergencyDisable,
  emergencyEnable,
  isEmergencyDisabled,
  getAllFlags,
  _resetAllFlags,
} from "@/platform";

describe("Feature Flags", () => {
  beforeEach(() => {
    _resetAllFlags();
  });

  afterEach(() => {
    // Clean up any env vars we set
    delete process.env.FEATURE_TEST_ENV;
  });

  it("unknown flag defaults to false (deny-by-default)", () => {
    expect(isFeatureEnabled("FEATURE_UNKNOWN")).toBe(false);
  });

  it("defineFlag sets a default value", () => {
    defineFlag("FEATURE_DEFAULT_TRUE", true);
    defineFlag("FEATURE_DEFAULT_FALSE", false);
    expect(isFeatureEnabled("FEATURE_DEFAULT_TRUE")).toBe(true);
    expect(isFeatureEnabled("FEATURE_DEFAULT_FALSE")).toBe(false);
  });

  it("environment variable overrides default", () => {
    defineFlag("FEATURE_TEST_ENV", false);
    expect(isFeatureEnabled("FEATURE_TEST_ENV")).toBe(false);

    process.env.FEATURE_TEST_ENV = "true";
    expect(isFeatureEnabled("FEATURE_TEST_ENV")).toBe(true);

    process.env.FEATURE_TEST_ENV = "1";
    expect(isFeatureEnabled("FEATURE_TEST_ENV")).toBe(true);

    process.env.FEATURE_TEST_ENV = "false";
    expect(isFeatureEnabled("FEATURE_TEST_ENV")).toBe(false);
  });

  it("admin override beats env and default", () => {
    defineFlag("FEATURE_ADMIN", false);
    process.env.FEATURE_ADMIN = "false";

    setAdminOverride("FEATURE_ADMIN", true);
    expect(isFeatureEnabled("FEATURE_ADMIN")).toBe(true);

    clearAdminOverride("FEATURE_ADMIN");
    expect(isFeatureEnabled("FEATURE_ADMIN")).toBe(false);
  });

  it("user whitelist enables flag for specific user only", () => {
    defineFlag("FEATURE_WHITELIST", false);
    expect(isFeatureEnabled("FEATURE_WHITELIST")).toBe(false);

    addUserToWhitelist("FEATURE_WHITELIST", "user-123");
    expect(isFeatureEnabled("FEATURE_WHITELIST", { userId: "user-123" })).toBe(true);
    expect(isFeatureEnabled("FEATURE_WHITELIST", { userId: "user-456" })).toBe(false);
    expect(isFeatureEnabled("FEATURE_WHITELIST")).toBe(false); // no user context

    removeUserFromWhitelist("FEATURE_WHITELIST", "user-123");
    expect(isFeatureEnabled("FEATURE_WHITELIST", { userId: "user-123" })).toBe(false);
  });

  it("emergency shutoff is highest priority (beats admin + whitelist + env)", () => {
    defineFlag("FEATURE_EMERGENCY", true);
    setAdminOverride("FEATURE_EMERGENCY", true);
    addUserToWhitelist("FEATURE_EMERGENCY", "user-1");
    process.env.FEATURE_EMERGENCY = "true";

    emergencyDisable("FEATURE_EMERGENCY");
    expect(isEmergencyDisabled("FEATURE_EMERGENCY")).toBe(true);
    expect(isFeatureEnabled("FEATURE_EMERGENCY")).toBe(false);
    expect(isFeatureEnabled("FEATURE_EMERGENCY", { userId: "user-1" })).toBe(false);

    emergencyEnable("FEATURE_EMERGENCY");
    expect(isFeatureEnabled("FEATURE_EMERGENCY")).toBe(true); // admin override kicks back in
  });

  it("priority order: emergency > admin > whitelist > env > default", () => {
    defineFlag("FEATURE_PRIORITY", true); // default true
    process.env.FEATURE_PRIORITY = "false"; // env false -> beats default
    expect(isFeatureEnabled("FEATURE_PRIORITY")).toBe(false);

    setAdminOverride("FEATURE_PRIORITY", true); // admin true -> beats env
    expect(isFeatureEnabled("FEATURE_PRIORITY")).toBe(true);

    emergencyDisable("FEATURE_PRIORITY"); // emergency -> beats all
    expect(isFeatureEnabled("FEATURE_PRIORITY")).toBe(false);

    emergencyEnable("FEATURE_PRIORITY");
    expect(isFeatureEnabled("FEATURE_PRIORITY")).toBe(true); // admin still true
  });

  it("getAllFlags returns registered flags", () => {
    defineFlag("FEATURE_A", true, "Flag A");
    defineFlag("FEATURE_B", false, "Flag B");
    const flags = getAllFlags();
    const keys = flags.map((f) => f.key);
    expect(keys).toContain("FEATURE_A");
    expect(keys).toContain("FEATURE_B");
  });
});
