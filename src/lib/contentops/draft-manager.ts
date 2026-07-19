// ContentOps V1 — Draft Manager
// 持久化草稿管理，使用 Article 模型 + metadata

import { prisma } from '@/lib/prisma';
import { 
  ContentDraft, 
  ContentState, 
  ContentType, 
  canTransition,
  QUALITY_THRESHOLDS,
  AuditEntry,
} from './types';
import { checkContentQuality, calculateSeoScore, calculateGeoScore } from './quality-checker';
import { createHash } from 'crypto';

/**
 * Generate idempotency publish key
 */
function generatePublishKey(draftId: string, version: number): string {
  return createHash('sha256')
    .update(`${draftId}:v${version}`)
    .digest('hex')
    .slice(0, 32);
}

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

/**
 * Create a new content draft
 */
export async function createDraft(params: {
  title: string;
  contentType: ContentType;
  summary?: string;
  body?: string;
  createdBy: string;
}): Promise<ContentDraft> {
  const slug = generateSlug(params.title);
  const version = 1;
  const publishKey = generatePublishKey('new', version);

  const article = await prisma.article.create({
    data: {
      title: params.title,
      slug: `${slug}-${Date.now().toString(36)}`,
      content: params.body || '',
      excerpt: params.summary || '',
      status: 'draft',
      author: params.createdBy,
      category: params.contentType,
      metadataJson: {
        contentOps: {
          state: 'DRAFT' as ContentState,
          version,
          publishKey,
          createdBy: params.createdBy,
          updatedBy: params.createdBy,
          targetEnvironment: 'staging',
          publishRetries: 0,
          qualityScore: 0,
          seoScore: 0,
          geoScore: 0,
        },
      },
    },
  });

  return mapArticleToDraft(article);
}

/**
 * Get a draft by ID
 */
export async function getDraft(id: string): Promise<ContentDraft | null> {
  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) return null;
  return mapArticleToDraft(article);
}

/**
 * Get draft by slug
 */
export async function getDraftBySlug(slug: string): Promise<ContentDraft | null> {
  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article) return null;
  return mapArticleToDraft(article);
}

/**
 * List drafts with optional filters
 */
export async function listDrafts(params: {
  state?: ContentState;
  contentType?: ContentType;
  createdBy?: string;
  limit?: number;
  offset?: number;
}): Promise<{ drafts: ContentDraft[]; total: number }> {
  const where: any = {};
  
  if (params.state) {
    where.metadataJson = {
      path: ['contentOps', 'state'],
      equals: params.state,
    };
  }
  
  if (params.contentType) {
    where.category = params.contentType;
  }
  
  if (params.createdBy) {
    where.author = params.createdBy;
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: params.limit || 50,
      skip: params.offset || 0,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    drafts: articles.map(mapArticleToDraft),
    total,
  };
}

/**
 * Update draft content
 */
export async function updateDraftContent(
  id: string,
  updates: {
    title?: string;
    summary?: string;
    body?: string;
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
    faq?: Array<{ question: string; answer: string }>;
    updatedBy: string;
  }
): Promise<ContentDraft | null> {
  const existing = await getDraft(id);
  if (!existing) return null;

  const newVersion = existing.version + 1;
  const publishKey = generatePublishKey(id, newVersion);

  const metadataUpdate = {
    ...((existing as any).metadataJson || {}),
    contentOps: {
      ...(existing as any).metadataJson?.contentOps || {},
      version: newVersion,
      publishKey,
      updatedBy: updates.updatedBy,
      updatedAt: new Date().toISOString(),
    },
  };

  // Add optional fields to metadata
  if (updates.seoTitle) metadataUpdate.contentOps.seoTitle = updates.seoTitle;
  if (updates.seoDescription) metadataUpdate.contentOps.seoDescription = updates.seoDescription;
  if (updates.keywords) metadataUpdate.contentOps.keywords = updates.keywords;
  if (updates.faq) metadataUpdate.contentOps.faq = updates.faq;

  const article = await prisma.article.update({
    where: { id },
    data: {
      title: updates.title,
      excerpt: updates.summary,
      content: updates.body,
      seoTitle: updates.seoTitle,
      seoDescription: updates.seoDescription,
      metadataJson: metadataUpdate,
    },
  });

  return mapArticleToDraft(article);
}

/**
 * Transition draft state
 */
export async function transitionDraftState(
  id: string,
  toState: ContentState,
  actor: string,
  comment?: string
): Promise<ContentDraft | null> {
  const existing = await getDraft(id);
  if (!existing) return null;

  // Validate transition
  if (!canTransition(existing.state, toState)) {
    throw new Error(`Invalid state transition: ${existing.state} → ${toState}`);
  }

  // Quality gate for certain transitions
  if (toState === 'APPROVED' || toState === 'PUBLISHING') {
    const qualityCheck = await runQualityCheck(id);
    if (!qualityCheck.passed) {
      throw new Error(`Quality gate failed: ${qualityCheck.issues.join(', ')}`);
    }
  }

  const metadataUpdate = {
    ...((existing as any).metadataJson || {}),
    contentOps: {
      ...(existing as any).metadataJson?.contentOps || {},
      state: toState,
      updatedBy: actor,
      updatedAt: new Date().toISOString(),
      ...(toState === 'APPROVED' && {
        reviewedBy: actor,
        reviewedAt: new Date().toISOString(),
        reviewComment: comment,
      }),
    },
  };

  const article = await prisma.article.update({
    where: { id },
    data: {
      status: mapStateToArticleStatus(toState),
      metadataJson: metadataUpdate,
      ...(toState === 'PUBLISHED' && { publishedAt: new Date() }),
    },
  });

  // Write audit log
  await writeAuditLog({
    draftId: id,
    action: 'state_transition',
    fromState: existing.state,
    toState,
    actor,
    metadata: comment ? { comment } : undefined,
  });

  return mapArticleToDraft(article);
}

