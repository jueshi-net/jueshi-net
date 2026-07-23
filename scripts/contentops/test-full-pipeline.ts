import { ContentNormalizer } from '../../src/lib/contentops/content-normalizer';
import { getContract } from '../../src/lib/contentops/contract-registry';
import { enrichContent, mergeEnrichedContent } from '../../src/lib/contentops/content-enricher';
import { extractJsonFromMarkdown, extractNestedContent, normalizeFieldAliases, hasMinimalViability } from '../../src/lib/contentops/raw-model-draft-contract';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const rawFile = path.join(os.homedir(), '.jueshi-contentops/jobs/failed/task_1784785126031_7n34mb.raw-output.json');
const rawOutput = JSON.parse(fs.readFileSync(rawFile, 'utf-8'));

console.log('=== Step 1: Extract nested content ===');
let parsed = extractNestedContent(rawOutput);
console.log('Keys after extract:', Object.keys(parsed));

console.log('\n=== Step 2: Normalize field aliases ===');
parsed = normalizeFieldAliases(parsed);
console.log('Keys after alias normalization:', Object.keys(parsed));

console.log('\n=== Step 3: Check viability ===');
const viability = hasMinimalViability(parsed, 'topic');
console.log('Viable:', viability.viable, viability.reason || '');

console.log('\n=== Step 4: Run normalizer ===');
const normalizer = new ContentNormalizer('topic');
const cleaningResult = normalizer.clean(parsed);
console.log('Fixed:', cleaningResult.fixedCount, 'Remaining:', cleaningResult.remainingCount);
console.log('Content keys after normalize:', Object.keys(cleaningResult.content));

console.log('\n=== Step 5: Enrich ===');
const enriched = enrichContent({
  contentType: 'topic',
  ...cleaningResult.content,
  taskId: 'task_1784785126031_7n34mb',
  topic: '新加坡留学生第一次租房',
  targetAudience: '留学生',
  targetEnvironment: 'staging',
});
console.log('Enriched keys:', Object.keys(enriched));
console.log('Enriched title:', enriched.title);
console.log('Enriched slug:', enriched.slug);

console.log('\n=== Step 6: Merge ===');
const finalContent = mergeEnrichedContent(cleaningResult.content, enriched, {
  executionMode: 'review_required',
});
console.log('Final content keys:', Object.keys(finalContent));
console.log('Final title:', finalContent.title);
console.log('Final slug:', finalContent.slug);
console.log('Final summary:', finalContent.summary?.substring(0, 50));

console.log('\n=== Step 7: Contract validation ===');
const contract = getContract('topic');
const structureValidation = contract.validateStructure(finalContent);
const qualityValidation = contract.validateQuality(finalContent);
console.log('Structure errors:', structureValidation.errors);
console.log('Quality errors:', qualityValidation.errors);
