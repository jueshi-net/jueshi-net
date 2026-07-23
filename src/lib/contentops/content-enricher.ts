/**
 * Content Enricher — Deterministic metadata generation
 * 
 * Responsibility: Fill in system-owned fields that the AI model should NOT generate.
 * 
 * Model owns: contentType, body/content, audience, steps/pitfalls/groups/blocks, FAQ candidates, source candidates
 * System owns: title, slug, summary, seo, geo, canonical, internalLinks, JSON-LD, timestamps
 */

import type { ContentType } from './contracts/content-types';

export interface EnricherInput {
  // From model
  contentType: ContentType;
  title?: string;
  body?: string;
  content?: any;
  audience?: string;
  summary?: string;
  seo?: any;
  geo?: any;
  sources?: any[];
  faq?: any[];
  internalLinks?: any[];
  steps?: string[];
  pitfalls?: string[];
  groups?: any[];
  blocks?: any[];
  
  // From task
  taskId?: string;
  topic?: string;
  targetAudience?: string;
  targetEnvironment?: string;
}

export interface EnrichedOutput {
  title: string;
  slug: string;
  summary: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  geo: {
    targetCountry: string;
    targetAudience: string;
    searchIntent: string;
  };
  canonicalUrl: string;
  internalLinks: any[];
  sources: any[];
  faq: any[];
  structuredData: any;
  factVerificationStatus: 'complete' | 'incomplete' | 'partial';
}

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\u4e00-\u9fff]/g, '') // Remove Chinese chars
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60) || `content-${Date.now().toString(36)}`;
}

/**
 * Generate summary from body text
 */
function generateSummary(body: string, maxLength: number = 200): string {
  if (!body) return '';
  
  // Remove markdown headers and formatting
  const cleanText = body
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  
  // Take first sentence or up to maxLength
  const firstSentence = cleanText.split(/[。！？.!?]/)[0];
  if (firstSentence && firstSentence.length <= maxLength) {
    return firstSentence;
  }
  
  return cleanText.substring(0, maxLength).replace(/[,，]?\s*$/, '') + '...';
}

/**
 * Extract keywords from content
 */
