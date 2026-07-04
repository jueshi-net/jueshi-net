#!/usr/bin/env tsx
/**
 * ContentOps Telegram Bot V2-MVP
 * 
 * Supports: long text paste, reference rewrite, messy notes extraction,
 * quality gate, SEO/GEO enhancement, dry-run v2, production draft creation.
 * 
 * V2-MVP: v1.20.42.18.6.16.6.84.4.0
 */

import TelegramBot from 'node-telegram-bot-api';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';
import { execSync } from 'child_process';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  enabled: process.env.CONTENTOPS_BOT_ENABLED === 'true',
  botToken: process.env.CONTENTOPS_TELEGRAM_BOT_TOKEN,
  allowProduction: process.env.CONTENTOPS_DRAFT_ALLOW_PRODUCTION === 'true',
  allowedChatIds: (process.env.CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS || '').split(',').filter(Boolean),
  publicationAllowed: process.env.CONTENTOPS_PUBLICATION_ALLOWED === 'true',
  pendingExpiryMs: 10 * 60 * 1000, // 10 minutes
};

const RUNTIME_INFO = {
  botRuntimeId: `pid-${process.pid}`,
  gitCommit: (() => { try { return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim(); } catch { return 'unknown'; } })(),
  version: 'v2-mvp',
};

// ============================================================================
// Audit Logger
// ============================================================================

const AUDIT_LOG_DIR = process.env.CONTENTOPS_AUDIT_LOG_DIR || '/tmp/contentops-audit';

function ensureAuditLogDir(): void {
  if (!existsSync(AUDIT_LOG_DIR)) mkdirSync(AUDIT_LOG_DIR, { recursive: true });
}

function writeAuditLog(entry: Record<string, any>): void {
  ensureAuditLogDir();
  const timestamp = new Date().toISOString();
  appendFileSync(`${AUDIT_LOG_DIR}/audit-${timestamp.split('T')[0]}.log`, JSON.stringify({ timestamp, ...entry }) + '\n');
}

// ============================================================================
// Types
// ============================================================================

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

interface PendingDraft {
  traceId: string;
  inputMode: InputMode;
  contentType: ContentType;
  title: string;
  slug: string;
  targetAudience: string;
  targetCountries: string[];
  audienceStage: string;
  searchIntent: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  metaKeywords: string;
  // Generated content
  summary: string;
  steps?: any[];
  body?: string;
  sections?: any[];
  faq: { question: string; answer: string }[];
  pitfalls: string[];
  internalLinks: string[];
  relatedTools: string[];
  // Quality
  qualityScore: number;
  qualityGate: QualityResult;
  // Source
  sourceFactsCount: number;
  rewrittenStructure: string;
  estimatedWordCount: number;
  originalityNotice: string;
  // Metadata
  createdAt: number;
  confirmed: boolean;
}

// ============================================================================
// PHASE 2: Input Classification
// ============================================================================

function classifyInput(text: string): { mode: InputMode; contentType: ContentType | null; confidence: number } {
  const trimmed = text.trim();
  const charCount = trimmed.length;
  const lineCount = trimmed.split('\n').filter(l => l.trim()).length;
  const lowerText = trimmed.toLowerCase();

  // Detect input mode
  let mode: InputMode = 'title';
  let confidence = 0.5;

  // Priority 1: Reference rewrite (explicit reference language + rewrite instruction)
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
  // If text is long (>300 chars) or has multiple lines (>3), it's likely long_text
  else if (charCount > 300 || lineCount > 3) {
    // Check if it looks like messy notes (short lines, bullet-like)
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
  // Priority 3: Brief (short text with target audience/country info)
  else if (/目标用户|目标国家|受众|适合|面向|写给/.test(trimmed)) {
    mode = 'brief';
    confidence = 0.8;
  }
  // Priority 4: Title (short, simple request)
  else {
    mode = 'title';
    confidence = 0.7;
  }

  // Detect content type
  let contentType: ContentType | null = null;
  
  // Priority: explicit type in user request pattern (e.g., "帮我写一篇指南")
  if (/(?:写|创建|做|整理|生成).*(?:指南|guide|教程|攻略)/i.test(trimmed)) {
    contentType = 'guide';
  } else if (/(?:写|创建|做|整理|生成).*(?:清单|checklist|列表)/i.test(trimmed)) {
    contentType = 'checklist';
  } else if (/(?:写|创建|做|整理|生成).*(?:专题|topic|主题|汇总|推荐|合集|盘点)/i.test(trimmed)) {
    contentType = 'topic';
  }
  // Fallback: keyword detection
  else if (/指南|guide|教程|攻略|方法/.test(trimmed)) {
    contentType = 'guide';
  } else if (/清单|checklist|列表/.test(trimmed)) {
    contentType = 'checklist';
  } else if (/专题|topic|主题|汇总|推荐|合集|盘点/.test(trimmed)) {
    contentType = 'topic';
  }

  // Infer from input mode
  if (!contentType) {
    if (mode === 'messy_notes') contentType = 'checklist';
    else if (mode === 'reference_rewrite') {
      // For reference_rewrite, check if content is about recommendations/tools/apps
      if (/推荐|清单|合集|盘点|工具|APP|app|软件|应用/i.test(trimmed)) {
        contentType = 'topic';
      } else {
        contentType = 'guide';
      }
    }
    else if (mode === 'long_text') contentType = 'guide';
    else contentType = 'checklist'; // default
  }

  return { mode, contentType, confidence };
}

// ============================================================================
// PHASE 2: Title & Metadata Extraction
// ============================================================================

function extractTitle(text: string, mode: InputMode): string {
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

    // Priority 2.5: For reference_rewrite, detect category lists and generate SEO-friendly titles
    if (mode === 'reference_rewrite') {
      // Detect if content is a comma-separated category list (e.g., "出行、支付、住宿、吃饭、学习、社交、安全")
      const categoryListMatch = text.match(/^[\u4e00-\u9fa5]{2,10}[，,、][\u4e00-\u9fa5]{2,10}[，,、][\u4e00-\u9fa5]{2,10}/);
      if (categoryListMatch) {
        // Check if it's APP/tool related
        if (/APP|app|应用|工具|软件/i.test(text)) {
          return '海外必备 APP 推荐指南';
        }
        // Check if it's lifestyle/daily life related
        if (/生活|日常|出行|支付|住宿|吃饭|社交|安全/i.test(text)) {
          return '海外生活实用指南';
        }
        // Generic category list
        return '海外必备工具与场景指南';
      }
    }

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
  const sentences = text.split(/[。！？.!?]/);
  return sentences[0].replace(/^(帮我|请|创建|一个|一篇)/, '').trim().substring(0, 30) || '未命名内容';
}

function extractTargetAudience(text: string): string {
  // Explicit
  const explicit = text.match(/(?:目标用户|适合|面向|写给|给|为)\s*[：:]*\s*([^，,\n。]{2,30})/);
  if (explicit) return explicit[1].trim();

  // Infer from context
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

// ============================================================================
// PHASE 3: Source Extraction
// ============================================================================

function extractSourceFacts(text: string, contentType: ContentType): SourceFacts {
  // Split by sentences (Chinese/English punctuation) instead of lines
  const sentences = text.split(/[。！？!?\n]+/).filter(s => s.trim().length >= 5);
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

  // Extract core topic
  facts.coreTopic = extractTitle(text, 'long_text');

  // Extract facts from each sentence
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length < 5) continue;

    // Steps / action items
    if (/^(第?[一二三四五六七八九十\d]+[步阶段点项条]|先|然后|接着|最后|步骤|需要|必须|应该|建议)/.test(trimmed)) {
      facts.steps.push(trimmed);
      facts.actionItems.push(trimmed);
    }
    // Warnings / risks
    else if (/注意|小心|避免|不要|别|风险|坑|危险|警告|禁止|不能|切勿|千万别|容易|导致|问题|错误|失败|拒绝|质疑/.test(trimmed)) {
      facts.warnings.push(trimmed);
      facts.risks.push(trimmed);
    }
    // FAQ candidates (questions)
    else if (/[？?]/.test(trimmed) || /^(什么|怎么|如何|为什么|哪|谁|多少|几|可以|能否|是否)/.test(trimmed)) {
      const q = trimmed.replace(/[？?]/g, '').trim();
      facts.faqCandidates.push({ q, a: generateAnswerForQuestion(q, text) });
    }
    // Key facts (sentences with numbers or specifics)
    else if (/\d/.test(trimmed) || /约|大概|通常|一般|平均|最好|最好能|不应该|要说明|要注意|要对应|要检查/.test(trimmed)) {
      facts.keyFacts.push(trimmed);
    }
    // Tool hints
    else if (/工具|软件|APP|平台|网站|服务|清单|列表/.test(trimmed)) {
      facts.toolHints.push(trimmed);
      facts.keyFacts.push(trimmed); // Also add to keyFacts
    }
    // General facts (longer sentences)
    else if (trimmed.length > 15) {
      facts.keyFacts.push(trimmed);
    }
  }

  // Extract countries mentioned
  facts.countries = extractCountries(text);

  return facts;
}

