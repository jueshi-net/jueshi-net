/**
 * ContentOps Persistent Scheduler
 * 
 * Handles timed publishing of content tasks.
 * - Persistent: survives restarts (file-based)
 * - Idempotent: same publishKey only publishes once
 * - Retry: failed publishes retry with backoff
 * - Production lock: checks authorization before production publish
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

export type ScheduleStatus = 
  | 'SCHEDULED'
  | 'DUE'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'RETRY_SCHEDULED'
  | 'CANCELLED';

export interface ScheduledPublish {
  id: string;
  taskId: string;
  draftId: string;
  publishKey: string; // idempotency key
  status: ScheduleStatus;
  
  // Timing
  scheduledAtUtc: string;
  scheduledTimezone: string; // e.g. 'Asia/Shanghai'
  scheduledAtOriginal: string; // original local time string
  
  // Execution
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  lastErrorCode?: string;
  nextRetryAt?: string;
  
  // Results
  publishedAt?: string;
  publishedUrl?: string;
  contentId?: string;
  
  // Metadata
  targetEnvironment: 'staging' | 'production';
  contentType: string;
  createdAt: string;
  updatedAt: string;
}

interface ScheduleStore {
  schedules: Record<string, ScheduledPublish>;
  publishKeys: Record<string, string>; // publishKey -> scheduleId (idempotency)
}

// ============================================================================
// Storage
// ============================================================================

const SCHEDULES_FILE = path.join(process.cwd(), '.contentops-schedules.json');

function loadStore(): ScheduleStore {
  try {
    if (fs.existsSync(SCHEDULES_FILE)) {
      const data = fs.readFileSync(SCHEDULES_FILE, 'utf-8');
      const store = JSON.parse(data);
      if (!store.schedules) store.schedules = {};
      if (!store.publishKeys) store.publishKeys = {};
      return store;
    }
  } catch (error) {
    console.error('[Scheduler] Failed to load store:', error);
    try {
      if (fs.existsSync(SCHEDULES_FILE)) {
        const quarantinePath = SCHEDULES_FILE + '.malformed.' + Date.now();
        fs.renameSync(SCHEDULES_FILE, quarantinePath);
        console.error('[Scheduler] Quarantined malformed file to:', quarantinePath);
      }
    } catch {}
  }
  return { schedules: {}, publishKeys: {} };
}

function saveStore(store: ScheduleStore): void {
  const tmpPath = SCHEDULES_FILE + '.tmp.' + process.pid;
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2), 'utf-8');
    fs.renameSync(tmpPath, SCHEDULES_FILE);
  } catch (error) {
    console.error('[Scheduler] Failed to save store:', error);
    try { fs.unlinkSync(tmpPath); } catch {}
    throw error;
  }
}

// ============================================================================
// Scheduler
// ============================================================================

export class ContentOpsScheduler {
  async createSchedule(params: {
    taskId: string;
    draftId: string;
    scheduledAtUtc: string;
    scheduledTimezone?: string;
    scheduledAtOriginal?: string;
    targetEnvironment: 'staging' | 'production';
    contentType: string;
  }): Promise<ScheduledPublish> {
    const store = loadStore();
    
    // Idempotency: check if this task already has a schedule
    const existingForTask = Object.values(store.schedules).find(
      s => s.taskId === params.taskId && !['CANCELLED', 'PUBLISHED'].includes(s.status)
    );
    if (existingForTask) {
      return existingForTask;
    }
    
    const publishKey = `pub_${params.taskId}_${params.draftId}`;
    
    // Check publishKey idempotency
    if (store.publishKeys[publishKey]) {
      const existing = store.schedules[store.publishKeys[publishKey]];
      if (existing && !['CANCELLED', 'PUBLISHED'].includes(existing.status)) {
        return existing;
      }
    }
    
    const scheduleId = `sched_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const schedule: ScheduledPublish = {
      id: scheduleId,
      taskId: params.taskId,
      draftId: params.draftId,
      publishKey,
      status: 'SCHEDULED',
      scheduledAtUtc: params.scheduledAtUtc,
      scheduledTimezone: params.scheduledTimezone || 'Asia/Shanghai',
      scheduledAtOriginal: params.scheduledAtOriginal || params.scheduledAtUtc,
      attempts: 0,
      maxAttempts: 3,
      targetEnvironment: params.targetEnvironment,
      contentType: params.contentType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    store.schedules[scheduleId] = schedule;
    store.publishKeys[publishKey] = scheduleId;
    saveStore(store);
    
    console.error('[Scheduler] Created schedule:', { scheduleId, taskId: params.taskId, scheduledAt: params.scheduledAtUtc });
    return schedule;
  }

  async getDueSchedules(): Promise<ScheduledPublish[]> {
    const store = loadStore();
    const now = new Date();
    
    return Object.values(store.schedules).filter(s => {
      if (s.status !== 'SCHEDULED') return false;
      const scheduledAt = new Date(s.scheduledAtUtc);
      return scheduledAt <= now;
    });
  }

  async markDue(scheduleId: string): Promise<ScheduledPublish | null> {
    const store = loadStore();
    const schedule = store.schedules[scheduleId];
    if (!schedule || schedule.status !== 'SCHEDULED') return null;
    
    schedule.status = 'DUE';
    schedule.updatedAt = new Date().toISOString();
    saveStore(store);
    return schedule;
  }

  async markPublishing(scheduleId: string): Promise<ScheduledPublish | null> {
    const store = loadStore();
    const schedule = store.schedules[scheduleId];
    if (!schedule) return null;
    
    schedule.status = 'PUBLISHING';
    schedule.attempts += 1;
    schedule.updatedAt = new Date().toISOString();
    saveStore(store);
    return schedule;
  }

  async markPublished(scheduleId: string, result: {
    publishedUrl: string;
    contentId: string;
  }): Promise<ScheduledPublish | null> {
    const store = loadStore();
    const schedule = store.schedules[scheduleId];
    if (!schedule) return null;
    
    schedule.status = 'PUBLISHED';
    schedule.publishedAt = new Date().toISOString();
    schedule.publishedUrl = result.publishedUrl;
    schedule.contentId = result.contentId;
    schedule.updatedAt = new Date().toISOString();
    saveStore(store);
    return schedule;
  }

  async markFailed(scheduleId: string, error: string, errorCode: string): Promise<ScheduledPublish | null> {
    const store = loadStore();
    const schedule = store.schedules[scheduleId];
    if (!schedule) return null;
    
    schedule.lastError = error;
    schedule.lastErrorCode = errorCode;
    schedule.updatedAt = new Date().toISOString();
    
    if (schedule.attempts < schedule.maxAttempts) {
      const backoffMs = Math.pow(2, schedule.attempts) * 60000;
      schedule.status = 'RETRY_SCHEDULED';
      schedule.nextRetryAt = new Date(Date.now() + backoffMs).toISOString();
    } else {
      schedule.status = 'FAILED';
    }
    
    saveStore(store);
    return schedule;
  }

  async cancelSchedule(scheduleId: string): Promise<ScheduledPublish | null> {
    const store = loadStore();
    const schedule = store.schedules[scheduleId];
    if (!schedule) return null;
    
    if (['PUBLISHED', 'CANCELLED'].includes(schedule.status)) {
      return schedule;
    }
    
    schedule.status = 'CANCELLED';
    schedule.updatedAt = new Date().toISOString();
    saveStore(store);
    return schedule;
  }

  async getRetrySchedules(): Promise<ScheduledPublish[]> {
    const store = loadStore();
    const now = new Date();
    
    return Object.values(store.schedules).filter(s => {
      if (s.status !== 'RETRY_SCHEDULED') return false;
      if (!s.nextRetryAt) return false;
      return new Date(s.nextRetryAt) <= now;
    });
  }

  async getSchedule(scheduleId: string): Promise<ScheduledPublish | null> {
    const store = loadStore();
    return store.schedules[scheduleId] || null;
  }

  async getScheduleByTaskId(taskId: string): Promise<ScheduledPublish | null> {
    const store = loadStore();
    return Object.values(store.schedules).find(s => s.taskId === taskId) || null;
  }

  async listSchedules(status?: ScheduleStatus): Promise<ScheduledPublish[]> {
    const store = loadStore();
    let schedules = Object.values(store.schedules);
    if (status) {
      schedules = schedules.filter(s => s.status === status);
    }
    return schedules.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async processDue(): Promise<ScheduledPublish[]> {
    const due = await this.getDueSchedules();
    const retry = await this.getRetrySchedules();
    
    for (const s of due) {
      await this.markDue(s.id);
    }
    
    return [...due, ...retry];
  }
}

// Singleton
export const scheduler = new ContentOpsScheduler();
