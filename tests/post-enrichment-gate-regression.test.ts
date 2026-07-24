/**
 * Post-Enrichment Contract Gate Regression Tests
 *
 * Tests that the executor's contractValidationPassed gate uses
 * POST-enrichment contract errors, NOT pre-enrichment normalizer remainingCount.
 *
 * Background:
 *   Normalizer Step 9 validates against the final TopicContract BEFORE the
 *   Enricher adds system-owned fields (title/slug/summary/seo/geo/internalLinks/
 *   sources/faq). This produces false "missing required field" errors for fields
 *   the model should NOT generate. The fix changed:
 *
 *     contractValidationPassed = contractErrors.length === 0
 *
 *   (was: contractErrors.length === 0 && cleaningResult.remainingCount === 0)
 *
 * These tests do NOT call Hermes CLI or connect to staging.
 * They use the real Normalizer, Enricher, and Contract modules.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ============================================================================
// Test framework (same pattern as worker-recovery-regression.test.ts)
// ============================================================================

let gateTestCount = 0;
let gatePassCount = 0;
let gateFailCount = 0;
const gateFailures: string[] = [];

const testPromises: Promise<void>[] = [];

function test(name: string, fn: () => void | Promise<void>) {
  const promise = Promise.resolve().then(() => fn()).then(() => {
    gateTestCount++;
    gatePassCount++;
  }).catch((err) => {
    gateTestCount++;
    gateFailCount++;
    const msg = `${name}: ${err.message || err}`;
    gateFailures.push(msg);
    console.error(`FAIL: ${msg}`);
  });
  testPromises.push(promise);
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ============================================================================
// Import pipeline components
// ============================================================================

import { ContentNormalizer } from '../src/lib/contentops/content-normalizer';
import { enrichContent, mergeEnrichedContent } from '../src/lib/contentops/content-enricher';
import { getContract } from '../src/lib/contentops/contract-registry';
import type { ContentType } from '../src/lib/contentops/task-types';

// ============================================================================
// Helper: Run full pipeline (normalizer -> enricher -> final contract)
// ============================================================================

interface PipelineResult {
  normalizerRemainingCount: number;
  postEnrichmentStructureErrors: string[];
  postEnrichmentQualityErrors: string[];
  contractValidationPassed: boolean;
  finalContent: any;
}

function runPipeline(
  rawContent: any,
  contentType: ContentType,
  taskMeta: { id: string; topic: string; targetAudience?: string; targetEnvironment?: string }
): PipelineResult {
  // Step 1: Normalizer (pre-enrichment)
  const normalizer = new ContentNormalizer(contentType);
  const cleaningResult = normalizer.clean(rawContent);

  // Step 2: Enricher (adds system-owned fields)
  const enriched = enrichContent({
    contentType,
    ...cleaningResult.content,
    taskId: taskMeta.id,
    topic: taskMeta.topic,
    targetAudience: taskMeta.targetAudience,
    targetEnvironment: taskMeta.targetEnvironment || 'staging',
  });

  // Step 3: Merge
  const finalContent = mergeEnrichedContent(cleaningResult.content, enriched, {
    executionMode: 'review_required',
  });

  // Step 4: Final contract validation (post-enrichment)
  const contract = getContract(contentType);
  const structureValidation = contract.validateStructure(finalContent);
  const qualityValidation = contract.validateQuality(finalContent);

  const contractErrors = [...structureValidation.errors, ...qualityValidation.errors];

  // This is the FIXED gate logic (from hermes-content-executor.ts line 231)
  const contractValidationPassed = contractErrors.length === 0;

  return {
    normalizerRemainingCount: cleaningResult.remainingCount,
    postEnrichmentStructureErrors: structureValidation.errors,
    postEnrichmentQualityErrors: qualityValidation.errors,
    contractValidationPassed,
    finalContent,
  };
}

// ============================================================================
// Fixtures
// ============================================================================

/** Topic raw output with model-owned fields but missing system-owned fields */
function topicFixture(): any {
  return {
    hero: {
      headline: '2026年新加坡留学生第一次办理手机卡与网络服务',
      subheadline: '运营商选择、实名办理、套餐比较',
      description: '本专题为新加坡留学生提供手机卡和网络服务的全面指南。',
    },
    subtopics: [
      {
        title: '运营商选择',
        description: '新加坡主要运营商对比',
        keyPoints: ['Singtel信号覆盖最广', 'StarHub性价比高', 'M1适合短期用户'],
      },
      {
        title: '实名办理流程',
        description: '留学生办理手机卡需要的证件和流程',
        keyPoints: ['护照原件', '学生准证', '住址证明'],
      },
      {
        title: '套餐比较',
        description: '预付费与后付费套餐对比',
        keyPoints: ['预付费无需合约', '后付费更划算', '注意隐藏费用'],
      },
    ],
    relatedTools: [],
    relatedGuides: [],
    relatedChecklists: [],
    relatedResources: [],
    blockConfiguration: [
      { type: 'hero', content: '2026新加坡留学生手机卡与网络服务全攻略' },
      { type: 'overview', content: '新加坡电信市场由Singtel、StarHub、M1三大运营商主导' },
      { type: 'comparison-table', content: '预付卡 vs 后付套餐 vs 宽带套餐对比' },
    ],
    cta: {
      text: '开始办理',
      link: '/tools/singapore-telco-comparison',
    },
  };
}