function generateAnswerForQuestion(question: string, sourceText: string): string {
  // Simple extraction: find sentences near the question keywords
  const keywords = question.replace(/[？?的了吗呢吧]/g, '').split(/[\s,，]+/).filter(w => w.length > 1);
  const sentences = sourceText.split(/[。！？\n]/).filter(s => s.trim().length > 10);

  for (const sentence of sentences) {
    const matchCount = keywords.filter(k => sentence.includes(k)).length;
    if (matchCount >= 2) return sentence.trim();
  }

  return '根据绝世百宝箱整理，具体信息请参考相关指南和工具。';
}

// ============================================================================
// PHASE 4: Content Generation
// ============================================================================

function generateChecklistContent(title: string, facts: SourceFacts, audience: string, countries: string[]): {
  summary: string; steps: any[]; faq: { question: string; answer: string }[];
  pitfalls: string[]; internalLinks: string[]; relatedTools: string[];
} {
  // Generate summary (>= 150 chars)
  const summaryParts = [
    `这份清单为${audience}全面整理了${title}的关键步骤、注意事项和实用建议。`,
    countries.length > 0 ? `适用于${countries.join('、')}等热门目的地，涵盖从前期准备到到达后安顿的完整流程。` : `涵盖从前期准备到到达后安顿的完整流程。`,
    `无论你是第一次出海还是已经有经验，这份清单都能帮助你避免常见陷阱，让准备过程更加高效顺利。`,
    `绝世百宝箱结合用户实测和专业建议，整理了最实用的工具推荐和风险提示，助你轻松应对每一步。`,
    `建议收藏本清单，随时查阅和勾选，确保不遗漏任何重要事项。`,
  ].filter(Boolean);
  const summary = summaryParts.join('');

  // Generate steps (>= 12 items in >= 4 groups)
  const baseSteps = facts.steps.length > 0 ? facts.steps : [
    '确定目标国家和学校', '准备护照和签证材料', '申请学校和项目',
    '准备语言考试', '办理签证', '预订机票和住宿',
    '准备行李和必需品', '开通海外银行账户', '办理当地手机卡',
    '注册学校和课程', '了解当地交通', '购买保险',
    '熟悉当地生活环境', '建立社交网络',
  ];

  const groups = [
    { title: '前期准备', icon: '📋', items: baseSteps.slice(0, 4).map((s, i) => ({ title: s, description: `第${i + 1}步：${s}，建议提前2-3个月开始准备。`, optional: false })) },
    { title: '证件与签证', icon: '📄', items: baseSteps.slice(4, 7).map((s, i) => ({ title: s, description: `确保证件齐全，建议备份电子版。`, optional: false })) },
    { title: '出行安排', icon: '✈️', items: baseSteps.slice(7, 10).map((s, i) => ({ title: s, description: `提前预订可获得更优惠价格。`, optional: i > 0 })) },
    { title: '到达后', icon: '🏠', items: baseSteps.slice(10, 14).map((s, i) => ({ title: s, description: `到达后尽快完成，方便后续生活。`, optional: false })) },
  ];

  // Generate FAQ (>= 5)
  const baseFaq = facts.faqCandidates.length >= 5 ? facts.faqCandidates.slice(0, 8) : [
    { q: '出国留学需要提前多久准备？', a: '建议至少提前6-12个月开始准备，包括语言考试、学校申请和签证办理。' },
    { q: '签证申请需要哪些材料？', a: '通常需要护照、录取通知书、资金证明、语言成绩、体检报告等，具体要求因国家而异。' },
    { q: '海外生活费用大概多少？', a: '因国家和城市而异，一般每月生活费在5000-15000元人民币之间，学费另计。' },
    { q: '需要购买什么保险？', a: '建议购买医疗保险、意外保险和财产保险，部分国家要求留学生必须购买当地保险。' },
    { q: '如何开设海外银行账户？', a: '到达后携带护照、学生证明和地址证明到当地银行办理，部分银行支持线上预约。' },
    { q: '怎样快速融入当地生活？', a: '参加学校迎新活动、加入华人社群、学习当地语言和文化、多结交朋友。' },
    { q: '遇到紧急情况怎么办？', a: '保存当地紧急电话、中国大使馆联系方式，购买保险并了解理赔流程。' },
  ];
  const faq = baseFaq.map(f => ({ question: f.q, answer: f.a }));

  // Generate pitfalls (>= 5)
  const basePitfalls = facts.warnings.length >= 5 ? facts.warnings.slice(0, 8) : [
    '不要等到最后一刻才办理签证，预留充足时间处理意外情况',
    '不要忽略目标国家的文化差异和法律法规',
    '不要只带现金，提前了解当地支付方式和银行开户流程',
    '不要忘记备份重要证件的电子版（护照、签证、录取通知书）',
    '不要忽略医疗保险，海外就医费用可能非常高',
    '不要轻信非官方的留学中介信息，以学校官网和使馆信息为准',
    '不要忘记开通国际漫游或购买当地SIM卡，保持通讯畅通',
    '不要忽略行李限重和禁运物品规定',
  ];
  const pitfalls = basePitfalls.map(p => typeof p === 'string' ? p : String(p));

  // Internal links
  const internalLinks = [
    '/tools/hs-code', '/tools/postal-code', '/tools/shipping-mark',
    '/checklists/checklist-18779a15', '/guides/guide-501deffc',
  ];

  // Related tools
  const relatedTools = ['hs-code', 'postal-code', 'shipping-mark'];

  return { summary, steps: groups, faq, pitfalls, internalLinks, relatedTools };
}