/**
 * Run quality check on draft
 */
export async function runQualityCheck(id: string): Promise<{
  passed: boolean;
  score: number;
  seoScore: number;
  geoScore: number;
  issues: string[];
}> {
  const draft = await getDraft(id);
  if (!draft) throw new Error('Draft not found');

  const qualityResult = checkContentQuality({
    title: draft.title,
    summary: draft.summary,
    body: draft.body,
    contentType: draft.contentType,
    seoTitle: draft.seoTitle || draft.title,
    seoDescription: draft.seoDescription || draft.summary,
    faq: draft.faq,
    internalLinks: draft.internalLinks,
    sourceFacts: draft.sourceFacts,
  });

  const seoScore = calculateSeoScore({
    title: draft.title,
    summary: draft.summary,
    contentType: draft.contentType,
    seoTitle: draft.seoTitle || draft.title,
    seoDescription: draft.seoDescription || draft.summary,
  });

  const geoScore = calculateGeoScore({
    title: draft.title,
    contentType: draft.contentType,
    faq: draft.faq,
    internalLinks: draft.internalLinks,
  });

  // Update draft with scores
  const metadataUpdate = {
    ...((draft as any).metadataJson || {}),
    contentOps: {
      ...(draft as any).metadataJson?.contentOps || {},
      qualityScore: qualityResult.score,
      seoScore,
      geoScore,
      qualityIssues: qualityResult.issues.map(i => ({
        type: i.type,
        severity: i.severity,
        message: i.message,
      })),
      qualityCheckedAt: new Date().toISOString(),
    },
  };

  await prisma.article.update({
    where: { id },
    data: { metadataJson: metadataUpdate },
  });

  const errors = qualityResult.issues.filter(i => i.severity === 'error');
  const passed = errors.length <= QUALITY_THRESHOLDS.maxIssues 
    && qualityResult.score >= QUALITY_THRESHOLDS.minQualityScore
    && seoScore >= QUALITY_THRESHOLDS.minSeoScore;

  return {
    passed,
    score: qualityResult.score,
    seoScore,
    geoScore,
    issues: errors.map(i => i.message),
  };
}

/**
 * Record publish result
 */
export async function recordPublishResult(
  id: string,
  result: {
    success: boolean;
    url?: string;
    error?: string;
  }
): Promise<void> {
  const draft = await getDraft(id);
  if (!draft) return;

  const metadataUpdate = {
    ...((draft as any).metadataJson || {}),
    contentOps: {
      ...(draft as any).metadataJson?.contentOps || {},
      state: result.success ? 'PUBLISHED' : 'FAILED',
      publishedUrl: result.url,
      publishError: result.error,
      publishRetries: result.success ? 0 : draft.publishRetries + 1,
      publishedAt: result.success ? new Date().toISOString() : undefined,
    },
  };

  await prisma.article.update({
    where: { id },
    data: {
      status: result.success ? 'published' : 'draft',
      metadataJson: metadataUpdate,
      ...(result.success && { publishedAt: new Date() }),
    },
  });
}

/**
 * Write audit log entry
 */
async function writeAuditLog(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void> {
  // Store in metadata of a special "audit" article, or use a separate table
  // For now, log to console and file
  console.log('[ContentOps Audit]', JSON.stringify({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...entry,
  }));
}

/**
 * Map Article model to ContentDraft
 */
function mapArticleToDraft(article: any): ContentDraft {
  const contentOps = article.metadataJson?.contentOps || {};
  
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    contentType: (article.category as ContentType) || 'guide',
    state: contentOps.state || 'DRAFT',
    summary: article.excerpt || '',
    body: article.content || '',
    seoTitle: article.seoTitle || contentOps.seoTitle,
    seoDescription: article.seoDescription || contentOps.seoDescription,
    keywords: contentOps.keywords,
    faq: contentOps.faq,
    internalLinks: contentOps.internalLinks,
    sourceFacts: contentOps.sourceFacts,
    qualityScore: contentOps.qualityScore,
    seoScore: contentOps.seoScore,
    geoScore: contentOps.geoScore,
    qualityIssues: contentOps.qualityIssues,
    version: contentOps.version || 1,
    publishKey: contentOps.publishKey || '',
    createdBy: contentOps.createdBy || article.author || 'unknown',
    updatedBy: contentOps.updatedBy || article.author || 'unknown',
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    targetEnvironment: contentOps.targetEnvironment || 'staging',
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : undefined,
    publishedUrl: contentOps.publishedUrl,
    publishError: contentOps.publishError,
    publishRetries: contentOps.publishRetries || 0,
    reviewedBy: contentOps.reviewedBy,
    reviewedAt: contentOps.reviewedAt ? new Date(contentOps.reviewedAt) : undefined,
    reviewComment: contentOps.reviewComment,
    scheduledAt: contentOps.scheduledAt ? new Date(contentOps.scheduledAt) : undefined,
  };
}

/**
 * Map ContentState to Article status
 */
function mapStateToArticleStatus(state: ContentState): string {
  switch (state) {
    case 'PUBLISHED':
      return 'published';
    case 'FAILED':
    case 'UNPUBLISHED':
    case 'ROLLED_BACK':
      return 'archived';
    default:
      return 'draft';
  }
}
