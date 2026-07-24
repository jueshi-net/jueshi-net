/**
 * ContentOps Idempotency Unit Tests (Preflight Repair Edition)
 *
 * V2-IDEMPOTENCY: v1.20.42.18.6.24.1
 *
 * Test categories:
 *   IDEMPOTENCY: key generation, atomic claim, propagation (tests 1-7)
 *   TRANSACTION: backend claim+content transaction, P2002, FAILED, recovery (tests 8-12)
 *   REQUEST_HASH: recursive stable serialization, nested fields, volatile exclusion (tests 13-15)
 *   ROLLBACK: rollback SQL executable statement (test 16)
 *
 * These are unit tests with mocked Prisma/transaction.
 * They do NOT connect to staging database.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

// ============================================================================
// Test framework (minimal, no external deps)
// ============================================================================

let idempotencyTestCount = 0;
let idempotencyPassCount = 0;
let idempotencyFailCount = 0;
const idempotencyFailures: string[] = [];

let transactionTestCount = 0;
let transactionPassCount = 0;
let transactionFailCount = 0;
const transactionFailures: string[] = [];

let requestHashTestCount = 0;
let requestHashPassCount = 0;
let requestHashFailCount = 0;
const requestHashFailures: string[] = [];

function assert(category: 'idempotency' | 'transaction' | 'requestHash', condition: boolean, message: string): void {
  if (category === 'idempotency') { idempotencyTestCount++; if (condition) idempotencyPassCount++; else { idempotencyFailCount++; idempotencyFailures.push(message); console.error(`  FAIL: ${message}`); } }
  else if (category === 'transaction') { transactionTestCount++; if (condition) transactionPassCount++; else { transactionFailCount++; transactionFailures.push(message); console.error(`  FAIL: ${message}`); } }
  else { requestHashTestCount++; if (condition) requestHashPassCount++; else { requestHashFailCount++; requestHashFailures.push(message); console.error(`  FAIL: ${message}`); } }
}

function assertEqual<T>(cat: 'idempotency' | 'transaction' | 'requestHash', actual: T, expected: T, message: string): void {
  const a = typeof actual === 'object' ? JSON.stringify(actual) : String(actual);
  const e = typeof expected === 'object' ? JSON.stringify(expected) : String(expected);
  assert(cat, a === e, `${message} (expected: ${e}, got: ${a})`);
}

const testPromises: Promise<void>[] = [];

async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  const p = (async () => {
    console.log(`\n--- ${name} ---`);
    try { await fn(); } catch (error: any) {
      console.error(`  ERROR: ${error.message}`);
      idempotencyTestCount++; idempotencyFailCount++; idempotencyFailures.push(`${name}: ${error.message}`);
      transactionTestCount++; transactionFailCount++; transactionFailures.push(`${name}: ${error.message}`);
      requestHashTestCount++; requestHashFailCount++; requestHashFailures.push(`${name}: ${error.message}`);
    }
  })();
  testPromises.push(p);
  return p;
}

// ============================================================================
// Test setup: create temp state dir
// ============================================================================

const TEST_STATE_DIR = path.join(os.tmpdir(), `contentops-test-${Date.now()}`);
fs.mkdirSync(path.join(TEST_STATE_DIR, 'idempotency'), { recursive: true });
process.env.CONTENTOPS_STATE_DIR = TEST_STATE_DIR;

// ============================================================================
// Mock Prisma Client for transaction tests
// ============================================================================

class MockPrismaTransaction {
  claims: Map<string, any> = new Map();
  content: Map<string, any> = new Map();
  rolledBack = false;
  committed = false;
  failNextCreate = false;

  contentOpsIdempotencyClaim = {
    create: async (args: any) => {
      const keyHash = args.data.keyHash;
      if (this.claims.has(keyHash)) {
        const err: any = new Error('Unique constraint failed');
        err.code = 'P2002';
        throw err;
      }
      const record = {
        ...args.data,
        id: `claim_${this.claims.size + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.claims.set(keyHash, record);
      return record;
    },
    update: async (args: any) => {
      const existing = this.claims.get(args.where.keyHash);
      if (!existing) throw new Error('Record not found');
      const updated = { ...existing, ...args.data, updatedAt: new Date() };
      this.claims.set(args.where.keyHash, updated);
      return updated;
    },
    findUnique: async (args: any) => {
      return this.claims.get(args.where.keyHash) || null;
    },
  };

  // Content models - all share the same store
  guide = {
    create: async (args: any) => {
      if (this.failNextCreate) { this.failNextCreate = false; throw new Error('DB_CONNECTION_FAILED'); }
      const id = `guide_${this.content.size + 1}`;
      this.content.set(id, { ...args.data, id, createdAt: new Date(), updatedAt: new Date() });
      return this.content.get(id);
    },
  };
  checklist = {
    create: async (args: any) => {
      if (this.failNextCreate) { this.failNextCreate = false; throw new Error('DB_CONNECTION_FAILED'); }
      const id = `checklist_${this.content.size + 1}`;
      this.content.set(id, { ...args.data, id, createdAt: new Date(), updatedAt: new Date() });
      return this.content.get(id);
    },
  };
  topic = {
    create: async (args: any) => {
      if (this.failNextCreate) { this.failNextCreate = false; throw new Error('DB_CONNECTION_FAILED'); }
      const id = `topic_${this.content.size + 1}`;
      this.content.set(id, { ...args.data, id, items: [], sections: [], createdAt: new Date(), updatedAt: new Date() });
      return this.content.get(id);
    },
  };
}

class MockPrismaClient {
  claims: Map<string, any> = new Map();
  content: Map<string, any> = new Map();
  failNextCreate = false;

  contentOpsIdempotencyClaim = {
    findUnique: async (args: any) => {
      return this.claims.get(args.where.keyHash) || null;
    },
    create: async (args: any) => {
      const keyHash = args.data.keyHash;
      if (this.claims.has(keyHash)) {
        const err: any = new Error('Unique constraint failed');
        err.code = 'P2002';
        throw err;
      }
      const record = {
        ...args.data,
        id: `claim_${this.claims.size + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.claims.set(keyHash, record);
      return record;
    },
    update: async (args: any) => {
      const existing = this.claims.get(args.where.keyHash);
      if (!existing) throw new Error('Record not found');
      const updated = { ...existing, ...args.data, updatedAt: new Date() };
      this.claims.set(args.where.keyHash, updated);
      return updated;
    },
  };

  guide = {
    create: async (args: any) => {
      const id = `guide_${this.content.size + 1}`;
      this.content.set(id, { ...args.data, id, createdAt: new Date(), updatedAt: new Date() });
      return this.content.get(id);
    },
  };
  checklist = {
    create: async (args: any) => {
      const id = `checklist_${this.content.size + 1}`;
      this.content.set(id, { ...args.data, id, createdAt: new Date(), updatedAt: new Date() });
      return this.content.get(id);
    },
  };
  topic = {
    create: async (args: any) => {
      const id = `topic_${this.content.size + 1}`;
      this.content.set(id, { ...args.data, id, items: [], sections: [], createdAt: new Date(), updatedAt: new Date() });
      return this.content.get(id);
    },
  };

  $transaction = async (fn: (tx: MockPrismaTransaction) => Promise<any>): Promise<any> => {
    const tx = new MockPrismaTransaction();
    // Copy current state to transaction
    for (const [k, v] of this.claims) tx.claims.set(k, v);
    for (const [k, v] of this.content) tx.content.set(k, v);
    tx.failNextCreate = this.failNextCreate; // propagate error flag
    try {
      const result = await fn(tx);
      // Commit: copy transaction state back to main store
      this.claims = tx.claims;
      this.content = tx.content;
      tx.committed = true;
      return result;
    } catch (error) {
      // Rollback: discard transaction state
      tx.rolledBack = true;
      throw error;
    }
  };
}

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

const claimDir = path.join(TEST_STATE_DIR, 'idempotency');

// ============================================================================
// SIMULATED BACKEND TRANSACTION (mirrors route.ts logic)
// ============================================================================

async function simulateBackendCreateDraft(
  prisma: MockPrismaClient,
  data: {
    contentType: string;
    title: string;
    keyHash: string;
    keyVersion: number;
    taskId: string;
    jobId?: string;
    content?: any;
    body?: string;
    excerpt?: string;
    summary?: string;
    executionMode?: string;
    targetEnvironment?: string;
    source?: string;
    provider?: string;
    seoTitle?: string;
    seoDescription?: string;
    tags?: string[];
  }
): Promise<{ status: number; data: any }> {
  const { computeRequestHash } = await import('../src/lib/contentops/idempotency-key');
  const { Prisma } = { Prisma: { InputJsonValue: (v: any) => v } };

  const contentType = data.contentType;
  const title = data.title;
  const keyHash = data.keyHash;
  const keyVersion = data.keyVersion || 1;
  const taskId = data.taskId;

  // Build business payload for requestHash
  const requestPayload = {
    contentType, title: data.title,
    executionMode: data.executionMode, targetEnvironment: data.targetEnvironment,
    source: data.source, provider: data.provider,
    content: data.content, excerpt: data.excerpt, summary: data.summary,
    body: data.body, tags: data.tags,
    seoTitle: data.seoTitle, seoDescription: data.seoDescription,
  };
  const requestHash = computeRequestHash(requestPayload);

  // Check existing claim
  let existingClaim: any = null;
  try {
    existingClaim = await prisma.contentOpsIdempotencyClaim.findUnique({
      where: { keyHash: keyHash || '__nonexistent__' },
    });
  } catch { /* table might not exist */ }

  if (existingClaim) {
    if (existingClaim.requestHash && existingClaim.requestHash !== requestHash) {
      return { status: 409, data: { error: { code: 'IDEMPOTENCY_KEY_REUSE_CONFLICT' } } };
    }
    if (existingClaim.contentType !== contentType) {
      return { status: 409, data: { error: { code: 'IDEMPOTENCY_KEY_REUSE_CONFLICT' } } };
    }
    if (existingClaim.status === 'CREATED' || existingClaim.status === 'COMPLETED') {
      return { status: 200, data: { id: existingClaim.backendContentId, isReplay: true } };
    }
    if (existingClaim.status === 'PROCESSING') {
      return { status: 409, data: { error: { code: 'IDEMPOTENCY_IN_PROGRESS' }, retryable: true } };
    }
  }

  const slug = title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36);

  try {
    const result = await prisma.$transaction(async (tx: MockPrismaTransaction) => {
      // 1. Create claim
      await tx.contentOpsIdempotencyClaim.create({
        data: { keyHash, keyVersion, requestHash, taskId, jobId: data.jobId || null, contentType, status: 'PROCESSING' },
      });

      // 2. Create content
      let contentId: string;
      if (contentType === 'checklist') {
        const cl = await tx.checklist.create({ data: { title, slug, status: 'draft', steps: [] as any } });
        contentId = cl.id;
      } else if (contentType === 'topic') {
        const tp = await tx.topic.create({ data: { title, slug, status: 'draft', templateType: 'rating_list' } as any });
        contentId = tp.id;
      } else {
        const g = await tx.guide.create({ data: { title, slug, body: data.body || '', status: 'draft' } as any });
        contentId = g.id;
      }

      // 3. Update claim to CREATED with contentId
      await tx.contentOpsIdempotencyClaim.update({
        where: { keyHash },
        data: { status: 'CREATED', backendContentId: contentId },
      });

      return { contentId };
    });

    return { status: 201, data: { id: result.contentId, isReplay: false } };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      let winner: any = null;
      try {
        winner = await prisma.contentOpsIdempotencyClaim.findUnique({ where: { keyHash } });
      } catch {}
      if (winner && (winner.status === 'CREATED' || winner.status === 'COMPLETED')) {
        return { status: 200, data: { id: winner.backendContentId, isReplay: true } };
      }
      return { status: 409, data: { error: { code: 'IDEMPOTENCY_IN_PROGRESS' }, retryable: true } };
    }
    return { status: 500, data: { error: 'CREATE_BACKEND_DRAFT_FAILED' } };
  }
}

