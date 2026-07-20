/**
 * Next.js Instrumentation Hook
 *
 * Runs on server startup. Registers all platform modules so that
 * feature flags, capabilities, blocks, and actions are available
 * in all API routes and pages (not just the module preview page).
 *
 * This file is automatically loaded by Next.js when it exists.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Register the service-provider module (feature flag, capabilities, blocks, actions, events)
    const { registerServiceProvider } = await import("@/modules/service-provider/public");
    registerServiceProvider();
    console.log("[instrumentation] service-provider module registered");
  }
}
