// POST /api/internal/contentops/drafts - Create draft via bridge (internal API)
// Requires HMAC authentication

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';

// HMAC verification
function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  try {
    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

// Schema validation for topic
function validateTopicSchema(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.title) errors.push('title is required');
  if (!data.intro) errors.push('intro is required');
  if (!data.categories || data.categories.length < 4) {
    errors.push('categories must have at least 4 items');
  }
  if (!data.resources || data.resources.length < 8) {
    errors.push('resources must have at least 8 items');
  }
  
  // Check S/A/B/C rating
  if (data.resources) {
    const hasRating = data.resources.some((r: any) => 
      ['S', 'A', 'B', 'C'].includes(r.ratingTier)
    );
    if (!hasRating) errors.push('resources must have S/A/B/C rating');
  }
  
  if (!data.scenarioMap) errors.push('scenarioMap is required');
  if (!data.comparisonTable) errors.push('comparisonTable is required');
  if (!data.faq || data.faq.length < 5) errors.push('faq must have at least 5 items');
  if (!data.pitfalls || data.pitfalls.length < 5) errors.push('pitfalls must have at least 5 items');
  if (!data.internalLinks || data.internalLinks.length < 5) {
    errors.push('internalLinks must have at least 5 items');
  }
  if (!data.relatedTools || data.relatedTools.length < 3) {
    errors.push('relatedTools must have at least 3 items');
  }
  
  return { valid: errors.length === 0, errors };
}

// Schema validation for guide
function validateGuideSchema(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.quickAnswer) errors.push('quickAnswer is required');
  if (!data.sections || data.sections.length < 6) {
    errors.push('sections must have at least 6 items');
  }
  if (!data.faq || data.faq.length < 5) errors.push('faq must have at least 5 items');
  if (!data.pitfalls || data.pitfalls.length < 5) errors.push('pitfalls must have at least 5 items');
  if (!data.internalLinks || data.internalLinks.length < 5) {
    errors.push('internalLinks must have at least 5 items');
  }
  if (!data.relatedTools || data.relatedTools.length < 3) {
    errors.push('relatedTools must have at least 3 items');
  }
  
  return { valid: errors.length === 0, errors };
}

// Schema validation for checklist
function validateChecklistSchema(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.groups || data.groups.length < 4) {
    errors.push('groups must have at least 4 items');
  }
  if (!data.faq || data.faq.length < 5) errors.push('faq must have at least 5 items');
  if (!data.pitfalls || data.pitfalls.length < 5) errors.push('pitfalls must have at least 5 items');
  
  return { valid: errors.length === 0, errors };
}

export async function POST(request: NextRequest) {
  try {
    // Verify HMAC authentication
    const signature = request.headers.get('x-contentops-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const body = await request.text();
    const secret = process.env.CONTENTOPS_BRIDGE_SECRET;
    
    if (!secret) {
      console.error('[DraftBridge] CONTENTOPS_BRIDGE_SECRET not configured');
      return NextResponse.json(
        { error: 'Bridge not configureded' },
        { status: 500 }
      );
    }

    if (!verifyHmacSignature(body, signature, secret)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);
    
    // Validate common fields
    const commonErrors: string[] = [];
    if (!data.traceId) commonErrors.push('traceId is required');
    if (!data.localHermesRunId) commonErrors.push('localHermesRunId is required');
    if (data.gatewayLocation !== 'local_mac') {
      commonErrors.push('gatewayLocation must be local_mac');
    }
    if (data.planningUsed !== true) commonErrors.push('planningUsed must be true');
    if (data.fallbackUsed !== false) commonErrors.push('fallbackUsed must be false');
    if (!['checklist', 'guide', 'topic'].includes(data.contentType)) {
      commonErrors.push('contentType must be checklist, guide, or topic');
    }
    if (data.schemaType !== data.contentType) {
      commonErrors.push('schemaType must match contentType');
    }
    if (!data.qualityGate || data.qualityGate.pass !== true) {
      commonErrors.push('qualityGate must pass');
    }
    
    if (commonErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: commonErrors },
        { status: 400 }
      );
    }

    // If validateOnly=true, skip schema validation and database creation
    if (data.validateOnly === true) {
      console.log('[DraftBridge] Validate-only request:', {
        contentType: data.contentType,
        traceId: data.traceId,
        localHermesRunId: data.localHermesRunId,
      });
      
      return NextResponse.json({
        success: true,
        validateOnly: true,
        contentType: data.contentType,
        traceId: data.traceId,
        localHermesRunId: data.localHermesRunId,
        message: 'Validation passed (validate-only mode)',
      });
    }

    // Validate schema-specific fields
    let schemaValidation: { valid: boolean; errors: string[] };
    
    if (data.contentType === 'topic') {
      schemaValidation = validateTopicSchema(data.content);
    } else if (data.contentType === 'guide') {
      schemaValidation = validateGuideSchema(data.content);
    } else if (data.contentType === 'checklist') {
      schemaValidation = validateChecklistSchema(data.content);
    } else {
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 400 }
      );
    }

    if (!schemaValidation.valid) {
      return NextResponse.json(
        { error: 'Schema validation failed', details: schemaValidation.errors },
        { status: 400 }
      );
    }

    // Create draft in database
    const metadataJson = {
      contentOps: {
        gatewayLocation: data.gatewayLocation,
        localHermesRunId: data.localHermesRunId,
        planningUsed: data.planningUsed,
        fallbackUsed: data.fallbackUsed,
        traceId: data.traceId,
        qualityScore: data.qualityGate.score,
        testStatus: data.testStatus || null,
        v2Mvp: true,
      },
    };

    let draft: any;
    
    if (data.contentType === 'topic') {
      draft = await prisma.topic.create({
        data: {
          title: data.title,
          slug: data.slug,
          summary: data.content.intro,
          metadataJson,
          status: 'draft',
          publishedAt: null,
        },
      });
    } else if (data.contentType === 'guide') {
      draft = await prisma.guide.create({
        data: {
          title: data.title,
          slug: data.slug,
          summary: data.content.quickAnswer,
          body: JSON.stringify(data.content),
          metadataJson,
          status: 'draft',
          publishedAt: null,
          robots: 'noindex,nofollow',
        },
      });
    } else if (data.contentType === 'checklist') {
      draft = await prisma.checklist.create({
        data: {
          title: data.title,
          slug: data.slug,
          summary: data.summary || '',
          metadataJson,
          status: 'draft',
          publishedAt: null,
          robots: 'noindex,nofollow',
        },
      });
    }

    // Generate admin URLs
    const adminEditUrl = `https://jueshi.net/admin/contentops/${data.contentType}s/${draft.id}/edit`;
    const adminPreviewUrl = `https://jueshi.net/${data.contentType}s/${draft.slug}?preview=true`;

    // Log audit
    console.log('[DraftBridge] Draft created:', {
      id: draft.id,
      type: data.contentType,
      slug: draft.slug,
      traceId: data.traceId,
      localHermesRunId: data.localHermesRunId,
    });

    return NextResponse.json({
      success: true,
      draftId: draft.id,
      slug: draft.slug,
      type: data.contentType,
      adminEditUrl,
      adminPreviewUrl,
      traceId: data.traceId,
      localHermesRunId: data.localHermesRunId,
      status: 'draft',
      publishedAt: null,
      robots: 'noindex,nofollow',
    });

  } catch (error: any) {
    console.error('[DraftBridge] Error:', error.message);
    
    // Don't expose database errors
    return NextResponse.json(
      { error: 'Draft creation failed' },
      { status: 500 }
    );
  }
}
