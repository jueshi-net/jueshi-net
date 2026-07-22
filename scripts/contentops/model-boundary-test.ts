#!/usr/bin/env tsx
/**
 * Model Boundary Test Suite
 * 
 * 测试模型输出边界情况：
 * 1. 字段别名归一化
 * 2. JSON 提取
 * 3. 嵌套内容处理
 * 4. 最小合法性检查
 */

import { 
  normalizeFieldAliases, 
  extractJsonFromMarkdown, 
  extractNestedContent,
  validateRawModelDraft,
  hasMinimalViability
} from '../../src/lib/contentops/raw-model-draft-contract';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`✅ ${name}`);
  } catch (error: any) {
    results.push({ name, passed: false, error: error.message });
    console.error(`❌ ${name}: ${error.message}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

// ============================================================================
// 字段别名归一化测试
// ============================================================================

test('BODY_ALIAS_NORMALIZATION', () => {
  const raw = { content: 'Test body content' };
  const normalized = normalizeFieldAliases(raw);
  assert(normalized.body === 'Test body content', 'body should be normalized from content');
});

test('BODY_ALIAS_ARTICLE', () => {
  const raw = { article: 'Article content' };
  const normalized = normalizeFieldAliases(raw);
  assert(normalized.body === 'Article content', 'body should be normalized from article');
});

test('BODY_ALIAS_CHINESE', () => {
  const raw = { '正文': '中文正文内容' };
  const normalized = normalizeFieldAliases(raw);
  assert(normalized.body === '中文正文内容', 'body should be normalized from 正文');
});

test('AUDIENCE_ALIAS_NORMALIZATION', () => {
  const raw = { targetAudience: '海外华人' };
  const normalized = normalizeFieldAliases(raw);
  assert(normalized.audience === '海外华人', 'audience should be normalized from targetAudience');
});

test('AUDIENCE_ALIAS_CHINESE', () => {
  const raw = { '适用人群': '首次使用者' };
  const normalized = normalizeFieldAliases(raw);
  assert(normalized.audience === '首次使用者', 'audience should be normalized from 适用人群');
});

test('FAQ_ALIAS_NORMALIZATION', () => {
  const raw = { faqs: [{ q: 'Q1', a: 'A1' }] };
  const normalized = normalizeFieldAliases(raw);
  assert(Array.isArray(normalized.faq), 'faq should be normalized from faqs');
  assert(normalized.faq.length === 1, 'faq should have 1 item');
});

test('SOURCE_ALIAS_NORMALIZATION', () => {
  const raw = { references: [{ url: 'https://example.com' }] };
  const normalized = normalizeFieldAliases(raw);
  assert(Array.isArray(normalized.sources), 'sources should be normalized from references');
});

// ============================================================================
// JSON 提取测试
// ============================================================================

test('EXTRACT_JSON_FROM_MARKDOWN_FENCE', () => {
  const input = '```json\n{"title": "Test"}\n```';
  const extracted = extractJsonFromMarkdown(input);
  assert(extracted.includes('"title"'), 'Should extract JSON from markdown fence');
});

test('EXTRACT_JSON_FROM_NESTED', () => {
  const input = { data: { content: { title: 'Test' } } };
  const extracted = extractNestedContent(input);
  assert(extracted.title === 'Test', 'Should extract nested content');
});

// ============================================================================
// Raw Contract 验证测试
// ============================================================================

test('RAW_CONTRACT_VALID_GUIDE', () => {
  const raw = {
    contentType: 'guide',
    title: 'Test Guide',
    body: 'This is a test guide with sufficient content.'.repeat(50)
  };
  const result = validateRawModelDraft(raw);
  assert(result.success, 'Valid guide should pass raw contract');
});

test('RAW_CONTRACT_VALID_CHECKLIST', () => {
  const raw = {
    contentType: 'checklist',
    title: 'Test Checklist',
    groups: [{ name: 'Group 1', items: [{ text: 'Item 1' }] }]
  };
  const result = validateRawModelDraft(raw);
  assert(result.success, 'Valid checklist should pass raw contract');
});

test('RAW_CONTRACT_VALID_TOPIC', () => {
  const raw = {
    contentType: 'topic',
    title: 'Test Topic',
    blockConfiguration: { blocks: [] }
  };
  const result = validateRawModelDraft(raw);
  assert(result.success, 'Valid topic should pass raw contract');
});

// ============================================================================
// 最小合法性检查测试
// ============================================================================

test('MINIMAL_VIABILITY_WITH_BODY', () => {
  const raw = { title: 'Test', body: 'Content' };
  const result = hasMinimalViability(raw);
  assert(result.viable, 'Should be viable with body');
});

test('MINIMAL_VIABILITY_WITH_STRUCTURE', () => {
  const raw = { title: 'Test', groups: [] };
  const result = hasMinimalViability(raw);
  assert(result.viable, 'Should be viable with structure');
});

test('MINIMAL_VIABILITY_WITHOUT_CONTENT', () => {
  const raw = { title: 'Test' };
  const result = hasMinimalViability(raw);
  assert(!result.viable, 'Should not be viable without content');
});

// ============================================================================
// Summary
// ============================================================================

console.log('\n=== Model Boundary Test Suite Summary ===');
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;
console.log(`Total: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  console.log('\nFailed tests:');
  results.filter(r => !r.passed).forEach(r => {
    console.log(`  - ${r.name}: ${r.error}`);
  });
  process.exit(1);
}

console.log('\n✅ All model boundary tests passed!');
process.exit(0);
