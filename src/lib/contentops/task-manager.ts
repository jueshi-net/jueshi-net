/**
 * ContentOps Task Manager
 * 
 * Persistent task storage and state management.
 * Tasks survive server restarts and can be resumed.
 */

import { prisma } from '../prisma';
import type { ContentOpsTask, CreateTaskInput, TaskStatus, TaskStep } from './task-types';

// ============================================================================
// Task Storage (using Content table with category='contentops-task')
// ============================================================================

interface TaskRecord {
  id: string;
  chatId: string;
  messageId: number;
  rawInput: string;
  contentType: string;
  executionMode: string;
  targetEnvironment: string;
  topic: string;
  audience?: string;
  country?: string;
  city?: string;
  industry?: string;
  tone?: string;
  requiredSections?: string[];
  specialRequirements?: string;
  scheduledAt?: string;
  publishInstruction?: string;
  sourceRequirement?: string;
  status: TaskStatus;
  currentStep: string;
  stepHistory: any[];
  brief?: any;
  outline?: any;
  content?: any;
  cleanedContent?: any;
  seo?: any;
  geo?: any;
  internalLinks?: any[];
  sources?: any[];
  qualityReport?: any;
  draftId?: string;
  version?: number;
  publishedUrl?: string;
  executor: string;
  provider?: string;
  model?: string;
  retryCount: number;
  maxRetries: number;
  resumeAt?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  errorCode?: string;
  errorMessage?: string;
}

// ============================================================================
// Task Manager
// ============================================================================

export class TaskManager {
  /**
   * Create a new task
   */
  async createTask(input: CreateTaskInput): Promise<ContentOpsTask> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const record: TaskRecord = {
      id: taskId,
      chatId: input.chatId,
      messageId: input.messageId,
      rawInput: input.rawInput,
      contentType: input.contentType || 'guide',
      executionMode: input.executionMode || 'review_required',
      targetEnvironment: input.targetEnvironment || 'staging',
      topic: input.topic || input.rawInput,
      audience: input.audience,
      country: input.country,
      city: input.city,
      industry: input.industry,
      tone: input.tone,
      requiredSections: input.requiredSections,
      specialRequirements: input.specialRequirements,
      scheduledAt: input.scheduledAt,
      publishInstruction: input.publishInstruction,
      sourceRequirement: input.sourceRequirement,
      status: 'RECEIVED',
      currentStep: 'PARSING_TASK',
      stepHistory: [{
        step: 'PARSING_TASK',
        startedAt: new Date().toISOString(),
        status: 'running',
      }],
      executor: 'hermes-agent',
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in Content table with category='contentops-task'
    await prisma.content.create({
      data: {
        title: `[Task] ${record.topic.substring(0, 50)}`,
        slug: taskId,
        category: 'contentops-task',
        status: 'draft',
        language: 'zh-CN',
        body: JSON.stringify(record),
        seoDescription: JSON.stringify({
          taskId,
          chatId: record.chatId,
          status: record.status,
          contentType: record.contentType,
        }),
      },
    });

    return this.recordToTask(record);
  }

  /**
   * Get a task by ID
   */
  async getTask(taskId: string): Promise<ContentOpsTask | null> {
    const content = await prisma.content.findFirst({
      where: {
        slug: taskId,
        category: 'contentops-task',
      },
    });

    if (!content) return null;

    const record: TaskRecord = JSON.parse(content.body);
    return this.recordToTask(record);
  }

