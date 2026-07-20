/**
 * Platform Capability / Permission API
 *
 * Single source of truth for permission checks. Modules register capability
 * checkers; pages and APIs call `can("provider.edit", ctx)` instead of
 * scattering `role === "admin"` checks across the codebase.
 *
 * Dependency rule: imports nothing from business modules.
 */

export interface CapabilityContext {
  /** Logged-in user id (undefined = anonymous). */
  userId?: string;
  /** User role string (e.g. "admin" | "user"). */
  userRole?: string;
  /** Whether the acting user owns the resource being accessed. */
  isOwner?: boolean;
  /** The resource owner's user id (alternative to isOwner). */
  resourceOwnerId?: string;
  /** Whether the owning module's feature flag is enabled. */
  moduleFlagEnabled?: boolean;
  /** Arbitrary extra context for custom checkers. */
  extra?: Record<string, unknown>;
}

type CapabilityChecker = (ctx: CapabilityContext) => boolean;

// Use globalThis to share state across Next.js module bundles (production mode)
const _g = globalThis as unknown as { __capabilityCheckers?: Map<string, CapabilityChecker> };
const capabilityCheckers = _g.__capabilityCheckers ?? new Map<string, CapabilityChecker>();
if (_g) _g.__capabilityCheckers = capabilityCheckers;

/**
 * Register a capability checker. If a capability is already registered the
 * new checker replaces the old one (allows module re-registration on HMR).
 */
export function defineCapability(
  capability: string,
  checker: CapabilityChecker
): void {
  capabilityCheckers.set(capability, checker);
}

/**
 * Evaluate a capability for the given context.
 * Unknown capabilities are DENIED (return false) — never grant by accident.
 */
export function can(capability: string, ctx: CapabilityContext): boolean {
  const checker = capabilityCheckers.get(capability);
  if (!checker) return false;
  return checker(ctx);
}

/** Has this capability been registered? */
export function isCapabilityDefined(capability: string): boolean {
  return capabilityCheckers.has(capability);
}

/** All registered capability keys (for admin/diagnostic views). */
export function getAllCapabilities(): string[] {
  return Array.from(capabilityCheckers.keys());
}

/**
 * Register the built-in platform-default capabilities.
 * These cover common patterns; modules add their own via defineCapability.
 */
export function registerDefaultCapabilities(): void {
  // Public read — anyone (even anonymous) can view.
  defineCapability("provider.view", () => true);

  // Authenticated actions — any logged-in user.
  defineCapability("provider.create", (ctx) => !!ctx.userId);
  defineCapability("provider.claim", (ctx) => !!ctx.userId);
  defineCapability("service.create", (ctx) => !!ctx.userId);
  defineCapability("service.request", (ctx) => !!ctx.userId);
  defineCapability("provider.report", (ctx) => !!ctx.userId);

  // Owner-only actions.
  defineCapability("provider.submit", (ctx) => !!ctx.isOwner);
  defineCapability("provider.edit", (ctx) => !!ctx.isOwner || ctx.userRole === "admin");

  // Admin-only actions.
  defineCapability("provider.verify", (ctx) => ctx.userRole === "admin");
  defineCapability("provider.manage", (ctx) => ctx.userRole === "admin");
  defineCapability("service.publish", (ctx) => ctx.userRole === "admin");
}

/** Test-only: clear all capability checkers. */
export function _resetCapabilities(): void {
  capabilityCheckers.clear();
}
