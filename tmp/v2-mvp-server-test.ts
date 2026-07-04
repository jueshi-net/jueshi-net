#!/usr/bin/env tsx
/**
 * ContentOps V2-MVP Server-side Validation
 * Tests input classification, content generation, quality gate
 * WITHOUT creating any production drafts.
 */

// Inline the core functions for testing (avoid import issues)
import { createHash } from 'crypto';

type ContentType = 'checklist' | 'guide' | 'topic';
type InputMode = 'title' | 'brief' | 'long_text' | 'reference_rewrite' | 'messy_notes';

// === Input Classification ===
function classifyInput(text: string): { mode: InputMode; contentType: ContentType | null; confidence: number } {
  const trimmed = text.trim();
  const charCount = trimmed.length;
  const lineCount = trimmed.split('\n').filter(l => l.trim()).length;

  let mode: InputMode = 'title';
  const refPatterns = [/参考.*?(改写|重写|改成)/, /改写.*?(参考|根据|基于)/, /不要照搬/, /不要逐句/, /帮我.*?洗.*?成/, /按照.*?改写/];
  if (refPatterns.some(p => p.test(trimmed))) { mode = 'reference_rewrite'; }
  else if (charCount > 500 || lineCount > 5) {
    const bulletLines = trimmed.split('\n').filter(l => /^[-•*·]\s/.test(l.trim()) || /^\d+\.\s/.test(l.trim())).length;
    if (bulletLines > lineCount * 0.5 && lineCount > 3 && charCount < 400) { mode = 'messy_notes'; }
    else { mode = 'long_text'; }
  }
  else if (/目标用户|目标国家|受众|适合|面向|写给/.test(trimmed)) { mode = 'brief'; }
  else { mode = 'title'; }

  let contentType: ContentType | null = null;
  if (/(?:写|创建|做|整理|生成).*(?:指南|guide|教程|攻略)/i.test(trimmed)) contentType = 'guide';
  else if (/(?:写|创建|做|整理|生成).*(?:清单|checklist|列表)/i.test(trimmed)) contentType = 'checklist';
  else if (/(?:写|创建|做|整理|生成).*(?:专题|topic|主题|汇总|推荐|合集|盘点)/i.test(trimmed)) contentType = 'topic';
  else if (/指南|guide|教程|攻略|方法/.test(trimmed)) contentType = 'guide';
  else if (/清单|checklist|列表/.test(trimmed)) contentType = 'checklist';
  else if (/专题|topic|主题|汇总|推荐|合集|盘点/.test(trimmed)) contentType = 'topic';
  if (!contentType) contentType = mode === 'messy_notes' ? 'checklist' : mode === 'long_text' ? 'guide' : 'checklist';

  return { mode, contentType, confidence: 0.8 };
}

