// ContentOps V1.1 — Draft Manager
// 持久化草稿管理，使用 Article 模型现有字段

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

// ============================================================================
// ContentOps Metadata Storage
// ============================================================================

// ContentOps metadata stored in seoDescription as JSON
// Format: { contentOps: {...}, originalSeoDescription: "..." }
interface ContentOpsMetadata {
  // Isolation markers
  contentOpsManaged: true;
  contentOpsDraftId: string;
  contentOpsStatus: ContentState;
  contentOpsVersion: number;
  targetEnvironment: 'staging' | 'production';
  // State machine
  state: ContentState;
  version: number;
  publishKey: string;
  createdBy: string;
  updatedBy: string;
  publishRetries: number;
  // Quality scores
  qualityScore: number;
  seoScore: number;
  geoScore: number;
  qualityIssues?: Array<{ type: string; severity: string; message: string }>;
  qualityCheckedAt?: string;
  // Review
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  // Publishing
  publishedUrl?: string;
  publishError?: string;
  publishedAt?: string;
  // Scheduling
  scheduledAt?: string;
  // Additional fields
  seoTitle?: string;
  keywords?: string[];
  faq?: Array<{ question: string; answer: string }>;
  internalLinks?: Array<{ url: string; title: string }>;
  sourceFacts?: Array<{ fact: string; source?: string }>;
}

function serializeMetadata(metadata: ContentOpsMetadata): string {
  return JSON.stringify({ contentOps: metadata });
}

function deserializeMetadata(json: string | null | undefined): ContentOpsMetadata | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    if (parsed.contentOps?.contentOpsManaged === true) {
      return parsed.contentOps;
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

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
 * Get category for ContentOps draft
 * Uses 'contentops-draft' prefix to distinguish from regular articles
 */
function getContentOpsCategory(contentType: ContentType): string {
  return `contentops-${contentType}`;
}

/**
 * Check if article is ContentOps managed
 */
function isContentOpsArticle(category: string | null): boolean {
  return category?.startsWith('contentops-') ?? false;
}

// ============================================================================
// Draft Operations
// ============================================================================

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
  const slug = `${generateSlug(params.title)}-${Date.now().toString(36)}`;
  const version = 1;
  const publishKey = generatePublishKey('new', version);

  const metadata: ContentOpsMetadata = {
    contentOpsManaged: true,
    contentOpsDraftId: 'pending',
    contentOpsStatus: 'DRAFT',
    contentOpsVersion: version,
    targetEnvironment: 'staging',
    state: 'DRAFT',
    version,
    publishKey,
    createdBy: params.createdBy,
    updatedBy: params.createdBy,
    publishRetries: 0,
    qualityScore: 0,
    seoScore: 0,
    geoScore: 0,
  };

  const article = await prisma.article.create({
    data: {
      title: params.title,
      slug,
      content: params.body || '',
      excerpt: params.summary || '',
      status: 'draft',
      author: params.createdBy,
      category: getContentOpsCategory(params.contentType),
      seoDescription: serializeMetadata(metadata),
    },
  });

  // Update metadata with actual ID
  metadata.contentOpsDraftId = article.id;
  
  await prisma.article.update({
    where: { id: article.id },
    data: { seoDescription: serializeMetadata(metadata) },
  });

  return mapArticleToDraft({ ...article, seoDescription: serializeMetadata(metadata) });
}

/**
 * Get a draft by ID
 */