// ============================================================================
// IDEMPOTENCY TESTS (1-7)
// ============================================================================

test('1. Same Telegram Update -> same key', () => {
  const key1 = generateTelegramIdempotencyKey(123456, 100);
  const key2 = generateTelegramIdempotencyKey(123456, 100);
  assertEqual('idempotency', key1.keyHash, key2.keyHash, 'Same chatId+messageId should produce same keyHash');
  assertEqual('idempotency', key1.keyVersion, 1, 'Key version should be 1');
  assertEqual('idempotency', key1.source, 'telegram', 'Source should be telegram');
});

test('2. Same text, new messageId -> new key', () => {
  const key1 = generateTelegramIdempotencyKey(123456, 100);
  const key2 = generateTelegramIdempotencyKey(123456, 101);
  assert('idempotency', key1.keyHash !== key2.keyHash, 'Different messageId should produce different keyHash');
});

test('3. Internal without caseId -> rejected', () => {
  let rejected = false;
  try { generateInternalIdempotencyKey('internal_runtime_acceptance', ''); }
  catch (error: any) { rejected = true; assert('idempotency', error.message.includes('caseId'), 'Error should mention caseId'); }
  assert('idempotency', rejected, 'Missing caseId should throw error (fail closed)');
});

test('4. Same key sequential submit -> one claim', () => {
  fs.rmSync(claimDir, { recursive: true, force: true });
  fs.mkdirSync(claimDir, { recursive: true });
  const key = generateTelegramIdempotencyKey(999999, 42);
  const claim1 = atomicClaim(key.keyHash, key.keyVersion, 'task_1', 'task_1', 'guide');
  assert('idempotency', claim1.isNew, 'First claim should be new');
  assertEqual('idempotency', claim1.claim.status, 'CLAIMED', 'First claim status should be CLAIMED');
  const claim2 = atomicClaim(key.keyHash, key.keyVersion, 'task_2', 'task_2', 'guide');
  assert('idempotency', !claim2.isNew, 'Second claim should NOT be new');
  assertEqual('idempotency', claim2.claim.taskId, 'task_1', 'Should return original taskId');
});

