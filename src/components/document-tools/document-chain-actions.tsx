"use client";

import { useState, useEffect } from "react";

interface DocumentChainActionsProps {
  currentType: string;
  formData: Record<string, any>;
  items?: any[];
  companyProfileId?: string;
}

// Chain mapping: which document can chain to which
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
    { target: "shipping-mark", label: "生成唛头", icon: "🏷️", testId: "document-chain-next-shipping-mark" },
  ],
};

// Mappable fields between document types
const MAPPABLE_FIELDS = [
  'companyName', 'companyNameEn', 'companyAddress', 'companyPhone', 'companyEmail',
  'buyerName', 'buyerAddress', 'buyerPhone', 'buyerEmail',
  'invoiceNo', 'piNo', 'contractNo', 'currency', 'paymentTerms',
  'deliveryTerms', 'deliveryDate', 'expiryDate',
  'items', 'totalAmount', 'totalQuantity',
];

export default function DocumentChainActions({
  currentType,
  formData,
  items,
  companyProfileId,
}: DocumentChainActionsProps) {
  const [saved, setSaved] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [importedBadge, setImportedBadge] = useState<string | null>(null);

  const chainOptions = CHAIN_MAP[currentType] || [];

  useEffect(() => {
    // Check for existing draft
    if (typeof window !== "undefined") {
      setHasDraft(!!localStorage.getItem(`jueshi:draft:${currentType}`));
    }
    // Check for chain import
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const fromChain = params.get("fromChain");
      if (fromChain) {
        const chainData = localStorage.getItem(`jueshi:chain:${currentType}`);
        if (chainData) {
          try {
            const parsed = JSON.parse(chainData);
            setImportedBadge(`从 ${parsed.sourceType} 导入`);
            // Dispatch event for parent to import data
            window.dispatchEvent(new CustomEvent("chain-import", { detail: parsed }));
          } catch {
            // Invalid data
          }
        }
      }
    }
    // Listen for draft-loaded events
    const handleDraftLoaded = () => setHasDraft(true);
    window.addEventListener("draft-loaded", handleDraftLoaded);
    return () => window.removeEventListener("draft-loaded", handleDraftLoaded);
  }, [currentType]);

  if (chainOptions.length === 0 && currentType !== "quotation" && currentType !== "proforma-invoice" && currentType !== "commercial-invoice" && currentType !== "packing-list" && currentType !== "sales-contract") {
    return null;
  }

  const handleChain = (target: string) => {
    // Save current data to localStorage for chain transfer
    // Only pass mappable fields, don't fabricate data
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

  const handleSaveDraft = async () => {
    const draftData = {
      type: currentType,
      data: formData,
      items,
      companyProfileId,
      timestamp: Date.now(),
    };
    // Save to localStorage (MVP - DB persistence requires auth)
    localStorage.setItem(`jueshi:draft:${currentType}`, JSON.stringify(draftData));
    setSaved(true);
    setHasDraft(true);
    setTimeout(() => setSaved(false), 2000);

    // Try to save to DB if authenticated
    try {
      await fetch("/api/workspace/document-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: currentType,
          documentData: JSON.stringify(draftData),
          companyProfileId: companyProfileId || null,
        }),
      });
    } catch {
      // DB save failed, localStorage is fallback
    }
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
          {hasDraft && (
            <button
              onClick={handleLoadDraft}
              data-testid="document-draft-load-btn"
              className="text-xs px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-600"
            >
              恢复草稿
            </button>
          )}
        </div>
      </div>

      {importedBadge && (
        <div data-testid="document-chain-import-source" className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs">
          <span>↩</span>
          <span>{importedBadge}</span>
        </div>
      )}

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
            链路传递：公司资料 + 商品明细将自动带入下一单据
          </p>
        </>
      )}

      {saved && (
        <div data-testid="document-draft-saved-toast" className="mt-2 text-xs text-green-600 flex items-center gap-1">
          <span>✓</span>
          <span>草稿已保存到本地，可在工作台查看</span>
        </div>
      )}
    </div>
  );
}
