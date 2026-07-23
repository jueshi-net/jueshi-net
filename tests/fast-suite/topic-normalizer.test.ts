/**
 * Topic Normalizer Unit Tests
 * 
 * Verifies:
 * - Hero string → object normalization
 * - Hero alias normalization (title/subtitle/summary)
 * - FAQ generation from blocks/subtopics
 * - relatedTools name → title alias
 * - Failed fixture regression
 */

import { normalizeContent } from '../../src/lib/contentops/content-normalizer';
import { normalizeFieldAliases } from '../../src/lib/contentops/raw-model-draft-contract';
import { getContract } from '../../src/lib/contentops/contract-registry';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.log(`  ✗ ${message}`);
  }
}

// ============================================================================
// Test 1: Hero string normalization
// ============================================================================
console.log('\n=== Test 1: TOPIC_HERO_STRING_NORMALIZATION_TEST ===');
{
  const input = {
    hero: '国际集运一站式指南——为海外华人和留学生提供最全面的集运攻略',
    subtopics: [{ title: '集运流程', description: '完整流程介绍' }],
    blockConfiguration: [{ type: 'hero', content: 'test' }],
    relatedTools: [{ title: '运费计算器', url: 'https://example.com', description: '计算运费' }],
    relatedGuides: [{ title: '海关指南', url: '/guides/customs', description: '海关相关' }],
  };
  
  const result = normalizeContent('topic', input);
  const hero = result.content.hero;
  
  assert(typeof hero === 'object', 'Hero is object after normalization');
  assert(typeof hero.headline === 'string' && hero.headline.length > 0, 'Hero has headline');
  assert(typeof hero.subheadline === 'string', 'Hero has subheadline');
  assert(typeof hero.description === 'string' && hero.description.length > 0, 'Hero has description');
  console.log(`  Hero: ${JSON.stringify(hero)}`);
}

// ============================================================================
// Test 2: Hero alias normalization (title/subtitle/summary)
// ============================================================================
console.log('\n=== Test 2: TOPIC_HERO_ALIAS_NORMALIZATION_TEST ===');
{
  const input = {
    hero: {
      title: '国际集运完全指南',
      subtitle: '从入门到精通',
      summary: '最全面的集运攻略',
    },
    subtopics: [{ title: '流程', description: '步骤详解' }],
    blockConfiguration: [{ type: 'hero', content: 'test' }],
  };
  
  const result = normalizeContent('topic', input);
  const hero = result.content.hero;
  
  assert(typeof hero === 'object', 'Hero is object');
  assert(hero.headline === '国际集运完全指南', 'Hero headline from title alias');
  assert(hero.subheadline === '从入门到精通', 'Hero subheadline from subtitle alias');
  assert(hero.description === '最全面的集运攻略', 'Hero description from summary alias');
}

// ============================================================================
// Test 3: Hero standard fields pass-through
// ============================================================================
console.log('\n=== Test 3: TOPIC_HERO_STANDARD_PASSTHROUGH_TEST ===');
{
  const input = {
    hero: {
      headline: '标准标题',
      subheadline: '标准副标题',
      description: '标准描述',
    },
    subtopics: [{ title: '流程', description: '步骤详解' }],
    blockConfiguration: [{ type: 'hero', content: 'test' }],
  };
  
  const result = normalizeContent('topic', input);
  const hero = result.content.hero;
  
  assert(hero.headline === '标准标题', 'Headline preserved');
  assert(hero.subheadline === '标准副标题', 'Subheadline preserved');
  assert(hero.description === '标准描述', 'Description preserved');
}

// ============================================================================
// Test 4: FAQ generation from blocks/subtopics
// ============================================================================
console.log('\n=== Test 4: TOPIC_FAQ_FROM_BLOCKS_TEST ===');
{
  const input = {
    hero: '国际集运指南——全面攻略',
    subtopics: [
      { title: '集运流程', description: '步骤详解' },
      { title: '运输方式', description: '对比分析' },
      { title: '海关申报', description: '技巧指南' },
    ],
    blockConfiguration: [
      { type: 'hero', content: 'test' },
      { type: 'faq', content: '国际集运常见问题解答：费用、时效、禁运物品一网打尽' },
    ],
    relatedTools: [
      { title: '运费计算器', url: 'https://example.com', description: '计算运费' },
    ],
    relatedGuides: [
      { title: '海关指南', url: '/guides/customs', description: '海关相关' },
    ],
  };
  
  const result = normalizeContent('topic', input);
  const faq = result.content.faq;
  
  assert(Array.isArray(faq), 'FAQ is array');
  assert(faq.length >= 3, `FAQ count >= 3 (got ${faq.length})`);
  
  // Verify FAQ structure
  for (const item of faq) {
    assert(typeof item.question === 'string' && item.question.length > 0, `FAQ has question: "${item.question?.substring(0, 30)}..."`);
    assert(typeof item.answer === 'string' && item.answer.length > 0, `FAQ has answer`);
  }
}