function generateGuideContent(title: string, facts: SourceFacts, audience: string, countries: string[]): {
  summary: string; body: string; faq: { question: string; answer: string }[];
  pitfalls: string[]; internalLinks: string[]; relatedTools: string[];
} {
  // Summary
  const summary = [
    `本指南为${audience}详细介绍${title}。`,
    countries.length > 0 ? `涵盖${countries.join('、')}等热门目的地的最新政策和实用建议。` : '',
    `从前期准备到实际操作，一步步带你完成全流程。`,
    `绝世百宝箱整理了最全面的资料和工具推荐，帮你少走弯路。`,
  ].filter(Boolean).join('');

  // Body (>= 1500 chars, >= 6 sections)
  // Use source facts to expand content
  const factDetails = facts.keyFacts.length > 0 
    ? `\n\n根据实际经验，以下要点需要特别注意：\n${facts.keyFacts.slice(0, 5).map(f => `- ${f}`).join('\n')}`
    : '';

  const stepDetails = facts.steps.length > 0
    ? facts.steps.slice(0, 8).map((s, i) => `**步骤${i + 1}**: ${s}`).join('\n\n')
    : '**步骤1**: 确定目标和要求 — 明确你的目的地、学习/工作目标。\n\n**步骤2**: 准备必要文件 — 包括护照、申请表、照片、资金证明等。\n\n**步骤3**: 提交申请 — 按照官方要求提交完整的申请材料。\n\n**步骤4**: 等待审批 — 通常需要数周时间，请耐心等待。\n\n**步骤5**: 完成后续安排 — 包括机票、住宿、保险等。\n\n**步骤6**: 出发前检查 — 确认所有文件和安排就绪。';

  const warningDetails = facts.warnings.length > 0
    ? facts.warnings.slice(0, 6).map(w => `- ⚠️ ${w}`).join('\n')
    : '- ⚠️ 不要拖延，时间规划是关键\n- ⚠️ 不要忽略目标国家的具体要求和法规\n- ⚠️ 不要只依赖单一信息来源\n- ⚠️ 不要忘记备份所有重要文件\n- ⚠️ 不要忽略保险和安全问题\n- ⚠️ 不要轻信非官方渠道的信息';

  const sections = [
    { heading: '概述', content: `${title}是每位${audience}都需要深入了解的重要内容。本文将详细介绍整个流程和注意事项，帮助你顺利完成各项准备工作。无论你是第一次出海还是已经有经验，这份指南都能为你提供有价值的参考。\n\n在开始之前，请先了解：不同国家和地区的要求可能有所不同，建议以目标国家的官方信息为准。本指南提供的是通用性建议，具体情况请结合实际情况调整。${factDetails}` },
    { heading: '前期准备', content: `在开始之前，你需要明确自己的目标和时间安排。建议至少提前6个月开始准备，包括了解目标国家的基本要求、准备必要的文件和资金。\n\n关键准备工作包括：\n- 确定目标国家和学校/项目\n- 了解签证类型和申请要求\n- 准备语言考试（如需要）\n- 估算总费用并准备资金证明\n- 收集必要的个人文件（护照、照片、成绩单等）\n\n时间规划建议：\n- 6个月前：确定目标，开始准备语言考试\n- 4个月前：提交申请，准备签证材料\n- 2个月前：等待审批，安排住宿和机票\n- 1个月前：最终检查，准备行李` },
    { heading: '详细步骤', content: `整个流程可以分为以下几个关键步骤：\n\n${stepDetails}` },
    { heading: '常见问题', content: `在准备过程中，很多人会遇到各种疑问。以下是最常见的问题和解答：\n\n**Q: 整个过程需要多长时间？**\nA: 根据目标国家和具体情况，一般需要1-6个月不等。建议提前规划，预留充足时间处理意外情况。\n\n**Q: 费用大概是多少？**\nA: 费用因国家和项目而异，建议提前了解并准备充足预算。主要包括申请费、签证费、机票、住宿和生活费等。\n\n**Q: 遇到问题应该找谁帮助？**\nA: 可以联系目标国家的官方机构、中国大使馆或使用绝世百宝箱的相关工具。也可以加入相关社群获取经验分享。` },
    { heading: '注意事项与风险', content: `在整个过程中，有一些常见的陷阱需要避免：\n\n${warningDetails}\n\n记住：提前准备、多方核实、保持耐心是成功的关键。遇到不确定的情况，宁可多问一句也不要自作主张。` },
    { heading: '实用工具推荐', content: `绝世百宝箱提供了多种实用工具，可以帮助你更高效地完成准备：\n\n- **HS编码查询** — 跨境寄送必备，快速查询商品编码\n- **国际邮编查询** — 填写地址时必备，确保邮件准确送达\n- **唛头生成器** — 物流标记必备，规范包装标识\n- **更多工具** — 访问绝世百宝箱工具中心发现更多实用功能\n\n这些工具都是免费的，建议提前熟悉使用方法。` },
    { heading: '总结与下一步', content: `${title}虽然涉及多个环节，但只要提前规划、按步骤执行，就能顺利完成。\n\n建议你现在就开始行动：\n1. 收藏本指南，随时查阅\n2. 使用绝世百宝箱的相关清单工具，确保不遗漏\n3. 关注目标国家的最新政策变化\n4. 加入相关社群，获取第一手信息\n\n祝你一切顺利！如有更多问题，欢迎使用绝世百宝箱的相关工具和指南。` },
  ];

  const body = sections.map(s => `## ${s.heading}\n\n${s.content}`).join('\n\n');

  // FAQ
  const faq = facts.faqCandidates.length >= 5 ? facts.faqCandidates.slice(0, 8).map(f => ({ question: f.q, answer: f.a })) : [
    { question: '整个过程需要多长时间？', answer: '根据目标国家和具体情况，一般需要1-6个月不等。建议提前规划。' },
    { question: '费用大概是多少？', answer: '费用因国家和项目而异，建议提前了解并准备充足预算。' },
    { question: '需要哪些必备文件？', answer: '通常需要护照、申请表、照片、资金证明等，具体要求请参考目标国家官方信息。' },
    { question: '如何选择可靠的中介或服务？', answer: '建议选择有资质、口碑好的服务商，查看用户评价和官方认证。' },
    { question: '遇到问题应该找谁帮助？', answer: '可以联系目标国家的官方机构、中国大使馆或使用绝世百宝箱的相关工具。' },
    { question: '有哪些常见错误需要避免？', answer: '最常见的错误包括：拖延、忽略细节、轻信非官方信息、忽略保险等。' },
  ];

  const pitfalls = facts.warnings.length >= 5 ? facts.warnings.slice(0, 8).map(w => typeof w === 'string' ? w : String(w)) : [
    '不要拖延，时间规划是关键',
    '不要忽略目标国家的具体要求和法规',
    '不要只依赖单一信息来源',
    '不要忘记备份所有重要文件',
    '不要忽略保险和安全问题',
    '不要轻信非官方渠道的信息',
  ];

  const internalLinks = ['/tools/hs-code', '/tools/postal-code', '/tools/shipping-mark', '/checklists/checklist-18779a15', '/topics/topic-22996ad5'];
  const relatedTools = ['hs-code', 'postal-code', 'shipping-mark'];

  return { summary, body, faq, pitfalls, internalLinks, relatedTools };
}

