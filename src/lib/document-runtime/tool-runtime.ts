/**
 * Tool Runtime — 运行时协调器
 * 
 * 主 Hook：useToolRuntime(toolKey)
 * 工具通过此 Hook 声明需要哪些能力，Runtime 负责注入对应的 Adapter
 * 
 * MVP 实现：从 Template Registry 读取工具注册信息，
 * 返回 RuntimeContext 供 CustomFormShell 使用
 * 
 * @module document-runtime/tool-runtime
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getTool,
  hasCapability,
} from "./template-registry";
import type {
  ToolRegistration,
  RuntimeContext,
  UseRuntimeResult,
  CompanyProfile,
  CompanyAdapter,
  EntitlementAdapter,
  AuditAdapter,
} from "./types";

// ============================================================
// 主 Hook: useToolRuntime
// ============================================================

/**
 * useToolRuntime — 工具运行时入口
 * 
 * 所有 Adapter hooks 在顶层调用（遵守 Rules of Hooks），
 * 但只在工具声明了对应 capability 时才注入到 RuntimeContext。
 * 
 * @param toolKey 工具唯一标识（必须在 Template Registry 中注册）
 * @returns RuntimeContext + ready 状态
 */
export function useToolRuntime(
  toolKey: string,
  options?: {
    onCompanySelect?: (profile: CompanyProfile) => void;
  }
): UseRuntimeResult {
  const registration = getTool(toolKey);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Always call all adapter hooks (Rules of Hooks)
  const companyAdapter = useCompanyAdapterImpl(toolKey, options?.onCompanySelect);
  const entitlementAdapter = useEntitlementAdapterImpl(toolKey);
  const auditAdapter = useAuditAdapterImpl(toolKey);

  useEffect(() => {
    if (!registration) {
      setError(`Tool "${toolKey}" not found in Template Registry`);
    } else if (!registration.isOnline) {
      setError(`Tool "${toolKey}" is offline`);
    } else {
      setError(null);
    }
    setReady(true);
  }, [toolKey, registration]);

  // Build context — only include adapters for declared capabilities
  const ctx: RuntimeContext | null = registration
    ? {
        toolKey,
        registration,
        audit: auditAdapter,
        entitlement: hasCapability(toolKey, "entitlement") ? entitlementAdapter : undefined,
        company: hasCapability(toolKey, "company") ? companyAdapter : undefined,
      }
    : null;

  return { ctx, ready, error };
}

// ============================================================
// Adapter Hooks — 内部实现（顶层调用，遵守 Rules of Hooks）
// ============================================================

/**
 * 公司资料适配器 Hook
 */
function useCompanyAdapterImpl(
  _toolKey: string,
  _onSelect?: (profile: CompanyProfile) => void
): CompanyAdapter {
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/workspace/company-profiles");
      if (!res.ok) return;
      const data = await res.json();
      setProfiles(data.profiles || data.data || []);
    } catch {
      // 静默失败 — 不影响工具核心功能
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSelect = useCallback((profile: CompanyProfile) => {
    setSelectedProfile(profile);
    _onSelect?.(profile);
  }, [_onSelect]);

  return { profiles, selectedProfile, loading, onSelect: handleSelect, refresh };
}

/**
 * 会员权益适配器 Hook
 */
function useEntitlementAdapterImpl(toolKey: string): EntitlementAdapter {
  const [tier, setTier] = useState<"free" | "pro" | "enterprise">("free");
  const [canAccess, setCanAccess] = useState(true);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const userTier = data?.user?.membershipTier || "free";
        setTier(userTier);
        setCanAccess(true);
        setReason(null);
      } catch {
        // 静默失败
      }
    })();
    return () => { mounted = false; };
  }, [toolKey]);

  return { tier, canAccess, reason, upgradeUrl: "/pricing" };
}

/**
 * 审计适配器 Hook
 */
function useAuditAdapterImpl(toolKey: string): AuditAdapter {
  const logAction = useCallback(
    (action: string, meta?: Record<string, unknown>) => {
      if (process.env.NODE_ENV === "development") {
        console.debug(`[audit:${toolKey}] ${action}`, meta ?? "");
      }
    },
    [toolKey]
  );

  const logExport = useCallback(
    (format: string, success: boolean) => {
      logAction(`export:${format}`, { success });
    },
    [logAction]
  );

  const logError = useCallback(
    (error: string, context?: Record<string, unknown>) => {
      console.error(`[audit:${toolKey}] error: ${error}`, context ?? "");
    },
    [toolKey]
  );

  return { logAction, logExport, logError };
}

// ============================================================
// 辅助 Hooks — 工具按需使用
// ============================================================

/**
 * useCompanyProfiles — 获取公司资料列表
 * 简化版，供不需要完整 Runtime 的工具使用
 */
export function useCompanyProfiles(enabled: boolean) {
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/workspace/company-profiles");
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setProfiles(data.profiles || data.data || []);
      } catch {
        // 静默
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [enabled]);

  return { profiles, loading };
}

/**
 * useToolRegistration — 获取工具注册信息
 */
export function useToolRegistration(toolKey: string): ToolRegistration | null {
  return getTool(toolKey) ?? null;
}