/** Guide raw output with model-owned fields */
function guideFixture(): any {
  return {
    title: '新加坡手机卡办理完整指南',
    body: [
      '## 选择运营商',
      '',
      '新加坡有三大主要运营商：Singtel、StarHub和M1。Singtel的信号覆盖范围最广，适合经常出行的留学生。StarHub的性价比比较高，套餐价格相对便宜。M1适合短期停留的用户，预付费套餐灵活方便。除了三大运营商外，新加坡还有多家MVNO虚拟运营商，如Circles.Life、Giga等，它们租用三大运营商的网络，提供更有竞争力的价格和更灵活的套餐选择。选择运营商时需要考虑信号覆盖、套餐价格、数据流量、客户服务质量等因素。建议新生先使用预付费套餐，熟悉本地电信服务后再考虑签约后付费套餐。',
      '',
      '## 实名办理',
      '',
      '留学生需要准备护照和学生准证前往运营商门店办理。如果是新生还没有拿到学生准证，可以使用IPA信作为临时身份证明。办理时需要填写一份申请表格，提供本地住址和联系方式。新加坡政府规定所有SIM卡都必须进行实名登记，这是为了防止电信诈骗和违法行为。登记过程通常在购买时完成，运营商会拍照验证身份。办理完成后，SIM卡通常在几分钟内就能激活使用。建议保留好购买凭证和合约副本，以备后续需要。如果更换手机或需要换卡，可以携带有效证件到门店办理，通常免费换卡一次。',
      '',
      '## 套餐选择',
      '',
      '预付费套餐适合短期停留的留学生，无需合约，随时可以取消。常见的预付费套餐价格在十到三十新币之间，包含一定的数据流量、通话时长和短信。后付费套餐适合长期留学，通常需要签订一到两年的合约，月费在二十到八十新币不等。宽带套餐适合在宿舍或租房居住的留学生，速度从五百兆到一吉比特不等。部分运营商提供手机套餐和宽带套餐的捆绑优惠，可以节省不少费用。选择套餐时要仔细比较各运营商的优惠活动，注意有些套餐包含免费的社交媒体流量或国际通话时长。建议根据自己的使用习惯选择合适的套餐，不要盲目追求大流量。',
      '',
      '## 注意事项',
      '',
      '办理时需要提供住址证明，建议提前准备租房合同或宿舍入住确认信。部分运营商可能要求押金，特别是后付费套餐。建议仔细阅读合约条款，了解提前终止的费用。注意区分手机套餐和宽带套餐，有些套餐看起来便宜但可能不包含国际通话。新加坡的电信服务通常需要绑定信用卡或银行账户进行自动扣款，如果没有本地银行账户，可以选择预付费套餐。建议开通数据使用提醒，避免超额使用产生额外费用。如果遇到信号问题，可以拨打运营商客服热线反馈，通常会在二十四小时内回复。保留好所有办理文件和收据，以备后续维权需要。建议定期检查套餐使用情况，及时调整不适合的套餐。办理完成后，测试一下通话和网络功能是否正常，确保SIM卡已正确激活。如果有出国需求，记得开通国际漫游服务，避免产生高额漫游费用。新加坡的电信服务整体质量较高，但仍需注意个人信息安全，不要随意将手机号码提供给不明来源的网站或应用。建议使用运营商提供的官方应用管理套餐，方便随时查看余额和使用记录。如果需要更换运营商，可以申请号码携带服务，保留原有手机号码切换到新的运营商。号码携带过程通常需要一到三个工作日，期间手机可能短暂无法使用。建议在学期开始前办理，避免影响日常通讯。',
      '',
      '## 信号覆盖与网络质量',
      '',
      '新加坡的整体网络覆盖非常完善，三大运营商在主要区域都有良好的信号覆盖。Singtel在网络覆盖和稳定性方面表现最佳，特别是在地铁和地下室等信号较弱的区域。StarHub的网络速度较快，适合对网速要求较高的用户。M1的覆盖相对较小，但在市区和主要住宅区信号良好。虚拟运营商使用租用的网络，信号质量与母运营商相同，但可能在高峰时段优先级较低。建议在选择前先查看各运营商在您居住区域的信号覆盖图，可以在运营商官网上查询。如果发现信号问题，可以向运营商申请信号增强器，部分运营商免费提供。新加坡正在逐步推广第五代移动通信网络，目前已在主要商业区和部分住宅区覆盖。如果您的手机支持，可以考虑选择支持第五代网络的套餐，享受更快的网络速度和更低的延迟。不过第四代网络已经足够日常使用，无需盲目追求第五代网络。建议在签约前先购买预付费卡测试信号质量，确认满意后再转签后付费套餐。这样可以避免签约后发现信号不佳的尴尬情况。',
      '',
      '## 费用与账单管理',
      '',
      '新加坡电信套餐的费用结构相对透明，但仍需注意一些隐藏费用。预付费套餐通常没有额外费用，但充值时可能需要支付少量手续费。后付费套餐除了月费外，还可能包含激活费、SIM卡费、漫游费等。建议仔细阅读合约条款，了解所有可能的费用项目。账单通常每月发送一次，可以选择电子账单或纸质账单。建议开通电子账单，既环保又方便管理。如果发现账单有误，可以在收到账单后的十四天内联系运营商客服申诉。大部分运营商提供在线账户管理平台，可以随时查看使用记录和账单详情。建议设置自动扣款，避免因忘记缴费而导致服务暂停。如果需要暂停服务（如回国期间），可以申请暂停套餐，部分运营商提供最多三个月的免费暂停服务。使用过程中如遇到任何问题，都可以拨打运营商客服热线寻求帮助，客服人员通常精通中英文，沟通不会有障碍。希望本指南能够帮助到每一位在新加坡求学的留学生朋友顺利完成手机卡办理和使用。',
    ].join('\n'),
    audience: '新加坡留学生',
    steps: ['准备证件', '选择运营商', '前往门店', '完成实名认证', '激活套餐'],
    pitfalls: ['忘记带学生准证', '未确认套餐细节', '忽略隐藏费用'],
    faq: [
      { question: '办理手机卡需要什么证件？', answer: '需要护照原件和学生准证或IPA信。' },
      { question: '预付费和后付费哪个更好？', answer: '短期停留选预付费，长期留学选后付费。' },
      { question: '可以在线办理吗？', answer: '部分运营商支持在线申请，但仍需到门店验证身份。' },
    ],
  };
}

