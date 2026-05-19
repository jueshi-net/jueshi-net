"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Printer, FileText, Loader2, Building2, Eye, Code } from "lucide-react";
import CompanyProfilePicker, { CompanyProfile } from "@/components/document-tools/company-profile-picker";
import ToolHistoryPanel from "@/components/document-tools/tool-history-panel";
import { useDraftLoader } from "@/lib/use-draft-loader";

export default function HandoverNotePage() {
  const searchParams = useSearchParams();
  const draftId = searchParams?.get("draftId");
  const [companyName, setCompanyName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [handoverNo, setHandoverNo] = useState(`HN${Date.now().toString().slice(-6)}`);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [fromParty, setFromParty] = useState("");
  const [toParty, setToParty] = useState("");
  const [contact, setContact] = useState("");
  const [packages, setPackages] = useState(1);
  const [cargoDescription, setCargoDescription] = useState("");
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
      if (d.handoverNo) setHandoverNo(d.handoverNo);
      if (d.date) setDate(d.date);
      if (d.fromParty) setFromParty(d.fromParty);
      if (d.toParty) setToParty(d.toParty);
      if (d.contact) setContact(d.contact);
      if (d.packages) setPackages(d.packages);
      if (d.cargoDescription) setCargoDescription(d.cargoDescription);
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
    setFromParty(profile.companyName);
  }, []);

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      const data = { companyName, companyPhone, companyEmail, companyAddress, handoverNo, date, fromParty, toParty, contact, packages, cargoDescription, notes };
      const method = currentDocId ? "PUT" : "POST";
      const url = currentDocId ? `/api/me/tool-documents/${currentDocId}` : "/api/me/tool-documents";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toolKey: "handover_note", title: `交接单 ${handoverNo}`, dataJson: JSON.stringify(data), ...(selectedProfile?.id && { companyProfileId: selectedProfile.id }) }) });
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
      if (d.handoverNo) setHandoverNo(d.handoverNo);
      if (d.date) setDate(d.date);
      if (d.fromParty) setFromParty(d.fromParty);
      if (d.toParty) setToParty(d.toParty);
      if (d.contact) setContact(d.contact);
      if (d.packages) setPackages(d.packages);
      if (d.cargoDescription) setCargoDescription(d.cargoDescription);
      if (d.notes) setNotes(d.notes);
    } catch { /* ignore */ }
  };

  const handleReset = () => {
    if (confirm("确定要清空所有内容吗？")) {
      setCompanyName(""); setCompanyPhone(""); setCompanyEmail(""); setCompanyAddress(""); setHandoverNo(`HN${Date.now().toString().slice(-6)}`); setDate(new Date().toISOString().split("T")[0]); setFromParty(""); setToParty(""); setContact(""); setPackages(1); setCargoDescription(""); setNotes(""); setCurrentDocId(null); setSelectedProfile(null); setSaved(false); setSaveMsg("");
    }
  };

  const handlePrint = () => {
    const el = previewRef.current; if (!el) return;
    const win = window.open("", "_blank"); if (!win) return;
    win.document.write(`<html><head><title>交接单</title><style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}h1{text-align:center;color:#0d9488}.sig{border-top:1px solid #ccc;padding-top:40px;margin-top:40px;display:flex;justify-content:space-between}</style></head><body>${el.innerHTML}</body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <header className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/tools/document-tools" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 min-h-[44px] shrink-0"><ArrowLeft className="w-4 h-4" /> 返回</Link>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2 min-w-0"><FileText className="w-5 h-5 text-teal-600 shrink-0" /><span className="truncate">交接单</span></h1>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {currentDocId && <ToolHistoryPanel documentId={currentDocId} toolKey="handover_note" onRestore={handleRestore} />}
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

            {/* Handover Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">交接信息</h2>
              <div className="grid grid-cols-2 gap-3">
                <input value={handoverNo} onChange={e => setHandoverNo(e.target.value)} placeholder="交接单号" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={contact} onChange={e => setContact(e.target.value)} placeholder="联系方式" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={fromParty} onChange={e => setFromParty(e.target.value)} placeholder="交接方" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={toParty} onChange={e => setToParty(e.target.value)} placeholder="接收方" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input type="number" value={packages} onChange={e => setPackages(parseInt(e.target.value) || 0)} placeholder="件数" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <textarea value={cargoDescription} onChange={e => setCargoDescription(e.target.value)} placeholder="货物描述" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm sm:col-span-2" />
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="备注" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm sm:col-span-2" />
              </div>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="lg:sticky lg:top-20 self-start">
              <div ref={previewRef} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-8 min-h-[700px] overflow-x-auto" style={{ fontFamily: "Arial, sans-serif" }}>
                <div className="min-w-[280px]">
                  <h1 className="text-2xl font-bold text-center text-teal-700 mb-6">货物交接单</h1>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div><p className="text-xs text-gray-500 mb-1">交接方</p><p className="font-bold">{fromParty || companyName || "—"}</p><p className="text-sm text-gray-600">{companyPhone}{companyEmail ? ` · ${companyEmail}` : ""}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">接收方</p><p className="font-bold">{toParty || "—"}</p><p className="text-sm text-gray-600">{contact || ""}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div><span className="text-gray-500">交接单号: </span><span className="font-medium">{handoverNo}</span></div>
                    <div><span className="text-gray-500">日期: </span><span className="font-medium">{date}</span></div>
                    <div><span className="text-gray-500">件数: </span><span className="font-medium">{packages}</span></div>
                  </div>
                  {cargoDescription && <div className="mb-6 text-sm"><p className="text-gray-500 mb-1">货物描述</p><p className="text-gray-900 whitespace-pre-wrap break-words">{cargoDescription}</p></div>}
                  {notes && <div className="mb-6 text-sm"><p className="text-gray-500 mb-1">备注</p><p className="text-gray-900 whitespace-pre-wrap break-words">{notes}</p></div>}
                  <div className="sig mt-12 pt-8 border-t border-gray-200">
                    <div className="text-center"><p className="text-sm text-gray-500 mb-8">交接人签字</p><p className="text-sm text-gray-400">_______________</p></div>
                    <div className="text-center"><p className="text-sm text-gray-500 mb-8">接收人签字</p><p className="text-sm text-gray-400">_______________</p></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