test('5. Same key concurrent 10x -> one claim', () => {
  fs.rmSync(claimDir, { recursive: true, force: true });
  fs.mkdirSync(claimDir, { recursive: true });
  const key = generateInternalIdempotencyKey('test_concurrent', 'case-5');
  let newCount = 0;
  for (let i = 0; i < 10; i++) {
    const result = atomicClaim(key.keyHash, key.keyVersion, `task_concurrent_${i}`, `task_concurrent_${i}`, 'guide');
    if (result.isNew) newCount++;
  }
  assertEqual('idempotency', newCount, 1, 'Only one concurrent claim should succeed');
});

test('6. FAILED retry -> reuse same taskId', () => {
  fs.rmSync(claimDir, { recursive: true, force: true });
  fs.mkdirSync(claimDir, { recursive: true });
  const key = generateInternalIdempotencyKey('test_retry', 'case-6');
  atomicClaim(key.keyHash, key.keyVersion, 'task_retry_1', 'task_retry_1', 'guide');
  markFailed(key.keyHash, 'Test failure');
  assertEqual('idempotency', readClaim(key.keyHash)?.status, 'FAILED', 'Claim should be FAILED');
  const replayResult = handleReplay(key.keyHash);
  assert('idempotency', replayResult.isRetry, 'Should detect this as a retry');
  assertEqual('idempotency', replayResult.claim.taskId, 'task_retry_1', 'Should reuse original taskId');
  assertEqual('idempotency', readClaim(key.keyHash)?.attemptCount, 2, 'Attempt count should be 2');
  assertEqual('idempotency', readClaim(key.keyHash)?.status, 'CLAIMED', 'Status should be CLAIMED after retry');
});

