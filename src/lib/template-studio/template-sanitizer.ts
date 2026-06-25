/**
 * Template Sanitizer
 *
 * 安全策略：
 * 1. 禁止 <script> 标签 — 全部移除
 * 2. 禁止事件处理器 — onclick/onload/onerror 等
 * 3. 禁止 javascript: 协议
 * 4. 禁止 eval/document.cookie/innerHTML 等危险 API
 * 5. CSS 白名单 — 仅允许安全属性
 * 6. 变量白名单 — 仅允许预定义的数据绑定变量
 * 7. 无 dangerouslySetInnerHTML — 所有渲染通过 React JSX
 *
 * @module template-studio/template-sanitizer
 */

// ============================================================
// 危险模式检测
// ============================================================

/** 危险 HTML 标签 */
const DANGEROUS_TAGS = [
  /<script[\s\S]*?<\/script>/gi,
  /<iframe[\s\S]*?<\/iframe>/gi,
  /<object[\s\S]*?<\/object>/gi,
  /<embed[\s\S]*?<\/embed>/gi,
  /<link[\s\S]*?>/gi,
  /<meta[\s\S]*?>/gi,
  /<base[\s\S]*?>/gi,
];

/** 危险属性模式 */
const DANGEROUS_ATTRS = [
  /\son\w+\s*=/gi,        // onclick=, onload=, onerror=, etc.
  /javascript:/gi,         // javascript: protocol
  /vbscript:/gi,           // vbscript: protocol
  /data:text\/html/gi,     // data:text/html
];

