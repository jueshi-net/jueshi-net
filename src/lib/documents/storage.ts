// 本地存储管理 — 单据草稿 + 公司信息
// 使用 localStorage，不依赖数据库

export interface DocumentDraft {
  id: string;
  type: string;
  title: string;
  documentNo: string;
  data: Record<string, any>;
  lineItems: Record<string, any>[];
  style: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  companyNameEn: string;
  address: string;
  addressEn: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  contactPerson: string;
  defaultCurrency: string;
  defaultTerms: string;
  logoUrl?: string; // Base64 or URL for company logo
}

const DRAFTS_KEY = "bxb_document_drafts";
const COMPANY_KEY = "bxb_company_profile";
const COMPANIES_KEY = "bxb_company_profiles";

// ========== 草稿管理 ==========

export function getDrafts(): DocumentDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDrafts(drafts: DocumentDraft[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export function saveDraft(draft: Omit<DocumentDraft, "id" | "createdAt" | "updatedAt"> & { id?: string }, maxDrafts: number): DocumentDraft {
  const drafts = getDrafts();
  const existing = drafts.findIndex(d => d.id === draft.id || (draft.documentNo && d.documentNo === draft.documentNo && d.type === draft.type));

  const now = new Date().toISOString();
  const fullDraft: DocumentDraft = {
    ...draft,
    id: draft.id || `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: existing >= 0 ? drafts[existing].createdAt : now,
    updatedAt: now,
  };

  if (existing >= 0) {
    drafts[existing] = fullDraft;
  } else {
    // Enforce limit — remove oldest
    while (drafts.length >= maxDrafts) {
      drafts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      drafts.shift();
    }
    drafts.push(fullDraft);
  }

  saveDrafts(drafts);
  return fullDraft;
}

export function getDraft(type: string, id?: string): DocumentDraft | undefined {
  const drafts = getDrafts();
  if (id) return drafts.find(d => d.id === id);
  return drafts.filter(d => d.type === type).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
}

export function getDraftsByType(type: string): DocumentDraft[] {
  return getDrafts().filter(d => d.type === type).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function deleteDraft(id: string) {
  const drafts = getDrafts().filter(d => d.id !== id);
  saveDrafts(drafts);
}

export function getDraftCount(): number {
  return getDrafts().length;
}

// ========== 公司信息管理 ==========

export function saveCompanyProfile(profile: CompanyProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPANY_KEY, JSON.stringify(profile));
}

export function getCompanyProfile(): CompanyProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COMPANY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// 多套公司信息（会员功能）
export function saveCompanyProfiles(profiles: CompanyProfile[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(profiles));
}

export function getCompanyProfiles(): CompanyProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMPANIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
