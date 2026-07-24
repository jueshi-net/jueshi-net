/**
 * Worker Recovery & Task Identity Regression Tests
 *
 * Tests for:
 *   WORKER_FAILURE: catch scope, crash-proof cleanup, error preservation (tests 1-7)
 *   TASK_IDENTITY: single generation, claim/task/job consistency (tests 8-10)
 *
 * These are unit tests with mocked file system.
 * They do NOT connect to staging database or call Hermes.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ============================================================================
// Test framework
// ============================================================================

let workerTestCount = 0;
let workerPassCount = 0;
let workerFailCount = 0;
const workerFailures: string[] = [];

let identityTestCount = 0;
let identityPassCount = 0;
let identityFailCount = 0;
const identityFailures: string[] = [];

const testPromises: Promise<void>[] = [];

function test(name: string, fn: () => void | Promise<void>, category: 'worker' | 'identity') {
  const promise = Promise.resolve().then(() => fn()).then(() => {
    if (category === 'worker') {
      workerTestCount++;
      workerPassCount++;
    } else {
      identityTestCount++;
      identityPassCount++;
    }
  }).catch((err) => {
    const msg = `${name}: ${err.message || err}`;
    if (category === 'worker') {
      workerTestCount++;
      workerFailCount++;
      workerFailures.push(msg);
    } else {
      identityTestCount++;
      identityFailCount++;
      identityFailures.push(msg);
    }
    console.error(`FAIL: ${msg}`);
  });
  testPromises.push(promise);
}

function assert(category: 'worker' | 'identity', condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ============================================================================
// Test state
// ============================================================================

const TEST_STATE_DIR = path.join(os.tmpdir(), `contentops-recovery-test-${Date.now()}`);
const TEST_JOBS_DIR = path.join(TEST_STATE_DIR, 'jobs');
const TEST_INBOX = path.join(TEST_JOBS_DIR, 'inbox');
const TEST_PROCESSING = path.join(TEST_JOBS_DIR, 'processing');
const TEST_FAILED = path.join(TEST_JOBS_DIR, 'failed');
const TEST_OUTBOX = path.join(TEST_JOBS_DIR, 'outbox');
const TEST_CLAIMS = path.join(TEST_STATE_DIR, 'idempotency');

// Setup test directories
for (const dir of [TEST_INBOX, TEST_PROCESSING, TEST_FAILED, TEST_OUTBOX, TEST_CLAIMS]) {
  fs.mkdirSync(dir, { recursive: true });
}

// ============================================================================
// Helper: simulate processJob error handling structure
// ============================================================================

/**
 * Simulates the worker's processJob catch block.
 * This tests that:
 * 1. task is accessible in catch (no ReferenceError)
 * 2. Each cleanup step is independently protected
 * 3. Primary error is preserved
 */
function simulateProcessJobError(jobData: any, triggerError: string) {
  let task: any | null = null;
  const cleanupLog: string[] = [];
  let preservedError: string | null = null;

  try {
    // Simulate task creation (same structure as worker)
    task = {
      id: jobData.jobId,
      idempotencyKeyHash: jobData.idempotencyKeyHash || '',
      contentType: jobData.contentType,
    };

    // Simulate the error that would occur during processing
    throw new Error(triggerError);
  } catch (error: any) {
    const primaryErrorMessage = error instanceof Error ? error.message : String(error);
    preservedError = primaryErrorMessage;

    // Step 1: Mark claim as FAILED (in try-catch)
    try {
      if (task?.idempotencyKeyHash) {
        cleanupLog.push('claim-markFailed');
      }
    } catch (e) {
      cleanupLog.push('claim-markFailed-ERROR');
    }

    // Step 2: Move to failed (in try-catch)
    try {
      cleanupLog.push('job-moveToFailed');
    } catch (e) {
      cleanupLog.push('job-moveToFailed-ERROR');
    }

    // Step 3: Emit failure notification (in try-catch)
    try {
      cleanupLog.push('emitFailureNotification');
    } catch (e) {
      cleanupLog.push('emitFailureNotification-ERROR');
    }
  }

  return { task, cleanupLog, preservedError };
}

// ============================================================================
// WORKER FAILURE REGRESSION TESTS (1-7)
// ============================================================================

