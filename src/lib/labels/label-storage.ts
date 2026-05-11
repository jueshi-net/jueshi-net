// 标签草稿管理 - localStorage
export interface LabelDraft {
  id: string;
  type: string;
  title: string;
  labelSize: string;
  data: Record<string, any>;
  style: string;
  createdAt: string;
  updatedAt: string;
}

const DRAFTS_KEY = "bxb_label_drafts";

function getDrafts(): LabelDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveDrafts(drafts: LabelDraft[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export function saveLabelDraft(draft: Omit<LabelDraft, "id" | "createdAt" | "updatedAt"> & { id?: string }, maxDrafts: number): LabelDraft {
  const drafts = getDrafts();
  const existing = drafts.findIndex(d => d.id === draft.id);
  const now = new Date().toISOString();
  const full: LabelDraft = {
    ...draft,
    id: draft.id || `label-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: existing >= 0 ? drafts[existing].createdAt : now,
    updatedAt: now,
  };
  if (existing >= 0) drafts[existing] = full;
  else {
    while (drafts.length >= maxDrafts) drafts.shift();
    drafts.push(full);
  }
  saveDrafts(drafts);
  return full;
}

export function getLabelDraft(type: string): LabelDraft | undefined {
  return getDrafts().filter(d => d.type === type).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
}

export function getAllLabelDrafts(): LabelDraft[] {
  return getDrafts().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function deleteLabelDraft(id: string) {
  saveDrafts(getDrafts().filter(d => d.id !== id));
}
