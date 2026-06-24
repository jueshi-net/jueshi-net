"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface DocumentChainActionsProps {
  currentType: string;
  formData: Record<string, any>;
  lineItems: Record<string, any>[];
  companyProfile: { id?: string; companyName?: string; companyNameEn?: string } | null;
  // Callbacks to page-level functions
  onGenerateNext?: (targetType: string) => void;
  onSaveDraft?: () => Promise<string | null>;
  onLoadDraft?: () => void;
  draftId?: string | null;
}

// Extended chain map: each document can chain to multiple targets
const CHAIN_MAP: Record<string, { target: string; label: string; icon: string; testId: string }[]> = {
  "quotation": [
    { target: "proforma-invoice", label: "生成形式发票", icon: "📄", testId: "document-chain-next-pi" },
  ],
  "proforma-invoice": [
    { target: "commercial-invoice", label: "生成商业发票", icon: "🧾", testId: "document-chain-next-ci" },
  ],
  "commercial-invoice": [
    { target: "packing-list", label: "生成装箱单", icon: "📦", testId: "document-chain-next-pl" },
    { target: "customs-declaration-authorization", label: "生成报关委托书", icon: "🛃", testId: "document-chain-next-customs" },
  ],
  "packing-list": [
    { target: "container-loading-list", label: "生成装柜明细单", icon: "🚢", testId: "document-chain-next-container" },
  ],
  "sales-contract": [
    { target: "commercial-invoice", label: "生成商业发票", icon: "🧾", testId: "document-chain-next-ci" },
  ],
};

// Map source type to display name
const TYPE_LABELS: Record<string, string> = {
  "quotation": "报价单",
  "proforma-invoice": "形式发票",
  "commercial-invoice": "商业发票",
  "packing-list": "装箱单",
  "sales-contract": "外贸销售合同",
  "container-loading-list": "装柜明细单",
  "customs-declaration-authorization": "报关委托书",
};

export default function DocumentChainActions({
  currentType,
  formData,
  lineItems,
  companyProfile,
  onGenerateNext,
  onSaveDraft,
  onLoadDraft,
  draftId,
}: DocumentChainActionsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedDraftId, setSavedDraftId] = useState<string | null>(draftId || null);

  const chainOptions = CHAIN_MAP[currentType] || [];
  const fromChain = searchParams.get("from") || searchParams.get("fromChain");
  const sourceType = fromChain || searchParams.get("source");

  // Only show for documents that have chain options or are chain targets
  const isChainTarget = !!sourceType;
  if (chainOptions.length === 0 && !isChainTarget && currentType !== "sales-contract") {
    return null;
  }

  const handleChain = (targetType: string) => {
    if (onGenerateNext) {
      // Use the page's existing handleGenerateNextDocument logic
      // but with a specific target type
      onGenerateNext(targetType);
    } else {
      // Fallback: direct navigation
      router.push(`/tools/documents/${targetType}?from=${currentType}`);
    }
  };

  const handleSaveDraft = async () => {
    setSaveError(null);
    try {
      if (onSaveDraft) {
        const id = await onSaveDraft();
        if (id) {
          setSavedDraftId(id);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e: any) {
      setSaveError(e.message || "保存失败");
    }
  };

  const sourceLabel = sourceType ? (TYPE_LABELS[sourceType] || sourceType) : null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 mt-4" data-testid="document-chain-actions">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">📋 单据链路</h3>
        <div className="flex gap-2">
          <button
            onClick={handleSaveDraft}
            data-testid="document-save-draft-button"
            className="text-xs px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-600"
          >
            {saved ? "✓ 已保存" : "保存草稿"}
          </button>
          {onLoadDraft && (
            <button
              onClick={onLoadDraft}
              data-testid="document-draft-load-btn"
              className="text-xs px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-600"
            >
              恢复草稿
            </button>
          )}
        </div>
      </div>

      {/* Source badge - shows when this document was generated from another */}
      {sourceLabel && (
        <div className="mb-3 flex items-center gap-2">
          <span
            data-testid="document-chain-source-badge"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs"
          >
            <span>↩</span>
            <span data-testid="document-chain-generated-from">由 {sourceLabel} 生成</span>
          </span>
          <Link
            href={`/tools/documents/${sourceType}`}
            data-testid="document-chain-back-to-source"
            className="text-xs text-blue-600 hover:text-blue-700 underline"
          >
            ← 返回{sourceLabel}
          </Link>
        </div>
      )}

      {/* Company info display */}
      {companyProfile?.companyName && (
        <div data-testid="document-chain-imported-company" className="mb-2 text-xs text-gray-500">
          当前公司: {companyProfile.companyName}
          {companyProfile.companyNameEn ? ` (${companyProfile.companyNameEn})` : ""}
        </div>
      )}

      {/* Line items count */}
      {lineItems.length > 0 && (
        <div data-testid="document-chain-imported-items" className="mb-2 text-xs text-gray-500">
          商品明细: {lineItems.length} 行
        </div>
      )}

      {/* Chain buttons */}
      {chainOptions.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            {chainOptions.map((opt) => (
              <button
                key={opt.target}
                onClick={() => handleChain(opt.target)}
                data-testid={opt.testId}
                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-blue-700 transition-colors"
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
                <span className="text-gray-400">→</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            链路传递：公司资料 + 商品明细 + 客户信息 + 币种将自动带入下一单据
          </p>
        </>
      )}

      {/* Save status */}
      {saved && (
        <div data-testid="document-draft-save-status" className="mt-2 text-xs text-green-600 flex items-center gap-1">
          <span>✓</span>
          <span>草稿已保存{savedDraftId ? ` (ID: ${savedDraftId.substring(0, 8)}...)` : ""}</span>
        </div>
      )}

      {saveError && (
        <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
          <span>✗</span>
          <span>保存失败: {saveError}</span>
        </div>
      )}

      {savedDraftId && (
        <div data-testid="document-draft-id" className="mt-1 text-xs text-gray-400">
          草稿 ID: {savedDraftId}
        </div>
      )}
    </div>
  );
}
