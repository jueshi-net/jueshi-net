#!/usr/bin/env tsx
/**
 * Negated Publish Intent Test Runner
 */

function parseExecutionMode(text: string): string {
  const lower = text.toLowerCase();
  
  let executionMode = 'review_required';
  
  // Priority 1: Negated publish intent (HIGHEST PRIORITY)
  const negatedPublishPatterns = [
    /不要.*发布/,
    /不用.*发布/,
    /暂不.*发布/,
    /别发布/,
    /先别.*发布/,
    /不要.*立即发布/,
    /不要.*自动发布/,
    /不要.*直接发布/,
    /仅保存草稿/,
    /保存.*等我审核/,
    /先给我审核/,
    /审核后.*发布/,
    /审核通过.*发布/,
    /等我审核/,
    /等待审核/,
    /放后台/,
  ];
  
  const hasNegatedPublish = negatedPublishPatterns.some(pattern => pattern.test(lower));
  
  if (hasNegatedPublish) {
    if (lower.includes('只要草稿') || lower.includes('仅保存草稿')) {
      executionMode = 'draft_only';
    } else {
      executionMode = 'review_required';
    }
  }
  // Priority 2: Scheduled publish
  else if (
    lower.includes('定时发布') || 
    lower.includes('安排发布') || 
    lower.includes('schedule') ||
    (lower.includes('安排') && lower.includes('发布')) ||
    /\d+\s*分钟后.*发布/.test(lower)
  ) {
    executionMode = 'schedule_when_validated';
  }
  // Priority 3: Publish when validated
  else if (lower.includes('检查通过后') || lower.includes('验证通过后') || lower.includes('质量通过后') || lower.includes('检查通过后发布') || lower.includes('自动发布')) {
    executionMode = 'publish_when_validated';
  }
  // Priority 4: Publish now (only if explicitly positive)
  else if (lower.includes('直接发布') || lower.includes('立即发布') || lower.includes('publish now')) {
    const publishIndex = lower.indexOf('发布');
    if (publishIndex !== -1) {
      const contextStart = Math.max(0, publishIndex - 10);
      const context = lower.substring(contextStart, publishIndex);
      const hasNegationNearby = /不|别|暂|不用/.test(context);
      
      if (!hasNegationNearby) {
        executionMode = 'publish_now';
      }
    }
  }
  
  return executionMode;
}

// Test cases
const testCases = [
  // Should be review_required (negated publish)
  { input: '生成完成后保存到 staging 后台等我审核，不要直接发布。', expected: 'review_required' },
  { input: '可以生成，但别发布。', expected: 'review_required' },
  { input: '做好后先保存草稿，审核通过再发布。', expected: 'review_required' },
  { input: '立即生成，不要立即发布。', expected: 'review_required' },
  { input: '生成后放后台，不用发布。', expected: 'review_required' },
  { input: '暂不发布，先保存草稿。', expected: 'review_required' },
  { input: '先别发布，等我审核。', expected: 'review_required' },
  { input: '不要自动发布，等我确认。', expected: 'review_required' },
  { input: '保存后台等我审核。', expected: 'review_required' },
  { input: '先给我审核，审核后再发布。', expected: 'review_required' },
  { input: '生成内容，但不要发布。', expected: 'review_required' },
  { input: '创建草稿，仅保存草稿。', expected: 'draft_only' },
  
  // Should be publish_now (positive intent only)
  { input: '生成完成后立即发布到 staging。', expected: 'publish_now' },
  { input: '直接发布，不需要审核。', expected: 'publish_now' },
  { input: '立即发布。', expected: 'publish_now' },
  { input: '生成后直接发布。', expected: 'publish_now' },
  
  // Should be schedule_when_validated
  { input: '定时发布，10分钟后。', expected: 'schedule_when_validated' },
  { input: '安排十分钟后发布。', expected: 'schedule_when_validated' },
  
  // Should be publish_when_validated
  { input: '检查通过后直接发布。', expected: 'publish_when_validated' },
  { input: '验证通过后发布。', expected: 'publish_when_validated' },
  { input: '自动发布。', expected: 'publish_when_validated' },
];

console.log('Running negated publish intent tests...\n');

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  const result = parseExecutionMode(testCase.input);
  const status = result === testCase.expected ? '✓ PASS' : '✗ FAIL';
  
  if (result === testCase.expected) {
    passed++;
    console.log(`${status}: "${testCase.input.substring(0, 50)}..."`);
    console.log(`  Expected: ${testCase.expected}, Got: ${result}\n`);
  } else {
    failed++;
    console.log(`${status}: "${testCase.input}"`);
    console.log(`  Expected: ${testCase.expected}, Got: ${result}\n`);
  }
}

console.log('='.repeat(60));
console.log(`Total: ${testCases.length}, Passed: ${passed}, Failed: ${failed}`);
console.log('='.repeat(60));

if (failed > 0) {
  process.exit(1);
}
