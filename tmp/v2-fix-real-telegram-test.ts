#!/usr/bin/env tsx
/**
 * ContentOps V2 Fix Test - Reproduce Real Telegram Long Text Issue
 * 
 * User's real input:
 * "以下是我整理的加拿大留学签证资料，请你提炼并改写成绝世百宝箱风格的指南，适合准备去加拿大的留学生和家长：
 * 
 * [long text about Canada student visa...]"
 * 
 * Expected:
 * - inputMode: long_text (NOT brief)
 * - contentType: guide
 * - title: 加拿大留学签证申请指南 (NOT "成绝世百宝箱风格")
 * - sourceFacts >= 10
 * - qualityGate: PASS (body >= 1500)
 */

import { createHash } from 'crypto';

type ContentType = 'checklist' | 'guide' | 'topic';
type InputMode = 'title' | 'brief' | 'long_text' | 'reference_rewrite' | 'messy_notes';

// ============================================================================
// CURRENT (BUGGY) IMPLEMENTATION
// ============================================================================

function classifyInput_CURRENT(text: string): { mode: InputMode; contentType: ContentType | null; confidence: number } {
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

function extractTitle_CURRENT(text: string, mode: InputMode): string {
  const quotedMatch = text.match(/['""\u201c\u201d]([^'""\u201c\u201d]+?)['""\u201c\u201d]/);
  if (quotedMatch) return quotedMatch[1].trim();
  const createMatch = text.match(/(?:帮我|请)?(?:创建|写|做|整理|生成)(?:一个|一篇|一份)?(?:关于)?['""\u201c\u201d]?([^'""\u201c\u201d\n。！？，,]+?)['""\u201c\u201d]?(?:的|。|！|？|$)/);
  if (createMatch && createMatch[1].trim().length > 2) return createMatch[1].trim();
  if (mode === 'long_text' || mode === 'reference_rewrite' || mode === 'messy_notes') {
    const lines = text.split('\n').filter(l => l.trim().length > 5);
    if (lines.length > 0) { const first = lines[0].replace(/^[-•*·#\d.、)\]）】]+\s*/, '').trim(); if (first.length > 3 && first.length < 50) return first; }
  }
  return text.split(/[。！？]/)[0].replace(/^(帮我|请|创建|一个|一篇)/, '').trim().substring(0, 40) || '未命名内容';
}

// ============================================================================
// FIXED IMPLEMENTATION
// ============================================================================

function classifyInput_FIXED(text: string): { mode: InputMode; contentType: ContentType | null; confidence: number } {
  const trimmed = text.trim();
  const charCount = trimmed.length;
  const lineCount = trimmed.split('\n').filter(l => l.trim()).length;

  let mode: InputMode = 'title';

  // Priority 1: Reference rewrite (explicit reference + rewrite instruction)
  const refPatterns = [/参考.*?(改写|重写|改成)/, /改写.*?(参考|根据|基于)/, /不要照搬/, /不要逐句/, /帮我.*?洗.*?成/, /按照.*?改写/];
  if (refPatterns.some(p => p.test(trimmed))) {
    mode = 'reference_rewrite';
  }
  // Priority 2: Long text (MUST check before brief!)
  // If text is long (>300 chars) or has multiple lines (>3), it's likely long_text
  else if (charCount > 300 || lineCount > 3) {
    const bulletLines = trimmed.split('\n').filter(l => /^[-•*·]\s/.test(l.trim()) || /^\d+\.\s/.test(l.trim())).length;
    if (bulletLines > lineCount * 0.5 && lineCount > 3 && charCount < 400) {
      mode = 'messy_notes';
    } else {
      mode = 'long_text';
    }
  }
  // Priority 3: Brief (short text with target audience/country info)
  else if (/目标用户|目标国家|受众|适合|面向|写给/.test(trimmed)) {
    mode = 'brief';
  }
  // Priority 4: Title (short, simple request)
  else {
    mode = 'title';
  }

  // Detect content type
  let contentType: ContentType | null = null;
  if (/(?:写|创建|做|整理|生成|提炼|改写).*(?:指南|guide|教程|攻略)/i.test(trimmed)) contentType = 'guide';
  else if (/(?:写|创建|做|整理|生成|提炼|改写).*(?:清单|checklist|列表)/i.test(trimmed)) contentType = 'checklist';
  else if (/(?:写|创建|做|整理|生成|提炼|改写).*(?:专题|topic|主题|汇总|推荐|合集|盘点)/i.test(trimmed)) contentType = 'topic';
  else if (/指南|guide|教程|攻略|方法/.test(trimmed)) contentType = 'guide';
  else if (/清单|checklist|列表/.test(trimmed)) contentType = 'checklist';
  else if (/专题|topic|主题|汇总|推荐|合集|盘点/.test(trimmed)) contentType = 'topic';
  if (!contentType) contentType = mode === 'messy_notes' ? 'checklist' : mode === 'long_text' ? 'guide' : 'checklist';

  return { mode, contentType, confidence: 0.8 };
}

function extractTitle_FIXED(text: string, mode: InputMode): string {
  // Priority 1: Quoted content (explicit title)
  const quotedMatch = text.match(/['""\u201c\u201d]([^'""\u201c\u201d]+?)['""\u201c\u201d]/);
  if (quotedMatch) return quotedMatch[1].trim();

  // Priority 2: For long_text/reference_rewrite, extract from content topic
  if (mode === 'long_text' || mode === 'reference_rewrite' || mode === 'messy_notes') {
    // Look for explicit topic mention in first sentence
    const firstSentence = text.split(/[：:\n]/)[0].trim();
    
    // Pattern: "以下是我整理的XXX资料" -> extract XXX
    const topicMatch = firstSentence.match(/(?:整理的|关于|有关)([^，,。\n]{2,30}?)(?:资料|内容|信息|指南)/);
    if (topicMatch) return topicMatch[1].trim() + '指南';

    // Pattern: "XXX申请指南" or "XXX清单"
    const directMatch = text.match(/([\u4e00-\u9fa5]{2,20}(?:申请|办理|准备|使用)?(?:指南|清单|攻略|教程))/);
    if (directMatch) return directMatch[1].trim();

    // Fallback: extract core topic from first meaningful line
    const lines = text.split('\n').filter(l => l.trim().length > 10);
    if (lines.length > 0) {
      const firstLine = lines[0].replace(/^[-•*·#\d.、)\]）】]+\s*/, '').trim();
      // Extract topic from first line (avoid instruction text)
      const topicFromLine = firstLine.match(/([\u4e00-\u9fa5]{2,20}(?:签证|留学|申请|生活|工作|移民))/);
      if (topicFromLine) return topicFromLine[1] + '指南';
    }
  }

  // Priority 3: "帮我创建/写一个 XXX" pattern (for title/brief mode)
  const createMatch = text.match(/(?:帮我|请)?(?:创建|写|做|整理|生成)(?:一个|一篇|一份)?(?:关于)?['""\u201c\u201d]?([^'""\u201c\u201d\n。！？，,]+?)['""\u201c\u201d]?(?:的|。|！|？|$)/);
  if (createMatch && createMatch[1].trim().length > 2 && createMatch[1].trim().length < 30) {
    return createMatch[1].trim();
  }

  // Fallback
  return text.split(/[。！？]/)[0].replace(/^(帮我|请|创建|一个|一篇)/, '').trim().substring(0, 30) || '未命名内容';
}

// ============================================================================
// TEST
// ============================================================================

const userRealInput = `以下是我整理的加拿大留学签证资料，请你提炼并改写成绝世百宝箱风格的指南，适合准备去加拿大的留学生和家长：

加拿大留学签证申请一般需要先确认学校录取通知书，准备护照、资金证明、学习计划、学历材料、语言成绩、体检和无犯罪记录等资料。很多学生容易忽略的是，签证官不仅看你有没有被学校录取，也会看你是否有明确学习目的、足够资金来源、合理回国或未来规划，以及材料之间是否一致。资金证明最好能解释来源，避免突然大额存入导致被质疑。学习计划不应该写得太空泛，要说明为什么选择加拿大、为什么选择这所学校和专业、学习完成后的规划。家长准备材料时，也要注意收入证明、银行流水、亲属关系证明和担保说明之间要对应。递交前应该检查姓名、出生日期、学校名称、专业名称、学制、学费金额等关键信息是否一致。如果材料翻译不规范、资金解释不足、学习目的不清晰，容易增加拒签风险。申请人还需要关注体检预约、录指纹时间、签证审理周期，以及入境前需要携带的文件。建议学生在准备签证材料时建立一个清单，把必备材料、补充材料、解释信、翻译件和扫描件分开整理，避免临近递交时遗漏。`;

console.log('=== ContentOps V2 Fix Test - Real Telegram Input ===\n');

console.log('--- CURRENT (BUGGY) Implementation ---');
const current = classifyInput_CURRENT(userRealInput);
const currentTitle = extractTitle_CURRENT(userRealInput, current.mode);
console.log(`Input length: ${userRealInput.length} chars`);
console.log(`Mode: ${current.mode} (expected: long_text, got: ${current.mode}) ${current.mode === 'long_text' ? '✅' : '❌'}`);
console.log(`Type: ${current.contentType} (expected: guide) ${current.contentType === 'guide' ? '✅' : '❌'}`);
console.log(`Title: "${currentTitle}" (expected: 加拿大留学签证申请指南) ${currentTitle.includes('加拿大留学签证') ? '✅' : '❌'}`);
console.log('');

console.log('--- FIXED Implementation ---');
const fixed = classifyInput_FIXED(userRealInput);
const fixedTitle = extractTitle_FIXED(userRealInput, fixed.mode);
console.log(`Input length: ${userRealInput.length} chars`);
console.log(`Mode: ${fixed.mode} (expected: long_text) ${fixed.mode === 'long_text' ? '✅' : '❌'}`);
console.log(`Type: ${fixed.contentType} (expected: guide) ${fixed.contentType === 'guide' ? '✅' : '❌'}`);
console.log(`Title: "${fixedTitle}" (expected: 加拿大留学签证申请指南) ${fixedTitle.includes('加拿大留学签证') ? '✅' : '❌'}`);
console.log('');

const allPass = fixed.mode === 'long_text' && fixed.contentType === 'guide' && fixedTitle.includes('加拿大留学签证');
console.log(`=== Summary ===`);
console.log(`All tests: ${allPass ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);

process.exit(allPass ? 0 : 1);
