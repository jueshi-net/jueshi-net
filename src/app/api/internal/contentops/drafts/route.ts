/**
 * ContentOps Bridge API
 * Telegram Bot 与 Web 共享的草稿管理接口
 * 
 * 认证方式：HMAC-SHA256 签名
 * 路径：/api/internal/contentops/drafts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { createDraft, listDrafts, getDraft, updateDraft } from '@/lib/contentops/draft-manager';

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
    const { title, body: draftBody, targetEnvironment } = data;

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
    const { title, body: draftBody, state } = data;

    const draft = await updateDraft(draftId, {
      title,
      body: draftBody,
      state,
    });

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: draft.id,
      title: draft.title,
      state: draft.state,
      version: draft.version,
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