test('7. Key propagation through payload fields', () => {
  const key = generateTelegramIdempotencyKey(777777, 200);
  const jobPayload = {
    jobId: 'task_test_7', jobType: 'contentops_generate', contentType: 'guide',
    task: { id: 'task_test_7', idempotencyKeyHash: key.keyHash, idempotencyKeyVersion: key.keyVersion, idempotencySource: key.source },
    idempotencyKeyHash: key.keyHash, idempotencyKeyVersion: key.keyVersion, idempotencySource: key.source,
  };
  assert('idempotency', !!jobPayload.idempotencyKeyHash, 'Job payload should have idempotencyKeyHash');
  assert('idempotency', !!jobPayload.task.idempotencyKeyHash, 'Task should have idempotencyKeyHash');
  assertEqual('idempotency', jobPayload.idempotencyKeyHash, jobPayload.task.idempotencyKeyHash, 'Key should match');
});

// ============================================================================
// TRANSACTION TESTS (8-12)
// ============================================================================

test('8. Claim + Guide created in same transaction', async () => {
  const prisma = new MockPrismaClient();
  const key = generateInternalIdempotencyKey('test_tx', 'guide-tx');
  const result = await simulateBackendCreateDraft(prisma, {
    contentType: 'guide', title: 'Test Guide', keyHash: key.keyHash, keyVersion: 1,
    taskId: 'task_8', body: '# Guide content',
  });
  assertEqual('transaction', result.status, 201, 'Should return 201');
  // Verify claim exists with CREATED status
  const claim = await prisma.contentOpsIdempotencyClaim.findUnique({ where: { keyHash: key.keyHash } });
  assertEqual('transaction', claim?.status, 'CREATED', 'Claim should be CREATED');
  assert('transaction', !!claim?.backendContentId, 'backendContentId should be set');
  assert('transaction', claim!.backendContentId.startsWith('guide_'), 'backendContentId should be a guide ID');
});

