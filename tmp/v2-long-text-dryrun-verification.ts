#!/usr/bin/env tsx
/**
 * ContentOps V2 Long Text Dry-run Verification Test
 * 
 * 验证 long_text 模式的完整 dry-run 流程，不实际创建 draft
 */

import { createHash } from 'crypto';

type ContentType = 'checklist' | 'guide' | 'topic';
type InputMode = 'title' | 'brief' | 'long_text' | 'reference_rewrite' | 'messy_notes';

interface SourceFacts {
  coreTopic: string;
  targetPeople: string[];
  countries: string[];
  stages: string[];
  keyFacts: string[];
  steps: string[];
  warnings: string[];
  risks: string[];
  faqCandidates: { q: string; a: string }[];
  actionItems: string[];
  toolHints: string[];
  uncertainItems: string[];
}

interface QualityResult {
  score: number;
  pass: boolean;
  failures: string[];
  warnings: string[];
}

// ============================================================================
// 从 bot 代码复制的核心函数
// ============================================================================

function classifyInput(text: string): { mode: InputMode; contentType: ContentType | null; confidence: number } {
  const trimmed = text.trim();
  const charCount = trimmed.length;
  const lineCount = trimmed.split('\n').filter(l => l.trim()).length;

  let mode: InputMode = 'title';
  let confidence = 0.5;

  // Priority 1: Reference rewrite
  const refPatterns = [
    /参考.*?(改写|重写|改成)/,
    /改写.*?(参考|根据|基于)/,
    /不要照搬/,
    /不要逐句/,
    /帮我.*?洗.*?成/,
    /按照.*?改写/,
  ];
  if (refPatterns.some(p => p.test(trimmed))) {
    mode = 'reference_rewrite';
    confidence = 0.9;
  }
  // Priority 2: Long text (MUST check before brief!)
  else if (charCount > 300 || lineCount > 3) {
    const shortLines = trimmed.split('\n').filter(l => l.trim().length < 50).length;
    const bulletLines = trimmed.split('\n').filter(l => /^[-•*·]\s/.test(l.trim()) || /^\d+\.\s/.test(l.trim())).length;
    if (bulletLines > lineCount * 0.5 && lineCount > 3 && charCount < 400) {
      mode = 'messy_notes';
      confidence = 0.8;
    } else {
      mode = 'long_text';
      confidence = 0.85;
    }
  }
  // Priority 3: Brief
  else if (/目标用户|目标国家|受众|适合|面向|写给/.test(trimmed)) {
    mode = 'brief';
    confidence = 0.8;
  }
  // Priority 4: Title
  else {
    mode = 'title';
    confidence = 0.7;
  }

  // Detect content type
  let contentType: ContentType | null = null;
  
  if (/(?:写|创建|做|整理|生成|提炼|改写).*(?:指南|guide|教程|攻略)/i.test(trimmed)) {
    contentType = 'guide';
  } else if (/(?:写|创建|做|整理|生成|提炼|改写).*(?:清单|checklist|列表)/i.test(trimmed)) {
    contentType = 'checklist';
  } else if (/(?:写|创建|做|整理|生成|提炼|改写).*(?:专题|topic|主题|汇总|推荐|合集|盘点)/i.test(trimmed)) {
    contentType = 'topic';
  }
  else if (/指南|guide|教程|攻略|方法/.test(trimmed)) {
    contentType = 'guide';
  } else if (/清单|checklist|列表/.test(trimmed)) {
    contentType = 'checklist';
  } else if (/专题|topic|主题|汇总|推荐|合集|盘点/.test(trimmed)) {
    contentType = 'topic';
  }

  if (!contentType) {
    if (mode === 'messy_notes') contentType = 'checklist';
    else if (mode === 'reference_rewrite') contentType = 'guide';
    else if (mode === 'long_text') contentType = 'guide';
    else contentType = 'checklist';
  }

  return { mode, contentType, confidence };
}

