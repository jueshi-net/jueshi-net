/**
 * ContentOps Hermes Content Executor — CLI Version
 * 
 * Calls Hermes CLI directly via subprocess.
 * Primary executor for Mac mini LaunchAgent environment.
 * 
 * V2-MVP: v1.20.42.18.6.21.12.1
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as os from 'os';
import { ContentNormalizer, CleaningResult } from './content-normalizer';
import { getContract, type ContentContract } from './contract-registry';
import type { ContentType, ContentOpsTask } from './task-types';
import { 
  extractJsonFromMarkdown, 
  extractNestedContent, 
  validateRawModelDraft, 
  normalizeFieldAliases, 
  hasMinimalViability 
} from './raw-model-draft-contract';

// ============================================================================
// Types
// ============================================================================

export interface StructuredContentResult {
  success: boolean;
  contentType: ContentType;
  title: string;
  slug: string;
  summary: string;
  content: any;
  seo: any;
  geo: any;
  sources: any[];
  faq: any[];
  internalLinks?: any[];
  structuredData?: any;
  
  // Pipeline metadata
  hermesRunId: string;
  provider: string;
  model: string;
  latencyMs: number;
  
  // Normalizer results
  normalizerIssues: CleaningResult['issues'];
  normalizerFixedCount: number;
  normalizerRemainingBlockingIssues: number;
  
  // Contract validation
  contractValidationPassed: boolean;
  contractErrors: string[];
  contractWarnings: string[];
  
  // Raw model output (for debugging)
  rawModelOutput?: any;
  
  // Error handling
  error?: string;
  errorCode?: string;
}

export interface ContentExecutor {
  execute(task: ContentOpsTask): Promise<StructuredContentResult>;
}

// ============================================================================
// Configuration
// ============================================================================

const HERMES_CLI_PATH = process.env.HERMES_CLI_PATH || path.join(os.homedir(), '.hermes/hermes-agent/venv/bin/hermes');
const HERMES_WORKING_DIR = process.env.HERMES_WORKING_DIR || path.join(os.homedir(), 'xixiong-saas');
const HERMES_TIMEOUT_MS = parseInt(process.env.HERMES_TIMEOUT_MS || '300000'); // 5 minutes
const HERMES_MAX_TURNS = parseInt(process.env.HERMES_MAX_TURNS || '5');

// ============================================================================
// Hermes CLI Client
// ============================================================================

async function callHermesCLI(prompt: string): Promise<{ content: string; latencyMs: number }> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const args = ['chat', '-q', prompt, '-Q', '--safe-mode', '--ignore-rules', '--max-turns', '1'];
    
    const child = spawn(HERMES_CLI_PATH, args, {
      cwd: HERMES_WORKING_DIR,
      env: { ...process.env },
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
      reject(new Error('HERMES_CLI_TIMEOUT'));
    }, HERMES_TIMEOUT_MS);
    
    child.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code !== 0) {
        reject(new Error(`HERMES_CLI_EXIT_${code}: ${stderr.substring(0, 500)}`));
        return;
      }
      
      resolve({
        content: stdout,
        latencyMs: Date.now() - startTime
      });
    });
    
    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`HERMES_CLI_SPAWN_FAILED: ${error.message}`));
    });
  });
}

// ============================================================================
// Hermes Content Executor Implementation
// ============================================================================

export class HermesContentExecutor implements ContentExecutor {
  async execute(task: ContentOpsTask): Promise<StructuredContentResult> {
    const startTime = Date.now();
    const hermesRunId = `hermes-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    const contentType = task.contentType || 'guide';
    
    try {
      // Build structured prompt
      const prompt = this.buildStructuredPrompt(contentType, task);
      
      // Call Hermes CLI
      const { content: rawOutput, latencyMs } = await callHermesCLI(prompt);
      
      // Save raw output for debugging (if enabled)
      if (process.env.CONTENTOPS_SAVE_RAW_OUTPUT === 'true') {
        const fs = await import('fs');
        const path = await import('path');
        const os = await import('os');
        const rawDir = path.join(os.homedir(), '.jueshi-contentops/raw-outputs');
        if (!fs.existsSync(rawDir)) {
          fs.mkdirSync(rawDir, { recursive: true });
        }
        const rawFile = path.join(rawDir, `${hermesRunId}.json`);
        fs.writeFileSync(rawFile, JSON.stringify({
          hermesRunId,
          contentType,
          taskId: (task as any).taskId || task.id || 'unknown',
          timestamp: new Date().toISOString(),
          rawOutput,
        }, null, 2));
      }
      
      // Extract JSON from markdown/code fence
      const extractedJson = extractJsonFromMarkdown(rawOutput);
      
      // Parse JSON output
      let parsed: any;
      try {
        parsed = JSON.parse(extractedJson);
      } catch (parseError) {
        throw new Error('HERMES_CLI_INVALID_JSON: ' + rawOutput.substring(0, 500));
      }
      
      // Extract nested content if present
      parsed = extractNestedContent(parsed);
      
      // Validate against Raw Model Draft Contract
      const rawValidation = validateRawModelDraft(parsed);
      if (!rawValidation.success) {
        console.error('[HermesExecutor] Raw contract validation failed:', rawValidation.errors);
        // Continue anyway - normalizer will attempt to fix
      }
      
      // Normalize field aliases
      const normalized = normalizeFieldAliases(parsed);
      
      // Check minimal viability with content type from task
      const viability = hasMinimalViability(normalized, contentType);
      if (!viability.viable) {
        throw new Error(`RAW_MODEL_NOT_VIABLE: ${viability.reason}`);
      }
      
      // Run through normalizer with normalized data
      const normalizer = new ContentNormalizer(contentType);
      const cleaningResult = normalizer.clean(normalized);
      
      // Enrich with deterministic system-generated metadata
      const { enrichContent, mergeEnrichedContent } = await import('./content-enricher');
      console.log('[HermesExecutor] Task executionMode:', (task as any).executionMode);
      const enriched = enrichContent({
        contentType,
        ...cleaningResult.content,
        taskId: task.id,
        topic: task.topic,
        targetAudience: (task as any).targetAudience,
        targetEnvironment: (task as any).targetEnvironment || 'staging',
      });
      
      // Merge enriched metadata with cleaned content
      const finalContent = mergeEnrichedContent(cleaningResult.content, enriched, {
        executionMode: (task as any).executionMode || 'draft_only',
      });
      console.log('[HermesExecutor] Final content executionMode:', finalContent.executionMode);
      
      // Validate against contract
      const contract = getContract(contentType);
      const structureValidation = contract.validateStructure(finalContent);
      const qualityValidation = contract.validateQuality(finalContent);
      
      const contractErrors = [...structureValidation.errors, ...qualityValidation.errors];
      const contractWarnings = [...structureValidation.warnings, ...qualityValidation.warnings];
      // For draft mode, only check contract errors, not normalizer remaining issues
      const isDraftMode = finalContent.executionMode === 'draft_only';
      const contractValidationPassed = contractErrors.length === 0 && (isDraftMode || cleaningResult.remainingCount === 0);
      
      // Build result
      const result: StructuredContentResult = {
        success: true,
        contentType,
        title: finalContent.title,
        slug: finalContent.slug,
        summary: finalContent.summary,
        content: finalContent,
        seo: finalContent.seo,
        geo: finalContent.geo,
        sources: finalContent.sources,
        faq: finalContent.faq,
        internalLinks: finalContent.internalLinks,
        structuredData: finalContent.structuredData,
        
        hermesRunId,
        provider: 'hermes-cli',
        model: 'hermes-agent',
        latencyMs,
        
        normalizerIssues: cleaningResult.issues,
        normalizerFixedCount: cleaningResult.fixedCount,
        normalizerRemainingBlockingIssues: cleaningResult.remainingCount,
        
        contractValidationPassed,
        contractErrors,
        contractWarnings,
        
        rawModelOutput: parsed,
      };
      
      return result;
      
    } catch (error: any) {
      return {
        success: false,
        contentType,
        title: '',
        slug: '',
        summary: '',
        content: {},
        seo: {},
        geo: {},
        sources: [],
        faq: [],
        
        hermesRunId,
        provider: 'hermes-cli',
        model: 'hermes-agent',
        latencyMs: Date.now() - startTime,
        
        normalizerIssues: [],
        normalizerFixedCount: 0,
        normalizerRemainingBlockingIssues: 0,
        
        contractValidationPassed: false,
        contractErrors: [],
        contractWarnings: [],
        
        error: error.message,
        errorCode: error.message.startsWith('HERMES_') ? error.message : 'HERMES_EXECUTOR_ERROR',
      };
    }
  }
  
  private buildStructuredPrompt(contentType: ContentType, task: ContentOpsTask): string {
    const basePrompt = `You are a content generation AI for a Chinese website targeting overseas Chinese and international students.

Generate ${contentType} content based on the following user input.

User input:
${task.rawInput}

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY valid JSON - no markdown, no explanation, no code, no scripts
2. DO NOT use any tools - just generate the JSON content directly
3. DO NOT write Python scripts or any other code
4. Your ENTIRE response must be a single valid JSON object
5. No text before or after the JSON

You must include ALL of the following fields at the TOP LEVEL of your JSON response:
{
  "title": "SEO-friendly title in Chinese, max 24 chars",
  "slug": "url-friendly-slug-in-english",
  "summary": "brief summary in Chinese, 100-200 chars",
  "contentType": "${contentType}",
  "audience": "target audience description in Chinese",
  "body": "full markdown body with H2/H3 sections, at least 1800 Chinese characters",
  "seo": {
    "title": "SEO title in Chinese",
    "description": "SEO description in Chinese",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  },
  "geo": {
    "targetCountry": "country name",
    "targetAudience": "audience description",
    "searchIntent": "informational|transactional|navigational"
  },
  "sources": [{"url": "https://...", "title": "source title", "publisher": "publisher name", "sourceType": "official|news|blog"}],
  "faq": [{"question": "Q in Chinese", "answer": "A in Chinese"}],
  "internalLinks": [{"url": "/path", "title": "link title", "reason": "why this link is relevant"}]
}`;

    if (contentType === 'guide') {
      return basePrompt + `

For GUIDE content type, you MUST also include these additional fields:
{
  "steps": ["step 1 description", "step 2 description", "step 3 description"],
  "pitfalls": ["pitfall 1 description", "pitfall 2 description"]
}

COMPLETE EXAMPLE for GUIDE:
{
  "title": "国际集运完整指南",
  "slug": "international-shipping-guide",
  "summary": "详细解读国际集运流程、费用计算、包装要求和常见问题",
  "contentType": "guide",
  "audience": "海外华人、留学生、跨境电商从业者",
  "body": "## 什么是国际集运\\n\\n国际集运是指...",
  "seo": {
    "title": "2026国际集运完整指南_费用流程包装一文搞定",
    "description": "国际集运完整指南，涵盖费用计算、包装要求、报关流程",
    "keywords": ["国际集运", "海外华人", "留学生", "跨境电商"]
  },
  "geo": {
    "targetCountry": "中国",
    "targetAudience": "海外华人及留学生",
    "searchIntent": "informational"
  },
  "sources": [{"url": "https://example.com", "title": "国际物流指南", "publisher": "物流协会", "sourceType": "official"}],
  "faq": [{"question": "国际集运需要多长时间？", "answer": "通常需要7-15个工作日"}],
  "internalLinks": [{"url": "/tools/shipping-calculator", "title": "运费计算器", "reason": "帮助计算集运费用"}],
  "steps": ["选择集运公司", "打包物品", "填写报关单", "支付运费"],
  "pitfalls": ["禁止寄送违禁品", "注意包装防震", "保留运输凭证"]
}

Requirements:
- Body must be at least 1800 Chinese characters
- Include at least 3 FAQ items
- Include at least 2 real, verifiable sources
- Include at least 2 internal links
- All content must be in Chinese`;
    }
    
    if (contentType === 'checklist') {
      return basePrompt + `

For CHECKLIST, the content must include:
{
  "content": {
    "groups": [
      {
        "title": "group title",
        "items": [
          {
            "title": "item title",
            "description": "item description",
            "required": true,
            "completionCondition": "how to know it's done",
            "riskNote": "risk warning if any"
          }
        ]
      }
    ],
    "pitfalls": [{"title": "title", "description": "description"}]
  }
}

Requirements:
- Must have at least 4 groups
- Each group must have at least 5 items
- Total items must be at least 20
- All content must be in Chinese`;
    }
    
    if (contentType === 'topic') {
      return basePrompt + `

For TOPIC, the content must include:
{
  "content": {
    "hero": "hero section content",
    "subtopics": [{"title": "title", "description": "description"}],
    "relatedTools": [{"name": "name", "url": "https://...", "description": "description"}],
    "relatedGuides": [{"title": "title", "url": "/guides/slug"}],
    "relatedChecklists": [{"title": "title", "url": "/checklists/slug"}],
    "relatedResources": [{"title": "title", "url": "https://..."}],
    "blockConfiguration": [{"type": "block type", "content": "..."}],
    "cta": "call to action"
  }
}

Requirements:
- Must have at least 5 blocks
- Include real tool links
- Include real guide and checklist links
- All content must be in Chinese`;
    }
    
    return basePrompt;
  }
  
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let executorInstance: HermesContentExecutor | null = null;

export function getContentExecutor(): ContentExecutor {
  if (!executorInstance) {
    executorInstance = new HermesContentExecutor();
  }
  return executorInstance;
}
