/**
 * ContentOps Task Manager
 * 
 * Persistent task storage using JSON file (no DB migration needed).
 * Tasks survive server restarts and can be resumed.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ContentOpsTask, CreateTaskInput, TaskStatus } from './task-types';

// ============================================================================
// File-based Storage
// ============================================================================

const TASKS_FILE = path.join(process.cwd(), '.contentops-tasks.json');

interface TaskStore {
  tasks: Record<string, ContentOpsTask>;
}

function loadTasks(): TaskStore {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('[TaskManager] Failed to load tasks:', error);
  }
  return { tasks: {} };
}

function saveTasks(store: TaskStore): void {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (error) {
    console.error('[TaskManager] Failed to save tasks:', error);
  }
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
    
    const task: ContentOpsTask = {
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

    const store = loadTasks();
    store.tasks[taskId] = task;
    saveTasks(store);

    console.log(`[TaskManager] Created task: ${taskId} (${task.contentType}: ${task.topic})`);
    return task;
  }

  /**
   * Get a task by ID
   */
  async getTask(taskId: string): Promise<ContentOpsTask | null> {
    const store = loadTasks();
    return store.tasks[taskId] || null;
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
    const store = loadTasks();
    const task = store.tasks[taskId];
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

    if (status === 'COMPLETED' || status === 'PUBLISHED' || status === 'AWAITING_REVIEW') {
      task.completedAt = new Date().toISOString();
    }

    store.tasks[taskId] = task;
    saveTasks(store);

    console.log(`[TaskManager] Updated task ${taskId}: status=${status}, step=${step || task.currentStep}`);
    return task;
  }

  /**
   * Get pending tasks (for cron job processing)
   */
  async getPendingTasks(limit = 5): Promise<ContentOpsTask[]> {
    const store = loadTasks();
    const allTasks = Object.values(store.tasks);
    
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

    return allTasks
      .filter(t => pendingStatuses.includes(t.status))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(0, limit);
  }

  /**
   * Get tasks by chat ID
   */
  async getTasksByChatId(chatId: string): Promise<ContentOpsTask[]> {
    const store = loadTasks();
    return Object.values(store.tasks)
      .filter(t => t.chatId === chatId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
}

// Singleton
export const taskManager = new TaskManager();
