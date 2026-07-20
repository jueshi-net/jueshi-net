/**
 * Platform Module Registry
 *
 * Stores registered module definitions and exposes lookups that respect the
 * feature-flag gate. When a module's feature flag is disabled:
 *   - it is excluded from getEnabledModules()
 *   - its navigation / adminNavigation / blocks / actions are invisible
 *   - its routes should return "feature disabled"
 *
 * Dependency rule: this file imports ONLY from the feature-flags kernel and
 * the types in this package. It never imports a business module.
 */
import type { ModuleDefinition } from "./types";
import { isFeatureEnabled } from "../feature-flags";

const modules = new Map<string, ModuleDefinition>();

/**
 * Create a module definition. This is a pure factory — it does NOT register.
 * Registration is a separate explicit step so modules can be tree-shaken when
 * their feature flag is off.
 */
export function defineModule(def: ModuleDefinition): ModuleDefinition {
  // Light validation — fail fast on obviously broken definitions.
  if (!def.id || !def.version) {
    throw new Error(`Module definition missing required id/version`);
  }
  if (!def.featureFlag) {
    throw new Error(`Module "${def.id}" must declare a featureFlag`);
  }
  return def;
}

/** Register a module definition so the kernel can discover it. */
export function registerModule(def: ModuleDefinition): void {
  if (modules.has(def.id)) {
    // Idempotent re-registration is allowed (HMR / hot reload scenarios).
    return;
  }
  modules.set(def.id, def);
}

/** Get a raw module definition by id (regardless of feature-flag state). */
export function getModuleById(id: string): ModuleDefinition | undefined {
  return modules.get(id);
}

/** All registered modules whose feature flag is currently enabled. */
export function getEnabledModules(context?: {
  userId?: string;
}): ModuleDefinition[] {
  return Array.from(modules.values()).filter((m) =>
    isFeatureEnabled(m.featureFlag, context)
  );
}

/** All registered modules (for admin/diagnostic views). */
export function getAllModules(): ModuleDefinition[] {
  return Array.from(modules.values());
}

/** Is a given module currently enabled? */
export function isModuleEnabled(
  moduleId: string,
  context?: { userId?: string }
): boolean {
  const mod = modules.get(moduleId);
  if (!mod) return false;
  return isFeatureEnabled(mod.featureFlag, context);
}

/** Collect navigation entries from all enabled modules for a given area. */
export function getEnabledNavigation(
  area: ModuleDefinition["navigation"][number]["area"],
  context?: { userId?: string }
): Array<ModuleNavigation & { moduleId: string }> {
  return getEnabledModules(context).flatMap((m) =>
    m.navigation
      .filter((n) => n.area === area)
      .map((n) => ({ ...n, moduleId: m.id }))
  );
}

/** Collect admin navigation entries from all enabled modules. */
export function getEnabledAdminNavigation(context?: {
  userId?: string;
}): Array<ModuleAdminNavigation & { moduleId: string }> {
  return getEnabledModules(context).flatMap((m) =>
    m.adminNavigation.map((n) => ({ ...n, moduleId: m.id }))
  );
}

/** Test-only: clear all registrations. */
export function _resetModuleRegistry(): void {
  modules.clear();
}

import type { ModuleNavigation, ModuleAdminNavigation } from "./types";
