#!/usr/bin/env tsx
/**
 * ContentOps Fixture Worker for Smoke Test
 * 
 * Simulates Worker behavior using pre-generated content (fixture)
 * instead of calling Hermes. Goes through the same Adapter, Finalizer,
 * and outbox path as the real Worker.
 * 
 * This is a TEST-ONLY script, not part of production runtime.
 * 
 * V2-MVP: v1.20.42.18.6.21.12.4
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { finalizeContentOpsTask } from '../../src/lib/contentops/task-finalizer';

const HOME_DIR = os.homedir();
const JOBS_DIR = path.join(HOME_DIR, '.jueshi-contentops/jobs');
const PROCESSING_DIR = path.join(JOBS_DIR, 'processing');
const OUTBOX_DIR = path.join(JOBS_DIR, 'outbox');
const FAILED_DIR = path.join(JOBS_DIR, 'failed');

// Deterministic fixture for smoke test
const FIXTURE_CONTENT = {
  title: 'Internal Runtime Smoke Test - Archival Only',
  slug: 'internal-runtime-smoke-test',
  summary: 'This is a deterministic fixture for smoke testing the ContentOps runtime path.',
  content: {
    hero: 'Smoke Test Content',
    subtopics: ['Topic 1', 'Topic 2'],
    relatedTools: [],
    relatedGuides: [],
    relatedChecklists: [],
    relatedResources: [],
    cta: 'Test CTA',
    blockConfiguration: [],
  },
  faq: [],
  seo: {
    title: 'Smoke Test SEO Title',
    description: 'Smoke test SEO description',
    keywords: ['smoke', 'test'],
  },
  geo: {
    country: 'Test Country',
    city: 'Test City',
  },
  structuredData: {},
};

async function fixtureWorker() {
  console.log('=== ContentOps Fixture Worker (Smoke Test) ===\n');
  
  // Find job in processing
  const processingFiles = fs.readdirSync(PROCESSING_DIR).filter(f => f.endsWith('.json'));
  
  if (processingFiles.length === 0) {
    console.error('[FixtureWorker] No jobs in processing directory');
    process.exit(1);
  }
  
  const jobFile = path.join(PROCESSING_DIR, processingFiles[0]);
  const job = JSON.parse(fs.readFileSync(jobFile, 'utf-8'));
  
  console.log(`[FixtureWorker] Processing job: ${job.jobId}`);
  console.log(`[FixtureWorker] Content type: ${job.contentType}`);
  console.log(`[FixtureWorker] Execution mode: ${job.executionMode || job.task?.executionMode}`);
  
  const taskId = job.jobId;
  const executionMode = job.executionMode || job.task?.executionMode || 'review_required';
  
  try {
    // Simulate Hermes execution (using fixture)
    console.log('[FixtureWorker] Simulating Hermes execution with fixture...');
    const result = {
      success: true,
      contentType: job.contentType,
      title: FIXTURE_CONTENT.title,
      slug: FIXTURE_CONTENT.slug,
      summary: FIXTURE_CONTENT.summary,
      content: FIXTURE_CONTENT.content,
      faq: FIXTURE_CONTENT.faq,
      seo: FIXTURE_CONTENT.seo,
      geo: FIXTURE_CONTENT.geo,
      structuredData: FIXTURE_CONTENT.structuredData,
      hermesRunId: 'fixture-smoke-test',
      latencyMs: 100,
      contractValidationPassed: true,
      normalizerFixedCount: 0,
      normalizerRemainingBlockingIssues: 0,
    };
    
    // Check contract validation
    if (!result.contractValidationPassed) {
      throw new Error('CONTRACT_VALIDATION_FAILED');
    }
    
    // Check normalizer
    if (result.normalizerRemainingBlockingIssues > 0 && executionMode !== 'draft_only') {
      throw new Error('NORMALIZER_BLOCKING_ISSUES');
    }
    
    // Simulate Adapter (for draft_only, returns fake draft ID)
    console.log('[FixtureWorker] Simulating Adapter...');
    let draftId: string;
    
    if (executionMode === 'draft_only') {
      // draft_only mode: Adapter returns fake draft ID
      draftId = `draft_${taskId}`;
      console.log(`[FixtureWorker] Draft-only mode, using fake draft ID: ${draftId}`);
    } else {
      // Real mode: Adapter would call staging backend
      // For smoke test, we'll use a fake real ID
      draftId = `cm_smoke_test_${taskId.substring(0, 20)}`;
      console.log(`[FixtureWorker] Using simulated real draft ID: ${draftId}`);
    }
    
    // Validate draft ID (Finalizer will reject fake IDs for non-draft_only)
    if (executionMode !== 'draft_only' && draftId.startsWith('draft_')) {
      throw new Error(`FAKE_DRAFT_ID_REJECTED: ${draftId}`);
    }
    
    // Call Finalizer (real path)
    console.log('[FixtureWorker] Calling Finalizer...');
    const finalizerResult = await finalizeContentOpsTask({
      success: true,
      taskId,
      chatId: job.chatId || job.task?.chatId || '9999999999',
      contentType: result.contentType,
      executionMode,
      backendContentId: draftId,
      title: result.title,
      hermesRunId: result.hermesRunId,
      latencyMs: result.latencyMs,
      normalizerFixedCount: result.normalizerFixedCount,
      normalizerRemainingBlockingIssues: result.normalizerRemainingBlockingIssues,
    });
    
    if (!finalizerResult.ok) {
      throw new Error(`FINALIZER_FAILED: ${finalizerResult.error}`);
    }
    
    console.log(`[FixtureWorker] Finalizer completed: ${finalizerResult.taskStatus}`);
    
    // Clean up processing file
    fs.unlinkSync(jobFile);
    console.log('[FixtureWorker] Removed processing file');
    
    // Verify outbox file exists
    const outboxFile = path.join(OUTBOX_DIR, `${taskId}.json`);
    if (!fs.existsSync(outboxFile)) {
      throw new Error('Outbox file not created by Finalizer');
    }
    
    const outboxData = JSON.parse(fs.readFileSync(outboxFile, 'utf-8'));
    console.log(`[FixtureWorker] Outbox file created: ${outboxData.notificationId}`);
    console.log(`[FixtureWorker] Terminal status: ${outboxData.terminalStatus}`);
    console.log(`[FixtureWorker] Backend content ID: ${outboxData.backendContentId}`);
    
    console.log('\n[FixtureWorker] ✅ Fixture worker completed successfully');
    process.exit(0);
    
  } catch (error: any) {
    console.error(`[FixtureWorker] FAILED: ${error.message}`);
    
    // Call Finalizer for failure
    await finalizeContentOpsTask({
      success: false,
      taskId,
      chatId: job.chatId || job.task?.chatId || '9999999999',
      contentType: job.contentType,
      executionMode,
      error: error.message,
      errorCode: error.message.startsWith('CONTRACT_') ? 'CONTRACT_VALIDATION_FAILED' :
                 error.message.startsWith('NORMALIZER_') ? 'NORMALIZER_BLOCKING' :
                 error.message.startsWith('FAKE_DRAFT_') ? 'FAKE_DRAFT_ID' :
                 'FIXTURE_WORKER_ERROR',
      failureStage: 'fixture-worker',
    });
    
    // Move to failed
    const failedFile = path.join(FAILED_DIR, path.basename(jobFile));
    fs.writeFileSync(failedFile, JSON.stringify({ ...job, error: error.message, failedAt: new Date().toISOString() }, null, 2));
    fs.unlinkSync(jobFile);
    
    process.exit(1);
  }
}

fixtureWorker().catch(error => {
  console.error('[FixtureWorker] Crashed:', error);
  process.exit(1);
});
