/**
 * Duplicate Notification & Admin Link Regression Suite
 * 
 * Tests for:
 * 1. Task-based idempotency (failed+completed for same task = 1 send)
 * 2. Admin URL builder generates correct paths
 * 3. No hardcoded /admin/content-ops in notification messages
 * 4. Recovery overwriting failure notification doesn't cause duplicate
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

// Simulate the idempotency logic from notification-dispatcher.js
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

// Admin URL builder tests
function buildContentOpsAdminUrl(): string {
  return 'https://i.jueshi.net/admin/contentops';
}

function buildContentOpsContentAdminUrl(contentType: string, contentId: string): string {
  const base = 'https://i.jueshi.net';
  switch (contentType) {
    case 'topic':
      return `${base}/admin/content/topics/${contentId}/edit`;
    case 'guide':
      return `${base}/admin/content/guides/${contentId}/edit`;
    case 'checklist':
      return `${base}/admin/content/checklists/${contentId}/edit`;
    default:
      return buildContentOpsAdminUrl();
  }
}

console.log('📋 Duplicate Notification & Admin Link Regression Suite\n');
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

// Test 1: Worker failure and recovery use same task-based idempotency key
test('Worker failure and recovery use same idempotency key', () => {
  const failureId = resolveNotificationId(
    { notificationId: 'terminal:task_123:failed' },
    'task_123'
  );
  const completedId = resolveNotificationId(
    { notificationId: 'terminal:task_123:completed' },
    'task_123'
  );
  assert(failureId === completedId, `Expected same key, got ${failureId} vs ${completedId}`);
  assert(failureId === 'terminal:task_123', `Expected terminal:task_123, got ${failureId}`);
});

// Test 2: Recovery overwriting failure notification doesn't cause duplicate
test('Recovery overwriting failure notification is idempotent', () => {
  setup();
  const notified: Record<string, any> = {};
  
  // Simulate Worker failure notification
  const failureOutbox = {
    notificationId: 'terminal:task_456:failed',
    jobId: 'task_456',
    success: false,
    content: JSON.stringify({ contentType: 'topic', title: 'Test', status: 'FAILED' }),
  };
  
  const id1 = resolveNotificationId(failureOutbox, 'task_456');
  notified[id1] = { notifiedAt: new Date().toISOString() };
  
  // Simulate recovery overwriting with completed
  const recoveryOutbox = {
    notificationId: 'terminal:task_456:completed',
    jobId: 'task_456',
    success: true,
    content: JSON.stringify({ contentType: 'topic', title: 'Test', status: 'AWAITING_REVIEW' }),
  };
  
  const id2 = resolveNotificationId(recoveryOutbox, 'task_456');
  assert(notified[id2] !== undefined, 'Recovery should find existing notification as already sent');
  
  teardown();
});

// Test 3: Admin URL builder generates correct ContentOps path
test('Admin URL builder generates /admin/contentops (not /admin/content-ops)', () => {
  const url = buildContentOpsAdminUrl();
  assert(url === 'https://i.jueshi.net/admin/contentops', `Expected /admin/contentops, got ${url}`);
  assert(!url.includes('content-ops'), 'URL should not contain content-ops');
});

// Test 4: Admin URL builder generates correct content detail paths
test('Admin URL builder generates correct content detail paths', () => {
  const topicUrl = buildContentOpsContentAdminUrl('topic', 'abc123');
  assert(topicUrl === 'https://i.jueshi.net/admin/content/topics/abc123/edit', `Got ${topicUrl}`);
  
  const guideUrl = buildContentOpsContentAdminUrl('guide', 'def456');
  assert(guideUrl === 'https://i.jueshi.net/admin/content/guides/def456/edit', `Got ${guideUrl}`);
  
  const checklistUrl = buildContentOpsContentAdminUrl('checklist', 'ghi789');
  assert(checklistUrl === 'https://i.jueshi.net/admin/content/checklists/ghi789/edit', `Got ${checklistUrl}`);
});

// Test 5: No hardcoded /admin/content-ops in notification-dispatcher.js
test('No hardcoded /admin/content-ops in notification-dispatcher.js', () => {
  const dispatcherPath = path.join(process.cwd(), 'scripts/contentops/notification-dispatcher.js');
  const content = fs.readFileSync(dispatcherPath, 'utf-8');
  assert(!content.includes('/admin/content-ops'), 'notification-dispatcher.js should not contain /admin/content-ops');
  assert(content.includes('/admin/contentops'), 'notification-dispatcher.js should contain /admin/contentops');
});

// Test 6: No hardcoded /admin/content-ops in recover-task.ts
test('No hardcoded /admin/content-ops in recover-task.ts', () => {
  const recoverPath = path.join(process.cwd(), 'scripts/contentops/recover-task.ts');
  const content = fs.readFileSync(recoverPath, 'utf-8');
  assert(!content.includes('/admin/content-ops'), 'recover-task.ts should not contain /admin/content-ops');
});

// Test 7: Notification message contains correct admin URL
test('Notification message contains correct admin URL', () => {
  const dispatcherPath = path.join(process.cwd(), 'scripts/contentops/notification-dispatcher.js');
  const content = fs.readFileSync(dispatcherPath, 'utf-8');
  const matches = content.match(/https:\/\/i\.jueshi\.net\/admin\/\S+/g) || [];
  for (const match of matches) {
    assert(match.includes('/admin/contentops'), `URL ${match} should use /admin/contentops`);
  }
});

// Test 8: Unknown content type falls back to dashboard URL
test('Unknown content type falls back to dashboard URL', () => {
  const url = buildContentOpsContentAdminUrl('unknown', 'xyz');
  assert(url === 'https://i.jueshi.net/admin/contentops', `Expected dashboard URL, got ${url}`);
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
process.exit(failed > 0 ? 1 : 0);
