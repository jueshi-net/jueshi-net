/**
 * ContentOps AI Content Generation Provider
 * 
 * Abstraction layer for AI-powered content generation.
 * Supports brief generation, outline, full draft, revision, SEO, FAQ.
 * 
 * Provider: DeepSeek (configurable via env)
 * No direct model vendor binding in business code.
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface WritingBrief {
  topic: string;
  contentType: 'guide' | 'topic' | 'checklist';
  targetAudience: string;
  searchIntent: string;
  tone: string;
  language: string;
  country: string;
  city?: string;
  industry?: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  requiredSections: string[];
  excludedClaims: string[];
  requestedLength: string;
  sourceRequirements: string;
  internalLinkRequirements: string;
  createdBy: string;
  createdAt: string;
}

export interface OutlineSection {
  heading: string;
  level: 2 | 3;
  description: string;
  keyPoints: string[];
}

export interface GeneratedContent {
  title: string;
  slug: string;
  summary: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  canonicalSuggestion?: string;
  faq: Array<{ question: string; answer: string }>;
  sources: Array<{ title: string; url?: string; retrievedAt?: string; type: 'stable' | 'volatile' }>;
  internalLinks: Array<{ url: string; title: string; reason: string }>;
  structuredDataSuggestion?: any;
  wordCount: number;
}

export interface GenerationRequest {
  topic: string;
  contentType?: 'guide' | 'topic' | 'checklist';
  brief?: WritingBrief;
  outline?: OutlineSection[];
  currentContent?: string;
  revisionInstructions?: string;
}

export interface GenerationResult {
  success: boolean;
  brief?: WritingBrief;
  outline?: OutlineSection[];
  content?: GeneratedContent;
  revisionSummary?: string;
  error?: string;
  errorCode?: string;
  provider: string;
  model: string;
  requestId: string;
  tokenUsage?: { prompt: number; completion: number; total: number };
  latencyMs: number;
}

// ============================================================================
// Provider Interface
// ============================================================================

export interface ContentGenerationProvider {
  generateBrief(topic: string, context?: Partial<WritingBrief>): Promise<GenerationResult>;
  generateOutline(brief: WritingBrief): Promise<GenerationResult>;
  generateDraft(brief: WritingBrief, outline: OutlineSection[]): Promise<GenerationResult>;
  reviseDraft(currentContent: string, brief: WritingBrief, instructions: string): Promise<GenerationResult>;
  generateSeo(content: GeneratedContent): Promise<GenerationResult>;
  generateFaq(content: GeneratedContent, brief: WritingBrief): Promise<GenerationResult>;
}

// ============================================================================
// Configuration
// ============================================================================

const AI_CONFIG = {
  enabled: process.env.AI_ENABLED === 'true',
  apiBaseUrl: process.env.AI_API_BASE_URL || 'https://api.deepseek.com/v1',
  apiKey: process.env.AI_API_KEY || '',
  model: process.env.AI_MODEL || 'deepseek-chat',
  timeoutMs: 60000,
  maxRetries: 2,
};

// ============================================================================
// DeepSeek Provider Implementation
// ============================================================================

class DeepSeekProvider implements ContentGenerationProvider {
  private async callModel(
    systemPrompt: string,
    userPrompt: string,
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<{ content: string; tokenUsage?: { prompt: number; completion: number; total: number }; latencyMs: number }> {
    if (!AI_CONFIG.enabled || !AI_CONFIG.apiKey) {
      throw new Error('AI_PROVIDER_NOT_CONFIGURED');
    }

    const startTime = Date.now();
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
            { role: 'user', content: userPrompt },
          ],
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 4000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 429) {
          throw new Error('CONTENTOPS-MODEL-429');
        }
        throw new Error(`CONTENTOPS-MODEL-${response.status}: ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('CONTENTOPS-MODEL-EMPTY');
      }

      return {
        content,
        tokenUsage: data.usage ? {
          prompt: data.usage.prompt_tokens || 0,
          completion: data.usage.completion_tokens || 0,
          total: data.usage.total_tokens || 0,
        } : undefined,
        latencyMs,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('CONTENTOPS-MODEL-TIMEOUT');
      }
      throw error;
    }
  }

  private parseJsonResponse<T>(raw: string): T {
    // Remove markdown code blocks
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('CONTENTOPS-GENERATE-001: Invalid JSON response');
    }
  }

  async generateBrief(topic: string, context?: Partial<WritingBrief>): Promise<GenerationResult> {
    const requestId = `brief_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const startTime = Date.now();

    try {
      const systemPrompt = `你是一个专业的中文内容策划专家，专注于为海外华人和留学生创建实用内容。
你的任务是根据用户提供的选题，生成详细的写作 Brief。
你必须只返回有效的 JSON，不要包含 markdown 代码块或额外说明。`;

      const userPrompt = `为以下选题生成写作 Brief：

选题：${topic}

已有上下文（如有）：${context ? JSON.stringify(context) : '无'}

请生成以下 JSON 结构：
{
  "topic": "选题主题",
  "contentType": "guide|topic|checklist",
  "targetAudience": "目标读者描述",
  "searchIntent": "informational|navigational|transactional",
  "tone": "专业、清晰、实用",
  "language": "zh-CN",
  "country": "主要目标国家",
  "city": "目标城市（可选）",
  "industry": "所属行业（可选）",
  "primaryKeyword": "主要关键词",
  "secondaryKeywords": ["关键词1", "关键词2", "关键词3"],
  "requiredSections": ["必须包含的章节1", "章节2"],
  "excludedClaims": ["不应包含的声明"],
  "requestedLength": "1800-3000 中文字",
  "sourceRequirements": "来源要求说明",
  "internalLinkRequirements": "内链需求说明",
  "createdBy": "ai-generation",
  "createdAt": "ISO时间戳"
}

要求：
- contentType 根据选题性质选择（指南=guide，资源合集=topic，清单=checklist）
- targetAudience 根据选题自动推断（如物流相关→跨境电商卖家、留学生）
- primaryKeyword 应包含核心搜索词
- requiredSections 至少 5 个章节
- 所有内容为中文`;

      const result = await this.callModel(systemPrompt, userPrompt, { maxTokens: 2000 });
      const brief = this.parseJsonResponse<WritingBrief>(result.content);

      return {
        success: true,
        brief: {
          ...brief,
          topic: brief.topic || topic,
          contentType: brief.contentType || 'guide',
          language: brief.language || 'zh-CN',
          tone: brief.tone || '专业、清晰、实用',
          requestedLength: brief.requestedLength || '1800-3000 中文字',
          createdBy: 'ai-generation',
          createdAt: new Date().toISOString(),
        },
        provider: 'deepseek',
        model: AI_CONFIG.model,
        requestId,
        tokenUsage: result.tokenUsage,
        latencyMs: result.latencyMs,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        errorCode: error.message.startsWith('CONTENTOPS-') ? error.message : 'CONTENTOPS-GENERATE-001',
        provider: 'deepseek',
        model: AI_CONFIG.model,
        requestId,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  async generateOutline(brief: WritingBrief): Promise<GenerationResult> {
    const requestId = `outline_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const startTime = Date.now();

    try {
      const systemPrompt = `你是一个专业的中文内容架构师。根据写作 Brief 生成详细的文章大纲。
你必须只返回有效的 JSON 数组，不要包含 markdown 代码块或额外说明。`;

      const userPrompt = `根据以下写作 Brief 生成文章大纲：

主题：${brief.topic}
内容类型：${brief.contentType}
目标读者：${brief.targetAudience}
搜索意图：${brief.searchIntent}
主要关键词：${brief.primaryKeyword}
必须包含的章节：${brief.requiredSections.join(', ')}

请生成以下 JSON 数组结构：
[
  {
    "heading": "章节标题",
    "level": 2,
    "description": "该章节要写什么",
    "keyPoints": ["要点1", "要点2", "要点3"]
  }
]

要求：
- 至少 6 个 H2 章节
- 每个 H2 下可有 H3 子章节
- keyPoints 每个章节至少 3 个
- 结构清晰，逻辑递进
- 包含实际步骤、注意事项、常见问题
- 所有内容为中文`;

      const result = await this.callModel(systemPrompt, userPrompt, { maxTokens: 3000 });
      const outline = this.parseJsonResponse<OutlineSection[]>(result.content);

      return {
        success: true,
        outline,
        provider: 'deepseek',
        model: AI_CONFIG.model,
        requestId,
        tokenUsage: result.tokenUsage,
        latencyMs: result.latencyMs,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        errorCode: error.message.startsWith('CONTENTOPS-') ? error.message : 'CONTENTOPS-GENERATE-001',
        provider: 'deepseek',
        model: AI_CONFIG.model,
        requestId,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  async generateDraft(brief: WritingBrief, outline: OutlineSection[]): Promise<GenerationResult> {
    const requestId = `draft_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const startTime = Date.now();

    try {
      const outlineText = outline.map((s, i) => {
        const prefix = s.level === 2 ? `${i + 1}.` : '  -';
        return `${prefix} ${s.heading}\n   ${s.description}\n   要点：${s.keyPoints.join('、')}`;
      }).join('\n\n');

      const systemPrompt = `你是一个专业的中文内容写手，为海外华人和留学生网站撰写高质量实用文章。
你的文章必须：
- 有清晰的 H2/H3 结构
- 有实际步骤和操作指导
- 有风险与注意事项
- 有适用人群说明
- 有常见问题解答
- 不包含调试文字或模型自述
- 不包含"作为 AI"等表述
- 不虚构政策、价格和数据
- 不输出未验证的强断言
- 对于可能变化的信息（价格、政策、法规），使用保守措辞并标注来源

你必须只返回有效的 JSON，不要包含 markdown 代码块或额外说明。`;

      const userPrompt = `根据以下 Brief 和大纲撰写完整文章：

【写作 Brief】
主题：${brief.topic}
内容类型：${brief.contentType}
目标读者：${brief.targetAudience}
搜索意图：${brief.searchIntent}
语调：${brief.tone}
语言：${brief.language}
目标国家：${brief.country}
主要关键词：${brief.primaryKeyword}
次要关键词：${brief.secondaryKeywords.join(', ')}
要求字数：${brief.requestedLength}
排除声明：${brief.excludedClaims.join(', ') || '无'}

【文章大纲】
${outlineText}

请生成以下 JSON 结构：
{
  "title": "文章标题（包含关键词，24字以内）",
  "slug": "url-friendly-slug",
  "summary": "100-200字摘要",
  "body": "完整正文（Markdown格式，包含H2/H3标题）",
  "seoTitle": "SEO标题（60字符以内）",
  "seoDescription": "Meta描述（150字符以内）",
  "keywords": ["关键词1", "关键词2"],
  "faq": [
    {"question": "问题1", "answer": "答案1"},
    {"question": "问题2", "answer": "答案2"},
    {"question": "问题3", "answer": "答案3"}
  ],
  "sources": [
    {"title": "来源标题", "url": "https://...", "type": "stable|volatile"}
  ],
  "internalLinks": [
    {"url": "/guides/xxx", "title": "链接标题", "reason": "为什么相关"}
  ]
}

要求：
- body 必须是完整 Markdown 格式正文
- 字数不少于 ${brief.requestedLength.includes('1800') ? '1800' : '1500'} 中文字
- FAQ 至少 3 条
- sources 中 volatile 类型的必须有 URL
- internalLinks 使用站内真实路径格式（/guides/、/tools/、/topics/、/checklists/）
- 所有内容为中文`;

      const result = await this.callModel(systemPrompt, userPrompt, { maxTokens: 8000, temperature: 0.6 });
      const content = this.parseJsonResponse<GeneratedContent>(result.content);

      // Calculate word count
      const wordCount = content.body ? content.body.replace(/\s/g, '').length : 0;

      return {
        success: true,
        content: {
          ...content,
          wordCount,
          faq: content.faq || [],
          sources: content.sources || [],
          internalLinks: content.internalLinks || [],
        },
        provider: 'deepseek',
        model: AI_CONFIG.model,
        requestId,
        tokenUsage: result.tokenUsage,
        latencyMs: result.latencyMs,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        errorCode: error.message.startsWith('CONTENTOPS-') ? error.message : 'CONTENTOPS-GENERATE-001',
        provider: 'deepseek',
        model: AI_CONFIG.model,
        requestId,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  async reviseDraft(
    currentContent: string,
    brief: WritingBrief,
    instructions: string
  ): Promise<GenerationResult> {
    const requestId = `revise_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const startTime = Date.now();

    try {
      const systemPrompt = `你是一个专业的中文内容编辑。根据用户的修改要求，对现有文章进行修改。
你必须：
- 保留不要求修改的内容
- 只修改用户要求的部分
- 保持文章整体结构和风格一致
- 不虚构数据或政策
- 不包含"作为 AI"等表述

你必须只返回有效的 JSON，不要包含 markdown 代码块或额外说明。`;

      const userPrompt = `请根据以下修改要求修改文章：

【修改要求】
${instructions}

【当前文章】
${currentContent.substring(0, 6000)}${currentContent.length > 6000 ? '...(已截断)' : ''}

【写作 Brief（参考）】
主题：${brief.topic}
目标读者：${brief.targetAudience}
语调：${brief.tone}

请生成以下 JSON 结构：
{
  "title": "文章标题（如有修改）",
  "body": "修改后的完整正文（Markdown格式）",
  "summary": "更新后的摘要（如有修改）",
  "seoTitle": "SEO标题（如有修改）",
  "seoDescription": "Meta描述（如有修改）",
  "revisionSummary": "本次修改的摘要说明"
}

要求：
- body 必须是完整的修改后正文
- revisionSummary 简要说明修改了什么
- 保留未要求修改的内容
- 所有内容为中文`;

      const result = await this.callModel(systemPrompt, userPrompt, { maxTokens: 8000, temperature: 0.5 });
      const revised = this.parseJsonResponse<{
        title?: string;
        body: string;
        summary?: string;
        seoTitle?: string;
        seoDescription?: string;
        revisionSummary: string;
      }>(result.content);

      const wordCount = revised.body ? revised.body.replace(/\s/g, '').length : 0;

      return {
        success: true,
        content: {
          title: revised.title || '',
          slug: '',
          summary: revised.summary || '',
          body: revised.body,
          seoTitle: revised.seoTitle || '',
          seoDescription: revised.seoDescription || '',
          keywords: [],
          faq: [],
          sources: [],
          internalLinks: [],
          wordCount,
        },
        revisionSummary: revised.revisionSummary || '修改完成',
        provider: 'deepseek',
        model: AI_CONFIG.model,
        requestId,
        tokenUsage: result.tokenUsage,
        latencyMs: result.latencyMs,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        errorCode: error.message.startsWith('CONTENTOPS-') ? error.message : 'CONTENTOPS-GENERATE-001',
        provider: 'deepseek',
        model: AI_CONFIG.model,
        requestId,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  async generateSeo(content: GeneratedContent): Promise<GenerationResult> {
    // SEO is generated as part of the draft, so this is a no-op that returns existing data
    return {
      success: true,
      content,
      provider: 'deepseek',
      model: AI_CONFIG.model,
      requestId: `seo_${Date.now()}`,
      latencyMs: 0,
    };
  }

  async generateFaq(content: GeneratedContent, brief: WritingBrief): Promise<GenerationResult> {
    // FAQ is generated as part of the draft, so this is a no-op that returns existing data
    return {
      success: true,
      content,
      provider: 'deepseek',
      model: AI_CONFIG.model,
      requestId: `faq_${Date.now()}`,
      latencyMs: 0,
    };
  }
}

// ============================================================================
// Provider Factory
// ============================================================================

let providerInstance: ContentGenerationProvider | null = null;
let providerHealthChecked = false;
let providerHealthOk = false;

export function getContentGenerationProvider(): ContentGenerationProvider {
  if (!providerInstance) {
    // Try DeepSeek if configured
    if (AI_CONFIG.enabled && AI_CONFIG.apiKey) {
      providerInstance = new DeepSeekProvider();
    } else {
      // No real provider configured, use fallback
      providerInstance = new LocalFallbackProvider();
    }
  }
  return providerInstance;
}

export function isAiGenerationEnabled(): boolean {
  // Enable if either DeepSeek is configured OR fallback is available
  return (AI_CONFIG.enabled && !!AI_CONFIG.apiKey) || true; // fallback always available
}

/**
 * Check if the active provider can actually generate content.
 * Returns false if DeepSeek has insufficient balance or other errors.
 */
