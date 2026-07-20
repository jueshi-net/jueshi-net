/**
 * Platform Feature Flag System
 *
 * Evaluation priority (highest first):
 *   1. Emergency shutoff  — hard kill switch (runtime)
 *   2. Admin override      — runtime toggle (no deploy)
 *   3. User whitelist      — per-user enablement (preview/beta)
 *   4. Environment variable — process.env[FLAG_KEY]
 *   5. Registered default  — defineFlag() default
 *   6. false               — unknown flags are OFF by default
 *
 * Dependency rule: this file imports nothing from business modules.
 * It is the lowest layer of the kernel.
 */

/** A registered flag definition. */
export interface FeatureFlagConfig {
  key: string;
  defaultValue: boolean;
  description?: string;
}

const _gf = globalThis as any;
if (!_gf.__flagDefaults) _gf.__flagDefaults = new Map<string, boolean>();
if (!_gf.__adminOverrides) _gf.__adminOverrides = new Map<string, boolean>();
if (!_gf.__userWhitelists) _gf.__userWhitelists = new Map<string, Set<string>>();
if (!_gf.__emergencyOff) _gf.__emergencyOff = new Set<string>();
const flagDefaults = _gf.__flagDefaults;
const adminOverrides = _gf.__adminOverrides;
const userWhitelists = _gf.__userWhitelists;
const emergencyOff = _gf.__emergencyOff;

/** Register a flag with a default value. Safe to call multiple times. */
export function defineFlag(
  key: string,
  defaultValue: boolean,
  description?: string
): void {
  if (!flagDefaults.has(key)) {
    flagDefaults.set(key, defaultValue);
  }
}

/**
 * Evaluate a feature flag for the given context.
 * Returns false for unknown flags (deny-by-default).
 */
export function isFeatureEnabled(
  flagKey: string,
  context?: { userId?: string }
): boolean {
  // 1. Emergency shutoff — always wins.
  if (emergencyOff.has(flagKey)) return false;

  // 2. Admin override.
  if (adminOverrides.has(flagKey)) {
    return adminOverrides.get(flagKey)!;
  }

  // 3. User whitelist — if the user is whitelisted, flag is on for them.
  if (context?.userId) {
    const whitelist = userWhitelists.get(flagKey);
    if (whitelist && whitelist.has(context.userId)) {
      return true;
    }
  }

  // 4. Environment variable override.
  const envValue = process.env[flagKey];
  if (envValue !== undefined) {
    return envValue === "true" || envValue === "1";
  }

  // 5. Registered default.
  if (flagDefaults.has(flagKey)) {
    return flagDefaults.get(flagKey)!;
  }

  // 6. Unknown flag = off.
  return false;
}

/** Set a runtime admin override (no deploy needed). */
export function setAdminOverride(flagKey: string, value: boolean): void {
  adminOverrides.set(flagKey, value);
}

/** Remove a runtime admin override, falling back to lower-priority layers. */
export function clearAdminOverride(flagKey: string): void {
  adminOverrides.delete(flagKey);
}

/** Add a user to a flag's whitelist (enables the flag for that user). */
export function addUserToWhitelist(flagKey: string, userId: string): void {
  let set = userWhitelists.get(flagKey);
  if (!set) {
    set = new Set();
    userWhitelists.set(flagKey, set);
  }
  set.add(userId);
}

/** Remove a user from a flag's whitelist. */
export function removeUserFromWhitelist(flagKey: string, userId: string): void {
  userWhitelists.get(flagKey)?.delete(userId);
}

/** Emergency kill switch — disables the flag for everyone immediately. */
export function emergencyDisable(flagKey: string): void {
  emergencyOff.add(flagKey);
}

/** Clear an emergency shutoff. */
export function emergencyEnable(flagKey: string): void {
  emergencyOff.delete(flagKey);
}

/** Is this flag currently under emergency shutoff? */
export function isEmergencyDisabled(flagKey: string): boolean {
  return emergencyOff.has(flagKey);
}

/** Get all registered flag configs (for admin/diagnostic views). */
export function getAllFlags(): FeatureFlagConfig[] {
  return Array.from(flagDefaults.entries()).map(([key, defaultValue]) => ({
    key,
    defaultValue,
  }));
}

/** Test-only: reset ALL flag state to defaults. */
export function _resetAllFlags(): void {
  flagDefaults.clear();
  adminOverrides.clear();
  userWhitelists.clear();
  emergencyOff.clear();
}
