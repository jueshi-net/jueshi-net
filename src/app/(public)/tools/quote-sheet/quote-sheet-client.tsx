/**
 * Quote Sheet Client Component
 *
 * Main UI for the Quote Sheet tool, powered by useDocumentToolEngine.
 * Supports: form input, line items, company profile, save/draft, restore, print, PNG/Word export.
 */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Printer, FileText, Loader2, Building2, Eye, Code, Plus, Trash2, Download } from "lucide-react";
import CompanyProfilePicker, { CompanyProfile } from "@/components/document-tools/company-profile-picker";
import ToolHistoryPanel from "@/components/document-tools/tool-history-panel";
import { useDocumentToolEngine } from "@/hooks/use-document-tool-engine";
import { QuoteSheetData, QuoteSheetLine, defaultQuoteSheetData, serialize, deserialize, mapCompanyProfile, calculateTotals } from "./quote-sheet-types";
import QuoteSheetPreview from "./quote-sheet-preview";
import DocumentToolLayout from "@/components/document-tools/document-tool-layout";
import DocumentToolStatusAlerts from "@/components/document-tools/document-tool-status-alerts";
import { trackEvent } from "@/lib/tracking";

export default function QuoteSheetClient({ draftId }: { draftId: string | null }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);
  const [exporting, setExporting] = useState(false);
  const hasTrackedView = useRef(false);

  const engine = useDocumentToolEngine<QuoteSheetData>({
    toolKey: "quote-sheet",
    defaultData: defaultQuoteSheetData,
    serialize,
    deserialize,
    onAfterSave: (_docId: string) => {},
    onAfterRestore: () => {
      setSelectedProfile(null);
    },
  });

  const {
    data, setData,
    loadingDraft, error, setError,
    saving, saved, saveMsg, currentDocId,
    handleSave, handleRestore, handleReset, openPrintWindow,
  } = engine;

  // Track Tool_View on mount (once)
  useEffect(() => {
    if (!hasTrackedView.current) {
      hasTrackedView.current = true;
      try {
        navigator.sendBeacon(
          "/api/events",
          JSON.stringify({
            event: "Tool_View",
            toolSlug: "quote-sheet",
            source: "document_tool_engine",
            ts: Date.now(),
          })
        );
      } catch {
        // ignore
      }
    }
  }, []);

  // Handle Company Profile Selection
  const handleProfileSelect = useCallback((profile: CompanyProfile) => {
    setSelectedProfile(profile);
    const mappedData = mapCompanyProfile(profile, data);
    setData(mappedData);
  }, [data, setData]);

  // Handle Print
  const handlePrint = useCallback(() => {
    const contentHtml = previewRef.current?.innerHTML || "";
    const styles = `
      body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background: #f5f5f5; }
      h1 { text-align: center; color: #0d9488; }
      .total { text-align: right; font-size: 18px; font-weight: bold; }
    `;
    openPrintWindow("供应链报价单", contentHtml, styles);
  }, [openPrintWindow]);

  // Handle PNG Export — dynamic import html2canvas
  const handleExportPNG = useCallback(async () => {
    setExporting(true);
    try {
      const el = previewRef.current;
      if (!el) {
        setError("预览内容不存在，无法导出 PNG");
        return;
      }

      // Dynamically import html2canvas
      let html2canvas = (window as any).html2canvas;
      if (!html2canvas) {
        try {
          const mod = await import("html2canvas");
          html2canvas = mod.default;
          (window as any).html2canvas = html2canvas;
        } catch {
          setError("html2canvas 加载失败，请刷新页面后重试");
          return;
        }
      }

      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
      const link = document.createElement("a");
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      link.download = `quote-sheet-${ts}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Track Document_Export event
      try {
        navigator.sendBeacon(
          "/api/events",
          JSON.stringify({
            event: "Document_Export",
            toolSlug: "quote-sheet",
            source: "document_tool_engine",
            format: "png",
            documentId: currentDocId || "",
            ts: Date.now(),
          })
        );
      } catch { /* ignore tracking errors */ }
    } catch (e) {
      console.error("[PNG Export] html2canvas failed, falling back to print:", e);
      // Fallback: open print window so user can Save as PNG
      const contentHtml = previewRef.current?.innerHTML || "";
      const styles = `
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        h1 { text-align: center; color: #0d9488; }
        .total { text-align: right; font-size: 18px; font-weight: bold; }
      `;
      openPrintWindow("供应链报价单", contentHtml, styles);
    }
    setExporting(false);
  }, [currentDocId, setError, openPrintWindow]);

  // Handle Word Export (Blob .doc approach)
  const handleExportWord = useCallback(() => {
    try {
      const el = previewRef.current;
      if (!el) {
        setError("预览内容不存在，无法导出 Word");
        return;
      }

      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"><title>报价单</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          h1 { text-align: center; color: #0d9488; }
        </style></head>
        <body>${el.innerHTML}</body></html>
      `;

      const blob = new Blob(["\ufeff", html], { type: "application/msword" });
      const link = document.createElement("a");
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      link.download = `quote-sheet-${ts}.doc`;
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      // Track Document_Export event
      try {
        navigator.sendBeacon(
          "/api/events",
          JSON.stringify({
            event: "Document_Export",
            toolSlug: "quote-sheet",
            source: "document_tool_engine",
            format: "word",
            documentId: currentDocId || "",
            ts: Date.now(),
          })
        );
      } catch { /* ignore tracking errors */ }
    } catch (e) {
      console.error("[Word Export] Failed:", e);
      setError("Word 导出失败，请重试");
    }
  }, [currentDocId, setError]);

  // Line item manipulation
  const addLine = useCallback(() => {
    setData((prev) => ({
      ...prev,
      lines: [...prev.lines, { id: `${Date.now()}`, description: "", weight: "", qty: 1, pricePerUnit: 0, channel: "", notes: "" }],
    }));
  }, [setData]);

  const removeLine = useCallback((id: string) => {
    if (data.lines.length > 1) {
      setData((prev) => ({
        ...prev,
        lines: prev.lines.filter((l) => l.id !== id),
      }));
    }
  }, [data.lines.length, setData]);

  const updateLine = useCallback((id: string, field: keyof QuoteSheetLine, value: string | number) => {
    setData((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }));
  }, [setData]);

  const total = calculateTotals(data.lines);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/tools/document-tools" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 min-h-[44px] shrink-0">
              <ArrowLeft className="w-4 h-4" /> 返回
            </Link>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2 min-w-0">
              <FileText className="w-5 h-5 text-teal-600 shrink-0" />
              <span className="truncate">供应链报价单</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {currentDocId && (
              <ToolHistoryPanel documentId={currentDocId} toolKey="quote_sheet" onRestore={handleRestore} />
            )}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]"
            >
              {showPreview ? <><Code className="w-4 h-4" /> 编辑</> : <><Eye className="w-4 h-4" /> 预览</>}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 min-h-[44px]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "保存中..." : saved ? "已保存" : "保存草稿"}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]"
            >
              🗑️ 清空
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 min-h-[44px]"
            >
              <Printer className="w-4 h-4" /> 打印
            </button>
            <button
              onClick={handleExportPNG}
              disabled={exporting}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 min-h-[44px]"
            >
              <Download className="w-4 h-4" /> PNG
            </button>
            <button
              onClick={handleExportWord}
              disabled={exporting}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-h-[44px]"
            >
              <Download className="w-4 h-4" /> Word
            </button>
          </div>
        </div>
      </header>

      {/* Alerts */}
      <DocumentToolStatusAlerts
        loadingDraft={loadingDraft}
        draftError={null}
        error={error}
        saved={saved}
        saveMsg={saveMsg}
      />

      {/* Main Layout */}
      <DocumentToolLayout
        showPreview={showPreview}
        form={
          <div className="space-y-4 min-w-0">
            {/* Company Profile Picker */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" /> 公司资料
              </h2>
              <CompanyProfilePicker onSelect={handleProfileSelect} selectedId={selectedProfile?.id} />
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">公司信息</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={data.companyName} onChange={(e) => setData((prev) => ({ ...prev, companyName: e.target.value }))} placeholder="公司名称" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.companyContact} onChange={(e) => setData((prev) => ({ ...prev, companyContact: e.target.value }))} placeholder="联系人" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.companyEmail} onChange={(e) => setData((prev) => ({ ...prev, companyEmail: e.target.value }))} placeholder="邮箱" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px] sm:col-span-2" />
              </div>
            </div>

            {/* Client + Date */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">客户与日期</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={data.clientName} onChange={(e) => setData((prev) => ({ ...prev, clientName: e.target.value }))} placeholder="客户名称" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.clientContact} onChange={(e) => setData((prev) => ({ ...prev, clientContact: e.target.value }))} placeholder="客户联系人" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.quoteDate} onChange={(e) => setData((prev) => ({ ...prev, quoteDate: e.target.value }))} type="date" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.validUntil} onChange={(e) => setData((prev) => ({ ...prev, validUntil: e.target.value }))} type="date" placeholder="有效期至" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-700">报价明细</h2>
                <button onClick={addLine} className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 min-h-[44px]">
                  <Plus className="w-4 h-4" /> 添加
                </button>
              </div>
              <div className="space-y-2 overflow-x-auto">
                {data.lines.map((l) => (
                  <div key={l.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50 space-y-2">
                    <input value={l.description} onChange={(e) => updateLine(l.id, "description", e.target.value)} placeholder="商品/服务描述" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input value={l.weight} onChange={(e) => updateLine(l.id, "weight", e.target.value)} placeholder="重量段" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                      <input type="number" value={l.qty} onChange={(e) => updateLine(l.id, "qty", parseInt(e.target.value) || 0)} placeholder="数量" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                      <input type="number" step="0.01" value={l.pricePerUnit} onChange={(e) => updateLine(l.id, "pricePerUnit", parseFloat(e.target.value) || 0)} placeholder="单价" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                      <div className="flex gap-1 items-center">
                        <span className="text-sm font-medium text-teal-700">{(l.qty * l.pricePerUnit).toFixed(2)}</span>
                        <button onClick={() => removeLine(l.id)} className="p-1 text-red-400 hover:text-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input value={l.channel} onChange={(e) => updateLine(l.id, "channel", e.target.value)} placeholder="渠道" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                      <input value={l.notes} onChange={(e) => updateLine(l.id, "notes", e.target.value)} placeholder="备注" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right text-sm font-bold text-teal-700">总计: {total.toFixed(2)}</div>
            </div>
          </div>
        }
        preview={
          <QuoteSheetPreview data={data} innerRef={previewRef} />
        }
      />
    </div>
  );
}