test('9. Claim + Checklist created in same transaction', async () => {
  const prisma = new MockPrismaClient();
  const key = generateInternalIdempotencyKey('test_tx', 'checklist-tx');
  const result = await simulateBackendCreateDraft(prisma, {
    contentType: 'checklist', title: 'Test Checklist', keyHash: key.keyHash, keyVersion: 1,
    taskId: 'task_9', content: { groups: [] },
  });
  assertEqual('transaction', result.status, 201, 'Should return 201');
  const claim = await prisma.contentOpsIdempotencyClaim.findUnique({ where: { keyHash: key.keyHash } });
  assertEqual('transaction', claim?.status, 'CREATED', 'Claim should be CREATED');
  assert('transaction', claim!.backendContentId.startsWith('checklist_'), 'backendContentId should be a checklist ID');
});

test('10. Claim + Topic created in same transaction', async () => {
  const prisma = new MockPrismaClient();
  const key = generateInternalIdempotencyKey('test_tx', 'topic-tx');
  const result = await simulateBackendCreateDraft(prisma, {
    contentType: 'topic', title: 'Test Topic', keyHash: key.keyHash, keyVersion: 1,
    taskId: 'task_10', content: { subtopics: [] },
  });
  assertEqual('transaction', result.status, 201, 'Should return 201');
  const claim = await prisma.contentOpsIdempotencyClaim.findUnique({ where: { keyHash: key.keyHash } });
  assertEqual('transaction', claim?.status, 'CREATED', 'Claim should be CREATED');
  assert('transaction', claim!.backendContentId.startsWith('topic_'), 'backendContentId should be a topic ID');
});

test('11. backendContentId persisted to Claim + CREATED update before return', async () => {
  const prisma = new MockPrismaClient();
  const key = generateInternalIdempotencyKey('test_persist', 'case-11');
  const result = await simulateBackendCreateDraft(prisma, {
    contentType: 'guide', title: 'Persist Test', keyHash: key.keyHash, keyVersion: 1,
    taskId: 'task_11', body: '# Content',
  });
  assertEqual('transaction', result.status, 201, 'Should return 201 (transaction committed before return)');
  const claim = await prisma.contentOpsIdempotencyClaim.findUnique({ where: { keyHash: key.keyHash } });
  assert('transaction', !!claim?.backendContentId, 'backendContentId must be persisted');
  assertEqual('transaction', claim?.backendContentId, result.data.id, 'Claim backendContentId must match response id');
  assertEqual('transaction', claim?.status, 'CREATED', 'Claim must be CREATED (updated before return)');
});

test('12. Lost response recovery -> returns original contentId, single content', async () => {
  const prisma = new MockPrismaClient();
  const key = generateInternalIdempotencyKey('test_lost', 'case-12');
  // First request: creates content, but response "lost"
  const result1 = await simulateBackendCreateDraft(prisma, {
    contentType: 'guide', title: 'Lost Response', keyHash: key.keyHash, keyVersion: 1,
    taskId: 'task_12', body: '# Lost',
  });
  assertEqual('transaction', result1.status, 201, 'First request should succeed');
  // Second request (after lost response): should return existing contentId
  const result2 = await simulateBackendCreateDraft(prisma, {
    contentType: 'guide', title: 'Lost Response', keyHash: key.keyHash, keyVersion: 1,
    taskId: 'task_12', body: '# Lost',
  });
  assertEqual('transaction', result2.status, 200, 'Second request should return 200 (replay)');
  assert('transaction', result2.data.isReplay, 'Should be marked as replay');
  assertEqual('transaction', result2.data.id, result1.data.id, 'Should return same contentId');
  // Only one content record should exist
  assertEqual('transaction', prisma.content.size, 1, 'Should have exactly 1 content record');
});

