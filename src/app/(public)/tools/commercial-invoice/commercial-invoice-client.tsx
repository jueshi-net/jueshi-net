"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Printer, Building2, Plus, Trash2, FileText, Loader2, Eye, Code } from "lucide-react";
import CompanyProfilePicker, { CompanyProfile } from "@/components/document-tools/company-profile-picker";
import ToolHistoryPanel from "@/components/document-tools/tool-history-panel";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: string;
}

export default function CommercialInvoiceClient() {
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ id: "1", description: "", quantity: 1, unitPrice: 0, currency: "USD" }]);
  const [freight, setFreight] = useState(0);
  const [insurance, setInsurance] = useState(0);
  const [terms, setTerms] = useState("T/T");
  const [notes, setNotes] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load from URL params or localStorage
  useEffect(() => {
    const saved = localStorage.getItem("invoice-draft");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.companyName) setCompanyName(d.companyName);
        if (d.companyAddress) setCompanyAddress(d.companyAddress);
        if (d.clientName) setClientName(d.clientName);
        if (d.clientAddress) setClientAddress(d.clientAddress);
        if (d.invoiceNo) setInvoiceNo(d.invoiceNo);
        if (d.lineItems) setLineItems(d.lineItems);
        if (d.freight) setFreight(d.freight);
        if (d.insurance) setInsurance(d.insurance);
        if (d.terms) setTerms(d.terms);
        if (d.notes) setNotes(d.notes);
      } catch { /* ignore */ }
    }
  }, []);

  // Auto-fill company info from selected profile
  const handleProfileSelect = useCallback((profile: CompanyProfile) => {
    setSelectedProfile(profile);
    setCompanyName(profile.companyName);
    setCompanyAddress(profile.address || "");
  }, []);

  const addLine = () => {
    setLineItems([...lineItems, { id: `${Date.now()}`, description: "", quantity: 1, unitPrice: 0, currency: "USD" }]);
  };

  const removeLine = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((l) => l.id !== id));
  };

  const updateLine = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const subtotal = lineItems.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const total = subtotal + freight + insurance;

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const data = { companyName, companyAddress, clientName, clientAddress, invoiceNo, invoiceDate, lineItems, freight, insurance, terms, notes };
      const method = currentDocId ? "PUT" : "POST";
      const url = currentDocId ? `/api/me/tool-documents/${currentDocId}` : "/api/me/tool-documents";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolKey: "commercial_invoice",
          title: invoiceNo || `商业发票 ${invoiceDate}`,
          dataJson: JSON.stringify(data),
          ...(selectedProfile?.id && { companyProfileId: selectedProfile.id }),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setSaveMsg(currentDocId ? "已更新草稿" : "已保存草稿");
        setTimeout(() => setSaved(false), 3000);
        const d = await res.json();
        if (d.data?.id && !currentDocId) setCurrentDocId(d.data.id);
      } else {
        const d = await res.json().catch(() => ({}));
        if (res.status === 401) { window.location.href = "/login"; return; }
        alert(d.error || "保存失败");
      }
    } catch { alert("保存失败"); }
    setSaving(false);
  };

  const handleRestore = (dataJson: string) => {
    try {
      const d = JSON.parse(dataJson);
      if (d.companyName) setCompanyName(d.companyName);
      if (d.companyAddress) setCompanyAddress(d.clientAddress);
      if (d.clientName) setClientName(d.clientName);
      if (d.clientAddress) setClientAddress(d.clientAddress);
      if (d.invoiceNo) setInvoiceNo(d.invoiceNo);
      if (d.lineItems) setLineItems(d.lineItems);
      if (d.freight) setFreight(d.freight);
      if (d.insurance) setInsurance(d.insurance);
      if (d.terms) setTerms(d.terms);
      if (d.notes) setNotes(d.notes);
    } catch { /* ignore */ }
  };

  const handleReset = () => {
    if (confirm("确定要清空所有内容吗？")) {
      setCompanyName(""); setCompanyAddress(""); setClientName(""); setClientAddress(""); setInvoiceNo(""); setInvoiceDate(new Date().toISOString().split("T")[0]); setLineItems([{ id: "1", description: "", quantity: 1, unitPrice: 0, currency: "USD" }]); setFreight(0); setInsurance(0); setTerms("T/T"); setNotes(""); setCurrentDocId(null); setSelectedProfile(null); setSaved(false); setSaveMsg("");
    }
  };

  const handlePrint = () => {
    const printContent = previewRef.current;
    if (!printContent) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Commercial Invoice</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        h1 { text-align: center; color: #0d9488; }
        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
      </style></head><body>${printContent.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
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
              <span className="truncate">外贸发票生成器</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {currentDocId && (
              <ToolHistoryPanel documentId={currentDocId} toolKey="commercial_invoice" onRestore={handleRestore} />
            )}
            <button onClick={() => setShowPreview(!showPreview)} className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]">
              {showPreview ? <><Code className="w-4 h-4" /> 编辑</> : <><Eye className="w-4 h-4" /> 预览</>}
            </button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 min-h-[44px]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存草稿
            </button>
            <button onClick={handleReset} className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]">🗑️ 清空</button>
            <button onClick={handlePrint} className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 min-h-[44px]">
              <Printer className="w-4 h-4" /> 打印/PDF
            </button>
          </div>
        </div>
      </header>

      {saved && saveMsg && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">{saveMsg}</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 overflow-x-hidden">
        <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
          {/* Form */}
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
              <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" /> 公司信息
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="公司名称" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} placeholder="发票号 (可选)" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <textarea value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="公司地址" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm sm:col-span-2" />
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">客户信息</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="客户名称" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} type="date" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <textarea value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="客户地址" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm sm:col-span-2" />
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-700">商品项目</h2>
                <button onClick={addLine} className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 min-h-[44px]">
                  <Plus className="w-4 h-4" /> 添加
                </button>
              </div>
              <div className="space-y-2 overflow-x-auto">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex gap-1 items-start min-w-0">
                    <input value={item.description} onChange={(e) => updateLine(item.id, "description", e.target.value)} placeholder="商品描述" className="min-w-[80px] flex-1 px-2 py-2 border rounded-lg text-sm min-h-[44px]" />
                    <input type="number" value={item.quantity} onChange={(e) => updateLine(item.id, "quantity", parseFloat(e.target.value) || 0)} className="w-16 px-2 py-2 border rounded-lg text-sm min-h-[44px]" />
                    <input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateLine(item.id, "unitPrice", parseFloat(e.target.value) || 0)} className="w-20 px-2 py-2 border rounded-lg text-sm min-h-[44px]" />
                    <span className="text-xs text-gray-500 py-2 min-w-[40px] shrink-0">{(item.quantity * item.unitPrice).toFixed(2)}</span>
                    <button onClick={() => removeLine(item.id)} className="p-1 text-red-400 hover:text-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Fees & Terms */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">费用与条款</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><label className="text-xs text-gray-500">运费</label><input type="number" step="0.01" value={freight} onChange={(e) => setFreight(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" /></div>
                <div><label className="text-xs text-gray-500">保险</label><input type="number" step="0.01" value={insurance} onChange={(e) => setInsurance(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" /></div>
                <div><label className="text-xs text-gray-500">付款方式</label><input value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="T/T" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" /></div>
                <div><label className="text-xs text-gray-500">总计</label><div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-bold text-teal-700 min-h-[44px] flex items-center">{total.toFixed(2)}</div></div>
              </div>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="备注" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm mt-3" />
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="lg:sticky lg:top-20 self-start">
              <div ref={previewRef} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-8 min-h-[700px] overflow-x-auto" style={{ fontFamily: "Arial, sans-serif" }}>
                <div className="min-w-[280px]">
                <h1 className="text-2xl font-bold text-center text-teal-700 mb-6">COMMERCIAL INVOICE</h1>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">FROM</p>
                    <p className="font-bold text-gray-900">{companyName || "— 公司名称 —"}</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{companyAddress || "— 公司地址 —"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">TO</p>
                    <p className="font-bold text-gray-900">{clientName || "— 客户名称 —"}</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{clientAddress || "— 客户地址 —"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
                  <div><span className="text-gray-500">Invoice No: </span><span className="font-medium">{invoiceNo || "—"}</span></div>
                  <div><span className="text-gray-500">Date: </span><span className="font-medium">{invoiceDate}</span></div>
                </div>

                <table className="w-full text-sm mb-6">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-3 py-2 border-b font-medium">Description</th>
                      <th className="text-right px-3 py-2 border-b font-medium">Qty</th>
                      <th className="text-right px-3 py-2 border-b font-medium">Unit Price</th>
                      <th className="text-right px-3 py-2 border-b font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50">
                        <td className="px-3 py-2 break-words">{item.description || "—"}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{item.unitPrice.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">{(item.quantity * item.unitPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="text-right space-y-1 text-sm">
                  <div className="flex justify-end gap-8"><span className="text-gray-500">Subtotal:</span><span className="font-medium">{subtotal.toFixed(2)}</span></div>
                  {freight > 0 && <div className="flex justify-end gap-8"><span className="text-gray-500">Freight:</span><span>{freight.toFixed(2)}</span></div>}
                  {insurance > 0 && <div className="flex justify-end gap-8"><span className="text-gray-500">Insurance:</span><span>{insurance.toFixed(2)}</span></div>}
                  <div className="flex justify-end gap-8 pt-2 border-t border-gray-200"><span className="font-bold text-lg">TOTAL:</span><span className="font-bold text-lg text-teal-700">{total.toFixed(2)}</span></div>
                </div>

                {terms && <p className="text-xs text-gray-500 mt-6">Payment Terms: {terms}</p>}
                {notes && <p className="text-xs text-gray-500 mt-2">Notes: {notes}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
