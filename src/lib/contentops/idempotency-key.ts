/**
 * ContentOps Idempotency Key Generator
 *
 * Canonical idempotency key derivation:
 * - Telegram:  telegram:v1:<chatId>:<messageId>
 * - Internal:  internal:v1:<source>:<caseId>
 *
 * Only the SHA-256 hash is persisted. Raw chatId is NEVER written to disk/db/logs.
 *
 * V2-IDEMPOTENCY: v1.20.42.18.6.24.1
 */

import * as crypto from 'crypto';

// ============================================================================
// Types
// ============================================================================

export type IdempotencySource = 'telegram' | 'internal';

export interface IdempotencyKeyResult {
  /** SHA-256 hash of the canonical key - safe to persist */
  keyHash: string;
  /** Version of the key format, for future evolution */
  keyVersion: number;
  /** Which source generated this key */
  source: IdempotencySource;
  /** For internal sources, the case identifier (not persisted in raw form) */
  internalCaseId?: string;
}

// ============================================================================
// Constants
// ============================================================================

const KEY_VERSION = 1;

// ============================================================================
// Key Generation
// ============================================================================

/**
 * Generate an idempotency key for a Telegram message.
 *
 * Canonical value: telegram:v1:<chatId>:<messageId>
 * Only the SHA-256 hash is returned/persisted.
 *
 * Same chatId + messageId always produces the same keyHash.
 * Different messages (even with identical text) produce different keyHashes.
 */
export function generateTelegramIdempotencyKey(
  chatId: string | number,
  messageId: number
): IdempotencyKeyResult {
  if (!chatId || chatId === '') {
    throw new Error('IDEMPOTENCY_REJECTED: chatId is required for telegram source');
  }
  if (!messageId || messageId <= 0) {
    throw new Error('IDEMPOTENCY_REJECTED: messageId is required for telegram source');
  }

  const canonicalValue = `telegram:v${KEY_VERSION}:${chatId}:${messageId}`;
  const keyHash = hashKey(canonicalValue);

  return {
    keyHash,
    keyVersion: KEY_VERSION,
    source: 'telegram',
  };
}

/**
 * Generate an idempotency key for an internal acceptance/smoke test.
 *
 * Canonical value: internal:v1:<source>:<caseId>
 * Only the SHA-256 hash is returned/persisted.
 *
 * caseId MUST be explicitly provided. Missing caseId is a fail-closed error.
 */
export function generateInternalIdempotencyKey(
  source: string,
  caseId: string
): IdempotencyKeyResult {
  if (!source || source === '') {
    throw new Error('IDEMPOTENCY_REJECTED: source is required for internal source');
  }
  if (!caseId || caseId === '') {
    throw new Error('IDEMPOTENCY_REJECTED: caseId is required for internal source - fail closed');
  }

  const canonicalValue = `internal:v${KEY_VERSION}:${source}:${caseId}`;
  const keyHash = hashKey(canonicalValue);

  return {
    keyHash,
    keyVersion: KEY_VERSION,
    source: 'internal',
    internalCaseId: caseId,
  };
}

/**
 * Generate idempotency key from raw canonical components.
 * Used when the caller has already determined the source.
 *
 * For Telegram: requires chatId and messageId
 * For Internal: requires source and caseId
 */
export function generateIdempotencyKey(params: {
  source: IdempotencySource;
  chatId?: string | number;
  messageId?: number;
  internalSource?: string;
  caseId?: string;
}): IdempotencyKeyResult {
  if (params.source === 'telegram') {
    return generateTelegramIdempotencyKey(params.chatId!, params.messageId!);
  } else {
    return generateInternalIdempotencyKey(params.internalSource || 'internal', params.caseId!);
  }
}

/**
 * Compute SHA-256 hash of the canonical key value.
 * The raw canonical value (which contains chatId) is never persisted.
 */
function hashKey(canonicalValue: string): string {
  return crypto
    .createHash('sha256')
    .update(canonicalValue, 'utf-8')
    .digest('hex');
}

/**
 * Recursively serialize a value with stable key ordering.
 *
 * - Object keys are sorted at every nesting level.
 * - Array order is preserved (business order matters).
 * - undefined values are removed from objects.
 * - Date values are converted to ISO strings.
 * - Booleans, numbers, strings, null are passed through.
 *
 * This replaces the previous JSON.stringify(payload, Object.keys(payload).sort())
 * which only sorted top-level keys and could miss nested field changes.
 */
function stableSerialize(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(stableSerialize);
  }

  if (typeof value === 'object') {
    const sortedKeys = Object.keys(value as Record<string, unknown>).sort();
    const result: Record<string, unknown> = {};
    for (const key of sortedKeys) {
      const childValue = (value as Record<string, unknown>)[key];
      if (childValue !== undefined) {
        result[key] = stableSerialize(childValue);
      }
    }
    return result;
  }

  return value;
}

/**
 * Volatile field names that must NEVER be included in requestHash.
 * These fields change between retries and do not affect the business result.
 */
const VOLATILE_FIELDS = new Set([
  'taskId',
  'jobId',
  'idempotencyKeyHash',
  'idempotencyKey',
  'idempotencyKeyVersion',
  'idempotencySource',
  'slug',
  'createdAt',
  'updatedAt',
  'timestamp',
  'requestHash',
]);

/**
 * Remove volatile fields from a payload object at all nesting levels.
 * This ensures that retry metadata, timestamps, and generated slugs
 * do not affect the request hash.
 */
function stripVolatileFields(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(stripVolatileFields);
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, childValue] of Object.entries(value as Record<string, unknown>)) {
      if (!VOLATILE_FIELDS.has(key) && childValue !== undefined) {
        result[key] = stripVolatileFields(childValue);
      }
    }
    return result;
  }

  return value;
}

/**
 * Compute a request hash from the full request payload.
 * This is used to detect key-reuse conflicts (same key, different request body).
 *
 * The request hash is separate from the idempotency key hash:
 * - keyHash identifies the logical operation (same messageId = same key)
 * - requestHash identifies the exact request body (detects accidental key reuse)
 *
 * Uses recursive stable serialization:
 * - All object keys are sorted at every nesting level
 * - Volatile fields (taskId, jobId, slug, timestamps, etc.) are excluded
 * - Array order is preserved (business order)
 * - undefined values are removed
 * - Dates are converted to ISO strings
 */
export function computeRequestHash(payload: Record<string, unknown>): string {
  const cleaned = stripVolatileFields(payload);
  const serialized = stableSerialize(cleaned);
  const json = JSON.stringify(serialized);
  return crypto
    .createHash('sha256')
    .update(json, 'utf-8')
    .digest('hex');
}
