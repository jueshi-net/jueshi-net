// ContentOps V2 Quality Checker
// 内容质量检查、SEO/GEO 评分、缺陷检测

export interface QualityCheckResult {
  score: number; // 0-100
  level: 'excellent' | 'good' | 'fair' | 'poor';
  issues: QualityIssue[];
  warnings: QualityWarning[];
}

export interface QualityIssue {
  type: 'content_length' | 'structure' | 'seo' | 'geo' | 'source_facts';
  severity: 'error' | 'warning';
  message: string;
  field?: string;
}

export interface QualityWarning {
  type: string;
  message: string;
  suggestion?: string;
}

export interface ContentMetadata {
  title: string;
  summary?: string;
  body?: string;
  contentType: 'guide' | 'topic' | 'checklist';
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  faq?: Array<{ question: string; answer: string }>;
  structuredData?: any;
  internalLinks?: Array<{ url: string; title: string; reason?: string }>;
  sourceFacts?: Array<{ fact: string; source?: string; verified?: boolean }>;
}

// 内容长度要求
const CONTENT_LENGTH_REQUIREMENTS = {
  guide: 1500, // 指南 >= 1500 中文字符
  topic: 2000, // 专题 >= 2000 中文字符
  checklist: 0, // 清单需要结构化检查
};

// 计算中文字符数
function countChineseChars(text: string): number {
  if (!text) return 0;
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g);
  return chineseChars ? chineseChars.length : 0;
}

// 检查内容长度
function checkContentLength(content: ContentMetadata): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const requiredLength = CONTENT_LENGTH_REQUIREMENTS[content.contentType];
  
  if (content.contentType === 'checklist') {
    // 清单需要结构化检查
    return issues;
  }
  
  const textContent = content.body || content.summary || '';
  const charCount = countChineseChars(textContent);
  
  if (charCount < requiredLength) {
    issues.push({
      type: 'content_length',
      severity: 'error',
      message: `内容过短：当前 ${charCount} 字，要求至少 ${requiredLength} 字`,
      field: 'body',
    });
  } else if (charCount < requiredLength * 1.2) {
    issues.push({
      type: 'content_length',
      severity: 'warning',
      message: `内容偏短：当前 ${charCount} 字，建议 ${Math.round(requiredLength * 1.2)} 字以上`,
      field: 'body',
    });
  }
  
  return issues;
}

// 检查 SEO 元素
function checkSeoElements(content: ContentMetadata): QualityIssue[] {
  const issues: QualityIssue[] = [];
  
  // SEO Title
  if (!content.seoTitle && !content.title) {
    issues.push({
      type: 'seo',
      severity: 'error',
      message: '缺少 SEO 标题',
      field: 'seoTitle',
    });
  } else if (content.seoTitle && content.seoTitle.length > 60) {
    issues.push({
      type: 'seo',
      severity: 'warning',
      message: `SEO 标题过长：${content.seoTitle.length} 字符，建议 60 字符以内`,
      field: 'seoTitle',
    });
  }
  
  // Meta Description
  if (!content.seoDescription && !content.summary) {
    issues.push({
      type: 'seo',
      severity: 'error',
      message: '缺少 Meta Description',
      field: 'seoDescription',
    });
  } else {
    const desc = content.seoDescription || content.summary || '';
    if (desc.length > 160) {
      issues.push({
        type: 'seo',
        severity: 'warning',
        message: `Meta Description 过长：${desc.length} 字符，建议 160 字符以内`,
        field: 'seoDescription',
      });
    } else if (desc.length < 50) {
      issues.push({
        type: 'seo',
        severity: 'warning',
        message: `Meta Description 过短：${desc.length} 字符，建议 50-160 字符`,
        field: 'seoDescription',
      });
    }
  }
  
  // Canonical URL
  if (!content.canonicalUrl) {
    issues.push({
      type: 'seo',
      severity: 'warning',
      message: '缺少 Canonical URL（将自动生成）',
      field: 'canonicalUrl',
    });
  }
  
  return issues;
}

