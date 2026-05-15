// src/lib/auth/client-permissions.ts
// Client-side permission hook that fetches REAL permissions from the server.
// Falls back to localStorage.bxb_role only as a last resort (dev/demo mode).
// DO NOT trust localStorage for production permissions.

"use client";

import { useState, useEffect, useCallback } from "react";

export interface ClientLimits {
  memoMax: number;
  companyProfilesMax: number;
  labelBatchMax: number;
  maxDrafts: number;
  canUploadLogo: boolean;
  canUseCustomStyle: boolean;
  canRemoveBranding: boolean;
  canCloudDraft: boolean;
  canExportWord: boolean;
  wordExportDailyLimit: number;
}

export interface ClientPermissions {
  authenticated: boolean;
  role: "guest" | "user" | "member" | "admin";
  limits: ClientLimits;
  loaded: boolean;
}

// Default guest permissions (used as fallback before API loads)
const DEFAULT_GUEST: ClientPermissions = {
  authenticated: false,
  role: "guest",
  limits: {
    memoMax: 0,
    companyProfilesMax: 0,
    labelBatchMax: 3,
    maxDrafts: 3,
    canUploadLogo: false,
    canUseCustomStyle: false,
    canRemoveBranding: false,
    canCloudDraft: false,
    canExportWord: false,
    wordExportDailyLimit: 0,
  },
  loaded: false,
};

// Legacy localStorage fallback (dev/demo only)
function getFallbackRole(): ClientPermissions {
  if (typeof window === "undefined") return DEFAULT_GUEST;
  const saved = localStorage.getItem("bxb_role");
  if (saved === "member") {
    return {
      authenticated: false,
      role: "member",
      limits: {
        memoMax: 999,
        companyProfilesMax: 99,
        labelBatchMax: 100,
        maxDrafts: 999,
        canUploadLogo: true,
        canUseCustomStyle: true,
        canRemoveBranding: true,
        canCloudDraft: true,
        canExportWord: true,
        wordExportDailyLimit: 999,
      },
      loaded: true,
    };
  }
  if (saved === "admin") {
    return {
      authenticated: false,
      role: "admin",
      limits: {
        memoMax: 999,
        companyProfilesMax: 99,
        labelBatchMax: 100,
        maxDrafts: 999,
        canUploadLogo: true,
        canUseCustomStyle: true,
        canRemoveBranding: true,
        canCloudDraft: true,
        canExportWord: true,
        wordExportDailyLimit: 999,
      },
      loaded: true,
    };
  }
  if (saved === "user") {
    return {
      authenticated: false,
      role: "user",
      limits: {
        memoMax: 20,
        companyProfilesMax: 1,
        labelBatchMax: 10,
        maxDrafts: 10,
        canUploadLogo: false,
        canUseCustomStyle: false,
        canRemoveBranding: false,
        canCloudDraft: false,
        canExportWord: true,
        wordExportDailyLimit: 3,
      },
      loaded: true,
    };
  }
  return DEFAULT_GUEST;
}

/**
 * Hook: fetches real permissions from /api/me/permissions.
 * Falls back to localStorage.bxb_role ONLY if the API fails.
 * Usage: const perms = usePermissions();
 */
export function usePermissions(): ClientPermissions {
  const [perms, setPerms] = useState<ClientPermissions>(DEFAULT_GUEST);

  useEffect(() => {
    let cancelled = false;

    async function fetchPerms() {
      try {
        const res = await fetch("/api/me/permissions", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setPerms({ ...data, loaded: true });
        }
      } catch {
        // API failed → fallback to localStorage (dev/demo mode)
        if (!cancelled) {
          setPerms({ ...getFallbackRole(), loaded: true });
        }
      }
    }

    fetchPerms();
    return () => { cancelled = true; };
  }, []);

  return perms;
}

/**
 * Authorize an export via server API.
 * Returns the authorization result or an error.
 */
export async function authorizeExportClient(params: {
  exportType: "word" | "png" | "pdf";
  documentType?: string;
  removeBranding?: boolean;
  templateStyle?: string;
}): Promise<{
  allowed: boolean;
  error?: string;
  role?: string;
  mustShowBranding?: boolean;
  allowedTemplateStyle?: string;
  remainingToday?: number | null;
  token?: string;
}> {
  try {
    const res = await fetch("/api/export/authorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      return { allowed: false, error: data.error || "导出被拒绝", ...data };
    }
    return { allowed: true, ...data };
  } catch {
    return { allowed: false, error: "网络错误，请重试" };
  }
}

/**
 * Legacy wrapper: same interface as src/lib/membership/permissions.ts
 * but uses server-fetched permissions instead of localStorage.
 * For gradual migration of existing components.
 */
export function createPermissionHelpers(perms: ClientPermissions) {
  return {
    canUploadLogo: () => perms.limits.canUploadLogo,
    canRemoveBranding: () => perms.limits.canRemoveBranding,
    canExportWord: () => perms.limits.canExportWord,
    canUseCustomStyle: () => perms.limits.canUseCustomStyle,
    canSaveCloudDraft: () => perms.limits.canCloudDraft,
    getLabelBatchLimit: () => perms.limits.labelBatchMax,
    getMaxCompanyProfiles: () => perms.limits.companyProfilesMax,
    getWordExportDailyLimit: () => perms.limits.wordExportDailyLimit,
    getRole: () => perms.role,
    isAuthenticated: () => perms.authenticated,
  };
}
