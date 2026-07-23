/**
 * Raw Model Draft Contract
 * 
 * 接收 AI 模型的原始输出，进行安全解析和归一化
 * 不是最终数据库 Contract，只负责安全接收模型结果
 */

import { z } from 'zod';

// ============================================================================
// Raw Output Schema (宽松验证)
// ============================================================================

export const RawModelDraftSchema = z.object({
  // 必需字段（但允许别名）
  contentType: z.enum(['guide', 'checklist', 'topic']).optional(),
  title: z.string().min(1).optional(),
  
  // 正文/内容（支持多种别名）
  body: z.string().optional(),
  content: z.string().optional(),
  article: z.string().optional(),
  markdown: z.string().optional(),
  正文: z.string().optional(),
  内容: z.string().optional(),
  
  // 受众（支持多种别名）
  audience: z.string().optional(),
  targetAudience: z.string().optional(),
  intendedAudience: z.string().optional(),
  readers: z.string().optional(),
  适用人群: z.string().optional(),
  目标读者: z.string().optional(),
  
  // 摘要
  summary: z.string().optional(),
  description: z.string().optional(),
  
  // FAQ（支持多种别名）
  faq: z.array(z.any()).optional(),
  faqs: z.array(z.any()).optional(),
  frequentlyAskedQuestions: z.array(z.any()).optional(),
  
  // 来源（支持多种别名）
  sources: z.array(z.any()).optional(),
  references: z.array(z.any()).optional(),
  citations: z.array(z.any()).optional(),
  sourceFacts: z.array(z.any()).optional(),
  
  // SEO/GEO（可选）
  seo: z.any().optional(),
  geo: z.any().optional(),
  
  // Checklist 特定字段
  groups: z.array(z.any()).optional(),
  items: z.array(z.any()).optional(),
  
  // Topic 特定字段
  blockConfiguration: z.any().optional(),
  blocks: z.array(z.any()).optional(),
  
  // 其他元数据
  slug: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  
  // 允许额外字段
}).passthrough();

export type RawModelDraft = z.infer<typeof RawModelDraftSchema>;

// ============================================================================
// 字段别名归一化
// ============================================================================

export function normalizeFieldAliases(raw: any): any {
  const normalized = { ...raw };
  
  // Body 别名归一化
  if (!normalized.body) {
    if (normalized.content) normalized.body = normalized.content;
    else if (normalized.article) normalized.body = normalized.article;
    else if (normalized.markdown) normalized.body = normalized.markdown;
    else if (normalized['正文']) normalized.body = normalized['正文'];
    else if (normalized['内容']) normalized.body = normalized['内容'];
  }
  
  // Audience 别名归一化
  if (!normalized.audience) {
    if (normalized.targetAudience) normalized.audience = normalized.targetAudience;
    else if (normalized.intendedAudience) normalized.audience = normalized.intendedAudience;
    else if (normalized.readers) normalized.audience = normalized.readers;
    else if (normalized['适用人群']) normalized.audience = normalized['适用人群'];
    else if (normalized['目标读者']) normalized.audience = normalized['目标读者'];
  }
  
  // FAQ 别名归一化
  if (!normalized.faq) {
    if (normalized.faqs) normalized.faq = normalized.faqs;
    else if (normalized.frequentlyAskedQuestions) normalized.faq = normalized.frequentlyAskedQuestions;
  }
  
  // Sources 别名归一化
  if (!normalized.sources) {
    if (normalized.references) normalized.sources = normalized.references;
    else if (normalized.citations) normalized.sources = normalized.citations;
    else if (normalized.sourceFacts) normalized.sources = normalized.sourceFacts;
  }
  
  // Summary 别名归一化
  if (!normalized.summary) {
    if (normalized.description) normalized.summary = normalized.description;
  }
  
  // Topic blocks 别名归一化
  if (!normalized.blockConfiguration && normalized.blocks) {
    normalized.blockConfiguration = normalized.blocks;
  }
  
  return normalized;
}

// ============================================================================
// JSON 提取和清理
// ============================================================================

export function extractJsonFromMarkdown(text: string): string {
  // 移除 markdown code fence
  let cleaned = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  // 尝试提取 JSON 对象
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  
  return cleaned;
}

export function extractNestedContent(data: any): any {
  // 处理嵌套 data.content 结构
  if (data.data && data.data.content) {
    return data.data.content;
  }
  if (data.content && typeof data.content === 'object') {
    return data.content;
  }
  return data;
}

// ============================================================================
// Raw Contract 验证
// ============================================================================

export function validateRawModelDraft(raw: any): { success: boolean; errors: string[]; data?: RawModelDraft } {
  try {
    const result = RawModelDraftSchema.parse(raw);
    return { success: true, errors: [], data: result };
  } catch (error: any) {
    const errors = error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`) || [error.message];
    return { success: false, errors };
  }
}

// ============================================================================
// 最小合法性检查
// ============================================================================

export function hasMinimalViability(raw: any, contentType?: string): { viable: boolean; reason?: string } {
  // Type-aware viability check based on content type
  const type = contentType || raw.contentType;
  
  // Checklist: needs groups, items, sections, or checklist structure
  if (type === 'checklist') {
    const hasChecklistStructure = 
      raw.groups || 
      raw.items || 
      raw.sections || 
      raw.checklist ||
      raw.checklistItems ||
      raw.data?.content?.groups ||
      raw.data?.groups;
    
    if (!hasChecklistStructure) {
      return { viable: false, reason: 'Checklist requires groups, items, sections, or checklist structure' };
    }
    
    // Validate at least one group or item exists
    const groups = raw.groups || raw.data?.content?.groups || raw.data?.groups || [];
    const items = raw.items || raw.checklistItems || [];
    const sections = raw.sections || [];
    
    if (groups.length === 0 && items.length === 0 && sections.length === 0) {
      return { viable: false, reason: 'Checklist has empty groups, items, and sections' };
    }
    
    return { viable: true };
  }
  
  // Topic: needs blocks, blockConfiguration, sections, or modules
  if (type === 'topic') {
    const hasTopicStructure = 
      raw.blocks || 
      raw.blockConfiguration || 
      raw.sections ||
      raw.modules ||
      raw.resources ||
      raw.contentBlocks ||
      raw.data?.content?.blocks;
    
    if (!hasTopicStructure) {
      return { viable: false, reason: 'Topic requires blocks, blockConfiguration, sections, or modules' };
    }
    
    return { viable: true };
  }
  
  // Guide (default): needs body/content/article/markdown
  const hasBody = raw.body || raw.content || raw.article || raw.markdown || raw['正文'] || raw['内容'];
  
  if (!hasBody) {
    return { viable: false, reason: 'Guide requires body, content, article, or markdown' };
  }
  
  return { viable: true };
}
