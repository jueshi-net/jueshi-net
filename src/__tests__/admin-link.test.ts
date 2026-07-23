/**
 * ContentOps Admin Link Test Suite
 * 
 * Tests that admin URLs are correctly constructed and accessible.
 * 
 * V2-MVP: v1.20.42.18.6.21.12.3
 */

import { 
  buildContentOpsAdminUrl, 
  buildContentOpsTaskAdminUrl, 
  buildContentOpsContentAdminUrl,
  getAdminBaseUrl 
} from '../lib/contentops/admin-url-builder';

let testResults: Array<{ name: string; passed: boolean; error?: string }> = [];

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

function runTest(name: string, fn: () => void): void {
  try {
    fn();
    testResults.push({ name, passed: true });
    console.log(`  ✅ ${name}`);
  } catch (error: any) {
    testResults.push({ name, passed: false, error: error.message });
    console.log(`  ❌ ${name}: ${error.message}`);
  }
}

// ============================================================================
// Tests
// ============================================================================

console.log('\n=== ContentOps Admin Link Test Suite ===\n');

// Test 1: Admin URL builder generates real paths
runTest('1. Admin URL builder generates real paths', () => {
  const url = buildContentOpsAdminUrl('staging');
  assert(url === 'https://i.jueshi.net/admin/contentops', `Expected https://i.jueshi.net/admin/contentops, got ${url}`);
});

// Test 2: Content admin URL generates correct paths for each type
runTest('2. Content admin URL generates correct paths', () => {
  const topicUrl = buildContentOpsContentAdminUrl('topic', 'cmtest123', 'staging');
  assert(topicUrl === 'https://i.jueshi.net/admin/content/topics/cmtest123/edit', `Topic URL wrong: ${topicUrl}`);
  
  const guideUrl = buildContentOpsContentAdminUrl('guide', 'cmtest456', 'staging');
  assert(guideUrl === 'https://i.jueshi.net/admin/content/guides/cmtest456/edit', `Guide URL wrong: ${guideUrl}`);
  
  const checklistUrl = buildContentOpsContentAdminUrl('checklist', 'cmtest789', 'staging');
  assert(checklistUrl === 'https://i.jueshi.net/admin/content/checklists/cmtest789/edit', `Checklist URL wrong: ${checklistUrl}`);
});

// Test 3: Admin URL does not contain /admin/content-ops (old error)
runTest('3. Admin URL does not contain /admin/content-ops', () => {
  const url = buildContentOpsAdminUrl('staging');
  assert(!url.includes('/admin/content-ops'), `URL should not contain /admin/content-ops: ${url}`);
  // Correct path is /admin/contentops
  assert(url.includes('/admin/contentops'), `URL should contain /admin/contentops: ${url}`);
});

// Test 4: Task admin URL falls back to dashboard
runTest('4. Task admin URL falls back to dashboard', () => {
  const url = buildContentOpsTaskAdminUrl('task_123', 'staging');
  assert(url === 'https://i.jueshi.net/admin/contentops', `Task URL should fall back to dashboard: ${url}`);
});

// Test 5: Production URL uses correct base
runTest('5. Production URL uses correct base', () => {
  const url = buildContentOpsAdminUrl('production');
  assert(url === 'https://jueshi.net/admin/contentops', `Production URL wrong: ${url}`);
});

// Test 6: Content URL for unknown type falls back to dashboard
runTest('6. Content URL for unknown type falls back to dashboard', () => {
  const url = buildContentOpsContentAdminUrl('unknown', 'cmtest', 'staging');
  assert(url === 'https://i.jueshi.net/admin/contentops', `Unknown type should fall back: ${url}`);
});

// ============================================================================
// Summary
// ============================================================================

const total = testResults.length;
const passed = testResults.filter(r => r.passed).length;
const failed = testResults.filter(r => !r.passed).length;

console.log('\n=== Test Summary ===');
console.log(`Total: ${total}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

console.log('\n=== Output Variables ===');
console.log(`ADMIN_LINK_SUITE_TOTAL=${total}`);
console.log(`ADMIN_LINK_SUITE_PASSED=${passed}`);
console.log(`ADMIN_LINK_SUITE_FAILED=${failed}`);
console.log(`ADMIN_LINK_SUITE_EXIT_CODE=${failed > 0 ? 1 : 0}`);

process.exit(failed > 0 ? 1 : 0);