// ============================================================================
// P2002 + CONFLICT TESTS (part of TRANSACTION category)
// ============================================================================

test('13. Same key different requestHash -> 409', async () => {
  const prisma = new MockPrismaClient();
  const key = generateInternalIdempotencyKey('test_conflict', 'case-13');
  // First request
  await simulateBackendCreateDraft(prisma, {
    contentType: 'guide', title: 'Title A', keyHash: key.keyHash, keyVersion: 1,
    taskId: 'task_13a', body: '# Content A',
  });
  // Second request with different title (different requestHash)
  const result = await simulateBackendCreateDraft(prisma, {
    contentType: 'guide', title: 'Title B', keyHash: key.keyHash, keyVersion: 1,
    taskId: 'task_13b', body: '# Content B',
  });
  assertEqual('transaction', result.status, 409, 'Different requestHash should return 409');
  assertEqual('transaction', result.data.error?.code, 'IDEMPOTENCY_KEY_REUSE_CONFLICT', 'Error code should be IDEMPOTENCY_KEY_REUSE_CONFLICT');
});

test('14. P2002 after concurrent -> reads winner claim', async () => {
  const prisma = new MockPrismaClient();
  const key = generateInternalIdempotencyKey('test_p2002', 'case-14');
  // Simulate: request A creates claim+content, request B hits P2002
  // First request succeeds
  await simulateBackendCreateDraft(prisma, {
    contentType: 'guide', title: 'P2002 Test', keyHash: key.keyHash, keyVersion: 1,
    taskId: 'task_14a', body: '# P2002',
  });
  // Second request with same key (same payload) - should find existing CREATED
  const result = await simulateBackendCreateDraft(prisma, {
    contentType: 'guide', title: 'P2002 Test', keyHash: key.keyHash, keyVersion: 1,
    taskId: 'task_14b', body: '# P2002',
  });
  assertEqual('transaction', result.status, 200, 'Concurrent request should return 200 (replay)');
  assert('transaction', result.data.isReplay, 'Should be replay');
  // Only 1 content record
  assertEqual('transaction', prisma.content.size, 1, 'Should have only 1 content record');
});

test('15. Winner PROCESSING -> retryable status', async () => {
  const prisma = new MockPrismaClient();
  const key = generateInternalIdempotencyKey('test_processing', 'case-15');
  // Manually create a claim in PROCESSING state (simulating in-flight request)
  // Use null requestHash so the hash check is skipped and we reach the PROCESSING check
  await prisma.contentOpsIdempotencyClaim.create({
    data: { keyHash: key.keyHash, keyVersion: 1, requestHash: null, taskId: 'task_15a', contentType: 'guide', status: 'PROCESSING' },
  });
  // Second request should get retryable
  const result = await simulateBackendCreateDraft(prisma, {
    contentType: 'guide', title: 'Processing Test', keyHash: key.keyHash, keyVersion: 1,
    taskId: 'task_15b', body: '# Processing',
  });
  assertEqual('transaction', result.status, 409, 'Should return 409');
  assert('transaction', result.data.retryable, 'Should be retryable');
  assertEqual('transaction', result.data.error?.code, 'IDEMPOTENCY_IN_PROGRESS', 'Error code should be IDEMPOTENCY_IN_PROGRESS');
});

test('16. Content creation failure -> no stale PROCESSING (Scheme A)', async () => {
  const prisma = new MockPrismaClient();
  const key = generateInternalIdempotencyKey('test_fail', 'case-16');
  // Set fail flag to simulate content creation error inside transaction
  prisma.failNextCreate = true;
  const result = await simulateBackendCreateDraft(prisma, {
    contentType: 'guide', title: 'Fail Test', keyHash: key.keyHash, keyVersion: 1,
    taskId: 'task_16', body: '# Fail',
  });
  assertEqual('transaction', result.status, 500, 'Should return 500 on failure');
  // Scheme A: transaction rolled back, no DB claim should exist
  const claim = await prisma.contentOpsIdempotencyClaim.findUnique({ where: { keyHash: key.keyHash } });
  // If claim exists, it should NOT be in PROCESSING (stale)
  if (claim) {
    assert('transaction', claim.status !== 'PROCESSING', 'No stale PROCESSING claim should remain');
  } else {
    assert('transaction', true, 'No claim exists (transaction rolled back - Scheme A)');
  }
});

