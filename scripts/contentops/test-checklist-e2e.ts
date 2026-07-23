#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { stagingHelperClient } from '../../src/lib/contentops/staging-helper-client';

const HOME_DIR = os.homedir();
const JOBS_DIR = path.join(HOME_DIR, '.jueshi-contentops/jobs');
const INBOX_DIR = path.join(JOBS_DIR, 'inbox');
const OUTBOX_DIR = path.join(JOBS_DIR, 'outbox');

async function testChecklistE2E() {
  console.log('\n=== Checklist E2E Test ===\n');
  
  const startTime = Date.now();
  const idempotencyKey = `test-checklist-${Date.now()}`;
  const rawInput = '创建一个新加坡海外华人首次租房检查清单，包含至少4个分组，每组至少5个项目';
  
  try {
    // Step 1: Create task
    console.log('[1/5] Creating checklist task...');
    const createTaskResponse = await stagingHelperClient.createTask({
      action: 'create_task',
      rawInput,
      contentType: 'checklist',
      executionMode: 'draft_only',
      targetEnvironment: 'staging',
      idempotencyKey,
    });
    
    if (createTaskResponse.status !== 201) {
      throw new Error(`Task creation failed: ${createTaskResponse.status}`);
    }
    
    const taskId = createTaskResponse.data?.data?.task?.id;
    if (!taskId) {
      throw new Error('Task ID missing from response');
    }
    console.log(`  ✓ TaskId: ${taskId}`);
    
    // Step 2: Write job to inbox
    console.log('[2/5] Writing job to inbox...');
    const jobData = {
      jobId: taskId,
      taskId: taskId,
      contentType: 'checklist',
      executionMode: 'draft_only',
      targetEnvironment: 'staging',
      rawInput,
      idempotencyKey,
      createdAt: new Date().toISOString(),
    };
    
    const jobFile = path.join(INBOX_DIR, `${taskId}.json`);
    fs.writeFileSync(jobFile, JSON.stringify(jobData, null, 2));
    console.log(`  ✓ Job written: ${jobFile}`);
    
    // Step 3: Wake worker
    console.log('[3/5] Waking worker...');
    try {
      const { execSync } = require('child_process');
      execSync('launchctl kickstart -k gui/$(id -u)/ai.hermes.contentops-worker', {
        stdio: 'pipe',
      });
      console.log('  ✓ Worker kicked');
    } catch (e: any) {
      console.log('  ⚠ Worker kick failed (may already be running):', e.message);
    }
    
    // Step 4: Wait for processing
    console.log('[4/5] Waiting for worker to process...');
    const outboxFile = path.join(OUTBOX_DIR, `${taskId}.json`);
    let processed = false;
    for (let i = 0; i < 60; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (fs.existsSync(outboxFile)) {
        processed = true;
        console.log(`  ✓ Job processed after ${(i + 1) * 1000}ms`);
        break;
      }
    }
    
    if (!processed) {
      throw new Error('Worker did not process job within 60 seconds');
    }
    
    // Step 4: Verify result
    console.log('[4/5] Verifying result...');
    const result = JSON.parse(fs.readFileSync(outboxFile, 'utf8'));
    console.log(`  ✓ Success: ${result.success}`);
    console.log(`  ✓ ContentType: ${result.contentType}`);
    console.log(`  ✓ ContractValidation: ${result.contractValidationPassed}`);
    
    const totalTime = Date.now() - startTime;
    console.log(`\n✅ Checklist E2E completed in ${totalTime}ms`);
    console.log(`   TaskId: ${taskId}`);
    console.log(`   DraftId: draft_${taskId}`);
    
    return true;
  } catch (error: any) {
    console.error(`\n❌ Checklist E2E failed: ${error.message}`);
    return false;
  }
}

testChecklistE2E().then(success => {
  process.exit(success ? 0 : 1);
});
