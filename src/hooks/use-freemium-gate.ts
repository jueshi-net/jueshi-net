/**
 * useFreemiumGate — 轻量级 Freemium 拦截 Hook
 * 
 * 基于 localStorage 的免登录试用次数限制。
 * 未登录用户免费使用 N 次，超过后弹出 Paywall Modal。
 * 登录用户直接放行。
 * 
 * ⚠️ SSR 安全：localStorage 仅在 useEffect（客户端挂载后）读取，
 * 避免 "localStorage is not defined" Hydration 错误。
 * 
 * Usage:
 *   const { canUse, remaining, showPaywall, setShowPaywall, recordUsage, handleProtectedAction } = useFreemiumGate({
 *     limit: 2,
 *     storageKey: 'invoice_export_count',
 *   });
 * 
 *   // In button onClick:
 *   handleProtectedAction(() => {
 *     // 实际导出逻辑
 *     handlePrint();
 *   });
 */

import { useState, useEffect, useCallback } from "react";

interface UseFreemiumGateOptions {
  /** 免登录免费次数上限，默认 2 */
  limit?: number;
  /** localStorage 键名，默认 'freemium_export_count' */
  storageKey?: string;
}

interface UseFreemiumGateReturn {
  /** 是否允许使用（已加载后判断） */
  canUse: boolean;
  /** 剩余免费次数 */
  remaining: number;
  /** 是否已挂载（SSR 安全标记） */
  mounted: boolean;
  /** 是否显示 Paywall */
  showPaywall: boolean;
  setShowPaywall: (v: boolean) => void;
  /** 记录一次使用 */
  recordUsage: () => void;
  /** 包装受保护的操作：自动检查配额 → 不足弹 Paywall → 足够则执行 */
  handleProtectedAction: (action: () => void) => void;
}

const DEFAULT_LIMIT = 2;
const DEFAULT_STORAGE_KEY = "freemium_export_count";

function isAuthenticated(): boolean {
  // Check for NextAuth session cookie — supports both HTTP and production HTTPS
  if (typeof document === "undefined") return false;
  return (
    document.cookie.includes("next-auth.session-token") ||
    document.cookie.includes("__Secure-next-auth.session-token")
  );
}

export function useFreemiumGate(
  options: UseFreemiumGateOptions = {}
): UseFreemiumGateReturn {
  const { limit = DEFAULT_LIMIT, storageKey = DEFAULT_STORAGE_KEY } = options;

  const [mounted, setMounted] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  // Load usage count from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(storageKey);
      setUsageCount(Number(stored) || 0);
    } catch {
      // localStorage unavailable, default to 0
      setUsageCount(0);
    }
  }, [storageKey]);

  const canUse = mounted && (isAuthenticated() || usageCount < limit);
  const remaining = mounted ? Math.max(0, limit - usageCount) : limit;

  const recordUsage = useCallback(() => {
    if (isAuthenticated()) return; // Logged in users don't consume quota
    try {
      const next = usageCount + 1;
      localStorage.setItem(storageKey, String(next));
      setUsageCount(next);
    } catch {
      // localStorage write failed, silently ignore
    }
  }, [usageCount, storageKey]);

  const handleProtectedAction = useCallback(
    (action: () => void) => {
      if (!mounted) return;

      if (isAuthenticated()) {
        // Logged in → direct pass
        action();
        return;
      }

      if (usageCount < limit) {
        // Has quota → record and execute
        recordUsage();
        action();
        return;
      }

      // Quota exhausted → show paywall
      setShowPaywall(true);
    },
    [mounted, usageCount, limit, recordUsage]
  );

  return {
    canUse,
    remaining,
    mounted,
    showPaywall,
    setShowPaywall,
    recordUsage,
    handleProtectedAction,
  };
}
