/**
 * ContentOps Contract Registry
 * 
 * Defines strict output schemas for each content type.
 * Each contract specifies required fields, structure, quality rules.
 */

import type { ContentType } from './task-types';

// ============================================================================
// Base Contract Interface
// ============================================================================

export interface ContentContract {
  type: ContentType;
  name: string;
  description: string;
  
  // Structure requirements
  requiredFields: string[];
  optionalFields: string[];
  
  // Quality requirements
  minLength: number; // Chinese characters
  maxLength: number;
  
  // SEO requirements
  seoTitleMaxLength: number;
  seoDescriptionMinLength: number;
  seoDescriptionMaxLength: number;
  minKeywords: number;
  maxKeywords: number;
  
  // Content requirements
  minFaqCount: number;
  minInternalLinks: number;
  maxInternalLinks: number;
  
  // Generation prompts
  briefPrompt: string;
  structurePrompt: string;
  contentPrompt: string;
  cleaningRules: string[];
  
  // Validation
  validateStructure(content: any): ValidationResult;
  validateQuality(content: any): ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// Guide Contract
// ============================================================================

export interface GuideContent {
  title: string;
  slug: string;
  summary: string;
  audience: string;
  body: string; // Markdown with H2/H3 structure
  steps?: string[]; // Key steps extracted
  pitfalls?: string[]; // Common mistakes
  faq: Array<{ question: string; answer: string }>;
  sources: Array<{
    title: string;
    url?: string;
    publisher?: string;
    retrievedAt?: string;
    claimSupported: string;
    sourceType: 'official' | 'news' | 'guide' | 'community' | 'unverified';
  }>;
  internalLinks: Array<{
    url: string;
    title: string;
    reason: string;
  }>;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    canonical?: string;
    robots?: string;
    openGraph?: {
      title: string;
      description: string;
      image?: string;
    };
  };
  geo: {
    targetCountry: string;
    targetCity?: string;
    targetAudience: string;
    searchIntent: string;
    entities: string[];
    answerSummary: string;
    keyTakeaways: string[];
    questionAnswers: Array<{ q: string; a: string }>;
  };
  structuredData?: any;
  coverPrompt?: string;
}

