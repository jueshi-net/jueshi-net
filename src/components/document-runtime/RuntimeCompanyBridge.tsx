/**
 * RuntimeCompanyBridge — 公司资料能力桥接组件
 * 
 * 在自定义工具中渲染公司资料选择器，
 * 但不强制 UI 布局 — 工具决定在哪里渲染、怎么渲染。
 * 
 * 使用方式（在自定义工具内部）：
 * const { company } = useRuntimeContext();
 * if (company) {
 *   return <RuntimeCompanyBridge adapter={company} onSelect={handleSelect} />;
 * }
 * 
 * @module document-runtime/RuntimeCompanyBridge
 */

"use client";

import React from "react";
import type { CompanyAdapter, CompanyProfile } from "@/lib/document-runtime/types";

interface RuntimeCompanyBridgeProps {
  adapter: CompanyAdapter;
  /** 选择公司后的回调 */
  onSelect?: (profile: CompanyProfile) => void;
  /** 自定义渲染 — 如果提供了，完全替代默认 UI */
  renderCustom?: (adapter: CompanyAdapter) => React.ReactNode;
  /** 是否使用紧凑模式 */
  compact?: boolean;
  /** data-testid 前缀 */
  testIdPrefix?: string;
}

export default function RuntimeCompanyBridge({
  adapter,
  onSelect,
  renderCustom,
  compact = false,
  testIdPrefix = "runtime-company",
}: RuntimeCompanyBridgeProps) {
  // 自定义渲染 — 工具完全控制 UI
  if (renderCustom) {
    return <>{renderCustom(adapter)}</>;
  }

  const { profiles, selectedProfile, loading, onSelect: adapterOnSelect } = adapter;

  const handleSelect = (profile: CompanyProfile) => {
    adapterOnSelect(profile);
    onSelect?.(profile);
  };

  if (loading) {
    return (
      <div data-testid={`${testIdPrefix}-loading`} className="text-sm text-gray-400">
        加载公司资料...
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div data-testid={`${testIdPrefix}-empty`} className="text-sm text-gray-400">
        暂无公司资料
      </div>
    );
  }

  // 默认紧凑渲染 — 一个下拉选择器
  return (
    <div data-testid={testIdPrefix} className={compact ? "" : "space-y-2"}>
      {!compact && (
        <label className="text-sm font-medium text-gray-700">公司资料</label>
      )}
      <div className="flex flex-wrap gap-2">
        {profiles.map((p) => (
          <button
            key={p.id}
            data-testid={`${testIdPrefix}-option-${p.id}`}
            onClick={() => handleSelect(p)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              selectedProfile?.id === p.id
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            {p.name}
            {p.isDefault && <span className="ml-1 text-xs text-gray-400">(默认)</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
