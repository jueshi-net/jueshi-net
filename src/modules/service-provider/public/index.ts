/**
 * service-provider — PUBLIC API BOUNDARY
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │  External modules (community, workspace, tools, content,     │
 * │  locations) may ONLY import from this file:                  │
 * │                                                              │
 * │    import { serviceProviderModule, serviceProviderApi }      │
 * │      from "@/modules/service-provider/public";               │
 * │                                                              │
 * │  Importing from these paths is FORBIDDEN:                    │
 * │    service-provider/domain                                  │
 * │    service-provider/infrastructure                          │
 * │    service-provider/internal                                 │
 * │    service-provider/application (except via this barrel)     │
 * └──────────────────────────────────────────────────────────────┘
 *
 * What this barrel exposes:
 *   - serviceProviderModule      : module definition (for registration)
 *   - serviceProviderApi         : API surface (Round 2 — CRUD endpoints)
 *   - serviceProviderQueries     : read queries (Round 2 — list/detail)
 *   - serviceProviderCapabilities: capability list + registration
 *   - serviceProviderActions     : action list + registration
 *   - serviceProviderEvents      : event contract + subscription helpers
 *   - serviceProviderBlocks      : block list + registration
 *   - registerServiceProvider    : one-call boot (register module + all subsystems)
 */

// Module definition
export { serviceProviderModule } from "../module";

// Capabilities
export {
  SERVICE_PROVIDER_CAPABILITIES,
  registerServiceProviderCapabilities,
  areCapabilitiesRegistered,
} from "../capabilities";

// Actions
export {
  SERVICE_PROVIDER_ACTIONS,
  registerServiceProviderActions,
} from "../actions";

// Events
export {
  SERVICE_PROVIDER_EVENTS_PUBLISHED,
  SERVICE_PROVIDER_EVENTS_SUBSCRIBED,
  onInquiryCreated,
  registerServiceProviderEventSubscribers,
} from "../events";
export type { InquiryCreatedPayload } from "../events";

// Blocks
export {
  SERVICE_PROVIDER_BLOCKS,
  registerServiceProviderBlocks,
} from "../blocks";

// ---- Round 2 stubs (typed, ready for implementation) ----

/**
 * serviceProviderApi — HTTP API surface.
 * Round 2 will populate this with real route handlers:
 *   - listProviders, getProvider, createProvider, updateProvider
 *   - submitForReview, verifyProvider, rejectProvider
 *   - listServices, createService, publishService
 */
export const serviceProviderApi = {
  // Round 2: CRUD endpoints
  _status: "skeleton" as const,
};

/**
 * serviceProviderQueries — server-side read queries.
 * Round 2 will populate this with Prisma queries:
 *   - listProviders(filters) -> Provider[]
 *   - getProviderBySlug(slug) -> Provider | null
 *   - getProviderServices(providerId) -> Service[]
 *   - searchProviders(query) -> Provider[]
 */
export const serviceProviderQueries = {
  // Round 2: Prisma-backed queries
  _status: "skeleton" as const,
};

// ---- One-call boot ----

import { registerModule, registerDefaultCapabilities, wireBlockModuleChecker, defineFlag } from "@/platform";
import { serviceProviderModule } from "../module";
import { registerServiceProviderCapabilities } from "../capabilities";
import { registerServiceProviderActions } from "../actions";
import { registerServiceProviderBlocks } from "../blocks";
import { registerServiceProviderEventSubscribers } from "../events";

/**
 * Boot the service-provider module.
 *
 * Registers:
 *   1. The FEATURE_SERVICE_PROVIDER flag (default: false everywhere)
 *   2. Platform default capabilities
 *   3. Module-specific capabilities
 *   4. The module definition
 *   5. Blocks, actions, event subscribers
 *   6. Wires the block<->module checker
 *
 * Safe to call multiple times (all registrations are idempotent).
 * Does NOT enable the feature flag — that is controlled by env/admin/whitelist.
 */
export function registerServiceProvider(): void {
  // 1. Define the feature flag (default OFF everywhere).
  defineFlag("FEATURE_SERVICE_PROVIDER", false, "Service Provider Yellow Pages module");

  // 2. Register platform default capabilities.
  registerDefaultCapabilities();

  // 3. Register module capabilities.
  registerServiceProviderCapabilities();

  // 4. Register the module.
  registerModule(serviceProviderModule);

  // 5. Register blocks, actions, event subscribers.
  registerServiceProviderBlocks();
  registerServiceProviderActions();
  registerServiceProviderEventSubscribers();

  // 6. Wire block registry to module registry (feature-flag aware blocks).
  wireBlockModuleChecker();
}
