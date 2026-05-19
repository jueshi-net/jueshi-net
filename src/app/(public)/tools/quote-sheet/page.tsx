"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Printer, FileText, Plus, Trash2, Loader2, Building2, Eye, Code } from "lucide-react";
import CompanyProfilePicker, { CompanyProfile } from "@/components/document-tools/company-profile-picker";
import ToolHistoryPanel from "@/components/document-tools/tool-history-panel";

interface QuoteLine {
  id: string;
  description: string;
  weight: string;
  qty: number;
  pricePerUnit: number;
  channel: string;
  notes: string;
}

export default function QuoteSheetPage() {
  const [companyName, setCompanyName] = useState("");
  const [companyContact, setCompanyContact] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState("");
  const [lines, setLines] = useState<QuoteLine[]>([{ id: "1", description: "", weight: "", qty: 1, pricePerUnit: 0, channel: "", notes: "" }]);
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleProfileSelect = useCallback((profile: CompanyProfile) => {
    setSelectedProfile(profile);
    setCompanyName(profile.companyName);
    setCompanyContact(profile.contactName || "");
    setCompanyEmail(profile.email || "");
  }, []);

  const addLine = () => setLines([...lines, { id: `${Date.now()}`, description: "", weight: "", qty: 1, pricePerUnit: 0, channel: "", notes: "" }]);
  const removeLine = (id: string) => { if (lines.length > 1) setLines(lines.filter(l => l.id !== id)); };
  const updateLine = (id: string, field: keyof QuoteLine, value: string | number) => setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));

  const total = lines.reduce((s, l) => s + l.qty * l.pricePerUnit, 0);

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      const data = { companyName, companyContact, companyEmail, clientName, clientContact, quoteDate, validUntil, lines };
      const method = currentDocId ? "PUT" : "POST";
      const url = currentDocId ? `/api/me/tool-documents/${currentDocId}` : "/api/me/tool-documents";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolKey: "quote_sheet", title: `报价单 ${quoteDate}`, dataJson: JSON.stringify(data), ...(selectedProfile?.id && { companyProfileId: selectedProfile.id }) }),
      });
      if (res.ok) { setSaved(true);
        setSaveMsg(currentDocId ? "已更新草稿" : "已保存草稿");
        setTimeout(() => setSaved(false), 3000); const d = await res.json(); if (d.data?.id && !currentDocId) setCurrentDocId(d.data.id); }
      else { const d = await res.json().catch(() => ({})); if (res.status === 401) { window.location.href = "/login"; return; } alert(d.error || "保存失败"); }
    } catch { alert("保存失败"); }
    setSaving(false);
  };

  const handleRestore = (dataJson: string) => {
    try {
      const d = JSON.parse(dataJson);
      if (d.companyName) setCompanyName(d.companyName);
      if (d.companyContact) setCompanyContact(d.companyContact);
      if (d.companyEmail) setCompanyEmail(d.companyEmail);
      if (d.clientName) setClientName(d.clientName);
      if (d.clientContact) setClientContact(d.clientContact);
      if (d.quoteDate) setQuoteDate(d.quoteDate);
      if (d.validUntil) setValidUntil(d.validUntil);
      if (d.lines) setLines(d.lines);
    } catch { /* ignore */ }
  };

  const handleReset = () => {
    if (confirm("确定要清空所有内容吗？")) {
      setCompanyName("");
      setCompanyContact("");
      setCompanyEmail("");
      setClientName("");
      setClientContact("");
      setQuoteDate(new Date().toISOString().split("T")[0]);
      setValidUntil("");
      setLines([{ id: "1", description: "", weight: "", qty: 1, pricePerUnit: 0, channel: "", notes: "" }]);
      setCurrentDocId(null);
      setSelectedProfile(null);
      setSaved(false);
      setSaveMsg("");
    }
  };

  const handlePrint = () => {
    const el = previewRef.current; if (!el) return;
    const win = window.open("", "_blank"); if (!win) return;
    win.document.write(`<html><head><title>报价单</title><style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}h1{text-align:center;color:#0d9488}.total{text-align:right;font-size:18px;font-weight:bold}</style></head><body>${el.innerHTML}</body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <header className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/tools/document-tools" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 min-h-[44px] shrink-0"><ArrowLeft className="w-4 h-4" /> 返回</Link>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2 min-w-0"><FileText className="w-5 h-5 text-teal-600 shrink-0" /><span className="truncate">供应链报价单</span></h1>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {currentDocId && <ToolHistoryPanel documentId={currentDocId} toolKey="quote_sheet" onRestore={handleRestore} />}
            <button onClick={() => setShowPreview(!showPreview)} className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]">{showPreview ? <><Code className="w-4 h-4" /> 编辑</> : <><Eye className="w-4 h-4" /> 预览</>}</button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 min-h-[44px]">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存草稿</button>
            <button onClick={handleReset} className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]">🗑️ 清空</button>
            <button onClick={handlePrint} className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 min-h-[44px]"><Printer className="w-4 h-4" /> 打印</button>
          </div>
        </div>
      </header>

      {saved && <div className="max-w-7xl mx-auto px-4 mt-3">{saveMsg && <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">{saveMsg}</div>}</div>}

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
                <input value={companyContact} onChange={e => setCompanyContact(e.target.value)} placeholder="联系人" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} placeholder="邮箱" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px] sm:col-span-2" />
              </div>
            </div>

            {/* Client + Date */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">客户与日期</h2>
              <div className="grid grid-cols-2 gap-3">
                <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="客户名称" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={clientContact} onChange={e => setClientContact(e.target.value)} placeholder="客户联系人" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={quoteDate} onChange={e => setQuoteDate(e.target.value)} type="date" placeholder="报价日期" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={validUntil} onChange={e => setValidUntil(e.target.value)} type="date" placeholder="有效期至" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3"><h2 className="text-sm font-bold text-gray-700">报价明细</h2><button onClick={addLine} className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 min-h-[44px]"><Plus className="w-4 h-4" /> 添加</button></div>
              <div className="space-y-2 overflow-x-auto">
                {lines.map((l) => (
                  <div key={l.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50 space-y-2">
                    <input value={l.description} onChange={e => updateLine(l.id, "description", e.target.value)} placeholder="商品/服务描述" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                    <div className="grid grid-cols-4 gap-2">
                      <input value={l.weight} onChange={e => updateLine(l.id, "weight", e.target.value)} placeholder="重量段" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                      <input type="number" value={l.qty} onChange={e => updateLine(l.id, "qty", parseInt(e.target.value) || 0)} placeholder="数量" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                      <input type="number" step="0.01" value={l.pricePerUnit} onChange={e => updateLine(l.id, "pricePerUnit", parseFloat(e.target.value) || 0)} placeholder="单价" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                      <div className="flex gap-1 items-center">
                        <span className="text-sm font-medium text-teal-700">{(l.qty * l.pricePerUnit).toFixed(2)}</span>
                        <button onClick={() => removeLine(l.id)} className="p-1 text-red-400 hover:text-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input value={l.channel} onChange={e => updateLine(l.id, "channel", e.target.value)} placeholder="渠道" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                      <input value={l.notes} onChange={e => updateLine(l.id, "notes", e.target.value)} placeholder="备注" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="lg:sticky lg:top-20 self-start">
              <div ref={previewRef} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-8 min-h-[700px] overflow-x-auto" style={{ fontFamily: "Arial, sans-serif" }}>
                <div className="min-w-[280px]">
                  <h1 className="text-2xl font-bold text-center text-teal-700 mb-6">供应链报价单</h1>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div><p className="text-xs text-gray-500 mb-1">报价方</p><p className="font-bold">{companyName || "—"}</p><p className="text-sm text-gray-600">{companyContact}{companyEmail ? ` · ${companyEmail}` : ""}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">客户</p><p className="font-bold">{clientName || "—"}</p><p className="text-sm text-gray-600">{clientContact}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mb-6 text-sm"><div><span className="text-gray-500">报价日期: </span><span className="font-medium">{quoteDate}</span></div><div><span className="text-gray-500">有效期至: </span><span className="font-medium">{validUntil || "—"}</span></div></div>
                  <table className="w-full text-sm mb-6">
                    <thead><tr className="bg-gray-50"><th className="text-left px-3 py-2 border-b font-medium">描述</th><th className="text-right px-3 py-2 border-b font-medium">数量</th><th className="text-right px-3 py-2 border-b font-medium">单价</th><th className="text-right px-3 py-2 border-b font-medium">小计</th></tr></thead>
                    <tbody>{lines.map(l => (<tr key={l.id} className="border-b border-gray-50"><td className="px-3 py-2 break-words">{l.description || "—"}{l.weight ? <span className="text-xs text-gray-400 ml-1">{l.weight}</span> : ""}</td><td className="px-3 py-2 text-right">{l.qty}</td><td className="px-3 py-2 text-right">{l.pricePerUnit.toFixed(2)}</td><td className="px-3 py-2 text-right">{(l.qty * l.pricePerUnit).toFixed(2)}</td></tr>))}</tbody>
                  </table>
                  <div className="text-right"><span className="text-lg font-bold text-teal-700">总计: {total.toFixed(2)}</span></div>
                  {lines.some(l => l.channel) && <p className="text-xs text-gray-500 mt-4">渠道: {lines.filter(l => l.channel).map(l => `${l.description}→${l.channel}`).join("; ")}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
