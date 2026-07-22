// ContentOps V1 — Staging Publish Adapter
// 只实现 staging 发布，production 保留关闭

import { ContentDraft, PublishResult, PublishTarget } from './types';
import { prisma } from '@/lib/prisma';

const PRODUCTION_PUBLISH_ENABLED = process.env.CONTENTOPS_PRODUCTION_PUBLISH_ENABLED === 'true';

export interface PublishAdapterConfig {
  target: PublishTarget;
  stagingUrl: string;
  productionUrl: string;
}

const DEFAULT_CONFIG: PublishAdapterConfig = {
  target: 'staging',
  stagingUrl: process.env.CONTENTOPS_STAGING_URL || 'https://i.jueshi.net',
  productionUrl: process.env.CONTENTOPS_PRODUCTION_URL || 'https://jueshi.net',
};

/**
 * Publish content to target environment
 * Production is locked unless explicitly enabled via env var
 */
export async function publishToEnvironment(
  draft: ContentDraft,
  config: PublishAdapterConfig = DEFAULT_CONFIG
): Promise<PublishResult> {
  const timestamp = new Date();

  // Production lock check
  if (draft.targetEnvironment === 'production' && !PRODUCTION_PUBLISH_ENABLED) {
    return {
      success: false,
      error: 'Production publish is DISABLED. Set CONTENTOPS_PRODUCTION_PUBLISH_ENABLED=true to enable.',
      timestamp,
    };
  }

  // Determine target URL
  const baseUrl = draft.targetEnvironment === 'production' 
    ? config.productionUrl 
    : config.stagingUrl;

  try {
    // For staging: create/update content via API
    if (draft.targetEnvironment === 'staging') {
      return await publishToStaging(draft, baseUrl);
    }

    // For production: would need separate implementation
    return {
      success: false,
      error: 'Production publish adapter not implemented',
      timestamp,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown publish error',
      timestamp,
    };
  }
}

/**
 * Publish to staging environment
 * Uses idempotency key to prevent duplicate publishes
 */
async function publishToStaging(
  draft: ContentDraft,
  baseUrl: string
): Promise<PublishResult> {
  const timestamp = new Date();

  // Idempotency check: if already published with same key, return existing
  if (draft.publishedUrl && draft.version === draft.version) {
    // Check if URL is still valid
    const isValid = await verifyPublishedUrl(draft.publishedUrl);
    if (isValid) {
      return {
        success: true,
        url: draft.publishedUrl,
        contentId: draft.id,
        version: draft.version,
        timestamp,
      };
    }
  }

  // Route to content-type specific publisher
  switch (draft.contentType) {
    case 'guide':
      return await publishGuide(draft, baseUrl, timestamp);
    case 'topic':
      return await publishTopic(draft, baseUrl, timestamp);
    case 'checklist':
      return await publishChecklist(draft, baseUrl, timestamp);
    default:
      return {
        success: false,
        error: `Unsupported content type: ${draft.contentType}`,
        timestamp,
      };
  }
}

/**
 * Publish Guide to staging
 * Creates real Guide record in database
 */
