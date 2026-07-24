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
 * Compute a request hash from the full request payload.
 * This is used to detect key-reuse conflicts (same key, different request body).
 *
 * The request hash is separate from the idempotency key hash:
 * - keyHash identifies the logical operation (same messageId = same key)
 * - requestHash identifies the exact request body (detects accidental key reuse)
 */
export function computeRequestHash(payload: Record<string, unknown>): string {
  // Sort keys for deterministic hashing
  const sortedJson = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto
    .createHash('sha256')
    .update(sortedJson, 'utf-8')
    .digest('hex');
}