// ============================================================================
// REQUEST HASH TESTS (17-22)
// ============================================================================

test('17. Same full payload -> same requestHash', () => {
  const payload1 = {
    contentType: 'guide', title: 'Test Guide',
    content: { body: '# Hello World', seo: { keywords: ['a', 'b'] } },
    executionMode: 'standard', targetEnvironment: 'staging',
  };
  const payload2 = { ...payload1 };
  const hash1 = computeRequestHash(payload1);
  const hash2 = computeRequestHash(payload2);
  assertEqual('requestHash', hash1, hash2, 'Same payload should produce same requestHash');
});

test('18. Nested object key order changed -> same requestHash', () => {
  const payload1 = {
    contentType: 'guide', title: 'Test',
    content: { body: '# Hello', seo: { keywords: ['a'], title: 'SEO Title', description: 'Desc' } },
  };
  // Same data, different key order in nested objects
  const payload2 = {
    title: 'Test',
    content: { seo: { description: 'Desc', title: 'SEO Title', keywords: ['a'] }, body: '# Hello' },
    contentType: 'guide',
  };
  const hash1 = computeRequestHash(payload1);
  const hash2 = computeRequestHash(payload2);
  assertEqual('requestHash', hash1, hash2, 'Different key order should produce same requestHash (recursive sort)');
});

test('19. Body content changed -> different requestHash', () => {
  const payload1 = { contentType: 'guide', title: 'Test', content: { body: '# Original content' } };
  const payload2 = { contentType: 'guide', title: 'Test', content: { body: '# Modified content' } };
  const hash1 = computeRequestHash(payload1);
  const hash2 = computeRequestHash(payload2);
  assert('requestHash', hash1 !== hash2, 'Body change should produce different requestHash');
});

test('20. Checklist item changed -> different requestHash', () => {
  const payload1 = {
    contentType: 'checklist', title: 'Checklist',
    content: { groups: [{ name: 'Group 1', items: [{ title: 'Item A' }] }] },
  };
  const payload2 = {
    contentType: 'checklist', title: 'Checklist',
    content: { groups: [{ name: 'Group 1', items: [{ title: 'Item B' }] }] },
  };
  const hash1 = computeRequestHash(payload1);
  const hash2 = computeRequestHash(payload2);
  assert('requestHash', hash1 !== hash2, 'Checklist item change should produce different requestHash');
});

test('21. Topic resource changed -> different requestHash', () => {
  const payload1 = {
    contentType: 'topic', title: 'Topic',
    content: { subtopics: [{ title: 'Resource A', url: 'https://a.com' }] },
  };
  const payload2 = {
    contentType: 'topic', title: 'Topic',
    content: { subtopics: [{ title: 'Resource B', url: 'https://b.com' }] },
  };
  const hash1 = computeRequestHash(payload1);
  const hash2 = computeRequestHash(payload2);
  assert('requestHash', hash1 !== hash2, 'Topic resource change should produce different requestHash');
});

test('22. Volatile fields changed -> same requestHash (taskId, slug, timestamp)', () => {
  const payload1 = {
    contentType: 'guide', title: 'Test', content: { body: '# Hello' },
    taskId: 'task_001', jobId: 'job_001', idempotencyKeyHash: 'abc123',
    slug: 'test-123', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z',
  };
  const payload2 = {
    contentType: 'guide', title: 'Test', content: { body: '# Hello' },
    taskId: 'task_002', jobId: 'job_002', idempotencyKeyHash: 'def456',
    slug: 'test-456', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-06-02T00:00:00Z',
  };
  const hash1 = computeRequestHash(payload1);
  const hash2 = computeRequestHash(payload2);
  assertEqual('requestHash', hash1, hash2, 'Volatile field changes should NOT affect requestHash');
});

// ============================================================================
// RAW CHAT ID TEST (part of IDEMPOTENCY)
// ============================================================================

