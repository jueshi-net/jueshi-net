/**
 * ContentOps Draft Manager
 * 管理 ContentOps 草稿的创建、读取、更新
 */

import { prisma } from '@/lib/prisma';

export interface ContentOpsDraft {
  id: string;
  title: string;
  body: string;
  state: 'IDEA' | 'DRAFT' | 'NEEDS_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'CHANGES_REQUESTED' | 'FAILED';
  version: number;
  targetEnvironment: 'staging' | 'production';
  contentOpsManaged: boolean;
  contentOpsDraftId: string;
  contentOpsStatus: string;
  contentOpsVersion: number;
  qualityMetadata?: QualityMetadata;
  approvalRecord?: ApprovalRecord;
  publishRecord?: PublishRecord;
  publishedUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityMetadata {
  seoTitle?: string;
  seoDescription?: string;
  summary?: string;
  contentType?: 'guide' | 'topic' | 'checklist';
  faq?: Array<{ question: string; answer: string }>;
  internalLinks?: Array<{ url: string; title: string }>;
  sourceFacts?: Array<{ fact: string; source?: string; verified?: boolean }>;
  structuredData?: any;
  canonicalUrl?: string;
}

export interface ApprovalRecord {
  approvedBy: string;
  approvedAt: string;
  approvedVersion: number;
  approvalSource: 'telegram' | 'web';
  reviewerChatId?: string;
}

export interface PublishRecord {
  publishKey: string;
  publishedAt: string;
  publishedBy: string;
  publishSource: 'telegram' | 'web';
  publishedVersion: number;
  publishedUrl: string;
  contentId: string;
  targetEnvironment: 'staging' | 'production';
}

/**
 * 创建新草稿
 */
export async function createDraft(params: {
  title: string;
  body?: string;
  targetEnvironment?: 'staging' | 'production';
  qualityMetadata?: QualityMetadata;
}): Promise<ContentOpsDraft> {
  const draftId = `draft_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  // 创建 Article 记录，使用 category 前缀隔离
  const article = await prisma.article.create({
    data: {
      title: params.title,
      slug: `contentops-${draftId}`,
      content: params.body || '',
      excerpt: '',
      status: 'draft', // 不公开
      category: 'contentops-draft', // 隔离标识
      // 使用 seoDescription 存储元数据 JSON
      seoDescription: JSON.stringify({
        contentOpsManaged: true,
        contentOpsDraftId: draftId,
        contentOpsStatus: 'DRAFT',
        contentOpsVersion: 1,
        targetEnvironment: params.targetEnvironment || 'staging',
        qualityMetadata: params.qualityMetadata || {},
        createdAt: new Date().toISOString(),
      }),
    },
  });

  return {
    id: draftId,
    title: article.title,
    body: article.content,
    state: 'DRAFT',
    version: 1,
    targetEnvironment: (params.targetEnvironment || 'staging') as 'staging' | 'production',
    contentOpsManaged: true,
    contentOpsDraftId: draftId,
    contentOpsStatus: 'DRAFT',
    contentOpsVersion: 1,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    qualityMetadata: params.qualityMetadata || {},
  };
}

/**
 * 获取草稿列表
 */
export async function listDrafts(params: {
  limit?: number;
  offset?: number;
}): Promise<{ drafts: ContentOpsDraft[]; total: number }> {
  const limit = params.limit || 10;
  const offset = params.offset || 0;

  // 查询所有 contentops 草稿
  const articles = await prisma.article.findMany({
    where: {
      category: 'contentops-draft',
      status: 'draft',
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: limit,
    skip: offset,
  });

  const total = await prisma.article.count({
    where: {
      category: 'contentops-draft',
      status: 'draft',
    },
  });

  const drafts: ContentOpsDraft[] = articles.map((article) => {
    const metadata = parseMetadata(article.seoDescription);
    return {
      id: metadata.contentOpsDraftId || article.id.toString(),
      title: article.title,
      body: article.content,
      state: (metadata.contentOpsStatus as ContentOpsDraft['state']) || 'DRAFT',
      version: metadata.contentOpsVersion || 1,
      targetEnvironment: (metadata.targetEnvironment as 'staging' | 'production') || 'staging',
      contentOpsManaged: metadata.contentOpsManaged || false,
      contentOpsDraftId: metadata.contentOpsDraftId || '',
      contentOpsStatus: metadata.contentOpsStatus || 'DRAFT',
      contentOpsVersion: metadata.contentOpsVersion || 1,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  });

  return { drafts, total };
}

/**
 * 获取单个草稿
 */
export async function getDraft(draftId: string): Promise<ContentOpsDraft | null> {
  const article = await prisma.article.findFirst({
    where: {
      category: 'contentops-draft',
      seoDescription: {
        contains: draftId,
      },
    },
  });

  if (!article) {
    return null;
  }

  const metadata = parseMetadata(article.seoDescription);
  return {
    id: metadata.contentOpsDraftId || article.id.toString(),
    title: article.title,
    body: article.content,
    state: (metadata.contentOpsStatus as ContentOpsDraft['state']) || 'DRAFT',
    version: metadata.contentOpsVersion || 1,
    targetEnvironment: (metadata.targetEnvironment as 'staging' | 'production') || 'staging',
    contentOpsManaged: metadata.contentOpsManaged || false,
    contentOpsDraftId: metadata.contentOpsDraftId || '',
    contentOpsStatus: metadata.contentOpsStatus || 'DRAFT',
    contentOpsVersion: metadata.contentOpsVersion || 1,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    qualityMetadata: metadata.qualityMetadata || {},
    approvalRecord: metadata.approvalRecord || undefined,
    publishRecord: metadata.publishRecord || undefined,
    publishedUrl: metadata.publishRecord?.publishedUrl || undefined,
  };
}

/**
 * 更新草稿
 * Returns updated draft with previousVersion and versionHistory support.
 * If body is identical to current, returns null with isDuplicate flag.
 */
export async function updateDraft(
  draftId: string,
  updates: {
    title?: string;
    body?: string;
    state?: ContentOpsDraft['state'];
    qualityMetadata?: QualityMetadata;
  }
): Promise<ContentOpsDraft & { previousVersion: number; isDuplicate?: boolean } | null> {
  const article = await prisma.article.findFirst({
    where: {
      category: 'contentops-draft',
      seoDescription: {
        contains: draftId,
      },
    },
  });

  if (!article) {
    return null;
  }

  const metadata = parseMetadata(article.seoDescription);
  const currentVersion = metadata.contentOpsVersion || 1;
  const currentBody = article.content || '';

  // Duplicate detection: if body is provided and identical, don't create new version
  if (updates.body !== undefined && updates.body === currentBody && !updates.title && !updates.state) {
    return {
      id: draftId,
      title: article.title,
      body: article.content,
      state: (metadata.contentOpsStatus as ContentOpsDraft['state']) || 'DRAFT',
      version: currentVersion,
      targetEnvironment: (metadata.targetEnvironment as 'staging' | 'production') || 'staging',
      contentOpsManaged: true,
      contentOpsDraftId: draftId,
      contentOpsStatus: metadata.contentOpsStatus || 'DRAFT',
      contentOpsVersion: currentVersion,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      previousVersion: currentVersion,
      isDuplicate: true,
    };
  }

  const newVersion = currentVersion + 1;

  // Build version history: store snapshot of previous version
  const existingHistory: Array<{ version: number; body: string; title: string; updatedAt: string }> = 
    metadata.versionHistory || [];
  
  const historyEntry = {
    version: currentVersion,
    body: currentBody,
    title: article.title,
    updatedAt: article.updatedAt.toISOString(),
  };
  
  // Keep last 20 versions to avoid unbounded growth
  const versionHistory = [...existingHistory, historyEntry].slice(-20);

  const updatedArticle = await prisma.article.update({
    where: { id: article.id },
    data: {
      title: updates.title || article.title,
      content: updates.body !== undefined ? updates.body : article.content,
      seoDescription: JSON.stringify({
        ...metadata,
        contentOpsStatus: updates.state || metadata.contentOpsStatus,
        contentOpsVersion: newVersion,
        versionHistory,
        qualityMetadata: updates.qualityMetadata || metadata.qualityMetadata || {},
        updatedAt: new Date().toISOString(),
      }),
    },
  });

  return {
    id: draftId,
    title: updatedArticle.title,
    body: updatedArticle.content,
    state: updates.state || (metadata.contentOpsStatus as ContentOpsDraft['state']) || 'DRAFT',
    version: newVersion,
    targetEnvironment: (metadata.targetEnvironment as 'staging' | 'production') || 'staging',
    contentOpsManaged: true,
    contentOpsDraftId: draftId,
    contentOpsStatus: updates.state || metadata.contentOpsStatus || 'DRAFT',
    contentOpsVersion: newVersion,
    createdAt: updatedArticle.createdAt,
    updatedAt: updatedArticle.updatedAt,
    previousVersion: currentVersion,
  };
}

/**
 * 获取版本历史
 */
export async function getVersionHistory(draftId: string): Promise<Array<{ version: number; body: string; title: string; updatedAt: string }> | null> {
  const article = await prisma.article.findFirst({
    where: {
      category: 'contentops-draft',
      seoDescription: {
        contains: draftId,
      },
    },
  });

  if (!article) {
    return null;
  }

  const metadata = parseMetadata(article.seoDescription);
  return metadata.versionHistory || [];
}

/**
 * 批准草稿
 * Requires: state=NEEDS_REVIEW, quality passed
 * Records: approvedBy, approvedAt, approvedVersion, approvalSource
 */
export async function approveDraft(
  draftId: string,
  approval: {
    approvedBy: string;
    reviewerChatId?: string;
    approvalSource: 'telegram' | 'web';
    expectedVersion?: number;
  }
): Promise<{
  success: boolean;
  draft?: ContentOpsDraft;
  error?: string;
  errorCode?: string;
  alreadyApproved?: boolean;
}> {
  const article = await prisma.article.findFirst({
    where: {
      category: 'contentops-draft',
      seoDescription: {
        contains: draftId,
      },
    },
  });

  if (!article) {
    return { success: false, error: 'Draft not found', errorCode: 'DRAFT_NOT_FOUND' };
  }

  const metadata = parseMetadata(article.seoDescription);
  const currentState = metadata.contentOpsStatus || 'DRAFT';
  const currentVersion = metadata.contentOpsVersion || 1;

  // Idempotency: if already approved with same version, return existing record
  if (currentState === 'APPROVED' && metadata.approvalRecord) {
    const existingApproval = metadata.approvalRecord as ApprovalRecord;
    if (existingApproval.approvedVersion === currentVersion) {
      return {
        success: true,
        alreadyApproved: true,
        draft: {
          id: draftId,
          title: article.title,
          body: article.content,
          state: 'APPROVED',
          version: currentVersion,
          targetEnvironment: (metadata.targetEnvironment as 'staging' | 'production') || 'staging',
          contentOpsManaged: true,
          contentOpsDraftId: draftId,
          contentOpsStatus: 'APPROVED',
          contentOpsVersion: currentVersion,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
          approvalRecord: existingApproval,
        },
      };
    }
  }

  // State validation: must be NEEDS_REVIEW
  if (currentState !== 'NEEDS_REVIEW') {
    return {
      success: false,
      error: `状态必须是 NEEDS_REVIEW，当前为 ${currentState}`,
      errorCode: 'INVALID_STATE',
    };
  }

  // Version binding: if expectedVersion provided, check it matches
  if (approval.expectedVersion !== undefined && approval.expectedVersion !== currentVersion) {
    return {
      success: false,
      error: `版本不匹配：期望 v${approval.expectedVersion}，当前 v${currentVersion}`,
      errorCode: 'VERSION_MISMATCH',
    };
  }

  // Create approval record
  const approvalRecord: ApprovalRecord = {
    approvedBy: approval.approvedBy,
    approvedAt: new Date().toISOString(),
    approvedVersion: currentVersion,
    approvalSource: approval.approvalSource,
    reviewerChatId: approval.reviewerChatId,
  };

  const updatedArticle = await prisma.article.update({
    where: { id: article.id },
    data: {
      seoDescription: JSON.stringify({
        ...metadata,
        contentOpsStatus: 'APPROVED',
        approvalRecord,
        updatedAt: new Date().toISOString(),
      }),
    },
  });

  return {
    success: true,
    draft: {
      id: draftId,
      title: updatedArticle.title,
      body: updatedArticle.content,
      state: 'APPROVED',
      version: currentVersion,
      targetEnvironment: (metadata.targetEnvironment as 'staging' | 'production') || 'staging',
      contentOpsManaged: true,
      contentOpsDraftId: draftId,
      contentOpsStatus: 'APPROVED',
      contentOpsVersion: currentVersion,
      createdAt: updatedArticle.createdAt,
      updatedAt: updatedArticle.updatedAt,
      approvalRecord,
    },
  };
}

/**
 * 拒绝草稿（要求修改）
 * Requires: state=NEEDS_REVIEW
 * Transitions to: CHANGES_REQUESTED
 */
export async function rejectDraft(
  draftId: string,
  rejection: {
    rejectedBy: string;
    reviewerChatId?: string;
    reason: string;
    rejectionSource: 'telegram' | 'web';
  }
): Promise<{
  success: boolean;
  draft?: ContentOpsDraft;
  error?: string;
  errorCode?: string;
}> {
  const article = await prisma.article.findFirst({
    where: {
      category: 'contentops-draft',
      seoDescription: {
        contains: draftId,
      },
    },
  });

  if (!article) {
    return { success: false, error: 'Draft not found', errorCode: 'DRAFT_NOT_FOUND' };
  }

  const metadata = parseMetadata(article.seoDescription);
  const currentState = metadata.contentOpsStatus || 'DRAFT';
  const currentVersion = metadata.contentOpsVersion || 1;

  // State validation: must be NEEDS_REVIEW
  if (currentState !== 'NEEDS_REVIEW') {
    return {
      success: false,
      error: `状态必须是 NEEDS_REVIEW，当前为 ${currentState}`,
      errorCode: 'INVALID_STATE',
    };
  }

  const rejectionRecord = {
    rejectedBy: rejection.rejectedBy,
    rejectedAt: new Date().toISOString(),
    rejectedVersion: currentVersion,
    reason: rejection.reason,
    rejectionSource: rejection.rejectionSource,
    reviewerChatId: rejection.reviewerChatId,
  };

  const updatedArticle = await prisma.article.update({
    where: { id: article.id },
    data: {
      seoDescription: JSON.stringify({
        ...metadata,
        contentOpsStatus: 'CHANGES_REQUESTED',
        rejectionRecord,
        updatedAt: new Date().toISOString(),
      }),
    },
  });

  return {
    success: true,
    draft: {
      id: draftId,
      title: updatedArticle.title,
      body: updatedArticle.content,
      state: 'CHANGES_REQUESTED',
      version: currentVersion,
      targetEnvironment: (metadata.targetEnvironment as 'staging' | 'production') || 'staging',
      contentOpsManaged: true,
      contentOpsDraftId: draftId,
      contentOpsStatus: 'CHANGES_REQUESTED',
      contentOpsVersion: currentVersion,
      createdAt: updatedArticle.createdAt,
      updatedAt: updatedArticle.updatedAt,
    },
  };
}

/**
 * 提交审核（DRAFT → NEEDS_REVIEW）
 */
export async function submitForReview(draftId: string): Promise<{
  success: boolean;
  draft?: ContentOpsDraft;
  error?: string;
  errorCode?: string;
}> {
  const article = await prisma.article.findFirst({
    where: {
      category: 'contentops-draft',
      seoDescription: {
        contains: draftId,
      },
    },
  });

  if (!article) {
    return { success: false, error: 'Draft not found', errorCode: 'DRAFT_NOT_FOUND' };
  }

  const metadata = parseMetadata(article.seoDescription);
  const currentState = metadata.contentOpsStatus || 'DRAFT';

  if (currentState !== 'DRAFT' && currentState !== 'CHANGES_REQUESTED') {
    return {
      success: false,
      error: `状态必须是 DRAFT 或 CHANGES_REQUESTED，当前为 ${currentState}`,
      errorCode: 'INVALID_STATE',
    };
  }

  const currentVersion = metadata.contentOpsVersion || 1;

  const updatedArticle = await prisma.article.update({
    where: { id: article.id },
    data: {
      seoDescription: JSON.stringify({
        ...metadata,
        contentOpsStatus: 'NEEDS_REVIEW',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    },
  });

  return {
    success: true,
    draft: {
      id: draftId,
      title: updatedArticle.title,
      body: updatedArticle.content,
      state: 'NEEDS_REVIEW',
      version: currentVersion,
      targetEnvironment: (metadata.targetEnvironment as 'staging' | 'production') || 'staging',
      contentOpsManaged: true,
      contentOpsDraftId: draftId,
      contentOpsStatus: 'NEEDS_REVIEW',
      contentOpsVersion: currentVersion,
      createdAt: updatedArticle.createdAt,
      updatedAt: updatedArticle.updatedAt,
    },
  };
}

/**
 * 发布草稿到 staging
 * 状态迁移：APPROVED → PUBLISHED
 * 幂等：相同 publishKey 返回相同结果
 */
export async function publishDraft(draftId: string, options: {
  publishedBy: string;
  publishSource: 'telegram' | 'web';
  expectedVersion?: number;
}): Promise<{
  success: boolean;
  draft?: ContentOpsDraft;
  error?: string;
  errorCode?: string;
  alreadyPublished?: boolean;
  publishRecord?: any;
}> {
  const article = await prisma.article.findFirst({
    where: {
      category: 'contentops-draft',
      seoDescription: {
        contains: draftId,
      },
    },
  });

  if (!article) {
    return { success: false, error: 'Draft not found', errorCode: 'DRAFT_NOT_FOUND' };
  }

  const metadata = parseMetadata(article.seoDescription);
  const currentState = metadata.contentOpsStatus || 'DRAFT';
  const currentVersion = metadata.contentOpsVersion || 1;

  // Idempotency: if already published, verify Guide still exists
  if (currentState === 'PUBLISHED' && metadata.publishRecord) {
    const publishRecord = metadata.publishRecord;
    
    // Verify the Guide record still exists in database
    try {
      const guide = await prisma.guide.findUnique({ 
        where: { id: publishRecord.contentId } 
      });
      
      if (guide && guide.slug === article.slug) {
        // Guide exists and slug matches - true idempotent replay
        return {
          success: true,
          draft: buildDraftFromArticle(article, draftId, metadata),
          alreadyPublished: true,
          publishRecord,
        };
      } else if (guide) {
        // Guide exists but slug mismatch - data inconsistency
        return {
          success: false,
          error: '数据不一致：Guide slug 与 publishRecord 不匹配',
          errorCode: 'CONTENTOPS_PUBLISH_DATA_INCONSISTENCY',
        };
      } else {
        // Guide not found - published content was deleted or never created
        const failedRecord = {
          publishKey: publishRecord.publishKey,
          failedAt: new Date().toISOString(),
          failedBy: 'system',
          failureReason: 'CONTENTOPS_PUBLISH_TARGET_MISSING: Published Guide record not found',
          failedStep: 'GUIDE_VERIFICATION',
          targetEnvironment: 'staging',
          approvedVersion: currentVersion,
          originalPublishRecord: publishRecord,
        };
        
        await prisma.article.update({
          where: { id: article.id },
          data: {
            seoDescription: JSON.stringify({
              ...metadata,
              contentOpsStatus: 'FAILED',
              failedRecord,
              updatedAt: new Date().toISOString(),
            }),
          },
        });
        
        return {
          success: false,
          error: '已发布的 Guide 记录不存在，需要重新发布',
          errorCode: 'CONTENTOPS_PUBLISH_TARGET_MISSING',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `验证 Guide 记录失败: ${error.message}`,
        errorCode: 'CONTENTOPS_GUIDE_VERIFICATION_FAILED',
      };
    }
  }

  // State validation: must be APPROVED
  if (currentState !== 'APPROVED') {
    return {
      success: false,
      error: `状态必须是 APPROVED，当前为 ${currentState}`,
      errorCode: 'INVALID_STATE',
    };
  }

  // Version validation: approvedVersion must match currentVersion
  const approvalRecord = metadata.approvalRecord;
  if (approvalRecord && options.expectedVersion !== undefined) {
    if (approvalRecord.approvedVersion !== options.expectedVersion) {
      return {
        success: false,
        error: `审批版本 v${approvalRecord.approvedVersion} 与当前版本 v${currentVersion} 不匹配`,
        errorCode: 'VERSION_MISMATCH',
      };
    }
  }

  // Generate stable publish key for idempotency (no timestamps or random values)
  const publishKey = `staging:${draftId}:v${currentVersion}`;
  
  // Build ContentDraft for publish adapter
  const contentDraft = {
    id: draftId,
    title: article.title,
    slug: article.slug,
    summary: metadata.qualityMetadata?.summary || '',
    body: article.content,
    contentType: metadata.qualityMetadata?.contentType || 'guide',
    version: currentVersion,
    state: currentState,
    targetEnvironment: 'staging' as const,
    seoTitle: metadata.qualityMetadata?.seoTitle,
    seoDescription: metadata.qualityMetadata?.seoDescription,
  };

  // Call publish adapter to create real content
  const { publishToEnvironment } = await import('./publish-adapter');
  const publishResult = await publishToEnvironment(contentDraft);

  if (!publishResult.success) {
    // Mark as FAILED
    const failedRecord = {
      publishKey,
      failedAt: new Date().toISOString(),
      failedBy: options.publishedBy,
      failureReason: publishResult.error,
      targetEnvironment: 'staging',
      approvedVersion: currentVersion,
    };

    await prisma.article.update({
      where: { id: article.id },
      data: {
        seoDescription: JSON.stringify({
          ...metadata,
          contentOpsStatus: 'FAILED',
          failedRecord,
          updatedAt: new Date().toISOString(),
        }),
      },
    });

    return {
      success: false,
      error: publishResult.error || 'Publish failed',
      errorCode: 'PUBLISH_FAILED',
    };
  }

  // Success: create publish record with real content ID and URL
  const publishRecord = {
    publishKey,
    publishedAt: new Date().toISOString(),
    publishedBy: options.publishedBy,
    publishSource: options.publishSource,
    publishedVersion: currentVersion,
    publishedUrl: publishResult.url,
    contentId: publishResult.contentId,
    targetEnvironment: 'staging',
  };

  const updatedArticle = await prisma.article.update({
    where: { id: article.id },
    data: {
      seoDescription: JSON.stringify({
        ...metadata,
        contentOpsStatus: 'PUBLISHED',
        publishRecord,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    },
  });

  const draft = buildDraftFromArticle(updatedArticle, draftId, { ...metadata, contentOpsStatus: 'PUBLISHED', publishRecord });

  return {
    success: true,
    draft,
    publishRecord,
  };
}

/**
 * 从 Article 构建 Draft 对象
 */
function buildDraftFromArticle(article: any, draftId: string, metadata: any): ContentOpsDraft {
  return {
    id: draftId,
    title: article.title,
    body: article.content || '',
    state: metadata.contentOpsStatus || 'DRAFT',
    version: metadata.contentOpsVersion || 1,
    targetEnvironment: (metadata.targetEnvironment as 'staging' | 'production') || 'staging',
    contentOpsManaged: true,
    contentOpsDraftId: draftId,
    contentOpsStatus: metadata.contentOpsStatus || 'DRAFT',
    contentOpsVersion: metadata.contentOpsVersion || 1,
    qualityMetadata: metadata.qualityMetadata,
    approvalRecord: metadata.approvalRecord,
    publishRecord: metadata.publishRecord,
    publishedUrl: metadata.publishRecord?.publishedUrl,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}

/**
 * 解析元数据 JSON
 */
function parseMetadata(seoDescription: string | null): any {
  if (!seoDescription) {
    return {};
  }
  try {
    return JSON.parse(seoDescription);
  } catch {
    return {};
  }
}
