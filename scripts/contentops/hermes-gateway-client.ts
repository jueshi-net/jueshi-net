#!/usr/bin/env tsx
/**
 * Hermes Agent Gateway Client
 * 
 * Provides integration with Hermes Agent Gateway for AI-powered content planning.
 * If Gateway is unavailable, falls back to direct DeepSeek API calls.
 * 
 * V2-MVP: v1.20.42.18.6.16.6.84.4.8
 */

import { createHash } from 'crypto';
import { submitJob, pollJobResult, checkBridgeHealth, HermesJobResult as BridgeJobResult } from './hermes-job-bridge';

// ============================================================================
// Configuration
// ============================================================================

const GATEWAY_CONFIG = {
  enabled: process.env.HERMES_GATEWAY_ENABLED === 'true',
  gatewayUrl: process.env.HERMES_GATEWAY_URL || 'http://localhost:3001',
  apiKey: process.env.HERMES_GATEWAY_API_KEY,
  timeoutMs: 30000,
  cooldownMs: 30 * 60 * 1000, // 30 minutes
  maxRetries: 2,
};

const AI_CONFIG = {
  enabled: process.env.AI_ENABLED === 'true',
  apiBaseUrl: process.env.AI_API_BASE_URL || 'https://api.deepseek.com/v1',
  apiKey: process.env.AI_API_KEY,
  model: process.env.AI_MODEL || 'deepseek-chat',
  timeoutMs: 30000,
};

// ============================================================================
// Types
// ============================================================================

export type InputMode = 'long_text' | 'reference_rewrite' | 'messy_notes' | 'title_brief' | 'unknown';
export type ContentType = 'checklist' | 'guide' | 'topic';
export type SchemaType = 'checklist' | 'guide' | 'topic';

