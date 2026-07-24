/**
 * Recovery Script: Reuse existing raw output for task_1784887418278_uduwzl
 * 
 * Does NOT call Hermes CLI. Loads saved raw model output and runs it through
 * the pipeline: normalizer -> enricher -> contract -> adapter -> finalizer
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const STATE_DIR = path.join(os.homedir(), '.jueshi-contentops');
const TASK_ID = 'task_1784887418278_uduwzl';
const JOB_ID = TASK_ID;
const KEY_HASH = '3ce275be3707ffab300441d5fba2da82fc4fec29790265a14d3f298e6355b23d';
const RAW_OUTPUT_PATH = path.join(STATE_DIR, 'jobs/failed', `${TASK_ID}.raw-output.json`);
const FAILED_JOB_PATH = path.join(STATE_DIR, 'jobs/failed', `${TASK_ID}.json`);

async function main() {
  console.log('=== RECOVERY SCRIPT START ===');
  console.log('TASK_ID:', TASK_ID);
  console.log('MODEL_CALLED=false');
  console.log('HERMES_CLI_STARTED=false');

  // 1. Load raw output
  const rawOutput = JSON.parse(fs.readFileSync(RAW_OUTPUT_PATH, 'utf8'));
  console.log('EXISTING_RAW_OUTPUT_REUSED=true');
  console.log('Raw output keys:', Object.keys(rawOutput));

  // 2. Load the failed job to get task info
  const job = JSON.parse(fs.readFileSync(FAILED_JOB_PATH, 'utf8'));
  const task = job.task;
  console.log('Task topic:', task.topic);
  console.log('Task executionMode:', task.executionMode);

  // 3. Run pipeline (same as HermesContentExecutor.execute but with pre-loaded raw output)
  const { extractNestedContent, validateRawModelDraft, normalizeFieldAliases, hasMinimalViability } = 
    await import('../../src/lib/contentops/raw-model-draft-contract');
  const { ContentNormalizer } = await import('../../src/lib/contentops/content-normalizer');
  const { enrichContent, mergeEnrichedContent } = await import('../../src/lib/contentops/content-enricher');
  const { getContract } = await import('../../src/lib/contentops/contract-registry');

  const contentType = task.contentType || 'topic';

  // Pipeline steps
  const extracted = extractNestedContent(rawOutput);
  console.log('PARSER_RESULT=PASS');

  const rawContract = validateRawModelDraft(extracted);
  if (!rawContract.success) throw new Error('RAW_CONTRACT_FAILED');
  console.log('RAW_CONTRACT_RESULT=PASS');

  const normalized = normalizeFieldAliases(extracted);
  const viability = hasMinimalViability(normalized, contentType);
  if (!viability.viable) throw new Error('VIABILITY_FAILED: ' + viability.reason);

  const normalizer = new ContentNormalizer(contentType as any);
  const cleaningResult = normalizer.clean(normalized);
  console.log('NORMALIZER_RESULT=PASS');
  console.log('PRE_ENRICHMENT_DIAGNOSTIC_COUNT=', cleaningResult.remainingCount);
  console.log('Normalizer fixedCount:', cleaningResult.fixedCount);
  console.log('Normalizer hero type:', typeof cleaningResult.content.hero);
  console.log('Normalizer faq count:', cleaningResult.content.faq?.length);

  const enriched = enrichContent({
    contentType: contentType as any,
    ...cleaningResult.content,
    taskId: task.id,
    topic: task.topic,
    targetAudience: task.audience || task.targetAudience,
    targetEnvironment: task.targetEnvironment || 'staging',
  });
  console.log('ENRICHER_RESULT=PASS');
  console.log('Enricher title:', enriched.title);
  console.log('Enricher slug:', enriched.slug);
  console.log('Enricher faq count:', enriched.faq.length);

  const finalContent = mergeEnrichedContent(cleaningResult.content, enriched, {
    executionMode: task.executionMode || 'review_required',
  });

  // Final contract validation
  const contract = getContract(contentType as any);
  const structureResult = contract.validateStructure(finalContent);
  const qualityResult = contract.validateQuality(finalContent);
  const contractErrors = [...structureResult.errors, ...qualityResult.errors];
  console.log('POST_ENRICHMENT_STRUCTURE_ERROR_COUNT=', structureResult.errors.length);
  console.log('POST_ENRICHMENT_QUALITY_ERROR_COUNT=', qualityResult.errors.length);
  if (contractErrors.length > 0) {
    console.log('Contract errors:', contractErrors);
    throw new Error('FINAL_CONTRACT_FAILED');
  }
  console.log('FINAL_CONTRACT_RESULT=PASS');

  // 4. Call publish adapter (same as worker)
  const { getContentPublishAdapter } = await import('../../src/lib/contentops/content-publish-adapters');
  
  const adapter = getContentPublishAdapter(contentType as any);
  const publishOptions: any = {
    idempotencyKeyHash: task.idempotencyKeyHash || KEY_HASH,
    idempotencyKeyVersion: task.idempotencyKeyVersion || 1,
    idempotencySource: task.idempotencySource || 'telegram',
    taskId: task.id,
    jobId: JOB_ID,
    executionMode: task.executionMode,
  };

  console.log('BACKEND_CREATE_ATTEMPTED=true');
  const publishResult = await adapter.publish(
    { success: true, contentType, title: finalContent.title, slug: finalContent.slug, summary: finalContent.summary, content: finalContent, seo: finalContent.seo, geo: finalContent.geo, sources: finalContent.sources, faq: finalContent.faq, internalLinks: finalContent.internalLinks, hermesRunId: 'recovery-' + TASK_ID, latencyMs: 0, normalizerIssues: [], normalizerFixedCount: cleaningResult.fixedCount, normalizerRemainingBlockingIssues: 0, contractValidationPassed: true, contractErrors: [], contractWarnings: [], rawModelOutput: rawOutput } as any,
    task.id,
    task.executionMode,
    publishOptions
  );

  if (!publishResult.success) {
    console.log('PUBLISH_RESULT=FAIL');
    console.log('Publish error:', publishResult.error);
    throw new Error('PUBLISH_FAILED: ' + publishResult.error);
  }

  console.log('CONTENT_CREATE_COUNT=1');
  console.log('BACKEND_CONTENT_ID=', publishResult.draftId);
  console.log('BACKEND_CONTENT_STATUS=DRAFT');
  console.log('PUBLISH_RESULT=PASS');

  // 5. Update task status to COMPLETED
  task.status = 'COMPLETED';
  task.currentStep = 'FINALIZED';
  task.updatedAt = new Date().toISOString();
  
  // 6. Move job from failed/ to completed/
  const completedDir = path.join(STATE_DIR, 'jobs/completed');
  if (!fs.existsSync(completedDir)) fs.mkdirSync(completedDir, { recursive: true });
  const completedPath = path.join(completedDir, `${TASK_ID}.json`);
  job.task = task;
  job.completedAt = new Date().toISOString();
  job.publishResult = publishResult;
  delete job.failedAt;
  delete job.error;
  fs.writeFileSync(completedPath, JSON.stringify(job, null, 2));
  
  // Remove from failed/
  fs.unlinkSync(FAILED_JOB_PATH);
  console.log('JOB_FINAL_LOCATION=completed/');
  console.log('TASK_FINAL_STATUS=COMPLETED');

  // 7. Update local claim to COMPLETED
  const claimPath = path.join(STATE_DIR, 'idempotency', `${KEY_HASH}.json`);
  if (fs.existsSync(claimPath)) {
    const claim = JSON.parse(fs.readFileSync(claimPath, 'utf8'));
    claim.status = 'COMPLETED';
    claim.backendContentId = publishResult.draftId;
    claim.updatedAt = new Date().toISOString();
    fs.writeFileSync(claimPath, JSON.stringify(claim, null, 2));
    console.log('LOCAL_CLAIM_STATUS=COMPLETED');
  }

  // 8. Write success notification to outbox (same as worker finalizer)
  const outboxDir = path.join(STATE_DIR, 'jobs/outbox');
  if (!fs.existsSync(outboxDir)) fs.mkdirSync(outboxDir, { recursive: true });
  const notification = {
    jobId: JOB_ID,
    taskId: task.id,
    taskStatus: 'COMPLETED',
    contentType: contentType,
    title: finalContent.title,
    draftId: publishResult.draftId,
    publishedUrl: publishResult.publishedUrl,
    executionMode: task.executionMode,
    terminalStatus: 'SUCCESS',
    isRecovery: true,
    notificationId: `recovery-success:${TASK_ID}`,
    transport: 'telegram',
    chatId: task.chatId,
    createdAt: new Date().toISOString(),
  };
  const outboxPath = path.join(outboxDir, `${TASK_ID}.recovery-success.json`);
  fs.writeFileSync(outboxPath, JSON.stringify(notification, null, 2));
  console.log('RECOVERY_SUCCESS_NOTIFICATION_WRITTEN=true');
  console.log('NOTIFICATION_PATH=', outboxPath);

  // 9. Save final content for reference
  const finalContentPath = path.join(STATE_DIR, 'raw-outputs', `recovery-${TASK_ID}.final.json`);
  fs.writeFileSync(finalContentPath, JSON.stringify(finalContent, null, 2));

  console.log('\n=== RECOVERY SCRIPT COMPLETE ===');
  console.log('BACKEND_CONTENT_ID=', publishResult.draftId);
  console.log('TASK_FINAL_STATUS=COMPLETED');
  console.log('JOB_FINAL_LOCATION=completed/');
  console.log('LOCAL_CLAIM_STATUS=COMPLETED');
}

main().catch(err => {
  console.error('RECOVERY_FAILED:', err.message);
  console.error(err.stack);
  process.exit(1);
});