/** 危险 JS API 调用 */
const DANGEROUS_JS_PATTERNS = [
  /eval\s*\(/g,
  /document\.cookie/g,
  /document\.write/g,
  /\.innerHTML/g,
  /\.outerHTML/g,
  /window\.location/g,
  /window\.open/g,
  /\.sessionStorage/g,
  /\.localStorage/g,
  /fetch\s*\(/g,
  /XMLHttpRequest/g,
  /import\s*\(/g,
  /require\s*\(/g,
  /process\.env/g,
  /__next/g,
  /self\.__next/g,
];

/** CSS 白名单属性（仅允许安全样式） */
const ALLOWED_CSS_PROPS = new Set([
  'color', 'background-color', 'background', 'font-size', 'font-family',
  'font-weight', 'font-style', 'text-align', 'text-decoration', 'line-height',
  'letter-spacing', 'margin', 'margin-top', 'margin-bottom', 'margin-left',
  'margin-right', 'padding', 'padding-top', 'padding-bottom', 'padding-left',
  'padding-right', 'border', 'border-top', 'border-bottom', 'border-left',
  'border-right', 'border-color', 'border-width', 'border-style', 'border-radius',
  'border-collapse', 'width', 'min-width', 'max-width', 'height', 'min-height',
  'max-height', 'display', 'flex', 'flex-direction', 'justify-content',
  'align-items', 'gap', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis',
  'position', 'top', 'left', 'right', 'bottom', 'z-index', 'overflow',
  'overflow-x', 'overflow-y', 'white-space', 'word-break', 'word-wrap',
  'text-overflow', 'list-style', 'list-style-type', 'vertical-align',
  'box-shadow', 'opacity', 'cursor', 'pointer-events', 'table-layout',
  'empty-cells', 'caption-side', 'text-indent', 'text-transform',
]);

/** CSS 中禁止的值 */
const FORBIDDEN_CSS_VALUES = [
  /url\s*\(\s*javascript:/gi,
  /url\s*\(\s*data:text\/html/gi,
  /expression\s*\(/gi,
  /-moz-binding/gi,
  /behavior\s*:/gi,
];

// ============================================================
// 变量白名单
// ============================================================

/** 允许的数据绑定变量路径 */
const ALLOWED_VARIABLES = new Set([
  // 公司资料
  'company.name',
  'company.nameEn',
  'company.address',
  'company.phone',
  'company.email',
  'company.taxId',
  'company.logo',
  'company.isDefault',
  // 商品
  'products',
  'products[].name',
  'products[].nameEn',
  'products[].hsCode',
  'products[].unit',
  'products[].quantity',
  'products[].unitPrice',
  'products[].totalPrice',
  'products[].weight',
  'products[].volume',
  'products[].currency',
  'products[].origin',
  // 单据字段
  'document.number',
  'document.date',
  'document.dueDate',
  'document.type',
  'document.currency',
  // 金额汇总
  'summary.subtotal',
  'summary.tax',
  'summary.total',
  'summary.currency',
  'summary.itemCount',
  // 客户/收货方
  'customer.name',
  'customer.address',
  'customer.phone',
  'customer.email',
  // 备注/条款
  'remarks',
  'terms',
  // Logo
  'logo.url',
  'logo.position',
  // 签名/印章
  'signature.label',
  'stamp.label',
]);

// ============================================================
// 检测函数
// ============================================================

export interface SanitizeResult {
  clean: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 检测字符串中是否包含危险 HTML 标签
 */
export function detectDangerousTags(input: string): string[] {
  const found: string[] = [];
  for (const pattern of DANGEROUS_TAGS) {
    const matches = input.match(pattern);
    if (matches) {
      found.push(...matches.map(m => m.substring(0, 50)));
    }
  }
  return found;
}

/**
 * 检测字符串中是否包含危险属性
 */
export function detectDangerousAttrs(input: string): string[] {
  const found: string[] = [];
  for (const pattern of DANGEROUS_ATTRS) {
    const matches = input.match(pattern);
    if (matches) {
      found.push(...matches);
    }
  }
  return found;
}

/**
 * 检测字符串中是否包含危险 JS API 调用
 */
export function detectDangerousJs(input: string): string[] {
  const found: string[] = [];
  for (const pattern of DANGEROUS_JS_PATTERNS) {
    const matches = input.match(pattern);
    if (matches) {
      found.push(...matches);
    }
  }
  return found;
}

/**
 * 验证 CSS — 仅允许白名单属性，禁止危险值
 */
export function sanitizeCss(css: string): SanitizeResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检测危险 CSS 值
  for (const pattern of FORBIDDEN_CSS_VALUES) {
    if (pattern.test(css)) {
      errors.push(`Forbidden CSS value detected: ${css.match(pattern)?.[0] || 'unknown'}`);
    }
  }

  // 解析 CSS 规则，检查属性是否在白名单中
  const rulePattern = /([a-zA-Z-]+)\s*:/g;
  let match: RegExpExecArray | null;
  while ((match = rulePattern.exec(css)) !== null) {
    const prop = match[1].toLowerCase();
    if (!ALLOWED_CSS_PROPS.has(prop)) {
      warnings.push(`CSS property "${prop}" is not in whitelist (will be stripped)`);
    }
  }

  return {
    clean: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 验证变量绑定 — 仅允许白名单变量
 */
export function validateVariable(varPath: string): boolean {
  return ALLOWED_VARIABLES.has(varPath);
}

/**
 * 过滤变量 — 返回仅包含白名单变量的对象
 */
export function filterVariables(vars: Record<string, unknown>): Record<string, unknown> {
  const filtered: Record<string, unknown> = {};
  for (const key of Object.keys(vars)) {
    if (ALLOWED_VARIABLES.has(key)) {
      filtered[key] = vars[key];
    }
  }
  return filtered;
}

/**
 * 获取所有允许的变量列表
 */
export function getAllowedVariables(): string[] {
  return Array.from(ALLOWED_VARIABLES).sort();
}

/**
 * 获取所有允许的 CSS 属性列表
 */
export function getAllowedCssProps(): string[] {
  return Array.from(ALLOWED_CSS_PROPS).sort();
}

// ============================================================
// 综合安全验证
// ============================================================

/**
 * 验证模板名称 — 不允许包含 HTML/JS
 */
export function sanitizeTemplateName(name: string): SanitizeResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const tagIssues = detectDangerousTags(name);
  if (tagIssues.length > 0) {
    errors.push(`Template name contains dangerous tags: ${tagIssues.join(', ')}`);
  }

  const attrIssues = detectDangerousAttrs(name);
  if (attrIssues.length > 0) {
    errors.push(`Template name contains dangerous attributes: ${attrIssues.join(', ')}`);
  }

  const jsIssues = detectDangerousJs(name);
  if (jsIssues.length > 0) {
    errors.push(`Template name contains dangerous JS: ${jsIssues.join(', ')}`);
  }

  // 名称长度检查
  if (name.length > 100) {
    warnings.push('Template name exceeds 100 characters');
  }

  if (name.trim().length === 0) {
    errors.push('Template name cannot be empty');
  }

  return { clean: errors.length === 0, errors, warnings };
}

/**
 * 验证自定义 CSS — 完整安全检查
 */
export function sanitizeCustomCss(css: string): SanitizeResult {
  if (!css || css.trim().length === 0) {
    return { clean: true, errors: [], warnings: [] };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // 检测危险标签
  const tagIssues = detectDangerousTags(css);
  if (tagIssues.length > 0) {
    errors.push(`CSS contains dangerous HTML tags: ${tagIssues.join(', ')}`);
  }

  // 检测危险 JS
  const jsIssues = detectDangerousJs(css);
  if (jsIssues.length > 0) {
    errors.push(`CSS contains dangerous JS: ${jsIssues.join(', ')}`);
  }

  // CSS 白名单验证
  const cssResult = sanitizeCss(css);
  errors.push(...cssResult.errors);
  warnings.push(...cssResult.warnings);

  return { clean: errors.length === 0, errors, warnings };
}

/**
 * 验证完整模板配置 — 综合安全检查
 */
export function sanitizeTemplateConfig(config: {
  name: string;
  customCss?: string;
  fields?: Array<{ key: string; label: string }>;
  columns?: Array<{ key: string; label: string }>;
}): SanitizeResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 验证名称
  const nameResult = sanitizeTemplateName(config.name);
  errors.push(...nameResult.errors);
  warnings.push(...nameResult.warnings);

  // 验证 CSS
  if (config.customCss) {
    const cssResult = sanitizeCustomCss(config.customCss);
    errors.push(...cssResult.errors);
    warnings.push(...cssResult.warnings);
  }

  // 验证字段标签
  if (config.fields) {
    for (const field of config.fields) {
      const fieldResult = sanitizeTemplateName(field.label);
      if (!fieldResult.clean) {
        errors.push(`Field "${field.key}" label is unsafe: ${fieldResult.errors.join(', ')}`);
      }
    }
  }

  // 验证列标签
  if (config.columns) {
    for (const col of config.columns) {
      const colResult = sanitizeTemplateName(col.label);
      if (!colResult.clean) {
        errors.push(`Column "${col.key}" label is unsafe: ${colResult.errors.join(', ')}`);
      }
    }
  }

  return { clean: errors.length === 0, errors, warnings };
}

/**
 * 清理 CSS — 移除非白名单属性，保留安全属性
 */
export function stripUnsafeCss(css: string): string {
  if (!css) return '';

  const lines = css.split(';');
  const safeLines: string[] = [];

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const prop = line.substring(0, colonIdx).trim().toLowerCase();
    const value = line.substring(colonIdx + 1).trim();

    if (ALLOWED_CSS_PROPS.has(prop)) {
      // 再次检查值中是否有危险内容
      let valueSafe = true;
      for (const pattern of FORBIDDEN_CSS_VALUES) {
        if (pattern.test(value)) {
          valueSafe = false;
          break;
        }
      }
      if (valueSafe) {
        safeLines.push(`${prop}: ${value}`);
      }
    }
  }

  return safeLines.join('; ');
}
