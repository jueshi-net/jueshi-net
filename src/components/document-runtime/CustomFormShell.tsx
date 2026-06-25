/**
 * CustomFormShell — 自定义表单外壳
 * 
 * 个性化工具的统一入口：包裹自定义工具，注入公共能力，
 * 但完全不改变工具自身的视觉布局和交互。
 * 
 * 使用方式：
 * <CustomFormShell toolKey="debit-note">
 *   <YourCustomToolUI />
 * </CustomFormShell>
 * 
 * 工具内部通过 useRuntimeContext() 获取注入的能力。
 * 
 * @module document-runtime/CustomFormShell
 */

"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useToolRuntime } from "@/lib/document-runtime/tool-runtime";
import type { RuntimeContext as RTContext } from "@/lib/document-runtime/types";

// ============================================================
// Context — 工具内部通过此 Context 获取能力
// ============================================================

const RuntimeContext = createContext<RTContext | null>(null);

/**
 * Hook: 在自定义工具内部获取注入的运行时能力
 * 
 * @example
 * const { company, draft, export: exportAdapter } = useRuntimeContext();
 * if (company) { ... }
 */
export function useRuntimeContext(): RTContext | null {
  return useContext(RuntimeContext);
}

// ============================================================
// CustomFormShell Props
// ============================================================

interface CustomFormShellProps {
  /** 工具 key — 必须在 Template Registry 中注册 */
  toolKey: string;
  /** 工具自身的 UI — Shell 不会修改它 */
  children: React.ReactNode;
  /** 
   * 是否显示能力状态栏（调试用）
   * 默认 false — 不改变工具 UI
   */
  showStatusBar?: boolean;
  /**
   * 自定义加载状态
   * 默认 null — 不显示额外加载状态
   */
  loadingFallback?: React.ReactNode;
  /**
   * 自定义错误状态
   */
  errorFallback?: (error: string) => React.ReactNode;
}

// ============================================================
// CustomFormShell 主组件
// ============================================================

export default function CustomFormShell({
  toolKey,
  children,
  showStatusBar = false,
  loadingFallback = null,
  errorFallback,
}: CustomFormShellProps) {
  const { ctx, ready, error } = useToolRuntime(toolKey);

  // 错误状态 — 只在严重错误时显示，不阻断渲染
  if (error && errorFallback) {
    return <>{errorFallback(error)}</>;
  }

  // 加载状态 — 默认不显示，因为能力初始化是异步的但不阻塞 UI
  if (!ready && loadingFallback) {
    return <>{loadingFallback}</>;
  }

  return (
    <RuntimeContext.Provider value={ctx}>
      {/*
       * Shell 不会包裹任何额外 UI — 工具的视觉完全由工具自身控制。
       * Shell 只做一件事：把 RuntimeContext 注入到 React 树中，
       * 让工具内部可以通过 useRuntimeContext() 获取能力。
       */}
      {children}

      {/* 调试状态栏 — 仅在 showStatusBar=true 时显示 */}
      {showStatusBar && ctx && (
        <div
          data-testid="runtime-status-bar"
          className="fixed bottom-0 right-0 z-[99999] bg-gray-900 text-green-400 text-xs font-mono p-2 rounded-tl-md opacity-75 pointer-events-none"
        >
          <div>Runtime: {toolKey}</div>
          <div>Capabilities: {Object.entries(ctx.registration.capabilities)
            .filter(([_, v]) => Array.isArray(v) ? v.length > 0 : v)
            .map(([k]) => k)
            .join(", ")}</div>
          <div>Renderer: {ctx.registration.rendererType}</div>
        </div>
      )}
    </RuntimeContext.Provider>
  );
}