/** Checklist raw output with model-owned fields */
function checklistFixture(): any {
  return {
    title: '新加坡手机卡办理检查清单',
    body: '完整的手机卡办理检查清单，包含所有必要步骤。',
    audience: '新加坡留学生',
    groups: [
      {
        name: '证件准备',
        description: '办理前需要准备的文件',
        items: [
          { label: '护照原件', required: true, notes: '有效期内的护照' },
          { label: '学生准证', required: true, notes: '学生准证或IPA信' },
          { label: '住址证明', required: true, notes: '租房合同或宿舍证明' },
        ],
      },
      {
        name: '运营商选择',
        description: '选择合适的运营商',
        items: [
          { label: '比较Singtel套餐', required: false, notes: '信号最好' },
          { label: '比较StarHub套餐', required: false, notes: '性价比高' },
          { label: '比较M1套餐', required: false, notes: '适合短期' },
        ],
      },
      {
        name: '办理流程',
        description: '在门店办理的步骤',
        items: [
          { label: '前往运营商门店', required: true },
          { label: '出示证件', required: true },
          { label: '选择套餐', required: true },
          { label: '完成实名认证', required: true },
          { label: '激活SIM卡', required: true },
        ],
      },
    ],
  };
}

// ============================================================================
// TEST 1: Pre-enrichment remainingCount > 0, post-enrichment errors = 0 -> PASS
// ============================================================================