export interface HermesRunResult {
  hermesRunId: string;
  planningUsed: boolean;
  fallbackUsed: boolean;
  gatewayUsed: boolean;
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
// Cooldown Management
// ============================================================================

let lastErrorTime = 0;
let errorMessage = '';

function isCooldownActive(): boolean {
  return Date.now() - lastErrorTime < GATEWAY_CONFIG.cooldownMs;
}

function recordError(error: string): void {
  lastErrorTime = Date.now();
  errorMessage = error;
}

function getCooldownRemaining(): number {
  const elapsed = Date.now() - lastErrorTime;
  return Math.max(0, GATEWAY_CONFIG.cooldownMs - elapsed);
}

// ============================================================================
// Hermes Gateway API Call
// ============================================================================

async function callHermesGateway(prompt: string, systemPrompt: string): Promise<any> {
  if (!GATEWAY_CONFIG.enabled || !GATEWAY_CONFIG.gatewayUrl) {
    throw new Error('Hermes Gateway not enabled or URL not set');
  }

  if (isCooldownActive()) {
    const remaining = Math.ceil(getCooldownRemaining() / 1000 / 60);
    throw new Error(`Gateway cooldown active, ${remaining} minutes remaining. Last error: ${errorMessage}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GATEWAY_CONFIG.timeoutMs);

  try {
    const response = await fetch(`${GATEWAY_CONFIG.gatewayUrl}/api/hermes/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        systemPrompt,
        model: 'hermes-agent',
        temperature: 0.7,
        maxTokens: 4000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hermes Gateway error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.result) {
      throw new Error('Hermes Gateway returned empty result');
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      recordError('Hermes Gateway timeout');
      throw new Error('Hermes Gateway timeout');
    }
    
    recordError(error.message);
    throw error;
  }
}

// ============================================================================
// Direct DeepSeek API Call (Fallback)
// ============================================================================

async function callDeepSeekDirect(prompt: string, systemPrompt: string): Promise<string> {
  if (!AI_CONFIG.enabled || !AI_CONFIG.apiKey) {
    throw new Error('AI not enabled or API key not set');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs);

  try {
    const response = await fetch(`${AI_CONFIG.apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('AI API returned empty content');
    }

    return content;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('AI API timeout');
    }
    
    throw error;
  }
}

// ============================================================================
// Hermes Job Bridge Client
// 
// Bot only calls Hermes Job Bridge, never directly calls model APIs.
// If Hermes is unavailable, returns fallbackUsed=true and createAllowed=false.
// ============================================================================

export async function analyzeAndPlan(
  text: string,
  inputMode: InputMode
): Promise<HermesRunResult> {
  const hermesRunId = generateHermesRunId();
  const timestamp = new Date().toISOString();

  // Check if Hermes Job Bridge is enabled
  if (!GATEWAY_CONFIG.enabled) {
    console.log('[HermesGateway] Hermes Job Bridge not enabled, returning unavailable');
    return buildUnavailableResult(hermesRunId, timestamp, inputMode, 'Hermes Job Bridge not enabled');
  }

  // Check bridge health
  const health = checkBridgeHealth();
  if (!health.healthy) {
    console.log('[HermesGateway] Hermes Job Bridge unhealthy:', health.message);
    return buildUnavailableResult(hermesRunId, timestamp, inputMode, health.message);
  }

  // Submit job to Hermes
  let jobId: string;
  try {
    jobId = submitJob('contentops_generate', inputMode, text);
    console.log('[HermesGateway] Job submitted:', jobId);
  } catch (error: any) {
    console.error('[HermesGateway] Failed to submit job:', error.message);
    return buildUnavailableResult(hermesRunId, timestamp, inputMode, `Failed to submit job: ${error.message}`);
  }

  // Poll for result
  try {
    const result = await pollJobResult(jobId);
    
    if (!result) {
      return buildUnavailableResult(hermesRunId, timestamp, inputMode, 'Job returned empty result');
    }

    console.log('[HermesGateway] Job completed successfully');
    return {
      ...result,
      hermesRunId,
      gatewayUsed: true,
      planningUsed: true,
      fallbackUsed: false,
    };
  } catch (error: any) {
    console.error('[HermesGateway] Job failed:', error.message);
    return buildUnavailableResult(hermesRunId, timestamp, inputMode, error.message);
  }
}

// ============================================================================
// Natural Language Modification
// ============================================================================

export async function modifyPlan(
  currentPlan: HermesRunResult,
  modificationRequest: string
): Promise<HermesRunResult> {
  const hermesRunId = generateHermesRunId();
  const timestamp = new Date().toISOString();

  // Check if Hermes Job Bridge is enabled
  if (!GATEWAY_CONFIG.enabled) {
    console.log('[HermesGateway] Hermes Job Bridge not enabled for modification, returning unavailable');
    return {
      ...currentPlan,
      hermesRunId,
      gatewayUsed: false,
      planningUsed: false,
      fallbackUsed: true,
      timestamp,
      qualityGate: {
        pass: false,
        score: currentPlan.qualityGate.score,
        failures: [...currentPlan.qualityGate.failures, 'Hermes Job Bridge not enabled'],
        warnings: currentPlan.qualityGate.warnings || [],
      },
    };
  }

  // Check bridge health
  const health = checkBridgeHealth();
  if (!health.healthy) {
    console.log('[HermesGateway] Hermes Job Bridge unhealthy for modification:', health.message);
    return {
      ...currentPlan,
      hermesRunId,
      gatewayUsed: false,
      planningUsed: false,
      fallbackUsed: true,
      timestamp,
      qualityGate: {
        pass: false,
        score: currentPlan.qualityGate.score,
        failures: [...currentPlan.qualityGate.failures, `Hermes Job Bridge unhealthy: ${health.message}`],
        warnings: currentPlan.qualityGate.warnings || [],
      },
    };
  }

  // Submit modification job to Hermes
  let jobId: string;
  try {
    jobId = submitJob('contentops_modify', currentPlan.inputMode, modificationRequest, currentPlan);
    console.log('[HermesGateway] Modification job submitted:', jobId);
  } catch (error: any) {
    console.error('[HermesGateway] Failed to submit modification job:', error.message);
    return {
      ...currentPlan,
      hermesRunId,
      gatewayUsed: false,
      planningUsed: false,
      fallbackUsed: true,
      timestamp,
      qualityGate: {
        pass: false,
        score: currentPlan.qualityGate.score,
        failures: [...currentPlan.qualityGate.failures, `Failed to submit modification job: ${error.message}`],
        warnings: currentPlan.qualityGate.warnings || [],
      },
    };
  }

  // Poll for result
  try {
    const result = await pollJobResult(jobId);
    
    if (!result) {
      return {
        ...currentPlan,
        hermesRunId,
        gatewayUsed: false,
        planningUsed: false,
        fallbackUsed: true,
        timestamp,
        qualityGate: {
          pass: false,
          score: currentPlan.qualityGate.score,
          failures: [...currentPlan.qualityGate.failures, 'Modification job returned empty result'],
          warnings: currentPlan.qualityGate.warnings || [],
        },
      };
    }

    console.log('[HermesGateway] Modification job completed successfully');
    return {
      ...result,
      hermesRunId,
      gatewayUsed: true,
      planningUsed: true,
      fallbackUsed: false,
    };
  } catch (error: any) {
    console.error('[HermesGateway] Modification job failed:', error.message);
    return {
      ...currentPlan,
      hermesRunId,
      gatewayUsed: false,
      planningUsed: false,
      fallbackUsed: true,
      timestamp,
      qualityGate: {
        pass: false,
        score: currentPlan.qualityGate.score,
        failures: [...currentPlan.qualityGate.failures, `Modification job failed: ${error.message}`],
        warnings: currentPlan.qualityGate.warnings || [],
      },
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

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

function validateAndBuildResult(
  plan: any,
  hermesRunId: string,
  timestamp: string,
  inputMode: InputMode,
  gatewayUsed: boolean,
  planningUsed: boolean,
  fallbackUsed: boolean
): HermesRunResult {
  // Validate required fields
  if (!plan.contentType || !['checklist', 'guide', 'topic'].includes(plan.contentType)) {
    throw new Error('Invalid contentType');
  }

  if (!plan.title || plan.title.length === 0) {
    throw new Error('Title is required');
  }

  // Build content based on schema type
  let content: any;
  
  if (plan.contentType === 'topic') {
    content = buildTopicContent(plan);
  } else if (plan.contentType === 'guide') {
    content = buildGuideContent(plan);
  } else {
    content = buildChecklistContent(plan);
  }

  // Build quality gate
  const qualityGate = buildQualityGate(plan, content);

  // Build structured data
  const structuredData = buildStructuredData(plan, content);

  return {
    hermesRunId,
    gatewayUsed,
    planningUsed,
    fallbackUsed,
    inputMode,
    contentType: plan.contentType,
    schemaType: plan.schemaType || plan.contentType,
    title: plan.title,
    targetAudience: plan.targetAudience || '海外华人和留学生',
    targetCountries: plan.targetCountries || [],
    audienceStage: plan.audienceStage || 'beginner',
    searchIntent: plan.searchIntent || 'informational',
    sourceFacts: plan.sourceFacts || [],
    content,
    seo: plan.seo || {
      primaryKeyword: '',
      secondaryKeywords: [],
      metaTitle: plan.title,
      metaDescription: '',
      metaKeywords: [],
      slug: '',
    },
    geo: plan.geo || {
      targetAudience: plan.targetAudience || '海外华人和留学生',
      targetCountries: plan.targetCountries || [],
      audienceStage: plan.audienceStage || 'beginner',
      searchIntent: plan.searchIntent || 'informational',
    },
    structuredData,
    qualityGate,
    timestamp,
  };
}

function buildTopicContent(plan: any): any {
  const content = plan.content || {};
  
  return {
    intro: content.intro || '',
    categories: content.categories || [],
    resources: content.resources || [],
    scenarioMap: content.scenarioMap || [],
    comparisonTable: content.comparisonTable || { headers: [], rows: [] },
    ratingTierExplanation: content.ratingTierExplanation || '',
    faq: content.faq || [],
    pitfalls: content.pitfalls || [],
    internalLinks: content.internalLinks || [],
    relatedTools: content.relatedTools || [],
  };
}

function buildGuideContent(plan: any): any {
  const content = plan.content || {};
  
  return {
    intro: content.intro || '',
    steps: content.steps || [],
    tips: content.tips || [],
    warnings: content.warnings || [],
    faq: content.faq || [],
    pitfalls: content.pitfalls || [],
    internalLinks: content.internalLinks || [],
    relatedTools: content.relatedTools || [],
  };
}

function buildChecklistContent(plan: any): any {
  const content = plan.content || {};
  
  return {
    intro: content.intro || '',
    items: content.items || [],
    categories: content.categories || [],
    faq: content.faq || [],
    pitfalls: content.pitfalls || [],
    internalLinks: content.internalLinks || [],
    relatedTools: content.relatedTools || [],
  };
}

function buildQualityGate(plan: any, content: any): any {
  const failures: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Check content type specific requirements
  if (plan.contentType === 'topic') {
    const introLen = (content.intro || '').length;
    if (introLen < 300) {
      failures.push(`intro 仅 ${introLen} 字，需 >= 300`);
      score -= 15;
    }

    const resourceCount = content.resources?.length || 0;
    if (resourceCount < 8) {
      failures.push(`resources 仅 ${resourceCount} 个，需 >= 8`);
      score -= 15;
    }

    const categoryCount = content.categories?.length || 0;
    if (categoryCount < 4) {
      failures.push(`categories 仅 ${categoryCount} 个，需 >= 4`);
      score -= 10;
    }

    const faqCount = content.faq?.length || 0;
    if (faqCount < 5) {
      failures.push(`FAQ 仅 ${faqCount} 个，需 >= 5`);
      score -= 10;
    }

    const pitfallCount = content.pitfalls?.length || 0;
    if (pitfallCount < 5) {
      failures.push(`pitfalls 仅 ${pitfallCount} 个，需 >= 5`);
      score -= 10;
    }

    const linkCount = content.internalLinks?.length || 0;
    if (linkCount < 5) {
      failures.push(`internalLinks 仅 ${linkCount} 个，需 >= 5`);
      score -= 5;
    }

    const toolCount = content.relatedTools?.length || 0;
    if (toolCount < 3) {
      failures.push(`relatedTools 仅 ${toolCount} 个，需 >= 3`);
      score -= 5;
    }

    // Check S/A/B/C rating
    const hasRating = content.resources?.some((r: any) => r.ratingTier);
    if (!hasRating) {
      failures.push('resources 缺少 S/A/B/C 分级');
      score -= 10;
    }
  }

  return {
    pass: failures.length === 0,
    score: Math.max(0, score),
    failures,
    warnings,
  };
}

function buildStructuredData(plan: any, content: any): any {
  if (plan.contentType === 'topic') {
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: plan.title,
      description: content.intro || '',
      itemListElement: (content.resources || []).map((r: any, i: number) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: r.name,
        description: r.reason,
      })),
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    name: plan.title,
    description: content.intro || '',
  };
}

function buildFallbackResult(
  hermesRunId: string,
  timestamp: string,
  inputMode: InputMode,
  errorMessage: string
): HermesRunResult {
  return {
    hermesRunId,
    gatewayUsed: false,
    planningUsed: false,
    fallbackUsed: true,
    inputMode,
    contentType: 'guide',
    schemaType: 'guide',
    title: '内容规划失败',
    targetAudience: '海外华人和留学生',
    targetCountries: [],
    audienceStage: 'beginner',
    searchIntent: 'informational',
    sourceFacts: [],
    content: {
      intro: `AI 内容规划失败：${errorMessage}。请重试。`,
      steps: [],
      tips: [],
      warnings: [],
      faq: [],
      pitfalls: [],
      internalLinks: [],
      relatedTools: [],
    },
    seo: {
      primaryKeyword: '',
      secondaryKeywords: [],
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
      slug: '',
    },
    geo: {
      targetAudience: '海外华人和留学生',
      targetCountries: [],
      audienceStage: 'beginner',
      searchIntent: 'informational',
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      name: '',
      description: '',
    },
    qualityGate: {
      pass: false,
      score: 0,
      failures: [`AI planning failed: ${errorMessage}`],
      warnings: [],
    },
    timestamp,
  };
}

function generateHermesRunId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `hermes-${timestamp}-${random}`;
}

function buildUnavailableResult(
  hermesRunId: string,
  timestamp: string,
  inputMode: InputMode,
  errorMessage: string
): HermesRunResult {
  return {
    hermesRunId,
    gatewayUsed: false,
    planningUsed: false,
    fallbackUsed: true,
    inputMode,
    contentType: 'guide',
    schemaType: 'guide',
    title: '内容生成服务未就绪',
    targetAudience: '海外华人和留学生',
    targetCountries: [],
    audienceStage: 'beginner',
    searchIntent: 'informational',
    sourceFacts: [],
    content: {
      intro: `Hermes 内容生成服务未就绪：${errorMessage}。请联系管理员配置 Hermes Agent。`,
      steps: [],
      tips: [],
      warnings: [],
      faq: [],
      pitfalls: [],
      internalLinks: [],
      relatedTools: [],
    },
    seo: {
      primaryKeyword: '',
      secondaryKeywords: [],
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
      slug: '',
    },
    geo: {
      targetAudience: '海外华人和留学生',
      targetCountries: [],
      audienceStage: 'beginner',
      searchIntent: 'informational',
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      name: '',
      description: '',
    },
    qualityGate: {
      pass: false,
      score: 0,
      failures: [`Hermes unavailable: ${errorMessage}`],
      warnings: ['内容生成服务未就绪，无法创建 draft'],
    },
    timestamp,
  };
}
