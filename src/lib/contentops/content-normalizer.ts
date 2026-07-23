/**
 * ContentOps Content Normalizer
 * 
 * Cleans and validates generated content.
 * Removes AI artifacts, fixes structure, enforces contracts.
 */

import { getContract, countChineseChars, type ContentContract } from './contract-registry';
import type { ContentType } from './task-types';

// ============================================================================
// Cleaning Result
// ============================================================================

export interface CleaningResult {
  content: any;
  issues: CleaningIssue[];
  fixedCount: number;
  remainingCount: number;
}

export interface CleaningIssue {
  type: string;
  severity: 'error' | 'warning' | 'info';
  description: string;
  fixed: boolean;
  location?: string;
}

// ============================================================================
// Content Normalizer
// ============================================================================

export class ContentNormalizer {
  private contract: ContentContract;
  private issues: CleaningIssue[] = [];
  private fixedCount = 0;

  constructor(contentType: ContentType) {
    this.contract = getContract(contentType);
  }

  /**
   * Main cleaning pipeline
   */
  clean(content: any): CleaningResult {
    this.issues = [];
    this.fixedCount = 0;

    let cleaned = { ...content };

    // Step 1: Remove AI self-references
    cleaned = this.removeAiSelfReferences(cleaned);

    // Step 2: Remove debug/placeholder text
    cleaned = this.removeDebugText(cleaned);

    // Step 3: Fix Markdown structure
    cleaned = this.fixMarkdownStructure(cleaned);

    // Step 4: Remove duplicate content
    cleaned = this.removeDuplicates(cleaned);

    // Step 5: Fix Chinese punctuation
    cleaned = this.fixChinesePunctuation(cleaned);

    // Step 6: Validate and clean internal links
    cleaned = this.cleanInternalLinks(cleaned);

    // Step 7: Validate and clean sources
    cleaned = this.cleanSources(cleaned);

    // Step 8: Ensure FAQ minimum
    cleaned = this.ensureFaqMinimum(cleaned);

    // Step 8.5: Topic-specific structure normalization
    if (this.contract.type === 'topic') {
      cleaned = this.normalizeTopicStructure(cleaned);
    }

    // Step 9: Validate structure against contract
    const structureResult = this.contract.validateStructure(cleaned);
    for (const error of structureResult.errors) {
      this.addIssue('structure', 'error', error, false);
    }
    for (const warning of structureResult.warnings) {
      this.addIssue('structure', 'warning', warning, false);
    }

    // Step 10: Validate quality
    const qualityResult = this.contract.validateQuality(cleaned);
    for (const error of qualityResult.errors) {
      this.addIssue('quality', 'error', error, false);
    }
    for (const warning of qualityResult.warnings) {
      this.addIssue('quality', 'warning', warning, false);
    }

    return {
      content: cleaned,
      issues: this.issues,
      fixedCount: this.fixedCount,
      remainingCount: this.issues.filter(i => !i.fixed && i.severity === 'error').length,
    };
  }

  // ============================================================================
  // Cleaning Steps
  // ============================================================================

  private removeAiSelfReferences(content: any): any {
    const patterns = [
      /作为\s*(AI|人工智能|一个?\s*(AI|语言模型|AI\s*助手))/g,
      /As\s*an?\s*(AI|language\s*model|AI\s*assistant)/gi,
      /I\s*am\s*an?\s*(AI|language\s*model)/gi,
      /我是\s*(一个?\s*)?(AI|人工智能|语言模型)/g,
      /作为一个?\s*(AI|人工智能|语言模型|AI\s*助手)/g,
    ];

    const clean = (text: string): string => {
      let result = text;
      for (const pattern of patterns) {
        if (pattern.test(result)) {
          this.addIssue('ai-reference', 'error', `Removed AI self-reference`, true);
          this.fixedCount++;
          result = result.replace(pattern, '');
        }
      }
      return result;
    };

    return this.applyToTextFields(content, clean);
  }

  private removeDebugText(content: any): any {
    const patterns = [
      /TODO/gi,
      /FIXME/gi,
      /HACK/gi,
      /XXX/gi,
      /placeholder/gi,
      /lorem\s*ipsum/gi,
      /\[待补充\]/g,
      /\[TODO\]/gi,
      /\[FIXME\]/gi,
    ];

    const clean = (text: string): string => {
      let result = text;
      for (const pattern of patterns) {
        if (pattern.test(result)) {
          this.addIssue('debug-text', 'error', `Removed debug/placeholder text`, true);
          this.fixedCount++;
          result = result.replace(pattern, '');
        }
      }
      return result;
    };

    return this.applyToTextFields(content, clean);
  }

