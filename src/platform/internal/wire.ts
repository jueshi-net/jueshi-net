/**
 * Internal wiring that connects kernel subsystems without creating
 * circular import chains at module-load time.
 */
import { _wireModuleEnabledChecker } from "../blocks/registry";
import { isModuleEnabled } from "../modules";

/**
 * Connect the block registry to the module registry so block queries
 * respect feature-flag state. Call once during app initialisation.
 */
export function wireBlockModuleChecker(): void {
  _wireModuleEnabledChecker(isModuleEnabled);
}