export async function checkProviderHealth(): Promise<{
  healthy: boolean;
  provider: string;
  model: string;
  error?: string;
}> {
  const provider = getContentGenerationProvider();
  
  // If using fallback provider, it's always "healthy" but not real
  if (provider instanceof LocalFallbackProvider) {
    return {
      healthy: true,
      provider: 'local-fallback',
      model: 'template-v1',
      error: 'Using local fallback - not a real AI model',
    };
  }
  
  // Check cached health status
  if (providerHealthChecked) {
    return {
      healthy: providerHealthOk,
      provider: 'deepseek',
      model: AI_CONFIG.model,
      error: providerHealthOk ? undefined : 'DeepSeek API unavailable (cached)',
    };
  }
  
  // Test DeepSeek with a minimal request
  try {
    const result = await provider.generateBrief('test', { contentType: 'guide' });
    providerHealthChecked = true;
    
    if (result.success) {
      providerHealthOk = true;
      return {
        healthy: true,
        provider: result.provider,
        model: result.model,
      };
    } else {
      providerHealthOk = false;
      return {
        healthy: false,
        provider: result.provider || 'unknown',
        model: result.model || 'unknown',
        error: result.error || 'Unknown error',
      };
    }
  } catch (error: any) {
    providerHealthChecked = true;
    providerHealthOk = false;
    return {
      healthy: false,
      provider: 'deepseek',
      model: AI_CONFIG.model,
      error: error.message,
    };
  }
}

