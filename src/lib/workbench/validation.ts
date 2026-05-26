// Workbench link and favorite validation utilities

export interface LinkValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate URL is safe http/https
 */
export function validateUrl(url: string): LinkValidationResult {
  if (!url || !url.trim()) {
    return { valid: false, error: "网址不能为空" };
  }

  const trimmed = url.trim();

  // Only allow http:// and https://
  if (!/^https?:\/\//i.test(trimmed)) {
    return { valid: false, error: "网址必须以 http:// 或 https:// 开头" };
  }

  // Block dangerous protocols
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("file:")) {
    return { valid: false, error: "不允许的协议" };
  }

  // Basic URL validation
  try {
    new URL(trimmed);
  } catch {
    return { valid: false, error: "网址格式不正确" };
  }

  return { valid: true };
}

/**
 * Validate link title
 */
export function validateTitle(title: string): LinkValidationResult {
  if (!title || !title.trim()) {
    return { valid: false, error: "标题不能为空" };
  }
  if (title.trim().length > 80) {
    return { valid: false, error: "标题不能超过 80 个字符" };
  }
  return { valid: true };
}

/**
 * Validate link description
 */
export function validateDescription(description: string | undefined): LinkValidationResult {
  if (description && description.length > 200) {
    return { valid: false, error: "描述不能超过 200 个字符" };
  }
  return { valid: true };
}

/**
 * Validate profile type
 */
const VALID_PROFILE_TYPES = [
  "merchant",
  "overseas_chinese",
  "student",
  "ai_learner",
  "logistics",
  "none",
] as const;

export type ProfileType = (typeof VALID_PROFILE_TYPES)[number];

export function validateProfileType(profileType: string): LinkValidationResult {
  if (!VALID_PROFILE_TYPES.includes(profileType as ProfileType)) {
    return { valid: false, error: "无效的身份类型" };
  }
  return { valid: true };
}

/**
 * Get max links based on role
 */
export function getMaxLinks(role: string): number {
  if (["member", "admin", "管理员"].includes(role)) return 200;
  return 20; // user
}
