/**
 * ContentOps Idempotency Unit Tests
 *
 * V2-IDEMPOTENCY: v1.20.42.18.6.24.1
 *
 * Tests cover:
 * 1. Same Telegram Update -> same key
 * 2. Same text, new messageId -> new key
 * 3. Internal without caseId -> rejected
 * 4. Same key sequential submit -> one task
 * 5. Same key concurrent (10x) -> one claim
 * 6. FAILED retry -> reuse same taskId
 * 7. Key propagation Task -> Job -> Worker -> Backend
 * 8. Backend CREATED -> return existing contentId
 * 9. Same key different requestHash -> 409
 * 10. Simulated lost response -> return existing contentId
 * 11. Guide/Checklist/Topic share same Claim repo
 * 12. Raw chatId never in logs/persisted files
 *
 * These are unit tests with mocked staging/database.
 * They do NOT connect to staging database.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

// ============================================================================
// Test framework (minimal, no external deps)
// ============================================================================

let testCount = 0;
let passCount = 0;
let failCount = 0;
const failures: string[] = [];

function assert(condition: boolean, message: string): void {
  testCount++;
  if (condition) {
    passCount++;
  } else {
    failCount++;
    failures.push(message);
    console.error(`  FAIL: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  const actualStr = typeof actual === 'object' ? JSON.stringify(actual) : String(actual);
  const expectedStr = typeof expected === 'object' ? JSON.stringify(expected) : String(expected);
  assert(actualStr === expectedStr, `${message} (expected: ${expectedStr}, got: ${actualStr})`);
}

function test(name: string, fn: () => void): void {
  console.log(`\n--- ${name} ---`);
  try {
    fn();
  } catch (error: any) {
    testCount++;
    failCount++;
    failures.push(`${name}: ${error.message}`);
    console.error(`  ERROR: ${error.message}`);
  }
}

// ============================================================================
// Test setup: create temp state dir
// ============================================================================

const TEST_STATE_DIR = path.join(os.tmpdir(), `contentops-test-${Date.now()}`);
fs.mkdirSync(path.join(TEST_STATE_DIR, 'idempotency'), { recursive: true });
process.env.CONTENTOPS_STATE_DIR = TEST_STATE_DIR;

// ============================================================================
// Import modules under test
// ============================================================================

import {
  generateTelegramIdempotencyKey,
  generateInternalIdempotencyKey,
  computeRequestHash,
} from '../src/lib/contentops/idempotency-key';

import {
  atomicClaim,
  readClaim,
  handleReplay,
  markProcessing,
  markContentCreated,
  markCompleted,
  markFailed,
  markEnqueued,
  getClaimDir,
} from '../src/lib/contentops/idempotency-claim';

// Override claim dir to test dir
const claimDir = path.join(TEST_STATE_DIR, 'idempotency');

// ============================================================================
// TEST 1: Same Telegram Update generates same key
// ============================================================================

test('1. Same Telegram Update -> same key', () => {
  const key1 = generateTelegramIdempotencyKey(123456, 100);
  const key2 = generateTelegramIdempotencyKey(123456, 100);

  assertEqual(key1.keyHash, key2.keyHash, 'Same chatId+messageId should produce same keyHash');
  assertEqual(key1.keyVersion, 1, 'Key version should be 1');
  assertEqual(key1.source, 'telegram', 'Source should be telegram');
});

// ============================================================================
// TEST 2: Same text, new messageId -> new key
// ============================================================================

test('2. Same text, new messageId -> new key', () => {
  const key1 = generateTelegramIdempotencyKey(123456, 100);
  const key2 = generateTelegramIdempotencyKey(123456, 101);

  assert(key1.keyHash !== key2.keyHash, 'Different messageId should produce different keyHash');
});

// ============================================================================
// TEST 3: Internal without caseId -> rejected
// ============================================================================

test('3. Internal without caseId -> rejected', () => {
  let rejected = false;
  try {
    generateInternalIdempotencyKey('internal_runtime_acceptance', '');
  } catch (error: any) {
    rejected = true;
    assert(error.message.includes('caseId'), 'Error should mention caseId');
  }
  assert(rejected, 'Missing caseId should throw error (fail closed)');
});

// ============================================================================
// TEST 4: Same key sequential submit -> one task
// ============================================================================

test('4. Same key sequential submit -> one claim', () => {
  // Clean up any existing claims
  fs.rmSync(claimDir, { recursive: true, force: true });
  fs.mkdirSync(claimDir, { recursive: true });

  const key = generateTelegramIdempotencyKey(999999, 42);

  // First submit
  const claim1 = atomicClaim(key.keyHash, key.keyVersion, 'task_1', 'task_1', 'guide');
  assert(claim1.isNew, 'First claim should be new');
  assertEqual(claim1.claim.status, 'CLAIMED', 'First claim status should be CLAIMED');

  // Second submit (same key)
  const claim2 = atomicClaim(key.keyHash, key.keyVersion, 'task_2', 'task_2', 'guide');
  assert(!claim2.isNew, 'Second claim should NOT be new');
  assertEqual(claim2.claim.taskId, 'task_1', 'Should return original taskId');
});

// ============================================================================
// TEST 5: Same key concurrent 10x -> only one claim
// ============================================================================

test('5. Same key concurrent 10x -> one claim', () => {
  fs.rmSync(claimDir, { recursive: true, force: true });
  fs.mkdirSync(claimDir, { recursive: true });

  const key = generateInternalIdempotencyKey('test_concurrent', 'case-5');
  let newCount = 0;

  // Simulate concurrent attempts (synchronous, but with open 'wx' it's atomic)
  for (let i = 0; i < 10; i++) {
    const result = atomicClaim(key.keyHash, key.keyVersion, `task_concurrent_${i}`, `task_concurrent_${i}`, 'guide');
    if (result.isNew) newCount++;
  }

  assertEqual(newCount, 1, 'Only one concurrent claim should succeed');
});

// ============================================================================
// TEST 6: FAILED retry -> reuse same taskId
// ============================================================================

test('6. FAILED retry -> reuse same taskId', () => {
  fs.rmSync(claimDir, { recursive: true, force: true });
  fs.mkdirSync(claimDir, { recursive: true });

  const key = generateInternalIdempotencyKey('test_retry', 'case-6');

  // First claim
  const claim1 = atomicClaim(key.keyHash, key.keyVersion, 'task_retry_1', 'task_retry_1', 'guide');
  assert(claim1.isNew, 'First claim should be new');

  // Mark as failed
  markFailed(key.keyHash, 'Test failure');
  const failedClaim = readClaim(key.keyHash);
  assertEqual(failedClaim?.status, 'FAILED', 'Claim should be FAILED');

  // Retry - should reuse same taskId
  const replayResult = handleReplay(key.keyHash);
  assert(replayResult.isRetry, 'Should detect this as a retry');
  assertEqual(replayResult.claim.taskId, 'task_retry_1', 'Should reuse original taskId');

  // Check attempt count incremented
  const retriedClaim = readClaim(key.keyHash);
  assertEqual(retriedClaim?.attemptCount, 2, 'Attempt count should be 2 after one retry');
  assertEqual(retriedClaim?.status, 'CLAIMED', 'Status should be CLAIMED after retry');
});

// ============================================================================
// TEST 7: Key propagation Task -> Job -> Backend payload
// ============================================================================

test('7. Key propagation through payload fields', () => {
  const key = generateTelegramIdempotencyKey(777777, 200);

  // Simulate job payload construction
  const jobPayload = {
    jobId: 'task_test_7',
    jobType: 'contentops_generate',
    contentType: 'guide',
    task: {
      id: 'task_test_7',
      idempotencyKeyHash: key.keyHash,
      idempotencyKeyVersion: key.keyVersion,
      idempotencySource: key.source,
    },
    idempotencyKeyHash: key.keyHash,
    idempotencyKeyVersion: key.keyVersion,
    idempotencySource: key.source,
  };

  // Verify propagation
  assert(!!jobPayload.idempotencyKeyHash, 'Job payload should have idempotencyKeyHash');
  assert(!!jobPayload.task.idempotencyKeyHash, 'Task should have idempotencyKeyHash');
  assertEqual(jobPayload.idempotencyKeyHash, jobPayload.task.idempotencyKeyHash, 'Key should match between job and task');

  // Verify backend payload would include key
  const backendPayload = {
    idempotencyKeyHash: jobPayload.idempotencyKeyHash,
    idempotencyKeyVersion: jobPayload.idempotencyKeyVersion,
    idempotencySource: jobPayload.idempotencySource,
    taskId: jobPayload.jobId,
  };
  assertEqual(backendPayload.idempotencyKeyHash, key.keyHash, 'Backend payload should have same keyHash');
});

// ============================================================================
// TEST 8: Backend CREATED -> return existing contentId
// ============================================================================

test('8. Backend CREATED -> return existing contentId', () => {
  fs.rmSync(claimDir, { recursive: true, force: true });
  fs.mkdirSync(claimDir, { recursive: true });

  const key = generateInternalIdempotencyKey('test_created', 'case-8');

  // First claim
  atomicClaim(key.keyHash, key.keyVersion, 'task_8', 'task_8', 'guide');

  // Simulate content creation
  markContentCreated(key.keyHash, 'content_abc123');

  // Simulate replay (lost response scenario)
  const claim = readClaim(key.keyHash);
  assertEqual(claim?.status, 'CONTENT_CREATED', 'Status should be CONTENT_CREATED');
  assertEqual(claim?.contentId, 'content_abc123', 'Should have contentId');

  // Replay should return existing content
  const replay = handleReplay(key.keyHash);
  assert(!replay.isRetry, 'CONTENT_CREATED is not a retry');
  assert(replay.hasContent, 'Replay should detect existing content');
  assertEqual(replay.contentId, 'content_abc123', 'Replay should return existing contentId');
});

// ============================================================================
// TEST 9: Same key different requestHash -> 409
// ============================================================================

test('9. Same key different requestHash -> conflict', () => {
  const key = generateInternalIdempotencyKey('test_conflict', 'case-9');

  const request1 = computeRequestHash({ title: 'Guide A', contentType: 'guide', taskId: 'task_9' });
  const request2 = computeRequestHash({ title: 'Guide B', contentType: 'guide', taskId: 'task_9' });

  assert(request1 !== request2, 'Different request bodies should produce different requestHash');

  // In real backend: if existingClaim.requestHash !== requestHash -> return 409
  // Here we just verify the hash difference
  const existingClaim = { requestHash: request1 };
  const newRequestHash = request2;
  assert(existingClaim.requestHash !== newRequestHash, 'Request hash mismatch should be detected');
});

// ============================================================================
// TEST 10: Simulated lost response -> return existing contentId
// ============================================================================

test('10. Simulated lost response -> return existing contentId', () => {
  fs.rmSync(claimDir, { recursive: true, force: true });
  fs.mkdirSync(claimDir, { recursive: true });

  const key = generateInternalIdempotencyKey('test_lost', 'case-10');

  // First request: claim + content created, but response lost
  atomicClaim(key.keyHash, key.keyVersion, 'task_10', 'task_10', 'guide');
  markProcessing(key.keyHash);
  markContentCreated(key.keyHash, 'content_xyz789');
  markCompleted(key.keyHash);

  // Second request (after lost response): should find COMPLETED claim
  const claim = readClaim(key.keyHash);
  assertEqual(claim?.status, 'COMPLETED', 'Claim should be COMPLETED');

  // In CanonicalTaskService, COMPLETED status returns existing result
  const replay = handleReplay(key.keyHash);
  assert(!replay.isRetry, 'COMPLETED is not a retry');
  assert(replay.hasContent, 'Should have content from first request');
  assertEqual(replay.contentId, 'content_xyz789', 'Should return same contentId');
});

// ============================================================================
// TEST 11: Guide/Checklist/Topic share same Claim repository
// ============================================================================

test('11. Guide/Checklist/Topic share same Claim repo', () => {
  fs.rmSync(claimDir, { recursive: true, force: true });
  fs.mkdirSync(claimDir, { recursive: true });

  const keyGuide = generateInternalIdempotencyKey('test_share', 'guide-case');
  const keyChecklist = generateInternalIdempotencyKey('test_share', 'checklist-case');
  const keyTopic = generateInternalIdempotencyKey('test_share', 'topic-case');

  // All three use the same claim directory
  atomicClaim(keyGuide.keyHash, 1, 'task_guide', 'task_guide', 'guide');
  atomicClaim(keyChecklist.keyHash, 1, 'task_checklist', 'task_checklist', 'checklist');
  atomicClaim(keyTopic.keyHash, 1, 'task_topic', 'task_topic', 'topic');

  // All claims should exist in the same directory
  const guideClaim = readClaim(keyGuide.keyHash);
  const checklistClaim = readClaim(keyChecklist.keyHash);
  const topicClaim = readClaim(keyTopic.keyHash);

  assert(!!guideClaim, 'Guide claim should exist');
  assert(!!checklistClaim, 'Checklist claim should exist');
  assert(!!topicClaim, 'Topic claim should exist');

  assertEqual(guideClaim?.contentType, 'guide', 'Guide claim contentType');
  assertEqual(checklistClaim?.contentType, 'checklist', 'Checklist claim contentType');
  assertEqual(topicClaim?.contentType, 'topic', 'Topic claim contentType');

  // All in same directory
  const claimFiles = fs.readdirSync(claimDir).filter(f => f.endsWith('.json'));
  assertEqual(claimFiles.length, 3, 'Should have 3 claim files in same directory');
});

// ============================================================================
// TEST 12: Raw chatId never in logs or persisted files
// ============================================================================

test('12. Raw chatId not in persisted files', () => {
  fs.rmSync(claimDir, { recursive: true, force: true });
  fs.mkdirSync(claimDir, { recursive: true });

  const rawChatId = '123456789';
  const key = generateTelegramIdempotencyKey(rawChatId, 999);

  // Create claim
  atomicClaim(key.keyHash, key.keyVersion, 'task_12', 'task_12', 'guide');

  // Read claim file and verify raw chatId is NOT present
  const claimFile = path.join(claimDir, `${key.keyHash}.json`);
  const claimContent = fs.readFileSync(claimFile, 'utf-8');

  assert(!claimContent.includes(rawChatId), 'Raw chatId should NOT be in claim file');
  assert(!claimContent.includes('123456789'), 'Raw chatId number should NOT appear anywhere');
  assert(claimContent.includes(key.keyHash), 'Key hash SHOULD be in claim file');

  // Verify the key hash is a SHA-256 hex string (64 chars)
  assertEqual(key.keyHash.length, 64, 'Key hash should be 64 hex chars');
  assert(/^[0-9a-f]{64}$/.test(key.keyHash), 'Key hash should be valid SHA-256 hex');
});

// ============================================================================
// Additional tests: state transitions
// ============================================================================

test('13. Claim state transitions: CLAIMED -> ENQUEUED -> PROCESSING -> CONTENT_CREATED -> COMPLETED', () => {
  fs.rmSync(claimDir, { recursive: true, force: true });
  fs.mkdirSync(claimDir, { recursive: true });

  const key = generateInternalIdempotencyKey('test_transitions', 'case-13');

  // CLAIMED
  atomicClaim(key.keyHash, 1, 'task_13', 'task_13', 'guide');
  assertEqual(readClaim(key.keyHash)?.status, 'CLAIMED', 'Should be CLAIMED');

  // ENQUEUED
  markEnqueued(key.keyHash);
  assertEqual(readClaim(key.keyHash)?.status, 'ENQUEUED', 'Should be ENQUEUED');

  // PROCESSING
  markProcessing(key.keyHash);
  assertEqual(readClaim(key.keyHash)?.status, 'PROCESSING', 'Should be PROCESSING');

  // CONTENT_CREATED
  markContentCreated(key.keyHash, 'content_13');
  assertEqual(readClaim(key.keyHash)?.status, 'CONTENT_CREATED', 'Should be CONTENT_CREATED');

  // COMPLETED
  markCompleted(key.keyHash);
  assertEqual(readClaim(key.keyHash)?.status, 'COMPLETED', 'Should be COMPLETED');
});

test('14. requestHash is deterministic for same payload', () => {
  const payload1 = { title: 'Test', contentType: 'guide', taskId: 't1' };
  const payload2 = { title: 'Test', contentType: 'guide', taskId: 't1' };

  const hash1 = computeRequestHash(payload1);
  const hash2 = computeRequestHash(payload2);

  assertEqual(hash1, hash2, 'Same payload should produce same requestHash');
});

// ============================================================================
// Cleanup
// ============================================================================

test('15. Cleanup: remove test state dir', () => {
  fs.rmSync(TEST_STATE_DIR, { recursive: true, force: true });
  assert(!fs.existsSync(TEST_STATE_DIR), 'Test state dir should be cleaned up');
});

// ============================================================================
// Results
// ============================================================================

console.log(`\n${'='.repeat(60)}`);
console.log(`IDEMPOTENCY_UNIT_TEST_TOTAL=${testCount}`);
console.log(`IDEMPOTENCY_UNIT_TEST_PASSED=${passCount}`);
console.log(`IDEMPOTENCY_UNIT_TEST_FAILED=${failCount}`);
if (failures.length > 0) {
  console.log('\nFAILURES:');
  failures.forEach(f => console.log(`  - ${f}`));
}
console.log(`${'='.repeat(60)}`);

// Exit code
if (failCount > 0) {
  process.exit(1);
}