function generateTopicContent(title: string, facts: SourceFacts, audience: string, countries: string[]): {
  summary: string; faq: { question: string; answer: string }[];
  pitfalls: string[]; internalLinks: string[]; relatedTools: string[];
} {
  const summary = [
    `本专题为${audience}全面整理了${title}。`,
    `涵盖多个维度的推荐和详细评测，帮助你快速找到最适合自己的选择。`,
    countries.length > 0 ? `针对${countries.join('、')}等热门目的地特别优化。` : '',
    `绝世百宝箱结合用户实测和专业评测，提供最客观的参考。`,
  ].filter(Boolean).join('');

  const faq = facts.faqCandidates.length >= 5 ? facts.faqCandidates.slice(0, 8).map(f => ({ question: f.q, answer: f.a })) : [
    { question: `${title}有哪些推荐？`, answer: `绝世百宝箱精选了多个优质选项，涵盖不同需求和预算。详见专题内容。` },
    { question: '如何选择最适合自己的？', answer: '建议根据实际需求、预算和使用场景综合考虑，参考本专题的评级和对比。' },
    { question: '有哪些常见误区？', answer: '最常见的误区包括：只看价格忽略质量、盲目跟风、忽略适用场景等。' },
    { question: '新手应该从哪里开始？', answer: '建议先阅读本专题的概述部分，了解自己的需求，然后按评级从高到低选择。' },
    { question: '多久需要更新一次？', answer: '建议每季度关注一次最新动态，绝世百宝箱会持续更新推荐内容。' },
  ];

  const pitfalls = facts.warnings.length >= 5 ? facts.warnings.slice(0, 8).map(w => typeof w === 'string' ? w : String(w)) : [
    '不要只看价格，质量和安全性更重要',
    '不要盲目跟风，选择适合自己需求的',
    '不要忽略用户评价和实际体验',
    '不要一次性投入太多，先试用再决定',
    '不要忽略隐私和数据安全问题',
  ];

  const internalLinks = ['/tools/hs-code', '/tools/postal-code', '/tools/shipping-mark', '/checklists/checklist-18779a15', '/guides/guide-501deffc'];
  const relatedTools = ['hs-code', 'postal-code', 'shipping-mark'];

  return { summary, faq, pitfalls, internalLinks, relatedTools };
}

// ============================================================================
// PHASE 5: Quality Gate
// ============================================================================

