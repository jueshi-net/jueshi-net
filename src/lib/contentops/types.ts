// ContentOps V1 — Unified State Machine & Types
// 统一内容状态机，Telegram 和 Web 共用

export const CONTENT_STATES = [
  'IDEA',
  'RESEARCHING', 
  'DRAFTING',
  'DRAFT',
  'NEEDS_REVIEW',
  'CHANGES_REQUESTED',
  'APPROVED',
  'SCHEDULED',
  'PUBLISHING',
  'PUBLISHED',
  'FAILED',
  'UNPUBLISHED',
  'ROLLED_BACK',
] as const;

export type ContentState = typeof CONTENT_STATES[number];

export type ContentType = 'guide' | 'topic' | 'checklist';

export type PublishTarget = 'staging' | 'production';

// Valid state transitions
export const STATE_TRANSITIONS: Record<ContentState, ContentState[]> = {
  IDEA: ['RESEARCHING', 'DRAFTING', 'DRAFT'],
  RESEARCHING: ['DRAFTING', 'DRAFT'],
  DRAFTING: ['DRAFT'],
  DRAFT: ['NEEDS_REVIEW', 'DRAFTING'],
  NEEDS_REVIEW: ['APPROVED', 'CHANGES_REQUESTED'],
  CHANGES_REQUESTED: ['DRAFTING', 'DRAFT'],
  APPROVED: ['SCHEDULED', 'PUBLISHING', 'CHANGES_REQUESTED'],
  SCHEDULED: ['PUBLISHING', 'APPROVED'],
  PUBLISHING: ['PUBLISHED', 'FAILED'],
  PUBLISHED: ['UNPUBLISHED', 'ROLLED_BACK'],
  FAILED: ['DRAFTING', 'DRAFT', 'PUBLISHING'], // retry
  UNPUBLISHED: ['DRAFT', 'DRAFTING'],
  ROLLED_BACK: ['DRAFT', 'DRAFTING'],
};

export function canTransition(from: ContentState, to: ContentState): boolean {
  return STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

// Quality gate thresholds
export const QUALITY_THRESHOLDS = {
  minQualityScore: 60,
  minSeoScore: 50,
  minGeoScore: 40,
  maxIssues: 3,
};

// Content Draft interface
export interface ContentDraft {
  id: string;
  // Core
  title: string;
  slug: string;
  contentType: ContentType;
  state: ContentState;
  // Content
  summary: string;
  body: string;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  faq?: Array<{ question: string; answer: string }>;
  internalLinks?: Array<{ url: string; title: string }>;
  sourceFacts?: Array<{ fact: string; source?: string }>;
  // Quality
  qualityScore?: number;
  seoScore?: number;
  geoScore?: number;
  qualityIssues?: Array<{ type: string; severity: string; message: string }>;
  // Versioning
  version: number;
  publishKey: string; // idempotency key
  // Audit
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  // Publishing
  targetEnvironment: PublishTarget;
  publishedAt?: Date;
  publishedUrl?: string;
  publishError?: string;
  publishRetries: number;
  // Review
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewComment?: string;
  // Scheduling
  scheduledAt?: Date;
}

// Audit log entry
export interface AuditEntry {
  id: string;
  draftId: string;
  action: string;
  fromState?: ContentState;
  toState?: ContentState;
  actor: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Publish result
export interface PublishResult {
  success: boolean;
  url?: string;
  error?: string;
  contentId?: string;
  version?: number;
  timestamp: Date;
}

// Rate limit state
export interface RateLimitState {
  paused: boolean;
  pausedAt?: Date;
  resumeAt?: Date;
  reason?: string;
  retryAfter?: number;
}