/**
 * Check if we're using a real AI provider (not fallback).
 */
export function isUsingRealProvider(): boolean {
  const provider = getContentGenerationProvider();
  return provider instanceof DeepSeekProvider;
}

// ============================================================================
// Local Fallback Provider (for testing when external API unavailable)
// ============================================================================

class LocalFallbackProvider implements ContentGenerationProvider {
  async generateBrief(topic: string, context?: Partial<WritingBrief>): Promise<GenerationResult> {
    const requestId = `local_brief_${Date.now()}`;
    const startTime = Date.now();

    const brief: WritingBrief = {
      topic,
      contentType: context?.contentType || 'guide',
      targetAudience: '海外华人和留学生，特别是对该主题感兴趣的用户',
      searchIntent: 'informational',
      tone: '专业、清晰、实用',
      language: 'zh-CN',
      country: this.inferCountry(topic),
      primaryKeyword: topic.split(' ').slice(0, 3).join(''),
      secondaryKeywords: [topic, `${topic}指南`, `${topic}攻略`],
      requiredSections: ['概述', '详细步骤', '注意事项', '常见问题', '总结'],
      excludedClaims: ['未经验证的数据', '过时的政策'],
      requestedLength: '1800-3000 中文字',
      sourceRequirements: '优先使用官方来源',
      internalLinkRequirements: '链接到相关指南和工具',
      createdBy: 'local-fallback',
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      brief,
      provider: 'local-fallback',
      model: 'template-v1',
      requestId,
      latencyMs: Date.now() - startTime,
    };
  }