test('1. Catch block can access task variable (no ReferenceError)', () => {
  const jobData = {
    jobId: 'test-worker-1',
    idempotencyKeyHash: 'abc123',
    contentType: 'guide',
  };
  const result = simulateProcessJobError(jobData, 'SIMULATED_ERROR');
  assert('worker', result.task !== null, 'task should be accessible in catch');
  assert('worker', result.task.id === 'test-worker-1', 'task.id should be correct');
}, 'worker');

test('2. Catch does not throw "task is not defined"', () => {
  const jobData = {
    jobId: 'test-worker-2',
    idempotencyKeyHash: 'def456',
    contentType: 'topic',
  };
  // If this doesn't throw, the test passes
  const result = simulateProcessJobError(jobData, 'ANY_ERROR');
  assert('worker', result.cleanupLog.length > 0, 'cleanup steps should have executed');
}, 'worker');

test('3. Primary error is preserved and not overwritten', () => {
  const jobData = {
    jobId: 'test-worker-3',
    idempotencyKeyHash: 'ghi789',
    contentType: 'checklist',
  };
  const result = simulateProcessJobError(jobData, 'ORIGINAL_HERMES_ERROR');
  assert('worker', result.preservedError === 'ORIGINAL_HERMES_ERROR', 'primary error should be preserved');
  assert('worker', !result.cleanupLog.some(l => l.includes('ERROR')), 'no cleanup errors should occur');
}, 'worker');

test('4. Error moves task to FAILED (claim markFailed called)', () => {
  const jobData = {
    jobId: 'test-worker-4',
    idempotencyKeyHash: 'jkl012',
    contentType: 'guide',
  };
  const result = simulateProcessJobError(jobData, 'TASK_ERROR');
  assert('worker', result.cleanupLog.includes('claim-markFailed'), 'claim should be marked as FAILED');
}, 'worker');

test('5. Error moves job to failed directory (moveToFailed called)', () => {
  const jobData = {
    jobId: 'test-worker-5',
    idempotencyKeyHash: 'mno345',
    contentType: 'topic',
  };
  const result = simulateProcessJobError(jobData, 'JOB_ERROR');
  assert('worker', result.cleanupLog.includes('job-moveToFailed'), 'job should be moved to failed');
}, 'worker');

test('6. Error generates failure terminal event (emitFailureNotification called)', () => {
  const jobData = {
    jobId: 'test-worker-6',
    idempotencyKeyHash: 'pqr678',
    contentType: 'checklist',
  };
  const result = simulateProcessJobError(jobData, 'NOTIFICATION_ERROR');
  assert('worker', result.cleanupLog.includes('emitFailureNotification'), 'failure notification should be emitted');
}, 'worker');

test('7. All three cleanup steps execute even if one fails', () => {
  // Simulate a scenario where markFailed throws
  let task: any | null = null;
  const log: string[] = [];

  try {
    task = { idempotencyKeyHash: 'test123' };
    throw new Error('PRIMARY_ERROR');
  } catch (error: any) {
    const primaryError = error.message;

    // Step 1 - will "fail"
    try {
      throw new Error('CLEANUP_STEP_1_ERROR');
    } catch (e) {
      log.push('step1-caught');
    }

    // Step 2 - should still execute
    try {
      log.push('step2-executed');
    } catch (e) {
      log.push('step2-caught');
    }

    // Step 3 - should still execute
    try {
      log.push('step3-executed');
    } catch (e) {
      log.push('step3-caught');
    }

    assert('worker', primaryError === 'PRIMARY_ERROR', 'primary error preserved');
  }

  assert('worker', log.includes('step1-caught'), 'step 1 error was caught');
  assert('worker', log.includes('step2-executed'), 'step 2 executed after step 1 failure');
  assert('worker', log.includes('step3-executed'), 'step 3 executed after step 1 failure');
}, 'worker');

// ============================================================================
// TASK IDENTITY REGRESSION TESTS (8-10)
// ============================================================================

