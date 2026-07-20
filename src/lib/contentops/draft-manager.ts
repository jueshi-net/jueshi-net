/**
 * ContentOps Draft Manager (File-based)
 * 
 * Manages content drafts using file-based storage.
 * No database migration required.
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

export interface Draft {
  id: string;
  title: string;
  body: string;
  state: 'DRAFT' | 'NEEDS_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'FAILED';
  version: number;
  targetEnvironment: 'staging' | 'production';
  qualityMetadata?: any;
  versionHistory?: any[];
  approvalRecord?: any;
  publishRecord?: any;
  publishedUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDraftInput {
  title: string;
  body: string;
  targetEnvironment?: 'staging' | 'production';
  qualityMetadata?: any;
}

// ============================================================================
// File Storage
// ============================================================================

const DRAFTS_FILE = path.join(process.cwd(), '.contentops-drafts.json');

interface DraftStore {
  drafts: Record<string, Draft>;
}

function loadDrafts(): DraftStore {
  try {
    if (fs.existsSync(DRAFTS_FILE)) {
      const data = fs.readFileSync(DRAFTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('[DraftManager] Failed to load drafts:', error);
  }
  return { drafts: {} };
}

function saveDrafts(store: DraftStore): void {
  try {
    fs.writeFileSync(DRAFTS_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (error) {
    console.error('[DraftManager] Failed to save drafts:', error);
  }
}

// ============================================================================
// Draft Manager Functions
// ============================================================================

export async function createDraft(input: CreateDraftInput): Promise<Draft> {
  const draftId = `draft_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const draft: Draft = {
    id: draftId,
    title: input.title,
    body: input.body,
    state: 'DRAFT',
    version: 1,
    targetEnvironment: input.targetEnvironment || 'staging',
    qualityMetadata: input.qualityMetadata,
    versionHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const store = loadDrafts();
  store.drafts[draftId] = draft;
  saveDrafts(store);

  console.log(`[DraftManager] Created draft: ${draftId} (${draft.title})`);
  return draft;
}

export async function getDraft(draftId: string): Promise<Draft | null> {
  const store = loadDrafts();
  return store.drafts[draftId] || null;
}

export async function listDrafts(options?: {
  limit?: number;
  offset?: number;
  state?: string;
  targetEnvironment?: string;
}): Promise<{ drafts: Draft[]; total: number }> {
  const store = loadDrafts();
  let drafts = Object.values(store.drafts);

  // Filter by state
  if (options?.state) {
    drafts = drafts.filter(d => d.state === options.state);
  }

  // Filter by target environment
  if (options?.targetEnvironment) {
    drafts = drafts.filter(d => d.targetEnvironment === options.targetEnvironment);
  }

  // Sort by creation date (newest first)
  drafts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = drafts.length;

  // Apply pagination
  const offset = options?.offset || 0;
  const limit = options?.limit || 20;
  drafts = drafts.slice(offset, offset + limit);

  return { drafts, total };
}

export async function updateDraft(
  draftId: string,
  updates: Partial<Pick<Draft, 'title' | 'body' | 'state' | 'qualityMetadata' | 'approvalRecord' | 'publishRecord' | 'publishedUrl'>>
): Promise<Draft | null> {
  const store = loadDrafts();
  const draft = store.drafts[draftId];
  
  if (!draft) {
    return null;
  }

  // If body is being updated, increment version and save to history
  if (updates.body && updates.body !== draft.body) {
    draft.versionHistory = draft.versionHistory || [];
    draft.versionHistory.push({
      version: draft.version,
      body: draft.body,
      updatedAt: draft.updatedAt.toISOString(),
    });
    draft.version += 1;
    draft.body = updates.body;
  }

  // Apply other updates
  if (updates.title) draft.title = updates.title;
  if (updates.state) draft.state = updates.state;
  if (updates.qualityMetadata) draft.qualityMetadata = updates.qualityMetadata;
  if (updates.approvalRecord) draft.approvalRecord = updates.approvalRecord;
  if (updates.publishRecord) draft.publishRecord = updates.publishRecord;
  if (updates.publishedUrl) draft.publishedUrl = updates.publishedUrl;

  draft.updatedAt = new Date();

  store.drafts[draftId] = draft;
  saveDrafts(store);

  console.log(`[DraftManager] Updated draft: ${draftId} (v${draft.version}, ${draft.state})`);
  return draft;
}

export async function deleteDraft(draftId: string): Promise<boolean> {
  const store = loadDrafts();
  
  if (!store.drafts[draftId]) {
    return false;
  }

  delete store.drafts[draftId];
  saveDrafts(store);

  console.log(`[DraftManager] Deleted draft: ${draftId}`);
  return true;
}

export async function getVersionHistory(draftId: string): Promise<any[]> {
  const draft = await getDraft(draftId);
  return draft?.versionHistory || [];
}
