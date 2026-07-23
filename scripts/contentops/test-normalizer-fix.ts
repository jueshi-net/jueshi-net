import { ContentNormalizer } from '../../src/lib/contentops/content-normalizer';
import { getContract } from '../../src/lib/contentops/contract-registry';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const rawFile = path.join(os.homedir(), '.jueshi-contentops/jobs/failed/task_1784785126031_7n34mb.raw-output.json');
const rawOutput = JSON.parse(fs.readFileSync(rawFile, 'utf-8'));
console.log('Raw output keys:', Object.keys(rawOutput));
console.log('Hero type:', typeof rawOutput.hero);
console.log('Hero value:', typeof rawOutput.hero === 'string' ? rawOutput.hero.substring(0, 100) : JSON.stringify(rawOutput.hero).substring(0, 100));

const normalizer = new ContentNormalizer('topic');
const result = normalizer.clean(rawOutput);

console.log('\n=== Normalizer Results ===');
console.log('Fixed count:', result.fixedCount);
console.log('Remaining blocking issues:', result.remainingCount);
console.log('\nIssues:');
result.issues.forEach((i: any) => console.log(`  [${i.severity}] ${i.code}: ${i.message} (fixed: ${i.fixed})`));

const contract = getContract('topic');
const structureResult = contract.validateStructure(result.content);
console.log('\n=== Contract Validation ===');
console.log('Errors:', structureResult.errors);
console.log('Warnings:', structureResult.warnings);

// Check hero structure
console.log('\n=== Hero Structure ===');
console.log('Hero:', JSON.stringify(result.content.hero, null, 2).substring(0, 300));
