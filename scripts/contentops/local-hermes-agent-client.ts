#!/usr/bin/env tsx
/**
 * Local Hermes Agent Client
 * 
 * Calls local Hermes Agent via CLI (hermes chat -q "prompt" -Q)
 * This is the singlePollerLocation=local implementation.
 * 
 * V2-MVP: v1.20.42.18.6.16.6.84.4.9
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { createHash } from 'crypto';

const execAsync = promisify(exec);

// ============================================================================
// Configuration
// ============================================================================

const LOCAL_HERMES_CONFIG = {
  enabled: process.env.LOCAL_HERMES_ENABLED === 'true',
  hermesPath: process.env.LOCAL_HERMES_PATH || 'hermes',
  timeoutMs: 60000, // 60 seconds for complex content generation
  maxTurns: 1,
};

// ============================================================================
// Types
// ============================================================================

export type InputMode = 'long_text' | 'reference_rewrite' | 'messy_notes' | 'title_brief' | 'title' | 'unknown';
export type ContentType = 'checklist' | 'guide' | 'topic';
export type SchemaType = 'checklist' | 'guide' | 'topic';

export interface LocalHermesRunResult {
  localHermesRunId: string;
  gatewayLocation: 'local';
  planningUsed: boolean;
  fallbackUsed: boolean;
  inputMode: InputMode;
  contentType: ContentType;
  schemaType: SchemaType;
  title: string;
  targetAudience: string;
  targetCountries: string[];
  audienceStage: string;
  searchIntent: string;
  sourceFacts: any[];
  content: any;
  seo: any;
  geo: any;
  structuredData: any;
  qualityGate: any;
  timestamp: string;
}

// ============================================================================
// Local Hermes Agent Call
// ============================================================================

export async function callLocalHermesAgent(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  if (!LOCAL_HERMES_CONFIG.enabled) {
    throw new Error('Local Hermes Agent not enabled');
  }

  // Build the full prompt with system instruction
  const fullPrompt = `${systemPrompt}\n\n${prompt}`;

  // Escape single quotes in prompt for shell
  const escapedPrompt = fullPrompt.replace(/'/g, "'\\''");

  const command = `${LOCAL_HERMES_CONFIG.hermesPath} chat -q '${escapedPrompt}' -Q --max-turns ${LOCAL_HERMES_CONFIG.maxTurns}`;

  console.log('[LocalHermes] Executing:', command.substring(0, 100) + '...');

  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: LOCAL_HERMES_CONFIG.timeoutMs,
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });

    if (stderr && !stderr.includes('session_id:')) {
      console.warn('[LocalHermes] stderr:', stderr);
    }

    // Extract the response (skip session_id line)
    const lines = stdout.split('\n');
    const responseLines = lines.filter(line => !line.startsWith('session_id:'));
    const response = responseLines.join('\n').trim();

    if (!response) {
      throw new Error('Local Hermes Agent returned empty response');
    }

    console.log('[LocalHermes] Response length:', response.length);
    return response;
  } catch (error: any) {
    console.error('[LocalHermes] Error:', error.message);
    throw error;
  }
}

// ============================================================================
// Content Planning
// ============================================================================

export async function analyzeAndPlanLocal(
  text: string,
  inputMode: InputMode
): Promise<LocalHermesRunResult> {
  const localHermesRunId = generateLocalHermesRunId();
  const timestamp = new Date().toISOString();

  if (!LOCAL_HERMES_CONFIG.enabled) {
    console.log('[LocalHermes] Not enabled, returning unavailable');
    return buildUnavailableResult(localHermesRunId, timestamp, inputMode, 'Local Hermes Agent not enabled');
  }

  const systemPrompt = buildSystemPrompt();
  const prompt = buildPrompt(text, inputMode);

  try {
    console.log('[LocalHermes] Calling local Hermes Agent for content planning...');
    const response = await callLocalHermesAgent(prompt, systemPrompt);

    // Parse JSON response
    let plan: any;
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError: any) {
      console.error('[LocalHermes] Failed to parse JSON:', parseError.message);
      console.error('[LocalHermes] Raw response:', response.substring(0, 500));
      throw new Error(`Failed to parse Hermes response: ${parseError.message}`);
    }

    // Validate and build result
    const result = validateAndBuildResult(plan, localHermesRunId, timestamp, inputMode);

    console.log('[LocalHermes] Content planning completed successfully');
    console.log('[LocalHermes] contentType:', result.contentType);
    console.log('[LocalHermes] title:', result.title);

    return result;
  } catch (error: any) {
    console.error('[LocalHermes] Content planning failed:', error.message);
    return buildUnavailableResult(localHermesRunId, timestamp, inputMode, error.message);
  }
}

// ============================================================================
// Natural Language Modification
// ============================================================================

export async function modifyPlanLocal(
  currentPlan: LocalHermesRunResult,
  modificationRequest: string
): Promise<LocalHermesRunResult> {
  const localHermesRunId = generateLocalHermesRunId();
  const timestamp = new Date().toISOString();

  if (!LOCAL_HERMES_CONFIG.enabled) {
    console.log('[LocalHermes] Not enabled for modification, returning unavailable');
    return {
      ...currentPlan,
      localHermesRunId,
      gatewayLocation: 'local' as const,
      planningUsed: false,
      fallbackUsed: true,
      timestamp,
      qualityGate: {
        pass: false,
        score: currentPlan.qualityGate.score,
        failures: [...currentPlan.qualityGate.failures, 'Local Hermes Agent not enabled'],
        warnings: currentPlan.qualityGate.warnings || [],
      },
    };
  }

  const systemPrompt = buildModificationSystemPrompt();
  const prompt = buildModificationPrompt(currentPlan, modificationRequest);

  try {
    console.log('[LocalHermes] Calling local Hermes Agent for modification...');
    const response = await callLocalHermesAgent(prompt, systemPrompt);

    // Parse JSON response
    let plan: any;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError: any) {
      console.error('[LocalHermes] Failed to parse modification JSON:', parseError.message);
      throw new Error(`Failed to parse Hermes modification response: ${parseError.message}`);
    }

    // Validate and build result
    const result = validateAndBuildResult(plan, localHermesRunId, timestamp, currentPlan.inputMode);

    console.log('[LocalHermes] Modification completed successfully');
    console.log('[LocalHermes] new title:', result.title);

    return result;
  } catch (error: any) {
    console.error('[LocalHermes] Modification failed:', error.message);
    return {
      ...currentPlan,
      localHermesRunId,
      gatewayLocation: 'local' as const,
      planningUsed: false,
      fallbackUsed: true,
      timestamp,
      qualityGate: {
        pass: false,
        score: currentPlan.qualityGate.score,
        failures: [...currentPlan.qualityGate.failures, `Modification failed: ${error.message}`],
        warnings: currentPlan.qualityGate.warnings || [],
      },
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateLocalHermesRunId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  const hash = createHash('sha256').update(`${timestamp}-${random}`).digest('hex').substring(0, 8);
  return `lhr_${timestamp}_${random}_${hash}`;
}

function buildUnavailableResult(
  localHermesRunId: string,
  timestamp: string,
  inputMode: InputMode,
  reason: string
): LocalHermesRunResult {
  return {
    localHermesRunId,
    gatewayLocation: 'local',
    planningUsed: false,
    fallbackUsed: true,
    inputMode,
    contentType: 'guide',
    schemaType: 'guide',
    title: '内容生成服务未就绪',
    targetAudience: '',
    targetCountries: [],
    audienceStage: 'beginner',
    searchIntent: 'informational',
    sourceFacts: [],
    content: {},
    seo: {},
    geo: {},
    structuredData: {},
    qualityGate: {
      pass: false,
      score: 0,
      failures: [reason],
      warnings: [],
    },
    timestamp,
  };
}

function buildSystemPrompt(): string {
  return `You are a content planning AI for a Chinese website targeting overseas Chinese and international students.
Your task is to analyze user input and create a structured content plan.
You must respond with valid JSON only, no markdown, no explanation.

The JSON structure must include:
{
  "inputMode": "long_text" | "reference_rewrite" | "messy_notes",
  "contentType": "checklist" | "guide" | "topic",
  "schemaType": "checklist" | "guide" | "topic",
  "title": "SEO-friendly title in Chinese, max 24 chars",
  "targetAudience": "target audience description",
  "targetCountries": ["country1", "country2"],
  "audienceStage": "beginner" | "intermediate" | "advanced",
  "searchIntent": "informational" | "navigational" | "transactional",
  "sourceFacts": [{"id": "fact1", "text": "fact text", "category": "category"}],
  "content": { ... schema-specific content ... },
  "seo": {
    "primaryKeyword": "primary keyword",
    "secondaryKeywords": ["keyword1", "keyword2"],
    "metaTitle": "meta title",
    "metaDescription": "meta description",
    "metaKeywords": ["keyword1", "keyword2"]
  },
  "geo": {
    "targetAudience": "audience",
    "targetCountries": ["country1"],
    "audienceStage": "stage",
    "searchIntent": "intent"
  }
}

Content type selection rules:
- checklist: preparation items, material lists, step-by-step checklists
- guide: process explanation, operation guides, knowledge tutorials
- topic: resource recommendations, APP recommendations, tool collections, topic reviews, multi-scenario comparisons

For reference_rewrite with APP/tool content, choose "topic".
For long_text with process/steps, choose "guide".
For messy_notes with items/lists, choose "checklist".

Topic content structure:
{
  "intro": "introduction >= 300 chars",
  "categories": ["category1", "category2", "category3", "category4"],
  "resources": [
    {
      "name": "resource name",
      "category": "category",
      "ratingTier": "S" | "A" | "B" | "C",
      "recommendationLevel": "highly recommended" | "recommended" | "optional" | "not recommended",
      "suitableFor": ["audience1", "audience2"],
      "scenario": "usage scenario",
      "reason": "recommendation reason",
      "caution": "caution or warning",
      "countries": ["country1", "country2"],
      "officialOrSafeDownloadNote": "download note"
    }
  ],
  "scenarioMap": [
    {
      "scenario": "scenario name",
      "recommendedResources": ["resource1", "resource2"],
      "priority": "high" | "medium" | "low"
    }
  ],
  "comparisonTable": {
    "headers": ["feature", "resource1", "resource2"],
    "rows": [{"feature": "feature name", "resources": {"resource1": "value1", "resource2": "value2"}}]
  },
  "ratingTierExplanation": "explanation of S/A/B/C rating system",
  "faq": [{"question": "Q", "answer": "A"}],
  "pitfalls": [{"title": "title", "description": "description", "severity": "high" | "medium" | "low"}],
  "internalLinks": [{"url": "/path", "title": "title", "context": "context"}],
  "relatedTools": [{"name": "name", "url": "https://...", "description": "description"}]
}`;
}

function buildPrompt(text: string, inputMode: InputMode): string {
  return `Analyze the following user input and create a structured content plan:

${text}

Input mode: ${inputMode}

Remember:
- Respond with valid JSON only
- Title must be SEO-friendly, max 24 Chinese characters
- For reference_rewrite with APP/tool content, choose contentType="topic"
- Topic must have >= 8 resources with S/A/B/C rating
- Include scenarioMap, comparisonTable, FAQ >= 5, pitfalls >= 5
- All content must be in Chinese`;
}

function buildModificationSystemPrompt(): string {
  return `You are a content modification AI. You will receive an existing content plan and a modification request.
You must return the modified content plan as valid JSON only, no markdown, no explanation.
Apply the requested changes while maintaining the overall structure and quality.`;
}

function buildModificationPrompt(currentPlan: LocalHermesRunResult, modificationRequest: string): string {
  return `Current content plan:
${JSON.stringify(currentPlan, null, 2)}

Modification request:
${modificationRequest}

Return the modified content plan as valid JSON.`;
}

function validateAndBuildResult(
  plan: any,
  localHermesRunId: string,
  timestamp: string,
  inputMode: InputMode
): LocalHermesRunResult {
  // Validate required fields
  if (!plan.contentType || !['checklist', 'guide', 'topic'].includes(plan.contentType)) {
    throw new Error('Invalid contentType');
  }

  if (!plan.title || plan.title.length === 0) {
    throw new Error('Title is required');
  }

  // Validate topic schema
  if (plan.contentType === 'topic') {
    if (!plan.content?.resources || plan.content.resources.length < 8) {
      throw new Error('Topic must have >= 8 resources');
    }

    // Check S/A/B/C rating
    const ratingTiers = plan.content.resources.map((r: any) => r.ratingTier);
    const hasSABC = ratingTiers.some((t: string) => ['S', 'A', 'B', 'C'].includes(t));
    if (!hasSABC) {
      throw new Error('Topic resources must have S/A/B/C rating');
    }
  }

  // Build quality gate
  const qualityGate = buildQualityGate(plan);

  return {
    localHermesRunId,
    gatewayLocation: 'local',
    planningUsed: true,
    fallbackUsed: false,
    inputMode,
    contentType: plan.contentType,
    schemaType: plan.schemaType || plan.contentType,
    title: plan.title,
    targetAudience: plan.targetAudience || '',
    targetCountries: plan.targetCountries || [],
    audienceStage: plan.audienceStage || 'beginner',
    searchIntent: plan.searchIntent || 'informational',
    sourceFacts: plan.sourceFacts || [],
    content: plan.content || {},
    seo: plan.seo || {},
    geo: plan.geo || {},
    structuredData: plan.structuredData || {},
    qualityGate,
    timestamp,
  };
}

function buildQualityGate(plan: any): any {
  const failures: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Check title length
  if (plan.title && plan.title.length > 24) {
    warnings.push('Title exceeds 24 characters');
    score -= 5;
  }

  // Check topic requirements
  if (plan.contentType === 'topic') {
    if (!plan.content?.resources || plan.content.resources.length < 8) {
      failures.push('Topic must have >= 8 resources');
      score -= 20;
    }

    if (!plan.content?.scenarioMap) {
      failures.push('Topic must have scenarioMap');
      score -= 10;
    }

    if (!plan.content?.comparisonTable) {
      failures.push('Topic must have comparisonTable');
      score -= 10;
    }

    if (!plan.content?.faq || plan.content.faq.length < 5) {
      failures.push('Topic must have >= 5 FAQ');
      score -= 10;
    }

    if (!plan.content?.pitfalls || plan.content.pitfalls.length < 5) {
      failures.push('Topic must have >= 5 pitfalls');
      score -= 10;
    }
  }

  return {
    pass: failures.length === 0 && score >= 70,
    score,
    failures,
    warnings,
  };
}
