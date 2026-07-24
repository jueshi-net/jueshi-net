/**
 * ContentOps Bridge API
 * Telegram Bot 与 Web 共享的草稿管理接口
 * 
 * 认证方式：HMAC-SHA256 签名
 * 路径：/api/internal/contentops/drafts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { createDraft, listDrafts, getDraft, updateDraft, getVersionHistory } from '@/lib/contentops/draft-manager';
import { checkContentQuality, calculateSeoScore, calculateGeoScore } from '@/lib/contentops/quality-checker';

const BRIDGE_SECRET = process.env.CONTENTOPS_BRIDGE_SECRET || '';

/**
 * 验证 HMAC 签名
 */
function verifySignature(request: NextRequest, body: string): boolean {
  if (!BRIDGE_SECRET) {
    console.error('[ContentOps Bridge] BRIDGE_SECRET not configured');
    return false;
  }

  const signature = request.headers.get('X-ContentOps-Signature');
  if (!signature) {
    console.error('[ContentOps Bridge] Missing signature header');
    return false;
  }

  const method = request.method.toUpperCase();
  const url = new URL(request.url);
  const path = url.pathname;
  // Query string 不参与签名（固定协议）
  const payload = `${method}:${path}:${body}`;

  const expectedSignature = createHmac('sha256', BRIDGE_SECRET)
    .update(payload)
    .digest('hex');

  // 安全日志：只记录指纹，不记录完整签名
  const expectedFingerprint = expectedSignature.substring(0, 8);
  const receivedFingerprint = signature.substring(0, 8);

  // 验证签名格式
  if (!/^[0-9a-fA-F]{64}$/.test(signature)) {
    console.error('[ContentOps Bridge] Malformed signature', {
      requestId: request.headers.get('x-request-id'),
      signatureFormatValid: false,
      errorCode: 'MALFORMED_SIGNATURE',
    });
    return false;
  }

  try {
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    
    if (sigBuffer.length !== expectedBuffer.length) {
      console.error('[ContentOps Bridge] Signature length mismatch', {
        requestId: request.headers.get('x-request-id'),
        signaturePresent: true,
        signatureFormatValid: true,
        expectedFingerprint,
        receivedFingerprint,
        errorCode: 'MALFORMED_SIGNATURE',
      });
      return false;
    }
    
    const isValid = timingSafeEqual(sigBuffer, expectedBuffer);
    if (!isValid) {
      console.error('[ContentOps Bridge] Signature verification failed', {
        requestId: request.headers.get('x-request-id'),
        signaturePresent: true,
        signatureFormatValid: true,
        expectedFingerprint,
        receivedFingerprint,
        errorCode: 'INVALID_SIGNATURE',
      });
    }
    return isValid;
  } catch (error) {
    console.error('[ContentOps Bridge] Signature verification error', {
      requestId: request.headers.get('x-request-id'),
      signaturePresent: !!signature,
      signatureFormatValid: /^[0-9a-fA-F]{64}$/.test(signature),
      expectedFingerprint,
      receivedFingerprint,
      errorCode: 'VERIFICATION_ERROR',
    });
    return false;
  }
}

/**
 * GET /api/internal/contentops/drafts
 * 列出草稿
 */
