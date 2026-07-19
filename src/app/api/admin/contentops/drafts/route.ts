/**
 * Admin ContentOps Drafts API
 * Web admin interface for managing ContentOps drafts
 * Uses session-based auth (admin middleware)
 */

import { NextRequest, NextResponse } from 'next/server';
import { listDrafts, getDraft, updateDraft, getVersionHistory } from '@/lib/contentops/draft-manager';
import { checkContentQuality, calculateSeoScore, calculateGeoScore } from '@/lib/contentops/quality-checker';

/**
 * GET /api/admin/contentops/drafts
 * List all ContentOps drafts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const state = searchParams.get('state') || '';

    const result = await listDrafts({ limit, offset });

    // Filter by state if specified
    let drafts = result.drafts;
    if (state) {
      drafts = drafts.filter(d => d.state === state);
    }

    // Map to admin page format
    const mappedDrafts = drafts.map(d => ({
      id: d.id,
      title: d.title,
      slug: `contentops-${d.id}`,
      contentType: 'guide',
      state: d.state,
      summary: '',
      version: d.version,
      qualityScore: undefined,
      seoScore: undefined,
      geoScore: undefined,
      createdBy: 'telegram-bot',
      updatedAt: d.updatedAt instanceof Date ? d.updatedAt.toISOString() : d.updatedAt,
      targetEnvironment: d.targetEnvironment,
    }));

    return NextResponse.json({
      drafts: mappedDrafts,
      total: state ? mappedDrafts.length : result.total,
    });
  } catch (error) {
    console.error('[Admin ContentOps] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'LIST_FAILED' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/contentops/drafts
 * Handle actions: transition, publish, quality_check, version_history
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { action, id } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Draft ID is required' },
        { status: 400 }
      );
    }

    const draft = await getDraft(id);
    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'transition': {
        const { toState } = data;
        if (!toState) {
          return NextResponse.json({ error: 'toState is required' }, { status: 400 });
        }
        const updated = await updateDraft(id, { state: toState as any });
        if (!updated) {
          return NextResponse.json({ error: 'Update failed' }, { status: 500 });
        }
        return NextResponse.json({
          id: updated.id,
          state: updated.state,
          version: updated.version,
        });
      }

      case 'publish': {
        // Production is ALWAYS disabled
        return NextResponse.json(
          { error: 'Production publishing is disabled. Staging only.' },
          { status: 403 }
        );
      }

      case 'quality_check': {
        const contentMetadata = {
          title: draft.title || '',
          body: draft.body || '',
          summary: '',
          contentType: 'guide' as const,
          seoTitle: '',
          seoDescription: '',
          faq: [],
          internalLinks: [],
          sourceFacts: [],
        };

        const qualityResult = checkContentQuality(contentMetadata);
        const seoScore = calculateSeoScore(contentMetadata);
        const geoScore = calculateGeoScore(contentMetadata);

        return NextResponse.json({
          passed: qualityResult.level !== 'poor' && qualityResult.score >= 60,
          qualityCheck: {
            score: qualityResult.score,
            seoScore,
            geoScore,
            level: qualityResult.level,
            issues: [
              ...qualityResult.issues.map(i => `[${i.type}] ${i.message}`),
              ...qualityResult.warnings.map(w => `[${w.type}] ${w.message}`),
            ],
          },
          draftId: draft.id,
          draftState: draft.state,
          draftVersion: draft.version,
        });
      }

      case 'version_history': {
        const history = await getVersionHistory(id);
        return NextResponse.json({
          draftId: id,
          currentVersion: draft.version,
          history: (history || []).map(h => ({
            version: h.version,
            title: h.title,
            updatedAt: h.updatedAt,
            bodyLength: h.body.length,
          })),
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Admin ContentOps] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'ACTION_FAILED' },
      { status: 500 }
    );
  }
}