// ============================================================================
// Test 5: FAQ alias normalization
// ============================================================================
console.log('\n=== Test 5: TOPIC_FAQ_ALIAS_TEST ===');
{
  const input = {
    hero: '测试专题',
    subtopics: [{ title: 'A', description: 'B' }],
    blockConfiguration: [],
    faqs: [
      { question: '问题1', answer: '答案1' },
      { question: '问题2', answer: '答案2' },
      { question: '问题3', answer: '答案3' },
    ],
  };
  
  const normalized = normalizeFieldAliases(input);
  assert(Array.isArray(normalized.faq), 'faqs alias normalized to faq');
  assert(normalized.faq.length === 3, 'FAQ count preserved');
}

// ============================================================================
// Test 6: relatedTools name → title
// ============================================================================
console.log('\n=== Test 6: TOPIC_RELATED_TOOLS_ALIAS_TEST ===');
{
  const input = {
    hero: '测试',
    subtopics: [],
    relatedTools: [
      { name: '运费计算器', url: 'https://example.com', description: '计算运费' },
      { name: '包裹追踪', url: 'https://example.com/2', description: '追踪包裹' },
    ],
  };
  
  const normalized = normalizeFieldAliases(input);
  assert(normalized.relatedTools[0].title === '运费计算器', 'relatedTools[0] name → title');
  assert(normalized.relatedTools[1].title === '包裹追踪', 'relatedTools[1] name → title');
}