  async generateOutline(brief: WritingBrief): Promise<GenerationResult> {
    const requestId = `local_outline_${Date.now()}`;
    const startTime = Date.now();

    const outline: OutlineSection[] = [
      { heading: '概述：什么是' + brief.topic, level: 2, description: '介绍主题背景和重要性', keyPoints: ['定义和范围', '适用人群', '为什么需要了解'] },
      { heading: '准备工作', level: 2, description: '开始前的必要准备', keyPoints: ['所需材料', '前提条件', '时间预估'] },
      { heading: '详细步骤', level: 2, description: '分步骤详细说明', keyPoints: ['第一步', '第二步', '第三步', '第四步'] },
      { heading: '注意事项与风险', level: 2, description: '需要特别注意的事项', keyPoints: ['常见错误', '风险提示', '合规要求'] },
      { heading: '常见问题解答', level: 2, description: 'FAQ', keyPoints: ['问题1', '问题2', '问题3'] },
      { heading: '总结与建议', level: 2, description: '总结要点和建议', keyPoints: ['核心要点回顾', '下一步行动', '相关资源'] },
    ];

    return {
      success: true,
      outline,
      provider: 'local-fallback',
      model: 'template-v1',
      requestId,
      latencyMs: Date.now() - startTime,
    };
  }

