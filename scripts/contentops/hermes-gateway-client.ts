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
// Content Analysis & Planning
// ============================================================================

export async function analyzeAndPlan(
  text: string,
  inputMode: InputMode
): Promise<HermesRunResult> {
  const hermesRunId = generateHermesRunId();
  const timestamp = new Date().toISOString();

  const systemPrompt = buildSystemPrompt();
  const prompt = buildPrompt(text, inputMode);

  let gatewayUsed = false;
  let planningUsed = false;
  let fallbackUsed = false;
  let aiResponse: string;

  // Try Hermes Gateway first
  if (GATEWAY_CONFIG.enabled) {
    try {
      console.log('[HermesGateway] Attempting to call Hermes Gateway...');
      const gatewayResult = await callHermesGateway(prompt, systemPrompt);
      
      gatewayUsed = true;
      planningUsed = true;
      fallbackUsed = false;
      aiResponse = gatewayResult.result;
      
      console.log('[HermesGateway] Gateway call successful');
    } catch (error: any) {
      console.error('[HermesGateway] Gateway call failed:', error.message);
      console.log('[HermesGateway] Falling back to direct DeepSeek API...');
      
      // Fallback to direct DeepSeek
      try {
        aiResponse = await callDeepSeekDirect(prompt, systemPrompt);
        gatewayUsed = false;
        planningUsed = true;
        fallbackUsed = false;
      } catch (fallbackError: any) {
        console.error('[HermesGateway] Direct API also failed:', fallbackError.message);
        gatewayUsed = false;
        planningUsed = false;
        fallbackUsed = true;
        
        return buildFallbackResult(hermesRunId, timestamp, inputMode, fallbackError.message);
      }
    }
  } else {
    // Gateway not enabled, use direct DeepSeek
    console.log('[HermesGateway] Gateway not enabled, using direct DeepSeek API...');
    try {
      aiResponse = await callDeepSeekDirect(prompt, systemPrompt);
      gatewayUsed = false;
      planningUsed = true;
      fallbackUsed = false;
    } catch (error: any) {
      console.error('[HermesGateway] Direct API failed:', error.message);
      gatewayUsed = false;
      planningUsed = false;
      fallbackUsed = true;
      
      return buildFallbackResult(hermesRunId, timestamp, inputMode, error.message);
    }
  }

  // Parse AI response
  let plan: any;
  try {
    const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    plan = JSON.parse(cleaned);
  } catch (parseError) {
    console.error('[HermesGateway] Failed to parse AI response as JSON:', aiResponse);
    return buildFallbackResult(hermesRunId, timestamp, inputMode, 'AI response is not valid JSON');
  }

  // Validate and build result
  return validateAndBuildResult(plan, hermesRunId, timestamp, inputMode, gatewayUsed, planningUsed, fallbackUsed);
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

  const systemPrompt = `You are a content modification AI.
The user has a content plan and wants to modify it based on their request.
You must respond with valid JSON only, no markdown, no explanation.

Return the modified plan with the same structure as the original.`;

  const prompt = `Current plan:
${JSON.stringify(currentPlan, null, 2)}

User modification request:
${modificationRequest}

Please modify the plan according to the user's request.
Remember to respond with valid JSON only.`;

  let gatewayUsed = false;
  let planningUsed = false;
  let fallbackUsed = false;
  let aiResponse: string;

  // Try Hermes Gateway first
  if (GATEWAY_CONFIG.enabled) {
    try {
      const gatewayResult = await callHermesGateway(prompt, systemPrompt);
      gatewayUsed = true;
      planningUsed = true;
      fallbackUsed = false;
      aiResponse = gatewayResult.result;
    } catch (error: any) {
      console.error('[HermesGateway] Gateway modification failed:', error.message);
      
      // Fallback to direct DeepSeek
      try {
        aiResponse = await callDeepSeekDirect(prompt, systemPrompt);
        gatewayUsed = false;
        planningUsed = true;
        fallbackUsed = false;
      } catch (fallbackError: any) {
        console.error('[HermesGateway] Direct modification also failed:', fallbackError.message);
        gatewayUsed = false;
        planningUsed = false;
        fallbackUsed = true;
        
        return {
          ...currentPlan,
          hermesRunId,
          timestamp,
          qualityGate: {
            pass: false,
            score: currentPlan.qualityGate.score,
            failures: [...currentPlan.qualityGate.failures, `AI modification failed: ${fallbackError.message}`],
            warnings: currentPlan.qualityGate.warnings || [],
          },
        };
      }
    }
  } else {
    // Gateway not enabled, use direct DeepSeek
    try {
      aiResponse = await callDeepSeekDirect(prompt, systemPrompt);
      gatewayUsed = false;
      planningUsed = true;
      fallbackUsed = false;
    } catch (error: any) {
      console.error('[HermesGateway] Direct modification failed:', error.message);
      gatewayUsed = false;
      planningUsed = false;
      fallbackUsed = true;
      
      return {
        ...currentPlan,
        hermesRunId,
        timestamp,
        qualityGate: {
          pass: false,
          score: currentPlan.qualityGate.score,
          failures: [...currentPlan.qualityGate.failures, `AI modification failed: ${error.message}`],
          warnings: currentPlan.qualityGate.warnings || [],
        },
      };
    }
  }

  // Parse AI response
  let modifiedPlan: any;
  try {
    const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    modifiedPlan = JSON.parse(cleaned);
  } catch (parseError) {
    console.error('[HermesGateway] Failed to parse modification response:', aiResponse);
    return {
      ...currentPlan,
      hermesRunId,
      timestamp,
      qualityGate: {
        pass: false,
        score: currentPlan.qualityGate.score,
        failures: [...currentPlan.qualityGate.failures, 'AI modification response is not valid JSON'],
        warnings: currentPlan.qualityGate.warnings || [],
      },
    };
  }

  // Rebuild quality gate
  const qualityGate = buildQualityGate(modifiedPlan, modifiedPlan.content);

  return {
    ...modifiedPlan,
    hermesRunId,
    gatewayUsed,
    planningUsed,
    fallbackUsed,
    qualityGate,
    timestamp,
  };
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
