/**
 * Handover Note Client Component
 * 
 * Main UI for the Handover Note tool, powered by useDocumentToolEngine.
 */

"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Printer, FileText, Loader2, Building2, Eye, Code } from "lucide-react";
import CompanyProfilePicker, { CompanyProfile } from "@/components/document-tools/company-profile-picker";
import ToolHistoryPanel from "@/components/document-tools/tool-history-panel";
import { useDocumentToolEngine } from "@/hooks/use-document-tool-engine";
import { HandoverNoteData, defaultHandoverNoteData, serialize, deserialize, mapCompanyProfile } from "./handover-note-types";
import HandoverNotePreview from "./handover-note-preview";
import DocumentToolLayout from "@/components/document-tools/document-tool-layout";
import DocumentToolStatusAlerts from "@/components/document-tools/document-tool-status-alerts";

export default function HandoverNoteClient({ draftId }: { draftId: string | null }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);

  const engine = useDocumentToolEngine<HandoverNoteData>({
    toolKey: 'handover-note',
    defaultData: defaultHandoverNoteData,
    serialize,
    deserialize,
    onAfterSave: () => {},
    onAfterRestore: () => {
      setSelectedProfile(null);
    },
  });

  const {
    data, setData,
    loadingDraft, error,
    saving, saved, saveMsg, currentDocId,
    handleSave, handleRestore, handleReset, openPrintWindow,
  } = engine;

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
      .sig { border-top: 1px solid #ccc; padding-top: 40px; margin-top: 40px; display: flex; justify-content: space-between; }
    `;
    openPrintWindow("货物交接单", contentHtml, styles);
  }, [openPrintWindow]);

  // Helper to update specific fields
  const updateField = (field: keyof HandoverNoteData, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

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
              <span className="truncate">交接单</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {currentDocId && (
              <ToolHistoryPanel documentId={currentDocId} toolKey="handover-note" onRestore={handleRestore} />
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
              {saving ? '保存中...' : saved ? '已保存' : '保存草稿'}
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
          </div>
        </div>
      </header>

      {/* Alerts */}
      <DocumentToolStatusAlerts
        loadingDraft={loadingDraft}
        draftError={null} // Draft error is merged into general error in engine
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
                <input value={data.companyName} onChange={e => updateField('companyName', e.target.value)} placeholder="公司名称" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.date} onChange={e => updateField('date', e.target.value)} type="date" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.companyPhone} onChange={e => updateField('companyPhone', e.target.value)} placeholder="电话" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.companyEmail} onChange={e => updateField('companyEmail', e.target.value)} placeholder="邮箱" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.companyAddress} onChange={e => updateField('companyAddress', e.target.value)} placeholder="地址" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px] sm:col-span-2" />
              </div>
            </div>

            {/* Handover Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">交接信息</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={data.handoverNo} onChange={e => updateField('handoverNo', e.target.value)} placeholder="交接单号" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.contact} onChange={e => updateField('contact', e.target.value)} placeholder="联系方式" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.fromParty} onChange={e => updateField('fromParty', e.target.value)} placeholder="交接方" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.toParty} onChange={e => updateField('toParty', e.target.value)} placeholder="接收方" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input type="number" value={data.packages} onChange={e => updateField('packages', parseInt(e.target.value) || 0)} placeholder="件数" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <textarea value={data.cargoDescription} onChange={e => updateField('cargoDescription', e.target.value)} placeholder="货物描述" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm sm:col-span-2" />
                <textarea value={data.notes} onChange={e => updateField('notes', e.target.value)} placeholder="备注" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm sm:col-span-2" />
              </div>
            </div>
          </div>
        }
        preview={
          <HandoverNotePreview data={data} innerRef={previewRef} />
        }
      />
    </div>
  );
}
