/**
 * Platform Extension Kernel — Module Registry
 *
 * Defines the contract for platform modules and provides a central registry.
 * The platform kernel MUST NOT depend on any business module.
 */

/** Where a navigation entry renders. */
export type NavigationArea = "main" | "workspace" | "footer" | "mobile";

export interface ModuleNavigation {
  area: NavigationArea;
  label: string;
  href: string;
  icon?: string;
  sortOrder?: number;
}

export interface ModuleAdminNavigation {
  label: string;
  href: string;
  icon?: string;
  sortOrder?: number;
}

export interface ModuleRoute {
  path: string;
  type?: "public" | "workspace" | "admin";
}

/**
 * A module definition. Modules call `defineModule()` to create a definition,
 * then `registerModule()` to make it discoverable at runtime.
 */
export interface ModuleDefinition {
  id: string;
  version: string;
  /** Feature-flag key that gates the entire module. */
  featureFlag: string;
  /** Capability strings this module declares. */
  capabilities: string[];
  routes: ModuleRoute[];
  navigation: ModuleNavigation[];
  adminNavigation: ModuleAdminNavigation[];
  /** Block IDs this module registers. */
  blocks: string[];
  /** Action IDs this module registers. */
  actions: string[];
  /** Event types this module publishes. */
  eventsPublished: string[];
  /** Event types this module subscribes to. */
  eventsSubscribed?: string[];
  label?: string;
  description?: string;
}