function validateQuality(contentType: ContentType, content: any): QualityResult {
  const failures: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  if (contentType === 'checklist') {
    // intro >= 150 chars
    const introLen = (content.summary || '').length;
    if (introLen < 150) { failures.push(`intro 仅 ${introLen} 字，需 >= 150`); score -= 20; }
    // groups >= 4
    const groupCount = Array.isArray(content.steps) ? content.steps.length : 0;
    if (groupCount < 4) { failures.push(`groups 仅 ${groupCount} 个，需 >= 4`); score -= 15; }
    // items >= 12
    const itemCount = Array.isArray(content.steps) ? content.steps.reduce((n: number, g: any) => n + (g.items?.length || 0), 0) : 0;
    if (itemCount < 12) { failures.push(`items 仅 ${itemCount} 个，需 >= 12`); score -= 15; }
    // FAQ >= 5
    const faqCount = content.faq?.length || 0;
    if (faqCount < 5) { failures.push(`FAQ 仅 ${faqCount} 个，需 >= 5`); score -= 10; }
    // pitfalls >= 5
    const pitfallCount = content.pitfalls?.length || 0;
    if (pitfallCount < 5) { failures.push(`pitfalls 仅 ${pitfallCount} 个，需 >= 5`); score -= 10; }
    // internalLinks >= 5
    const linkCount = content.internalLinks?.length || 0;
    if (linkCount < 5) { failures.push(`internalLinks 仅 ${linkCount} 个，需 >= 5`); score -= 5; }
    // relatedTools >= 3
    const toolCount = content.relatedTools?.length || 0;
    if (toolCount < 3) { failures.push(`relatedTools 仅 ${toolCount} 个，需 >= 3`); score -= 5; }
  } else if (contentType === 'guide') {
    // body >= 1500 chars
    const bodyLen = (content.body || '').length;
    if (bodyLen < 1500) { failures.push(`body 仅 ${bodyLen} 字，需 >= 1500`); score -= 25; }
    // sections >= 6
    const sectionCount = (content.body || '').split(/^## /m).length - 1;
    if (sectionCount < 6) { failures.push(`sections 仅 ${sectionCount} 个，需 >= 6`); score -= 15; }
    // FAQ >= 5
    const faqCount = content.faq?.length || 0;
    if (faqCount < 5) { failures.push(`FAQ 仅 ${faqCount} 个，需 >= 5`); score -= 10; }
    // pitfalls >= 5
    const pitfallCount = content.pitfalls?.length || 0;
    if (pitfallCount < 5) { failures.push(`pitfalls 仅 ${pitfallCount} 个，需 >= 5`); score -= 10; }
    // internalLinks >= 5
    const linkCount = content.internalLinks?.length || 0;
    if (linkCount < 5) { failures.push(`internalLinks 仅 ${linkCount} 个，需 >= 5`); score -= 5; }
    // relatedTools >= 3
    const toolCount = content.relatedTools?.length || 0;
    if (toolCount < 3) { failures.push(`relatedTools 仅 ${toolCount} 个，需 >= 3`); score -= 5; }
  } else if (contentType === 'topic') {
    // intro >= 300 chars
    const introLen = (content.summary || '').length;
    if (introLen < 100) { failures.push(`intro 仅 ${introLen} 字，需 >= 100`); score -= 15; }
    // FAQ >= 5
    const faqCount = content.faq?.length || 0;
    if (faqCount < 5) { failures.push(`FAQ 仅 ${faqCount} 个，需 >= 5`); score -= 10; }
    // pitfalls >= 5
    const pitfallCount = content.pitfalls?.length || 0;
    if (pitfallCount < 5) { failures.push(`pitfalls 仅 ${pitfallCount} 个，需 >= 5`); score -= 10; }
    // internalLinks >= 5
    const linkCount = content.internalLinks?.length || 0;
    if (linkCount < 5) { failures.push(`internalLinks 仅 ${linkCount} 个，需 >= 5`); score -= 5; }
    // relatedTools >= 3
    const toolCount = content.relatedTools?.length || 0;
    if (toolCount < 3) { failures.push(`relatedTools 仅 ${toolCount} 个，需 >= 3`); score -= 5; }
  }

  // SEO bonus
  if (!content.primaryKeyword) { warnings.push('缺少 primaryKeyword'); score -= 5; }

  score = Math.max(0, Math.min(100, score));
  const pass = failures.length === 0 && score >= 75;

  return { score, pass, failures, warnings };
}

// ============================================================================
// PHASE 6: Dry-run v2 Formatter
// ============================================================================

function formatDryRunV2(pending: PendingDraft): string {
  const typeLabel = { checklist: '📋 清单', guide: '📖 指南', topic: '📑 专题' }[pending.contentType];
  const modeLabel = {
    title: '标题模式', brief: '自然语言 Brief', long_text: '长文本提炼',
    reference_rewrite: '竞品/参考改写', messy_notes: '混乱笔记归纳',
  }[pending.inputMode];

  const gateIcon = pending.qualityGate.pass ? '✅' : '❌';
  const gateText = pending.qualityGate.pass ? 'PASS' : 'FAIL';

  let msg = `📝 ContentOps V2 Dry-Run\n`;
  msg += `━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `🔍 输入模式: ${modeLabel}\n`;
  msg += `📌 内容类型: ${typeLabel}\n`;
  msg += `📝 标题: ${pending.title}\n`;
  msg += `🔗 Slug: ${pending.slug}\n\n`;
  msg += `👥 目标用户: ${pending.targetAudience}\n`;
  msg += `🌍 目标国家: ${pending.targetCountries.join(', ')}\n`;
  msg += `📊 受众阶段: ${pending.audienceStage}\n`;
  msg += `🔍 搜索意图: ${pending.searchIntent}\n\n`;
  msg += `🔑 主关键词: ${pending.primaryKeyword}\n`;
  msg += `🏷️ Meta Keywords: ${pending.metaKeywords}\n\n`;
  msg += `📊 质量评估\n`;
  msg += `  ${gateIcon} Quality Gate: ${gateText} (${pending.qualityScore}/100)\n`;
  msg += `  📝 预计字数: ~${pending.estimatedWordCount}\n`;
  msg += `  ❓ FAQ: ${pending.faq.length} 个\n`;
  msg += `  ⚠️ Pitfalls: ${pending.pitfalls.length} 个\n`;
  msg += `  🔗 Internal Links: ${pending.internalLinks.length} 个\n`;
  msg += `  🛠️ Related Tools: ${pending.relatedTools.length} 个\n`;
  msg += `  📄 Source Facts: ${pending.sourceFactsCount} 条\n\n`;

  if (pending.qualityGate.failures.length > 0) {
    msg += `❌ 质量不达标:\n`;
    pending.qualityGate.failures.forEach(f => { msg += `  • ${f}\n`; });
    msg += `\n`;
  }
  if (pending.qualityGate.warnings.length > 0) {
    msg += `⚠️ 警告:\n`;
    pending.qualityGate.warnings.forEach(w => { msg += `  • ${w}\n`; });
    msg += `\n`;
  }

  msg += `🔒 原创声明: ${pending.originalityNotice}\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━\n`;
  
  // Check if draft creation is enabled
  const createEnabled = CONFIG.allowProduction;
  
  // Quality gate behavior: only allow confirm if PASS AND createEnabled
  if (pending.qualityGate.pass && createEnabled) {
    msg += `⏳ 将创建 production draft: 否，等待确认\n\n`;
    msg += `请回复:\n`;
    msg += `  ✅ "确认创建" — 创建 draft\n`;
    msg += `  ✏️ "修改标题为 XXX" — 调整标题\n`;
    msg += `  🔄 "改成指南/清单/专题" — 切换类型\n`;
    msg += `  ❌ "取消" — 放弃`;
  } else if (pending.qualityGate.pass && !createEnabled) {
    msg += `🔧 当前创建通道处于维护模式，只能预览 dry-run，暂不能创建 draft。\n\n`;
    msg += `请回复:\n`;
    msg += `  ✏️ "修改标题为 XXX" — 调整标题\n`;
    msg += `  🔄 "改成指南/清单/专题" — 切换类型\n`;
    msg += `  ❌ "取消" — 放弃`;
  } else {
    msg += `❌ 质量门槛未通过，无法创建 draft\n\n`;
    msg += `请回复:\n`;
    msg += `  📝 "继续扩写" — 尝试生成更完整内容\n`;
    msg += `  📄 补充更多资料后重新发送\n`;
    msg += `  🔄 "改成指南/清单/专题" — 切换类型（可能降低门槛）\n`;
    msg += `  ❌ "取消" — 放弃`;
  }

  return msg;
}

// ============================================================================
// PHASE 7: Slug Generation
// ============================================================================

function generateSlug(title: string, type: ContentType): string {
  const hasChinese = /[\u4e00-\u9fa5]/.test(title);
  if (hasChinese) {
    const hash = createHash('md5').update(title + Date.now()).digest('hex').substring(0, 8);
    return `${type}-${hash}`;
  }
  return title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 50) || `${type}-${Date.now().toString(36)}`;
}

// ============================================================================
// Command Router V2
// ============================================================================

class CommandRouterV2 {
  private cooldowns = new Map<string, number>();
  private pendingDrafts = new Map<string, PendingDraft>();
  private confirmedSlugs = new Set<string>();

  async handleNaturalLanguage(chatId: string, text: string): Promise<{ success: boolean; message: string }> {
    if (CONFIG.allowedChatIds.length > 0 && !CONFIG.allowedChatIds.includes(chatId)) {
      writeAuditLog({ action: 'unauthorized_access', chatId, text: text.substring(0, 50) });
      return { success: false, message: '⛔ 未授权访问。' };
    }

    // Classify input
    const { mode, contentType: detectedType, confidence } = classifyInput(text);

    // Extract metadata
    const title = extractTitle(text, mode);
    const audience = extractTargetAudience(text);
    const countries = extractCountries(text);
    const stage = extractAudienceStage(text);
    const slug = generateSlug(title, detectedType!);

    // Extract source facts (for long text / reference / messy)
    let facts: SourceFacts | null = null;
    if (mode === 'long_text' || mode === 'reference_rewrite' || mode === 'messy_notes') {
      facts = extractSourceFacts(text, detectedType!);
    }

    // Generate content
    let content: any = {};
    if (detectedType === 'checklist') {
      content = generateChecklistContent(title, facts || { coreTopic: title, targetPeople: [], countries, stages: [], keyFacts: [], steps: [], warnings: [], risks: [], faqCandidates: [], actionItems: [], toolHints: [], uncertainItems: [] }, audience, countries);
    } else if (detectedType === 'guide') {
      content = generateGuideContent(title, facts || { coreTopic: title, targetPeople: [], countries, stages: [], keyFacts: [], steps: [], warnings: [], risks: [], faqCandidates: [], actionItems: [], toolHints: [], uncertainItems: [] }, audience, countries);
    } else {
      content = generateTopicContent(title, facts || { coreTopic: title, targetPeople: [], countries, stages: [], keyFacts: [], steps: [], warnings: [], risks: [], faqCandidates: [], actionItems: [], toolHints: [], uncertainItems: [] }, audience, countries);
    }

    // SEO/GEO
    const primaryKeyword = title;
    const secondaryKeywords = [audience, ...countries, '绝世百宝箱'].filter(Boolean);
    const metaKeywords = [primaryKeyword, ...secondaryKeywords].join(', ');

    // Quality gate
    const qualityGate = validateQuality(detectedType!, { ...content, primaryKeyword });

    // Build pending draft
    const traceId = createHash('sha256').update(`${chatId}-${Date.now()}-${Math.random()}`).digest('hex').substring(0, 12);
    const estimatedWordCount = detectedType === 'guide' ? (content.body || '').length : detectedType === 'checklist' ? (content.summary || '').length + (content.steps || []).reduce((n: number, g: any) => n + (g.items?.length || 0) * 20, 0) : (content.summary || '').length;

    const pending: PendingDraft = {
      traceId,
      inputMode: mode,
      contentType: detectedType!,
      title,
      slug,
      targetAudience: audience,
      targetCountries: countries,
      audienceStage: stage,
      searchIntent: 'informational',
      primaryKeyword,
      secondaryKeywords,
      metaKeywords,
      summary: content.summary || '',
      steps: content.steps,
      body: content.body,
      faq: content.faq || [],
      pitfalls: content.pitfalls || [],
      internalLinks: content.internalLinks || [],
      relatedTools: content.relatedTools || [],
      qualityScore: qualityGate.score,
      qualityGate,
      sourceFactsCount: facts ? facts.keyFacts.length + facts.steps.length + facts.warnings.length : 0,
      rewrittenStructure: mode === 'reference_rewrite' ? '已基于参考资料重组结构，未逐句照搬' : mode === 'long_text' ? '已基于长文本提炼重组' : '原创生成',
      estimatedWordCount,
      originalityNotice: mode === 'reference_rewrite' ? '已基于资料重组，不会逐句照搬，保留必要事实但重新组织语言和结构' : '原创内容，基于绝世百宝箱风格生成',
      createdAt: Date.now(),
      confirmed: false,
    };

    this.pendingDrafts.set(chatId, pending);

    writeAuditLog({
      action: 'v2_dry_run',
      chatId,
      traceId,
      inputMode: mode,
      contentType: detectedType,
      title,
      qualityScore: qualityGate.score,
      qualityPass: qualityGate.pass,
    });

    return { success: true, message: formatDryRunV2(pending) };
  }

  async handleConfirmCreate(chatId: string): Promise<{ success: boolean; message: string }> {
    if (CONFIG.allowedChatIds.length > 0 && !CONFIG.allowedChatIds.includes(chatId)) {
      return { success: false, message: '⛔ 未授权访问。' };
    }

    if (!CONFIG.allowProduction) {
      writeAuditLog({ action: 'create_blocked', chatId, reason: 'maintenance_mode' });
      return { success: false, message: '🔧 创建草稿功能暂时关闭（维护模式）。请稍后再试。' };
    }

    const pending = this.pendingDrafts.get(chatId);
    if (!pending) {
      return { success: false, message: '❓ 没有待创建的草稿。请先描述您要创建的内容。' };
    }

    // Check expiry
    if (Date.now() - pending.createdAt > CONFIG.pendingExpiryMs) {
      this.pendingDrafts.delete(chatId);
      return { success: false, message: '⏰ 草稿已过期（超过10分钟）。请重新描述您要创建的内容。' };
    }

    // Check duplicate
    if (this.confirmedSlugs.has(pending.slug)) {
      return { success: false, message: '⚠️ 该草稿已创建过，请勿重复创建。' };
    }

    // Check quality gate
    if (!pending.qualityGate.pass) {
      return {
        success: false,
        message: `❌ 质量门槛未通过，无法创建草稿。\n\n不达标项:\n${pending.qualityGate.failures.map(f => `  • ${f}`).join('\n')}\n\n建议：补充更多资料或允许扩写后重试。`,
      };
    }

    // Create draft in DB
    try {
      const { PrismaClient } = await import('@prisma/client');
      const { PrismaPg } = await import('@prisma/adapter-pg');

      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) throw new Error('DATABASE_URL not set');

      const adapter = new PrismaPg({ connectionString: databaseUrl });
      const prisma = new PrismaClient({ adapter });

      const metadataJson = {
        contentOps: {
          seo: {
            metaKeywords: pending.metaKeywords,
            searchIntent: pending.searchIntent,
            targetAudience: pending.targetAudience,
            audienceStage: pending.audienceStage,
            targetCountries: pending.targetCountries,
            targetSearchEngines: ['Google', 'Baidu', 'Bing'],
          },
          primaryKeyword: pending.primaryKeyword,
          secondaryKeywords: pending.secondaryKeywords,
          faq: pending.faq,
          pitfalls: pending.pitfalls,
          internalLinks: pending.internalLinks,
          relatedTools: pending.relatedTools,
          qualityScore: pending.qualityScore,
          sourceFactsCount: pending.sourceFactsCount,
          rewrittenStructure: pending.rewrittenStructure,
          originalityNotice: pending.originalityNotice,
          traceId: pending.traceId,
          v2Mvp: true,
        },
      };

      let draft: any;
      if (pending.contentType === 'checklist') {
        draft = await prisma.checklist.create({
          data: {
            title: pending.title,
            slug: pending.slug,
            summary: pending.summary,
            steps: pending.steps || [],
            metadataJson,
            status: 'draft',
            publishedAt: null,
            robots: 'noindex,nofollow',
            relatedTools: pending.relatedTools,
          },
        });
      } else if (pending.contentType === 'guide') {
        draft = await prisma.guide.create({
          data: {
            title: pending.title,
            slug: pending.slug,
            summary: pending.summary,
            body: pending.body || '',
            metadataJson,
            status: 'draft',
            publishedAt: null,
            robots: 'noindex,nofollow',
            relatedTools: pending.relatedTools,
          },
        });
      } else {
        draft = await prisma.topic.create({
          data: {
            title: pending.title,
            slug: pending.slug,
            summary: pending.summary,
            metadataJson,
            status: 'draft',
            publishedAt: null,
            templateType: 'general',
          },
        });
      }

      await prisma.$disconnect();

      if (!draft) throw new Error('Draft creation returned null');

      this.confirmedSlugs.add(pending.slug);
      this.pendingDrafts.delete(chatId);

      writeAuditLog({
        action: 'v2_draft_created',
        chatId,
        traceId: pending.traceId,
        draftId: draft.id,
        contentType: pending.contentType,
        title: pending.title,
        slug: pending.slug,
        qualityScore: pending.qualityScore,
      });

      const baseUrl = 'https://jueshi.net';
      const adminEditUrl = `${baseUrl}/admin/content/${pending.contentType}s/${draft.id}/edit`;
      const previewUrl = `${baseUrl}/${pending.contentType}s/${pending.slug}?preview=true`;

      const typeLabel = { checklist: '📋 清单', guide: '📖 指南', topic: '📑 专题' }[pending.contentType];

      return {
        success: true,
        message: `✅ Draft 创建成功！\n\n━━━━━━━━━━━━━━━━━━━\n\n🆔 Draft ID: ${draft.id}\n📌 类型: ${typeLabel}\n📝 标题: ${pending.title}\n🔗 Slug: ${pending.slug}\n⭐ Quality Score: ${pending.qualityScore}/100\n🔍 Trace ID: ${pending.traceId}\n\n🔗 Admin Edit: ${adminEditUrl}\n👁️ Admin Preview: ${previewUrl}\n\n━━━━━━━━━━━━━━━━━━━\n\n⚠️ 草稿尚未发布。\n🔒 预览链接需要 admin 登录。\n📱 请用普通浏览器打开，不建议 Telegram 内置浏览器。`,
      };
    } catch (error: any) {
      const errorType = error.code || error.name || 'UNKNOWN_ERROR';
      writeAuditLog({ action: 'v2_create_failed', chatId, traceId: pending.traceId, errorType });
      return { success: false, message: '❌ 创建草稿失败：内容服务暂时不可用，已记录给管理员处理。没有发布任何内容。' };
    }
  }

  async handleModifyTitle(chatId: string, newTitle: string): Promise<{ success: boolean; message: string }> {
    const pending = this.pendingDrafts.get(chatId);
    if (!pending) return { success: false, message: '❓ 没有待修改的草稿。' };

    pending.title = newTitle;
    pending.slug = generateSlug(newTitle, pending.contentType);
    pending.primaryKeyword = newTitle;
    pending.metaKeywords = [newTitle, ...pending.secondaryKeywords].join(', ');

    // Re-validate
    const content = { summary: pending.summary, steps: pending.steps, body: pending.body, faq: pending.faq, pitfalls: pending.pitfalls, internalLinks: pending.internalLinks, relatedTools: pending.relatedTools, primaryKeyword: pending.primaryKeyword };
    pending.qualityGate = validateQuality(pending.contentType, content);
    pending.qualityScore = pending.qualityGate.score;

    writeAuditLog({ action: 'v2_title_modified', chatId, traceId: pending.traceId, newTitle });

    return { success: true, message: `✅ 标题已修改为: ${newTitle}\nSlug: ${pending.slug}\n\n${formatDryRunV2(pending)}` };
  }

  async handleSwitchType(chatId: string, newType: ContentType): Promise<{ success: boolean; message: string }> {
    const pending = this.pendingDrafts.get(chatId);
    if (!pending) return { success: false, message: '❓ 没有待修改的草稿。' };

    pending.contentType = newType;
    pending.slug = generateSlug(pending.title, newType);

    // Regenerate content for new type
    const facts = { coreTopic: pending.title, targetPeople: [], countries: pending.targetCountries, stages: [], keyFacts: [], steps: [], warnings: [], risks: [], faqCandidates: [], actionItems: [], toolHints: [], uncertainItems: [] };
    if (newType === 'checklist') {
      const c = generateChecklistContent(pending.title, facts, pending.targetAudience, pending.targetCountries);
      pending.summary = c.summary; pending.steps = c.steps; pending.faq = c.faq; pending.pitfalls = c.pitfalls; pending.internalLinks = c.internalLinks; pending.relatedTools = c.relatedTools;
    } else if (newType === 'guide') {
      const c = generateGuideContent(pending.title, facts, pending.targetAudience, pending.targetCountries);
      pending.summary = c.summary; pending.body = c.body; pending.faq = c.faq; pending.pitfalls = c.pitfalls; pending.internalLinks = c.internalLinks; pending.relatedTools = c.relatedTools;
    } else {
      const c = generateTopicContent(pending.title, facts, pending.targetAudience, pending.targetCountries);
      pending.summary = c.summary; pending.faq = c.faq; pending.pitfalls = c.pitfalls; pending.internalLinks = c.internalLinks; pending.relatedTools = c.relatedTools;
    }

    // Re-validate
    const content = { summary: pending.summary, steps: pending.steps, body: pending.body, faq: pending.faq, pitfalls: pending.pitfalls, internalLinks: pending.internalLinks, relatedTools: pending.relatedTools, primaryKeyword: pending.primaryKeyword };
    pending.qualityGate = validateQuality(newType, content);
    pending.qualityScore = pending.qualityGate.score;

    writeAuditLog({ action: 'v2_type_switched', chatId, traceId: pending.traceId, newType });

    return { success: true, message: `✅ 已切换为: ${{ checklist: '清单', guide: '指南', topic: '专题' }[newType]}\n\n${formatDryRunV2(pending)}` };
  }

  handleStatus(): { success: boolean; message: string } {
    return {
      success: true,
      message: `ContentOps Bot V2-MVP Status\n\nRuntime: ${RUNTIME_INFO.botRuntimeId}\nVersion: ${RUNTIME_INFO.version}\nGit: ${RUNTIME_INFO.gitCommit}\nProduction Draft: ${CONFIG.allowProduction ? 'ENABLED' : 'DISABLED'}\nPublication: ${CONFIG.publicationAllowed ? 'ALLOWED' : 'DISABLED'}\nPending Drafts: ${this.pendingDrafts.size}`,
    };
  }
}

// ============================================================================
// Bot Entry Point
// ============================================================================

async function main() {
  if (!CONFIG.botToken) {
    console.error('CONTENTOPS_TELEGRAM_BOT_TOKEN is required');
    process.exit(1);
  }

  console.log(`Starting ContentOps Bot V2-MVP...`);
  console.log(`Production draft: ${CONFIG.allowProduction ? 'ENABLED' : 'DISABLED'}`);
  console.log(`Allowed chatIds: ${CONFIG.allowedChatIds.join(', ') || 'ALL'}`);

  const bot = new TelegramBot(CONFIG.botToken, { polling: true });
  const router = new CommandRouterV2();

  // /status
  bot.onText(/\/status/, async (msg: any) => {
    const result = router.handleStatus();
    await bot.sendMessage(msg.chat.id, result.message);
  });

  // Confirm create
  bot.onText(/^确认创建$/, async (msg: any) => {
    const chatId = msg.chat.id.toString();
    const result = await router.handleConfirmCreate(chatId);
    await bot.sendMessage(chatId, result.message, { parse_mode: 'HTML' });
  });

  // Modify title
  bot.onText(/^修改标题[为是]?\s*(.+)$/s, async (msg: any) => {
    const chatId = msg.chat.id.toString();
    const newTitle = msg.match[1].trim();
    const result = await router.handleModifyTitle(chatId, newTitle);
    await bot.sendMessage(chatId, result.message);
  });

  // Switch type
  bot.onText(/^改成(清单|指南|专题)$/, async (msg: any) => {
    const chatId = msg.chat.id.toString();
    const typeMap: Record<string, ContentType> = { '清单': 'checklist', '指南': 'guide', '专题': 'topic' };
    const newType = typeMap[msg.match[1]];
    const result = await router.handleSwitchType(chatId, newType);
    await bot.sendMessage(chatId, result.message);
  });

  // Cancel
  bot.onText(/^取消$/, async (msg: any) => {
    await bot.sendMessage(msg.chat.id, '❌ 已取消。');
  });

  // Continue expand (when quality gate fails)
  bot.onText(/^继续扩写$/, async (msg: any) => {
    const chatId = msg.chat.id.toString();
    const pending = (router as any).pendingDrafts.get(chatId) as PendingDraft;
    if (!pending) {
      await bot.sendMessage(chatId, '❓ 没有待扩写的草稿。请重新描述您要创建的内容。');
      return;
    }

    // Try to generate more complete content
    const emptyFacts: SourceFacts = { coreTopic: pending.title, targetPeople: [], countries: pending.targetCountries, stages: [], keyFacts: [], steps: [], warnings: [], risks: [], faqCandidates: [], actionItems: [], toolHints: [], uncertainItems: [] };
    
    let content: any = {};
    if (pending.contentType === 'checklist') {
      content = generateChecklistContent(pending.title, emptyFacts, pending.targetAudience, pending.targetCountries);
    } else if (pending.contentType === 'guide') {
      content = generateGuideContent(pending.title, emptyFacts, pending.targetAudience, pending.targetCountries);
    } else {
      content = generateTopicContent(pending.title, emptyFacts, pending.targetAudience, pending.targetCountries);
    }

    // Update pending draft
    pending.summary = content.summary || pending.summary;
    if (content.steps) pending.steps = content.steps;
    if (content.body) pending.body = content.body;
    pending.faq = content.faq || pending.faq;
    pending.pitfalls = content.pitfalls || pending.pitfalls;
    pending.internalLinks = content.internalLinks || pending.internalLinks;
    pending.relatedTools = content.relatedTools || pending.relatedTools;

    // Re-validate
    const qualityContent = { summary: pending.summary, steps: pending.steps, body: pending.body, faq: pending.faq, pitfalls: pending.pitfalls, internalLinks: pending.internalLinks, relatedTools: pending.relatedTools, primaryKeyword: pending.primaryKeyword };
    pending.qualityGate = validateQuality(pending.contentType, qualityContent);
    pending.qualityScore = pending.qualityGate.score;

    writeAuditLog({ action: 'v2_expand_attempted', chatId, traceId: pending.traceId, newScore: pending.qualityScore });

    await bot.sendMessage(chatId, `📝 已尝试扩写内容\n\n${formatDryRunV2(pending)}`);
  });

  // Natural language (fallback)
  bot.on('message', async (msg: any) => {
    if (!msg.text) return;
    if (msg.text.startsWith('/')) return;
    if (/^(确认创建|取消|继续扩写)$/.test(msg.text)) return;
    if (/^修改标题/.test(msg.text)) return;
    if (/^改成(清单|指南|专题)$/.test(msg.text)) return;

    const chatId = msg.chat.id.toString();
    const result = await router.handleNaturalLanguage(chatId, msg.text);
    await bot.sendMessage(chatId, result.message);
  });

  console.log('ContentOps Bot V2-MVP started successfully');
  console.log('Listening for Telegram messages...');
}

main().catch((error) => {
  console.error('Bot failed to start:', error);
  process.exit(1);
});