  async generateDraft(brief: WritingBrief, outline: OutlineSection[]): Promise<GenerationResult> {
    const requestId = `local_draft_${Date.now()}`;
    const startTime = Date.now();

    // Generate structured markdown content
    const body = this.generateBody(brief, outline);
    const wordCount = body.replace(/\s/g, '').length;

    const content: GeneratedContent = {
      title: `${brief.topic}完整指南`,
      slug: this.generateSlug(brief.topic),
      summary: `本文详细介绍了${brief.topic}的完整流程，包括准备工作、详细步骤、注意事项和常见问题解答。适合${brief.targetAudience}阅读参考。`,
      body,
      seoTitle: `${brief.topic}完整指南 | 绝世百宝箱`,
      seoDescription: `详细介绍${brief.topic}的完整流程和注意事项，帮助${brief.targetAudience}快速掌握相关知识。`,
      keywords: [brief.primaryKeyword, ...brief.secondaryKeywords],
      faq: [
        { question: `${brief.topic}需要注意什么？`, answer: `在进行${brief.topic}时，需要注意合规要求、时间节点和所需材料。建议提前做好准备，避免常见问题。` },
        { question: `${brief.topic}需要多长时间？`, answer: `根据具体情况，${brief.topic}通常需要1-3个工作日完成。建议预留充足时间以应对可能的延迟。` },
        { question: `${brief.topic}的费用是多少？`, answer: `费用因具体情况而异，建议咨询专业服务商获取准确报价。本文提供的信息仅供参考。` },
      ],
      sources: [
        { title: 'FACT_RESEARCH_UNAVAILABLE', type: 'stable' },
      ],
      internalLinks: [
        { url: '/guides/', title: '更多指南', reason: '相关主题指南' },
        { url: '/tools/', title: '实用工具', reason: '相关工具推荐' },
        { url: '/topics/', title: '相关专题', reason: '深入了解相关主题' },
      ],
      wordCount,
    };

    return {
      success: true,
      content,
      provider: 'local-fallback',
      model: 'template-v1',
      requestId,
      latencyMs: Date.now() - startTime,
    };
  }

