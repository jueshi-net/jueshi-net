/**
 * ContentOps Session Store
 * Persists currentDraftId per chatId to survive bot restarts.
 * Uses a simple JSON file — no schema changes needed.
 */

import * as fs from 'fs';
import * as path from 'path';

const STORE_PATH = path.join(
  process.env.HOME || '/Users/chq',
  '.hermes',
  'data',
  'contentops-sessions.json'
);

interface SessionRecord {
  chatId: number;
  currentDraftId?: string;
  currentTitle?: string;
  mode?: 'IDLE' | 'EDITING';
  editingDraftId?: string;
  updatedAt: string;
}

interface SessionStore {
  [chatId: string]: SessionRecord;
}

function ensureDir(): void {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadStore(): SessionStore {
  try {
    ensureDir();
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[ContentOps SessionStore] Load error:', err);
  }
  return {};
}

function saveStore(store: SessionStore): void {
  try {
    ensureDir();
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ContentOps SessionStore] Save error:', err);
  }
}

export function getSession(chatId: number): SessionRecord {
  const store = loadStore();
  const key = String(chatId);
  if (!store[key]) {
    store[key] = { chatId, updatedAt: new Date().toISOString() };
    saveStore(store);
  }
  return store[key];
}

export function updateSession(
  chatId: number,
  updates: { currentDraftId?: string; currentTitle?: string; mode?: 'IDLE' | 'EDITING'; editingDraftId?: string }
): SessionRecord {
  const store = loadStore();
  const key = String(chatId);
  if (!store[key]) {
    store[key] = { chatId, updatedAt: new Date().toISOString() };
  }
  if (updates.currentDraftId !== undefined) {
    store[key].currentDraftId = updates.currentDraftId;
  }
  if (updates.currentTitle !== undefined) {
    store[key].currentTitle = updates.currentTitle;
  }
  if (updates.mode !== undefined) {
    store[key].mode = updates.mode;
  }
  if (updates.editingDraftId !== undefined) {
    store[key].editingDraftId = updates.editingDraftId;
  }
  store[key].updatedAt = new Date().toISOString();
  saveStore(store);
  return store[key];
}

export function clearSession(chatId: number): void {
  const store = loadStore();
  const key = String(chatId);
  if (store[key]) {
    store[key].currentDraftId = undefined;
    store[key].currentTitle = undefined;
    store[key].mode = undefined;
    store[key].editingDraftId = undefined;
    store[key].updatedAt = new Date().toISOString();
    saveStore(store);
  }
}