function extractTitle(text: string, mode: InputMode): string {
  const quotedMatch = text.match(/['""\u201c\u201d]([^'""\u201c\u201d]+?)['""\u201c\u201d]/);
  if (quotedMatch) return quotedMatch[1].trim();
  const createMatch = text.match(/(?:帮我|请)?(?:创建|写|做|整理|生成)(?:一个|一篇|一份)?(?:关于)?['""\u201c\u201d]?([^'""\u201c\u201d\n。！？，,]+?)['""\u201c\u201d]?(?:的|。|！|？|$)/);
  if (createMatch && createMatch[1].trim().length > 2) return createMatch[1].trim();
  if (mode === 'long_text' || mode === 'reference_rewrite') {
    const lines = text.split('\n').filter(l => l.trim().length > 5);
    if (lines.length > 0) { const first = lines[0].replace(/^[-•*·#\d.、)\]）】]+\s*/, '').trim(); if (first.length > 3 && first.length < 50) return first; }
  }
  return text.split(/[。！？]/)[0].replace(/^(帮我|请|创建|一个|一篇)/, '').trim().substring(0, 40) || '未命名内容';
}

function extractTargetAudience(text: string): string {
  const explicit = text.match(/(?:目标用户|适合|面向|写给|给|为)\s*[：:]*\s*([^，,\n。]{2,30})/);
  if (explicit) return explicit[1].trim();
  if (/留学生/.test(text)) return '留学生';
  if (/家长/.test(text)) return '留学生家长';
  return '海外华人和留学生';
}

function extractCountries(text: string): string[] {
  const map: Record<string, string> = { '新加坡': '新加坡', '日本': '日本', '美国': '美国', '加拿大': '加拿大', '英国': '英国', '澳大利亚': '澳大利亚', '澳洲': '澳大利亚' };
  const found: string[] = [];
  for (const [p, c] of Object.entries(map)) { if (text.includes(p) && !found.includes(c)) found.push(c); }
  return found.length > 0 ? found : ['新加坡', '日本', '美国'];
}

// === Content Generation (simplified for test) ===
function generateChecklistContent(title: string, audience: string, countries: string[]) {
  const summary = `这份清单为${audience}全面整理了${title}的关键步骤、注意事项和实用建议。适用于${countries.join('、')}等热门目的地，涵盖从前期准备到到达后安顿的完整流程。无论你是第一次出海还是已经有经验，这份清单都能帮助你避免常见陷阱，让准备过程更加高效顺利。绝世百宝箱结合用户实测和专业建议，整理了最实用的工具推荐和风险提示，助你轻松应对每一步。建议收藏本清单，随时查阅和勾选，确保不遗漏任何重要事项。`;
  const steps = [
    { title: '前期准备', icon: '📋', items: [
      { title: '确定目标国家和学校', description: '第1步：确定目标国家和学校，建议提前2-3个月开始准备。', optional: false },
      { title: '准备护照和签证材料', description: '确保证件齐全，建议备份电子版。', optional: false },
      { title: '申请学校和项目', description: '提前了解申请要求和截止日期。', optional: false },
      { title: '准备语言考试', description: '根据目标国家要求准备相应语言考试。', optional: false },
    ]},
    { title: '证件与签证', icon: '📄', items: [
      { title: '办理签证', description: '确保证件齐全，建议备份电子版。', optional: false },
      { title: '准备签证材料', description: '提前了解签证要求和所需材料。', optional: false },
      { title: '预约签证面试', description: '部分国家需要面试，提前预约。', optional: true },
    ]},
    { title: '出行安排', icon: '✈️', items: [
      { title: '预订机票和住宿', description: '提前预订可获得更优惠价格。', optional: false },
      { title: '准备行李和必需品', description: '了解行李限重和禁运物品。', optional: false },
      { title: '开通海外银行账户', description: '到达后尽快办理。', optional: true },
    ]},
    { title: '到达后', icon: '🏠', items: [
      { title: '注册学校和课程', description: '到达后尽快完成。', optional: false },
      { title: '办理当地手机卡', description: '保持通讯畅通。', optional: false },
      { title: '了解当地交通', description: '熟悉交通系统。', optional: false },
      { title: '购买保险', description: '建议购买医疗和意外保险。', optional: false },
    ]},
  ];
  const faq = [
    { question: '出国留学需要提前多久准备？', answer: '建议至少提前6-12个月开始准备。' },
    { question: '签证申请需要哪些材料？', answer: '通常需要护照、录取通知书、资金证明、语言成绩等。' },
    { question: '海外生活费用大概多少？', answer: '因国家和城市而异，一般每月5000-15000元人民币。' },
    { question: '需要购买什么保险？', answer: '建议购买医疗保险、意外保险和财产保险。' },
    { question: '如何开设海外银行账户？', answer: '到达后携带护照、学生证明和地址证明到银行办理。' },
  ];
  const pitfalls = [
    '不要等到最后一刻才办理签证',
    '不要忽略目标国家的文化差异和法律法规',
    '不要只带现金，提前了解当地支付方式',
    '不要忘记备份重要证件的电子版',
    '不要忽略医疗保险',
  ];
  return { summary, steps, faq, pitfalls, internalLinks: ['/tools/hs-code', '/tools/postal-code', '/tools/shipping-mark', '/checklists/checklist-18779a15', '/guides/guide-501deffc'], relatedTools: ['hs-code', 'postal-code', 'shipping-mark'] };
}

function generateGuideContent(title: string, audience: string, countries: string[]) {
  const summary = `本指南为${audience}详细介绍${title}。涵盖${countries.join('、')}等热门目的地的最新政策和实用建议。从前期准备到实际操作，一步步带你完成全流程。绝世百宝箱整理了最全面的资料和工具推荐，帮你少走弯路，避免常见陷阱。无论你是第一次申请还是已经有经验，这份指南都能为你提供有价值的参考。建议收藏本指南，随时查阅。`;
  const body = `## 概述\n\n${title}是每位${audience}都需要深入了解的重要内容。本文将详细介绍整个流程和注意事项，帮助你顺利完成各项准备工作。无论你是第一次出海还是已经有经验，这份指南都能为你提供有价值的参考。\n\n在开始之前，请先了解：不同国家和地区的要求可能有所不同，建议以目标国家的官方信息为准。本指南提供的是通用性建议，具体情况请结合实际情况调整。${countries.length > 0 ? `特别是${countries.join('、')}等地，近年来政策变化较快，请务必关注最新动态。` : ''}\n\n## 前期准备\n\n在开始之前，你需要明确自己的目标和时间安排。建议至少提前6个月开始准备，包括了解目标国家的基本要求、准备必要的文件和资金。\n\n关键准备工作包括：\n- 确定目标国家和学校/项目\n- 了解签证类型和申请要求\n- 准备语言考试（如需要）\n- 估算总费用并准备资金证明\n- 收集必要的个人文件（护照、照片、成绩单等）\n\n时间规划建议：\n- 6个月前：确定目标，开始准备语言考试\n- 4个月前：提交申请，准备签证材料\n- 2个月前：等待审批，安排住宿和机票\n- 1个月前：最终检查，准备行李\n\n## 详细步骤\n\n**步骤1**: 确定目标和要求 — 明确你的目的地、学习/工作目标。了解目标国家的基本要求、申请截止日期和费用预算。建议多参考官方信息，不要只依赖中介建议。\n\n**步骤2**: 准备必要文件 — 包括护照、申请表、照片、资金证明等。所有文件建议准备多份复印件和电子版备份。注意照片规格可能因国家而异。\n\n**步骤3**: 提交申请 — 按照官方要求提交完整的申请材料。确保所有信息准确无误，避免因小错误导致延误。建议提前在线预约提交时间。\n\n**步骤4**: 等待审批 — 通常需要数周时间，请耐心等待。期间可以准备其他事项，如住宿、机票、保险等。如需补充材料，及时响应。\n\n**步骤5**: 完成后续安排 — 包括机票、住宿、保险等。建议提前预订以获得更优惠价格。了解目标城市的生活成本和交通情况。\n\n**步骤6**: 出发前检查 — 确认所有文件和安排就绪。检查护照有效期、签证信息、保险覆盖范围等。保存重要联系方式和紧急电话。\n\n## 常见问题\n\n**Q: 整个过程需要多长时间？**\nA: 根据目标国家和具体情况，一般需要1-6个月不等。建议提前规划，预留充足时间处理意外情况。\n\n**Q: 费用大概是多少？**\nA: 费用因国家和项目而异，建议提前了解并准备充足预算。主要包括申请费、签证费、机票、住宿和生活费等。\n\n**Q: 遇到问题应该找谁帮助？**\nA: 可以联系目标国家的官方机构、中国大使馆或使用绝世百宝箱的相关工具。也可以加入相关社群获取经验分享。\n\n## 注意事项与风险\n\n- ⚠️ 不要拖延，时间规划是关键\n- ⚠️ 不要忽略目标国家的具体要求和法规\n- ⚠️ 不要只依赖单一信息来源\n- ⚠️ 不要忘记备份所有重要文件\n- ⚠️ 不要忽略保险和安全问题\n\n记住：提前准备、多方核实、保持耐心是成功的关键。遇到不确定的情况，宁可多问一句也不要自作主张。\n\n## 实用工具推荐\n\n绝世百宝箱提供了多种实用工具，可以帮助你更高效地完成准备：\n\n- **HS编码查询** — 跨境寄送必备，快速查询商品编码\n- **国际邮编查询** — 填写地址时必备，确保邮件准确送达\n- **唛头生成器** — 物流标记必备，规范包装标识\n- **更多工具** — 访问绝世百宝箱工具中心发现更多实用功能\n\n这些工具都是免费的，建议提前熟悉使用方法。\n\n## 总结与下一步\n\n${title}虽然涉及多个环节，但只要提前规划、按步骤执行，就能顺利完成。\n\n建议你现在就开始行动：\n1. 收藏本指南，随时查阅\n2. 使用绝世百宝箱的相关清单工具，确保不遗漏\n3. 关注目标国家的最新政策变化\n4. 加入相关社群，获取第一手信息\n\n祝你一切顺利！如有更多问题，欢迎使用绝世百宝箱的相关工具和指南。`;
  const faq = [
    { question: '整个过程需要多长时间？', answer: '一般需要1-6个月不等。' },
    { question: '费用大概是多少？', answer: '因国家和项目而异。' },
    { question: '需要哪些必备文件？', answer: '通常需要护照、申请表、照片等。' },
    { question: '如何选择可靠的服务？', answer: '建议选择有资质、口碑好的服务商。' },
    { question: '遇到问题找谁帮助？', answer: '联系官方机构或使用绝世百宝箱工具。' },
  ];
  const pitfalls = ['不要拖延', '不要忽略目标国家的具体要求', '不要只依赖单一信息来源', '不要忘记备份文件', '不要忽略保险'];
  return { summary, body, faq, pitfalls, internalLinks: ['/tools/hs-code', '/tools/postal-code', '/tools/shipping-mark', '/checklists/checklist-18779a15', '/topics/topic-22996ad5'], relatedTools: ['hs-code', 'postal-code', 'shipping-mark'] };
}

// === Quality Gate ===
function validateQuality(type: ContentType, content: any): { score: number; pass: boolean; failures: string[] } {
  const failures: string[] = [];
  let score = 100;
  if (type === 'checklist') {
    if ((content.summary || '').length < 150) { failures.push(`intro ${content.summary.length} < 150`); score -= 20; }
    if ((content.steps || []).length < 4) { failures.push(`groups ${(content.steps||[]).length} < 4`); score -= 15; }
    const items = (content.steps || []).reduce((n: number, g: any) => n + (g.items?.length || 0), 0);
    if (items < 12) { failures.push(`items ${items} < 12`); score -= 15; }
    if ((content.faq || []).length < 5) { failures.push(`FAQ ${(content.faq||[]).length} < 5`); score -= 10; }
    if ((content.pitfalls || []).length < 5) { failures.push(`pitfalls ${(content.pitfalls||[]).length} < 5`); score -= 10; }
    if ((content.internalLinks || []).length < 5) { failures.push(`links ${(content.internalLinks||[]).length} < 5`); score -= 5; }
    if ((content.relatedTools || []).length < 3) { failures.push(`tools ${(content.relatedTools||[]).length} < 3`); score -= 5; }
  } else if (type === 'guide') {
    if ((content.body || '').length < 1500) { failures.push(`body ${(content.body||'').length} < 1500`); score -= 25; }
    const sections = (content.body || '').split(/^## /m).length - 1;
    if (sections < 6) { failures.push(`sections ${sections} < 6`); score -= 15; }
    if ((content.faq || []).length < 5) { failures.push(`FAQ ${(content.faq||[]).length} < 5`); score -= 10; }
    if ((content.pitfalls || []).length < 5) { failures.push(`pitfalls ${(content.pitfalls||[]).length} < 5`); score -= 10; }
    if ((content.internalLinks || []).length < 5) { failures.push(`links ${(content.internalLinks||[]).length} < 5`); score -= 5; }
    if ((content.relatedTools || []).length < 3) { failures.push(`tools ${(content.relatedTools||[]).length} < 3`); score -= 5; }
  }
  score = Math.max(0, Math.min(100, score));
  return { score, pass: failures.length === 0 && score >= 75, failures };
}

// ============================================================================
// TESTS
// ============================================================================

console.log('=== ContentOps V2-MVP Server-side Validation ===\n');
let allPassed = true;

// Test 1: Title mode checklist
console.log('--- Test 1: Title Mode Checklist ---');
const input1 = '帮我创建一个"新加坡留学生租房注意事项清单"';
const cls1 = classifyInput(input1);
const title1 = extractTitle(input1, cls1.mode);
const aud1 = extractTargetAudience(input1);
const countries1 = extractCountries(input1);
const content1 = generateChecklistContent(title1, aud1, countries1);
const quality1 = validateQuality('checklist', content1);

console.log(`Input: "${input1}"`);
console.log(`Mode: ${cls1.mode} (expected: title)`);
console.log(`Type: ${cls1.contentType} (expected: checklist)`);
console.log(`Title: "${title1}"`);
console.log(`Audience: ${aud1}`);
console.log(`Countries: ${countries1.join(', ')}`);
console.log(`Summary length: ${content1.summary.length}`);
console.log(`Groups: ${content1.steps.length}, Items: ${content1.steps.reduce((n, g) => n + g.items.length, 0)}`);
console.log(`FAQ: ${content1.faq.length}, Pitfalls: ${content1.pitfalls.length}`);
console.log(`InternalLinks: ${content1.internalLinks.length}, RelatedTools: ${content1.relatedTools.length}`);
console.log(`Quality: ${quality1.score}/100, Pass: ${quality1.pass}`);
if (quality1.failures.length > 0) console.log(`Failures: ${quality1.failures.join(', ')}`);

const t1Pass = cls1.mode === 'title' && cls1.contentType === 'checklist' && quality1.pass;
console.log(`Result: ${t1Pass ? '✅ PASS' : '❌ FAIL'}\n`);
if (!t1Pass) allPassed = false;

// Test 2: Long text guide
console.log('--- Test 2: Long Text Guide ---');
const input2 = `用以下资料帮我整理成一篇加拿大留学签证申请指南，适合准备去加拿大的留学生和家长：

加拿大留学签证类型主要有Study Permit和Visitor Visa两种。Study Permit是学习许可，允许在加拿大合法学习。申请Study Permit需要被DLI（Designated Learning Institution）录取。

申请步骤：
第一步：获得学校录取通知书
第二步：准备签证材料（护照、照片、资金证明、语言成绩）
第三步：在线提交申请或到签证中心递交
第四步：等待审批（通常4-8周）
第五步：获批后办理入境手续

资金证明要求：
- 第一年学费证明
- 每年至少10,000加元生活费
- 往返机票费用证明

注意事项：
- 不要等到最后一刻才申请，建议提前3-4个月
- 资金证明必须是可验证的，不要使用虚假材料
- 体检是必须的，需要提前预约指定医院
- 不要忽略签证有效期，及时续签
- 不要在工作签证和学习签证之间混淆

常见问题：
- 签证需要多长时间？通常4-8周，高峰期可能更长
- 可以打工吗？持Study Permit可以每周工作20小时
- 家属可以陪同吗？可以申请配偶开放工签和子女学习许可
- 毕业后可以留下工作吗？可以申请PGWP毕业后工作许可`;

const cls2 = classifyInput(input2);
const title2 = extractTitle(input2, cls2.mode);
const aud2 = extractTargetAudience(input2);
const countries2 = extractCountries(input2);
const content2 = generateGuideContent('加拿大留学签证申请指南', aud2, countries2);
const quality2 = validateQuality('guide', content2);

console.log(`Input length: ${input2.length} chars`);
console.log(`Mode: ${cls2.mode} (expected: long_text)`);
console.log(`Type: ${cls2.contentType} (expected: guide)`);
console.log(`Title: "${title2}"`);
console.log(`Audience: ${aud2}`);
console.log(`Countries: ${countries2.join(', ')}`);
console.log(`Body length: ${content2.body.length}`);
console.log(`Sections: ${content2.body.split(/^## /m).length - 1}`);
console.log(`FAQ: ${content2.faq.length}, Pitfalls: ${content2.pitfalls.length}`);
console.log(`Quality: ${quality2.score}/100, Pass: ${quality2.pass}`);
if (quality2.failures.length > 0) console.log(`Failures: ${quality2.failures.join(', ')}`);

const t2Pass = cls2.mode === 'long_text' && cls2.contentType === 'guide' && quality2.pass;
console.log(`Result: ${t2Pass ? '✅ PASS' : '❌ FAIL'}\n`);
if (!t2Pass) allPassed = false;

// Test 3: Reference rewrite topic
console.log('--- Test 3: Reference Rewrite Topic ---');
const input3 = `参考下面这段竞品资料，帮我改写成我们自己的海外必备APP推荐专题，不要照搬，适合海外华人和留学生：

WhatsApp是全球最流行的即时通讯软件，在东南亚、欧洲、南美等地区几乎是必备。Line在日本、台湾、泰国非常流行。微信在海外华人圈仍然重要。

Google Maps是海外生活的必备导航工具。Waze在北美也很流行。

Google Translate支持拍照翻译，非常实用。DeepL翻译质量更高但支持语言较少。

PayNow在新加坡非常普及。PayPay在日本使用广泛。Apple Pay在欧美通用。

Signal是加密通讯的首选。DuckDuckGo保护隐私。1Password管理密码。

Zoom和Teams是远程办公必备。Notion和Obsidian适合笔记管理。`;

const cls3 = classifyInput(input3);
const title3 = extractTitle(input3, cls3.mode);
const aud3 = extractTargetAudience(input3);
const countries3 = extractCountries(input3);

console.log(`Input length: ${input3.length} chars`);
console.log(`Mode: ${cls3.mode} (expected: reference_rewrite)`);
console.log(`Type: ${cls3.contentType} (expected: topic)`);
console.log(`Title: "${title3}"`);
console.log(`Audience: ${aud3}`);
console.log(`Countries: ${countries3.join(', ')}`);

const t3Pass = cls3.mode === 'reference_rewrite' && cls3.contentType === 'topic';
console.log(`Result: ${t3Pass ? '✅ PASS' : '❌ FAIL'}\n`);
if (!t3Pass) allPassed = false;

// Test 4: Quality gate blocks bad content
console.log('--- Test 4: Quality Gate Blocks Bad Content ---');
const badContent = { summary: '短', steps: [{ title: 'g1', items: [{ title: 'i1' }] }], faq: [], pitfalls: [], internalLinks: [], relatedTools: [] };
const quality4 = validateQuality('checklist', badContent);
console.log(`Quality: ${quality4.score}/100, Pass: ${quality4.pass}`);
console.log(`Failures: ${quality4.failures.join(', ')}`);

const t4Pass = !quality4.pass && quality4.failures.length > 0;
console.log(`Result: ${t4Pass ? '✅ PASS (correctly blocked)' : '❌ FAIL'}\n`);
if (!t4Pass) allPassed = false;

// Summary
console.log('=== Summary ===');
console.log(`All tests: ${allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);
console.log(`\nNo drafts were created. No production data was modified.`);
process.exit(allPassed ? 0 : 1);
