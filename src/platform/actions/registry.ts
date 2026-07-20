/**
 * Platform Action Registry
 *
 * Central registry for module actions. Pages call `executeAction("service.request", input, ctx)`
 * instead of implementing request logic inline. This ensures:
 *   - auth / capability checks happen in one place
 *   - audit / event emission is consistent
 *   - action logic is reusable across pages
 *
 * Dependency rule: imports from permissions kernel only.
 */
import { can, type CapabilityContext } from "../permissions";

export interface ActionContext extends CapabilityContext {
  [key: string]: unknown;
}

export interface ActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  code?: string;
}

export interface ActionDefinition {
  /** Unique action id (e.g. "service.request"). */
  id: string;
  /** Owning module id. */
  moduleId: string;
  /** Required capability; if set, `can()` is checked before the handler runs. */
  capability?: string;
  /** The action handler. */
  handler: (
    input: Record<string, unknown>,
    ctx: ActionContext
  ) => Promise<ActionResult>;
}

const actions = new Map<string, ActionDefinition>();

/** Register an action. Idempotent — re-registration updates the definition. */
export function registerAction(action: ActionDefinition): void {
  actions.set(action.id, action);
}

/** Get a raw action definition by id. */
export function getAction(id: string): ActionDefinition | undefined {
  return actions.get(id);
}

/**
 * Execute an action by id.
 *
 * Guarantees:
 *   1. Unknown action -> { success:false, code:"UNKNOWN_ACTION" }
 *   2. Capability check fails -> { success:false, code:"FORBIDDEN" }
 *   3. Handler throws -> { success:false, code:"INTERNAL_ERROR" }
 *   4. Handler returns -> forwarded as-is
 */
export async function executeAction(
  id: string,
  input: Record<string, unknown>,
  ctx: ActionContext
): Promise<ActionResult> {
  const action = actions.get(id);
  if (!action) {
    return { success: false, error: `Unknown action: ${id}`, code: "UNKNOWN_ACTION" };
  }

  // Capability gate — checked centrally, not in each handler.
  if (action.capability && !can(action.capability, ctx)) {
    return { success: false, error: "Forbidden", code: "FORBIDDEN" };
  }

  try {
    return await action.handler(input, ctx);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Internal error",
      code: "INTERNAL_ERROR",
    };
  }
}

/** Get all actions owned by a module. */
export function getActionsByModule(moduleId: string): ActionDefinition[] {
  return Array.from(actions.values()).filter((a) => a.moduleId === moduleId);
}

/** Test-only: clear all actions. */
export function _resetActions(): void {
  actions.clear();
}
