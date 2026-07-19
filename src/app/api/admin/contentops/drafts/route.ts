// ContentOps V1 — Admin API
// GET/POST /api/admin/contentops/drafts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  listDrafts, 
  getDraft, 
  createDraft, 
  updateDraftContent, 
  transitionDraftState,
  runQualityCheck,
  recordPublishResult,
} from '@/lib/contentops/draft-manager';
import { publishToEnvironment, isProductionPublishAllowed } from '@/lib/contentops/publish-adapter';
import { ContentState, ContentType } from '@/lib/contentops/types';

// GET /api/admin/contentops/drafts - List drafts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') as ContentState | null;
    const contentType = searchParams.get('type') as ContentType | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single draft lookup
    const id = searchParams.get('id');
    if (id) {
      const draft = await getDraft(id);
      if (!draft) {
        return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
      }
      return NextResponse.json({ draft });
    }

    // List drafts
    const result = await listDrafts({
      state: state || undefined,
      contentType: contentType || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      drafts: result.drafts,
      total: result.total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('[ContentOps API] GET error:', error.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/admin/contentops/drafts - Create or update draft
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create':
        return await handleCreate(body, session.user.email);
      
      case 'update':
        return await handleUpdate(body, session.user.email);
      
      case 'transition':
        return await handleTransition(body, session.user.email);
      
      case 'quality_check':
        return await handleQualityCheck(body);
      
      case 'publish':
        return await handlePublish(body, session.user.email);
      
      case 'retry':
        return await handleRetry(body, session.user.email);
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[ContentOps API] POST error:', error.message);
    
    if (error.message.includes('Invalid state transition')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    if (error.message.includes('Quality gate failed')) {
      return NextResponse.json({ 
        error: error.message,
        type: 'quality_gate_failed',
      }, { status: 422 });
    }
    
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function handleCreate(body: any, actor: string) {
  const { title, contentType, summary, body: contentBody } = body;
  
  if (!title || !contentType) {
    return NextResponse.json(
      { error: 'title and contentType are required' },
      { status: 400 }
    );
  }

  if (!['guide', 'topic', 'checklist'].includes(contentType)) {
    return NextResponse.json(
      { error: 'Invalid contentType' },
      { status: 400 }
    );
  }

  const draft = await createDraft({
    title,
    contentType,
    summary,
    body: contentBody,
    createdBy: actor,
  });

  return NextResponse.json({ draft, action: 'created' });
}

async function handleUpdate(body: any, actor: string) {
  const { id, title, summary, body: contentBody, seoTitle, seoDescription, keywords, faq } = body;
  
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const draft = await updateDraftContent(id, {
    title,
    summary,
    body: contentBody,
    seoTitle,
    seoDescription,
    keywords,
    faq,
    updatedBy: actor,
  });

  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  return NextResponse.json({ draft, action: 'updated' });
}

async function handleTransition(body: any, actor: string) {
  const { id, toState, comment } = body;
  
  if (!id || !toState) {
    return NextResponse.json(
      { error: 'id and toState are required' },
      { status: 400 }
    );
  }

  const validStates: ContentState[] = [
    'IDEA', 'RESEARCHING', 'DRAFTING', 'DRAFT', 'NEEDS_REVIEW',
    'CHANGES_REQUESTED', 'APPROVED', 'SCHEDULED', 'PUBLISHING',
    'PUBLISHED', 'FAILED', 'UNPUBLISHED', 'ROLLED_BACK',
  ];

  if (!validStates.includes(toState)) {
    return NextResponse.json(
      { error: 'Invalid target state' },
      { status: 400 }
    );
  }

  const draft = await transitionDraftState(id, toState, actor, comment);
  
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  return NextResponse.json({ draft, action: 'transitioned' });
}

async function handleQualityCheck(body: any) {
  const { id } = body;
  
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const result = await runQualityCheck(id);
  
  return NextResponse.json({
    qualityCheck: result,
    passed: result.passed,
  });
}

async function handlePublish(body: any, actor: string) {
  const { id, target } = body;
  
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  // Production lock check
  if (target === 'production' && !isProductionPublishAllowed()) {
    return NextResponse.json(
      { 
        error: 'Production publish is DISABLED',
        type: 'production_locked',
      },
      { status: 403 }
    );
  }

  const draft = await getDraft(id);
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  // Must be APPROVED to publish
  if (draft.state !== 'APPROVED') {
    return NextResponse.json(
      { 
        error: `Draft must be APPROVED to publish (current: ${draft.state})`,
        type: 'invalid_state',
      },
      { status: 400 }
    );
  }

  // Transition to PUBLISHING
  await transitionDraftState(id, 'PUBLISHING', actor);

  // Execute publish
  const result = await publishToEnvironment({
    ...draft,
    targetEnvironment: target || 'staging',
  });

  // Record result
  await recordPublishResult(id, result);

  if (result.success) {
    // Transition to PUBLISHED
    await transitionDraftState(id, 'PUBLISHED', actor);
    
    return NextResponse.json({
      action: 'published',
      url: result.url,
      contentId: result.contentId,
      version: result.version,
    });
  } else {
    // Stay in FAILED state
    return NextResponse.json(
      { 
        error: result.error,
        type: 'publish_failed',
      },
      { status: 500 }
    );
  }
}

async function handleRetry(body: any, actor: string) {
  const { id } = body;
  
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const draft = await getDraft(id);
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  if (draft.state !== 'FAILED') {
    return NextResponse.json(
      { error: 'Can only retry FAILED drafts' },
      { status: 400 }
    );
  }

  // Retry publish
  return await handlePublish({ id, target: draft.targetEnvironment }, actor);
}
