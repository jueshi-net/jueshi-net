#!/usr/bin/env tsx
/**
 * ContentOps Full Pipeline Test - Simplified
 * 
 * Tests complete flow: Bot → Helper → Bridge → Worker → Backend
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import { stagingHelperClient } from '../../src/lib/contentops/staging-helper-client';

const HOME_DIR = os.homedir();
const JOBS_DIR = path.join(HOME_DIR, '.jueshi-contentops/jobs');
const INBOX_DIR = path.join(JOBS_DIR, 'inbox');

async function testFullPipeline(runIndex: number) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Full Pipeline Test Run ${runIndex}`);
  console.log(`${'='.repeat(60)}\n`);
  
  const startTime = Date.now();
  const idempotencyKey = `test-pipeline-${Date.now()}-${runIndex}`;
  const rawInput = '写一篇第一次使用国际集运的完整操作指南，讲清楚下单、入仓、申报、付款和收货';
  
  try {
    // Step 1: Create task via staging helper
    console.log('[1/5] Creating task via staging helper...');
    const createTaskResponse = await stagingHelperClient.createTask({
      action: 'create_task',
      rawInput,
      contentType: 'guide',
      executionMode: 'draft_only',
      targetEnvironment: 'staging',
      idempotencyKey,
    });
    
    console.log(`  ✓ Status: ${createTaskResponse.status}`);
    
    if (createTaskResponse.status !== 201) {
      throw new Error(`Task creation failed: ${createTaskResponse.status}`);
    }
    
    const taskId = createTaskResponse.body?.taskId;
    if (!taskId) {
      throw new Error('Task ID missing from response');
    }
    console.log(`  ✓ TaskId: ${taskId}`);
    
    // Step 2: Write job to inbox
    console.log('[2/5] Writing job to inbox...');
    if (!fs.existsSync(INBOX_DIR)) {
      fs.mkdirSync(INBOX_DIR, { recursive: true });
    }
    
    const jobData = {
      taskId,
      contentType: 'guide',
      executionMode: 'draft_only',
      targetEnvironment: 'staging',
      rawInput,
      idempotencyKey,
      createdAt: new Date().toISOString(),
    };
    
    const jobPath = path.join(INBOX_DIR, `${taskId}.json`);
    fs.writeFileSync(jobPath, JSON.stringify(jobData, null, 2));
    console.log(`  ✓ Job written: ${jobPath}`);
    
    // Step 3: Wake worker
    console.log('[3/5] Waking worker...');
    try {
      execSync('launchctl kickstart -k gui/$(id -u)/ai.hermes.contentops-worker', {
        stdio: 'pipe',
      });
      console.log('  ✓ Worker kicked');
    } catch (error: any) {
      console.log(`  ⚠ Worker kickstart failed (may already be running): ${error.message}`);
    }
    
    // Step 4: Wait for worker to process
    console.log('[4/5] Waiting for worker to process...');
    const maxWait = 60000; // 60 seconds
    const checkInterval = 2000; // 2 seconds
    let elapsed = 0;
    
    while (elapsed < maxWait) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      elapsed += checkInterval;
      
      // Check if job is still in inbox
      if (!fs.existsSync(jobPath)) {
        console.log(`  ✓ Job processed after ${elapsed}ms`);
        break;
      }
      
      // Check if job moved to outbox
      const outboxPath = path.join(JOBS_DIR, 'outbox', `${taskId}.json`);
      if (fs.existsSync(outboxPath)) {
        console.log(`  ✓ Job moved to outbox after ${elapsed}ms`);
        break;
      }
      
      // Check if job failed
      const failedPath = path.join(JOBS_DIR, 'failed', `${taskId}.json`);
      if (fs.existsSync(failedPath)) {
        throw new Error('Job failed');
      }
      
      if (elapsed % 10000 === 0) {
        console.log(`  ... waiting (${elapsed}ms)`);
      }
    }
    
    if (elapsed >= maxWait) {
      throw new Error(`Worker timeout after ${maxWait}ms`);
    }
    
    // Step 5: Verify backend draft
    console.log('[5/5] Verifying backend draft...');
    const verifyResponse = await stagingHelperClient.getTask(taskId);
    console.log(`  ✓ Verify status: ${verifyResponse.status}`);
    
    const draftId = verifyResponse.body?.draft?.id;
    const draftStatus = verifyResponse.body?.draft?.status;
    
    if (!draftId) {
      throw new Error('Draft ID missing from response');
    }
    
    console.log(`  ✓ DraftId: ${draftId}`);
    console.log(`  ✓ Draft status: ${draftStatus}`);
    
    const totalTime = Date.now() - startTime;
    console.log(`\n✅ Pipeline run ${runIndex} completed in ${totalTime}ms`);
    console.log(`   TaskId: ${taskId}`);
    console.log(`   DraftId: ${draftId}`);
    
    return {
      success: true,
      taskId,
      draftId,
      totalTime,
    };
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`\n❌ Pipeline run ${runIndex} failed after ${totalTime}ms`);
    console.error(`   Error: ${error.message}`);
    
    return {
      success: false,
      error: error.message,
      totalTime,
    };
  }
}

async function main() {
  console.log('\n=== ContentOps Full Pipeline Test ===\n');
  
  const results = [];
  
  // Run 3 times
  for (let i = 1; i <= 3; i++) {
    const result = await testFullPipeline(i);
    results.push(result);
    
    // Wait 3 seconds between runs
    if (i < 3) {
      console.log('\nWaiting 3 seconds before next run...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Summary
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('Test Summary');
  console.log(`${'='.repeat(60)}\n`);
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`Total runs: ${results.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  
  if (successCount > 0) {
    console.log('\nSuccessful runs:');
    results.filter(r => r.success).forEach((r, i) => {
      console.log(`  ${i + 1}. TaskId: ${r.taskId}`);
      console.log(`     DraftId: ${r.draftId}`);
      console.log(`     Time: ${r.totalTime}ms`);
    });
  }
  
  if (failCount > 0) {
    console.log('\nFailed runs:');
    results.filter(r => !r.success).forEach((r, i) => {
      console.log(`  ${i + 1}. Error: ${r.error}`);
      console.log(`     Time: ${r.totalTime}ms`);
    });
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('Test Complete');
  console.log(`${'='.repeat(60)}\n`);
  
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
