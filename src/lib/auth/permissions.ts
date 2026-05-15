// src/lib/auth/permissions.ts
// Server-side permission validation module.
// DO NOT use this on the client side. Use src/lib/membership/permissions.ts for UI hints.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ServerRole = "guest" | "user" | "member" | "admin";

export interface UserLimits {
  maxDrafts: number;
  maxCompanyProfiles: number;
  canUploadLogo: boolean;
  canUseCustomStyle: boolean;
  canRemoveBranding: boolean;
  canExportWord: boolean;
  canExportWordDailyLimit: number;
  canSaveCloudDraft: boolean;
  canSaveCustomerTemplates: boolean;
  canSaveTermTemplates: boolean;
  maxMemos: number;
  labelBatchLimit: number;
}

const LIMITS: Record<ServerRole, UserLimits> = {
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
    maxMemos: 0,
    labelBatchLimit: 3,
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
    maxMemos: 20,
    labelBatchLimit: 10,
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
    maxMemos: 999,
    labelBatchLimit: 100,
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
    maxMemos: 999,
    labelBatchLimit: 100,
  },
};

/**
 * Get the current user's role from the session.
 * Falls back to "guest" if no session or role is missing.
 */
export async function getCurrentUserRole(): Promise<ServerRole> {
  const session = await auth();
  if (!session?.user) return "guest";
  
  // Role is stored in session.user from JWT
  const role = (session.user as any).role;
  if (role === "admin") return "admin";
  if (role === "member") return "member";
  if (role === "user") return "user";
  
  return "guest";
}

/**
 * Require the user to be logged in.
 * Returns { session, role } or throws a 401 Response.
 */
export async function requireLogin() {
  const session = await auth();
  if (!session?.user) {
    return { error: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }) };
  }
  const role = (session.user as any).role || "user";
  return { session, role: role as ServerRole };
}

/**
 * Require the user to be a member or admin.
 * Returns { session, role } or throws a 403 Response.
 */
export async function requireMember() {
  const res = await requireLogin();
  if ("error" in res) return res;
  
  if (res.role !== "member" && res.role !== "admin") {
    return { error: new Response(JSON.stringify({ error: "Forbidden: Member required" }), { status: 403 }) };
  }
  return { session: res.session, role: res.role };
}

/**
 * Require the user to be an admin.
 * Returns { session, role } or throws a 403 Response.
 */
export async function requireAdmin() {
  const res = await requireLogin();
  if ("error" in res) return res;
  
  if (res.role !== "admin") {
    return { error: new Response(JSON.stringify({ error: "Forbidden: Admin required" }), { status: 403 }) };
  }
  return { session: res.session, role: res.role };
}

/**
 * Get the limits for the current user's role.
 */
export function getUserLimits(role: ServerRole): UserLimits {
  return LIMITS[role] || LIMITS.guest;
}

/**
 * Check if a role can use a specific feature.
 */
export function canUseFeature(role: ServerRole, feature: keyof UserLimits): boolean {
  const limits = getUserLimits(role);
  const val = limits[feature];
  return typeof val === "boolean" ? val : (val as number) > 0;
}
