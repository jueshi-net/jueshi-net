/**
 * Community/Forum shared utilities
 *
 * Extracted from inline definitions in bbs page files to avoid duplication.
 */

/**
 * Mask an email address for display when user has no display name.
 * Example: "john.doe@example.com" -> "j***e@example.com"
 */
export function maskEmail(email: string): string {
  if (!email) return "匿名用户";
  const [local, domain] = email.split("@");
  if (!domain) return "匿名用户";
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * Format a join date as a relative Chinese string.
 */
export function formatJoinDate(date: Date | string | null | undefined): string {
  if (!date) return "未知";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "未知";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return "今天";
  if (diffDays < 30) return `${diffDays} 天前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`;
  return `${Math.floor(diffDays / 365)} 年前`;
}

/**
 * Relative time-ago formatter in Chinese.
 */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} 天前`;
  return new Date(iso).toLocaleDateString("zh-CN");
}

/**
 * Build a paginated URL with query params.
 */
export function buildPageUrl(
  base: string,
  page: number,
  params: { q?: string; category?: string }
): string {
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  return `${base}?${sp.toString()}`;
}

/**
 * Get a user's display name, masking email if no name is set.
 */
export function getDisplayName(name: string | null, email: string): string {
  return name || maskEmail(email);
}

/**
 * Get the first letter of a display name for avatar fallback.
 */
export function getAvatarLetter(name: string | null, email: string): string {
  const display = getDisplayName(name, email);
  return display.charAt(0).toUpperCase();
}
