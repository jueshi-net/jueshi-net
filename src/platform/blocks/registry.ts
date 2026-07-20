/**
 * Platform Block Registry
 *
 * Allows modules to register renderable blocks that can be placed on pages
 * via slot identifiers. Pages query blocks by page-id and render them,
 * enabling cross-module content composition without direct imports.
 *
 * Dependency rule: imports nothing from business modules at load time.
 * The module-enabled checker is injected via `_wireModuleEnabledChecker`
 * to avoid a circular import between blocks <-> modules.
 */

export interface BlockDefinition {
  /** Unique block id (e.g. "service-provider-list"). */
  id: string;
  /** Owning module id. */
  moduleId: string;
  /** Component path for lazy rendering (e.g. "@/modules/service-provider/blocks/ProviderListBlock"). */
  component?: string;
  /** Page slot ids where this block can appear (empty/undefined = any page). */
  pages?: string[];
  /** Sort order within a slot. */
  sortOrder?: number;
  /** Static props passed to the block component. */
  props?: Record<string, unknown>;
}

const _gb = globalThis as any;
if (!_gb.__blocks) _gb.__blocks = new Map<string, BlockDefinition>();
const blocks = _gb.__blocks;

/**
 * Injected checker that consults the module registry for feature-flag state.
 * Defaults to `() => true` so the block registry works standalone in tests
 * before the module registry is wired up.
 */
let isModuleEnabledForBlock: (
  moduleId: string,
  context?: { userId?: string }
) => boolean = () => true;

/** Register a block. Idempotent — re-registration updates the definition. */
export function registerBlock(block: BlockDefinition): void {
  blocks.set(block.id, block);
}

/** Get a single block by id. */
export function getBlock(id: string): BlockDefinition | undefined {
  return blocks.get(id);
}

/** Get all blocks registered for a given page slot, sorted by sortOrder. */
export function getBlocksForPage(pageId: string): BlockDefinition[] {
  return Array.from(blocks.values())
    .filter((b) => !b.pages || b.pages.length === 0 || b.pages.includes(pageId))
    .sort((a, b) => (a.sortOrder ?? 100) - (b.sortOrder ?? 100));
}

/** Get all blocks owned by a module. */
export function getBlocksByModule(moduleId: string): BlockDefinition[] {
  return Array.from(blocks.values()).filter((b) => b.moduleId === moduleId);
}

/**
 * Get all blocks for a page whose owning module is currently enabled.
 * Respects feature-flag state via the injected module-enabled checker.
 */
export function getEnabledBlocks(
  pageId: string,
  context?: { userId?: string }
): BlockDefinition[] {
  return getBlocksForPage(pageId).filter((b) =>
    isModuleEnabledForBlock(b.moduleId, context)
  );
}

/** Wire the module-enabled checker (called by platform boot). */
export function _wireModuleEnabledChecker(
  checker: (moduleId: string, context?: { userId?: string }) => boolean
): void {
  isModuleEnabledForBlock = checker;
}

/** Test-only: clear all blocks. */
export function _resetBlocks(): void {
  blocks.clear();
  isModuleEnabledForBlock = () => true;
}