// 检查 GEO 元素
function checkGeoElements(content: ContentMetadata): QualityIssue[] {
  const issues: QualityIssue[] = [];
  
  // FAQ
  if (!content.faq || content.faq.length === 0) {
    issues.push({
      type: 'geo',
      severity: 'warning',
      message: '缺少 FAQ（建议至少 3 个常见问题）',
      field: 'faq',
    });
  } else if (content.faq.length < 3) {
    issues.push({
      type: 'geo',
      severity: 'warning',
      message: `FAQ 数量不足：${content.faq.length} 个，建议至少 3 个`,
      field: 'faq',
    });
  }
  
  // Structured Data (JSON-LD)
  if (!content.structuredData) {
    issues.push({
      type: 'geo',
      severity: 'warning',
      message: '缺少结构化数据（JSON-LD）',
      field: 'structuredData',
    });
  }
  
  // Internal Links
  if (!content.internalLinks || content.internalLinks.length === 0) {
    issues.push({
      type: 'geo',
      severity: 'warning',
      message: '缺少内链建议（建议至少 3 个相关链接）',
      field: 'internalLinks',
    });
  } else if (content.internalLinks.length < 3) {
    issues.push({
      type: 'geo',
      severity: 'warning',
      message: `内链数量不足：${content.internalLinks.length} 个，建议至少 3 个`,
      field: 'internalLinks',
    });
  }
  
  return issues;
}

// 检查 Source Facts
function checkSourceFacts(content: ContentMetadata): QualityIssue[] {
  const issues: QualityIssue[] = [];
  
  if (!content.sourceFacts || content.sourceFacts.length === 0) {
    issues.push({
      type: 'source_facts',
      severity: 'warning',
      message: '缺少来源事实标记（建议添加关键数据来源）',
      field: 'sourceFacts',
    });
  } else {
    const unverifiedCount = content.sourceFacts.filter(f => !f.verified).length;
    if (unverifiedCount > 0) {
      issues.push({
        type: 'source_facts',
        severity: 'warning',
        message: `${unverifiedCount} 个来源事实未验证`,
        field: 'sourceFacts',
      });
    }
  }
  
  return issues;
}

// 检查清单结构化
function checkChecklistStructure(content: ContentMetadata): QualityIssue[] {
  const issues: QualityIssue[] = [];
  
  if (content.contentType !== 'checklist') {
    return issues;
  }
  
  // 检查 metadataJson 中的 groups
  const metadata = (content as any).metadataJson;
  if (!metadata || !metadata.groups || metadata.groups.length === 0) {
    issues.push({
      type: 'structure',
      severity: 'error',
      message: '清单缺少结构化分组（groups）',
      field: 'metadataJson.groups',
    });
  } else if (metadata.groups.length < 4) {
    issues.push({
      type: 'structure',
      severity: 'warning',
      message: `清单分组不足：${metadata.groups.length} 个，建议至少 4 个`,
      field: 'metadataJson.groups',
    });
  }
  
  return issues;
}

// 计算质量评分
function calculateScore(issues: QualityIssue[]): number {
  let score = 100;
  
  for (const issue of issues) {
    if (issue.severity === 'error') {
      score -= 20; // 错误扣 20 分
    } else {
      score -= 5; // 警告扣 5 分
    }
  }
  
  return Math.max(0, score);
}

// 确定质量等级
function getQualityLevel(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  return 'poor';
}

// 主检查函数
export function checkContentQuality(content: ContentMetadata): QualityCheckResult {
  const allIssues: QualityIssue[] = [
    ...checkContentLength(content),
    ...checkSeoElements(content),
    ...checkGeoElements(content),
    ...checkSourceFacts(content),
    ...checkChecklistStructure(content),
  ];
  
  const score = calculateScore(allIssues);
  const level = getQualityLevel(score);
  
  // 分离错误和警告
  const issues = allIssues.filter(i => i.severity === 'error');
  const warnings = allIssues
    .filter(i => i.severity === 'warning')
    .map(i => ({
      type: i.type,
      message: i.message,
      suggestion: getSuggestion(i),
    }));
  
  return {
    score,
    level,
    issues,
    warnings,
  };
}

// 获取改进建议
function getSuggestion(issue: QualityIssue): string {
  const suggestions: Record<string, string> = {
    'content_length': '增加更多实用内容、案例或详细说明',
    'seo': '优化标题和描述，确保包含核心关键词',
    'geo': '添加 FAQ、结构化数据和内链，提升搜索可见性',
    'source_facts': '为关键数据添加来源链接，增强可信度',
    'structure': '完善内容结构，添加更多分组或章节',
  };
  
  return suggestions[issue.type] || '请参考内容规范进行优化';
}

// SEO 评分
export function calculateSeoScore(content: ContentMetadata): number {
  const seoIssues = checkSeoElements(content);
  let score = 100;
  
  for (const issue of seoIssues) {
    if (issue.severity === 'error') {
      score -= 30;
    } else {
      score -= 10;
    }
  }
  
  return Math.max(0, score);
}

// GEO 评分
export function calculateGeoScore(content: ContentMetadata): number {
  const geoIssues = checkGeoElements(content);
  let score = 100;
  
  for (const issue of geoIssues) {
    if (issue.severity === 'error') {
      score -= 25;
    } else {
      score -= 10;
    }
  }
  
  return Math.max(0, score);
}
