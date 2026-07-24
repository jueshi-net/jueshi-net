#!/usr/bin/env tsx
/**
 * ContentOps Acceptance Batch Creator
 * 
 * Creates a fresh acceptance batch with 4 tasks:
 * 1. Guide success task
 * 2. Checklist success task
 * 3. Topic success task
 * 4. Forced failure task
 * 
 * All tasks use:
 * - source=internal_runtime_acceptance
 * - provider=deterministic_fixture
 * - internalAuthorized=true
 * - transport=internal_test
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

import { canonicalTaskService } from '../../src/lib/contentops/canonical-task-service';

const ACCEPTANCE_RUN_ID = `acceptance_${Date.now()}`;

async function createAcceptanceBatch() {
  console.log('=== ContentOps Acceptance Batch ===');
  console.log(`Run ID: ${ACCEPTANCE_RUN_ID}`);
  console.log('');

  const tasks = [
    {
      name: 'Guide Success',
      contentType: 'guide' as const,
      topic: 'Acceptance Test: Guide Creation',
      forceFailure: false,
    },
    {
      name: 'Checklist Success',
      contentType: 'checklist' as const,
      topic: 'Acceptance Test: Checklist Creation',
      forceFailure: false,
    },
    {
      name: 'Topic Success',
      contentType: 'topic' as const,
      topic: 'Acceptance Test: Topic Creation',
      forceFailure: false,
    },
    {
      name: 'Forced Failure',
      contentType: 'guide' as const,
      topic: 'Acceptance Test: Forced Failure',
      forceFailure: true,
    },
  ];

  const results = [];

  for (const task of tasks) {
    console.log(`Creating: ${task.name}`);
    
    const result = await canonicalTaskService.createAndEnqueueContentOpsTask({
      contentType: task.contentType,
      rawInput: task.topic,
      topic: task.topic,
      executionMode: 'draft_only',
      targetEnvironment: 'staging',
      source: 'internal_runtime_acceptance',
      provider: 'deterministic_fixture',
      internalAuthorized: true,
      // @ts-ignore - forceFailure is not in the type but used by worker
      forceFailure: task.forceFailure,
    });

    if (result.ok) {
      console.log(`  ✓ Task created: ${result.taskId}`);
      results.push({
        name: task.name,
        taskId: result.taskId,
        status: 'CREATED',
      });
    } else {
      console.log(`  ✗ Task failed: ${result.error?.message}`);
      results.push({
        name: task.name,
        taskId: null,
        status: 'FAILED',
        error: result.error?.message,
      });
    }
  }

  console.log('');
  console.log('=== Summary ===');
  console.log(`Created: ${results.filter(r => r.status === 'CREATED').length}/${tasks.length}`);
  console.log('');
  console.log('Task IDs:');
  for (const r of results) {
    console.log(`  ${r.name}: ${r.taskId || 'N/A'}`);
  }

  return results;
}

createAcceptanceBatch()
  .then(() => {
    console.log('');
    console.log('Acceptance batch created. Worker will process tasks automatically.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
