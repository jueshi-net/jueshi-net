/**
 * Document Tool Helpers
 * 
 * Generic utility functions for the Document Tool Engine.
 * Does not contain any business logic specific to individual tools.
 */

/**
 * Safely parse draft data from JSON string.
 * Returns null on failure instead of throwing.
 */
export function safeParseDraftData(dataJson: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(dataJson);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Normalize draft payload for API submission.
 * Ensures required fields are present and formatted correctly.
 */
export function createDocumentPayload({
  toolKey,
  title,
  dataJson,
  companyProfileId,
}: {
  toolKey: string;
  title: string;
  dataJson: string;
  companyProfileId?: string;
}): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    toolKey,
    title,
    dataJson,
  };

  if (companyProfileId) {
    payload.companyProfileId = companyProfileId;
  }

  return payload;
}

/**
 * Extract draftId from search params.
 * Returns null if not present.
 */
export function extractDraftIdFromSearchParams(searchParams: URLSearchParams | null): string | null {
  return searchParams?.get('draftId') ?? null;
}

/**
 * Map API error response to user-friendly message.
 */
export function mapApiErrorToMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '操作失败，请稍后重试';
}

/**
 * Generate standard confirmation message for reset action.
 */
export function createDefaultResetConfirmMessage(toolName: string): string {
  return `确定要清空所有${toolName}内容吗？此操作不可恢复。`;
}

/**
 * Build HTML for print window.
 * Injects content and styles into a standard print template.
 */
export function buildPrintWindowHtml({
  title,
  contentHtml,
  styles,
}: {
  title: string;
  contentHtml: string;
  styles: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        ${styles}
      </style>
    </head>
    <body>
      ${contentHtml}
    </body>
    </html>
  `;
}
