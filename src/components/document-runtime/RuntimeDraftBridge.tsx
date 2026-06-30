/**
 * RuntimeDraftBridge — 草稿能力桥接组件
 * 
 * 在自定义工具中渲染草稿操作按钮（保存/恢复/历史），
 * 但不强制按钮位置 — 工具决定放在哪里。
 * 
 * 使用方式（在自定义工具内部）：
 * const { draft } = useRuntimeContext();
 * if (draft) {
 *   return <RuntimeDraftBridge adapter={draft} />;
 * }
 * 
 * @module document-runtime/RuntimeDraftBridge
 */

"use client";

import React, { useState } from "react";
import { Save, RotateCcw, Loader2, Check } from "lucide-react";
import type { DraftAdapter } from "@/lib/document-runtime/types";

interface RuntimeDraftBridgeProps {
  adapter: DraftAdapter;
  /** 自定义渲染 */
  renderCustom?: (adapter: DraftAdapter) => React.ReactNode;
  /** data-testid 前缀 */
  testIdPrefix?: string;
}

export default function RuntimeDraftBridge({
  adapter,
  renderCustom,
  testIdPrefix = "runtime-draft",
}: RuntimeDraftBridgeProps) {
  const [showRestore, setShowRestore] = useState(false);

  if (renderCustom) {
    return <>{renderCustom(adapter)}</>;
  }

  const { saving, saved, saveMsg, loadingDraft, handleSave, handleRestore } = adapter;

  return (
    <div data-testid={testIdPrefix} className="flex items-center gap-2">
      {/* 保存按钮 */}
      <button
        data-testid={`${testIdPrefix}-save`}
        onClick={handleSave}
        disabled={saving || loadingDraft}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saved ? (
          <Check className="w-4 h-4 text-green-300" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saving ? "保存中..." : saved ? "已保存" : "保存草稿"}
      </button>

      {/* 恢复按钮 */}
      <button
        data-testid={`${testIdPrefix}-restore`}
        onClick={() => setShowRestore(!showRestore)}
        disabled={loadingDraft}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        恢复
      </button>

      {/* 状态消息 */}
      {saveMsg && (
        <span className="text-xs text-gray-400" data-testid={`${testIdPrefix}-msg`}>
          {saveMsg}
        </span>
      )}
    </div>
  );
}
