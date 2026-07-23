/**
 * ContentOps Admin URL Builder
 * 
 * Single source of truth for admin URLs.
 * All notification messages must use these builders.
 */

const STAGING_BASE = process.env.CONTENTOPS_STAGING_URL || 'https://i.jueshi.net';
const PRODUCTION_BASE = process.env.CONTENTOPS_PRODUCTION_URL || 'https://jueshi.net';

/**
 * Get base URL for target environment
 */
export function getAdminBaseUrl(targetEnvironment: string = 'staging'): string {
  return targetEnvironment === 'production' ? PRODUCTION_BASE : STAGING_BASE;
}

/**
 * Build admin URL for ContentOps dashboard
 */
export function buildContentOpsAdminUrl(targetEnvironment: string = 'staging'): string {
  return `${getAdminBaseUrl(targetEnvironment)}/admin/contentops`;
}

/**
 * Build admin URL for specific task
 */
export function buildContentOpsTaskAdminUrl(taskId: string, targetEnvironment: string = 'staging'): string {
  // Task detail not yet implemented, fallback to dashboard
  return buildContentOpsAdminUrl(targetEnvironment);
}

/**
 * Build admin URL for specific content (topic/guide/checklist)
 */
export function buildContentOpsContentAdminUrl(
  contentType: string,
  contentId: string,
  targetEnvironment: string = 'staging'
): string {
  const base = getAdminBaseUrl(targetEnvironment);
  switch (contentType) {
    case 'topic':
      return `${base}/admin/content/topics/${contentId}/edit`;
    case 'guide':
      return `${base}/admin/content/guides/${contentId}/edit`;
    case 'checklist':
      return `${base}/admin/content/checklists/${contentId}/edit`;
    default:
      return buildContentOpsAdminUrl(targetEnvironment);
  }
}

/**
 * Legacy compatibility - returns the correct admin URL
 */
export function getContentOpsAdminUrl(): string {
  return buildContentOpsAdminUrl('staging');
}
