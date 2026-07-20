/**
 * service-provider block registrations.
 *
 * Registers the 4 blocks declared by the module with the platform block
 * registry. Each block has a component path (for lazy rendering) and
 * optional page-slot assignments.
 */
import { registerBlock } from "@/platform";

export const SERVICE_PROVIDER_BLOCKS = [
  "service-provider-list",
  "service-provider-recommendations",
  "provider-trust-card",
  "service-request-cta",
] as const;

/** Register all service-provider blocks. Idempotent. */
export function registerServiceProviderBlocks(): void {
  registerBlock({
    id: "service-provider-list",
    moduleId: "service-provider",
    component: "@/modules/service-provider/blocks/ProviderListBlock",
    pages: ["service-providers-index", "home", "country-detail"],
    sortOrder: 10,
  });

  registerBlock({
    id: "service-provider-recommendations",
    moduleId: "service-provider",
    component: "@/modules/service-provider/blocks/RecommendationsBlock",
    pages: ["home", "tool-detail", "guide-detail", "country-detail"],
    sortOrder: 20,
  });

  registerBlock({
    id: "provider-trust-card",
    moduleId: "service-provider",
    component: "@/modules/service-provider/blocks/ProviderTrustCardBlock",
    pages: ["provider-detail", "service-detail"],
    sortOrder: 10,
  });

  registerBlock({
    id: "service-request-cta",
    moduleId: "service-provider",
    component: "@/modules/service-provider/blocks/ServiceRequestCtaBlock",
    pages: ["provider-detail", "service-detail"],
    sortOrder: 20,
  });
}