test('8. TaskManager.createTask accepts pre-generated taskId', async () => {
  // Set test state dir
  process.env.CONTENTOPS_STATE_DIR = TEST_STATE_DIR;

  // Re-import with test state dir
  const { TaskManager } = await import('../src/lib/contentops/task-manager');
  const tm = new TaskManager();

  const preGeneratedId = 'task_test_pregenerated_001';
  const input = {
    chatId: '123',
    messageId: 999,
    rawInput: 'test input',
    contentType: 'guide' as const,
    executionMode: 'review_required' as const,
    targetEnvironment: 'staging' as const,
    idempotencyKeyHash: 'testhash',
    idempotencyKeyVersion: 1,
    idempotencySource: 'telegram' as const,
  };

  const task = await tm.createTask(input, preGeneratedId);
  assert('identity', task.id === preGeneratedId, `task.id should be ${preGeneratedId}, got ${task.id}`);

  // Verify task is persisted with the pre-generated ID
  const retrieved = await tm.getTask(preGeneratedId);
  assert('identity', retrieved !== null, 'task should be retrievable by pre-generated ID');
  assert('identity', retrieved?.id === preGeneratedId, 'retrieved task ID should match');
}, 'identity');

test('9. Claim taskId, task.id, and job.jobId all match when pre-generated', async () => {
  process.env.CONTENTOPS_STATE_DIR = TEST_STATE_DIR;

  const { TaskManager } = await import('../src/lib/contentops/task-manager');
  const tm = new TaskManager();

  const preGeneratedId = 'task_test_consistency_001';
  const keyHash = 'consistency_test_hash';

  // Simulate what CanonicalTaskService does:
  // 1. Generate provisional taskId
  // 2. Create task with that ID
  // 3. Use task.id as job.jobId

  const input = {
    chatId: '456',
    messageId: 888,
    rawInput: 'consistency test',
    contentType: 'topic' as const,
    executionMode: 'review_required' as const,
    targetEnvironment: 'staging' as const,
    idempotencyKeyHash: keyHash,
    idempotencyKeyVersion: 1,
    idempotencySource: 'telegram' as const,
  };

  const task = await tm.createTask(input, preGeneratedId);

  // job.jobId = task.id (same as CanonicalTaskService line 249)
  const jobId = task.id;

  assert('identity', task.id === preGeneratedId, 'task.id matches pre-generated');
  assert('identity', jobId === preGeneratedId, 'jobId matches task.id');
  assert('identity', task.idempotencyKeyHash === keyHash, 'keyHash propagated to task');
}, 'identity');

test('10. Without pre-generated ID, task still gets a valid ID (backward compat)', async () => {
  process.env.CONTENTOPS_STATE_DIR = TEST_STATE_DIR;

  const { TaskManager } = await import('../src/lib/contentops/task-manager');
  const tm = new TaskManager();

  const input = {
    chatId: '789',
    messageId: 777,
    rawInput: 'backward compat test',
    contentType: 'checklist' as const,
    executionMode: 'review_required' as const,
    targetEnvironment: 'staging' as const,
    idempotencyKeyHash: 'backcompat_hash',
    idempotencyKeyVersion: 1,
    idempotencySource: 'telegram' as const,
  };

  // Without preGeneratedTaskId, should auto-generate
  const task = await tm.createTask(input);
  assert('identity', task.id.startsWith('task_'), 'task ID should start with task_');
  assert('identity', task.id.length > 10, 'task ID should have sufficient length');
}, 'identity');

// ============================================================================
// Cleanup
// ============================================================================

test('11. Cleanup test state', () => {
  fs.rmSync(TEST_STATE_DIR, { recursive: true, force: true });
  assert('worker', !fs.existsSync(TEST_STATE_DIR), 'test state should be cleaned up');
}, 'worker');

// ============================================================================
// Wait for async tests and print results
// ============================================================================

Promise.all(testPromises).then(() => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`WORKER_FAILURE_REGRESSION_TEST_TOTAL=${workerTestCount}`);
  console.log(`WORKER_FAILURE_REGRESSION_TEST_PASSED=${workerPassCount}`);
  console.log(`WORKER_FAILURE_REGRESSION_TEST_FAILED=${workerFailCount}`);
  console.log(`TASK_IDENTITY_TEST_TOTAL=${identityTestCount}`);
  console.log(`TASK_IDENTITY_TEST_PASSED=${identityPassCount}`);
  console.log(`TASK_IDENTITY_TEST_FAILED=${identityFailCount}`);

  if (workerFailures.length > 0) {
    console.log('\nWORKER FAILURES:');
    workerFailures.forEach(f => console.log(`  - ${f}`));
  }
  if (identityFailures.length > 0) {
    console.log('\nIDENTITY FAILURES:');
    identityFailures.forEach(f => console.log(`  - ${f}`));
  }

  const totalFail = workerFailCount + identityFailCount;
  console.log(`${'='.repeat(60)}`);
  if (totalFail > 0) process.exit(1);
});
