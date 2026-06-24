"use client";

import { useState, useEffect } from "react";

interface DocumentChainActionsProps {
  currentType: string;
  formData: Record<string, any>;
  items?: any[];
  companyProfileId?: string;
}

// Chain mapping: which document can chain to which
const CHAIN_MAP: Record<string, { target: string; label: string; icon: string }[]> = {
  "quotation": [
    { target: "proforma-invoice", label: "生成形式发票", icon: "📄" },
  ],
  "proforma-invoice": [
    { target: "commercial-invoice", label: "生成商业发票", icon: "🧾" },
  ],
  "commercial-invoice": [
    { target: "packing-list", label: "生成装箱单", icon: "📦" },
    { target: "customs-declaration-authorization", label: "生成报关委托书", icon: "🛃" },
  ],
  "packing-list": [
    { target: "container-loading-list", label: "生成装柜清单", icon: "🚢" },
    { target: "shipping-mark", label: "生成唛头", icon: "🏷️" },
  ],
};

export default function DocumentChainActions({
  currentType,
  formData,
  items,
  companyProfileId,
}: DocumentChainActionsProps) {
  const [saved, setSaved] = useState(false);

  const chainOptions = CHAIN_MAP[currentType] || [];

  if (chainOptions.length === 0) {
    return null;
  }

  const handleChain = (target: string) => {
    // Save current data to localStorage for chain transfer
    const chainData = {
      sourceType: currentType,
      sourceData: formData,
      sourceItems: items,
      companyProfileId,
      timestamp: Date.now(),
    };
    localStorage.setItem(`jueshi:chain:${target}`, JSON.stringify(chainData));
    
    // Navigate to target tool
    window.location.href = `/tools/documents/${target}?fromChain=${currentType}`;
  };

  const handleSaveDraft = () => {
    const draftData = {
      type: currentType,
      data: formData,
      items,
      companyProfileId,
      timestamp: Date.now(),
    };
    localStorage.setItem(`jueshi:draft:${currentType}`, JSON.stringify(draftData));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLoadDraft = () => {
    const saved = localStorage.getItem(`jueshi:draft:${currentType}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Emit event for parent to pick up
        window.dispatchEvent(new CustomEvent("draft-loaded", { detail: data }));
      } catch {
        // Invalid data
      }
    }
  };

  const hasDraft = typeof window !== "undefined" && localStorage.getItem(`jueshi:draft:${currentType}`);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 mt-4" data-testid="doc-chain-actions">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">📋 单据链路</h3>
        <div className="flex gap-2">
          <button
            onClick={handleSaveDraft}
            data-testid="doc-save-draft-btn"
            className="text-xs px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-600"
          >
            {saved ? "✓ 已保存" : "保存草稿"}
          </button>
          {hasDraft && (
            <button
              onClick={handleLoadDraft}
              data-testid="doc-load-draft-btn"
              className="text-xs px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-600"
            >
              恢复草稿
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {chainOptions.map((opt) => (
          <button
            key={opt.target}
            onClick={() => handleChain(opt.target)}
            data-testid={`doc-chain-to-${opt.target}`}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-blue-700 transition-colors"
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
            <span className="text-gray-400">→</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        链路传递：公司资料 + 商品明细将自动带入下一单据
      </p>
    </div>
  );
}
