import type { UserDisplayData } from "@/components/user/UserIdentityCard";

/**
 * Level configuration map — single source of truth for level labels and icons.
 * Shared across UserIdentityCard, leaderboard, trust cards, etc.
 */
export const LEVEL_CONFIG: Record<string, { label: string; icon: string }> = {
  lv1: { label: "新手", icon: "🌱" },
  lv2: { label: "初级", icon: "🌿" },
  lv3: { label: "中级", icon: "🌳" },
  lv4: { label: "高级", icon: "⭐" },
  lv5: { label: "专家", icon: "🏆" },
  lv6: { label: "资深", icon: "💎" },
  lv7: { label: "达人", icon: "🔥" },
  lv8: { label: "导师", icon: "👑" },
  lv9: { label: "传奇", icon: "🌟" },
  lv10: { label: "支柱", icon: "🏛️" },
  // Legacy keys
  level_1: { label: "新手", icon: "🌱" },
  level_2: { label: "初级", icon: "🌿" },
  level_3: { label: "中级", icon: "🌳" },
  level_4: { label: "高级", icon: "⭐" },
  level_5: { label: "专家", icon: "🏆" },
};

export function getLevelInfo(levelKey: string | null | undefined): { label: string; icon: string } {
  return LEVEL_CONFIG[levelKey || ""] || { label: "成员", icon: "" };
}

/**
 * Map a Prisma User object (or partial) to UserDisplayData for UserIdentityCard.
 * Privacy-safe: does NOT include email unless explicitly provided.
 */
export function toUserDisplayData(user: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  levelKey?: string | null;
  growthValue?: number | null;
  honorScore?: number | null;
  points?: number | null;
  membershipTier?: string | null;
  role?: string | null;
  publicTitle?: string | null;
  progressToNext?: number;
  remainingToNext?: number;
  nextLevelKey?: string | null;
  checkinStreak?: number;
  badgeCount?: number;
}): UserDisplayData {
  const displayName = user.name || user.email?.split("@")[0] || "匿名用户";
  const levelInfo = getLevelInfo(user.levelKey);
  const isMember = !!user.membershipTier && user.membershipTier !== "free";

  return {
    displayName,
    avatarUrl: user.image || undefined,
    publicTitle: user.publicTitle || null,
    levelKey: user.levelKey || "lv1",
    levelLabel: levelInfo.label,
    levelIcon: levelInfo.icon,
    growthValue: user.growthValue || 0,
    progressToNext: user.progressToNext,
    remainingToNext: user.remainingToNext,
    nextLevelKey: user.nextLevelKey,
    points: user.points || 0,
    checkinStreak: user.checkinStreak,
    badgeCount: user.badgeCount,
    isMember,
    membershipTier: user.membershipTier || "free",
    isAdmin: user.role === "admin",
    honorScore: user.honorScore || 0,
  };
}

/**
 * Mask email for privacy-safe display.
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "匿名用户";
  const [local, domain] = email.split("@");
  if (!domain) return "匿名用户";
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}
