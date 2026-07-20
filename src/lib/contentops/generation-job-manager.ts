/**
 * ContentOps Generation Job Manager
 * 
 * Manages persistent async content generation jobs.
 * Jobs are stored as Articles with category='contentops-job'.
 * 
 * States: QUEUED → GENERATING_BRIEF → GENERATING_OUTLINE → GENERATING_DRAFT → 
 *         QUALITY_CHECKING → REVISING → COMPLETED | PAUSED_RATE_LIMIT | FAILED | CANCELLED
 */

import { prisma } from '@/lib/prisma';
import {
  getContentGenerationProvider,
  isAiGenerationEnabled,
  WritingBrief,
  OutlineSection,
  GeneratedContent,
  GenerationResult,
} from './content-generation-provider';
import { checkContentQuality, calculateSeoScore, calculateGeoScore } from './quality-checker';

// ============================================================================
// Types
// ============================================================================

export type GenerationJobStatus =
  | 'QUEUED'
  | 'GENERATING_BRIEF'
  | 'GENERATING_OUTLINE'
  | 'GENERATING_DRAFT'
  | 'QUALITY_CHECKING'
  | 'REVISING'
  | 'COMPLETED'
  | 'PAUSED_RATE_LIMIT'
  | 'FAILED'
  | 'CANCELLED';

