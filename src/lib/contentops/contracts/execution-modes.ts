/**
 * ContentOps Execution Modes
 * 
 * 统一的执行模式定义
 * Bot、API、Worker 都必须使用这些模式
 */

export const EXECUTION_MODES = {
  DRAFT_ONLY: 'draft_only',
  REVIEW_REQUIRED: 'review_required',
  PUBLISH_WHEN_VALIDATED: 'publish_when_validated',
  SCHEDULE_WHEN_VALIDATED: 'schedule_when_validated',
  PUBLISH_NOW: 'publish_now',
} as const;

export type ExecutionMode = typeof EXECUTION_MODES[keyof typeof EXECUTION_MODES];

/**
 * Validate execution mode
 */
export function isValidExecutionMode(value: string): value is ExecutionMode {
  return Object.values(EXECUTION_MODES).includes(value as ExecutionMode);
}

/**
 * Get display name for execution mode (Chinese)
 */
export function getExecutionModeDisplayName(mode: ExecutionMode): string {
  const names: Record<ExecutionMode, string> = {
    [EXECUTION_MODES.DRAFT_ONLY]: '仅创建草稿',
    [EXECUTION_MODES.REVIEW_REQUIRED]: '等待人工审核',
    [EXECUTION_MODES.PUBLISH_WHEN_VALIDATED]: '校验通过后发布',
    [EXECUTION_MODES.SCHEDULE_WHEN_VALIDATED]: '校验通过后定时发布',
    [EXECUTION_MODES.PUBLISH_NOW]: '立即发布',
  };
  return names[mode] || mode;
}

/**
 * Check if mode allows automatic publishing
 */
export function allowsAutoPublish(mode: ExecutionMode): boolean {
  return (
    mode === EXECUTION_MODES.PUBLISH_WHEN_VALIDATED ||
    mode === EXECUTION_MODES.SCHEDULE_WHEN_VALIDATED ||
    mode === EXECUTION_MODES.PUBLISH_NOW
  );
}

/**
 * Check if mode requires quality gate
 */
export function requiresQualityGate(mode: ExecutionMode): boolean {
  return allowsAutoPublish(mode);
}
