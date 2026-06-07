"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Printer, FileText, Plus, Trash2, Loader2, Building2, Eye, Code } from "lucide-react";
import CompanyProfilePicker, { CompanyProfile } from "@/components/document-tools/company-profile-picker";
import ToolHistoryPanel from "@/components/document-tools/tool-history-panel";
import { useDraftLoader } from "@/lib/use-draft-loader";

interface CargoLine {
  id: string;
  name: string;
  qty: number;
  notes: string;
}

export default function InboundReceiptPage() {
  const searchParams = useSearchParams();
  const draftId = searchParams?.get("draftId");
  const [companyName, setCompanyName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [receiptNo, setReceiptNo] = useState(`IN${Date.now().toString().slice(-6)}`);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerName, setCustomerName] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const [packages, setPackages] = useState(1);
  const [weight, setWeight] = useState("");
  const [volume, setVolume] = useState("");
  const [items, setItems] = useState<CargoLine[]>([{ id: "1", name: "", qty: 1, notes: "" }]);
  const [notes, setNotes] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load draft from URL param
  const loadDraftData = useCallback((dataJson: string) => {
    try {
      const d = JSON.parse(dataJson);
      if (d.companyName) setCompanyName(d.companyName);
      if (d.companyPhone) setCompanyPhone(d.companyPhone);
      if (d.companyEmail) setCompanyEmail(d.companyEmail);
      if (d.companyAddress) setCompanyAddress(d.companyAddress);
      if (d.receiptNo) setReceiptNo(d.receiptNo);
      if (d.date) setDate(d.date);
      if (d.customerName) setCustomerName(d.customerName);
      if (d.warehouseName) setWarehouseName(d.warehouseName);
      if (d.trackingNo) setTrackingNo(d.trackingNo);
      if (d.packages) setPackages(d.packages);
      if (d.weight) setWeight(d.weight);
      if (d.volume) setVolume(d.volume);
      if (d.items) setItems(d.items);
      if (d.notes) setNotes(d.notes);
    } catch { /* ignore */ }
  }, []);

  const { loadingDraft, draftError, draftLoaded } = useDraftLoader(() => draftId, loadDraftData);

  useEffect(() => {
    if (draftLoaded && draftId) setCurrentDocId(draftId);
  }, [draftLoaded, draftId]);

  const handleProfileSelect = useCallback((profile: CompanyProfile) => {
    setSelectedProfile(profile);
    setCompanyName(profile.companyName);
    setCompanyPhone(profile.phone || "");
    setCompanyEmail(profile.email || "");
    setCompanyAddress(profile.address || "");
  }, []);

  const addItem = () => setItems([...items, { id: `${Date.now()}`, name: "", qty: 1, notes: "" }]);
  const removeItem = (id: string) => { if (items.length > 1) setItems(items.filter(i => i.id !== id)); };
  const updateItem = (id: string, field: keyof CargoLine, value: string | number) => setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      const data = { companyName, companyPhone, companyEmail, companyAddress, receiptNo, date, customerName, warehouseName, trackingNo, packages, weight, volume, items, notes };
      const method = currentDocId ? "PUT" : "POST";
      const url = currentDocId ? `/api/me/tool-documents/${currentDocId}` : "/api/me/tool-documents";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toolKey: "inbound_receipt", title: `入库单 ${receiptNo}`, dataJson: JSON.stringify(data), ...(selectedProfile?.id && { companyProfileId: selectedProfile.id }) }) });
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
      if (d.companyPhone) setCompanyPhone(d.companyPhone);
      if (d.companyEmail) setCompanyEmail(d.companyEmail);
      if (d.companyAddress) setCompanyAddress(d.companyAddress);
      if (d.receiptNo) setReceiptNo(d.receiptNo);
      if (d.date) setDate(d.date);
      if (d.customerName) setCustomerName(d.customerName);
      if (d.warehouseName) setWarehouseName(d.warehouseName);
      if (d.trackingNo) setTrackingNo(d.trackingNo);
      if (d.packages) setPackages(d.packages);
      if (d.weight) setWeight(d.weight);
      if (d.volume) setVolume(d.volume);
      if (d.items) setItems(d.items);
      if (d.notes) setNotes(d.notes);
    } catch { /* ignore */ }
  };

  const handleReset = () => {
    if (confirm("确定要清空所有内容吗？")) {
      setCompanyName("");
      setCompanyPhone("");
      setCompanyEmail("");
      setCompanyAddress("");
      setReceiptNo(`IN${Date.now().toString().slice(-6)}`);
      setDate(new Date().toISOString().split("T")[0]);
      setCustomerName("");
      setWarehouseName("");
      setTrackingNo("");
      setPackages(1);
      setWeight("");
      setVolume("");
      setItems([{ id: "1", name: "", qty: 1, notes: "" }]);
      setNotes("");
      setCurrentDocId(null);
      setSelectedProfile(null);
      setSaved(false);
      setSaveMsg("");
    }
  };

  const handlePrint = () => {
    const el = previewRef.current; if (!el) return;
    const win = window.open("", "_blank"); if (!win) return;
    win.document.write(`<html><head><title>入库单</title><style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}h1{text-align:center;color:#0d9488}</style></head><body>${el.innerHTML}</body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <header className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/tools/document-tools" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 min-h-[44px] shrink-0"><ArrowLeft className="w-4 h-4" /> 返回</Link>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2 min-w-0"><FileText className="w-5 h-5 text-teal-600 shrink-0" /><span className="truncate">入库单</span></h1>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {currentDocId && <ToolHistoryPanel documentId={currentDocId} toolKey="inbound_receipt" onRestore={handleRestore} />}
            <button onClick={() => setShowPreview(!showPreview)} className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]">{showPreview ? <><Code className="w-4 h-4" /> 编辑</> : <><Eye className="w-4 h-4" /> 预览</>}</button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 min-h-[44px]">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存草稿</button>
            <button onClick={handleReset} className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]">🗑️ 清空</button>
            <button onClick={handlePrint} className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 min-h-[44px]"><Printer className="w-4 h-4" /> 打印</button>
          </div>
        </div>
      </header>

      {saved && <div className="max-w-7xl mx-auto px-4 mt-3">{saveMsg && <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">{saveMsg}</div>}</div>}

      {loadingDraft && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> 正在加载草稿...
          </div>
        </div>
      )}

      {draftError && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">{draftError}</div>
        </div>
      )}

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

            {/* Receipt Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">入库信息</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <input value={receiptNo} onChange={e => setReceiptNo(e.target.value)} placeholder="入库单号" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="客户名称" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={warehouseName} onChange={e => setWarehouseName(e.target.value)} placeholder="仓库/收货点" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={trackingNo} onChange={e => setTrackingNo(e.target.value)} placeholder="快递单号" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input type="number" value={packages} onChange={e => setPackages(parseInt(e.target.value) || 0)} placeholder="件数" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={weight} onChange={e => setWeight(e.target.value)} placeholder="重量 (kg)" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={volume} onChange={e => setVolume(e.target.value)} placeholder="体积 (m³)" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px] sm:col-span-3" />
              </div>
            </div>

            {/* Cargo Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3"><h2 className="text-sm font-bold text-gray-700">货物明细</h2><button onClick={addItem} className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 min-h-[44px]"><Plus className="w-4 h-4" /> 添加</button></div>
              <div className="space-y-2 overflow-x-auto">
                {items.map(item => (
                  <div key={item.id} className="flex gap-2 items-start">
                    <input value={item.name} onChange={e => updateItem(item.id, "name", e.target.value)} placeholder="品名" className="flex-1 px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                    <input type="number" value={item.qty} onChange={e => updateItem(item.id, "qty", parseInt(e.target.value) || 0)} className="w-16 px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                    <input value={item.notes} onChange={e => updateItem(item.id, "notes", e.target.value)} placeholder="备注" className="flex-1 px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                    <button onClick={() => removeItem(item.id)} className="p-1 text-red-400 hover:text-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">备注</h2>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="备注信息" rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="lg:sticky lg:top-20 self-start">
              <div ref={previewRef} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-8 min-h-[700px] overflow-x-auto" style={{ fontFamily: "Arial, sans-serif" }}>
                <div className="min-w-[280px]">
                  <h1 className="text-2xl font-bold text-center text-teal-700 mb-6">入库单</h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div><p className="text-xs text-gray-500 mb-1">收货方</p><p className="font-bold">{companyName || "—"}</p><p className="text-sm text-gray-600">{companyPhone}{companyEmail ? ` · ${companyEmail}` : ""}</p><p className="text-sm text-gray-600">{companyAddress || ""}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">客户</p><p className="font-bold">{customerName || "—"}</p><p className="text-sm text-gray-600">{warehouseName || ""}</p></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-sm">
                    <div><span className="text-gray-500">入库单号: </span><span className="font-medium">{receiptNo}</span></div>
                    <div><span className="text-gray-500">日期: </span><span className="font-medium">{date}</span></div>
                    <div><span className="text-gray-500">快递单号: </span><span className="font-medium">{trackingNo || "—"}</span></div>
                    <div><span className="text-gray-500">件数: </span><span className="font-medium">{packages}</span></div>
                    <div><span className="text-gray-500">重量: </span><span className="font-medium">{weight ? weight + " kg" : "—"}</span></div>
                    <div><span className="text-gray-500">体积: </span><span className="font-medium">{volume ? volume + " m³" : "—"}</span></div>
                  </div>
                  <table className="w-full text-sm mb-6">
                    <thead><tr className="bg-gray-50"><th className="text-left px-3 py-2 border-b font-medium">品名</th><th className="text-right px-3 py-2 border-b font-medium">数量</th><th className="text-right px-3 py-2 border-b font-medium">备注</th></tr></thead>
                    <tbody>{items.map(i => (<tr key={i.id} className="border-b border-gray-50"><td className="px-3 py-2 break-words">{i.name || "—"}</td><td className="px-3 py-2 text-right">{i.qty}</td><td className="px-3 py-2 break-words">{i.notes || "—"}</td></tr>))}</tbody>
                  </table>
                  {notes && <p className="text-sm text-gray-600 mt-4"><span className="text-gray-500">备注: </span>{notes}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
