// src/lib/task-chain-api.ts
// API wrapper for task chain operations (database-backed)
// This is separate from task-chain.ts which uses localStorage

export interface TaskChainContext {
  // HS Code fields
  hsCode?: string;
  productDescription?: string;
  productName?: string;
  
  // CBM/Shipping fields
  length?: number;
  width?: number;
  height?: number;
  cartons?: number;
  grossWeight?: number;
  cbm?: number;
  chargeableWeight?: number;
  
  // Address fields
  country?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  addressLine?: string;
  
  // Document fields
  buyerName?: string;
  buyerAddress?: string;
  buyerContact?: string;
  lineItems?: Array<{
    description?: string;
    hsCode?: string;
    quantity?: number;
    unitPrice?: number;
    currency?: string;
  }>;
  totalAmount?: number;
  terms?: string;
  invoiceNo?: string;
  
  // Metadata
  source?: string;
  importedAt?: string;
  sourceTool?: string;
  
  // Step tracking
  currentStep?: number;
  completedSteps?: string[];
  
  // Allow any other fields
  [key: string]: unknown;
}

export interface TaskChain {
  id: string;
  title: string;
  sourceTool: string;
  context: TaskChainContext;
  status: 'active' | 'completed' | 'archived' | 'deleted';
  userId: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  lastActiveTool?: string | null;
  linkedDraftHints?: unknown;
}

export interface CreateTaskChainInput {
  title: string;
  sourceTool: string;
  context: TaskChainContext;
  linkedDraftHints?: unknown;
}

export interface UpdateTaskChainInput {
  title?: string;
  status?: 'active' | 'completed' | 'archived' | 'deleted';
  sourceTool?: string;
  lastActiveTool?: string;
  context?: TaskChainContext;
  linkedDraftHints?: unknown;
  currentStep?: number;
  completedSteps?: string[];
}

/**
 * Create a new task chain
 */
export async function createTaskChain(input: CreateTaskChainInput): Promise<TaskChain> {
  const res = await fetch('/api/task-chains', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  const json = await res.json();
  if (!json.success || !json.taskChain) {
    throw new Error('Failed to create task chain');
  }

  return json.taskChain as TaskChain;
}

/**
 * Update an existing task chain (partial update)
 * Merges context with existing data
 */
export async function updateTaskChain(id: string, input: UpdateTaskChainInput): Promise<TaskChain> {
  const res = await fetch(`/api/task-chains/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  const json = await res.json();
  if (!json.success || !json.taskChain) {
    throw new Error('Failed to update task chain');
  }

  return json.taskChain as TaskChain;
}

/**
 * Get a single task chain by ID
 */
export async function getTaskChain(id: string): Promise<TaskChain> {
  const res = await fetch(`/api/task-chains/${id}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  const json = await res.json();
  if (!json.taskChain) {
    throw new Error('Task chain not found');
  }

  return json.taskChain as TaskChain;
}

/**
 * List all task chains for current user
 */
export async function listTaskChains(filters?: {
  status?: string;
  sourceTool?: string;
}): Promise<TaskChain[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.sourceTool) params.set('sourceTool', filters.sourceTool);

  const res = await fetch(`/api/task-chains?${params.toString()}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  const json = await res.json();
  return (json.taskChains || []) as TaskChain[];
}

/**
 * Delete a task chain (soft delete)
 */
export async function deleteTaskChain(id: string): Promise<void> {
  const res = await fetch(`/api/task-chains/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
}

/**
 * Import tool data into a task chain context
 * Merges with existing context, adds metadata
 */
export async function importToolDataToTaskChain(
  taskId: string,
  source: 'hs-tool' | 'cbm-tool' | 'postal-helper',
  data: TaskChainContext
): Promise<TaskChain> {
  const contextWithMeta = {
    ...data,
    source,
    importedAt: new Date().toISOString(),
  };

  return updateTaskChain(taskId, { context: contextWithMeta });
}
