/**
 * ContentOps Autonomous Task Types
 * 
 * Task-based content production system.
 * Users send natural language tasks, agent orchestrates full pipeline.
 */

// ============================================================================
// Task State Machine
// ============================================================================

export type TaskStatus =
  | 'RECEIVED'           // Task received, parsing
  | 'QUEUED'             // Task created and job enqueued to inbox
  | 'PARSING'            // Extracting intent and parameters
  | 'SELECTING_CONTRACT' // Choosing content type contract
  | 'RESEARCHING'        // Gathering information
  | 'GENERATING_BRIEF'   // Creating writing brief
  | 'GENERATING_STRUCTURE' // Creating outline/structure
  | 'GENERATING_CONTENT' // Generating main content
  | 'CLEANING_CONTENT'   // Normalizing and cleaning
  | 'GENERATING_SEO'     // Generating SEO metadata
  | 'GENERATING_GEO'     // Generating GEO metadata
  | 'MATCHING_LINKS'     // Finding internal links
  | 'VALIDATING_FACTS'   // Fact-checking
  | 'QUALITY_CHECKING'   // Running quality gate
  | 'AUTO_REVISING'      // Auto-revision loop
  | 'CREATING_DRAFT'     // Saving to backend
  | 'AWAITING_REVIEW'    // Waiting for human review
  | 'SCHEDULED'          // Scheduled for future publish
  | 'PUBLISHING'         // Publishing now
  | 'PUBLISHED'          // Successfully published
  | 'PAUSED_PROVIDER'    // Paused: provider unavailable
  | 'PAUSED_RATE_LIMIT'  // Paused: rate limited
  | 'FAILED'             // Failed (see error)
  | 'FAILED_ENQUEUE'     // Task created but job enqueue failed (recoverable)
  | 'CANCELLED';         // Cancelled by user

export type ContentType = 'guide' | 'checklist' | 'topic';

export type ExecutionMode =
  | 'draft_only'              // Just create draft, no publish
  | 'review_required'         // Create draft, wait for review (default)
  | 'publish_when_validated'  // Auto-publish staging after quality pass
  | 'schedule_when_validated' // Auto-publish at scheduled time
  | 'publish_now';            // Publish immediately (staging only without prod auth)

export type TargetEnvironment = 'staging' | 'production';

// ============================================================================
// Task Definition
// ============================================================================

export interface ContentOpsTask {
  id: string;
  chatId: string;
  messageId: number;
  
  // Original task
  rawInput: string;
  
  // Parsed intent
  contentType: ContentType;
  executionMode: ExecutionMode;
  targetEnvironment: TargetEnvironment;
  
  // Extracted parameters
  topic: string;
  audience?: string;
  country?: string;
  city?: string;
  industry?: string;
  tone?: string;
  requiredSections?: string[];
  specialRequirements?: string;
  scheduledAt?: string; // ISO timestamp
  publishInstruction?: string;
  sourceRequirement?: string;
  
  // Execution state
  status: TaskStatus;
  currentStep: string;
  stepHistory: Array<{
    step: string;
    startedAt: string;
    completedAt?: string;
    status: 'running' | 'completed' | 'failed' | 'skipped';
    error?: string;
  }>;
  
  // Generated content
  brief?: any;
  outline?: any;
  content?: any;
  cleanedContent?: any;
  seo?: any;
  geo?: any;
  internalLinks?: any[];
  sources?: any[];
  qualityReport?: any;
  
  // Backend references
  draftId?: string;
  version?: number;
  publishedUrl?: string;
  
  // Execution metadata
  executor: 'hermes-agent' | 'external-api';
  provider?: string;
  model?: string;
  retryCount: number;
  maxRetries: number;
  resumeAt?: string; // ISO timestamp for rate limit recovery
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
  // Error tracking
  errorCode?: string;
  errorMessage?: string;
}

// ============================================================================
// Task Creation Input
// ============================================================================

export interface CreateTaskInput {
  chatId: string;
  messageId: number;
  rawInput: string;
  
  // Parsed fields (from NLP or manual)
  contentType?: ContentType;
  executionMode?: ExecutionMode;
  targetEnvironment?: TargetEnvironment;
  topic?: string;
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
  
  // Trusted metadata for internal smoke test detection
  source?: string;
  provider?: string;
  internalAuthorized?: boolean;
}

// ============================================================================
// Task Step Definitions
// ============================================================================

export const TASK_STEPS = [
  'PARSING_TASK',
  'SELECTING_CONTRACT',
  'RESEARCHING',
  'GENERATING_BRIEF',
  'GENERATING_STRUCTURE',
  'GENERATING_CONTENT',
  'CLEANING_CONTENT',
  'GENERATING_SEO',
  'GENERATING_GEO',
  'MATCHING_INTERNAL_LINKS',
  'VALIDATING_FACTS',
  'QUALITY_CHECKING',
  'AUTO_REVISING',
  'CREATING_BACKEND_DRAFT',
  'AWAITING_REVIEW_OR_SCHEDULE',
  'COMPLETED',
] as const;

export type TaskStep = typeof TASK_STEPS[number];

// ============================================================================
// Task Events
// ============================================================================

export type TaskEvent =
  | { type: 'TASK_CREATED'; taskId: string; input: CreateTaskInput }
  | { type: 'TASK_STEP_STARTED'; taskId: string; step: TaskStep }
  | { type: 'TASK_STEP_COMPLETED'; taskId: string; step: TaskStep; data?: any }
  | { type: 'TASK_STEP_FAILED'; taskId: string; step: TaskStep; error: string }
  | { type: 'TASK_PAUSED'; taskId: string; reason: string; resumeAt?: string }
  | { type: 'TASK_RESUMED'; taskId: string }
  | { type: 'TASK_COMPLETED'; taskId: string; draftId: string }
  | { type: 'TASK_FAILED'; taskId: string; error: string; errorCode: string }
  | { type: 'TASK_CANCELLED'; taskId: string };
