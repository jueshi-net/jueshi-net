// src/lib/ai/quota.ts — AI tool quota and permission management
import crypto from "crypto";

export interface QuotaResult {
  allowed: boolean;
  dailyLimit: number;
  usedToday: number;
  remaining: number;
  needsPoints: boolean;
  costPoints: number;
  role: string;
}

export function getDailyLimit(role: string): number {
  switch (role) {
    case "admin":
    case "管理员": return 999;
    case "member": return 50;
    case "user": return 3;
    default: return 1; // guest
  }
}

export function getCostPoints(role: string): number {
  // guest: free (but limited to 1)
  // user: free for first 3, then 20 pts each
  // member: free
  // admin: free
  if (role === "user") return 20;
  return 0;
}

export function hashInput(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}

export function validateInputLength(toolType: string, totalLength: number): { valid: boolean; error?: string } {
  const limits: Record<string, number> = {
    product_copy: 2000,
    translate_polish: 3000,
    document_summary: 6000,
    video_script_sop: 1000,
  };
  const limit = limits[toolType] || 2000;
  if (totalLength > limit) {
    return { valid: false, error: `输入内容过长，最多 ${limit} 字` };
  }
  return { valid: true };
}

export function getVancouverDateString(): string {
  // Pacific Time (Vancouver)
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { timeZone: "America/Vancouver", year: "numeric", month: "2-digit", day: "2-digit" };
  const parts = new Intl.DateTimeFormat("en-CA", options).formatToParts(date);
  const year = parts.find(p => p.type === "year")?.value;
  const month = parts.find(p => p.type === "month")?.value;
  const day = parts.find(p => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}
