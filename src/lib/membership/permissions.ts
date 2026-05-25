// ⚠️ DEPRECATED — localStorage-based permissions (UI-only, NOT trusted)
//
// This module reads role from localStorage.bxb_role for UI display purposes only.
// It is NOT used for any real permission checks in production.
// Server-side permissions are in src/lib/auth/permissions.ts (DB-verified).
// Client-side hooks are in src/lib/auth/client-permissions.ts (API-fetched).
//
// localStorage role is a dev/demo tool — any user can set it in the browser console.
// All real permission checks must go through the server API.
//
// Files still using this module (UI-only, non-critical):
// - tools/documents/drafts/page.tsx (draft count display)
// - tools/documents/settings/role-switcher/page.tsx (dev role-switching tool)
//
// Migrated to usePermissions():
// - tools/documents/[type]/page.tsx ✅
// - tools/documents/shipping-label/page.tsx ✅

// 会员权限层 — 仅用于前端 UI 展示，不可作为真实权限依据
// 真实权限请查询服务端 /api/me/permissions

export type UserRole = "guest" | "user" | "member" | "admin";

export interface PermissionCheck {
  role: UserRole;
}

// 当前如果没有正式支付系统：
// - admin 默认视为会员
// - 普通用户(user)默认非会员
// - 游客(guest)默认非会员

const limits = {
  guest: {
    maxDrafts: 3,
    maxCompanyProfiles: 0,
    canUploadLogo: false,
    canUseCustomStyle: false,
    canRemoveBranding: false,
    canExportWord: false,
    canExportWordDailyLimit: 0,
    canSaveCloudDraft: false,
    canSaveCustomerTemplates: false,
    canSaveTermTemplates: false,
  },
  user: {
    maxDrafts: 10,
    maxCompanyProfiles: 1,
    canUploadLogo: false,
    canUseCustomStyle: false,
    canRemoveBranding: false,
    canExportWord: false,
    canExportWordDailyLimit: 3,
    canSaveCloudDraft: false,
    canSaveCustomerTemplates: false,
    canSaveTermTemplates: false,
  },
  member: {
    maxDrafts: 999,
    maxCompanyProfiles: 99,
    canUploadLogo: true,
    canUseCustomStyle: true,
    canRemoveBranding: true,
    canExportWord: true,
    canExportWordDailyLimit: 999,
    canSaveCloudDraft: true,
    canSaveCustomerTemplates: true,
    canSaveTermTemplates: true,
  },
  admin: {
    maxDrafts: 999,
    maxCompanyProfiles: 99,
    canUploadLogo: true,
    canUseCustomStyle: true,
    canRemoveBranding: true,
    canExportWord: true,
    canExportWordDailyLimit: 999,
    canSaveCloudDraft: true,
    canSaveCustomerTemplates: true,
    canSaveTermTemplates: true,
  },
};

function getRole(): UserRole {
  // 从 localStorage 读取角色（后期接真实用户系统）
  if (typeof window === "undefined") return "guest";
  const saved = localStorage.getItem("bxb_role");
  const normalized = (saved || "").toLowerCase();
  if (saved === "member") return "member";
  if (normalized === "admin" || saved === "管理员") return "admin";
  if (saved === "user") return "user";
  return "guest";
}

export function setRole(role: UserRole) {
  if (typeof window !== "undefined") {
    localStorage.setItem("bxb_role", role);
  }
}

export function getRoleInfo() {
  const role = getRole();
  const config = limits[role];
  return { role, ...config };
}

export function canUploadLogo(): boolean {
  return getRoleInfo().canUploadLogo;
}

export function canUseCompanyProfile(): boolean {
  return getRoleInfo().maxCompanyProfiles > 0;
}

export function canUseMultipleCompanyProfiles(): boolean {
  return getRoleInfo().maxCompanyProfiles > 1;
}

export function canUseCustomStyle(): boolean {
  return getRoleInfo().canUseCustomStyle;
}

export function canRemoveBranding(): boolean {
  return getRoleInfo().canRemoveBranding;
}

export function canExportWord(): boolean {
  return getRoleInfo().canExportWord;
}

export function getWordExportDailyLimit(): number {
  return getRoleInfo().canExportWordDailyLimit;
}

export function canSaveCloudDraft(): boolean {
  return getRoleInfo().canSaveCloudDraft;
}

export function canUseUnlimitedDrafts(): boolean {
  return getRoleInfo().maxDrafts > 50;
}

export function getMaxDrafts(): number {
  return getRoleInfo().maxDrafts;
}

export function getMaxCompanyProfiles(): number {
  return getRoleInfo().maxCompanyProfiles;
}

export function canSaveCustomerTemplates(): boolean {
  return getRoleInfo().canSaveCustomerTemplates;
}

export function canSaveTermTemplates(): boolean {
  return getRoleInfo().canSaveTermTemplates;
}

// 标签面单权限
export function canUploadLabelLogo(): boolean {
  return getRoleInfo().canUploadLogo;
}

export function canUseCustomLabelSize(): boolean {
  return getRoleInfo().maxDrafts > 50; // member/admin
}

export function canUseLabelStyles(): boolean {
  return getRoleInfo().canUseCustomStyle;
}

export function canBatchGenerateLabels(): boolean {
  const info = getRoleInfo();
  return info.maxDrafts > 50;
}

export function getLabelBatchLimit(): number {
  const role = getRoleInfo().role;
  if (['member', 'admin', '管理员'].includes(role)) return 100;
  if (role === 'user') return 10;
  return 3;
}

export function canRemoveLabelBranding(): boolean {
  return getRoleInfo().canRemoveBranding;
}

export function canSaveLabelTemplates(): boolean {
  return getRoleInfo().maxDrafts > 50;
}

export function getLabelStyleLimit(): 'default' | 'all' {
  return getRoleInfo().canUseCustomStyle ? 'all' : 'default';
}

// 权限提示文案
export const permissionMessages = {
  uploadLogo: "上传 Logo 为会员专属功能，升级会员后可使用",
  customStyle: "切换模板风格为会员专属功能，升级会员后可使用",
  removeBranding: "去除页脚品牌标识为会员专属功能，升级会员后可使用",
  exportWord: "导出 Word 为会员专属功能，升级会员后可使用",
  cloudDraft: "云端保存草稿为会员专属功能，升级会员后可使用",
  multipleProfiles: "保存多套公司信息为会员专属功能",
  customerTemplates: "保存常用客户信息为会员专属功能",
  termTemplates: "保存常用条款为会员专属功能",
};