  async reviseDraft(currentContent: string, brief: WritingBrief, instructions: string): Promise<GenerationResult> {
    const requestId = `local_revise_${Date.now()}`;
    const startTime = Date.now();

    // Simple revision: append a section based on instructions
    const revisionNote = `\n\n## 修订说明\n\n根据要求"${instructions}"进行了修改。此版本由本地回退提供者生成，用于测试目的。\n`;
    const revisedBody = currentContent + revisionNote;
    const wordCount = revisedBody.replace(/\s/g, '').length;

    return {
      success: true,
      content: {
        title: brief.topic + '完整指南（修订版）',
        slug: this.generateSlug(brief.topic),
        summary: brief.topic + '的修订版本，根据用户要求进行了调整。',
        body: revisedBody,
        seoTitle: `${brief.topic}完整指南（修订版）| 绝世百宝箱`,
        seoDescription: `修订版${brief.topic}指南，根据用户反馈进行了优化。`,
        keywords: [brief.primaryKeyword],
        faq: [],
        sources: [],
        internalLinks: [],
        wordCount,
      },
      revisionSummary: `根据要求"${instructions.substring(0, 50)}..."进行了修订`,
      provider: 'local-fallback',
      model: 'template-v1',
      requestId,
      latencyMs: Date.now() - startTime,
    };
  }

  async generateSeo(content: GeneratedContent): Promise<GenerationResult> {
    return { success: true, content, provider: 'local-fallback', model: 'template-v1', requestId: `local_seo_${Date.now()}`, latencyMs: 0 };
  }

  async generateFaq(content: GeneratedContent, brief: WritingBrief): Promise<GenerationResult> {
    return { success: true, content, provider: 'local-fallback', model: 'template-v1', requestId: `local_faq_${Date.now()}`, latencyMs: 0 };
  }

  private inferCountry(topic: string): string {
    if (topic.includes('新加坡')) return '新加坡';
    if (topic.includes('日本')) return '日本';
    if (topic.includes('美国')) return '美国';
    if (topic.includes('澳洲') || topic.includes('澳大利亚')) return '澳大利亚';
    return '中国';
  }

  private generateSlug(topic: string): string {
    return topic
      .replace(/[^\w\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50)
      .toLowerCase();
  }

  private generateBody(brief: WritingBrief, outline: OutlineSection[]): string {
    let body = `# ${brief.topic}完整指南\n\n`;
    body += `> 本文为您详细介绍${brief.topic}的完整流程和注意事项。\n\n`;

    for (const section of outline) {
      if (section.level === 2) {
        body += `## ${section.heading}\n\n`;
        body += `${section.description}\n\n`;
        for (const point of section.keyPoints) {
          body += `- ${point}\n`;
        }
        body += `\n`;
      }
    }

    body += `## 免责声明\n\n`;
    body += `本文内容仅供参考，不构成专业建议。具体操作请咨询专业人士或参考官方指南。\n\n`;
    body += `---\n*本文由 ContentOps AI Authoring Pipeline 生成（本地回退模式）*\n`;

    return body;
  }
}
