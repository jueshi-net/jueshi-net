#!/usr/bin/env tsx
/**
 * Hermes Job Bridge
 * 
 * Provides file-based job queue for Hermes Agent integration.
 * Bot writes jobs to inbox/, Hermes Agent processes and writes to outbox/.
 * 
 * This bridge ensures Bot never directly calls model APIs.
 * 
 * V2-MVP: v1.20.42.18.6.16.6.84.4.8.1
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

// ============================================================================
// Configuration
// ============================================================================

const JOBS_DIR = process.env.HERMES_JOBS_DIR || '/var/lib/jueshi-contentops/jobs';
const INBOX_DIR = join(JOBS_DIR, 'inbox');
const OUTBOX_DIR = join(JOBS_DIR, 'outbox');
const POLL_INTERVAL_MS = 5000; // 5 seconds
const JOB_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// Types
// ============================================================================

export type InputMode = 'long_text' | 'reference_rewrite' | 'messy_notes' | 'title_brief' | 'unknown';
export type ContentType = 'checklist' | 'guide' | 'topic';
export type JobType = 'contentops_generate' | 'contentops_modify';

export interface HermesJob {
  jobId: string;
  jobType: JobType;
  inputMode: InputMode;
  text: string;
  currentPlan?: any; // For modify jobs
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface HermesJobResult {
  jobId: string;
  hermesRunId: string;
  gatewayUsed: true; // Always true when using bridge
  planningUsed: boolean;
  fallbackUsed: boolean;
  inputMode: InputMode;
  contentType: ContentType;
  schemaType: ContentType;
  title: string;
  targetAudience: string;
  targetCountries: string[];
  audienceStage: string;
  searchIntent: string;
  sourceFacts: any[];
  content: any;
  seo: any;
  geo: any;
  structuredData: any;
  qualityGate: any;
  timestamp: string;
}

// ============================================================================
// Job Queue Management
// ============================================================================

function ensureDirs(): void {
  if (!existsSync(INBOX_DIR)) {
    mkdirSync(INBOX_DIR, { recursive: true });
  }
  if (!existsSync(OUTBOX_DIR)) {
    mkdirSync(OUTBOX_DIR, { recursive: true });
  }
}

function generateJobId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `job-${timestamp}-${random}`;
}

// ============================================================================
// Submit Job
// ============================================================================

export function submitJob(
  jobType: JobType,
  inputMode: InputMode,
  text: string,
  currentPlan?: any
): string {
  ensureDirs();
  
  const jobId = generateJobId();
  const job: HermesJob = {
    jobId,
    jobType,
    inputMode,
    text,
    currentPlan,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  const jobFile = join(INBOX_DIR, `${jobId}.json`);
  writeFileSync(jobFile, JSON.stringify(job, null, 2));
  
  console.log(`[HermesJobBridge] Job submitted: ${jobId}`);
  return jobId;
}

// ============================================================================
// Poll Job Result
// ============================================================================

export function pollJobResult(jobId: string, timeoutMs: number = JOB_TIMEOUT_MS): Promise<HermesJobResult | null> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const poll = () => {
      const resultFile = join(OUTBOX_DIR, `${jobId}.json`);
      
      if (existsSync(resultFile)) {
        try {
          const result = JSON.parse(readFileSync(resultFile, 'utf-8'));
          
          // Clean up
          try {
            unlinkSync(resultFile);
          } catch (e) {
            console.error(`[HermesJobBridge] Failed to cleanup result file: ${e}`);
          }
          
          // Clean up inbox
          const jobFile = join(INBOX_DIR, `${jobId}.json`);
          if (existsSync(jobFile)) {
            try {
              unlinkSync(jobFile);
            } catch (e) {
              console.error(`[HermesJobBridge] Failed to cleanup job file: ${e}`);
            }
          }
          
          if (result.status === 'completed') {
            resolve(result.result);
          } else if (result.status === 'failed') {
            reject(new Error(result.error || 'Job failed'));
          } else {
            // Still processing, continue polling
            if (Date.now() - startTime > timeoutMs) {
              reject(new Error('Job timeout'));
            } else {
              setTimeout(poll, POLL_INTERVAL_MS);
            }
          }
        } catch (e) {
          reject(new Error(`Failed to parse job result: ${e}`));
        }
      } else {
        // Check timeout
        if (Date.now() - startTime > timeoutMs) {
          reject(new Error('Job timeout'));
        } else {
          setTimeout(poll, POLL_INTERVAL_MS);
        }
      }
    };
    
    poll();
  });
}

// ============================================================================
// Check Bridge Health
// ============================================================================

export function checkBridgeHealth(): { healthy: boolean; message: string } {
  ensureDirs();
  
  // Check if inbox and outbox are accessible
  try {
    readdirSync(INBOX_DIR);
    readdirSync(OUTBOX_DIR);
    return { healthy: true, message: 'Bridge directories accessible' };
  } catch (e) {
    return { healthy: false, message: `Bridge directories not accessible: ${e}` };
  }
}

// ============================================================================
// List Pending Jobs
// ============================================================================

export function listPendingJobs(): string[] {
  ensureDirs();
  
  try {
    const files = readdirSync(INBOX_DIR);
    return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
  } catch (e) {
    console.error(`[HermesJobBridge] Failed to list pending jobs: ${e}`);
    return [];
  }
}
