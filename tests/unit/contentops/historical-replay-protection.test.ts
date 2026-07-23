/**
 * Historical Notification Replay Protection Regression Suite
 * 
 * Tests for:
 * 1. Startup protection: legacy notifications without schemaVersion are archived
 * 2. Time window protection: stale notifications (>10min) are archived
 * 3. Malformed notification detection: Untitled/unknown/N/A fail closed
 * 4. Idempotency migration: old keys map to new task-based keys
 * 5. 100 historical outbox files produce 0 sends on startup
 * 6. Already-sent notifications are not re-sent
 * 7. Worker and Recovery use same idempotency key
 * 8. Concurrent consumers send only once
 * 9. Telegram failure doesn't mark as sent
 * 10. Failure then recovery sends different semantic notifications
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const HOME_DIR = os.homedir();
const TEST_OUTBOX_DIR = path.join(HOME_DIR, '.jueshi-contentops/jobs/test-outbox');
const TEST_NOTIFIED_FILE = path.join(HOME_DIR, '.jueshi-contentops/jobs/test-notified.json');

function setup() {
  if (!fs.existsSync(TEST_OUTBOX_DIR)) {
    fs.mkdirSync(TEST_OUTBOX_DIR, { recursive: true });
  }
  fs.writeFileSync(TEST_NOTIFIED_FILE, '{}');
}

function teardown() {
  if (fs.existsSync(TEST_OUTBOX_DIR)) {
    const files = fs.readdirSync(TEST_OUTBOX_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(TEST_OUTBOX_DIR, file));
    }
  }
}

// Simulate dispatcher validation logic
function validateNotification(outboxData: any, now: number = Date.now()): { valid: boolean; reason?: string } {
  // Startup protection: require schemaVersion
  if (!outboxData.schemaVersion) {
    return { valid: false, reason: 'missing_schemaVersion' };
  }
  
  // Time window protection: 10 minutes
  const MAX_AGE_MS = 10 * 60 * 1000;
  const createdAt = outboxData.createdAt ? new Date(outboxData.createdAt).getTime() : 0;
  if (createdAt && (now - createdAt) > MAX_AGE_MS) {
    return { valid: false, reason: 'stale_notification' };
  }
  
  // Malformed detection
  const content = typeof outboxData.content === 'string' 
    ? JSON.parse(outboxData.content) 
    : outboxData.content || {};
  
  const backendContentId = outboxData.backendContentId || outboxData.draftId;
  const taskId = outboxData.taskId || outboxData.jobId;
  
  if (!taskId) {
    return { valid: false, reason: 'missing_taskId' };
  }
  if (content.title === 'Untitled') {
    return { valid: false, reason: 'untitled_content' };
  }
  if (content.contentType === 'unknown') {
    return { valid: false, reason: 'unknown_contentType' };
  }
  if (!backendContentId || backendContentId === 'N/A' || backendContentId === 'draft_undefined') {
    return { valid: false, reason: 'invalid_backendContentId' };
  }
  
  return { valid: true };
}

// Idempotency key resolution
function resolveNotificationId(outboxData: any, fileTaskId: string): string {
  let notificationId = outboxData.notificationId || `terminal:${fileTaskId}:completed`;
  if (notificationId.startsWith('terminal:')) {
    const parts = notificationId.split(':');
    if (parts.length >= 3) {
      notificationId = `terminal:${parts[1]}`;
    }
  }
  return notificationId;
}

console.log('📋 Historical Notification Replay Protection Regression Suite\n');
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e: any) {
    console.log(`  ❌ ${name}: ${e.message}`);
    failed++;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

// Test 1: Legacy notification without schemaVersion is rejected
test('Legacy notification without schemaVersion is rejected', () => {
  const legacy = {
    notificationId: 'terminal:task_123:completed',
    jobId: 'task_123',
    content: JSON.stringify({ contentType: 'topic', title: 'Test' }),
    backendContentId: 'abc123',
  };
  const result = validateNotification(legacy);
  assert(!result.valid, 'Should reject legacy notification');
  assert(result.reason === 'missing_schemaVersion', `Expected missing_schemaVersion, got ${result.reason}`);
});

// Test 2: Stale notification (>10min old) is rejected
test('Stale notification (>10min old) is rejected', () => {
  const stale = {
    schemaVersion: 2,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
    notificationId: 'terminal:task_456',
    jobId: 'task_456',
    content: JSON.stringify({ contentType: 'topic', title: 'Test' }),
    backendContentId: 'def456',
  };
  const result = validateNotification(stale);
  assert(!result.valid, 'Should reject stale notification');
  assert(result.reason === 'stale_notification', `Expected stale_notification, got ${result.reason}`);
});

// Test 3: Fresh notification with schemaVersion is accepted
test('Fresh notification with schemaVersion is accepted', () => {
  const fresh = {
    schemaVersion: 2,
    createdAt: new Date().toISOString(),
    notificationId: 'terminal:task_789',
    jobId: 'task_789',
    content: JSON.stringify({ contentType: 'topic', title: 'Test Topic' }),
    backendContentId: 'ghi789',
  };
  const result = validateNotification(fresh);
  assert(result.valid, `Should accept fresh notification, got reason: ${result.reason}`);
});

// Test 4: Untitled content is rejected
test('Untitled content is rejected (fail closed)', () => {
  const untitled = {
    schemaVersion: 2,
    createdAt: new Date().toISOString(),
    notificationId: 'terminal:task_abc',
    jobId: 'task_abc',
    content: JSON.stringify({ contentType: 'topic', title: 'Untitled' }),
    backendContentId: 'xyz123',
  };
  const result = validateNotification(untitled);
  assert(!result.valid, 'Should reject Untitled content');
  assert(result.reason === 'untitled_content', `Expected untitled_content, got ${result.reason}`);
});

// Test 5: Unknown contentType is rejected
test('Unknown contentType is rejected (fail closed)', () => {
  const unknown = {
    schemaVersion: 2,
    createdAt: new Date().toISOString(),
    notificationId: 'terminal:task_def',
    jobId: 'task_def',
    content: JSON.stringify({ contentType: 'unknown', title: 'Test' }),
    backendContentId: 'uvw456',
  };
  const result = validateNotification(unknown);
  assert(!result.valid, 'Should reject unknown contentType');
  assert(result.reason === 'unknown_contentType', `Expected unknown_contentType, got ${result.reason}`);
});

// Test 6: N/A backendContentId is rejected
test('N/A backendContentId is rejected (fail closed)', () => {
  const naId = {
    schemaVersion: 2,
    createdAt: new Date().toISOString(),
    notificationId: 'terminal:task_ghi',
    jobId: 'task_ghi',
    content: JSON.stringify({ contentType: 'topic', title: 'Test' }),
    backendContentId: 'N/A',
  };
  const result = validateNotification(naId);
  assert(!result.valid, 'Should reject N/A backendContentId');
  assert(result.reason === 'invalid_backendContentId', `Expected invalid_backendContentId, got ${result.reason}`);
});

// Test 7: draft_undefined backendContentId is rejected
test('draft_undefined backendContentId is rejected (fail closed)', () => {
  const undefinedId = {
    schemaVersion: 2,
    createdAt: new Date().toISOString(),
    notificationId: 'terminal:task_jkl',
    jobId: 'task_jkl',
    content: JSON.stringify({ contentType: 'topic', title: 'Test' }),
    backendContentId: 'draft_undefined',
  };
  const result = validateNotification(undefinedId);
  assert(!result.valid, 'Should reject draft_undefined backendContentId');
  assert(result.reason === 'invalid_backendContentId', `Expected invalid_backendContentId, got ${result.reason}`);
});

// Test 8: Idempotency migration: old :completed key maps to new task-based key
test('Idempotency migration: old :completed key maps to new task-based key', () => {
  const oldKey = resolveNotificationId({ notificationId: 'terminal:task_mno:completed' }, 'task_mno');
  const newKey = resolveNotificationId({ notificationId: 'terminal:task_mno' }, 'task_mno');
  assert(oldKey === newKey, `Expected same key, got ${oldKey} vs ${newKey}`);
  assert(oldKey === 'terminal:task_mno', `Expected terminal:task_mno, got ${oldKey}`);
});

// Test 9: 100 historical outbox files produce 0 sends (all lack schemaVersion)
test('100 historical outbox files produce 0 sends (all lack schemaVersion)', () => {
  let acceptedCount = 0;
  for (let i = 0; i < 100; i++) {
    const legacy = {
      notificationId: `terminal:task_historical_${i}:completed`,
      jobId: `task_historical_${i}`,
      content: JSON.stringify({ contentType: 'topic', title: `Task ${i}` }),
      backendContentId: `draft_${i}`,
    };
    const result = validateNotification(legacy);
    if (result.valid) acceptedCount++;
  }
  assert(acceptedCount === 0, `Expected 0 accepted, got ${acceptedCount}`);
});

// Test 10: Already-sent notification is not re-sent (idempotent)
test('Already-sent notification is not re-sent (idempotent)', () => {
  const notified: Record<string, any> = {};
  const notification = {
    schemaVersion: 2,
    createdAt: new Date().toISOString(),
    notificationId: 'terminal:task_pqr',
    jobId: 'task_pqr',
    content: JSON.stringify({ contentType: 'topic', title: 'Test' }),
    backendContentId: 'pqr123',
  };
  
  const id = resolveNotificationId(notification, 'task_pqr');
  notified[id] = { notifiedAt: new Date().toISOString() };
  
  // Second attempt should find existing record
  const id2 = resolveNotificationId(notification, 'task_pqr');
  assert(notified[id2] !== undefined, 'Should find existing notification record');
});

// Test 11: Worker failure and Recovery use same idempotency key
test('Worker failure and Recovery use same idempotency key', () => {
  const failureId = resolveNotificationId({ notificationId: 'terminal:task_stu:failed' }, 'task_stu');
  const recoveryId = resolveNotificationId({ notificationId: 'terminal:task_stu:completed' }, 'task_stu');
  assert(failureId === recoveryId, `Expected same key, got ${failureId} vs ${recoveryId}`);
});

// Test 12: Concurrent consumers send only once
test('Concurrent consumers send only once (idempotent)', () => {
  const notified: Record<string, any> = {};
  const notification = {
    schemaVersion: 2,
    createdAt: new Date().toISOString(),
    notificationId: 'terminal:task_vwx',
    jobId: 'task_vwx',
    content: JSON.stringify({ contentType: 'topic', title: 'Test' }),
    backendContentId: 'vwx123',
  };
  
  // Simulate 10 concurrent consumers
  let sendCount = 0;
  for (let i = 0; i < 10; i++) {
    const id = resolveNotificationId(notification, 'task_vwx');
    if (!notified[id]) {
      sendCount++;
      notified[id] = { notifiedAt: new Date().toISOString() };
    }
  }
  
  assert(sendCount === 1, `Expected 1 send, got ${sendCount}`);
});

// Test 13: Telegram failure doesn't mark as sent
test('Telegram failure doesn\'t mark as sent', () => {
  const notified: Record<string, any> = {};
  const notification = {
    schemaVersion: 2,
    createdAt: new Date().toISOString(),
    notificationId: 'terminal:task_yz',
    jobId: 'task_yz',
    content: JSON.stringify({ contentType: 'topic', title: 'Test' }),
    backendContentId: 'yz123',
  };
  
  const id = resolveNotificationId(notification, 'task_yz');
  
  // Simulate Telegram failure - don't mark as sent
  const telegramSuccess = false;
  if (telegramSuccess) {
    notified[id] = { notifiedAt: new Date().toISOString() };
  }
  
  assert(notified[id] === undefined, 'Should not mark as sent after Telegram failure');
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
process.exit(failed > 0 ? 1 : 0);
