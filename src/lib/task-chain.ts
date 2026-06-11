// src/lib/task-chain.ts
// Lightweight task chain context for cross-tool workflows
// Uses localStorage only — no database, no migration

export const TASK_CHAIN_KEY = 'jueshi.taskChain.shippingMvp';

export interface TaskChainContext {
  version: 'v1';
  updatedAt: string;
  sourceTool?: 'hs-code' | 'exchange-rate' | 'shipping-calculator' | 'address-formatter' | 'postal-code' | 'commercial-invoice' | 'quotation';
  productName?: string;
  hsCode?: string;
  productDescription?: string;
  declaredValue?: string;
  currency?: string;
  exchangeRate?: string;
  convertedValue?: string;
  originCountry?: string;
  destinationCountry?: string;
  postalCode?: string;
  addressText?: string;
  shippingEstimate?: string;
  nextStep?: string;
}

const DEFAULT_CONTEXT: TaskChainContext = {
  version: 'v1',
  updatedAt: new Date().toISOString(),
};

/**
 * Read task chain context from localStorage.
 * Returns null if not found or parse error.
 */
export function getTaskChain(): TaskChainContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TASK_CHAIN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 'v1') return null;
    return parsed as TaskChainContext;
  } catch {
    return null;
  }
}

/**
 * Save partial updates to task chain context.
 * Merges with existing context. Never throws.
 */
export function saveTaskChain(patch: Partial<TaskChainContext>): TaskChainContext {
  const existing = getTaskChain() ?? { ...DEFAULT_CONTEXT };
  const updated: TaskChainContext = {
    ...existing,
    ...patch,
    version: 'v1',
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(TASK_CHAIN_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or disabled — silently fail
  }
  return updated;
}

/**
 * Clear task chain context.
 */
export function clearTaskChain(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TASK_CHAIN_KEY);
  } catch {
    // silently fail
  }
}

/**
 * Check if task chain has meaningful data (at least one field beyond version/updatedAt).
 */
export function hasTaskChainData(): boolean {
  const ctx = getTaskChain();
  if (!ctx) return false;
  const keys = Object.keys(ctx).filter(k => k !== 'version' && k !== 'updatedAt' && k !== 'sourceTool');
  return keys.some(k => {
    const val = ctx[k as keyof TaskChainContext];
    return typeof val === 'string' && val.trim().length > 0;
  });
}

/**
 * Build URL with task chain params for cross-tool navigation.
 */
export function buildTaskChainURL(path: string, params: Record<string, string>): string {
  const url = new URL(path, window.location.origin);
  url.searchParams.set('from', 'task-chain');
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  return url.toString();
}

/**
 * Read task chain params from URL search params.
 */
export function getTaskChainFromURL(): Partial<TaskChainContext> | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get('from') !== 'task-chain') return null;
  
  const result: Partial<TaskChainContext> = {};
  const fields: (keyof TaskChainContext)[] = [
    'productName', 'hsCode', 'productDescription', 'declaredValue',
    'currency', 'exchangeRate', 'convertedValue', 'originCountry',
    'destinationCountry', 'postalCode', 'addressText', 'shippingEstimate'
  ];
  
  for (const field of fields) {
    const val = params.get(field);
    if (val) (result as Record<string, string>)[field] = val;
  }
  
  return Object.keys(result).length > 0 ? result : null;
}