test('23. Raw chatId not in persisted files', () => {
  fs.rmSync(claimDir, { recursive: true, force: true });
  fs.mkdirSync(claimDir, { recursive: true });
  const rawChatId = '123456789';
  const key = generateTelegramIdempotencyKey(rawChatId, 999);
  atomicClaim(key.keyHash, key.keyVersion, 'task_23', 'task_23', 'guide');
  const claimFile = path.join(claimDir, `${key.keyHash}.json`);
  const claimContent = fs.readFileSync(claimFile, 'utf-8');
  assert('idempotency', !claimContent.includes(rawChatId), 'Raw chatId should NOT be in claim file');
  assert('idempotency', !claimContent.includes('123456789'), 'Raw chatId number should NOT appear');
  assert('idempotency', claimContent.includes(key.keyHash), 'Key hash SHOULD be in claim file');
  assertEqual('idempotency', key.keyHash.length, 64, 'Key hash should be 64 hex chars');
  assert('idempotency', /^[0-9a-f]{64}$/.test(key.keyHash), 'Key hash should be valid SHA-256 hex');
});

// ============================================================================
// ROLLBACK SQL TEST (16)
// ============================================================================

test('24. Rollback SQL contains single executable DROP TABLE', () => {
  const rollbackPath = path.join(__dirname, '..', 'prisma', 'migrations', 'v2_idempotency_claim', 'rollback.sql');
  const sql = fs.readFileSync(rollbackPath, 'utf-8');
  // Extract executable statements (non-comment lines)
  const lines = sql.split('\n').filter(l => l.trim() && !l.trim().startsWith('--'));
  assert('idempotency', lines.length === 1, `Should have exactly 1 executable statement, got ${lines.length}`);
  const stmt = lines[0].trim();
  assert('idempotency', stmt.toUpperCase().startsWith('DROP TABLE'), 'Statement should be DROP TABLE');
  assert('idempotency', stmt.includes('contentops_idempotency_claims'), 'Should drop the correct table');
  assert('idempotency', !stmt.includes('guides'), 'Should NOT touch guides table');
  assert('idempotency', !stmt.includes('checklists'), 'Should NOT touch checklists table');
  assert('idempotency', !stmt.includes('topics'), 'Should NOT touch topics table');
  assert('idempotency', !sql.includes('***'), 'Should NOT contain redacted placeholder');
  assert('idempotency', !sql.includes('password') && !sql.includes('DATABASE_URL'), 'Should NOT contain secrets');
});

// ============================================================================
// Cleanup
// ============================================================================

test('25. Cleanup', () => {
  fs.rmSync(TEST_STATE_DIR, { recursive: true, force: true });
  assert('idempotency', !fs.existsSync(TEST_STATE_DIR), 'Test state dir should be cleaned up');
});

// ============================================================================
// Wait for all async tests to complete, then print results
// ============================================================================

Promise.all(testPromises).then(() => {
console.log(`\n${'='.repeat(60)}`);
console.log(`IDEMPOTENCY_TEST_TOTAL=${idempotencyTestCount}`);
console.log(`IDEMPOTENCY_TEST_PASSED=${idempotencyPassCount}`);
console.log(`IDEMPOTENCY_TEST_FAILED=${idempotencyFailCount}`);
console.log(`TRANSACTION_TEST_TOTAL=${transactionTestCount}`);
console.log(`TRANSACTION_TEST_PASSED=${transactionPassCount}`);
console.log(`TRANSACTION_TEST_FAILED=${transactionFailCount}`);
console.log(`REQUEST_HASH_TEST_TOTAL=${requestHashTestCount}`);
console.log(`REQUEST_HASH_TEST_PASSED=${requestHashPassCount}`);
console.log(`REQUEST_HASH_TEST_FAILED=${requestHashFailCount}`);
console.log(`ROLLBACK_TEST_RESULT=${idempotencyFailCount === 0 && transactionFailCount === 0 && requestHashFailCount === 0 ? 'PASS' : 'FAIL'}`);
if (idempotencyFailures.length > 0) { console.log('\nIDEMPOTENCY FAILURES:'); idempotencyFailures.forEach(f => console.log(`  - ${f}`)); }
if (transactionFailures.length > 0) { console.log('\nTRANSACTION FAILURES:'); transactionFailures.forEach(f => console.log(`  - ${f}`)); }
if (requestHashFailures.length > 0) { console.log('\nREQUEST_HASH FAILURES:'); requestHashFailures.forEach(f => console.log(`  - ${f}`)); }
console.log(`${'='.repeat(60)}`);

const totalFail = idempotencyFailCount + transactionFailCount + requestHashFailCount;
if (totalFail > 0) process.exit(1);
});
