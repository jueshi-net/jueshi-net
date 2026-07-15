/**
 * Debit Note Client Component
 * 
 * Main UI for the Debit Note tool, powered by useDocumentToolEngine.
 */

"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Printer, FileText, Loader2, Building2, Eye, Code, Plus, Trash2 } from "lucide-react";
import CompanyProfilePicker, { CompanyProfile } from "@/components/document-tools/company-profile-picker";
import ToolHistoryPanel from "@/components/document-tools/tool-history-panel";
import { useDocumentToolEngine } from "@/hooks/use-document-tool-engine";
import { DebitNoteData, DebitItem, defaultDebitNoteData, serialize, deserialize, mapCompanyProfile } from "./debit-note-types";
import DebitNotePreview from "./debit-note-preview";
import DocumentToolLayout from "@/components/document-tools/document-tool-layout";
import DocumentToolStatusAlerts from "@/components/document-tools/document-tool-status-alerts";

export default function DebitNoteClient({ draftId }: { draftId: string | null }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);

  const engine = useDocumentToolEngine<DebitNoteData>({
    toolKey: 'debit-note',
    defaultData: defaultDebitNoteData,
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
      .amount { text-align: right; }
      .total { text-align: right; font-size: 18px; font-weight: bold; }
    `;
    openPrintWindow("Debit Note", contentHtml, styles);
  }, [openPrintWindow]);

  // Item manipulation helpers
  const addItem = () => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, { id: `${Date.now()}`, description: '', amount: 0 }]
    }));
  };

  const removeItem = (id: string) => {
    if (data.items.length > 1) {
      setData(prev => ({
        ...prev,
        items: prev.items.filter(i => i.id !== id)
      }));
    }
  };

  const updateItem = (id: string, field: keyof DebitItem, value: string | number) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, [field]: value } : i)
    }));
  };

  // Simple field updater
  const updateField = (field: keyof DebitNoteData, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Recalculate subtotal for UI display
  const subtotal = data.items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="overflow-x-hidden">
      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {currentDocId && (
          <ToolHistoryPanel documentId={currentDocId} toolKey="debit-note" onRestore={handleRestore} />
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
                <input value={data.companyName} onChange={e => updateField('companyName', e.target.value)} placeholder="公司名称" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.date} onChange={e => updateField('date', e.target.value)} type="date" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.companyPhone} onChange={e => updateField('companyPhone', e.target.value)} placeholder="电话" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.companyEmail} onChange={e => updateField('companyEmail', e.target.value)} placeholder="邮箱" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.companyAddress} onChange={e => updateField('companyAddress', e.target.value)} placeholder="地址" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px] sm:col-span-2" />
              </div>
            </div>

            {/* Debit Note Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">Debit Note 信息</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input value={data.noteNo} onChange={e => updateField('noteNo', e.target.value)} placeholder="单号" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={data.customerName} onChange={e => updateField('customerName', e.target.value)} placeholder="客户名称" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px] sm:col-span-2" />
                <select value={data.currency} onChange={e => updateField('currency', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px] sm:col-span-3">
                  <option value="USD">USD</option>
                  <option value="CNY">CNY</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            {/* Fee Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-700">费用项目</h2>
                <button onClick={addItem} className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 min-h-[44px]">
                  <Plus className="w-4 h-4" /> 添加
                </button>
              </div>
              <div className="space-y-2 overflow-x-auto">
                {data.items.map(item => (
                  <div key={item.id} className="flex gap-2 items-start">
                    <input value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} placeholder="费用描述" className="flex-1 px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                    <input type="number" step="0.01" value={item.amount} onChange={e => updateItem(item.id, "amount", parseFloat(e.target.value) || 0)} className="w-24 px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                    <button onClick={() => removeItem(item.id)} className="p-1 text-red-400 hover:text-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right text-sm font-bold text-teal-700">小计: {data.currency} {subtotal.toFixed(2)}</div>
            </div>

            {/* Payment Info & Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">付款信息 & 备注</h2>
              <textarea value={data.paymentInfo} onChange={e => updateField('paymentInfo', e.target.value)} placeholder="银行账户信息" rows={3} className="w-full px-3 py-2 border rounded-lg text-sm mb-3" />
              <textarea value={data.notes} onChange={e => updateField('notes', e.target.value)} placeholder="备注" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
        }
        preview={
          <DebitNotePreview data={data} innerRef={previewRef} />
        }
      />
    </div>
  );
}
