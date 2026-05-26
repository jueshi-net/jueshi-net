"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Printer, Building2, Plus, Trash2, FileText, Loader2, Eye, Code, Landmark } from "lucide-react";
import CompanyProfilePicker, { CompanyProfile } from "@/components/document-tools/company-profile-picker";
import ToolHistoryPanel from "@/components/document-tools/tool-history-panel";
import { useDraftLoader } from "@/lib/use-draft-loader";
import { useFreemiumGate } from "@/hooks/use-freemium-gate";
import PaywallModal from "@/components/ui/paywall-modal";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: string;
}

interface BankDetails {
  bankName: string;
  swiftCode: string;
  accountNo: string;
  accountName: string;
  bankAddress: string;
}

export default function CommercialInvoiceClient({ draftId }: { draftId: string | null }) {
  // ── Core form state ──
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: "",
    swiftCode: "",
    accountNo: "",
    accountName: "",
    bankAddress: "",
  });

  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);

  // ── Line items with auto-calculation ──
  const [lineItems, setLineItems] = useState<LineItem[]>([{ id: "1", description: "", quantity: 1, unitPrice: 0, currency: "USD" }]);

  // ── Fees ──
  const [freight, setFreight] = useState(0);
  const [insurance, setInsurance] = useState(0);

  // ── Separated: payment terms vs default terms vs remarks ──
  const [paymentTerms, setPaymentTerms] = useState("T/T");
  const [defaultTerms, setDefaultTerms] = useState("");
  const [remarks, setRemarks] = useState("");

  // ── UI state ──
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ── Freemium Gate ──
  const freemium = useFreemiumGate({
    limit: 2,
    storageKey: "invoice_export_count",
  });

  // ── Auto-calculate totals ──
  const subtotal = lineItems.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const totalQuantity = lineItems.reduce((sum, l) => sum + l.quantity, 0);
  const total = subtotal + freight + insurance;

  // ── Load draft from URL param ──
  const loadDraftData = useCallback((dataJson: string) => {
    try {
      const d = JSON.parse(dataJson);
      if (d.companyName) setCompanyName(d.companyName);
      if (d.companyAddress) setCompanyAddress(d.companyAddress);
      if (d.companyLogo) setCompanyLogo(d.companyLogo);
      if (d.clientName) setClientName(d.clientName);
      if (d.clientAddress) setClientAddress(d.clientAddress);
      if (d.invoiceNo) setInvoiceNo(d.invoiceNo);
      if (d.invoiceDate) setInvoiceDate(d.invoiceDate);
      if (d.lineItems) setLineItems(d.lineItems);
      if (d.freight !== undefined) setFreight(d.freight);
      if (d.insurance !== undefined) setInsurance(d.insurance);
      if (d.paymentTerms) setPaymentTerms(d.paymentTerms);
      if (d.defaultTerms) setDefaultTerms(d.defaultTerms);
      if (d.remarks !== undefined) setRemarks(d.remarks);
      if (d.terms) setPaymentTerms(d.terms); // legacy compatibility
      if (d.notes) setRemarks(d.notes); // legacy compatibility
      if (d.bankDetails) setBankDetails({ ...{ bankName: "", swiftCode: "", accountNo: "", accountName: "", bankAddress: "" }, ...d.bankDetails });
      if (d._docId) setCurrentDocId(d._docId);
    } catch { /* ignore */ }
  }, []);

  const { loadingDraft, draftError, draftLoaded } = useDraftLoader(() => draftId, loadDraftData);

  useEffect(() => {
    if (draftLoaded && draftId) setCurrentDocId(draftId);
  }, [draftLoaded, draftId]);

  // ── Load from localStorage (only if no draftId) ──
  useEffect(() => {
    if (draftId) return;
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
        if (d.freight !== undefined) setFreight(d.freight);
        if (d.insurance !== undefined) setInsurance(d.insurance);
        if (d.paymentTerms) setPaymentTerms(d.paymentTerms);
        if (d.terms) setPaymentTerms(d.terms);
        if (d.defaultTerms) setDefaultTerms(d.defaultTerms);
        if (d.remarks !== undefined) setRemarks(d.remarks);
        if (d.notes) setRemarks(d.notes);
        if (d.bankDetails) setBankDetails({ ...{ bankName: "", swiftCode: "", accountNo: "", accountName: "", bankAddress: "" }, ...d.bankDetails });
      } catch { /* ignore */ }
    }
  }, []);

  // ── Auto-fill company info + bank details from selected profile ──
  const handleProfileSelect = useCallback((profile: CompanyProfile) => {
    setSelectedProfile(profile);
    setCompanyName(profile.companyName);
    setCompanyAddress(profile.address || "");
    if (profile.logoDataUrl) setCompanyLogo(profile.logoDataUrl);

    // Parse bank info if available
    const bank: BankDetails = { bankName: "", swiftCode: "", accountNo: "", accountName: "", bankAddress: "" };
    if (profile.bankUsdInfo) {
      // Try to parse common bank info format
      const lines = profile.bankUsdInfo.split("\n").map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.includes("bank") && !lower.includes("account") && !bank.bankName) bank.bankName = line;
        else if (lower.includes("swift") || lower.includes("bic")) bank.swiftCode = line.replace(/swift\s*code\s*[:：]?\s*/i, "").trim();
        else if (lower.includes("account") && !bank.accountNo) bank.accountNo = line.replace(/account\s*(no|number)?\s*[:：]?\s*/i, "").trim();
        else if (!bank.bankAddress) bank.bankAddress = line;
      }
    }
    if (profile.bankCnyInfo) {
      // Similar parsing for CNY
      const lines = profile.bankCnyInfo.split("\n").map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.includes("bank") && !bank.bankName) bank.bankName = line;
        else if (lower.includes("account") && !bank.accountNo) bank.accountNo = line.replace(/account\s*(no|number)?\s*[:：]?\s*/i, "").trim();
      }
    }
    setBankDetails(prev => ({ ...prev, ...bank }));
  }, []);

  // ── Line item operations ──
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

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const data = {
        companyName, companyAddress, companyLogo, clientName, clientAddress,
        invoiceNo, invoiceDate, lineItems, freight, insurance,
        paymentTerms, defaultTerms, remarks, bankDetails,
      };
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

  // ── Restore draft from history ──
  const handleRestore = (dataJson: string) => {
    try {
      const d = JSON.parse(dataJson);
      if (d.companyName) setCompanyName(d.companyName);
      if (d.companyAddress) setCompanyAddress(d.companyAddress);
      if (d.companyLogo) setCompanyLogo(d.companyLogo);
      if (d.clientName) setClientName(d.clientName);
      if (d.clientAddress) setClientAddress(d.clientAddress);
      if (d.invoiceNo) setInvoiceNo(d.invoiceNo);
      if (d.lineItems) setLineItems(d.lineItems);
      if (d.freight !== undefined) setFreight(d.freight);
      if (d.insurance !== undefined) setInsurance(d.insurance);
      if (d.paymentTerms) setPaymentTerms(d.paymentTerms);
      if (d.terms) setPaymentTerms(d.terms);
      if (d.defaultTerms) setDefaultTerms(d.defaultTerms);
      if (d.remarks !== undefined) setRemarks(d.remarks);
      if (d.notes) setRemarks(d.notes);
      if (d.bankDetails) setBankDetails({ ...{ bankName: "", swiftCode: "", accountNo: "", accountName: "", bankAddress: "" }, ...d.bankDetails });
    } catch { /* ignore */ }
  };

  // ── Reset ──
  const handleReset = () => {
    if (confirm("确定要清空所有内容吗？")) {
      setCompanyName(""); setCompanyAddress(""); setCompanyLogo(null);
      setClientName(""); setClientAddress(""); setInvoiceNo("");
      setInvoiceDate(new Date().toISOString().split("T")[0]);
      setLineItems([{ id: "1", description: "", quantity: 1, unitPrice: 0, currency: "USD" }]);
      setFreight(0); setInsurance(0);
      setPaymentTerms("T/T"); setDefaultTerms(""); setRemarks("");
      setBankDetails({ bankName: "", swiftCode: "", accountNo: "", accountName: "", bankAddress: "" });
      setCurrentDocId(null); setSelectedProfile(null);
      setSaved(false); setSaveMsg("");
    }
  };

  // ── Print ──
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
        .signature-block { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 20px; }
        .signature-item { width: 45%; text-align: center; border-top: 1px solid #333; padding-top: 8px; }
      </style></head><body>${printContent.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
  };

  const handlePrintWithGate = () => {
    freemium.handleProtectedAction(() => {
      handlePrint();
    });
  };

  // ── Update bank detail helper ──
  const updateBankDetail = (field: keyof BankDetails, value: string) => {
    setBankDetails(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 py-3 overflow-x-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/tools/document-tools" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 min-h-[44px] shrink-0">
              <ArrowLeft className="w-4 h-4" /> 返回
            </Link>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 min-w-0">
              <FileText className="w-5 h-5 text-teal-600 shrink-0" />
              <span className="truncate">外贸发票生成器</span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
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
            <button onClick={handlePrintWithGate} className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 min-h-[44px]">
              <Printer className="w-4 h-4" /> 打印/PDF
            </button>
          </div>
        </div>
      </header>

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

      {saved && saveMsg && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">{saveMsg}</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 overflow-x-hidden">
        <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
          {/* ── Form ── */}
          <div className="space-y-4 min-w-0">
            {/* Company Profile Picker */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" /> 公司资料
              </h2>
              <CompanyProfilePicker onSelect={handleProfileSelect} selectedId={selectedProfile?.id} />
            </div>

            {/* Company Info + Bank Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" /> 公司 / 卖方信息
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="公司名称" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} placeholder="发票号 (可选)" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <textarea value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="公司地址" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm sm:col-span-2 min-h-[44px]" />
              </div>

              {/* Bank Details Section */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-teal-600" /> 银行收款信息（显示在发票上）
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={bankDetails.bankName} onChange={(e) => updateBankDetail("bankName", e.target.value)} placeholder="银行名称 (Bank Name)" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                  <input value={bankDetails.swiftCode} onChange={(e) => updateBankDetail("swiftCode", e.target.value)} placeholder="SWIFT Code" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                  <input value={bankDetails.accountName} onChange={(e) => updateBankDetail("accountName", e.target.value)} placeholder="账户名称 (Account Name)" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                  <input value={bankDetails.accountNo} onChange={(e) => updateBankDetail("accountNo", e.target.value)} placeholder="账号 (Account No.)" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                  <textarea value={bankDetails.bankAddress} onChange={(e) => updateBankDetail("bankAddress", e.target.value)} placeholder="银行地址" rows={1} className="w-full px-3 py-2 border rounded-lg text-sm sm:col-span-2 min-h-[44px]" />
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">客户信息</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="客户名称" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <input value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} type="date" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <textarea value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="客户地址" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm sm:col-span-2 min-h-[44px]" />
              </div>
            </div>

            {/* Line Items with auto-calc */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-700">商品项目</h2>
                <button onClick={addLine} className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 min-h-[44px]">
                  <Plus className="w-4 h-4" /> 添加
                </button>
              </div>
              <div className="space-y-2 overflow-x-auto">
                {/* Header row */}
                <div className="flex gap-1 text-xs text-gray-400 px-1 min-w-0">
                  <span className="flex-1">描述</span>
                  <span className="w-16 text-center">数量</span>
                  <span className="w-20 text-center">单价</span>
                  <span className="w-16 text-center">金额</span>
                  <span className="w-10" />
                </div>
                {lineItems.map((item) => (
                  <div key={item.id} className="flex gap-1 items-start min-w-0">
                    <input value={item.description} onChange={(e) => updateLine(item.id, "description", e.target.value)} placeholder="商品描述" className="min-w-[80px] flex-1 px-2 py-2 border rounded-lg text-sm min-h-[44px]" />
                    <input type="number" min="0" value={item.quantity} onChange={(e) => updateLine(item.id, "quantity", parseFloat(e.target.value) || 0)} className="w-16 px-2 py-2 border rounded-lg text-sm min-h-[44px] text-center" />
                    <input type="number" step="0.01" min="0" value={item.unitPrice} onChange={(e) => updateLine(item.id, "unitPrice", parseFloat(e.target.value) || 0)} className="w-20 px-2 py-2 border rounded-lg text-sm min-h-[44px] text-right" />
                    <span className="text-xs text-gray-600 font-medium py-2 min-w-[50px] text-right shrink-0">{(item.quantity * item.unitPrice).toFixed(2)}</span>
                    <button onClick={() => removeLine(item.id)} className="p-1 text-red-400 hover:text-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {/* Auto-calc summary */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                <span className="text-gray-500">总数量: <span className="font-semibold text-gray-700">{totalQuantity}</span></span>
                <span className="text-gray-500">小计: <span className="font-semibold text-teal-700">{subtotal.toFixed(2)}</span></span>
              </div>
            </div>

            {/* Fees & Terms & Remarks */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">费用与条款</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><label className="text-xs text-gray-500">运费</label><input type="number" step="0.01" value={freight} onChange={(e) => setFreight(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" /></div>
                <div><label className="text-xs text-gray-500">保险</label><input type="number" step="0.01" value={insurance} onChange={(e) => setInsurance(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" /></div>
                <div><label className="text-xs text-gray-500">付款方式</label><input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="T/T" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" /></div>
                <div><label className="text-xs text-gray-500">总计</label><div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-bold text-teal-700 min-h-[44px] flex items-center">{total.toFixed(2)}</div></div>
              </div>

              {/* Default Terms - independent field */}
              <div className="mt-3">
                <label className="text-xs text-gray-500 mb-1 block">默认条款 (Default Terms)</label>
                <textarea value={defaultTerms} onChange={(e) => setDefaultTerms(e.target.value)} placeholder="如：货物所有权在付款后转移，争议解决方式为..." rows={2} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
              </div>

              {/* Remarks - independent field */}
              <div className="mt-3">
                <label className="text-xs text-gray-500 mb-1 block">备注 (Remarks)</label>
                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="特殊说明、包装要求等..." rows={2} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
              </div>
            </div>
          </div>

          {/* ── Preview ── */}
          {showPreview && (
            <div className="lg:sticky lg:top-20 self-start">
              <div ref={previewRef} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-8 min-h-[700px] overflow-x-auto" style={{ fontFamily: "Arial, sans-serif" }}>
                <div className="min-w-[320px]">
                  {/* Header with Logo */}
                  <div className="flex items-start gap-4 mb-6">
                    {companyLogo && (
                      <img src={companyLogo} alt="Logo" className="w-16 h-16 object-contain rounded-lg border border-gray-100 shrink-0" />
                    )}
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-center text-teal-700">COMMERCIAL INVOICE</h1>
                      {companyName && <p className="text-center text-sm text-gray-500 mt-1">{companyName}</p>}
                    </div>
                  </div>

                  {/* From / To */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-semibold">FROM (Seller)</p>
                      <p className="font-bold text-gray-900">{companyName || "— 公司名称 —"}</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{companyAddress || "— 公司地址 —"}</p>
                      {/* Bank Details in Seller section */}
                      {bankDetails.bankName && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 mb-1">Banking Information</p>
                          {bankDetails.bankName && <p className="text-xs text-gray-600"><span className="font-medium">Bank:</span> {bankDetails.bankName}</p>}
                          {bankDetails.swiftCode && <p className="text-xs text-gray-600"><span className="font-medium">SWIFT:</span> {bankDetails.swiftCode}</p>}
                          {bankDetails.accountName && <p className="text-xs text-gray-600"><span className="font-medium">Account:</span> {bankDetails.accountName}</p>}
                          {bankDetails.accountNo && <p className="text-xs text-gray-600"><span className="font-medium">No.:</span> {bankDetails.accountNo}</p>}
                          {bankDetails.bankAddress && <p className="text-xs text-gray-600"><span className="font-medium">Address:</span> {bankDetails.bankAddress}</p>}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-semibold">TO (Buyer)</p>
                      <p className="font-bold text-gray-900">{clientName || "— 客户名称 —"}</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{clientAddress || "— 客户地址 —"}</p>
                    </div>
                  </div>

                  {/* Invoice Meta */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-sm">
                    <div><span className="text-gray-500">Invoice No: </span><span className="font-medium">{invoiceNo || "—"}</span></div>
                    <div><span className="text-gray-500">Date: </span><span className="font-medium">{invoiceDate}</span></div>
                  </div>

                  {/* Line Items Table */}
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
                          <td className="px-3 py-2 text-right font-medium">{(item.quantity * item.unitPrice).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="text-right space-y-1 text-sm">
                    <div className="flex justify-end gap-8"><span className="text-gray-500">Total Qty:</span><span className="font-medium">{totalQuantity}</span></div>
                    <div className="flex justify-end gap-8"><span className="text-gray-500">Subtotal:</span><span className="font-medium">{subtotal.toFixed(2)}</span></div>
                    {freight > 0 && <div className="flex justify-end gap-8"><span className="text-gray-500">Freight:</span><span>{freight.toFixed(2)}</span></div>}
                    {insurance > 0 && <div className="flex justify-end gap-8"><span className="text-gray-500">Insurance:</span><span>{insurance.toFixed(2)}</span></div>}
                    <div className="flex justify-end gap-8 pt-2 border-t-2 border-gray-300">
                      <span className="font-bold text-xl">TOTAL:</span>
                      <span className="font-bold text-xl text-teal-700">{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Terms */}
                  {paymentTerms && <p className="text-xs text-gray-500 mt-6"><span className="font-semibold text-gray-600">Payment Terms:</span> {paymentTerms}</p>}

                  {/* Default Terms - independently rendered */}
                  {defaultTerms && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Default Terms & Conditions:</p>
                      <p className="text-xs text-gray-500 whitespace-pre-wrap break-words">{defaultTerms}</p>
                    </div>
                  )}

                  {/* Remarks - independently rendered */}
                  {remarks && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Remarks:</p>
                      <p className="text-xs text-gray-500 whitespace-pre-wrap break-words">{remarks}</p>
                    </div>
                  )}

                  {/* Signature Blocks */}
                  <div className="mt-12 pt-6 border-t-2 border-gray-200">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="text-center">
                        <div className="h-20 border-b border-gray-300 mb-2" />
                        <p className="text-xs font-semibold text-gray-600">Buyer's Confirmation</p>
                        <p className="text-[10px] text-gray-400 mt-1">& Signature</p>
                        <p className="text-[10px] text-gray-400 mt-2">Date: ____________</p>
                      </div>
                      <div className="text-center">
                        <div className="h-20 border-b border-gray-300 mb-2" />
                        <p className="text-xs font-semibold text-gray-600">Seller's Authorized</p>
                        <p className="text-[10px] text-gray-400 mt-1">Signature & Stamp</p>
                        {companyName && <p className="text-[10px] text-gray-400 mt-2">{companyName}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Freemium Paywall Modal */}
      <PaywallModal
        isOpen={freemium.showPaywall}
        onClose={() => freemium.setShowPaywall(false)}
        title="免费试用次数已用尽"
        description="您已使用 2 次免费导出。登录解锁无限导出，或升级高级版解锁全部权益。"
        onLogin={() => { freemium.setShowPaywall(false); router.push("/login?callbackUrl=/tools/commercial-invoice"); }}
        onUpgrade={() => { freemium.setShowPaywall(false); router.push("/pricing"); }}
      />
    </div>
  );
}