// ============================================================================
// Test 7: Failed fixture regression (actual model output)
// ============================================================================
console.log('\n=== Test 7: TOPIC_FAILED_FIXTURE_NORMALIZER_TEST ===');
{
  // This is the actual failed model output structure
  const failedFixture = {
    hero: '国际集运一站式指南——为海外华人和留学生提供最全面的集运攻略，从选择集运公司到海关申报，从包装技巧到省钱攻略，让您轻松将国内好物寄送到世界各地。',
    subtopics: [
      { title: '集运流程详解', description: '从选择集运公司到包裹签收，完整了解国际集运的每一个步骤' },
      { title: '运输方式对比', description: '空运、海运、陆运的优缺点分析，帮您选择最适合的运输方式' },
      { title: '集运公司评测', description: '主流集运公司的价格、时效、服务质量全方位对比' },
      { title: '海关与禁运', description: '海关申报技巧、禁运物品清单、避免扣关的实用建议' },
      { title: '包装与省钱', description: '专业包装技巧、合箱策略、运费优化方案' },
    ],
    relatedTools: [
      { name: '国际运费计算器', url: 'https://www.superbuy.com/en/page/shippingfee/', description: '快速计算不同运输方式的费用' },
      { name: '包裹追踪查询', url: 'https://www.17track.net/zh-cn', description: '一站式查询国际包裹物流状态' },
      { name: '体积重计算器', url: 'https://www.cssbuy.com/shipping-fee-calculator', description: '根据包裹尺寸计算体积重' },
    ],
    relatedGuides: [
      { title: '海关申报完全指南', url: '/guides/customs-declaration-guide' },
      { title: '国际快递包装技巧', url: '/guides/packing-tips-for-international-shipping' },
      { title: '如何选择集运公司', url: '/guides/how-to-choose-shipping-agent' },
    ],
    relatedChecklists: [
      { title: '集运前准备清单', url: '/checklists/shipping-preparation-checklist' },
      { title: '包裹打包检查清单', url: '/checklists/packing-checklist' },
    ],
    relatedResources: [
      { title: '中国海关总署官网', url: 'https://www.customs.gov.cn/' },
      { title: '中国邮政国际业务', url: 'https://www.chinapost.com.cn/' },
    ],
    blockConfiguration: [
      { type: 'hero', content: '国际集运一站式指南——为海外华人和留学生提供最全面的集运攻略' },
      { type: 'comparison-table', content: '空运vs海运vs陆运对比表' },
      { type: 'step-by-step', content: '集运完整流程：从下单到签收的8个关键步骤' },
      { type: 'checklist', content: '集运前必备检查清单' },
      { type: 'faq', content: '国际集运常见问题解答：费用、时效、禁运物品一网打尽' },
      { type: 'tool-embed', content: '运费计算器' },
      { type: 'resource-list', content: '官方资源汇总' },
    ],
    cta: { text: '开始使用集运服务', url: '/tools/shipping-calculator' },
  };
  
  // Step 1: Normalize field aliases
  const aliased = normalizeFieldAliases(failedFixture);
  assert(aliased.relatedTools[0].title === '国际运费计算器', 'Fixture: relatedTools name → title');
  
  // Step 2: Run normalizer
  const result = normalizeContent('topic', aliased);
  
  // Hero check
  const hero = result.content.hero;
  assert(typeof hero === 'object', 'Fixture: Hero is object');
  assert(typeof hero.headline === 'string' && hero.headline.length > 0, 'Fixture: Hero has headline');
  assert(typeof hero.subheadline === 'string', 'Fixture: Hero has subheadline');
  assert(typeof hero.description === 'string' && hero.description.length > 0, 'Fixture: Hero has description');
  
  // FAQ check
  const faq = result.content.faq;
  assert(Array.isArray(faq), 'Fixture: FAQ is array');
  assert(faq.length >= 3, `Fixture: FAQ count >= 3 (got ${faq.length})`);
  
  // Contract validation
  const contract = getContract('topic');
  // Add system fields that enricher would provide
  const enrichedContent = {
    ...result.content,
    title: '国际集运一站式指南',
    slug: 'international-shipping-guide',
    summary: '为海外华人和留学生提供最全面的集运攻略',
    audience: '首次使用国际集运的海外华人用户',
    sources: [],
    internalLinks: [
      { url: '/tools/shipping-calculator', title: '运费计算器', reason: '相关工具' },
      { url: '/tools/hs-code', title: 'HS编码查询', reason: '相关工具' },
      { url: '/tools/package-dimensions', title: '包裹尺寸计算器', reason: '相关工具' },
    ],
    seo: { title: '国际集运指南', description: '最全面的集运攻略', keywords: ['集运', '国际快递', '海关'] },
    geo: { targetCountry: '中国', targetAudience: '海外华人', searchIntent: 'informational', entities: [], answerSummary: '', keyTakeaways: [], questionAnswers: [] },
  };
  
  const structureResult = contract.validateStructure(enrichedContent);
  assert(structureResult.errors.length === 0, `Fixture: Contract validation passed (errors: ${structureResult.errors.join(', ')})`);
  if (structureResult.errors.length > 0) {
    console.log(`  Contract errors: ${JSON.stringify(structureResult.errors)}`);
  }
}

// ============================================================================
// Test 8: Empty hero should not crash
// ============================================================================
console.log('\n=== Test 8: TOPIC_EMPTY_HERO_TEST ===');
{
  const input = {
    subtopics: [{ title: 'A', description: 'B' }],
    blockConfiguration: [{ type: 'hero', content: 'test' }],
  };
  
  const result = normalizeContent('topic', input);
  // Should not crash, hero may be undefined or constructed
  assert(true, 'Empty hero does not crash normalizer');
}

// ============================================================================
// Test 9: FAQ count after full pipeline
// ============================================================================
console.log('\n=== Test 9: TOPIC_FAQ_COUNT_AFTER_NORMALIZATION ===');
{
  const input = {
    hero: '测试专题——完整指南',
    subtopics: [
      { title: 'A', description: 'desc A' },
      { title: 'B', description: 'desc B' },
    ],
    blockConfiguration: [
      { type: 'faq', content: '常见问题解答' },
    ],
    relatedTools: [{ title: 'Tool1', url: '/tool1', description: 'desc' }],
    relatedGuides: [{ title: 'Guide1', url: '/guide1', description: 'desc' }],
  };
  
  const result = normalizeContent('topic', input);
  assert(result.content.faq.length >= 3, `FAQ count >= 3 after normalization (got ${result.content.faq.length})`);
}

// ============================================================================
// Summary
// ============================================================================
console.log('\n========================================');
console.log(`Topic Normalizer Suite: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log('Failures:');
  for (const f of failures) {
    console.log(`  - ${f}`);
  }
}
process.exit(failed > 0 ? 1 : 0);