export async function GET(request: NextRequest) {
  // 验证签名
  if (!verifySignature(request, '')) {
    console.error('[ContentOps Bridge] Invalid signature');
    return NextResponse.json(
      { error: 'Unauthorized', code: 'INVALID_SIGNATURE' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    // Single draft fetch: GET /api/internal/contentops/drafts?id=<draftId>
    const singleId = searchParams.get('id');

    // Generation jobs listing: GET ?action=generation_jobs
    const action = searchParams.get('action');
    if (action === 'generation_jobs') {
      const { listGenerationJobs } = await import('@/lib/contentops/generation-job-manager');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status') as any;
      const result = await listGenerationJobs({ limit, status });
      return NextResponse.json({
        jobs: result.jobs.map(j => ({
          id: j.id,
          topic: j.topic,
          contentType: j.contentType,
          status: j.status,
          currentStep: j.currentStep,
          draftId: j.draftId,
          revisionCount: j.revisionCount,
          qualityResult: j.qualityResult,
          error: j.error,
          errorCode: j.errorCode,
          provider: j.provider,
          model: j.model,
          totalLatencyMs: j.totalLatencyMs,
          createdBy: j.createdBy,
          createdAt: j.createdAt,
          updatedAt: j.updatedAt,
          completedAt: j.completedAt,
        })),
        total: result.total,
      });
    }

    // Generation job status: GET ?action=generation_job_status&jobId=<id>
    if (action === 'generation_job_status') {
      const jobId = searchParams.get('jobId');
      if (!jobId) {
        return NextResponse.json(
          { error: 'Job ID is required', code: 'MISSING_JOB_ID' },
          { status: 400 }
        );
      }
      const { getGenerationJob } = await import('@/lib/contentops/generation-job-manager');
      const job = await getGenerationJob(jobId);
      if (!job) {
        return NextResponse.json(
          { error: 'Job not found', code: 'JOB_NOT_FOUND' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        id: job.id,
        topic: job.topic,
        contentType: job.contentType,
        status: job.status,
        currentStep: job.currentStep,
        draftId: job.draftId,
        brief: job.brief,
        outline: job.outline,
        content: job.content ? {
          title: job.content.title,
          wordCount: job.content.wordCount,
          summary: job.content.summary,
          seoTitle: job.content.seoTitle,
          seoDescription: job.content.seoDescription,
          faqCount: job.content.faq?.length || 0,
          sourceCount: job.content.sources?.length || 0,
          internalLinkCount: job.content.internalLinks?.length || 0,
        } : null,
        qualityResult: job.qualityResult,
        revisionCount: job.revisionCount,
        error: job.error,
        errorCode: job.errorCode,
        provider: job.provider,
        model: job.model,
        tokenUsage: job.tokenUsage,
        totalLatencyMs: job.totalLatencyMs,
        retryCount: job.retryCount,
        resumeAt: job.resumeAt,
        createdBy: job.createdBy,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
      });
    }

    if (singleId) {
      // Version history request
      const action = searchParams.get('action');
      if (action === 'version_history') {
        const history = await getVersionHistory(singleId);
        if (history === null) {
          return NextResponse.json(
            { error: 'Draft not found', code: 'DRAFT_NOT_FOUND' },
            { status: 404 }
          );
        }
        // Also get current version for reference
        const currentDraft = await getDraft(singleId);
        return NextResponse.json({
          draftId: singleId,
          currentVersion: currentDraft?.version || 0,
          history: history.map(h => ({
            version: h.version,
            title: h.title,
            updatedAt: h.updatedAt,
            bodyLength: h.body.length,
          })),
        });
      }

      const draft = await getDraft(singleId);
      if (!draft) {
        return NextResponse.json(
          { error: 'Draft not found', code: 'DRAFT_NOT_FOUND' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        id: draft.id,
        title: draft.title,
        body: draft.body,
        state: draft.state,
        version: draft.version,
        targetEnvironment: draft.targetEnvironment,
        createdAt: draft.createdAt.toISOString(),
        updatedAt: draft.updatedAt.toISOString(),
        qualityMetadata: draft.qualityMetadata || {},
        approvalRecord: draft.approvalRecord || null,
        publishRecord: draft.publishRecord || null,
        publishedUrl: draft.publishedUrl || null,
      });
    }

    // List drafts: GET /api/internal/contentops/drafts?limit=N&offset=M
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await listDrafts({ limit, offset });

    return NextResponse.json({
      drafts: result.drafts.map((d) => ({
        id: d.id,
        title: d.title,
        state: d.state,
        version: d.version,
        targetEnvironment: d.targetEnvironment,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      })),
      total: result.total,
    });
  } catch (error) {
    console.error('[ContentOps Bridge] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'LIST_FAILED' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/internal/contentops/drafts
 * 创建新草稿
 */
export async function POST(request: NextRequest) {
  let body = '';
  try {
    body = await request.text();
  } catch {
    body = '';
  }

  // Debug: log body info
  console.error('[ContentOps Bridge] Body info:', {
    bodyLength: body.length,
    bodyBytes: Buffer.from(body).length,
    bodyPreview: body.substring(0, 50),
  });

  // 验证签名
  if (!verifySignature(request, body)) {
    console.error('[ContentOps Bridge] Invalid signature');
    return NextResponse.json(
      { error: 'Unauthorized', code: 'INVALID_SIGNATURE' },
      { status: 401 }
    );
  }

  try {
    const data = JSON.parse(body);

    // Handle quality_check action
    if (data.action === 'quality_check') {
      const draftId = data.id;
      if (!draftId) {
        return NextResponse.json(
          { error: 'Draft ID is required', code: 'MISSING_DRAFT_ID' },
          { status: 400 }
        );
      }

      const draft = await getDraft(draftId);
      if (!draft) {
        return NextResponse.json(
          { error: 'Draft not found', code: 'DRAFT_NOT_FOUND' },
          { status: 404 }
        );
      }

      // Use stored qualityMetadata if available
      const qm = draft.qualityMetadata || {};
      const contentMetadata = {
        title: draft.title || '',
        body: draft.body || '',
        summary: qm.summary || qm.seoDescription || '',
        contentType: (qm.contentType || 'guide') as 'guide' | 'topic' | 'checklist',
        seoTitle: qm.seoTitle || '',
        seoDescription: qm.seoDescription || '',
        faq: qm.faq || [],
        internalLinks: qm.internalLinks || [],
        sourceFacts: qm.sourceFacts || [],
        structuredData: qm.structuredData,
        canonicalUrl: qm.canonicalUrl,
      };

      // Run quality checks (all null-safe)
      const qualityResult = checkContentQuality(contentMetadata);
      const seoScore = calculateSeoScore(contentMetadata);
      const geoScore = calculateGeoScore(contentMetadata);

      // Build issues list for bot display
      const allIssues = [
        ...qualityResult.issues.map(i => ({ code: i.type.toUpperCase(), message: i.message })),
        ...qualityResult.warnings.map(w => ({ code: w.type.toUpperCase(), message: w.message })),
      ];

      return NextResponse.json({
        passed: qualityResult.level !== 'poor' && qualityResult.score >= 60,
        qualityScore: qualityResult.score,
        seoScore,
        geoScore,
        level: qualityResult.level,
        issues: allIssues,
        draftId: draft.id,
        draftState: draft.state,
        draftVersion: draft.version,
      });
    }

    // Handle submit_for_review action (DRAFT → NEEDS_REVIEW)
    if (data.action === 'submit_for_review') {
      const { submitForReview } = await import('@/lib/contentops/draft-manager');
      const draftId = data.id;
      if (!draftId) {
        return NextResponse.json(
          { error: 'Draft ID is required', code: 'MISSING_DRAFT_ID' },
          { status: 400 }
        );
      }
      const result = await submitForReview(draftId);
      if (!result.success) {
        const status = result.errorCode === 'DRAFT_NOT_FOUND' ? 404 : 409;
        return NextResponse.json(
          { error: result.error, code: result.errorCode },
          { status }
        );
      }
      return NextResponse.json({
        id: result.draft!.id,
        state: result.draft!.state,
        version: result.draft!.version,
      });
    }

    // Handle approve action
    if (data.action === 'approve') {
      const { approveDraft } = await import('@/lib/contentops/draft-manager');
      const draftId = data.id;
      if (!draftId) {
        return NextResponse.json(
          { error: 'Draft ID is required', code: 'MISSING_DRAFT_ID' },
          { status: 400 }
        );
      }
      const result = await approveDraft(draftId, {
        approvedBy: data.approvedBy || 'unknown',
        reviewerChatId: data.reviewerChatId,
        approvalSource: data.approvalSource || 'telegram',
        expectedVersion: data.expectedVersion,
      });
      if (!result.success) {
        const status = result.errorCode === 'DRAFT_NOT_FOUND' ? 404 : 
                       result.errorCode === 'INVALID_STATE' ? 409 :
                       result.errorCode === 'VERSION_MISMATCH' ? 409 : 500;
        return NextResponse.json(
          { error: result.error, code: result.errorCode },
          { status }
        );
      }
      return NextResponse.json({
        id: result.draft!.id,
        state: result.draft!.state,
        version: result.draft!.version,
        alreadyApproved: result.alreadyApproved || false,
        approvalRecord: result.draft!.approvalRecord,
      });
    }

    // Handle reject action
    if (data.action === 'reject') {
      const { rejectDraft } = await import('@/lib/contentops/draft-manager');
      const draftId = data.id;
      if (!draftId) {
        return NextResponse.json(
          { error: 'Draft ID is required', code: 'MISSING_DRAFT_ID' },
          { status: 400 }
        );
      }
      const result = await rejectDraft(draftId, {
        rejectedBy: data.rejectedBy || 'unknown',
        reviewerChatId: data.reviewerChatId,
        reason: data.reason || '',
        rejectionSource: data.rejectionSource || 'telegram',
      });
      if (!result.success) {
        const status = result.errorCode === 'DRAFT_NOT_FOUND' ? 404 : 409;
        return NextResponse.json(
          { error: result.error, code: result.errorCode },
          { status }
        );
      }
      return NextResponse.json({
        id: result.draft!.id,
        state: result.draft!.state,
        version: result.draft!.version,
      });
    }

    // Handle publish action
    if (data.action === 'publish') {
      const { publishDraft } = await import('@/lib/contentops/draft-manager');
      const draftId = data.id;
      if (!draftId) {
        return NextResponse.json(
          { error: 'Draft ID is required', code: 'MISSING_DRAFT_ID' },
          { status: 400 }
        );
      }
      const result = await publishDraft(draftId, {
        publishedBy: data.publishedBy || 'unknown',
        publishSource: data.publishSource || 'telegram',
        expectedVersion: data.expectedVersion,
      });
      if (!result.success) {
        const status = result.errorCode === 'DRAFT_NOT_FOUND' ? 404 : 
                       result.errorCode === 'INVALID_STATE' ? 409 :
                       result.errorCode === 'VERSION_MISMATCH' ? 409 : 500;
        return NextResponse.json(
          { error: result.error, code: result.errorCode },
          { status }
        );
      }
      return NextResponse.json({
        id: result.draft!.id,
        state: result.draft!.state,
        version: result.draft!.version,
        alreadyPublished: result.alreadyPublished || false,
        publishRecord: result.publishRecord,
        publishedUrl: result.publishRecord?.publishedUrl,
        contentId: result.publishRecord?.contentId,
      });
    }

    // Handle generate action — create and execute a generation job
    if (data.action === 'generate') {
      const { isAiGenerationEnabled, isUsingRealProvider, checkProviderHealth } = await import('@/lib/contentops/content-generation-provider');
      
      // Check if AI is enabled
      if (!isAiGenerationEnabled()) {
        return NextResponse.json(
          { error: 'AI generation not configured', code: 'AI_NOT_CONFIGURED' },
          { status: 503 }
        );
      }
      
      // Check if we're using a real provider (not fallback)
      if (!isUsingRealProvider()) {
        // Fallback provider is not allowed in production flow
        const health = await checkProviderHealth();
        return NextResponse.json(
          { 
            error: 'Real AI provider unavailable. DeepSeek API may have insufficient balance.', 
            code: 'CONTENTOPS-MODEL-PROVIDER-UNAVAILABLE',
            provider: health.provider,
            providerError: health.error,
          },
          { status: 503 }
        );
      }
      
      // Pre-flight health check: verify the real provider can actually make API calls
      const health = await checkProviderHealth();
      if (!health.healthy) {
        return NextResponse.json(
          { 
            error: 'Real AI provider unavailable. DeepSeek API may have insufficient balance.', 
            code: 'CONTENTOPS-MODEL-PROVIDER-UNAVAILABLE',
            provider: health.provider,
            providerError: health.error,
          },
          { status: 503 }
        );
      }

      const { createGenerationJob, executeGenerationJob, saveGeneratedContentAsDraft } = 
        await import('@/lib/contentops/generation-job-manager');

      const topic = data.topic;
      if (!topic) {
        return NextResponse.json(
          { error: 'Topic is required', code: 'MISSING_TOPIC' },
          { status: 400 }
        );
      }

      // Create job
      const job = await createGenerationJob({
        topic,
        contentType: data.contentType || 'guide',
        createdBy: data.createdBy || 'telegram',
        existingDraftId: data.existingDraftId,
      });

      // Execute synchronously (for now — can be made async later)
      const completedJob = await executeGenerationJob(job.id);

      // Save as draft if completed successfully
      if (completedJob.status === 'COMPLETED' && completedJob.content) {
        const draftResult = await saveGeneratedContentAsDraft(job.id);
        
        // Count valid sources (exclude FACT_RESEARCH_UNAVAILABLE)
        const validSources = (completedJob.content.sources || []).filter(
          s => s.title !== 'FACT_RESEARCH_UNAVAILABLE' && s.title !== 'FACT_RESEARCH_UNVAILABLE'
        );
        
        return NextResponse.json({
          jobId: completedJob.id,
          status: completedJob.status,
          draftId: draftResult.draftId,
          brief: completedJob.brief,
          outline: completedJob.outline,
          content: completedJob.content ? {
            title: completedJob.content.title,
            wordCount: completedJob.content.wordCount,
            summary: completedJob.content.summary,
            seoTitle: completedJob.content.seoTitle,
            seoDescription: completedJob.content.seoDescription,
            faqCount: completedJob.content.faq?.length || 0,
            sourceCount: validSources.length,
            sourceResearchAvailable: validSources.length > 0,
            internalLinkCount: completedJob.content.internalLinks?.length || 0,
          } : null,
          qualityResult: completedJob.qualityResult,
          revisionCount: completedJob.revisionCount,
          provider: completedJob.provider,
          model: completedJob.model,
          tokenUsage: completedJob.tokenUsage,
          totalLatencyMs: completedJob.totalLatencyMs,
        });
      }

      // Return job status (may be FAILED or PAUSED)
      return NextResponse.json({
        jobId: completedJob.id,
        status: completedJob.status,
        error: completedJob.error,
        errorCode: completedJob.errorCode,
        failedStep: completedJob.failedStep,
        retryCount: completedJob.retryCount,
        resumeAt: completedJob.resumeAt,
        provider: completedJob.provider,
        model: completedJob.model,
      }, completedJob.status === 'FAILED' ? { status: 500 } : { status: 200 });
    }

    // Handle revise action — create revision job for existing draft
    if (data.action === 'revise') {
      const { isAiGenerationEnabled, isUsingRealProvider, checkProviderHealth } = await import('@/lib/contentops/content-generation-provider');
      
      // Check if AI is enabled
      if (!isAiGenerationEnabled()) {
        return NextResponse.json(
          { error: 'AI generation not configured', code: 'AI_NOT_CONFIGURED' },
          { status: 503 }
        );
      }
      
      // Check if we're using a real provider (not fallback)
      if (!isUsingRealProvider()) {
        const health = await checkProviderHealth();
        return NextResponse.json(
          { 
            error: 'Real AI provider unavailable. DeepSeek API may have insufficient balance.', 
            code: 'CONTENTOPS-MODEL-PROVIDER-UNAVAILABLE',
            provider: health.provider,
            providerError: health.error,
          },
          { status: 503 }
        );
      }
      
      // Pre-flight health check
      const health = await checkProviderHealth();
      if (!health.healthy) {
        return NextResponse.json(
          { 
            error: 'Real AI provider unavailable. DeepSeek API may have insufficient balance.', 
            code: 'CONTENTOPS-MODEL-PROVIDER-UNAVAILABLE',
            provider: health.provider,
            providerError: health.error,
          },
          { status: 503 }
        );
      }

      const { createGenerationJob, executeGenerationJob, saveGeneratedContentAsDraft } = 
        await import('@/lib/contentops/generation-job-manager');
      const { getDraft } = await import('@/lib/contentops/draft-manager');

      const draftId = data.id;
      const instructions = data.instructions;

      if (!draftId || !instructions) {
        return NextResponse.json(
          { error: 'Draft ID and instructions are required', code: 'MISSING_PARAMS' },
          { status: 400 }
        );
      }

      // Get existing draft
      const draft = await getDraft(draftId);
      if (!draft) {
        return NextResponse.json(
          { error: 'Draft not found', code: 'DRAFT_NOT_FOUND' },
          { status: 404 }
        );
      }

      // Get or reconstruct brief from draft metadata
      const qm = draft.qualityMetadata || {};
      const brief = {
        topic: draft.title,
        contentType: (qm.contentType || 'guide') as 'guide' | 'topic' | 'checklist',
        targetAudience: '海外华人和留学生',
        searchIntent: 'informational',
        tone: '专业、清晰、实用',
        language: 'zh-CN',
        country: '',
        primaryKeyword: '',
        secondaryKeywords: [],
        requiredSections: [],
        excludedClaims: [],
        requestedLength: '1800-3000 中文字',
        sourceRequirements: '',
        internalLinkRequirements: '',
        createdBy: 'ai-revision',
        createdAt: new Date().toISOString(),
      };

      // Create revision job
      const job = await createGenerationJob({
        topic: draft.title,
        contentType: qm.contentType || 'guide',
        createdBy: data.createdBy || 'telegram',
        revisionInstructions: instructions,
        existingDraftId: draftId,
      });

      // Pre-populate brief and content for revision-only flow
      const { updateGenerationJob } = 
        await import('@/lib/contentops/generation-job-manager');
      const provider = (await import('@/lib/contentops/content-generation-provider')).getContentGenerationProvider();

      // Execute revision directly
      const reviseResult = await provider.reviseDraft(draft.body, brief, instructions);

      if (!reviseResult.success) {
        await updateGenerationJob(job.id, {
          status: 'FAILED',
          error: reviseResult.error,
          errorCode: reviseResult.errorCode,
          failedStep: 'REVISING',
          completedAt: new Date().toISOString(),
        });

        return NextResponse.json({
          jobId: job.id,
          status: 'FAILED',
          error: reviseResult.error,
          errorCode: reviseResult.errorCode,
        }, { status: 500 });
      }

      // Update draft with revised content
      const { updateDraft } = await import('@/lib/contentops/draft-manager');
      const updatedDraft = await updateDraft(draftId, {
        title: reviseResult.content?.title || draft.title,
        body: reviseResult.content?.body || draft.body,
        qualityMetadata: {
          ...qm,
          seoTitle: reviseResult.content?.seoTitle || qm.seoTitle,
          seoDescription: reviseResult.content?.seoDescription || qm.seoDescription,
          summary: reviseResult.content?.summary || qm.summary,
        },
      });

      await updateGenerationJob(job.id, {
        status: 'COMPLETED',
        content: reviseResult.content || undefined,
        revisionCount: 1,
        draftId,
        completedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        jobId: job.id,
        status: 'COMPLETED',
        draftId,
        version: updatedDraft?.version,
        previousVersion: updatedDraft?.previousVersion,
        revisionSummary: reviseResult.revisionSummary,
        wordCount: reviseResult.content?.wordCount,
        provider: reviseResult.provider,
        model: reviseResult.model,
        tokenUsage: reviseResult.tokenUsage,
        latencyMs: reviseResult.latencyMs,
      });
    }

    // Handle cancel_generation action
    if (data.action === 'cancel_generation') {
      const { cancelGenerationJob } = await import('@/lib/contentops/generation-job-manager');
      const jobId = data.jobId;
      if (!jobId) {
        return NextResponse.json(
          { error: 'Job ID is required', code: 'MISSING_JOB_ID' },
          { status: 400 }
        );
      }
      const job = await cancelGenerationJob(jobId);
      if (!job) {
        return NextResponse.json(
          { error: 'Job not found', code: 'JOB_NOT_FOUND' },
          { status: 404 }
        );
      }
      return NextResponse.json({ jobId: job.id, status: job.status });
    }

    // ============================================================================
    // Task Actions (Autonomous Agent)
    // ============================================================================

    if (data.action === 'create_task') {
      const { canonicalTaskService } = await import('@/lib/contentops/canonical-task-service');
      const result = await canonicalTaskService.createAndEnqueueContentOpsTask({
        chatId: data.chatId,
        messageId: data.messageId || 0,
        rawInput: data.rawInput || data.topic || '',
        contentType: data.contentType,
        executionMode: data.executionMode,
        targetEnvironment: data.targetEnvironment,
        topic: data.topic,
        audience: data.audience,
        country: data.country,
        city: data.city,
        industry: data.industry,
        tone: data.tone,
        requiredSections: data.requiredSections,
        specialRequirements: data.specialRequirements,
        scheduledAt: data.scheduledAt,
        publishInstruction: data.publishInstruction,
        sourceRequirement: data.sourceRequirement,
      });
      
      if (!result.ok) {
        return NextResponse.json({
          ok: false,
          error: result.error,
          recoverable: result.recoverable,
        }, { status: 500 });
      }
      
      // Return nested structure expected by Bot: { ok: true, data: { task: { id, ... }, job: { id, ... } } }
      return NextResponse.json({
        ok: true,
        data: {
          task: {
            id: result.taskId,
            status: result.task?.status,
            contentType: result.task?.contentType,
            executionMode: result.task?.executionMode,
            targetEnvironment: result.task?.targetEnvironment,
            topic: result.task?.topic,
            createdAt: result.task?.createdAt,
          },
          job: {
            id: result.taskId, // Job ID is same as task ID for atomic enqueue
            status: result.enqueueStatus || 'QUEUED',
          },
        },
      }, { status: 201 });
    }

    if (data.action === 'resume_task') {
      const { canonicalTaskService } = await import('@/lib/contentops/canonical-task-service');
      const taskId = data.taskId;
      if (!taskId) {
        return NextResponse.json(
          { error: 'Task ID is required', code: 'MISSING_TASK_ID' },
          { status: 400 }
        );
      }
      const result = await canonicalTaskService.resumeExistingTask(taskId);
      
      if (!result.ok) {
        return NextResponse.json({
          ok: false,
          taskId: result.taskId,
          recoverable: result.recoverable,
          error: result.error,
        }, { status: 500 });
      }
      
      return NextResponse.json({
        ok: true,
        taskId: result.taskId,
        status: result.task?.status,
        enqueueStatus: result.enqueueStatus,
      });
    }

    if (data.action === 'get_task') {
      const { taskManager } = await import('@/lib/contentops/task-manager');
      const taskId = data.taskId;
      if (!taskId) {
        return NextResponse.json(
          { error: 'Task ID is required', code: 'MISSING_TASK_ID' },
          { status: 400 }
        );
      }
      const task = await taskManager.getTask(taskId);
      if (!task) {
        return NextResponse.json(
          { error: 'Task not found', code: 'TASK_NOT_FOUND' },
          { status: 404 }
        );
      }
      return NextResponse.json(task);
    }

    if (data.action === 'update_task') {
      const { taskManager } = await import('@/lib/contentops/task-manager');
      const taskId = data.taskId;
      if (!taskId) {
        return NextResponse.json(
          { error: 'Task ID is required', code: 'MISSING_TASK_ID' },
          { status: 400 }
        );
      }
      const task = await taskManager.updateTaskStatus(
        taskId,
        data.status,
        data.step,
        data.data
      );
      if (!task) {
        return NextResponse.json(
          { error: 'Task not found', code: 'TASK_NOT_FOUND' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        taskId: task.id,
        status: task.status,
        currentStep: task.currentStep,
        updatedAt: task.updatedAt,
      });
    }

    if (data.action === 'list_tasks') {
      const { taskManager } = await import('@/lib/contentops/task-manager');
      const chatId = data.chatId;
      if (chatId) {
        const tasks = await taskManager.getTasksByChatId(chatId);
        return NextResponse.json({ tasks: tasks.map(t => ({
          id: t.id,
          status: t.status,
          contentType: t.contentType,
          topic: t.topic,
          draftId: t.draftId,
          createdAt: t.createdAt,
          completedAt: t.completedAt,
        }))});
      }
      // List all pending tasks (for cron job)
      const tasks = await taskManager.getPendingTasks(data.limit || 5);
      return NextResponse.json({ tasks: tasks.map(t => ({
        id: t.id,
        status: t.status,
        contentType: t.contentType,
        topic: t.topic,
        currentStep: t.currentStep,
        createdAt: t.createdAt,
      }))});
    }

    if (data.action === 'cancel_task') {
      const { taskManager } = await import('@/lib/contentops/task-manager');
      const taskId = data.taskId;
      if (!taskId) {
        return NextResponse.json(
          { error: 'Task ID is required', code: 'MISSING_TASK_ID' },
          { status: 400 }
        );
      }
      await taskManager.cancelTask(taskId);
      return NextResponse.json({ taskId, status: 'CANCELLED' });
    }

    // ============================================================================
    // Scheduler Actions
    // ============================================================================

    if (data.action === 'create_schedule') {
      const { scheduler } = await import('@/lib/contentops/scheduler');
      const { taskId, draftId, scheduledAtUtc, scheduledTimezone, scheduledAtOriginal, targetEnvironment, contentType } = data;
      if (!taskId || !draftId || !scheduledAtUtc) {
        return NextResponse.json(
          { error: 'taskId, draftId, and scheduledAtUtc are required', code: 'MISSING_PARAMS' },
          { status: 400 }
        );
      }
      const schedule = await scheduler.createSchedule({
        taskId,
        draftId,
        scheduledAtUtc,
        scheduledTimezone: scheduledTimezone || 'Asia/Shanghai',
        scheduledAtOriginal: scheduledAtOriginal || scheduledAtUtc,
        targetEnvironment: targetEnvironment || 'staging',
        contentType: contentType || 'guide',
      });
      return NextResponse.json(schedule, { status: 201 });
    }

    if (data.action === 'list_schedules') {
      const { scheduler } = await import('@/lib/contentops/scheduler');
      const status = data.status;
      const schedules = await scheduler.listSchedules(status);
      return NextResponse.json({ schedules });
    }

    if (data.action === 'get_schedule') {
      const { scheduler } = await import('@/lib/contentops/scheduler');
      const scheduleId = data.scheduleId;
      if (!scheduleId) {
        return NextResponse.json(
          { error: 'Schedule ID is required', code: 'MISSING_SCHEDULE_ID' },
          { status: 400 }
        );
      }
      const schedule = await scheduler.getSchedule(scheduleId);
      if (!schedule) {
        return NextResponse.json(
          { error: 'Schedule not found', code: 'SCHEDULE_NOT_FOUND' },
          { status: 404 }
        );
      }
      return NextResponse.json(schedule);
    }

    if (data.action === 'cancel_schedule') {
      const { scheduler } = await import('@/lib/contentops/scheduler');
      const scheduleId = data.scheduleId;
      if (!scheduleId) {
        return NextResponse.json(
          { error: 'Schedule ID is required', code: 'MISSING_SCHEDULE_ID' },
          { status: 400 }
        );
      }
      const schedule = await scheduler.cancelSchedule(scheduleId);
      if (!schedule) {
        return NextResponse.json(
          { error: 'Schedule not found', code: 'SCHEDULE_NOT_FOUND' },
          { status: 404 }
        );
      }
      return NextResponse.json(schedule);
    }

    if (data.action === 'process_due_schedules') {
      const { scheduler } = await import('@/lib/contentops/scheduler');
      const due = await scheduler.processDue();
      return NextResponse.json({ dueSchedules: due, count: due.length });
    }

    // ============================================================================
    // Audit Actions (Read-only, for evidence collection)
    // ============================================================================

    if (data.action === 'audit_contentops_task') {
      const { prisma } = await import('@/lib/prisma');
      const { taskManager } = await import('@/lib/contentops/task-manager');
      const { scheduler } = await import('@/lib/contentops/scheduler');
      
      const taskId = data.taskId;
      const contentId = data.contentId;
      
      if (!taskId && !contentId) {
        return NextResponse.json(
          { error: 'taskId or contentId is required', code: 'MISSING_PARAMS' },
          { status: 400 }
        );
      }
      
      // Get task record
      let task = null;
      if (taskId) {
        task = await taskManager.getTask(taskId);
      }
      
      // Get content record (Checklist or Guide)
      let content = null;
      if (contentId) {
        // Try Checklist first
        const checklist = await prisma.checklist.findUnique({
          where: { id: contentId },
          select: {
            id: true,
            slug: true,
            title: true,
            status: true,
            publishedAt: true,
            createdAt: true,
            seoTitle: true,
            seoDescription: true,
            canonicalUrl: true,
            steps: true,
            metadataJson: true,
          }
        });
        
        if (checklist) {
          const metadata = checklist.metadataJson as any || {};
          const contentOps = metadata.contentOps || {};
          const steps = (checklist.steps as any[]) || [];
          
          content = {
            id: checklist.id,
            type: 'checklist',
            status: checklist.status,
            publishedAt: checklist.publishedAt?.toISOString() || null,
            slug: checklist.slug,
            groupsCount: metadata.groupCount || new Set(steps.map(s => s.metadata?.group)).size,
            itemsCount: metadata.itemCount || steps.length,
            faqCount: contentOps.faq?.length || 0,
            seoPresent: !!(checklist.seoTitle || checklist.seoDescription),
            canonicalPresent: !!checklist.canonicalUrl,
            jsonLdPresent: !!contentOps.structuredData,
            internalLinkCount: contentOps.internalLinks?.length || 0,
            sourceFactCount: contentOps.sourceFacts?.length || 0,
          };
        } else {
          // Try Guide
          const guide = await prisma.guide.findUnique({
            where: { id: contentId },
            select: {
              id: true,
              slug: true,
              title: true,
              status: true,
              publishedAt: true,
              seoTitle: true,
              seoDescription: true,
              canonicalUrl: true,
              metadataJson: true,
            }
          });
          
          if (guide) {
            const metadata = guide.metadataJson as any || {};
            const contentOps = metadata.contentOps || {};
            
            content = {
              id: guide.id,
              type: 'guide',
              status: guide.status,
              publishedAt: guide.publishedAt?.toISOString() || null,
              slug: guide.slug,
              faqCount: contentOps.faq?.length || 0,
              seoPresent: !!(guide.seoTitle || guide.seoDescription),
              canonicalPresent: !!guide.canonicalUrl,
              jsonLdPresent: !!contentOps.structuredData,
              internalLinkCount: contentOps.internalLinks?.length || 0,
              sourceFactCount: contentOps.sourceFacts?.length || 0,
            };
          } else {
            // Try Topic
            const topic = await prisma.topic.findUnique({
              where: { id: contentId },
              select: {
                id: true,
                slug: true,
                title: true,
                status: true,
                publishedAt: true,
                seoTitle: true,
                seoDescription: true,
                metadataJson: true,
              }
            });
            
            if (topic) {
              const metadata = topic.metadataJson as any || {};
              const contentOps = metadata.contentOps || {};
              
              content = {
                id: topic.id,
                type: 'topic',
                status: topic.status,
                publishedAt: topic.publishedAt?.toISOString() || null,
                slug: topic.slug,
                subtopicCount: metadata.subtopicCount || 0,
                faqCount: contentOps.faq?.length || 0,
                seoPresent: !!(topic.seoTitle || topic.seoDescription),
                canonicalPresent: false, // Topic model doesn't have canonicalUrl
                jsonLdPresent: !!contentOps.structuredData,
                internalLinkCount: contentOps.internalLinks?.length || 0,
                sourceFactCount: contentOps.sourceFacts?.length || 0,
              };
            }
          }
        }
      }
      
      // Get schedule records
      let schedule = null;
      if (taskId) {
        const schedules = await scheduler.listSchedules();
        const taskSchedules = schedules.filter(s => s.taskId === taskId);
        
        if (taskSchedules.length > 0) {
          const latest = taskSchedules[taskSchedules.length - 1];
          schedule = {
            count: taskSchedules.length,
            status: latest.status,
            originalScheduledAt: latest.scheduledAtOriginal,
            effectiveScheduledAt: latest.scheduledAtUtc,
            executedAt: latest.executedAt || null,
            publishAttemptCount: latest.publishAttemptCount || 0,
            duplicatePublishCount: latest.duplicatePublishCount || 0,
            recoveryMode: latest.recoveryMode || null,
          };
        }
      }
      
      // Get draft statistics (from file-based storage)
      let drafts = null;
      if (taskId) {
        try {
          const { listDrafts } = await import('@/lib/contentops/draft-manager');
          const allDraftsResult = await listDrafts({ limit: 1000 });
          const allDrafts = allDraftsResult.drafts;
          
          // Filter drafts by taskId in qualityMetadata
          const taskDrafts = allDrafts.filter(d => {
            const qm = d.qualityMetadata || {};
            return qm.taskId === taskId || qm.contentOps?.taskId === taskId;
          });
          
          const activeCount = taskDrafts.filter(d => d.state === 'DRAFT' || d.state === 'NEEDS_REVIEW').length;
          const invalidAwaitingReviewCount = taskDrafts.filter(d => 
            d.state === 'NEEDS_REVIEW' && 
            d.qualityMetadata?.qualityResult?.passed === false
          ).length;
          const supersededCount = taskDrafts.filter(d => 
            d.state === 'SUPERSEDED' || d.state === 'ARCHIVED'
          ).length;
          
          drafts = {
            activeCount,
            invalidAwaitingReviewCount,
            supersededCount,
          };
        } catch (error) {
          console.error('[Audit] Failed to load drafts:', error);
          drafts = {
            activeCount: 0,
            invalidAwaitingReviewCount: 0,
            supersededCount: 0,
          };
        }
      }
      
      return NextResponse.json({
        task: task ? {
          id: task.id,
          contentType: task.contentType,
          executionMode: task.executionMode,
          status: task.status,
          scheduledAt: task.scheduledAt || null,
          currentStep: task.currentStep,
        } : null,
        content,
        schedule,
        drafts,
      });
    }

    // ============================================================================
    // Repair Actions (Integrity Fix)
    // ============================================================================

    // Update content status (e.g., unpublish quality-failed content)
    if (data.action === 'update_content_status') {
      const { prisma } = await import('@/lib/prisma');
      const { contentId, newStatus, auditEvent } = data;
      
      if (!contentId || !newStatus) {
        return NextResponse.json(
          { error: 'contentId and newStatus are required', code: 'MISSING_PARAMS' },
          { status: 400 }
        );
      }
      
      // Try Checklist first
      const checklist = await prisma.checklist.findUnique({
        where: { id: contentId },
        select: { id: true, status: true, publishedAt: true, metadataJson: true }
      });
      
      if (checklist) {
        const metadata = (checklist.metadataJson as any) || {};
        const auditHistory = metadata.auditHistory || [];
        
        // Add audit event
        if (auditEvent) {
          auditHistory.push({
            ...auditEvent,
            timestamp: new Date().toISOString(),
            fromStatus: checklist.status,
            toStatus: newStatus,
          });
        }
        
        // Build update data
        const updateData: any = {
          status: newStatus,
          metadataJson: {
            ...metadata,
            auditHistory,
          }
        };
        
        // If publishing, set publishedAt
        if (newStatus === 'published' && !checklist.publishedAt) {
          updateData.publishedAt = new Date();
        }
        
        const updated = await prisma.checklist.update({
          where: { id: contentId },
          data: updateData,
          select: {
            id: true,
            status: true,
            publishedAt: true,
          }
        });
        
        return NextResponse.json({
          id: updated.id,
          type: 'checklist',
          previousStatus: checklist.status,
          newStatus: updated.status,
          publishedAt: updated.publishedAt?.toISOString() || null,
          auditEventCreated: !!auditEvent,
        });
      }
      
      // Try Guide
      const guide = await prisma.guide.findUnique({
        where: { id: contentId },
        select: { id: true, status: true, publishedAt: true, metadataJson: true }
      });
      
      if (guide) {
        const metadata = (guide.metadataJson as any) || {};
        const auditHistory = metadata.auditHistory || [];
        
        if (auditEvent) {
          auditHistory.push({
            ...auditEvent,
            timestamp: new Date().toISOString(),
            fromStatus: guide.status,
            toStatus: newStatus,
          });
        }
        
        const updated = await prisma.guide.update({
          where: { id: contentId },
          data: {
            status: newStatus,
            metadataJson: {
              ...metadata,
              auditHistory,
            }
          },
          select: {
            id: true,
            status: true,
            publishedAt: true,
          }
        });
        
        return NextResponse.json({
          id: updated.id,
          type: 'guide',
          previousStatus: guide.status,
          newStatus: updated.status,
          publishedAt: updated.publishedAt?.toISOString() || null,
          auditEventCreated: !!auditEvent,
        });
      }
      
      return NextResponse.json(
        { error: 'Content not found', code: 'CONTENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update task metadata (fix executionMode, status, etc.)
    if (data.action === 'update_task_metadata') {
      const { taskManager } = await import('@/lib/contentops/task-manager');
      const { taskId, executionMode, status, scheduledAt, auditEvent } = data;
      
      if (!taskId) {
        return NextResponse.json(
          { error: 'taskId is required', code: 'MISSING_TASK_ID' },
          { status: 400 }
        );
      }
      
      const task = await taskManager.getTask(taskId);
      if (!task) {
        return NextResponse.json(
          { error: 'Task not found', code: 'TASK_NOT_FOUND' },
          { status: 404 }
        );
      }
      
      // Build update data
      const updateData: any = {};
      if (executionMode !== undefined) updateData.executionMode = executionMode;
      if (status !== undefined) updateData.status = status;
      if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt;
      
      // Add audit event to task data
      if (auditEvent) {
        const currentData = task.data || {};
        const auditHistory = currentData.auditHistory || [];
        auditHistory.push({
          ...auditEvent,
          timestamp: new Date().toISOString(),
        });
        updateData.data = {
          ...currentData,
          auditHistory,
        };
      }
      
      // Update task using Prisma directly (taskManager doesn't have updateTaskMetadata)
      const { prisma } = await import('@/lib/prisma');
      const updated = await prisma.contentOpsTask.update({
        where: { id: taskId },
        data: {
          ...(executionMode !== undefined && { executionMode }),
          ...(status !== undefined && { status }),
          ...(scheduledAt !== undefined && { scheduledAt }),
          ...(updateData.data && { data: updateData.data as any }),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          executionMode: true,
          status: true,
          scheduledAt: true,
          currentStep: true,
        }
      });
      
      return NextResponse.json({
        taskId: updated.id,
        previousExecutionMode: task.executionMode,
        newExecutionMode: updated.executionMode,
        previousStatus: task.status,
        newStatus: updated.status,
        auditEventCreated: !!auditEvent,
      });
    }

    // Auto-revise checklist (add missing SEO metadata)
    if (data.action === 'auto_revise_checklist') {
      const { prisma } = await import('@/lib/prisma');
      const { contentId } = data;
      
      if (!contentId) {
        return NextResponse.json(
          { error: 'contentId is required', code: 'MISSING_CONTENT_ID' },
          { status: 400 }
        );
      }
      
      const checklist = await prisma.checklist.findUnique({
        where: { id: contentId },
        select: {
          id: true,
          title: true,
          slug: true,
          seoTitle: true,
          seoDescription: true,
          canonicalUrl: true,
          steps: true,
          metadataJson: true,
        }
      });
      
      if (!checklist) {
        return NextResponse.json(
          { error: 'Checklist not found', code: 'CHECKLIST_NOT_FOUND' },
          { status: 404 }
        );
      }
      
      const metadata = (checklist.metadataJson as any) || {};
      const contentOps = metadata.contentOps || {};
      const originalContent = metadata.originalContent || {};
      
      // Add missing SEO metadata
      const seoTitle = checklist.seoTitle || originalContent.seoTitle || checklist.title;
      const seoDescription = checklist.seoDescription || originalContent.seoDescription || 
        `新加坡留学生第一次租房检查清单：${checklist.title}。包含看房前、看房时、签约前和入住后的完整检查项目。`;
      const canonicalUrl = checklist.canonicalUrl || `https://i.jueshi.net/checklists/${checklist.slug}`;
      
      // Add FAQ if missing
      const faq = contentOps.faq || [
        {
          question: '新加坡留学生租房需要注意什么？',
          answer: '留学生租房需要注意：1) 确认房东身份和房产合法性；2) 检查房屋设施和安全隐患；3) 仔细阅读合同条款；4) 拍照记录房屋现状；5) 了解退租流程。'
        },
        {
          question: '租房合同一般签多久？',
          answer: '新加坡租房合同通常为6个月至2年。留学生建议选择6-12个月的短期合同，以便灵活调整。部分房东接受3个月的短租。'
        },
        {
          question: '押金一般是多少？',
          answer: '新加坡租房押金通常为1-2个月租金。合同到期且房屋无损坏时，押金应全额退还。建议在合同中明确押金退还条件和时间。'
        }
      ];
      
      // Add internal links
      const internalLinks = contentOps.internalLinks || [
        { url: '/guides/新加坡留学指南', text: '新加坡留学指南' }
      ];
      
      // Add source facts
      const sourceFacts = contentOps.sourceFacts || [
        { claim: '新加坡租房押金通常为1-2个月租金', source: '新加坡房地产经纪人协会规定', verified: true }
      ];
      
      // Add JSON-LD structured data
      const structuredData = contentOps.structuredData || {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": checklist.title,
        "description": seoDescription,
        "step": (checklist.steps as any[]).map((step, index) => ({
          "@type": "HowToStep",
          "position": index + 1,
          "name": step.title,
          "text": step.description
        }))
      };
      
      // Update metadata
      const updatedMetadata = {
        ...metadata,
        contentOps: {
          ...contentOps,
          faq,
          internalLinks,
          sourceFacts,
          structuredData,
        },
        autoRevisedAt: new Date().toISOString(),
        autoRevisionReason: 'quality_gate_repair',
      };
      
      // Update checklist
      const updated = await prisma.checklist.update({
        where: { id: contentId },
        data: {
          seoTitle,
          seoDescription,
          canonicalUrl,
          metadataJson: updatedMetadata,
        },
        select: {
          id: true,
          title: true,
          seoTitle: true,
          seoDescription: true,
          canonicalUrl: true,
          metadataJson: true,
        }
      });
      
      const updatedContentOps = (updated.metadataJson as any).contentOps || {};
      
      return NextResponse.json({
        id: updated.id,
        title: updated.title,
        seoTitle: updated.seoTitle,
        seoDescription: updated.seoDescription,
        canonicalUrl: updated.canonicalUrl,
        faqCount: updatedContentOps.faq?.length || 0,
        internalLinkCount: updatedContentOps.internalLinks?.length || 0,
        sourceFactCount: updatedContentOps.sourceFacts?.length || 0,
        jsonLdPresent: !!updatedContentOps.structuredData,
        autoRevised: true,
      });
    }

    // Handle create_backend_draft action — save directly to content model
    if (data.action === 'create_backend_draft') {
      const { prisma } = await import('@/lib/prisma');
      const { Prisma } = await import('@prisma/client');
      
      const contentType = data.contentType || 'guide';
      const title = data.title;
      
      if (!title) {
        return NextResponse.json(
          { error: 'Title is required', code: 'MISSING_TITLE' },
          { status: 400 }
        );
      }
      
      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Date.now().toString(36);
      
      if (contentType === 'checklist') {
        // Map checklist content to Checklist model
        const content = data.content || {};
        const groups = content.groups || [];
        
        // Convert groups/items to steps format
        const steps = groups.flatMap((group: any, groupIndex: number) => {
          const items = group.items || [];
          return items.map((item: any, itemIndex: number) => ({
            title: item.title || '',
            description: item.description || '',
            completed: false,
            optional: !item.required,
            metadata: {
              group: group.name || group.title || `Group ${groupIndex + 1}`,
              groupDescription: group.description || '',
              completionCondition: item.completionCondition || '',
              riskNote: item.riskNote || '',
              sortOrder: item.sortOrder ?? (groupIndex * 100 + itemIndex),
            }
          }));
        });
        
        const checklist = await prisma.checklist.create({
          data: {
            title,
            slug,
            summary: content.summary || content.description || '',
            steps: steps as Prisma.InputJsonValue,
            status: 'draft',
            seoTitle: content.seoTitle || title,
            seoDescription: content.seoDescription || '',
            metadataJson: {
              taskId: data.taskId,
              contentType: 'checklist',
              source: 'contentops-bridge',
              originalContent: content,
              groupCount: groups.length,
              itemCount: steps.length,
            },
          },
        });
        
        return NextResponse.json({
          id: checklist.id,
          title: checklist.title,
          slug: checklist.slug,
          contentType: 'checklist',
          state: 'DRAFT',
          groupCount: groups.length,
          itemCount: steps.length,
          createdAt: checklist.createdAt.toISOString(),
        }, { status: 201 });
      }
      
      if (contentType === 'topic') {
        // Map topic content to Topic model
        const content = data.content || {};
        
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
            title: content.hero.headline || title,
            content: content.hero.description || content.summary || '',
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
          taskId: data.taskId,
          contentType: 'topic',
          source: 'contentops-bridge',
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
        
        const topic = await prisma.topic.create({
          data: {
            title,
            slug,
            subtitle: content.hero?.subheadline || '',
            summary: content.summary || '',
            status: 'draft',
            templateType: 'rating_list',
            heroBadges: content.heroBadges || [],
            suitableFor: content.audience ? [content.audience] : [],
            tags: content.seo?.keywords || [],
            seoTitle: content.seo?.title || content.seoTitle || title,
            seoDescription: content.seo?.description || content.seoDescription || '',
            metadataJson: metadataJson as Prisma.InputJsonValue,
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
        
        return NextResponse.json({
          id: topic.id,
          title: topic.title,
          slug: topic.slug,
          contentType: 'topic',
          state: 'DRAFT',
          subtopicCount: topic.items.length,
          sectionCount: topic.sections.length,
          faqCount: content.faq?.length || 0,
          sourceFactCount: content.sources?.length || 0,
          internalLinkCount: content.internalLinks?.length || 0,
          createdAt: topic.createdAt.toISOString(),
        }, { status: 201 });
      }
      
      // For other content types, fall through to generic draft
      if (contentType === 'guide') {
        const content = data.content || {};
        const body = content.body || content.body || data.body || `# ${title}\n\n${data.excerpt || data.summary || ''}`;
        
        const guide = await prisma.guide.create({
          data: {
            title,
            slug,
            summary: data.excerpt || data.summary || '',
            body: body,
            category: content.category || 'general',
            tags: content.seo?.keywords || data.tags || [],
            relatedTools: content.relatedTools || [],
            relatedTopics: content.relatedTopics || [],
            relatedChecklists: content.relatedChecklists || [],
            relatedGuides: content.relatedGuides || [],
            status: 'draft',
            seoTitle: content.seo?.title || data.seoTitle || title,
            seoDescription: content.seo?.description || data.seoDescription || '',
            metadataJson: {
              taskId: data.taskId,
              contentType: 'guide',
              source: 'contentops-bridge',
              originalContent: content,
            },
          },
        });
        
        return NextResponse.json({
          id: guide.id,
          title: guide.title,
          slug: guide.slug,
          contentType: 'guide',
          state: 'DRAFT',
          createdAt: guide.createdAt.toISOString(),
        }, { status: 201 });
      }
      
      return NextResponse.json(
        { error: `Content type "${contentType}" not yet supported for backend draft`, code: 'UNSUPPORTED_CONTENT_TYPE' },
        { status: 400 }
      );
    }

    // Default: create new draft
    const { title, body: draftBody, targetEnvironment, qualityMetadata } = data;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    const draft = await createDraft({
      title,
      body: draftBody,
      targetEnvironment: targetEnvironment || 'staging',
      qualityMetadata,
    });

    return NextResponse.json({
      id: draft.id,
      title: draft.title,
      state: draft.state,
      version: draft.version,
      targetEnvironment: draft.targetEnvironment,
      createdAt: draft.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('[ContentOps Bridge] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'CREATE_FAILED' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/internal/contentops/drafts/[id]
 * 更新草稿
 */
export async function PUT(request: NextRequest) {
  let body = '';
  try {
    body = await request.text();
  } catch {
    body = '';
  }

  // 验证签名
  if (!verifySignature(request, body)) {
    console.error('[ContentOps Bridge] Invalid signature');
    return NextResponse.json(
      { error: 'Unauthorized', code: 'INVALID_SIGNATURE' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get('id');

    if (!draftId) {
      return NextResponse.json(
        { error: 'Draft ID is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    const data = JSON.parse(body);
    const { title, body: draftBody, state, qualityMetadata } = data;

    const draft = await updateDraft(draftId, {
      title,
      body: draftBody,
      state,
      qualityMetadata,
    });

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Handle duplicate detection
    if (draft.isDuplicate) {
      return NextResponse.json({
        id: draft.id,
        title: draft.title,
        state: draft.state,
        version: draft.version,
        previousVersion: draft.previousVersion,
        isDuplicate: true,
        updatedAt: draft.updatedAt.toISOString(),
        message: '内容未变更，未创建新版本',
      });
    }

    return NextResponse.json({
      id: draft.id,
      title: draft.title,
      state: draft.state,
      version: draft.version,
      previousVersion: draft.previousVersion,
      updatedAt: draft.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('[ContentOps Bridge] PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'UPDATE_FAILED' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/internal/contentops/drafts/[id]
 * 获取单个草稿
 */
export async function GET_BY_ID(request: NextRequest) {
  // 验证签名
  if (!verifySignature(request, '')) {
    console.error('[ContentOps Bridge] Invalid signature');
    return NextResponse.json(
      { error: 'Unauthorized', code: 'INVALID_SIGNATURE' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get('id');

    if (!draftId) {
      return NextResponse.json(
        { error: 'Draft ID is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    const draft = await getDraft(draftId);

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: draft.id,
      title: draft.title,
      body: draft.body,
      state: draft.state,
      version: draft.version,
      targetEnvironment: draft.targetEnvironment,
      createdAt: draft.createdAt.toISOString(),
      updatedAt: draft.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('[ContentOps Bridge] GET_BY_ID error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'GET_FAILED' },
      { status: 500 }
    );
  }
}