test('1. Pre-enrichment remainingCount=9, post-enrichment errors=0 -> PASS', () => {
  const raw = topicFixture();
  // Raw output has NO system-owned fields (title, slug, summary, seo, geo, etc.)
  // Normalizer Step 9 will find 9+ missing required fields -> remainingCount > 0
  // But enricher adds them all -> final contract should pass

  const result = runPipeline(raw, 'topic', {
    id: 'test_task_001',
    topic: '新加坡留学生手机卡办理',
    targetAudience: '留学生',
    targetEnvironment: 'staging',
  });

  // Pre-enrichment: should have remaining issues (missing system fields)
  assert(
    result.normalizerRemainingCount > 0,
    `Pre-enrichment remainingCount should be > 0 (missing system fields), got ${result.normalizerRemainingCount}`
  );

  // Post-enrichment: should have 0 errors
  assert(
    result.postEnrichmentStructureErrors.length === 0,
    `Post-enrichment structure errors should be 0, got: ${result.postEnrichmentStructureErrors.join('; ')}`
  );
  assert(
    result.postEnrichmentQualityErrors.length === 0,
    `Post-enrichment quality errors should be 0, got: ${result.postEnrichmentQualityErrors.join('; ')}`
  );

  // Gate should PASS
  assert(
    result.contractValidationPassed === true,
    'contractValidationPassed should be true (post-enrichment errors = 0)'
  );
});

// ============================================================================
// TEST 2: Pre-enrichment remainingCount > 0, Enricher fills all -> PASS
// ============================================================================

test('2. Pre-enrichment remainingCount > 0, Enricher fills all, Final Contract=PASS', () => {
  const raw = topicFixture();
  // Remove even more fields to ensure normalizer finds issues
  delete raw.hero;

  const result = runPipeline(raw, 'topic', {
    id: 'test_task_002',
    topic: '新加坡手机卡',
    targetAudience: '留学生',
    targetEnvironment: 'staging',
  });

  // This should FAIL because hero is model-owned and enricher can't add it
  // But let's test with the full fixture - enricher should fill system fields
  const raw2 = topicFixture();

  const result2 = runPipeline(raw2, 'topic', {
    id: 'test_task_002b',
    topic: '新加坡手机卡与网络服务',
    targetAudience: '留学生',
    targetEnvironment: 'staging',
  });

  assert(
    result2.normalizerRemainingCount > 0,
    `Pre-enrichment should have remaining issues, got ${result2.normalizerRemainingCount}`
  );
  assert(
    result2.contractValidationPassed === true,
    'Post-enrichment contract should PASS when enricher fills system fields'
  );
});

// ============================================================================
// TEST 3: Enricher cannot add model-owned required field -> FAIL
// ============================================================================

test('3. Missing model-owned required field (hero) -> FAIL even after enrichment', () => {
  const raw = topicFixture();
  // Remove hero - model-owned, enricher cannot add it
  delete raw.hero;

  const result = runPipeline(raw, 'topic', {
    id: 'test_task_003',
    topic: '新加坡手机卡',
    targetAudience: '留学生',
    targetEnvironment: 'staging',
  });

  // Post-enrichment should still have structure errors (hero missing)
  assert(
    result.postEnrichmentStructureErrors.length > 0,
    `Post-enrichment should have structure errors (hero missing), got: ${result.postEnrichmentStructureErrors.join('; ')}`
  );
  assert(
    result.contractValidationPassed === false,
    'contractValidationPassed should be false when model-owned required field is missing'
  );
});

// ============================================================================
// TEST 4: Post-enrichment quality error (AI self-reference) -> FAIL
// ============================================================================

test('4. Post-enrichment Quality Gate error (AI self-reference) -> FAIL', () => {
  const raw = topicFixture();

  const result = runPipeline(raw, 'topic', {
    id: 'test_task_004',
    topic: '新加坡手机卡',
    targetAudience: '留学生',
    targetEnvironment: 'staging',
  });

  // The normalizer removes AI references in raw content during cleaning.
  // Test that the quality gate DOES catch AI references in post-enrichment
  // content by injecting one into the final content directly.
  const taintedContent = {
    ...result.finalContent,
    hero: {
      ...result.finalContent.hero,
      description: '作为 AI 助手推荐Singtel套餐',
    },
  };

  const contract = getContract('topic');
  const qualityValidation = contract.validateQuality(taintedContent);

  assert(
    qualityValidation.errors.length > 0,
    `Post-enrichment quality should catch AI self-reference, got: ${qualityValidation.errors.join('; ')}`
  );

  // Simulate the gate: contractErrors from post-enrichment should include quality errors
  const structureValidation = contract.validateStructure(taintedContent);
  const contractErrors = [...structureValidation.errors, ...qualityValidation.errors];
  const gatePassed = contractErrors.length === 0;

  assert(
    gatePassed === false,
    'contractValidationPassed should be false when quality gate has AI self-reference errors'
  );
});

