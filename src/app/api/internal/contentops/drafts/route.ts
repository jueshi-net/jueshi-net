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

  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname;
  const queryString = url.search || '';
  const payload = `${method}:${path}${queryString}:${body}`;

  console.error('[ContentOps Bridge] Verifying signature:', {
    method,
    path,
    queryString,
    bodyLength: body.length,
    payloadPreview: payload.substring(0, 100),
  });

  const expectedSignature = createHmac('sha256', BRIDGE_SECRET)
    .update(payload)
    .digest('hex');

  console.error('[ContentOps Bridge] Expected signature:', expectedSignature.substring(0, 20) + '...');
  console.error('[ContentOps Bridge] Received signature:', signature.substring(0, 20) + '...');

  try {
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    
    if (sigBuffer.length !== expectedBuffer.length) {
      console.error('[ContentOps Bridge] Signature length mismatch');
      return false;
    }
    
    const isValid = timingSafeEqual(sigBuffer, expectedBuffer);
    if (!isValid) {
      console.error('[ContentOps Bridge] Signature verification failed');
    }
    return isValid;
  } catch (error) {
    console.error('[ContentOps Bridge] Signature verification error:', error);
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
