/**
 * service-provider module definition.
 *
 * This is the single source of truth for what the service-provider module
 * declares: capabilities, routes, navigation, blocks, actions, and events.
 *
 * The module is gated by FEATURE_SERVICE_PROVIDER. When the flag is off:
 *   - navigation / adminNavigation are hidden
 *   - blocks are not rendered
 *   - routes should return "feature disabled"
 *   - code is NOT removed (just dormant)
 */
import { defineModule } from "@/platform";

export const serviceProviderModule = defineModule({
  id: "service-provider",
  version: "0.1.0",
  featureFlag: "FEATURE_SERVICE_PROVIDER",

  label: "服务商",
  description:
    "海外华人、留学生、跨境电商、外贸、国际物流服务商黄页与咨询服务模块",

  capabilities: [
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
  ],

  routes: [
    { path: "/service-providers", type: "public" },
    { path: "/business/[slug]", type: "public" },
    { path: "/professional/[handle]", type: "public" },
    { path: "/services/[slug]", type: "public" },
    { path: "/workspace/provider", type: "workspace" },
    { path: "/admin/service-providers", type: "admin" },
  ],

  navigation: [
    {
      area: "main",
      label: "服务商",
      href: "/service-providers",
      sortOrder: 50,
    },
    {
      area: "workspace",
      label: "服务商中心",
      href: "/workspace/provider",
      sortOrder: 60,
    },
  ],

  adminNavigation: [
    {
      label: "服务商管理",
      href: "/admin/service-providers",
      sortOrder: 30,
    },
  ],

  blocks: [
    "service-provider-list",
    "service-provider-recommendations",
    "provider-trust-card",
    "service-request-cta",
  ],

  actions: ["service.request", "provider.favorite", "provider.report"],

  eventsPublished: [
    "provider.created",
    "provider.submitted",
    "provider.verified",
    "provider.rejected",
    "service.created",
    "service.published",
    "inquiry.created",
    "provider.reported",
  ],

  eventsSubscribed: ["inquiry.created"],
});
