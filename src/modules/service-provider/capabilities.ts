/**
 * service-provider capability definitions.
 *
 * Registers the 11 capabilities declared by the module with the platform
 * capability API. These override the platform defaults where the module
 * needs finer-grained logic, and register module-specific capabilities.
 *
 * Pages and APIs should call `can("provider.edit", ctx)` instead of
 * inlining `role === "admin"` checks.
 */
import { defineCapability, isCapabilityDefined } from "@/platform";

/** The full list of capabilities this module declares. */
export const SERVICE_PROVIDER_CAPABILITIES = [
  "provider.view",
  "provider.create",
  "provider.claim",
  "provider.edit",
  "provider.submit",
  "provider.verify",
  "provider.manage",
  "service.create",
  "service.publish",
  "service.request",
  "provider.report",
] as const;

/**
 * Register all service-provider capabilities.
 * Safe to call multiple times (defineCapability replaces existing checkers).
 */
export function registerServiceProviderCapabilities(): void {
  // Public read — anyone can view published providers.
  defineCapability("provider.view", () => true);

  // Authenticated actions — any logged-in user.
  defineCapability("provider.create", (ctx) => !!ctx.userId);
  defineCapability("provider.claim", (ctx) => !!ctx.userId);
  defineCapability("service.create", (ctx) => !!ctx.userId);
  defineCapability("service.request", (ctx) => !!ctx.userId);
  defineCapability("provider.report", (ctx) => !!ctx.userId);

  // Owner-only actions — the resource owner OR an admin.
  defineCapability(
    "provider.submit",
    (ctx) => !!ctx.isOwner || ctx.userRole === "admin"
  );
  defineCapability(
    "provider.edit",
    (ctx) => !!ctx.isOwner || ctx.userRole === "admin"
  );

  // Admin-only actions.
  defineCapability("provider.verify", (ctx) => ctx.userRole === "admin");
  defineCapability("provider.manage", (ctx) => ctx.userRole === "admin");
  defineCapability("service.publish", (ctx) => ctx.userRole === "admin");
}

/** Convenience: are all module capabilities registered? */
export function areCapabilitiesRegistered(): boolean {
  return SERVICE_PROVIDER_CAPABILITIES.every((c) => isCapabilityDefined(c));
}
