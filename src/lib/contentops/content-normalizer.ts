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
      this.addIssue(
        'faq',
        'error',
        `FAQ count ${content.faq.length} below minimum ${this.contract.minFaqCount}`,
        false
      );
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