  private fixMarkdownStructure(content: any): any {
    if (!content.body) return content;

    let body = content.body;

    // Fix heading levels (H2 should not skip to H4)
    const headingRegex = /^(#{1,6})\s/gm;
    const headings = [...body.matchAll(headingRegex)];
    
    let lastLevel = 0;
    for (const match of headings) {
      const level = match[1].length;
      if (level > lastLevel + 1 && lastLevel > 0) {
        // Skip detected, fix it
        const fixedHeading = '#'.repeat(lastLevel + 1) + match[0].slice(level);
        body = body.replace(match[0], fixedHeading);
        this.addIssue('markdown', 'warning', `Fixed heading level skip: H${level} → H${lastLevel + 1}`, true);
        this.fixedCount++;
      }
      lastLevel = level;
    }

    // Remove empty headings
    body = body.replace(/^#{1,6}\s*$/gm, '');

    content.body = body;
    return content;
  }

  private removeDuplicates(content: any): any {
    if (!content.body) return content;

    const paragraphs = content.body.split('\n\n');
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const para of paragraphs) {
      const normalized = para.trim().toLowerCase();
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        unique.push(para);
      } else if (seen.has(normalized)) {
        this.addIssue('duplicate', 'warning', 'Removed duplicate paragraph', true);
        this.fixedCount++;
      }
    }

    content.body = unique.join('\n\n');
    return content;
  }

  private fixChinesePunctuation(content: any): any {
    const fix = (text: string): string => {
      let result = text;
      // Fix common English punctuation in Chinese text
      result = result.replace(/,\s*/g, '，');
      result = result.replace(/\.\s*/g, '。');
      result = result.replace(/!\s*/g, '！');
      result = result.replace(/\?\s*/g, '？');
      result = result.replace(/;\s*/g, '；');
      result = result.replace(/:\s*/g, '：');
      return result;
    };

    return this.applyToTextFields(content, fix);
  }

  private cleanInternalLinks(content: any): any {
    if (!content.internalLinks) return content;

    const validLinks = content.internalLinks.filter((link: any) => {
      if (!link.url) {
        this.addIssue('internal-link', 'error', 'Link missing URL', true);
        this.fixedCount++;
        return false;
      }
      if (!link.url.startsWith('/') && !link.url.startsWith('http')) {
        this.addIssue('internal-link', 'error', `Invalid link URL: ${link.url}`, true);
        this.fixedCount++;
        return false;
      }
      if (!link.title) {
        this.addIssue('internal-link', 'warning', 'Link missing title', false);
        return true; // Keep but warn
      }
      return true;
    });

    content.internalLinks = validLinks;
    return content;
  }

  private cleanSources(content: any): any {
    if (!content.sources) return content;

    const validSources = content.sources.filter((source: any) => {
      if (!source.title) {
        this.addIssue('source', 'error', 'Source missing title', true);
        this.fixedCount++;
        return false;
      }
      if (source.url && !source.url.startsWith('http')) {
        this.addIssue('source', 'warning', `Source URL may be invalid: ${source.url}`, false);
        return true; // Keep but warn
      }
      return true;
    });

    content.sources = validSources;
    return content;
  }

  private ensureFaqMinimum(content: any): any {
    if (!content.faq) {
      content.faq = [];
    }

    if (content.faq.length < this.contract.minFaqCount) {
      // For Topic: generate FAQ from blocks/subtopics before reporting error
      if (this.contract.type === 'topic') {
        const generatedFaq = this.generateTopicFaqFromContent(content);
        if (generatedFaq.length > 0) {
          content.faq = [...content.faq, ...generatedFaq];
          this.addIssue('faq', 'info', `Generated ${generatedFaq.length} FAQ from Topic content`, true);
          this.fixedCount++;
        }
      }
      
      if (content.faq.length < this.contract.minFaqCount) {
        this.addIssue(
          'faq',
          'error',
          `FAQ count ${content.faq.length} below minimum ${this.contract.minFaqCount}`,
          false
        );
      }
    }

    // Remove empty FAQs
    content.faq = content.faq.filter((item: any) => {
      if (!item.question || !item.answer) {
        this.addIssue('faq', 'error', 'FAQ missing question or answer', true);
        this.fixedCount++;
        return false;
      }
      return true;
    });

    return content;
  }

  // ============================================================================
  // Topic-Specific Normalization
  // ============================================================================

  /**
   * Normalize Topic-specific structure:
   * - hero string → {headline, subheadline, description}
   * - hero aliases (title/subtitle/summary) → standard fields
   * - Generate FAQ from blocks/subtopics if missing
   */
  private normalizeTopicStructure(content: any): any {
    // Hero normalization
    content = this.normalizeTopicHero(content);
    return content;
  }

