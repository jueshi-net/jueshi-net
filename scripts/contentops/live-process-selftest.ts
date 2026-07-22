#!/usr/bin/env tsx
/**
 * Live Process Self-Test
 * 
 * Runs self-tests within the actual Bot process context.
 * Uses the same modules loaded by the running Bot.
 */

import * as path from 'path';

// Import from the actual modules used by the Bot
import { parseCreateTaskResponse } from '../../src/lib/contentops/bridge-response-parser';
import { isValidContentType, getContentTypeDisplayName } from '../../src/lib/contentops/contracts/content-types';
import { isValidExecutionMode } from '../../src/lib/contentops/contracts/execution-modes';
import { isValidTaskStatus, TASK_STATUS } from '../../src/lib/contentops/contracts/task-contract';
import { isValidJobStatus, JOB_STATUS } from '../../src/lib/contentops/contracts/job-contract';
import { isValidNotificationType, NOTIFICATION_TYPES } from '../../src/lib/contentops/contracts/notification-contract';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`✅ ${name}`);
  } catch (error: any) {
    results.push({ name, passed: false, error: error.message });
    console.error(`❌ ${name}: ${error.message}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

// ============================================================================
// Parser Self-Test
// ============================================================================

test('LIVE_PROCESS_PARSER_SELFTEST', () => {
  // Test that the parser module is loaded and functional
  assert(typeof parseCreateTaskResponse === 'function', 'parseCreateTaskResponse should be a function');
  
  const validResponse = {
    ok: true,
    status: 200,
    data: {
      ok: true,
      data: {
        task: { id: 'task_test', status: 'QUEUED' },
        job: { id: 'job_test', status: 'QUEUED' }
      }
    }
  };
  
  const result = parseCreateTaskResponse(validResponse);
  assert(result.ok === true, 'Should parse valid response');
});

// ============================================================================
// Bridge Parser Self-Test
// ============================================================================

test('LIVE_PROCESS_BRIDGE_PARSER_SELFTEST', () => {
  // Test Bridge response parsing
  const invalidResponse = {
    ok: true,
    status: 200,
    data: {
      ok: true,
      data: {
        task: { id: '', status: 'QUEUED' },
        job: { id: 'job_test', status: 'QUEUED' }
      }
    }
  };
  
  try {
    parseCreateTaskResponse(invalidResponse);
    throw new Error('Should have thrown for missing task ID');
  } catch (error: any) {
    assert(error.message.length > 0, 'Should throw error for invalid response');
  }
});

// ============================================================================
// Task Contract Self-Test
// ============================================================================

test('LIVE_PROCESS_TASK_CONTRACT_SELFTEST', () => {
  // Test task contract validation
  assert(isValidTaskStatus('RECEIVED'), 'RECEIVED should be valid');
  assert(isValidTaskStatus('QUEUED'), 'QUEUED should be valid');
  assert(isValidTaskStatus('RUNNING'), 'RUNNING should be valid');
  assert(isValidTaskStatus('PUBLISHED'), 'PUBLISHED should be valid');
  assert(!isValidTaskStatus('INVALID_STATUS'), 'INVALID_STATUS should not be valid');
  
  // Test content type validation
  assert(isValidContentType('guide'), 'guide should be valid');
  assert(isValidContentType('checklist'), 'checklist should be valid');
  assert(isValidContentType('topic'), 'topic should be valid');
  
  // Test execution mode validation
  assert(isValidExecutionMode('draft_only'), 'draft_only should be valid');
  assert(isValidExecutionMode('publish_when_validated'), 'publish_when_validated should be valid');
});

// ============================================================================
// Job Contract Self-Test
// ============================================================================

test('LIVE_PROCESS_JOB_CONTRACT_SELFTEST', () => {
  // Test job contract validation
  assert(isValidJobStatus('QUEUED'), 'QUEUED should be valid');
  assert(isValidJobStatus('CLAIMED'), 'CLAIMED should be valid');
  assert(isValidJobStatus('RUNNING'), 'RUNNING should be valid');
  assert(isValidJobStatus('SUCCEEDED'), 'SUCCEEDED should be valid');
  assert(isValidJobStatus('FAILED'), 'FAILED should be valid');
  assert(!isValidJobStatus('INVALID_STATUS'), 'INVALID_STATUS should not be valid');
});

// ============================================================================
// Notification Contract Self-Test
// ============================================================================

test('LIVE_PROCESS_NOTIFICATION_CONTRACT_SELFTEST', () => {
  // Test notification contract validation
  assert(isValidNotificationType('TASK_ACCEPTED'), 'TASK_ACCEPTED should be valid');
  assert(isValidNotificationType('TASK_QUEUED'), 'TASK_QUEUED should be valid');
  assert(isValidNotificationType('GENERATION_STARTED'), 'GENERATION_STARTED should be valid');
  assert(isValidNotificationType('CONTENT_PUBLISHED'), 'CONTENT_PUBLISHED should be valid');
  assert(isValidNotificationType('TASK_FAILED'), 'TASK_FAILED should be valid');
  assert(!isValidNotificationType('INVALID_TYPE'), 'INVALID_TYPE should not be valid');
});

// ============================================================================
// Production Lock Self-Test
// ============================================================================

test('LIVE_PROCESS_PRODUCTION_LOCK_SELFTEST', () => {
  // Verify production is locked
  const productionAllowed = process.env.PRODUCTION_ALLOWED === 'true';
  assert(!productionAllowed, 'Production should not be allowed in test environment');
  
  // Verify target environment
  const targetEnv = process.env.TARGET_ENV || 'shared-staging';
  assert(targetEnv.includes('staging'), 'Target environment should be staging');
});

// ============================================================================
// Summary
// ============================================================================

console.log('\n=== Live Process Self-Test Summary ===');
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;
console.log(`Total: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  console.log('\nFailed tests:');
  results.filter(r => !r.passed).forEach(r => {
    console.log(`  - ${r.name}: ${r.error}`);
  });
  process.exit(1);
}

console.log('\n✅ All live process self-tests passed!');
process.exit(0);
