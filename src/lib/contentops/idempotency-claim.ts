/**
 * ContentOps Atomic Idempotency Claim Manager
 *
 * File-system based atomic claim using exclusive file creation (open 'wx').
 * Each keyHash gets its own claim file under $CONTENTOPS_STATE_DIR/idempotency/.
 *
 * This provides the FIRST layer of idempotency:
 * - Same key -> same task, no new task/job created
 * - FAILED tasks can be retried using the same taskId
 * - PROCESSING tasks return in-progress status
 *
 * The file-system claim is safe for single-host concurrent access (Mac mini).
 * For cross-process safety, the database Claim model (ContentOpsIdempotencyClaim)
 * provides the SECOND layer at the backend.
 *
 * V2-IDEMPOTENCY: v1.20.42.18.6.24.1
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ============================================================================
// Configuration
// ============================================================================

const HOME_DIR = os.homedir();

function getContentOpsStateDir(): string {
  return process.env.CONTENTOPS_STATE_DIR || path.join(HOME_DIR, '.jueshi-contentops');
}

function getClaimDirPath(): string {
  return path.join(getContentOpsStateDir(), 'idempotency');
}

// ============================================================================
// Types
// ============================================================================

export type ClaimStatus =
  | 'CLAIMED'
  | 'ENQUEUED'
  | 'PROCESSING'
  | 'CONTENT_CREATED'
  | 'COMPLETED'
  | 'FAILED';

export interface IdempotencyClaim {
  keyHash: string;
  keyVersion: number;
  taskId: string;
  jobId: string;
  status: ClaimStatus;
  contentType?: string;
  contentId?: string;
  attemptCount: number;
  requestHash?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimResult {
  /** Whether this is a new claim or an existing one */
  isNew: boolean;
  /** The claim record (either newly created or existing) */
  claim: IdempotencyClaim;
}

export interface ClaimReplayResult {
  /** Whether the replay should return existing contentId */
  hasContent: boolean;
  /** Existing content ID if available */
  contentId?: string;
  /** The claim record */
  claim: IdempotencyClaim;
  /** Whether this was a retry of a failed task */
  isRetry: boolean;
}

// ============================================================================
// Initialization
// ============================================================================

function ensureClaimDir(): void {
  if (!fs.existsSync(getClaimDirPath())) {
    fs.mkdirSync(getClaimDirPath(), { recursive: true, mode: 0o750 });
  }
}

function claimFilePath(keyHash: string): string {
  return path.join(getClaimDirPath(), `${keyHash}.json`);
}

// ============================================================================
// Atomic Claim
// ============================================================================

/**
 * Attempt to atomically claim an idempotency key.
 *
 * Uses open(path, 'wx') which fails with EEXIST if the file already exists.
 * This is the atomic primitive - no race condition possible on a single filesystem.
 *
 * If the claim already exists:
 * - COMPLETED -> return existing (replay)
 * - CONTENT_CREATED -> return existing contentId (replay, e.g. after lost response)
 * - PROCESSING -> return in-progress status
 * - FAILED -> reuse same taskId for retry (attemptCount + 1)
 * - CLAIMED/ENQUEUED -> return existing task
 */
export function atomicClaim(
  keyHash: string,
  keyVersion: number,
  taskId: string,
  jobId: string,
  contentType?: string,
  requestHash?: string
): ClaimResult {
  ensureClaimDir();
  const filePath = claimFilePath(keyHash);
  const now = new Date().toISOString();

  // Attempt exclusive creation
  try {
    const claim: IdempotencyClaim = {
      keyHash,
      keyVersion,
      taskId,
      jobId,
      status: 'CLAIMED',
      contentType,
      attemptCount: 1,
      requestHash,
      createdAt: now,
      updatedAt: now,
    };

    // 'wx' flag = exclusive write, fails if file exists
    const fd = fs.openSync(filePath, 'wx', 0o640);
    fs.writeFileSync(fd, JSON.stringify(claim, null, 2));
    fs.closeSync(fd);

    return { isNew: true, claim };
  } catch (error: any) {
    if (error instanceof Error) {
      const nodeErr = error as NodeJS.ErrnoException;
      if (nodeErr.code !== 'EEXIST') {
        throw error;
      }
    } else {
      throw error;
    }
    // File already exists - read existing claim
    const existing = readClaim(keyHash);
    if (!existing) {
      // File was deleted between EEXIST and read - retry
      // This is extremely unlikely but handle it
      return atomicClaim(keyHash, keyVersion, taskId, jobId, contentType, requestHash);
    }
    return { isNew: false, claim: existing };
  }
}