export const GuideContract: ContentContract = {
  type: 'guide',
  name: '操作指南',
  description: '完整的操作指南，包含步骤、注意事项和常见问题',
  
  requiredFields: [
    'title', 'slug', 'summary', 'audience', 'body',
    'faq', 'sources', 'internalLinks', 'seo', 'geo'
  ],
  optionalFields: ['steps', 'pitfalls', 'structuredData', 'coverPrompt'],
  
  minLength: 1800,
  maxLength: 5000,
  
  seoTitleMaxLength: 60,
  seoDescriptionMinLength: 120,
  seoDescriptionMaxLength: 160,
  minKeywords: 3,
  maxKeywords: 8,
  
  minFaqCount: 3,
  minInternalLinks: 3,
  maxInternalLinks: 8,
  
  briefPrompt: `你是一个专业的中文内容策划师。根据用户任务生成写作 Brief。
必须包含：目标读者、搜索意图、主要内容板块、关键词、注意事项。
返回 JSON 格式。`,

  structurePrompt: `你是一个专业的中文内容架构师。根据 Brief 生成文章大纲。
必须包含：H2 主章节、H3 子章节、每章节要点。
返回 JSON 数组格式。`,

  contentPrompt: `你是一个专业的中文内容写手，为海外华人和留学生网站撰写高质量实用文章。
要求：
- 清晰的 H2/H3 结构
- 实际步骤和操作指导
- 风险与注意事项
- 适用人群说明
- 常见问题解答
- 不虚构政策、价格和数据
- 对可能变化的信息使用保守措辞
- 不包含"作为 AI"等表述
返回 JSON 格式。`,

  cleaningRules: [
    '移除模型自述（"作为AI"、"我是一个语言模型"等）',
    '移除调试文字和占位符',
    '确保 Markdown 层级正确（H2 不跳级到 H4）',
    '移除重复段落',
    '确保中文标点正确',
    '移除不存在的内部链接',
    '移除未验证的强断言',
    '确保 FAQ 至少 3 条',
    '确保内部链接至少 3 条',
  ],
  
  validateStructure(content: GuideContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required fields (relaxed for draft_only with factVerificationStatus)
    const isDraftMode = (content as any).executionMode === 'draft_only';
    const isIncomplete = (content as any).factVerificationStatus === 'incomplete';
    
    for (const field of this.requiredFields) {
      if (!(field in content)) {
        // For draft mode, FAQ and sources can be missing with warning
        if (isDraftMode && isIncomplete && (field === 'faq' || field === 'sources')) {
          warnings.push(`Optional field missing (draft mode): ${field}`);
        } else {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }
    
    // Body length
    const charCount = countChineseChars(content.body || '');
    if (charCount < this.minLength) {
      errors.push(`Body too short: ${charCount} chars (min ${this.minLength})`);
    }
    if (charCount > this.maxLength) {
      warnings.push(`Body too long: ${charCount} chars (max ${this.maxLength})`);
    }
    
    // FAQ count (relaxed for draft mode)
    if (!content.faq || content.faq.length < this.minFaqCount) {
      if (isDraftMode && isIncomplete) {
        warnings.push(`FAQ count low (draft mode): ${content.faq?.length || 0} (min ${this.minFaqCount})`);
      } else {
        errors.push(`FAQ count too low: ${content.faq?.length || 0} (min ${this.minFaqCount})`);
      }
    }
    
    // Internal links
    if (!content.internalLinks || content.internalLinks.length < this.minInternalLinks) {
      errors.push(`Internal links too few: ${content.internalLinks?.length || 0} (min ${this.minInternalLinks})`);
    }
    
    // SEO
    if (content.seo) {
      if (content.seo.title && content.seo.title.length > this.seoTitleMaxLength) {
        warnings.push(`SEO title too long: ${content.seo.title.length} chars`);
      }
      if (content.seo.description && content.seo.description.length < this.seoDescriptionMinLength) {
        warnings.push(`SEO description too short: ${content.seo.description.length} chars`);
      }
      if (!content.seo.keywords || content.seo.keywords.length < this.minKeywords) {
        if (isDraftMode && isIncomplete) {
          warnings.push(`Keywords low (draft mode): ${content.seo.keywords?.length || 0} (min ${this.minKeywords})`);
        } else {
          errors.push(`Keywords too few: ${content.seo.keywords?.length || 0} (min ${this.minKeywords})`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },
  
  validateQuality(content: GuideContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for AI self-reference
    const aiPatterns = ['作为 AI', '作为一个人工智能', 'I am an AI', 'As an AI'];
    for (const pattern of aiPatterns) {
      if (content.body?.includes(pattern)) {
        errors.push(`Contains AI self-reference: "${pattern}"`);
      }
    }
    
    // Check for placeholder text
    const placeholders = ['TODO', 'FIXME', 'placeholder', 'lorem ipsum'];
    for (const p of placeholders) {
      if (content.body?.toLowerCase().includes(p)) {
        errors.push(`Contains placeholder text: "${p}"`);
      }
    }
    
    // Check sources are not fabricated
    if (content.sources) {
      for (const source of content.sources) {
        if (source.url && !source.url.startsWith('http')) {
          warnings.push(`Source URL may be invalid: ${source.url}`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },
};

// ============================================================================
// Checklist Contract
// ============================================================================

export interface ChecklistContent {
  title: string;
  slug: string;
  summary: string;
  audience: string;
  groups: Array<{
    name: string;
    description: string;
    items: Array<{
      text: string;
      required: boolean;
      condition?: string;
      explanation?: string;
    }>;
  }>;
  pitfalls?: string[];
  faq: Array<{ question: string; answer: string }>;
  sources: Array<{
    title: string;
    url?: string;
    publisher?: string;
    retrievedAt?: string;
    claimSupported: string;
    sourceType: 'official' | 'news' | 'guide' | 'community' | 'unverified';
  }>;
  internalLinks: Array<{
    url: string;
    title: string;
    reason: string;
  }>;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    canonical?: string;
    robots?: string;
    openGraph?: {
      title: string;
      description: string;
      image?: string;
    };
  };
  geo: {
    targetCountry: string;
    targetCity?: string;
    targetAudience: string;
    searchIntent: string;
    entities: string[];
    answerSummary: string;
    keyTakeaways: string[];
    questionAnswers: Array<{ q: string; a: string }>;
  };
  structuredData?: any;
}

export const ChecklistContract: ContentContract = {
  type: 'checklist',
  name: '检查清单',
  description: '结构化的检查清单，分组、必填/选填、条件说明',
  
  requiredFields: [
    'title', 'slug', 'summary', 'audience', 'groups',
    'faq', 'sources', 'internalLinks', 'seo', 'geo'
  ],
  optionalFields: ['pitfalls', 'structuredData'],
  
  minLength: 800,
  maxLength: 3000,
  
  seoTitleMaxLength: 60,
  seoDescriptionMinLength: 120,
  seoDescriptionMaxLength: 160,
  minKeywords: 3,
  maxKeywords: 8,
  
  minFaqCount: 3,
  minInternalLinks: 3,
  maxInternalLinks: 8,
  
  briefPrompt: `你是一个专业的中文内容策划师。根据用户任务生成检查清单 Brief。
必须包含：目标读者、使用场景、清单分组逻辑、关键检查项。
返回 JSON 格式。`,

  structurePrompt: `你是一个专业的中文内容架构师。根据 Brief 生成检查清单结构。
必须包含：分组名称、每组描述、检查项列表、必填/选填标记。
返回 JSON 数组格式。`,

  contentPrompt: `你是一个专业的中文内容写手，为海外华人和留学生网站创建实用检查清单。
要求：
- 清晰的分组结构
- 每个检查项有明确说明
- 标注必填/选填
- 有条件的项目标注适用条件
- 不虚构政策、价格和数据
- 对可能变化的信息使用保守措辞
返回 JSON 格式。`,

  cleaningRules: [
    '移除模型自述',
    '确保分组结构完整',
    '确保每个检查项有说明',
    '确保必填/选填标记正确',
    '移除不存在的内部链接',
    '确保 FAQ 至少 3 条',
  ],
  
  validateStructure(content: ChecklistContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (const field of this.requiredFields) {
      if (!(field in content)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Groups must exist
    if (!content.groups || content.groups.length === 0) {
      errors.push('Checklist must have at least one group');
    }
    
    // Count total items
    let totalItems = 0;
    if (content.groups) {
      for (const group of content.groups) {
        totalItems += group.items?.length || 0;
      }
    }
    if (totalItems < 5) {
      errors.push(`Checklist too short: ${totalItems} items (min 5)`);
    }
    
    // FAQ
    if (!content.faq || content.faq.length < this.minFaqCount) {
      errors.push(`FAQ count too low: ${content.faq?.length || 0} (min ${this.minFaqCount})`);
    }
    
    // Internal links
    if (!content.internalLinks || content.internalLinks.length < this.minInternalLinks) {
      errors.push(`Internal links too few: ${content.internalLinks?.length || 0} (min ${this.minInternalLinks})`);
    }
    
    return { valid: errors.length === 0, errors, warnings };
  },
  
  validateQuality(content: ChecklistContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const aiPatterns = ['作为 AI', '作为一个人工智能', 'I am an AI', 'As an AI'];
    for (const pattern of aiPatterns) {
      const allText = JSON.stringify(content);
      if (allText.includes(pattern)) {
        errors.push(`Contains AI self-reference: "${pattern}"`);
      }
    }
    
    return { valid: errors.length === 0, errors, warnings };
  },
};

// ============================================================================
// Topic Contract
// ============================================================================

export interface TopicContent {
  title: string;
  slug: string;
  summary: string;
  audience: string;
  hero: {
    headline: string;
    subheadline: string;
    description: string;
  };
  subtopics: Array<{
    title: string;
    description: string;
    type: 'guide' | 'checklist' | 'tool' | 'resource';
    url?: string;
  }>;
  relatedTools?: Array<{ title: string; url: string; description: string }>;
  relatedGuides?: Array<{ title: string; url: string; description: string }>;
  relatedChecklists?: Array<{ title: string; url: string; description: string }>;
  relatedResources?: Array<{ title: string; url: string; description: string }>;
  faq: Array<{ question: string; answer: string }>;
  cta?: { text: string; url: string };
  sources: Array<{
    title: string;
    url?: string;
    publisher?: string;
    retrievedAt?: string;
    claimSupported: string;
    sourceType: 'official' | 'news' | 'guide' | 'community' | 'unverified';
  }>;
  internalLinks: Array<{
    url: string;
    title: string;
    reason: string;
  }>;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    canonical?: string;
    robots?: string;
    openGraph?: {
      title: string;
      description: string;
      image?: string;
    };
  };
  geo: {
    targetCountry: string;
    targetCity?: string;
    targetAudience: string;
    searchIntent: string;
    entities: string[];
    answerSummary: string;
    keyTakeaways: string[];
    questionAnswers: Array<{ q: string; a: string }>;
  };
  structuredData?: any;
  blockConfiguration?: any;
}

export const TopicContract: ContentContract = {
  type: 'topic',
  name: '专题',
  description: '综合专题页面，聚合工具、指南、清单和官方资源',
  
  requiredFields: [
    'title', 'slug', 'summary', 'audience', 'hero', 'subtopics',
    'faq', 'sources', 'internalLinks', 'seo', 'geo'
  ],
  optionalFields: [
    'relatedTools', 'relatedGuides', 'relatedChecklists',
    'relatedResources', 'cta', 'structuredData', 'blockConfiguration'
  ],
  
  minLength: 1000,
  maxLength: 4000,
  
  seoTitleMaxLength: 60,
  seoDescriptionMinLength: 120,
  seoDescriptionMaxLength: 160,
  minKeywords: 3,
  maxKeywords: 8,
  
  minFaqCount: 3,
  minInternalLinks: 3,
  maxInternalLinks: 8,
  
  briefPrompt: `你是一个专业的中文内容策划师。根据用户任务生成专题 Brief。
必须包含：目标读者、专题定位、关联内容类型、关键子话题。
返回 JSON 格式。`,

  structurePrompt: `你是一个专业的中文内容架构师。根据 Brief 生成专题结构。
必须包含：Hero 区域、子话题列表、关联内容、CTA。
返回 JSON 格式。`,

  contentPrompt: `你是一个专业的中文内容写手，为海外华人和留学生网站创建综合专题页面。
要求：
- 清晰的 Hero 区域（标题、副标题、描述）
- 结构化的子话题列表
- 关联工具、指南、清单、资源
- 不虚构数据或链接
- 对可能变化的信息使用保守措辞
返回 JSON 格式。`,

  cleaningRules: [
    '移除模型自述',
    '确保 Hero 区域完整',
    '确保子话题列表非空',
    '确保关联链接有效',
    '移除不存在的内部链接',
    '确保 FAQ 至少 3 条',
  ],
  
  validateStructure(content: TopicContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (const field of this.requiredFields) {
      if (!(field in content)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Hero must be complete
    if (content.hero) {
      if (!content.hero.headline) errors.push('Hero missing headline');
      if (!content.hero.subheadline) errors.push('Hero missing subheadline');
      if (!content.hero.description) errors.push('Hero missing description');
    }
    
    // Subtopics must exist
    if (!content.subtopics || content.subtopics.length === 0) {
      errors.push('Topic must have at least one subtopic');
    }
    
    // FAQ
    if (!content.faq || content.faq.length < this.minFaqCount) {
      errors.push(`FAQ count too low: ${content.faq?.length || 0} (min ${this.minFaqCount})`);
    }
    
    // Internal links
    if (!content.internalLinks || content.internalLinks.length < this.minInternalLinks) {
      errors.push(`Internal links too few: ${content.internalLinks?.length || 0} (min ${this.minInternalLinks})`);
    }
    
    return { valid: errors.length === 0, errors, warnings };
  },
  
  validateQuality(content: TopicContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const aiPatterns = ['作为 AI', '作为一个人工智能', 'I am an AI', 'As an AI'];
    for (const pattern of aiPatterns) {
      const allText = JSON.stringify(content);
      if (allText.includes(pattern)) {
        errors.push(`Contains AI self-reference: "${pattern}"`);
      }
    }
    
    return { valid: errors.length === 0, errors, warnings };
  },
};

// ============================================================================
// Contract Registry
// ============================================================================

const contracts: Record<ContentType, ContentContract> = {
  guide: GuideContract,
  checklist: ChecklistContract,
  topic: TopicContract,
};

export function getContract(type: ContentType): ContentContract {
  const contract = contracts[type];
  if (!contract) {
    throw new Error(`Unknown content type: ${type}`);
  }
  return contract;
}

export function getAllContracts(): ContentContract[] {
  return Object.values(contracts);
}

// ============================================================================
// Utilities
// ============================================================================

export function countChineseChars(text: string): number {
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g);
  return chineseChars ? chineseChars.length : 0;
}
