/**
 * Recover failed task using existing raw output
 * Skips Hermes call, runs full pipeline, creates draft
 */
import { ContentNormalizer } from '../../src/lib/contentops/content-normalizer';
import { getContract } from '../../src/lib/contentops/contract-registry';
import { enrichContent, mergeEnrichedContent } from '../../src/lib/contentops/content-enricher';
import { extractNestedContent, normalizeFieldAliases, hasMinimalViability } from '../../src/lib/contentops/raw-model-draft-contract';
import { stagingHelperClient } from '../../src/lib/contentops/staging-helper-client';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

async function recoverTask() {
  const taskId = 'task_1784785126031_7n34mb';
  const rawFile = path.join(os.homedir(), `.jueshi-contentops/jobs/failed/${taskId}.raw-output.json`);
  
  console.log('[Recovery] Loading raw output from:', rawFile);
  const rawOutput = JSON.parse(fs.readFileSync(rawFile, 'utf-8'));
  
  // Step 1: Extract nested content
  let parsed = extractNestedContent(rawOutput);
  
  // Step 2: Normalize field aliases
  parsed = normalizeFieldAliases(parsed);
  
  // Step 3: Check viability
  const viability = hasMinimalViability(parsed, 'topic');
  if (!viability.viable) {
    console.error('[Recovery] Raw output not viable:', viability.reason);
    process.exit(1);
  }
  console.log('[Recovery] Raw output is viable');
  
  // Step 4: Run normalizer
  const normalizer = new ContentNormalizer('topic');
  const cleaningResult = normalizer.clean(parsed);
  console.log('[Recovery] Normalizer: fixed', cleaningResult.fixedCount, 'remaining', cleaningResult.remainingCount);
  
  // Step 5: Enrich
  const enriched = enrichContent({
    contentType: 'topic',
    ...cleaningResult.content,
    taskId,
    topic: '新加坡留学生第一次租房',
    targetAudience: '留学生',
    targetEnvironment: 'staging',
  });
  console.log('[Recovery] Enriched: title=', enriched.title);
  
  // Step 6: Merge
  const finalContent = mergeEnrichedContent(cleaningResult.content, enriched, {
    executionMode: 'review_required',
  });
  
  // Step 7: Contract validation
  const contract = getContract('topic');
  const structureValidation = contract.validateStructure(finalContent);
  const qualityValidation = contract.validateQuality(finalContent);
  const contractErrors = [...structureValidation.errors, ...qualityValidation.errors];
  
  if (contractErrors.length > 0) {
    console.error('[Recovery] Contract validation failed:', contractErrors);
    process.exit(1);
  }
  console.log('[Recovery] Contract validation PASSED');
  
  // Step 8: Create draft via staging Bridge API
  const draftId = `draft_${taskId}`;
  console.log('[Recovery] Creating draft:', draftId);
  
  try {
    const response = await stagingHelperClient.request({
      method: 'POST',
      path: '/api/contentops/bridge',
      body: {
        action: 'create_backend_draft',
        taskId,
        draftId,
        title: finalContent.title || '新加坡留学生第一次租房',
        slug: finalContent.slug || 'singapore-student-rental',
        contentType: 'topic',
        executionMode: 'review_required',
        targetEnvironment: 'staging',
        content: finalContent,
        body: finalContent.body || '',
        summary: finalContent.summary || '',
        audience: finalContent.audience || '留学生',
        seo: finalContent.seo || {},
        geo: finalContent.geo || {},
        sources: finalContent.sources || [],
        faq: finalContent.faq || [],
        internalLinks: finalContent.internalLinks || [],
      },
    });
    
    if (response.status === 200 || response.status === 201) {
      const data = response.data || response.body || {};
      console.log('[Recovery] Draft created successfully:', data.draftId || draftId);
      console.log('[Recovery] Draft state:', data.state || 'DRAFT');
      
      // Move job from failed to completed
      const failedPath = path.join(os.homedir(), `.jueshi-contentops/jobs/failed/${taskId}.json`);
      const completedPath = path.join(os.homedir(), `.jueshi-contentops/jobs/completed/${taskId}.json`);
      
      if (fs.existsSync(failedPath)) {
        const jobData = JSON.parse(fs.readFileSync(failedPath, 'utf-8'));
        jobData.completedAt = new Date().toISOString();
        jobData.status = 'COMPLETED';
        jobData.draftId = data.draftId || draftId;
        jobData.draftState = data.state || 'AWAITING_REVIEW';
        fs.writeFileSync(completedPath, JSON.stringify(jobData, null, 2));
        fs.unlinkSync(failedPath);
        console.log('[Recovery] Job moved to completed');
      }
      
      // Clean up raw output file
      if (fs.existsSync(rawFile)) {
        fs.unlinkSync(rawFile);
        console.log('[Recovery] Raw output file cleaned up');
      }
      
      console.log('\n✅ Recovery completed successfully!');
      console.log('Task ID:', taskId);
      console.log('Draft ID:', data.draftId || draftId);
      console.log('Status: AWAITING_REVIEW');
      console.log('Admin URL: https://i.jueshi.net/admin/content-ops');
      
    } else {
      const error = response.error || response.body || 'Unknown error';
      console.error('[Recovery] Failed to create draft:', response.status, JSON.stringify(error).substring(0, 500));
      process.exit(1);
    }
  } catch (error) {
    console.error('[Recovery] Error creating draft:', error);
    process.exit(1);
  }
}

recoverTask().catch(error => {
  console.error('[Recovery] Fatal error:', error);
  process.exit(1);
});
