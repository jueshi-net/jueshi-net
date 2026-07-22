/**
 * ContentOps Notification Contract
 * 
 * 统一的通知数据结构
 * Worker、API、Dispatcher 都必须使用这个 Contract
 */

/**
 * Notification type enum
 */
export const NOTIFICATION_TYPES = {
  TASK_ACCEPTED: 'TASK_ACCEPTED',
  TASK_QUEUED: 'TASK_QUEUED',
  GENERATION_STARTED: 'GENERATION_STARTED',
  NORMALIZATION_COMPLETED: 'NORMALIZATION_COMPLETED',
  QUALITY_PASSED: 'QUALITY_PASSED',
  QUALITY_FAILED: 'QUALITY_FAILED',
  CONTENT_SAVED: 'CONTENT_SAVED',
  CONTENT_SCHEDULED: 'CONTENT_SCHEDULED',
  CONTENT_PUBLISHED: 'CONTENT_PUBLISHED',
  TASK_FAILED: 'TASK_FAILED',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

/**
 * Notification status enum
 */
export const NOTIFICATION_STATUS = {
  PENDING: 'PENDING',
  SENDING: 'SENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
} as const;

export type NotificationStatus = typeof NOTIFICATION_STATUS[keyof typeof NOTIFICATION_STATUS];

/**
 * Notification data structure
 */
export interface ContentOpsNotification {
  id: string;
  notificationId: string;
  taskId: string;
  
  type: NotificationType;
  status: NotificationStatus;
  
  payload: any;
  
  sentAt?: string;
  attemptCount: number;
  maxAttempts: number;
  lastError?: string;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Notification payload for task events
 */
export interface TaskNotificationPayload {
  taskId: string;
  contentType: string;
  executionMode: string;
  targetEnvironment: string;
  status: string;
  message?: string;
  
  // Optional fields for specific events
  contentId?: string;
  contentSlug?: string;
  publishedUrl?: string;
  qualityScore?: number;
  qualityIssues?: any;
  failureReason?: string;
}

/**
 * Validate notification type
 */
export function isValidNotificationType(value: string): value is NotificationType {
  return Object.values(NOTIFICATION_TYPES).includes(value as NotificationType);
}

/**
 * Validate notification status
 */
export function isValidNotificationStatus(value: string): value is NotificationStatus {
  return Object.values(NOTIFICATION_STATUS).includes(value as NotificationStatus);
}

/**
 * Check if notification is in terminal state
 */
export function isNotificationTerminal(status: NotificationStatus): boolean {
  return status === NOTIFICATION_STATUS.SENT || status === NOTIFICATION_STATUS.FAILED;
}

/**
 * Check if notification can be retried
 */
export function canNotificationRetry(notification: ContentOpsNotification): boolean {
  return (
    notification.status === NOTIFICATION_STATUS.FAILED &&
    notification.attemptCount < notification.maxAttempts
  );
}

/**
 * Get user-friendly message for notification type
 */
export function getNotificationMessage(type: NotificationType, payload: TaskNotificationPayload): string {
  const messages: Record<NotificationType, string> = {
    [NOTIFICATION_TYPES.TASK_ACCEPTED]: `✅ 任务已接受\n\n任务 ID：${payload.taskId}\n类型：${payload.contentType}\n状态：等待处理`,
    [NOTIFICATION_TYPES.TASK_QUEUED]: `📋 任务已入队\n\n任务 ID：${payload.taskId}\n状态：等待执行`,
    [NOTIFICATION_TYPES.GENERATION_STARTED]: `🚀 开始生成内容\n\n任务 ID：${payload.taskId}\n类型：${payload.contentType}`,
    [NOTIFICATION_TYPES.NORMALIZATION_COMPLETED]: `✨ 内容规范化完成\n\n任务 ID：${payload.taskId}`,
    [NOTIFICATION_TYPES.QUALITY_PASSED]: `✅ 质量检查通过\n\n任务 ID：${payload.taskId}\n质量分：${payload.qualityScore || 'N/A'}`,
    [NOTIFICATION_TYPES.QUALITY_FAILED]: `❌ 质量检查失败\n\n任务 ID：${payload.taskId}\n原因：${payload.failureReason || '未知'}`,
    [NOTIFICATION_TYPES.CONTENT_SAVED]: `💾 内容已保存\n\n任务 ID：${payload.taskId}\n内容 ID：${payload.contentId || 'N/A'}`,
    [NOTIFICATION_TYPES.CONTENT_SCHEDULED]: `⏰ 内容已定时\n\n任务 ID：${payload.taskId}\n内容 ID：${payload.contentId || 'N/A'}`,
    [NOTIFICATION_TYPES.CONTENT_PUBLISHED]: `🎉 内容已发布\n\n任务 ID：${payload.taskId}\nURL：${payload.publishedUrl || 'N/A'}`,
    [NOTIFICATION_TYPES.TASK_FAILED]: `❌ 任务失败\n\n任务 ID：${payload.taskId}\n原因：${payload.failureReason || '未知'}`,
  };
  return messages[type] || `通知：${type}`;
}
