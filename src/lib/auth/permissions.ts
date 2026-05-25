// src/lib/auth/permissions.ts
// Server-side permission validation module.
// DO NOT use this on the client side. Use src/lib/membership/permissions.ts for UI hints.
//
// PERMISSION SOURCE: Role is ALWAYS read fresh from the database users table.
// JWT session only provides userId/email for lookup — never trusted as permission source.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

export type ServerRole = "guest" | "user" | "member" | "admin";

/**
 * Robust admin role check — handles all historical variants.
 * 
 * Accepted values: 'admin', 'ADMIN', '管理员', 'Admin', 'administrator'
 * This covers: original English, all-caps, Chinese, and any case-insensitive match.
 */
export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = role.trim().toLowerCase();
  return normalized === "admin" || normalized === "administrator" || normalized === "管理员";
}

/**
 * Robust member-or-admin check — both have elevated privileges.
 */
export function isElevatedRole(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = role.trim().toLowerCase();
  return normalized === "admin" || normalized === "administrator" || normalized === "管理员" || normalized === "member";
}

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

export interface PermissionResult {
  allowed: boolean;
  role: ServerRole;
  mustShowBranding: boolean;
  allowedTemplateStyle: "standard" | "blue" | "logistics" | "dark" | "minimal" | "all";
  remainingToday: number | null;
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
    canExportWord: true,
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

const MEMBER_STYLES = ["standard", "blue", "logistics", "dark", "minimal"] as const;
type MemberStyle = (typeof MEMBER_STYLES)[number];

/**
 * Get the current user's role from the DATABASE.
 * Session only provides userId/email — role is ALWAYS queried from DB.
 * Falls back to "guest" if no session or DB query fails.
 */
export async function getCurrentUserRole(): Promise<ServerRole> {
  try {
    const session = await auth();
    if (!session?.user) return "guest";

    // Fast path: use role from JWT token if available
    const tokenRole = (session.user as any).role;
    if (tokenRole) {
      const role = tokenRole.toLowerCase();
      if (role === "admin" || role === "管理员") return "admin";
      if (role === "member") return "member";
      if (role === "user") return "user";
    }

    // Fallback: DB lookup
    const userId = (session.user as any).id;
    const email = (session.user as any).email;

    let dbUser = null;
    if (userId) {
      dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
    } else if (email) {
      dbUser = await prisma.user.findUnique({
        where: { email },
        select: { role: true },
      });
    }

    if (!dbUser) return "guest";

    const role = dbUser.role?.toLowerCase();
    if (role === "admin" || role === "管理员") return "admin";
    if (role === "member") return "member";
    if (role === "user") return "user";

    return "guest";
  } catch {
    return "guest";
  }
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
  const role = await getCurrentUserRole();
  return { session, role };
}

/**
 * Require the user to be a member or admin.
 * Returns { session, role } or throws a 403 Response.
 */
export async function requireMember() {
  const res = await requireLogin();
  if ("error" in res) return res;

  if (!["member", "admin", "管理员"].includes(res.role)) {
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

  if (!["admin", "管理员"].includes(res.role)) {
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

/**
 * Check Word export daily limit and record usage.
 * Returns { allowed, remaining } or error.
 */
export async function checkWordExportLimit(userId: string, role: ServerRole): Promise<{ allowed: boolean; remaining: number | null; error?: string }> {
  const limits = getUserLimits(role);

  // Guest or no limit
  if (!limits.canExportWord) {
    return { allowed: false, remaining: 0, error: "Word 导出需要登录" };
  }
  if (limits.canExportWordDailyLimit >= 999) {
    return { allowed: true, remaining: null };
  }

  // Count today's exports
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await prisma.exportLog.count({
    where: {
      userId,
      exportType: "word",
      createdAt: { gte: today, lt: tomorrow },
    },
  });

  const remaining = limits.canExportWordDailyLimit - count;
  if (remaining <= 0) {
    return { allowed: false, remaining: 0, error: "免费用户每日 Word 导出次数已用完（3 次）" };
  }

  return { allowed: true, remaining };
}

/**
 * Record an export in the log.
 */
export async function recordExport(userId: string | null, exportType: string, documentType?: string, ipHash?: string, userAgent?: string) {
  await prisma.exportLog.create({
    data: {
      userId: userId || undefined,
      exportType,
      documentType: documentType || undefined,
      ipHash: ipHash || undefined,
      userAgent: userAgent || undefined,
    },
  });
}

/**
 * Hash IP address for anonymous logging.
 */
export function hashIP(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/**
 * Generate a short-lived export authorization token.
 */
export function generateExportToken(payload: Record<string, unknown>): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback";
  const data = JSON.stringify({ ...payload, exp: Date.now() + 5 * 60 * 1000 }); // 5 min
  const sig = createHash("sha256").update(`${data}${secret}`).digest("hex").slice(0, 16);
  return `${Buffer.from(data).toString("base64url")}.${sig}`;
}

/**
 * Verify and decode an export token.
 */
export function verifyExportToken(token: string): Record<string, unknown> | null {
  try {
    const [dataB64, sig] = token.split(".");
    const data = Buffer.from(dataB64, "base64url").toString("utf-8");
    const parsed = JSON.parse(data) as { exp: number; [key: string]: unknown };

    if (Date.now() > parsed.exp) return null;

    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback";
    const expectedSig = createHash("sha256").update(`${data}${secret}`).digest("hex").slice(0, 16);
    if (sig !== expectedSig) return null;

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Full export authorization logic.
 */
export async function authorizeExport(
  role: ServerRole,
  exportType: "word" | "png" | "pdf",
  documentType?: string,
  removeBranding = false,
  templateStyle?: string,
  userId?: string | null
): Promise<PermissionResult> {
  const limits = getUserLimits(role);

  // Word export checks
  if (exportType === "word") {
    if (role === "guest") {
      return { allowed: false, role, mustShowBranding: true, allowedTemplateStyle: "standard", remainingToday: 0 };
    }
    if (userId && limits.canExportWordDailyLimit < 999) {
      const check = await checkWordExportLimit(userId, role);
      if (!check.allowed) {
        return { allowed: false, role, mustShowBranding: true, allowedTemplateStyle: "standard", remainingToday: 0 };
      }
    }
  }

  // PNG/PDF: always allowed, branding depends on role
  const mustShowBranding = !limits.canRemoveBranding || !removeBranding;

  // Template style enforcement
  let allowedStyle: "standard" | "blue" | "logistics" | "dark" | "minimal" | "all" = "standard";
  if (limits.canUseCustomStyle && templateStyle && MEMBER_STYLES.includes(templateStyle as MemberStyle)) {
    allowedStyle = templateStyle as typeof allowedStyle;
  }

  const remainingToday = role === "user" && userId ? (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return prisma.exportLog.count({
      where: { userId, exportType: "word", createdAt: { gte: today, lt: tomorrow } },
    }).then(c => limits.canExportWordDailyLimit - c);
  })() : null;

  return {
    allowed: exportType !== "word" || limits.canExportWord,
    role,
    mustShowBranding,
    allowedTemplateStyle: allowedStyle,
    remainingToday: await remainingToday,
  };
}