export interface GenerationJob {
  id: string;
  topic: string;
  contentType: 'guide' | 'topic' | 'checklist';
  status: GenerationJobStatus;
  currentStep: string;
  draftId?: string;
  brief?: WritingBrief;
  outline?: OutlineSection[];
  content?: GeneratedContent;
  revisionInstructions?: string;
  revisionCount: number;
  maxAutoRevisions: number;
  qualityResult?: {
    passed: boolean;
    qualityScore: number;
    seoScore: number;
    geoScore: number;
    issues: Array<{ code: string; message: string }>;
  };
  error?: string;
  errorCode?: string;
  lastError?: string;
  failedStep?: string;
  retryCount: number;
  maxRetries: number;
  resumeAt?: string;
  provider?: string;
  model?: string;
  requestId?: string;
  tokenUsage?: { prompt: number; completion: number; total: number };
  totalLatencyMs: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// ============================================================================
// Job Storage (using Article with category='contentops-job')
// ============================================================================

function serializeJob(job: GenerationJob): string {
  return JSON.stringify({
    contentOpsManaged: true,
    contentOpsJobId: job.id,
    contentOpsJobStatus: job.status,
    generationJob: job,
  });
}

function deserializeJob(article: any): GenerationJob | null {
  try {
    const metadata = JSON.parse(article.seoDescription || '{}');
    return metadata.generationJob || null;
  } catch {
    return null;
  }
}

// ============================================================================
// Job CRUD
// ============================================================================

export async function createGenerationJob(params: {
  topic: string;
  contentType?: 'guide' | 'topic' | 'checklist';
  createdBy: string;
  revisionInstructions?: string;
  existingDraftId?: string;
}): Promise<GenerationJob> {
  const jobId = `gen_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const job: GenerationJob = {
    id: jobId,
    topic: params.topic,
    contentType: params.contentType || 'guide',
    status: 'QUEUED',
    currentStep: 'QUEUED',
    draftId: params.existingDraftId,
    revisionInstructions: params.revisionInstructions,
    revisionCount: 0,
    maxAutoRevisions: 2,
    retryCount: 0,
    maxRetries: 3,
    totalLatencyMs: 0,
    createdBy: params.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Store as Article
  await prisma.article.create({
    data: {
      title: `[Generation Job] ${params.topic}`,
      slug: `contentops-job-${jobId}`,
      content: '',
      excerpt: '',
      status: 'draft',
      category: 'contentops-job',
      seoDescription: serializeJob(job),
    },
  });

  return job;
}

export async function getGenerationJob(jobId: string): Promise<GenerationJob | null> {
  const article = await prisma.article.findFirst({
    where: {
      category: 'contentops-job',
      seoDescription: { contains: jobId },
    },
  });

  if (!article) return null;
  return deserializeJob(article);
}

export async function updateGenerationJob(
  jobId: string,
  updates: Partial<GenerationJob>
): Promise<GenerationJob | null> {
  const article = await prisma.article.findFirst({
    where: {
      category: 'contentops-job',
      seoDescription: { contains: jobId },
    },
  });

  if (!article) return null;

  const currentJob = deserializeJob(article);
  if (!currentJob) return null;

  const updatedJob: GenerationJob = {
    ...currentJob,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await prisma.article.update({
    where: { id: article.id },
    data: {
      seoDescription: serializeJob(updatedJob),
    },
  });

  return updatedJob;
}

export async function listGenerationJobs(params: {
  limit?: number;
  status?: GenerationJobStatus;
}): Promise<{ jobs: GenerationJob[]; total: number }> {
  const where: any = { category: 'contentops-job' };
  if (params.status) {
    // Filter by status in the JSON
    where.seoDescription = { contains: `"status":"${params.status}"` };
  }

  const articles = await prisma.article.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: params.limit || 20,
  });

  const jobs = articles.map(deserializeJob).filter(Boolean) as GenerationJob[];

  const total = await prisma.article.count({ where: { category: 'contentops-job' } });

  return { jobs, total };
}

export async function cancelGenerationJob(jobId: string): Promise<GenerationJob | null> {
  return updateGenerationJob(jobId, {
    status: 'CANCELLED',
    currentStep: 'CANCELLED',
    completedAt: new Date().toISOString(),
  });
}

// ============================================================================
// Job Execution
// ============================================================================

export async function executeGenerationJob(jobId: string): Promise<GenerationJob> {
  const provider = getContentGenerationProvider();
  let job = await getGenerationJob(jobId);

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  if (job.status === 'CANCELLED') {
    return job;
  }

  try {
    // Step 1: Generate Brief (if not already done)
    if (!job.brief) {
      job = await updateGenerationJob(jobId, {
        status: 'GENERATING_BRIEF',
        currentStep: 'GENERATING_BRIEF',
      }) || job;

      const briefResult = await provider.generateBrief(job.topic, {
        contentType: job.contentType,
      });

      if (!briefResult.success) {
        return handleJobError(jobId, job, 'GENERATING_BRIEF', briefResult);
      }

      job = await updateGenerationJob(jobId, {
        brief: briefResult.brief,
        provider: briefResult.provider,
        model: briefResult.model,
        requestId: briefResult.requestId,
        tokenUsage: briefResult.tokenUsage,
        totalLatencyMs: job.totalLatencyMs + briefResult.latencyMs,
      }) || job;
    }

    // Step 2: Generate Outline (if not already done)
    if (!job.outline && job.brief) {
      job = await updateGenerationJob(jobId, {
        status: 'GENERATING_OUTLINE',
        currentStep: 'GENERATING_OUTLINE',
      }) || job;

      const outlineResult = await provider.generateOutline(job.brief);

      if (!outlineResult.success) {
        return handleJobError(jobId, job, 'GENERATING_OUTLINE', outlineResult);
      }

      job = await updateGenerationJob(jobId, {
        outline: outlineResult.outline,
        totalLatencyMs: job.totalLatencyMs + outlineResult.latencyMs,
      }) || job;
    }

    // Step 3: Generate Draft (if not already done)
    if (!job.content && job.brief && job.outline) {
      job = await updateGenerationJob(jobId, {
        status: 'GENERATING_DRAFT',
        currentStep: 'GENERATING_DRAFT',
      }) || job;

      const draftResult = await provider.generateDraft(job.brief, job.outline);

      if (!draftResult.success) {
        return handleJobError(jobId, job, 'GENERATING_DRAFT', draftResult);
      }

      job = await updateGenerationJob(jobId, {
        content: draftResult.content,
        totalLatencyMs: job.totalLatencyMs + draftResult.latencyMs,
      }) || job;
    }

    // Step 4: Handle revision if requested
    if (job.revisionInstructions && job.content && job.brief && job.revisionCount < job.maxAutoRevisions) {
      job = await updateGenerationJob(jobId, {
        status: 'REVISING',
        currentStep: 'REVISING',
      }) || job;

      const reviseResult = await provider.reviseDraft(
        job.content.body,
        job.brief,
        job.revisionInstructions
      );

      if (!reviseResult.success) {
        return handleJobError(jobId, job, 'REVISING', reviseResult);
      }

      // Merge revised content
      const revisedContent: GeneratedContent = {
        ...job.content,
        title: reviseResult.content?.title || job.content.title,
        body: reviseResult.content?.body || job.content.body,
        summary: reviseResult.content?.summary || job.content.summary,
        seoTitle: reviseResult.content?.seoTitle || job.content.seoTitle,
        seoDescription: reviseResult.content?.seoDescription || job.content.seoDescription,
        wordCount: reviseResult.content?.wordCount || job.content.wordCount,
      };

      job = await updateGenerationJob(jobId, {
        content: revisedContent,
        revisionCount: job.revisionCount + 1,
        revisionInstructions: undefined,
        totalLatencyMs: job.totalLatencyMs + reviseResult.latencyMs,
      }) || job;
    }

    // Step 5: Quality Check
    if (job.content) {
      job = await updateGenerationJob(jobId, {
        status: 'QUALITY_CHECKING',
        currentStep: 'QUALITY_CHECKING',
      }) || job;

      const qualityResult = runQualityCheck(job.content, job.brief!);

      job = await updateGenerationJob(jobId, {
        qualityResult,
      }) || job;

      // Auto-revision loop if quality doesn't pass
      if (!qualityResult.passed && job.revisionCount < job.maxAutoRevisions) {
        const issuesText = qualityResult.issues.map(i => i.message).join('; ');
        const autoReviseInstructions = `请根据以下质量问题修改文章：${issuesText}`;

        job = await updateGenerationJob(jobId, {
          status: 'REVISING',
          currentStep: 'REVISING',
          revisionInstructions: autoReviseInstructions,
        }) || job;

        const reviseResult = await provider.reviseDraft(
          job.content.body,
          job.brief!,
          autoReviseInstructions
        );

        if (reviseResult.success && reviseResult.content) {
          const revisedContent: GeneratedContent = {
            ...job.content,
            title: reviseResult.content.title || job.content.title,
            body: reviseResult.content.body || job.content.body,
            summary: reviseResult.content.summary || job.content.summary,
            seoTitle: reviseResult.content.seoTitle || job.content.seoTitle,
            seoDescription: reviseResult.content.seoDescription || job.content.seoDescription,
            wordCount: reviseResult.content.wordCount || job.content.wordCount,
          };

          job = await updateGenerationJob(jobId, {
            content: revisedContent,
            revisionCount: job.revisionCount + 1,
            revisionInstructions: undefined,
            totalLatencyMs: job.totalLatencyMs + reviseResult.latencyMs,
          }) || job;

          // Re-run quality check
          const recheckResult = runQualityCheck(revisedContent, job.brief!);
          job = await updateGenerationJob(jobId, {
            qualityResult: recheckResult,
          }) || job;
        }
      }
    }

    // Final: Mark as COMPLETED
    job = await updateGenerationJob(jobId, {
      status: 'COMPLETED',
      currentStep: 'COMPLETED',
      completedAt: new Date().toISOString(),
    }) || job;

    return job;
  } catch (error: any) {
    return handleJobError(jobId, job, job.currentStep, {
      success: false,
      error: error.message,
      errorCode: error.message.startsWith('CONTENTOPS-') ? error.message : 'CONTENTOPS-GENERATE-001',
      provider: 'deepseek',
      model: '',
      requestId: '',
      latencyMs: 0,
    });
  }
}

function handleJobError(
  jobId: string,
  job: GenerationJob,
  step: string,
  result: GenerationResult
): GenerationJob {
  const isRateLimit = result.errorCode === 'CONTENTOPS-MODEL-429' || result.error?.includes('429');

  if (isRateLimit && job.retryCount < job.maxRetries) {
    // Pause for rate limit
    const resumeAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const updated = updateGenerationJob(jobId, {
      status: 'PAUSED_RATE_LIMIT',
      currentStep: step,
      resumeAt,
      retryCount: job.retryCount + 1,
      lastError: result.error,
      failedStep: step,
    });
    // Return synchronously since we can't await in all contexts
    return { ...job, status: 'PAUSED_RATE_LIMIT' as const, resumeAt, retryCount: job.retryCount + 1 };
  }

  // Mark as failed
  const updated = updateGenerationJob(jobId, {
    status: 'FAILED',
    currentStep: 'FAILED',
    error: result.error,
    errorCode: result.errorCode,
    lastError: result.error,
    failedStep: step,
    completedAt: new Date().toISOString(),
  });

  return {
    ...job,
    status: 'FAILED' as const,
    error: result.error,
    errorCode: result.errorCode,
    lastError: result.error,
    failedStep: step,
    completedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Quality Check (inline, uses existing quality-checker)
// ============================================================================

function runQualityCheck(
  content: GeneratedContent,
  brief: WritingBrief
): {
  passed: boolean;
  qualityScore: number;
  seoScore: number;
  geoScore: number;
  issues: Array<{ code: string; message: string }>;
} {
  const contentMetadata = {
    title: content.title || '',
    body: content.body || '',
    summary: content.summary || '',
    contentType: (brief.contentType || 'guide') as 'guide' | 'topic' | 'checklist',
    seoTitle: content.seoTitle || '',
    seoDescription: content.seoDescription || '',
    faq: content.faq || [],
    internalLinks: content.internalLinks || [],
    sourceFacts: content.sources?.map(s => ({
      fact: s.title,
      source: s.url,
      verified: s.type === 'stable',
    })) || [],
    structuredData: content.structuredDataSuggestion,
    canonicalUrl: content.canonicalSuggestion,
  };

  const qualityResult = checkContentQuality(contentMetadata);
  const seoScore = calculateSeoScore(contentMetadata);
  const geoScore = calculateGeoScore(contentMetadata);

  // Hard fail: content_length errors must block passing regardless of score
  // Also check score threshold and level
  const passed = !qualityResult.hardFail && qualityResult.level !== 'poor' && qualityResult.score >= 60;

  const issues = [
    ...qualityResult.issues.map(i => ({ code: i.type.toUpperCase(), message: i.message })),
    ...qualityResult.warnings.map(w => ({ code: w.type.toUpperCase(), message: w.message })),
  ];

  // Add hard fail reasons to issues if present
  if (qualityResult.hardFail) {
    for (const reason of qualityResult.hardFailReasons) {
      if (!issues.find(i => i.message === reason)) {
        issues.push({ code: 'HARD_FAIL', message: reason });
      }
    }
  }

  return {
    passed,
    qualityScore: qualityResult.score,
    seoScore,
    geoScore,
    issues,
  };
}

// ============================================================================
// Resume Paused Jobs
// ============================================================================

export async function resumePausedJobs(): Promise<number> {
  const now = new Date().toISOString();

  const articles = await prisma.article.findMany({
    where: {
      category: 'contentops-job',
      seoDescription: { contains: 'PAUSED_RATE_LIMIT' },
    },
  });

  let resumed = 0;
  for (const article of articles) {
    const job = deserializeJob(article);
    if (job && job.resumeAt && job.resumeAt <= now) {
      await updateGenerationJob(job.id, {
        status: 'QUEUED',
        currentStep: job.failedStep || 'QUEUED',
        resumeAt: undefined,
      });
      resumed++;
    }
  }

  return resumed;
}

// ============================================================================
// Save Generated Content as Draft
// ============================================================================

export async function saveGeneratedContentAsDraft(jobId: string): Promise<{
  success: boolean;
  draftId?: string;
  error?: string;
}> {
  const job = await getGenerationJob(jobId);
  if (!job || !job.content || !job.brief) {
    return { success: false, error: 'Job not completed or missing content' };
  }

  const { createDraft, updateDraft } = await import('./draft-manager');

  // If job already has a draftId, update it
  if (job.draftId) {
    const existingDraft = await import('./draft-manager').then(m => m.getDraft(job.draftId!));
    if (existingDraft) {
      await updateDraft(job.draftId, {
        title: job.content.title,
        body: job.content.body,
        qualityMetadata: {
          seoTitle: job.content.seoTitle,
          seoDescription: job.content.seoDescription,
          summary: job.content.summary,
          contentType: job.brief.contentType,
          faq: job.content.faq,
          internalLinks: job.content.internalLinks.map(l => ({ url: l.url, title: l.title })),
          sourceFacts: job.content.sources.map(s => ({
            fact: s.title,
            source: s.url,
            verified: s.type === 'stable',
          })),
        },
      });

      await updateGenerationJob(jobId, { draftId: job.draftId });

      return { success: true, draftId: job.draftId };
    }
  }

  // Create new draft
  const draft = await createDraft({
    title: job.content.title,
    body: job.content.body,
    targetEnvironment: 'staging',
    qualityMetadata: {
      seoTitle: job.content.seoTitle,
      seoDescription: job.content.seoDescription,
      summary: job.content.summary,
      contentType: job.brief.contentType,
      faq: job.content.faq,
      internalLinks: job.content.internalLinks.map(l => ({ url: l.url, title: l.title })),
      sourceFacts: job.content.sources.map(s => ({
        fact: s.title,
        source: s.url,
        verified: s.type === 'stable',
      })),
    },
  });

  await updateGenerationJob(jobId, { draftId: draft.id });

  return { success: true, draftId: draft.id };
}
