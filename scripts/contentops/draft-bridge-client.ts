#!/usr/bin/env tsx
/**
 * Production Draft Bridge Client
 * 
 * Calls production API to create drafts without direct database access.
 * Uses HMAC authentication for security.
 */

import { createHmac } from 'crypto';

export interface DraftBridgeRequest {
  traceId: string;
  localHermesRunId: string;
  gatewayLocation: 'local_mac';
  planningUsed: true;
  fallbackUsed: false;
  contentType: 'checklist' | 'guide' | 'topic';
  schemaType: 'checklist' | 'guide' | 'topic';
  title: string;
  slug: string;
  summary?: string;
  content: any;
  qualityGate: {
    pass: boolean;
    score: number;
    failures: string[];
    warnings: string[];
  };
  testStatus?: string;
}

export interface DraftBridgeResponse {
  success: boolean;
  draftId?: string;
  slug?: string;
  type?: string;
  adminEditUrl?: string;
  adminPreviewUrl?: string;
  traceId?: string;
  localHermesRunId?: string;
  status?: string;
  publishedAt?: string | null;
  robots?: string;
  error?: string;
  details?: string[];
}

export async function createDraftViaBridge(
  request: DraftBridgeRequest
): Promise<DraftBridgeResponse> {
  const bridgeUrl = process.env.CONTENTOPS_BRIDGE_URL;
  const bridgeSecret = process.env.CONTENTOPS_BRIDGE_SECRET;

  if (!bridgeUrl) {
    throw new Error('CONTENTOPS_BRIDGE_URL not configured');
  }

  if (!bridgeSecret) {
    throw new Error('CONTENTOPS_BRIDGE_SECRET not configured');
  }

  // Generate HMAC signature
  const payload = JSON.stringify(request);
  const signature = createHmac('sha256', bridgeSecret)
    .update(payload)
    .digest('hex');

  console.log('[DraftBridge] Calling production bridge...');
  console.log('[DraftBridge] URL:', bridgeUrl);
  console.log('[DraftBridge] contentType:', request.contentType);
  console.log('[DraftBridge] title:', request.title);

  try {
    const response = await fetch(bridgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ContentOps-Signature': signature,
      },
      body: payload,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[DraftBridge] API error:', data.error);
      if (data.details) {
        console.error('[DraftBridge] Details:', data.details);
      }
      return {
        success: false,
        error: data.error || 'Bridge API error',
        details: data.details,
      };
    }

    console.log('[DraftBridge] Draft created successfully');
    console.log('[DraftBridge] draftId:', data.draftId);
    console.log('[DraftBridge] slug:', data.slug);

    return {
      success: true,
      draftId: data.draftId,
      slug: data.slug,
      type: data.type,
      adminEditUrl: data.adminEditUrl,
      adminPreviewUrl: data.adminPreviewUrl,
      traceId: data.traceId,
      localHermesRunId: data.localHermesRunId,
      status: data.status,
      publishedAt: data.publishedAt,
      robots: data.robots,
    };
  } catch (error: any) {
    console.error('[DraftBridge] Network error:', error.message);
    return {
      success: false,
      error: 'Bridge network error',
    };
  }
}