async function publishGuide(
  draft: ContentDraft,
  baseUrl: string,
  timestamp: Date
): Promise<PublishResult> {
  try {
    // Generate stable slug for staging
    const slug = draft.slug || `contentops-${draft.id.replace(/[^a-z0-9]/g, '-').toLowerCase()}`;
    
    // Check if guide already exists (idempotency)
    // Note: Idempotency is managed at Draft Manager level via publishRecord
    // This adapter only creates the Guide record
    const existingGuide = await prisma.guide.findUnique({ where: { slug } });
    if (existingGuide) {
      // Guide with same slug exists - this should not happen if Draft Manager
      // properly checks publishRecord before calling publish
      return {
        success: false,
        error: 'CONTENTOPS_SLUG_CONFLICT: Guide with same slug already exists',
        timestamp,
      };
    }

    // Create new Guide record
    // Note: Only write fields that exist in the database schema
    // metadataJson column does not exist in staging database (migration not applied)
    const guide = await prisma.guide.create({
      data: {
        title: draft.title,
        slug,
        summary: draft.summary || '',
        body: draft.body || '',
        category: 'general',
        tags: [],
        relatedTools: [],
        relatedTopics: [],
        relatedChecklists: [],
        relatedGuides: [],
        status: 'published',
        author: 'ContentOps Bot',
        seoTitle: draft.seoTitle || draft.title,
        seoDescription: draft.seoDescription || draft.summary || '',
        robots: 'noindex,nofollow', // Staging: noindex
        sortOrder: 0,
        publishedAt: timestamp,
      },
    });

    return {
      success: true,
      url: `${baseUrl}/guides/${slug}`,
      contentId: guide.id,
      version: draft.version,
      timestamp,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to publish guide: ${error.message}`,
      timestamp,
    };
  }
}

/**
 * Publish Topic to staging
 * Creates real Topic record in database via Bridge API
 */
async function publishTopic(
  draft: ContentDraft,
  baseUrl: string,
  timestamp: Date
): Promise<PublishResult> {
  try {
    // Generate stable slug for staging
    const slug = draft.slug || `topic-${draft.id.replace(/[^a-z0-9]/g, '-').toLowerCase()}`;
    
    // Check if topic already exists (idempotency)
    const existingTopic = await prisma.topic.findUnique({ where: { slug } });
    if (existingTopic) {
      return {
        success: false,
        error: 'CONTENTOPS_SLUG_CONFLICT: Topic with same slug already exists',
        timestamp,
      };
    }

    // Extract content from draft qualityMetadata or body
    const qm = (draft as any).qualityMetadata || {};
    const content = qm.originalContent || {};
    
    // Build items from subtopics/related content
    const topicItems = [];
    const subtopics = content.subtopics || [];
    for (let i = 0; i < subtopics.length; i++) {
      const sub = subtopics[i];
      topicItems.push({
        name: sub.title || '',
        description: sub.description || '',
        category: sub.type || 'resource',
        officialUrl: sub.url || '',
        sortOrder: i,
      });
    }
    
    // Build sections from hero, FAQ, CTA
    const topicSections = [];
    let sectionOrder = 0;
    
    if (content.hero) {
      topicSections.push({
        type: 'intro',
        title: content.hero.headline || draft.title,
        content: content.hero.description || draft.summary || '',
        sortOrder: sectionOrder++,
      });
    }
    
    if (content.faq && content.faq.length > 0) {
      topicSections.push({
        type: 'faq',
        title: '常见问题',
        content: JSON.stringify(content.faq),
        sortOrder: sectionOrder++,
      });
    }
    
    if (content.cta) {
      topicSections.push({
        type: 'cta',
        title: content.cta.text || '了解更多',
        content: content.cta.url || '',
        sortOrder: sectionOrder++,
      });
    }
    
    // Build metadata
    const metadataJson = {
      taskId: draft.id,
      contentType: 'topic',
      source: 'contentops-publish-adapter',
      originalContent: content,
      subtopicCount: subtopics.length,
      faqCount: content.faq?.length || 0,
      sourceFactCount: content.sources?.length || 0,
      internalLinkCount: content.internalLinks?.length || 0,
      blockConfiguration: content.blockConfiguration || {
        hero: !!content.hero,
        tools: (content.relatedTools || []).length > 0,
        guides: (content.relatedGuides || []).length > 0,
        checklists: (content.relatedChecklists || []).length > 0,
        officialResources: (content.relatedResources || []).length > 0,
        faq: (content.faq || []).length > 0,
        internalLinks: (content.internalLinks || []).length > 0,
      },
    };

    // Create new Topic record
    const topic = await prisma.topic.create({
      data: {
        title: draft.title,
        slug,
        subtitle: content.hero?.subheadline || '',
        summary: draft.summary || '',
        status: 'published',
        templateType: 'rating_list',
        heroBadges: content.heroBadges || [],
        suitableFor: content.audience ? [content.audience] : [],
        tags: content.seo?.keywords || [],
        seoTitle: content.seo?.title || draft.seoTitle || draft.title,
        seoDescription: content.seo?.description || draft.seoDescription || '',
        metadataJson: metadataJson as any,
        publishedAt: timestamp,
        items: {
          create: topicItems.map(item => ({
            name: item.name,
            description: item.description,
            category: item.category,
            officialUrl: item.officialUrl,
            sortOrder: item.sortOrder,
          })),
        },
        sections: {
          create: topicSections.map(section => ({
            type: section.type,
            title: section.title,
            content: section.content,
            sortOrder: section.sortOrder,
          })),
        },
      },
      include: {
        items: true,
        sections: true,
      },
    });

    return {
      success: true,
      url: `${baseUrl}/topics/${slug}`,
      contentId: topic.id,
      version: draft.version,
      timestamp,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to publish topic: ${error.message}`,
      timestamp,
    };
  }
}

/**
 * Publish Checklist to staging (placeholder)
 */
async function publishChecklist(
  draft: ContentDraft,
  baseUrl: string,
  timestamp: Date
): Promise<PublishResult> {
  return {
    success: false,
    error: 'Checklist publishing not yet implemented',
    timestamp,
  };
}

/**
 * Get the public URL path for a content draft
 */
function getContentPath(draft: ContentDraft): string {
  switch (draft.contentType) {
    case 'guide':
      return `/guides/${draft.slug}`;
    case 'topic':
      return `/topics/${draft.slug}`;
    case 'checklist':
      return `/checklists/${draft.slug}`;
    default:
      return `/content/${draft.slug}`;
  }
}

/**
 * Verify a published URL is accessible
 */
async function verifyPublishedUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check if production publish is allowed
 */
export function isProductionPublishAllowed(): boolean {
  return PRODUCTION_PUBLISH_ENABLED;
}

/**
 * Get publish status message
 */
export function getPublishStatusMessage(target: PublishTarget): string {
  if (target === 'production' && !PRODUCTION_PUBLISH_ENABLED) {
    return '🔒 Production publish is DISABLED';
  }
  if (target === 'staging') {
    return '✅ Staging publish is ENABLED';
  }
  return '❓ Unknown target';
}