/**
 * Read an existing claim by keyHash.
 * Returns null if no claim exists.
 */
export function readClaim(keyHash: string): IdempotencyClaim | null {
  const filePath = claimFilePath(keyHash);
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as IdempotencyClaim;
  } catch {
    return null;
  }
}

/**
 * Read a claim by taskId (linear scan, used for recovery/debugging).
 */
export function readClaimByTaskId(taskId: string): IdempotencyClaim | null {
  ensureClaimDir();
  const files = fs.readdirSync(getClaimDirPath());
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const data = fs.readFileSync(path.join(getClaimDirPath(), file), 'utf-8');
      const claim = JSON.parse(data) as IdempotencyClaim;
      if (claim.taskId === taskId) return claim;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Update a claim's status.
 * Atomically writes the updated claim.
 */
export function updateClaim(
  keyHash: string,
  updates: Partial<IdempotencyClaim>
): IdempotencyClaim | null {
  const existing = readClaim(keyHash);
  if (!existing) return null;

  const updated: IdempotencyClaim = {
    ...existing,
    ...updates,
    keyHash: existing.keyHash, // Never allow keyHash to change
    taskId: existing.taskId,   // Never allow taskId to change
    updatedAt: new Date().toISOString(),
  };

  const filePath = claimFilePath(keyHash);
  // Write to tmp then rename for atomicity
  const tmpPath = filePath + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(updated, null, 2), { mode: 0o640 });
  fs.renameSync(tmpPath, filePath);

  return updated;
}

/**
 * Handle a replay attempt for an existing claim.
 *
 * Returns guidance on what the caller should do:
 * - If content already created: return existing contentId
 * - If FAILED: mark as retry, allow re-enqueue with same taskId
 * - If PROCESSING/CLAIMED/ENQUEUED: return in-progress
 */
export function handleReplay(keyHash: string): ClaimReplayResult {
  const claim = readClaim(keyHash);
  if (!claim) {
    // Should not happen - atomicClaim should have created it
    throw new Error(`IDEMPOTENCY_CLAIM_NOT_FOUND: ${keyHash}`);
  }

  const isRetry = claim.status === 'FAILED';

  if (isRetry) {
    // Increment attempt count, reset to CLAIMED for retry
    updateClaim(keyHash, {
      status: 'CLAIMED',
      attemptCount: claim.attemptCount + 1,
      lastError: undefined,
    });
  }

  return {
    hasContent: !!claim.contentId,
    contentId: claim.contentId,
    claim,
    isRetry,
  };
}

/**
 * Mark a claim as ENQUEUED (job written to inbox).
 */
export function markEnqueued(keyHash: string): IdempotencyClaim | null {
  return updateClaim(keyHash, { status: 'ENQUEUED' });
}

/**
 * Mark a claim as PROCESSING (worker started).
 */
export function markProcessing(keyHash: string): IdempotencyClaim | null {
  return updateClaim(keyHash, { status: 'PROCESSING' });
}

/**
 * Mark a claim as CONTENT_CREATED (backend returned contentId).
 */
export function markContentCreated(keyHash: string, contentId: string): IdempotencyClaim | null {
  return updateClaim(keyHash, { status: 'CONTENT_CREATED', contentId });
}

/**
 * Mark a claim as COMPLETED (finalizer succeeded).
 */
export function markCompleted(keyHash: string): IdempotencyClaim | null {
  return updateClaim(keyHash, { status: 'COMPLETED' });
}

/**
 * Mark a claim as FAILED.
 */
export function markFailed(keyHash: string, error: string): IdempotencyClaim | null {
  return updateClaim(keyHash, { status: 'FAILED', lastError: error });
}

/**
 * Check if a claim exists for the given keyHash.
 */
export function claimExists(keyHash: string): boolean {
  return readClaim(keyHash) !== null;
}

/**
 * Get the claim directory path (for testing).
 */
export function getClaimDir(): string {
  return getClaimDirPath();
}
