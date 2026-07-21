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
const HERMES_TIMEOUT_MS = parseInt(process.env.HERMES_TIMEOUT_MS || '180000'); // 3 minutes
const HERMES_MAX_TURNS = parseInt(process.env.HERMES_MAX_TURNS || '5');

// ============================================================================
// Hermes CLI Client
// ============================================================================

async function callHermesCLI(prompt: string): Promise<{ content: string; latencyMs: number }> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const args = ['chat', '-q', prompt, '-Q', '--max-turns', HERMES_MAX_TURNS.toString()];
    
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
      
      // Parse JSON output
      let parsed: any;
      try {
        // Clean markdown code blocks and warning messages
        const cleaned = rawOutput
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .replace(/^Warning:.*\n?/gm, '') // Remove warning lines
          .trim();
        parsed = JSON.parse(cleaned);
      } catch (parseError) {
        throw new Error('HERMES_CLI_INVALID_JSON: ' + rawOutput.substring(0, 500));
      }
      
      // Run through normalizer
      const normalizer = new ContentNormalizer(contentType);
      const cleaningResult = normalizer.clean(parsed);
      
      // Validate against contract
      const contract = getContract(contentType);
      const structureValidation = contract.validateStructure(cleaningResult.content);
      const qualityValidation = contract.validateQuality(cleaningResult.content);
      
      const contractErrors = [...structureValidation.errors, ...qualityValidation.errors];
      const contractWarnings = [...structureValidation.warnings, ...qualityValidation.warnings];
      const contractValidationPassed = contractErrors.length === 0 && cleaningResult.remainingCount === 0;
      
      // Build result
      const result: StructuredContentResult = {
        success: true,
        contentType,
        title: cleaningResult.content.title || task.topic || '',
        slug: cleaningResult.content.slug || this.generateSlug(task.topic || ''),
        summary: cleaningResult.content.summary || '',
        content: cleaningResult.content,
        seo: cleaningResult.content.seo || {},
        geo: cleaningResult.content.geo || {},
        sources: cleaningResult.content.sources || [],
        faq: cleaningResult.content.faq || [],
        internalLinks: cleaningResult.content.internalLinks || [],
        structuredData: cleaningResult.content.structuredData,
        
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

You must respond with valid JSON only, no markdown, no explanation.

The JSON structure must include:
{
  "title": "SEO-friendly title in Chinese, max 24 chars",
  "slug": "url-friendly-slug",
  "summary": "brief summary",
  "contentType": "${contentType}",
  "seo": {
    "title": "SEO title",
    "description": "SEO description",
    "keywords": ["keyword1", "keyword2"]
  },
  "geo": {
    "targetCountry": "country",
    "targetAudience": "audience",
    "searchIntent": "intent"
  },
  "sources": [{"url": "https://...", "title": "source title", "publisher": "publisher", "sourceType": "official"}],
  "faq": [{"question": "Q", "answer": "A"}],
  "internalLinks": [{"url": "/path", "title": "title", "reason": "reason"}]
}`;

    if (contentType === 'guide') {
      return basePrompt + `

For GUIDE, the content must include:
{
  "content": {
    "body": "full markdown body with H2/H3 sections",
    "audience": "target audience description",
    "steps": ["step1", "step2"],
    "pitfalls": ["pitfall1", "pitfall2"]
  }
}

Requirements:
- Body must be at least 1800 Chinese characters
- Include at least 5 FAQ items
- Include real, verifiable sources
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
