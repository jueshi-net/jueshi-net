/**
 * Platform Extension Kernel — public barrel.
 *
 * This is the only entry point other code should import from when using
 * kernel APIs:
 *
 *   import { defineModule, registerModule, isFeatureEnabled, can,
 *            registerBlock, executeAction, publishEvent } from "@/platform";
 *
 * The kernel NEVER imports a business module.
 */
export * from "./modules";
export * from "./feature-flags";
export * from "./permissions";
export { registerBlock, getBlock, getBlocksForPage, getBlocksByModule, getEnabledBlocks, _wireModuleEnabledChecker, _resetBlocks } from "./blocks/registry";
export type { BlockDefinition } from "./blocks/registry";
export { registerAction, getAction, executeAction, getActionsByModule, _resetActions } from "./actions/registry";
export type { ActionContext, ActionResult, ActionDefinition } from "./actions/registry";
export {
  subscribeToEvent,
  publishEvent,
  publishEventSync,
  getPublishedEvents,
  _resetEvents,
} from "./events";
export type { PlatformEvent, EventHandler } from "./events";

/**
 * Wire the block registry to the module registry so that
 * `getBlocksForPage` respects module feature-flag state.
 * Called once at app boot.
 */
export { wireBlockModuleChecker } from "./internal/wire";
