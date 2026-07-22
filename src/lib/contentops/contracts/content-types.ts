/**
 * ContentOps Content Types
 * 
 * 统一的内容类型定义
 * Bot、API、Worker、Adapter 都必须使用这些类型
 */

export const CONTENT_TYPES = {
  GUIDE: 'guide',
  CHECKLIST: 'checklist',
  TOPIC: 'topic',
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];

/**
 * Content type priority for intent parsing
 * Higher number = higher priority
 */
export const CONTENT_TYPE_PRIORITY: Record<ContentType, number> = {
  [CONTENT_TYPES.TOPIC]: 3,
  [CONTENT_TYPES.CHECKLIST]: 2,
  [CONTENT_TYPES.GUIDE]: 1,
};

/**
 * Validate content type
 */
export function isValidContentType(value: string): value is ContentType {
  return Object.values(CONTENT_TYPES).includes(value as ContentType);
}

/**
 * Get display name for content type
 */
export function getContentTypeDisplayName(type: ContentType): string {
  const names: Record<ContentType, string> = {
    [CONTENT_TYPES.GUIDE]: '指南',
    [CONTENT_TYPES.CHECKLIST]: '清单',
    [CONTENT_TYPES.TOPIC]: '专题',
  };
  return names[type] || type;
}
