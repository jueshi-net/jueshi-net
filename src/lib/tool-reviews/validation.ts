// Tool review validation utilities

import crypto from "crypto";

export interface ReviewValidation {
  valid: boolean;
  error?: string;
}

/**
 * Validate rating (1-5)
 */
export function validateRating(rating: unknown): ReviewValidation {
  if (typeof rating !== "number" || !Number.isInteger(rating)) {
    return { valid: false, error: "评分必须是 1-5 的整数" };
  }
  if (rating < 1 || rating > 5) {
    return { valid: false, error: "评分必须在 1-5 之间" };
  }
  return { valid: true };
}

/**
 * Validate review content (5-300 chars, no URLs, no spam)
 */
export function validateContent(content: unknown): ReviewValidation {
  if (typeof content !== "string") {
    return { valid: false, error: "短评内容必须是文本" };
  }
  const trimmed = content.trim();
  if (trimmed.length < 5) {
    return { valid: false, error: "短评至少 5 个字" };
  }
  if (trimmed.length > 300) {
    return { valid: false, error: "短评最多 300 个字" };
  }
  // No URLs
  if (/https?:\/\//i.test(trimmed)) {
    return { valid: false, error: "短评不能包含链接" };
  }
  // Not just emoji/symbols
  const charsOnly = trimmed.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\p{Extended_Pictographic}]/gu, "");
  const realChars = charsOnly.replace(/[^a-zA-Z\u4e00-\u9fff]/g, "").length;
  if (realChars < 2) {
    return { valid: false, error: "短评不能全是表情或符号" };
  }
  // Not too many repeated chars
  const repeatCheck = /(.)\1{8,}/.test(trimmed);
  if (repeatCheck) {
    return { valid: false, error: "短评包含过多重复字符" };
  }
  return { valid: true };
}

/**
 * Hash IP address for privacy
 */
export function hashIP(ip: string | null): string | null {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/**
 * Get daily review point cap info
 * Returns { todayPoints: number, canEarn: boolean }
 */
export async function getDailyReviewPoints(prisma: any, userId: string): Promise<{ todayPoints: number; canEarn: boolean }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const ledgers = await prisma.pointLedger.findMany({
    where: {
      userId,
      type: "tool_review",
      createdAt: { gte: today, lt: tomorrow },
    },
    select: { points: true },
  });

  const todayPoints = ledgers.reduce((sum: number, l: any) => sum + l.points, 0);
  return {
    todayPoints,
    canEarn: todayPoints < 30,
  };
}