function extractTitle(text: string, mode: InputMode): string {
  const quotedMatch = text.match(/['""\u201c\u201d]([^'""\u201c\u201d]+?)['""\u201c\u201d]/);
  if (quotedMatch) return quotedMatch[1].trim();

  if (mode === 'long_text' || mode === 'reference_rewrite' || mode === 'messy_notes') {
    const firstSentence = text.split(/[：:\n]/)[0].trim();
    
    const topicMatch = firstSentence.match(/(?:整理的|关于|有关)([^，,。\n]{2,30}?)(?:资料|内容|信息|指南)/);
    if (topicMatch) return topicMatch[1].trim() + '指南';

    const directMatch = text.match(/([\u4e00-\u9fa5]{2,20}(?:申请|办理|准备|使用)?(?:指南|清单|攻略|教程))/);
    if (directMatch) return directMatch[1].trim();

    const lines = text.split('\n').filter(l => l.trim().length > 10);
    if (lines.length > 0) {
      const firstLine = lines[0].replace(/^[-•*·#\d.、)\]）】]+\s*/, '').trim();
      const topicFromLine = firstLine.match(/([\u4e00-\u9fa5]{2,20}(?:签证|留学|申请|生活|工作|移民))/);
      if (topicFromLine) return topicFromLine[1] + '指南';
    }
  }

  const createMatch = text.match(/(?:帮我|请)?(?:创建|写|做|整理|生成)(?:一个|一篇|一份)?(?:关于)?['""\u201c\u201d]?([^'""\u201c\u201d\n。！？，,]+?)['""\u201c\u201d]?(?:的|。|！|？|$)/);
  if (createMatch && createMatch[1].trim().length > 2 && createMatch[1].trim().length < 30) {
    return createMatch[1].trim();
  }

  const sentences = text.split(/[。！？.!?]/);
  return sentences[0].replace(/^(帮我|请|创建|一个|一篇)/, '').trim().substring(0, 30) || '未命名内容';
}

function extractTargetAudience(text: string): string {
  const explicit = text.match(/(?:目标用户|适合|面向|写给|给|为)\s*[：:]*\s*([^，,\n。]{2,30})/);
  if (explicit) return explicit[1].trim();

  if (/留学生/.test(text)) return '留学生';
  if (/家长/.test(text)) return '留学生家长';
  if (/工作者|打工人|职场/.test(text)) return '海外工作者';
  if (/移民|新移民/.test(text)) return '新移民';
  if (/旅行者|旅游/.test(text)) return '旅行者';
  if (/出海|跨境/.test(text)) return '出海从业者';

  return '海外华人和留学生';
}

function extractCountries(text: string): string[] {
  const countryPatterns: Record<string, string> = {
    '新加坡': '新加坡', '日本': '日本', '美国': '美国', '英国': '英国',
    '加拿大': '加拿大', '澳大利亚': '澳大利亚', '澳洲': '澳大利亚',
    '新西兰': '新西兰', '德国': '德国', '法国': '法国', '韩国': '韩国',
  };

  const found: string[] = [];
  for (const [pattern, country] of Object.entries(countryPatterns)) {
    if (text.includes(pattern) && !found.includes(country)) found.push(country);
  }
  return found.length > 0 ? found : ['新加坡', '日本', '美国'];
}

function extractAudienceStage(text: string): string {
  if (/准备.*?出国|准备.*?留学|还没.*?出发|计划/.test(text)) return '准备出海阶段';
  if (/刚到|刚.*?落地|初到|新.*? arrival/.test(text)) return '刚出海阶段';
  if (/已经.*?海外|已.*?出国|生活.*?中/.test(text)) return '海外生活阶段';
  if (/回国|返程/.test(text)) return '回国准备阶段';
  return '准备出海阶段';
}

function extractSourceFacts(text: string, contentType: ContentType): SourceFacts {
  const lines = text.split('\n').filter(l => l.trim());
  const facts: SourceFacts = {
    coreTopic: '',
    targetPeople: [],
    countries: [],
    stages: [],
    keyFacts: [],
    steps: [],
    warnings: [],
    risks: [],
    faqCandidates: [],
    actionItems: [],
    toolHints: [],
    uncertainItems: [],
  };

  facts.coreTopic = extractTitle(text, 'long_text');

  for (const line of lines) {
    const trimmed = line.trim().replace(/^[-•*·#\d.、)\]）】]+\s*/, '');
    if (trimmed.length < 5) continue;

    if (/^(第?[一二三四五六七八九十\d]+[步阶段点项条]|先|然后|接着|最后|步骤|需要|必须|应该)/.test(trimmed)) {
      facts.steps.push(trimmed);
      facts.actionItems.push(trimmed);
    }
    else if (/注意|小心|避免|不要|别|风险|坑|危险|警告|禁止|不能|切勿|千万别/.test(trimmed)) {
      facts.warnings.push(trimmed);
      facts.risks.push(trimmed);
    }
    else if (/[？?]/.test(trimmed) || /^(什么|怎么|如何|为什么|哪|谁|多少|几|可以|能否|是否)/.test(trimmed)) {
      const q = trimmed.replace(/[？?]/g, '').trim();
      facts.faqCandidates.push({ q, a: '根据绝世百宝箱整理，具体信息请参考相关指南和工具。' });
    }
    else if (/\d/.test(trimmed) || /约|大概|通常|一般|平均/.test(trimmed)) {
      facts.keyFacts.push(trimmed);
    }
    else if (/工具|软件|APP|平台|网站|服务/.test(trimmed)) {
      facts.toolHints.push(trimmed);
    }
    else if (trimmed.length > 10) {
      facts.keyFacts.push(trimmed);
    }
  }

  facts.countries = extractCountries(text);

  return facts;
}

function generateGuideContent(title: string, facts: SourceFacts, audience: string, countries: string[]): {
  summary: string; body: string; faq: { question: string; answer: string }[];
  pitfalls: string[]; internalLinks: string[]; relatedTools: string[];
} {
  const summary = [
    `本指南为${audience}详细介绍${title}。`,
    countries.length > 0 ? `涵盖${countries.join('、')}等热门目的地的最新政策和实用建议。` : '',
    `从前期准备到实际操作，一步步带你完成全流程。`,
    `绝世百宝箱整理了最全面的资料和工具推荐，帮你少走弯路。`,
  ].filter(Boolean).join('');

  const body = `## 概述\n\n${title}是每位${audience}都需要深入了解的重要内容。本文将详细介绍整个流程和注意事项，帮助你顺利完成各项准备工作。\n\n## 前期准备\n\n在开始之前，你需要明确自己的目标和时间安排。建议至少提前6个月开始准备。\n\n## 详细步骤\n\n**步骤1**: 确定目标和要求\n\n**步骤2**: 准备必要文件\n\n**步骤3**: 提交申请\n\n**步骤4**: 等待审批\n\n**步骤5**: 完成后续安排\n\n**步骤6**: 出发前检查\n\n## 常见问题\n\n**Q: 整个过程需要多长时间？**\nA: 根据目标国家和具体情况，一般需要1-6个月不等。\n\n## 注意事项与风险\n\n- ⚠️ 不要拖延，时间规划是关键\n- ⚠️ 不要忽略目标国家的具体要求和法规\n- ⚠️ 不要只依赖单一信息来源\n- ⚠️ 不要忘记备份所有重要文件\n- ⚠️ 不要忽略保险和安全问题\n\n## 实用工具推荐\n\n绝世百宝箱提供了多种实用工具。\n\n## 总结与下一步\n\n${title}虽然涉及多个环节，但只要提前规划、按步骤执行，就能顺利完成。`;

  const faq = [
    { question: '整个过程需要多长时间？', answer: '根据目标国家和具体情况，一般需要1-6个月不等。' },
    { question: '费用大概是多少？', answer: '费用因国家和项目而异。' },
    { question: '需要哪些必备文件？', answer: '通常需要护照、申请表、照片、资金证明等。' },
    { question: '如何选择可靠的服务？', answer: '建议选择有资质、口碑好的服务商。' },
    { question: '遇到问题应该找谁帮助？', answer: '可以联系目标国家的官方机构或使用绝世百宝箱的相关工具。' },
  ];

  const pitfalls = [
    '不要拖延，时间规划是关键',
    '不要忽略目标国家的具体要求和法规',
    '不要只依赖单一信息来源',
    '不要忘记备份所有重要文件',
    '不要忽略保险和安全问题',
  ];

  const internalLinks = ['/tools/hs-code', '/tools/postal-code', '/tools/shipping-mark', '/checklists/checklist-18779a15', '/topics/topic-22996ad5'];
  const relatedTools = ['hs-code', 'postal-code', 'shipping-mark'];

  return { summary, body, faq, pitfalls, internalLinks, relatedTools };
}

function validateQuality(contentType: ContentType, content: any): QualityResult {
  const failures: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  if (contentType === 'guide') {
    const bodyLen = (content.body || '').length;
    if (bodyLen < 1500) { failures.push(`body 仅 ${bodyLen} 字，需 >= 1500`); score -= 25; }
    
    const sectionCount = (content.body || '').split(/^## /m).length - 1;
    if (sectionCount < 6) { failures.push(`sections 仅 ${sectionCount} 个，需 >= 6`); score -= 15; }
    
    const faqCount = content.faq?.length || 0;
    if (faqCount < 5) { failures.push(`FAQ 仅 ${faqCount} 个，需 >= 5`); score -= 10; }
    
    const pitfallCount = content.pitfalls?.length || 0;
    if (pitfallCount < 5) { failures.push(`pitfalls 仅 ${pitfallCount} 个，需 >= 5`); score -= 10; }
    
    const linkCount = content.internalLinks?.length || 0;
    if (linkCount < 5) { failures.push(`internalLinks 仅 ${linkCount} 个，需 >= 5`); score -= 5; }
    
    const toolCount = content.relatedTools?.length || 0;
    if (toolCount < 3) { failures.push(`relatedTools 仅 ${toolCount} 个，需 >= 3`); score -= 5; }
  }

  if (!content.primaryKeyword) { warnings.push('缺少 primaryKeyword'); score -= 5; }

  score = Math.max(0, Math.min(100, score));
  const pass = failures.length === 0 && score >= 75;

  return { score, pass, failures, warnings };
}

function generateSlug(title: string, type: ContentType): string {
  const hasChinese = /[\u4e00-\u9fa5]/.test(title);
  if (hasChinese) {
    const hash = createHash('md5').update(title + Date.now()).digest('hex').substring(0, 8);
    return `${type}-${hash}`;
  }
  return title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 50) || `${type}-${Date.now().toString(36)}`;
}

// ============================================================================
// 测试用例
// ============================================================================

const userRealInput = `以下是我整理的加拿大留学签证资料，请你提炼并改写成绝世百宝箱风格的指南，适合准备去加拿大的留学生和家长：

加拿大留学签证申请一般需要先确认学校录取通知书，准备护照、资金证明、学习计划、学历材料、语言成绩、体检和无犯罪记录等资料。很多学生容易忽略的是，签证官不仅看你有没有被学校录取，也会看你是否有明确学习目的、足够资金来源、合理回国或未来规划，以及材料之间是否一致。资金证明最好能解释来源，避免突然大额存入导致被质疑。学习计划不应该写得太空泛，要说明为什么选择加拿大、为什么选择这所学校和专业、学习完成后的规划。家长准备材料时，也要注意收入证明、银行流水、亲属关系证明和担保说明之间要对应。递交前应该检查姓名、出生日期、学校名称、专业名称、学制、学费金额等关键信息是否一致。如果材料翻译不规范、资金解释不足、学习目的不清晰，容易增加拒签风险。申请人还需要关注体检预约、录指纹时间、签证审理周期，以及入境前需要携带的文件。建议学生在准备签证材料时建立一个清单，把必备材料、补充材料、解释信、翻译件和扫描件分开整理，避免临近递交时遗漏。`;

console.log('=== ContentOps V2 Long Text Dry-run Verification ===\n');

// 1. 分类输入
const { mode, contentType, confidence } = classifyInput(userRealInput);
console.log('1. Input Classification:');
console.log(`   inputMode: ${mode} (expected: long_text) ${mode === 'long_text' ? '✅' : '❌'}`);
console.log(`   contentType: ${contentType} (expected: guide) ${contentType === 'guide' ? '✅' : '❌'}`);
console.log(`   confidence: ${confidence}\n`);

// 2. 提取标题
const title = extractTitle(userRealInput, mode);
console.log('2. Title Extraction:');
console.log(`   title: "${title}" (expected: 加拿大留学签证指南) ${title.includes('加拿大留学签证') ? '✅' : '❌'}\n`);

// 3. 提取元数据
const audience = extractTargetAudience(userRealInput);
const countries = extractCountries(userRealInput);
const stage = extractAudienceStage(userRealInput);
console.log('3. Metadata Extraction:');
console.log(`   targetAudience: ${audience}`);
console.log(`   targetCountries: ${countries.join(', ')}`);
console.log(`   audienceStage: ${stage}\n`);

// 4. 提取 Source Facts
const facts = extractSourceFacts(userRealInput, contentType!);
const sourceFactsCount = facts.keyFacts.length + facts.steps.length + facts.warnings.length;
console.log('4. Source Facts Extraction:');
console.log(`   sourceFacts count: ${sourceFactsCount} (expected: >= 10) ${sourceFactsCount >= 10 ? '✅' : '❌'}`);
console.log(`   keyFacts: ${facts.keyFacts.length}`);
console.log(`   steps: ${facts.steps.length}`);
console.log(`   warnings: ${facts.warnings.length}\n`);

// 5. 生成内容
const content = generateGuideContent(title, facts, audience, countries);
console.log('5. Content Generation:');
console.log(`   summary length: ${content.summary.length}`);
console.log(`   body length: ${content.body.length} (expected: >= 1500) ${content.body.length >= 1500 ? '✅' : '❌'}`);
console.log(`   sections: ${content.body.split(/^## /m).length - 1} (expected: >= 6) ${content.body.split(/^## /m).length - 1 >= 6 ? '✅' : '❌'}`);
console.log(`   FAQ: ${content.faq.length} (expected: >= 5) ${content.faq.length >= 5 ? '✅' : '❌'}`);
console.log(`   pitfalls: ${content.pitfalls.length} (expected: >= 5) ${content.pitfalls.length >= 5 ? '✅' : '❌'}`);
console.log(`   internalLinks: ${content.internalLinks.length} (expected: >= 5) ${content.internalLinks.length >= 5 ? '✅' : '❌'}`);
console.log(`   relatedTools: ${content.relatedTools.length} (expected: >= 3) ${content.relatedTools.length >= 3 ? '✅' : '❌'}\n`);

// 6. 质量验证
const primaryKeyword = title;
const qualityGate = validateQuality(contentType!, { ...content, primaryKeyword });
console.log('6. Quality Gate:');
console.log(`   score: ${qualityGate.score}/100 (expected: >= 75) ${qualityGate.score >= 75 ? '✅' : '❌'}`);
console.log(`   pass: ${qualityGate.pass} (expected: true) ${qualityGate.pass ? '✅' : '❌'}`);
if (qualityGate.failures.length > 0) {
  console.log(`   failures:`);
  qualityGate.failures.forEach(f => console.log(`     - ${f}`));
}
console.log();

// 7. 生成 slug
const slug = generateSlug(title, contentType!);
console.log('7. Slug Generation:');
console.log(`   slug: ${slug}\n`);

// 8. 总结
const allPass = mode === 'long_text' && 
                contentType === 'guide' && 
                title.includes('加拿大留学签证') && 
                sourceFactsCount >= 10 && 
                qualityGate.pass;

console.log('=== Summary ===');
console.log(`All checks: ${allPass ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);
console.log(`\nNote: This test does NOT create any draft (CONTENTOPS_DRAFT_ALLOW_PRODUCTION=false)`);
console.log(`Reference rewrite feature is still pending implementation.`);

process.exit(allPass ? 0 : 1);