  /**
   * Update task status and step
   */
  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    step?: string,
    data?: any
  ): Promise<ContentOpsTask | null> {
    const task = await this.getTask(taskId);
    if (!task) return null;

    // Update step history
    if (step) {
      const lastStep = task.stepHistory[task.stepHistory.length - 1];
      if (lastStep && lastStep.status === 'running') {
        lastStep.completedAt = new Date().toISOString();
        lastStep.status = 'completed';
      }
      task.stepHistory.push({
        step,
        startedAt: new Date().toISOString(),
        status: 'running',
      });
      task.currentStep = step;
    }

    task.status = status;
    task.updatedAt = new Date().toISOString();

    // Merge additional data
    if (data) {
      Object.assign(task, data);
    }

    if (status === 'COMPLETED' || status === 'PUBLISHED') {
      task.completedAt = new Date().toISOString();
    }

    // Save back
    const record = this.taskToRecord(task);
    await prisma.content.update({
      where: { slug: taskId, category: 'contentops-task' },
      data: {
        body: JSON.stringify(record),
        seoDescription: JSON.stringify({
          taskId,
          chatId: task.chatId,
          status: task.status,
          contentType: task.contentType,
        }),
      },
    });

    return task;
  }

  /**
   * Get pending tasks (for cron job processing)
   */
  async getPendingTasks(limit = 5): Promise<ContentOpsTask[]> {
    const contents = await prisma.content.findMany({
      where: {
        category: 'contentops-task',
        status: 'draft',
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    const tasks: ContentOpsTask[] = [];
    for (const content of contents) {
      const record: TaskRecord = JSON.parse(content.body);
      // Only include tasks that need processing
      if (this.isTaskPending(record.status)) {
        tasks.push(this.recordToTask(record));
      }
    }

    return tasks;
  }

  /**
   * Get tasks by chat ID
   */
  async getTasksByChatId(chatId: string): Promise<ContentOpsTask[]> {
    const contents = await prisma.content.findMany({
      where: {
        category: 'contentops-task',
      },
      orderBy: { createdAt: 'desc' },
    });

    return contents
      .map(c => {
        const record: TaskRecord = JSON.parse(c.body);
        return this.recordToTask(record);
      })
      .filter(t => t.chatId === chatId);
  }

  /**
   * Mark task as failed
   */
  async failTask(taskId: string, errorCode: string, errorMessage: string): Promise<void> {
    await this.updateTaskStatus(taskId, 'FAILED', undefined, {
      errorCode,
      errorMessage,
    });
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string): Promise<void> {
    await this.updateTaskStatus(taskId, 'CANCELLED');
  }

  /**
   * Pause task (rate limit or provider unavailable)
   */
  async pauseTask(taskId: string, resumeAt?: string): Promise<void> {
    await this.updateTaskStatus(taskId, 'PAUSED_PROVIDER', undefined, {
      resumeAt: resumeAt || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  private isTaskPending(status: TaskStatus): boolean {
    const pendingStatuses: TaskStatus[] = [
      'RECEIVED',
      'PARSING',
      'SELECTING_CONTRACT',
      'RESEARCHING',
      'GENERATING_BRIEF',
      'GENERATING_STRUCTURE',
      'GENERATING_CONTENT',
      'CLEANING_CONTENT',
      'GENERATING_SEO',
      'GENERATING_GEO',
      'MATCHING_LINKS',
      'VALIDATING_FACTS',
      'QUALITY_CHECKING',
      'AUTO_REVISING',
      'CREATING_DRAFT',
    ];
    return pendingStatuses.includes(status);
  }

  private recordToTask(record: TaskRecord): ContentOpsTask {
    return {
      id: record.id,
      chatId: record.chatId,
      messageId: record.messageId,
      rawInput: record.rawInput,
      contentType: record.contentType as any,
      executionMode: record.executionMode as any,
      targetEnvironment: record.targetEnvironment as any,
      topic: record.topic,
      audience: record.audience,
      country: record.country,
      city: record.city,
      industry: record.industry,
      tone: record.tone,
      requiredSections: record.requiredSections,
      specialRequirements: record.specialRequirements,
      scheduledAt: record.scheduledAt,
      publishInstruction: record.publishInstruction,
      sourceRequirement: record.sourceRequirement,
      status: record.status,
      currentStep: record.currentStep,
      stepHistory: record.stepHistory,
      brief: record.brief,
      outline: record.outline,
      content: record.content,
      cleanedContent: record.cleanedContent,
      seo: record.seo,
      geo: record.geo,
      internalLinks: record.internalLinks,
      sources: record.sources,
      qualityReport: record.qualityReport,
      draftId: record.draftId,
      version: record.version,
      publishedUrl: record.publishedUrl,
      executor: record.executor as any,
      provider: record.provider,
      model: record.model,
      retryCount: record.retryCount,
      maxRetries: record.maxRetries,
      resumeAt: record.resumeAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      completedAt: record.completedAt,
      errorCode: record.errorCode,
      errorMessage: record.errorMessage,
    };
  }

  private taskToRecord(task: ContentOpsTask): TaskRecord {
    return {
      id: task.id,
      chatId: task.chatId,
      messageId: task.messageId,
      rawInput: task.rawInput,
      contentType: task.contentType,
      executionMode: task.executionMode,
      targetEnvironment: task.targetEnvironment,
      topic: task.topic,
      audience: task.audience,
      country: task.country,
      city: task.city,
      industry: task.industry,
      tone: task.tone,
      requiredSections: task.requiredSections,
      specialRequirements: task.specialRequirements,
      scheduledAt: task.scheduledAt,
      publishInstruction: task.publishInstruction,
      sourceRequirement: task.sourceRequirement,
      status: task.status,
      currentStep: task.currentStep,
      stepHistory: task.stepHistory,
      brief: task.brief,
      outline: task.outline,
      content: task.content,
      cleanedContent: task.cleanedContent,
      seo: task.seo,
      geo: task.geo,
      internalLinks: task.internalLinks,
      sources: task.sources,
      qualityReport: task.qualityReport,
      draftId: task.draftId,
      version: task.version,
      publishedUrl: task.publishedUrl,
      executor: task.executor,
      provider: task.provider,
      model: task.model,
      retryCount: task.retryCount,
      maxRetries: task.maxRetries,
      resumeAt: task.resumeAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      errorCode: task.errorCode,
      errorMessage: task.errorMessage,
    };
  }
}

// Singleton
export const taskManager = new TaskManager();
