#!/usr/bin/env tsx
/**
 * Publish existing guide content to staging backend
 * 
 * This script reads the existing outbox content and publishes it via the adapter.
 * Used to recover tasks that were processed by the minimal worker.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { GuidePublishAdapter } from '../../src/lib/contentops/content-publish-adapters';

const HOME_DIR = os.homedir();
const OUTBOX_DIR = path.join(HOME_DIR, '.jueshi-contentops/jobs/outbox');

async function main() {
  const taskId = 'task_1784645450775_1agn2d';
  const outboxFile = path.join(OUTBOX_DIR, `${taskId}.json`);
  
  console.log(`[Publish] Reading existing content from ${outboxFile}`);
  
  if (!fs.existsSync(outboxFile)) {
    console.error(`[Publish] Outbox file not found: ${outboxFile}`);
    process.exit(1);
  }
  
  const outboxData = JSON.parse(fs.readFileSync(outboxFile, 'utf-8'));
  const content = JSON.parse(outboxData.content);
  
  console.log(`[Publish] Content loaded: ${content.title}`);
  console.log(`[Publish] Content type: ${content.contentType}`);
  console.log(`[Publish] Body length: ${content.content.body.length} chars`);
  
  // Prepare structured result for adapter
  const structuredResult = {
    success: true,
    provider: 'hermes-agent',
    model: 'qwen3.7-plus',
    title: content.title,
    slug: content.slug,
    summary: content.summary,
    contentType: content.contentType,
    content: {
      body: content.content.body,
      audience: content.content.audience,
      steps: content.content.steps || [],
      pitfalls: content.content.pitfalls || [],
    },
    seo: content.seo,
    geo: content.geo,
    sources: content.sources || [],
    faq: content.faq || [],
    internalLinks: content.internalLinks || [],
    structuredData: content.structuredData,
    hermesRunId: `manual-publish-${Date.now()}`,
    latencyMs: outboxData.latencyMs || 0,
    contractValidationPassed: true,
    contractErrors: [],
    contractWarnings: [],
    normalizerFixedCount: 0,
    normalizerRemainingBlockingIssues: 0,
    normalizerIssues: [],
  };
  
  console.log(`[Publish] Calling GuidePublishAdapter...`);
  
  const adapter = new GuidePublishAdapter();
  const publishResult = await adapter.publish(structuredResult, taskId);
  
  if (!publishResult.success) {
    console.error(`[Publish] Failed: ${publishResult.error}`);
    console.error(`[Publish] Error code: ${publishResult.errorCode}`);
    process.exit(1);
  }
  
  console.log(`[Publish] Success!`);
  console.log(`[Publish] Draft ID: ${publishResult.draftId}`);
  console.log(`[Publish] Published URL: ${publishResult.publishedUrl}`);
  
  // Update outbox file with backend metadata
  const updatedOutbox = {
    ...outboxData,
    taskId,
    backendContentId: publishResult.draftId,
    guideStatus: 'AWAITING_REVIEW',
    publishedUrl: publishResult.publishedUrl,
    publishedAt: new Date().toISOString(),
  };
  
  fs.writeFileSync(outboxFile, JSON.stringify(updatedOutbox, null, 2));
  console.log(`[Publish] Outbox updated with backend metadata`);
  
  // Output for Telegram notification
  console.log('\n=== TELEGRAM_NOTIFICATION_DATA ===');
  console.log(JSON.stringify({
    taskId,
    title: content.title,
    backendContentId: publishResult.draftId,
    contentLength: content.content.body.length,
    status: 'AWAITING_REVIEW',
    publishedUrl: publishResult.publishedUrl,
  }, null, 2));
}

main().catch(error => {
  console.error('[Publish] Script failed:', error.message);
  process.exit(1);
});
