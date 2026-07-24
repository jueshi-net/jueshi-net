/**
 * ContentOps Content Publish Adapters
 * 
 * Separate adapters for each content type.
 * Each adapter calls staging-local helper via SSH.
 * 
 * V2-MVP: v1.20.42.18.6.21.12.1
 */

import { spawn } from 'child_process';
import type { ContentType } from './task-types';
import type { StructuredContentResult } from './hermes-content-executor';

// ============================================================================
// Types
// ============================================================================

export interface PublishResult {
  success: boolean;
  draftId?: string;
  publishedUrl?: string;
  error?: string;
  errorCode?: string;
}

export interface ContentPublishAdapter {
  publish(result: StructuredContentResult, taskId: string, executionMode?: string): Promise<PublishResult>;
}

// ============================================================================
// Staging Local Helper Client
// ============================================================================

async function callStagingHelper(action: string, payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const stagingHost = process.env.STAGING_SSH_HOST || 'deploy@192.129.155.149';
    const helperPath = process.env.STAGING_HELPER_PATH || '/home/deploy/xixiong-saas-staging/scripts/contentops/bridge-local-helper.ts';
    
    // Prepare JSON input with action
    const jsonInput = JSON.stringify({ action, ...payload });
    
    const child = spawn('ssh', [
      stagingHost,
      `cd /home/deploy/xixiong-saas-staging && echo '${jsonInput.replace(/'/g, "'\\''")}' | npx tsx ${helperPath}`
    ], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('STAGING_HELPER_TIMEOUT'));
    }, 60000);
    
    child.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code !== 0) {
        reject(new Error(`STAGING_HELPER_EXIT_${code}: ${stderr.substring(0, 500)}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        // Unwrap the bridge-local-helper response format
        // It returns { ok, status, data, error }
        // We need to extract data and map id to draftId
        if (result.ok && result.data) {
          resolve({
            draftId: result.data.id,
            publishedUrl: undefined, // Bridge API doesn't return publishedUrl for drafts
            ...result.data,
          });
        } else if (result.error) {
          reject(new Error(`STAGING_HELPER_ERROR: ${result.error.message || JSON.stringify(result.error)}`));
        } else {
          // Fallback: return as-is for backward compatibility
          resolve(result);
        }
      } catch (e) {
        reject(new Error('STAGING_HELPER_INVALID_JSON: ' + stdout.substring(0, 500)));
      }
    });
    
    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`STAGING_HELPER_SPAWN_FAILED: ${error.message}`));
    });
  });
}

// ============================================================================
// Guide Publish Adapter
// ============================================================================

export class GuidePublishAdapter implements ContentPublishAdapter {
  async publish(result: StructuredContentResult, taskId: string, executionMode?: string): Promise<PublishResult> {
    try {
      // For draft_only mode, skip staging helper and just save locally
      if (executionMode === 'draft_only') {
        return {
          success: true,
          draftId: `draft_${taskId}`,
          publishedUrl: null,
        };
      }
      
      const payload = {
        idempotencyKey: taskId,
        taskId,
        contentType: 'guide',
        title: result.title,
        slug: result.slug,
        excerpt: result.summary,
        body: result.content.body || '',
        audience: result.content.audience || '',
        steps: result.content.steps || [],
        pitfalls: result.content.pitfalls || [],
        faq: result.faq,
        seo: result.seo,
        geo: result.geo,
        sources: result.sources,
        internalLinks: result.internalLinks || [],
        structuredData: result.structuredData,
      };
      
      const response = await callStagingHelper('create_backend_draft', payload);
      
      return {
        success: true,
        draftId: response.draftId,
        publishedUrl: response.publishedUrl,
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        errorCode: error.message.startsWith('STAGING_') ? error.message : 'GUIDE_ADAPTER_ERROR',
      };
    }
  }
}

// ============================================================================
// Checklist Publish Adapter
// ============================================================================

export class ChecklistPublishAdapter implements ContentPublishAdapter {
  async publish(result: StructuredContentResult, taskId: string, executionMode?: string): Promise<PublishResult> {
    try {
      // For draft_only mode, skip staging helper and just save locally
      if (executionMode === 'draft_only') {
        return {
          success: true,
          draftId: `draft_${taskId}`,
          publishedUrl: null,
        };
      }
      
      const payload = {
        idempotencyKey: taskId,
        taskId,
        contentType: 'checklist',
        title: result.title,
        slug: result.slug,
        summary: result.summary,
        groups: result.content.groups || [],
        pitfalls: result.content.pitfalls || [],
        faq: result.faq,
        seo: result.seo,
        geo: result.geo,
        sources: result.sources,
        structuredData: result.structuredData,
      };
      
      const response = await callStagingHelper('create_backend_draft', payload);
      
      return {
        success: true,
        draftId: response.draftId,
        publishedUrl: response.publishedUrl,
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        errorCode: error.message.startsWith('STAGING_') ? error.message : 'CHECKLIST_ADAPTER_ERROR',
      };
    }
  }
}

// ============================================================================
// Topic Publish Adapter
// ============================================================================

export class TopicPublishAdapter implements ContentPublishAdapter {
  async publish(result: StructuredContentResult, taskId: string, executionMode?: string): Promise<PublishResult> {
    try {
      // For draft_only mode, skip staging helper and just save locally
      if (executionMode === 'draft_only') {
        return {
          success: true,
          draftId: `draft_${taskId}`,
          publishedUrl: null,
        };
      }
      
      const payload = {
        idempotencyKey: taskId,
        taskId,
        contentType: 'topic',
        title: result.title,
        slug: result.slug,
        summary: result.summary,
        hero: result.content.hero || '',
        subtopics: result.content.subtopics || [],
        relatedTools: result.content.relatedTools || [],
        relatedGuides: result.content.relatedGuides || [],
        relatedChecklists: result.content.relatedChecklists || [],
        relatedResources: result.content.relatedResources || [],
        faq: result.faq,
        cta: result.content.cta || '',
        blockConfiguration: result.content.blockConfiguration || [],
        seo: result.seo,
        geo: result.geo,
        structuredData: result.structuredData,
      };
      
      const response = await callStagingHelper('create_backend_draft', payload);
      
      return {
        success: true,
        draftId: response.draftId,
        publishedUrl: response.publishedUrl,
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        errorCode: error.message.startsWith('STAGING_') ? error.message : 'TOPIC_ADAPTER_ERROR',
      };
    }
  }
}

// ============================================================================
// Adapter Factory
// ============================================================================

export function getContentPublishAdapter(contentType: ContentType): ContentPublishAdapter {
  switch (contentType) {
    case 'guide':
      return new GuidePublishAdapter();
    case 'checklist':
      return new ChecklistPublishAdapter();
    case 'topic':
      return new TopicPublishAdapter();
    default:
      throw new Error(`UNKNOWN_CONTENT_TYPE: ${contentType}`);
  }
}