export async function getDraft(id: string): Promise<ContentDraft | null> {
  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) return null;
  
  const metadata = deserializeMetadata(article.seoDescription);
  if (!metadata?.contentOpsManaged) return null;
  
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
  
  const metadata = deserializeMetadata(article.seoDescription);
  if (!metadata?.contentOpsManaged) return null;
  
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
  const where: any = {
    category: { startsWith: 'contentops-' },
  };
  
  if (params.contentType) {
    where.category = getContentOpsCategory(params.contentType);
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

  let drafts = articles.map(mapArticleToDraft);

  // Filter by state if specified (stored in metadata)
  if (params.state) {
    drafts = drafts.filter(d => d.state === params.state);
  }

  return { drafts, total };
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

  const existingMetadata = deserializeMetadata(
    (await prisma.article.findUnique({ where: { id }, select: { seoDescription: true } }))?.seoDescription
  );
  
  if (!existingMetadata) return null;

  const newVersion = existing.version + 1;
  const publishKey = generatePublishKey(id, newVersion);

  const updatedMetadata: ContentOpsMetadata = {
    ...existingMetadata,
    version: newVersion,
    publishKey,
    contentOpsVersion: newVersion,
    updatedBy: updates.updatedBy,
    seoTitle: updates.seoTitle || existingMetadata.seoTitle,
    keywords: updates.keywords || existingMetadata.keywords,
    faq: updates.faq || existingMetadata.faq,
  };

  const article = await prisma.article.update({
    where: { id },
    data: {
      title: updates.title,
      excerpt: updates.summary,
      content: updates.body,
      seoTitle: updates.seoTitle,
      seoDescription: serializeMetadata(updatedMetadata),
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

  const existingArticle = await prisma.article.findUnique({ 
    where: { id }, 
    select: { seoDescription: true } 
  });
  const existingMetadata = deserializeMetadata(existingArticle?.seoDescription);
  
  if (!existingMetadata) return null;

  const updatedMetadata: ContentOpsMetadata = {
    ...existingMetadata,
    state: toState,
    contentOpsStatus: toState,
    updatedBy: actor,
    ...(toState === 'APPROVED' && {
      reviewedBy: actor,
      reviewedAt: new Date().toISOString(),
      reviewComment: comment,
    }),
  };

  const article = await prisma.article.update({
    where: { id },
    data: {
      status: mapStateToArticleStatus(toState),
      seoDescription: serializeMetadata(updatedMetadata),
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
  const existingArticle = await prisma.article.findUnique({ 
    where: { id }, 
    select: { seoDescription: true } 
  });
  const existingMetadata = deserializeMetadata(existingArticle?.seoDescription);
  
  if (existingMetadata) {
    const updatedMetadata: ContentOpsMetadata = {
      ...existingMetadata,
      qualityScore: qualityResult.score,
      seoScore,
      geoScore,
      qualityIssues: qualityResult.issues.map(i => ({
        type: i.type,
        severity: i.severity,
        message: i.message,
      })),
      qualityCheckedAt: new Date().toISOString(),
    };

    await prisma.article.update({
      where: { id },
      data: { seoDescription: serializeMetadata(updatedMetadata) },
    });
  }

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

  const existingArticle = await prisma.article.findUnique({ 
    where: { id }, 
    select: { seoDescription: true } 
  });
  const existingMetadata = deserializeMetadata(existingArticle?.seoDescription);
  
  if (!existingMetadata) return;

  const updatedMetadata: ContentOpsMetadata = {
    ...existingMetadata,
    state: result.success ? 'PUBLISHED' : 'FAILED',
    contentOpsStatus: result.success ? 'PUBLISHED' : 'FAILED',
    publishedUrl: result.url,
    publishError: result.error,
    publishRetries: result.success ? 0 : draft.publishRetries + 1,
    publishedAt: result.success ? new Date().toISOString() : undefined,
  };

  await prisma.article.update({
    where: { id },
    data: {
      status: result.success ? 'published' : 'draft',
      seoDescription: serializeMetadata(updatedMetadata),
      ...(result.success && { publishedAt: new Date() }),
    },
  });
}

/**
 * Write audit log entry
 */
async function writeAuditLog(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void> {
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
  const metadata = deserializeMetadata(article.seoDescription);
  
  // Extract content type from category
  const category = article.category || '';
  const contentType = category.replace('contentops-', '') as ContentType;
  
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    contentType: contentType || 'guide',
    state: metadata?.state || 'DRAFT',
    summary: article.excerpt || '',
    body: article.content || '',
    seoTitle: article.seoTitle || metadata?.seoTitle,
    seoDescription: metadata ? undefined : article.seoDescription, // Real SEO desc if not ContentOps
    keywords: metadata?.keywords,
    faq: metadata?.faq,
    internalLinks: metadata?.internalLinks,
    sourceFacts: metadata?.sourceFacts,
    qualityScore: metadata?.qualityScore,
    seoScore: metadata?.seoScore,
    geoScore: metadata?.geoScore,
    qualityIssues: metadata?.qualityIssues,
    version: metadata?.version || 1,
    publishKey: metadata?.publishKey || '',
    createdBy: metadata?.createdBy || article.author || 'unknown',
    updatedBy: metadata?.updatedBy || article.author || 'unknown',
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    targetEnvironment: metadata?.targetEnvironment || 'staging',
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : undefined,
    publishedUrl: metadata?.publishedUrl,
    publishError: metadata?.publishError,
    publishRetries: metadata?.publishRetries || 0,
    reviewedBy: metadata?.reviewedBy,
    reviewedAt: metadata?.reviewedAt ? new Date(metadata.reviewedAt) : undefined,
    reviewComment: metadata?.reviewComment,
    scheduledAt: metadata?.scheduledAt ? new Date(metadata.scheduledAt) : undefined,
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

/**
 * Check if an article is ContentOps managed (for filtering)
 */
export function isContentOpsManaged(article: { category?: string | null }): boolean {
  return isContentOpsArticle(article.category || null);
}