// ============================================================================
// TEST 5: Topic actual raw output from failed task -> PASS
// ============================================================================

test('5. Topic actual raw output (task_1784887418278_uduwzl) -> PASS', () => {
  const rawPath = path.join(
    os.homedir(),
    '.jueshi-contentops/jobs/failed/task_1784887418278_uduwzl.raw-output.json'
  );

  if (!fs.existsSync(rawPath)) {
    console.log('  [SKIP] Raw output file not found, skipping actual task replay');
    return;
  }

  const rawOutput = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));

  const result = runPipeline(rawOutput, 'topic', {
    id: 'task_1784887418278_uduwzl',
    topic: '2026年新加坡留学生第一次办理手机卡与网络服务',
    targetAudience: '留学生',
    targetEnvironment: 'staging',
  });

  assert(
    result.normalizerRemainingCount > 0,
    `Pre-enrichment should have remaining issues (missing system fields), got ${result.normalizerRemainingCount}`
  );

  assert(
    result.postEnrichmentStructureErrors.length === 0,
    `Post-enrichment structure errors should be 0, got: ${result.postEnrichmentStructureErrors.join('; ')}`
  );
  assert(
    result.postEnrichmentQualityErrors.length === 0,
    `Post-enrichment quality errors should be 0, got: ${result.postEnrichmentQualityErrors.join('; ')}`
  );
  assert(
    result.contractValidationPassed === true,
    'Actual task raw output should PASS post-enrichment contract validation'
  );

  // Verify final content has all required fields (check presence, not truthiness)
  const fc = result.finalContent;
  assert('title' in fc, 'Final content should have title field');
  assert('slug' in fc, 'Final content should have slug field');
  assert('summary' in fc, 'Final content should have summary field');
  assert('seo' in fc, 'Final content should have seo field');
  assert('geo' in fc, 'Final content should have geo field');
  assert(!!fc.faq && fc.faq.length >= 3, 'Final content should have faq with >= 3 items');
  assert(
    !!fc.internalLinks && fc.internalLinks.length >= 3,
    'Final content should have internalLinks with >= 3 items'
  );
});

// ============================================================================
// TEST 6: Guide fixture -> PASS (no regression)
// ============================================================================

test('6. Guide fixture -> PASS (no regression)', () => {
  const raw = guideFixture();

  const result = runPipeline(raw, 'guide', {
    id: 'test_task_006',
    topic: '新加坡手机卡办理指南',
    targetAudience: '新加坡留学生',
    targetEnvironment: 'staging',
  });

  assert(
    result.contractValidationPassed === true,
    `Guide fixture should PASS, structure errors: ${result.postEnrichmentStructureErrors.join('; ')}, quality errors: ${result.postEnrichmentQualityErrors.join('; ')}`
  );
});

// ============================================================================
// TEST 7: Checklist fixture -> PASS (no regression)
// ============================================================================

test('7. Checklist fixture -> PASS (no regression)', () => {
  const raw = checklistFixture();

  const result = runPipeline(raw, 'checklist', {
    id: 'test_task_007',
    topic: '新加坡手机卡办理检查清单',
    targetAudience: '新加坡留学生',
    targetEnvironment: 'staging',
  });

  assert(
    result.contractValidationPassed === true,
    `Checklist fixture should PASS, structure errors: ${result.postEnrichmentStructureErrors.join('; ')}, quality errors: ${result.postEnrichmentQualityErrors.join('; ')}`
  );
});

// ============================================================================
// Wait for all tests and print results
// ============================================================================

Promise.all(testPromises).then(() => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`POST_ENRICHMENT_GATE_TEST_TOTAL=${gateTestCount}`);
  console.log(`POST_ENRICHMENT_GATE_TEST_PASSED=${gatePassCount}`);
  console.log(`POST_ENRICHMENT_GATE_TEST_FAILED=${gateFailCount}`);

  if (gateFailures.length > 0) {
    console.log('\nFAILURES:');
    gateFailures.forEach(f => console.log(`  - ${f}`));
  }

  console.log(`${'='.repeat(60)}`);
  if (gateFailCount > 0) process.exit(1);
});
