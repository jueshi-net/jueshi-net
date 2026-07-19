/**
 * ContentOps Draft Manager
 * 管理 ContentOps 草稿的创建、读取、更新
 */

import { prisma } from '@/lib/prisma';

export interface ContentOpsDraft {
  id: string;
  title: string;
  body: string;
  state: 'IDEA' | 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'FAILED';
  version: number;
  targetEnvironment: 'staging' | 'production';
  contentOpsManaged: boolean;
  contentOpsDraftId: string;
  contentOpsStatus: string;
  contentOpsVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建新草稿
 */
export async function createDraft(params: {
  title: string;
  body?: string;
  targetEnvironment?: 'staging' | 'production';
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