function extractKeywords(title: string, body: string, count: number = 5): string[] {
  const text = `${title} ${body}`;
  
  // Extract Chinese words (simplified)
  const chineseWords = text.match(/[\u4e00-\u9fff]{2,4}/g) || [];
  
  // Count frequency
  const freq: Record<string, number> = {};
  for (const word of chineseWords) {
    freq[word] = (freq[word] || 0) + 1;
  }
  
  // Sort by frequency and return top N
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

/**
 * Generate internal links based on content type and topic
 */
function generateInternalLinks(contentType: ContentType, topic: string): any[] {
  const links: any[] = [];
  
  // Add relevant tool links based on content type
  if (contentType === 'guide' || contentType === 'topic') {
    links.push({
      url: '/tools/shipping-calculator',
      title: '运费计算器',
      reason: '相关工具推荐'
    });
    links.push({
      url: '/tools/hs-code',
      title: 'HS编码查询',
      reason: '相关工具推荐'
    });
    links.push({
      url: '/tools/package-dimensions',
      title: '包裹尺寸计算器',
      reason: '相关工具推荐'
    });
  }
  
  if (contentType === 'checklist') {
    links.push({
      url: '/guides/international-shipping-documents',
      title: '国际运输文件指南',
      reason: '相关指南推荐'
    });
    links.push({
      url: '/guides/customs-clearance',
      title: '海关清关指南',
      reason: '相关指南推荐'
    });
    links.push({
      url: '/guides/packaging-best-practices',
      title: '包装最佳实践',
      reason: '相关指南推荐'
    });
  }
  
  return links.slice(0, 5);
}

/**
 * Generate JSON-LD structured data
 */
function generateJsonLd(contentType: ContentType, title: string, summary: string, canonicalUrl: string): any {
  const baseSchema = {
    '@context': 'https://schema.org',
    'headline': title,
    'description': summary,
    'url': canonicalUrl,
  };
  
  if (contentType === 'guide') {
    return {
      ...baseSchema,
      '@type': 'HowTo',
    };
  }
  
  if (contentType === 'checklist') {
    return {
      ...baseSchema,
      '@type': 'ItemList',
    };
  }
  
  if (contentType === 'topic') {
    return {
      ...baseSchema,
      '@type': 'CollectionPage',
    };
  }
  
  return baseSchema;
}

/**
 * Main enrichment function
 */
export function enrichContent(input: EnricherInput): EnrichedOutput {
  const { contentType, title, body, content, audience, summary, seo, geo, sources, faq, internalLinks, taskId, topic, targetAudience, targetEnvironment } = input;
  
  // Title resolution: prefer model title, fallback to topic
  const resolvedTitle = title || topic || `内容-${Date.now().toString(36)}`;
  
  // Slug generation: system-generated from title
  const slug = generateSlug(resolvedTitle);
  
  // Summary generation: prefer model summary, fallback to body extraction
  const resolvedSummary = summary || (body ? generateSummary(body) : '');
  
  // SEO metadata generation
  const keywords = seo?.keywords || extractKeywords(resolvedTitle, body || '');
  const resolvedSeo = {
    title: seo?.title || resolvedTitle,
    description: seo?.description || resolvedSummary.substring(0, 160),
    keywords: keywords,
  };
  
  // Geo metadata generation
  const resolvedGeo = {
    targetCountry: geo?.targetCountry || '中国',
    targetAudience: geo?.targetAudience || targetAudience || audience || '海外华人',
    searchIntent: geo?.searchIntent || 'informational',
  };
  
  // Canonical URL generation
  const domain = targetEnvironment === 'production' ? 'jueshi.net' : 'i.jueshi.net';
  const typePath = contentType === 'guide' ? 'guides' : contentType === 'checklist' ? 'checklists' : 'topics';
  const canonicalUrl = `https://${domain}/${typePath}/${slug}`;
  
  // Internal links generation
  const resolvedInternalLinks = internalLinks?.length ? internalLinks : generateInternalLinks(contentType, topic || '');
  
  // Sources handling: keep model sources, mark as incomplete if empty
  const resolvedSources = sources || [];
  const factVerificationStatus = resolvedSources.length > 0 ? 'complete' : 'incomplete';
  
  // FAQ handling: keep model FAQ, or generate minimum for checklist
  let resolvedFaq = faq || [];
  if (resolvedFaq.length < 3 && contentType === 'checklist') {
    // Generate minimum FAQ for checklist if model didn't provide enough
    resolvedFaq = [
      {
        question: '这个检查清单适用于哪些场景？',
        answer: '本检查清单适用于首次使用国际集运服务的海外华人和留学生，涵盖了从准备到收货的完整流程。'
      },
      {
        question: '检查清单中的项目是否都是必填的？',
        answer: '检查清单中标记为"必填"的项目是必须完成的，标记为"选填"的项目可以根据个人情况决定是否执行。'
      },
      {
        question: '如何确保不会遗漏重要步骤？',
        answer: '建议按照检查清单的顺序逐项执行，每完成一项就打勾确认。对于重要文件和信息，建议做好备份。'
      }
    ];
  }
  
  // JSON-LD generation
  const structuredData = generateJsonLd(contentType, resolvedTitle, resolvedSummary, canonicalUrl);
  
  return {
    title: resolvedTitle,
    slug,
    summary: resolvedSummary,
    seo: resolvedSeo,
    geo: resolvedGeo,
    canonicalUrl,
    internalLinks: resolvedInternalLinks,
    sources: resolvedSources,
    faq: resolvedFaq,
    structuredData,
    factVerificationStatus,
  };
}

/**
 * Merge enriched metadata with model content
 */
export function mergeEnrichedContent(modelOutput: any, enriched: EnrichedOutput, taskMeta?: { executionMode?: string }): any {
  return {
    ...modelOutput,
    title: enriched.title,
    slug: enriched.slug,
    summary: enriched.summary,
    seo: enriched.seo,
    geo: enriched.geo,
    canonicalUrl: enriched.canonicalUrl,
    internalLinks: enriched.internalLinks,
    sources: enriched.sources,
    faq: enriched.faq,
    structuredData: enriched.structuredData,
    factVerificationStatus: enriched.factVerificationStatus,
    executionMode: taskMeta?.executionMode || 'draft_only',
  };
}
