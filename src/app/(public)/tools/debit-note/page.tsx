"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Printer, FileText, Plus, Trash2, Loader2, Building2, Eye, Code } from "lucide-react";
import CompanyProfilePicker, { CompanyProfile } from "@/components/document-tools/company-profile-picker";
import ToolHistoryPanel from "@/components/document-tools/tool-history-panel";

interface DebitItem {
  id: string;
  description: string;
  amount: number;
}

export default function DebitNotePage() {
  const [companyName, setCompanyName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [noteNo, setNoteNo] = useState(`DN${Date.now().toString().slice(-6)}`);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerName, setCustomerName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [items, setItems] = useState<DebitItem[]>([{ id: "1", description: "", amount: 0 }]);
  const [notes, setNotes] = useState("");
  const [paymentInfo, setPaymentInfo] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleProfileSelect = useCallback((profile: CompanyProfile) => {
    setSelectedProfile(profile);
    setCompanyName(profile.companyName);
    setCompanyPhone(profile.phone || "");
    setCompanyEmail(profile.email || "");
    setCompanyAddress(profile.address || "");
    if (profile.bankUsdInfo) setPaymentInfo(profile.bankUsdInfo);
    if (profile.bankCnyInfo && currency === "CNY") setPaymentInfo(profile.bankCnyInfo);
  }, []);

  const addItem = () => setItems([...items, { id: `${Date.now()}`, description: "", amount: 0 }]);
  const removeItem = (id: string) => { if (items.length > 1) setItems(items.filter(i => i.id !== id)); };
  const updateItem = (id: string, field: keyof DebitItem, value: string | number) => setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));

  const subtotal = items.reduce((s, i) => s + i.amount, 0);

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      const data = { companyName, companyPhone, companyEmail, companyAddress, noteNo, date, customerName, currency, items, notes, paymentInfo, subtotal };
      const method = currentDocId ? "PUT" : "POST";
      const url = currentDocId ? `/api/me/tool-documents/${currentDocId}` : "/api/me/tool-documents";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toolKey: "debit_note", title: `Debit Note ${noteNo}`, dataJson: JSON.stringify(data), ...(selectedProfile?.id && { companyProfileId: selectedProfile.id }) }) });
      if (res.ok) { setSaved(true); const d = await res.json(); if (d.data?.id && !currentDocId) setCurrentDocId(d.data.id); }
      else { const d = await res.json().catch(() => ({})); if (res.status === 401) { window.location.href = "/login"; return; } alert(d.error || "保存失败"); }
    } catch { alert("保存失败"); }
    setSaving(false);
  };

  const handleRestore = (dataJson: string) => {
    try {
      const d = JSON.parse(dataJson);
      if (d.companyName) setCompanyName(d.companyName);
      if (d.companyPhone) setCompanyPhone(d.companyPhone);
      if (d.companyEmail) setCompanyEmail(d.companyEmail);
      if (d.companyAddress) setCompanyAddress(d.companyAddress);
      if (d.noteNo) setNoteNo(d.noteNo);
      if (d.date) setDate(d.date);
      if (d.customerName) setCustomerName(d.customerName);
      if (d.currency) setCurrency(d.currency);
      if (d.items) setItems(d.items);
      if (d.notes) setNotes(d.notes);
      if (d.paymentInfo) setPaymentInfo(d.paymentInfo);
    } catch { /* ignore */ }
  };

  const handlePrint = () => {
    const el = previewRef.current; if (!el) return;
    const win = window.open("", "_blank"); if (!win) return;
    win.document.write(`<html><head><title>Debit Note</title><style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}.amount{text-align:right}h1{text-align:center;color:#0d9488}.total{text-align:right;font-size:18px;font-weight:bold}</style></head><body>${el.innerHTML}</body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <header className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/tools/document-tools" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 min-h-[44px] shrink-0"><ArrowLeft className="w-4 h-4" /> 返回</Link>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2 min-w-0"><FileText className="w-5 h-5 text-teal-600 shrink-0" /><span className="truncate">Debit Note</span></h1>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {currentDocId && <ToolHistoryPanel documentId={currentDocId} toolKey="debit_note" onRestore={handleRestore} />}
            <button onClick={() => setShowPreview(!showPreview)} className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]">{showPreview ? <><Code className="w-4 h-4" /> 编辑</> : <><Eye className="w-4 h-4" /> 预览</>}</button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 min-h-[44px]">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存</button>
            <button onClick={handlePrint} className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 min-h-[44px]"><Printer className="w-4 h-4" /> 打印</button>
          </div>
        </div>
      </header>

      {saved && <div className="max-w-7xl mx-auto px-4 mt-3"><div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">✅ 已保存</div></div>}

      <div className="max-w-7xl mx-auto px-4 py-6 overflow-x-hidden">
        <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
          <div className="space-y-4 min-w-0">
            {/* Company Profile */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-teal-600" /> 公司资料</h2>
              <CompanyProfilePicker onSelect={handleProfileSelect} selectedId={selectedProfile?.id} />
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">公司信息</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="公司名称" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={date} onChange={e => setDate(e.target.value)} type="date" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder="电话" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} placeholder="邮箱" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} placeholder="地址" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px] sm:col-span-2" />
              </div>
            </div>

            {/* Debit Note Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">Debit Note 信息</h2>
              <div className="grid grid-cols-3 gap-3">
                <input value={noteNo} onChange={e => setNoteNo(e.target.value)} placeholder="单号" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="客户名称" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px] sm:col-span-2" />
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px] sm:col-span-3">
                  <option value="USD">USD</option><option value="CNY">CNY</option><option value="EUR">EUR</option><option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            {/* Fee Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3"><h2 className="text-sm font-bold text-gray-700">费用项目</h2><button onClick={addItem} className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 min-h-[44px]"><Plus className="w-4 h-4" /> 添加</button></div>
              <div className="space-y-2 overflow-x-auto">
                {items.map(item => (
                  <div key={item.id} className="flex gap-2 items-start">
                    <input value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} placeholder="费用描述" className="flex-1 px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                    <input type="number" step="0.01" value={item.amount} onChange={e => updateItem(item.id, "amount", parseFloat(e.target.value) || 0)} className="w-24 px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                    <button onClick={() => removeItem(item.id)} className="p-1 text-red-400 hover:text-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right text-sm font-bold text-teal-700">小计: {currency} {subtotal.toFixed(2)}</div>
            </div>

            {/* Payment Info & Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">付款信息 & 备注</h2>
              <textarea value={paymentInfo} onChange={e => setPaymentInfo(e.target.value)} placeholder="银行账户信息" rows={3} className="w-full px-3 py-2 border rounded-lg text-sm mb-3" />
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="备注" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="lg:sticky lg:top-20 self-start">
              <div ref={previewRef} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-8 min-h-[700px] overflow-x-auto" style={{ fontFamily: "Arial, sans-serif" }}>
                <div className="min-w-[280px]">
                  <h1 className="text-2xl font-bold text-center text-teal-700 mb-6">DEBIT NOTE</h1>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div><p className="text-xs text-gray-500 mb-1">收款方</p><p className="font-bold">{companyName || "—"}</p><p className="text-sm text-gray-600">{companyPhone}{companyEmail ? ` · ${companyEmail}` : ""}</p><p className="text-sm text-gray-600">{companyAddress || ""}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">付款方</p><p className="font-bold">{customerName || "—"}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div><span className="text-gray-500">Debit Note No: </span><span className="font-medium">{noteNo}</span></div>
                    <div><span className="text-gray-500">Date: </span><span className="font-medium">{date}</span></div>
                  </div>
                  <table className="w-full text-sm mb-6">
                    <thead><tr className="bg-gray-50"><th className="text-left px-3 py-2 border-b font-medium">Description</th><th className="amount px-3 py-2 border-b font-medium">Amount ({currency})</th></tr></thead>
                    <tbody>{items.map(i => (<tr key={i.id} className="border-b border-gray-50"><td className="px-3 py-2 break-words">{i.description || "—"}</td><td className="px-3 py-2 amount">{i.amount.toFixed(2)}</td></tr>))}</tbody>
                  </table>
                  <div className="text-right total"><span className="text-gray-500">Total: </span><span className="text-teal-700">{currency} {subtotal.toFixed(2)}</span></div>
                  {paymentInfo && <div className="mt-6 text-sm"><p className="text-gray-500 mb-1">Payment Information</p><p className="text-gray-900 whitespace-pre-wrap break-words">{paymentInfo}</p></div>}
                  {notes && <div className="mt-4 text-sm"><p className="text-gray-500 mb-1">Notes</p><p className="text-gray-900 whitespace-pre-wrap break-words">{notes}</p></div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