  /**
   * Normalize Topic hero to {headline, subheadline, description}
   * 
   * Supports:
   * - hero: "string" → {headline: string, subheadline: "", description: string}
   * - hero: {title, subtitle, summary} → {headline, subheadline, description}
   * - hero: {headline, subheadline, description} → as-is
   */
  private normalizeTopicHero(content: any): any {
    if (!content.hero) {
      // Try to construct hero from topic title
      const title = content.title || '';
      if (title) {
        content.hero = {
          headline: title,
          subheadline: '',
          description: title,
        };
        this.addIssue('topic-hero', 'info', 'Constructed hero from title', true);
        this.fixedCount++;
      }
      return content;
    }

    // Case 1: hero is a string
    if (typeof content.hero === 'string') {
      const heroStr = content.hero.trim();
      if (heroStr) {
        // Split into headline and description if long enough
        const parts = heroStr.split(/[——\\-–—]/);
        const headline = parts[0]?.trim() || heroStr;
        const description = parts.slice(1).join('——').trim() || heroStr;
        
        // Ensure subheadline is never empty - use first 20 chars of headline or a default
        const subheadline = headline.length > 30 ? headline.substring(0, 20) + '...' : headline;
        
        content.hero = {
          headline,
          subheadline,
          description: description !== headline ? description : heroStr,
        };
        this.addIssue('topic-hero', 'info', 'Normalized hero string to object', true);
        this.fixedCount++;
      }
      return content;
    }

    // Case 2: hero is an object with aliases
    if (typeof content.hero === 'object') {
      const hero = content.hero;
      
      // headline resolution
      const headline = hero.headline || hero.title || hero.name || hero['标题'] || '';
      
      // subheadline resolution
      const subheadline = hero.subheadline || hero.subtitle || hero['副标题'] || '';
      
      // description resolution
      const description = hero.description || hero.summary || hero['描述'] || hero['简介'] || '';
      
      // Only overwrite if we resolved something
      if (headline || subheadline || description) {
        content.hero = {
          headline: headline || (content.title || ''),
          subheadline: subheadline || headline || '',
          description: description || headline || '',
        };
        this.addIssue('topic-hero', 'info', 'Normalized hero field aliases', true);
        this.fixedCount++;
      }
    }

    return content;
  }

  /**
   * Generate FAQ from Topic blocks and subtopics (deterministic, no fabrication)
   */
  private generateTopicFaqFromContent(content: any): any[] {
    const faqs: any[] = [];
    const title = content.title || '';
    const subtopics = content.subtopics || [];
    const blocks = content.blockConfiguration || content.blocks || [];
    const relatedTools = content.relatedTools || [];
    const relatedGuides = content.relatedGuides || [];

    // Generate FAQ from subtopics
    if (subtopics.length > 0) {
      const subtopicNames = subtopics.map((s: any) => s.title || s.name).filter(Boolean);
      if (subtopicNames.length >= 2) {
        faqs.push({
          question: `这个专题涵盖了哪些主要内容？`,
          answer: `本专题涵盖了${subtopicNames.slice(0, 3).join('、')}等核心内容，为您提供全面的信息和实用指南。`,
        });
      }
    }

    // Generate FAQ from blocks
    const faqBlock = blocks.find((b: any) => b.type === 'faq');
    if (faqBlock && faqBlock.content) {
      faqs.push({
        question: '有哪些常见问题？',
        answer: typeof faqBlock.content === 'string' ? faqBlock.content : JSON.stringify(faqBlock.content),
      });
    }

    // Generate FAQ from related tools
    if (relatedTools.length > 0) {
      const toolNames = relatedTools.map((t: any) => t.title || t.name).filter(Boolean);
      if (toolNames.length > 0) {
        faqs.push({
          question: `有哪些实用工具可以使用？`,
          answer: `我们推荐了${toolNames.slice(0, 3).join('、')}等实用工具，帮助您更高效地完成相关操作。`,
        });
      }
    }

    // Generate FAQ from related guides
    if (relatedGuides.length > 0) {
      const guideNames = relatedGuides.map((g: any) => g.title).filter(Boolean);
      if (guideNames.length > 0) {
        faqs.push({
          question: `有哪些相关指南可以参考？`,
          answer: `我们整理了${guideNames.slice(0, 3).join('、')}等详细指南，帮助您深入了解相关内容。`,
        });
      }
    }

    // Generic FAQ from title if still not enough
    if (faqs.length < 3 && title) {
      faqs.push({
        question: `这个专题适合哪些人？`,
        answer: `本专题适合对${title.replace(/[专题页面]/g, '').trim() || '相关内容'}感兴趣的海外华人和留学生，无论您是初学者还是有一定经验，都能从中获得有价值的信息。`,
      });
    }

    if (faqs.length < 3 && title) {
      faqs.push({
        question: `如何获取最新信息？`,
        answer: `建议您收藏本专题页面，并关注相关官方网站获取最新动态。内容会定期更新以确保信息的准确性和时效性。`,
      });
    }

    return faqs.slice(0, 5); // Cap at 5 to avoid over-generation
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  private applyToTextFields(content: any, transform: (text: string) => string): any {
    const result = { ...content };

    // Apply to body
    if (result.body) {
      result.body = transform(result.body);
    }

    // Apply to summary
    if (result.summary) {
      result.summary = transform(result.summary);
    }

    // Apply to FAQ
    if (result.faq) {
      result.faq = result.faq.map((item: any) => ({
        ...item,
        question: item.question ? transform(item.question) : item.question,
        answer: item.answer ? transform(item.answer) : item.answer,
      }));
    }

    return result;
  }

  private addIssue(
    type: string,
    severity: 'error' | 'warning' | 'info',
    description: string,
    fixed: boolean
  ) {
    this.issues.push({ type, severity, description, fixed });
  }
}

/**
 * Normalize content for a given content type
 */
export function normalizeContent(contentType: ContentType, content: any): CleaningResult {
  const normalizer = new ContentNormalizer(contentType);
  return normalizer.clean(content);
}
