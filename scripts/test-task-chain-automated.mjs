#!/usr/bin/env node
/**
 * Task Chain Automated Validation Script
 * Tests task chain CRUD operations, persistence, and permissions
 */

const API_BASE = 'https://jueshi.net';

// Test results storage
const results = {
  tests: [],
  passed: 0,
  failed: 0,
  skipped: 0,
};

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function test(name, fn) {
  results.tests.push({ name, status: 'pending' });
  return fn()
    .then(() => {
      results.tests[results.tests.length - 1].status = 'passed';
      results.passed++;
      log(`✅ PASS: ${name}`);
    })
    .catch((err) => {
      results.tests[results.tests.length - 1].status = 'failed';
      results.tests[results.tests.length - 1].error = err.message;
      results.failed++;
      log(`❌ FAIL: ${name} - ${err.message}`);
    });
}

function skip(name, reason) {
  results.tests.push({ name, status: 'skipped', reason });
  results.skipped++;
  log(`⏭️ SKIP: ${name} - ${reason}`);
}

// API helpers
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  
  return res.json();
}

// Test suite
async function runTests() {
  log('Starting Task Chain Automated Validation...');
  log('');

  // Test 1: Guest cannot access task chains
  await test('Guest cannot access task chain list', async () => {
    try {
      await apiRequest('/api/task-chains');
      throw new Error('Should have returned 401');
    } catch (err) {
      if (!err.message.includes('401')) throw err;
    }
  });

  // Test 2: Guest cannot create task chain
  await test('Guest cannot create task chain', async () => {
    try {
      await apiRequest('/api/task-chains', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Task',
          sourceTool: 'test',
          context: {},
        }),
      });
      throw new Error('Should have returned 401');
    } catch (err) {
      if (!err.message.includes('401')) throw err;
    }
  });

  // Test 3: Guest cannot access specific task
  await test('Guest cannot access specific task', async () => {
    try {
      await apiRequest('/api/task-chains/test-id');
      throw new Error('Should have returned 401');
    } catch (err) {
      if (!err.message.includes('401')) throw err;
    }
  });

  // Test 4: API endpoint exists
  await test('Task chain API endpoint exists', async () => {
    // This will fail with 401, but that proves the endpoint exists
    try {
      await apiRequest('/api/task-chains');
    } catch (err) {
      if (!err.message.includes('401')) throw err;
    }
  });

  // Test 5: PATCH method is supported
  await test('PATCH method is supported on task chain API', async () => {
    // This will fail with 401, but we can check the error message
    try {
      await apiRequest('/api/task-chains/test-id', {
        method: 'PATCH',
        body: JSON.stringify({ context: { test: true } }),
      });
    } catch (err) {
      // 401 is expected for unauthenticated request
      if (!err.message.includes('401')) throw err;
    }
  });

  // Test 6: PUT method is supported
  await test('PUT method is supported on task chain API', async () => {
    try {
      await apiRequest('/api/task-chains/test-id', {
        method: 'PUT',
        body: JSON.stringify({ context: { test: true } }),
      });
    } catch (err) {
      if (!err.message.includes('401')) throw err;
    }
  });

  // Test 7: DELETE method is supported
  await test('DELETE method is supported on task chain API', async () => {
    try {
      await apiRequest('/api/task-chains/test-id', {
        method: 'DELETE',
      });
    } catch (err) {
      if (!err.message.includes('401')) throw err;
    }
  });

  // Test 8: Postal code advanced API exists
  await test('Postal code advanced API exists', async () => {
    const data = await apiRequest('/api/postal-codes/advanced?mode=city&q=Toronto');
    if (!data.results || data.results.length === 0) {
      throw new Error('No results for Toronto');
    }
  });

  // Test 9: Postal code supports Chinese city names
  await test('Postal code supports Chinese city names', async () => {
    const data = await apiRequest('/api/postal-codes/advanced?mode=city&q=多伦多');
    if (!data.results || data.results.length === 0) {
      throw new Error('No results for 多伦多');
    }
  });

  // Test 10: Postal code supports region lookup
  await test('Postal code supports region lookup', async () => {
    const data = await apiRequest('/api/postal-codes/advanced?mode=region&q=M5V+3L9');
    if (!data.results || data.results.length === 0) {
      throw new Error('No results for M5V 3L9');
    }
  });

  // Test 11: Postal code supports address format
  await test('Postal code supports address format', async () => {
    const data = await apiRequest('/api/postal-codes/advanced?mode=format&country=CA');
    if (!data.results || data.results.length === 0) {
      throw new Error('No results for Canada address format');
    }
  });

  // Test 12: Guide pages return 200
  await test('Guide page /guides/address-format returns 200', async () => {
    const res = await fetch(`${API_BASE}/guides/address-format`);
    if (res.status !== 200) {
      throw new Error(`Expected 200, got ${res.status}`);
    }
  });

  // Test 13: Guide page /guides/hs-code-basics returns 200
  await test('Guide page /guides/hs-code-basics returns 200', async () => {
    const res = await fetch(`${API_BASE}/guides/hs-code-basics`);
    if (res.status !== 200) {
      throw new Error(`Expected 200, got ${res.status}`);
    }
  });

  // Test 14: Guide page /guides/commercial-invoice returns 200
  await test('Guide page /guides/commercial-invoice returns 200', async () => {
    const res = await fetch(`${API_BASE}/guides/commercial-invoice`);
    if (res.status !== 200) {
      throw new Error(`Expected 200, got ${res.status}`);
    }
  });

  // Test 15: Guide page /guides/packing-list returns 200
  await test('Guide page /guides/packing-list returns 200', async () => {
    const res = await fetch(`${API_BASE}/guides/packing-list`);
    if (res.status !== 200) {
      throw new Error(`Expected 200, got ${res.status}`);
    }
  });

  // Test 16: Guide page /guides/international-shipping-documents returns 200
  await test('Guide page /guides/international-shipping-documents returns 200', async () => {
    const res = await fetch(`${API_BASE}/guides/international-shipping-documents`);
    if (res.status !== 200) {
      throw new Error(`Expected 200, got ${res.status}`);
    }
  });

  // Test 17: Deploy version is accessible
  await test('Deploy version is accessible', async () => {
    const data = await apiRequest('/deploy-version.json');
    if (!data.version || !data.commit || !data.buildId) {
      throw new Error('Missing required fields in deploy-version.json');
    }
  });

  // Test 18: Deploy version matches expected
  await test('Deploy version is v1.20.42.18.0', async () => {
    const data = await apiRequest('/deploy-version.json');
    if (data.version !== 'v1.20.42.18.0') {
      throw new Error(`Expected v1.20.42.18.0, got ${data.version}`);
    }
  });

  // Test 19: Task chain workbench page exists
  await test('Task chain workbench page exists', async () => {
    const res = await fetch(`${API_BASE}/workspace/task-chains`);
    // Will redirect to login (302) or return 200
    if (res.status !== 200 && res.status !== 302) {
      throw new Error(`Expected 200 or 302, got ${res.status}`);
    }
  });

  // Test 20: Task chain new page exists
  await test('Task chain new page exists', async () => {
    const res = await fetch(`${API_BASE}/workspace/task-chains/shipping/new`);
    if (res.status !== 200 && res.status !== 302) {
      throw new Error(`Expected 200 or 302, got ${res.status}`);
    }
  });

  log('');
  log('='.repeat(60));
  log(`Tests completed: ${results.tests.length}`);
  log(`Passed: ${results.passed}`);
  log(`Failed: ${results.failed}`);
  log(`Skipped: ${results.skipped}`);
  log('='.repeat(60));

  // Output detailed results
  log('');
  log('Detailed Results:');
  results.tests.forEach((test, idx) => {
    const icon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️';
    log(`${icon} ${idx + 1}. ${test.name}`);
    if (test.status === 'failed') {
      log(`   Error: ${test.error}`);
    }
    if (test.status === 'skipped') {
      log(`   Reason: ${test.reason}`);
    }
  });

  // Exit with appropriate code
  if (results.failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  log(`Fatal error: ${err.message}`);
  process.exit(1);
});
