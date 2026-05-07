"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText, Download, Plus, Trash2, Upload, Save, Building2, User,
  Package, Receipt, Printer, Loader2, AlertCircle, CheckCircle,
  Globe, MapPin, Phone, Mail, Link2,
} from "lucide-react";
import { RelatedGuidesSection } from "@/components/related-guides-section";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useSession } from "next-auth/react";

// ==================== Types ====================
interface InvoiceItem {
  id: string;
  description: string;
  hsCode: string;
  origin: string;
  quantity: string;
  unit: string;
  unitPrice: string;
}

interface SavedInvoice {
  id: string;
  name: string;
  data: InvoiceFormData;
  createdAt: string;
}

interface InvoiceFormData {
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyZip: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  invoiceNo: string;
  invoiceDate: string;
  paymentTerms: string;
  tradeTerms: string;
  currency: string;
  notes: string;
  enableTax: boolean;
  taxRate: string;
  enableShipping: boolean;
  shippingCost: string;
  items: InvoiceItem[];
}

// ==================== Constants ====================
const CURRENCIES = [
  { code: "CNY", symbol: "¥", name: "人民币" },
  { code: "USD", symbol: "$", name: "美元" },
  { code: "EUR", symbol: "€", name: "欧元" },
  { code: "GBP", symbol: "£", name: "英镑" },
  { code: "JPY", symbol: "¥", name: "日元" },
  { code: "HKD", symbol: "HK$", name: "港币" },
  { code: "KRW", symbol: "₩", name: "韩元" },
  { code: "SGD", symbol: "S$", name: "新元" },
  { code: "AUD", symbol: "A$", name: "澳元" },
  { code: "CAD", symbol: "C$", name: "加元" },
];

const TRADE_TERMS = ["FOB", "CIF", "CNF", "EXW", "DDP", "DDU", "FCA"];
const UNITS = ["PCS", "SETS", "KG", "CTN", "BOX", "PALLET", "DOZEN", "ROLL", "METER"];

const DEFAULT_FORM: InvoiceFormData = {
  companyName: "海外百宝箱供应链有限公司",
  companyAddress: "深圳市福田区莲花街道福中社区",
  companyCity: "深圳",
  companyZip: "518000",
  companyPhone: "+86 755 8888 0000",
  companyEmail: "info@kjbxb.com",
  companyWebsite: "https://www.kjbxb.com",
  customerName: "",
  customerAddress: "",
  customerPhone: "",
  customerEmail: "",
  invoiceNo: `PI-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
  invoiceDate: new Date().toISOString().split("T")[0],
  paymentTerms: "T/T 30% advance, 70% before shipment",
  tradeTerms: "CIF",
  currency: "USD",
  notes: `1. This is a Proforma Invoice, not a commercial invoice.
2. Product specifications are subject to final confirmation.
3. Delivery time: 30 days after receiving advance payment.
4. Payment: Please remit to the bank account specified below.`,
  enableTax: false,
  taxRate: "0",
  enableShipping: false,
  shippingCost: "0",
  items: [
    { id: "1", description: "", hsCode: "", origin: "China", quantity: "100", unit: "PCS", unitPrice: "" },
  ],
};

// ==================== Component ====================
export default function ProformaInvoicePage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const [form, setForm] = useState<InvoiceFormData>(DEFAULT_FORM);
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [checkingSub, setCheckingSub] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Check subscription on mount
  useEffect(() => {
    if (isLoggedIn) {
      checkSubscription();
      loadSavedInvoices();
    }
  }, [isLoggedIn]);

  const checkSubscription = async () => {
    setCheckingSub(true);
    try {
      const res = await fetch("/api/subscription/check");
      const data = await res.json();
      if (data.success) setSubscribed(data.data.subscribed);
    } catch { /* ignore */ }
    setCheckingSub(false);
  };

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const updateForm = (field: keyof InvoiceFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Date.now().toString(),
        description: "",
        hsCode: "",
        origin: "China",
        quantity: "1",
        unit: "PCS",
        unitPrice: "",
      }],
    }));
  };

  const removeItem = (id: string) => {
    if (form.items.length > 1) {
      setForm(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, [field]: value } : i),
    }));
  };

  const currency = CURRENCIES.find(c => c.code === form.currency) || CURRENCIES[1];
  const subtotal = form.items.reduce((sum, i) => sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0), 0);
  const taxAmount = form.enableTax ? subtotal * (parseFloat(form.taxRate) || 0) / 100 : 0;
  const shippingAmount = form.enableShipping ? parseFloat(form.shippingCost) || 0 : 0;
  const total = subtotal + taxAmount + shippingAmount;

  const loadSavedInvoices = async () => {
    setLoadingSaved(true);
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      if (data.success) setSavedInvoices(data.data || []);
    } catch { /* ignore */ }
    setLoadingSaved(false);
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      showToast("error", lang === "zh" ? "请先登录后保存" : "Please login to save");
      return;
    }
    setSaving(true);
    try {
      const name = prompt(lang === "zh" ? "保存名称：" : "Save as name:");
      if (!name) { setSaving(false); return; }
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, data: form }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", lang === "zh" ? "保存成功！" : "Saved successfully!");
        loadSavedInvoices();
      } else {
        showToast("error", data.error || "Save failed");
      }
    } catch {
      showToast("error", lang === "zh" ? "保存失败" : "Save failed");
    }
    setSaving(false);
  };

  const handleLoad = async (invoice: SavedInvoice) => {
    setForm(invoice.data);
    setShowSaved(false);
    showToast("success", lang === "zh" ? `已加载: ${invoice.name}` : `Loaded: ${invoice.name}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/invoices?id=${id}`, { method: "DELETE" });
      loadSavedInvoices();
    } catch { /* ignore */ }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ===== FIX #2: Use html2canvas to capture preview as image, then put into PDF =====
  const generatePDF = async () => {
    showToast("success", lang === "zh" ? "正在生成PDF..." : "Generating PDF...");
    try {
      const el = previewRef.current;
      if (!el) return;

      // Temporarily hide watermark for clean PDF
      const watermarkEl = document.getElementById("invoice-watermark");
      if (watermarkEl) (watermarkEl as HTMLElement).style.display = "none";

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Restore watermark
      if (watermarkEl) (watermarkEl as HTMLElement).style.display = "flex";

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = 210; // A4 width mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const doc = new jsPDF("p", "mm", "a4");
      doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      doc.save(`Proforma_Invoice_${form.invoiceNo}.pdf`);
      showToast("success", lang === "zh" ? "PDF已下载" : "PDF downloaded");
    } catch (err) {
      console.error("PDF generation error:", err);
      showToast("error", lang === "zh" ? "生成失败" : "Generation failed");
    }
  };

  const handlePrint = () => {
    const el = previewRef.current;
    if (!el) return;
    const watermarkEl = document.getElementById("invoice-watermark");
    if (watermarkEl) (watermarkEl as HTMLElement).style.display = "none";
    window.print();
    if (watermarkEl) (watermarkEl as HTMLElement).style.display = "flex";
  };

  const t = (zh: string, en: string) => lang === "zh" ? zh : en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                {t("形式发票生成器", "Proforma Invoice Generator")}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {t("专业外贸发票制作工具 — 自定义信息、即时预览并下载PDF", "Professional foreign trade invoice tool — customize, preview & download PDF")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {checkingSub ? (
                <span className="text-xs text-gray-400"><Loader2 className="w-3 h-3 animate-spin inline" /> {t("检查中...", "Checking...")}</span>
              ) : isLoggedIn && subscribed ? (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />{t("已订阅 · 无水印", "Subscribed · No watermark")}
                </span>
              ) : isLoggedIn ? (
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{t("免费版 · 含水印", "Free · With watermark")}
                </span>
              ) : (
                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                  {t("未登录", "Not logged in")}
                </span>
              )}
              <button
                onClick={() => setLang(lang === "zh" ? "en" : "zh")}
                className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang === "zh" ? "Switch to English" : "切换中文"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* ===== Left: Editor Panel ===== */}
          <div className="space-y-4">
            {/* Save / Load */}
            <div className="flex gap-2">
              {isLoggedIn ? (
                <>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t("保存发票", "Save Invoice")}
                  </button>
                  <button onClick={() => setShowSaved(!showSaved)}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm font-medium">
                    {t("已保存", "Saved")}
                  </button>
                </>
              ) : (
                <div className="w-full py-2.5 bg-gray-50 text-gray-400 rounded-xl text-center text-sm flex items-center justify-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {t("登录后可以保存和调用发票模板", "Login to save & reuse invoice templates")}
                </div>
              )}
            </div>

            {showSaved && isLoggedIn && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                {loadingSaved ? (
                  <div className="text-center text-gray-400 py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
                ) : savedInvoices.length === 0 ? (
                  <div className="text-center text-gray-400 py-4">{t("暂无保存的发票", "No saved invoices yet")}</div>
                ) : (
                  <div className="space-y-2">
                    {savedInvoices.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{inv.name}</p>
                          <p className="text-xs text-gray-400">{new Date(inv.createdAt).toLocaleDateString("zh-CN")}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleLoad(inv)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
                            {t("加载", "Load")}
                          </button>
                          <button onClick={() => handleDelete(inv.id)}
                            className="px-2 py-1 text-xs text-red-400 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Company Info */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-900 hover:bg-gray-50">
                <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-blue-600" />{t("公司信息", "Company Info")}</span>
              </button>
              <div className="px-4 pb-4 space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t("公司名称", "Company Name")}</label>
                  <input value={form.companyName} onChange={e => updateForm("companyName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t("地址", "Address")}</label>
                  <input value={form.companyAddress} onChange={e => updateForm("companyAddress", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t("城市", "City")}</label>
                    <input value={form.companyCity} onChange={e => updateForm("companyCity", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t("邮编", "Zip")}</label>
                    <input value={form.companyZip} onChange={e => updateForm("companyZip", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1"><Phone className="w-3 h-3" />{t("电话", "Phone")}</label>
                    <input value={form.companyPhone} onChange={e => updateForm("companyPhone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" />{t("邮箱", "Email")}</label>
                    <input value={form.companyEmail} onChange={e => updateForm("companyEmail", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1"><Link2 className="w-3 h-3" />{t("网站", "Website")}</label>
                  <input value={form.companyWebsite} onChange={e => updateForm("companyWebsite", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                {/* FIX #1: Logo Upload */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t("公司Logo", "Company Logo")}</label>
                  <div onClick={() => logoInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-12 mx-auto object-contain" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                        <p className="text-xs text-gray-400">{t("点击上传Logo", "Click to upload logo")}</p>
                        <p className="text-xs text-gray-300">JPG, PNG</p>
                      </>
                    )}
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-900 hover:bg-gray-50">
                <span className="flex items-center gap-2"><User className="w-4 h-4 text-green-600" />{t("客户信息", "Customer Info")}</span>
              </button>
              <div className="px-4 pb-4 space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t("客户名称", "Customer Name")}</label>
                  <input value={form.customerName} onChange={e => updateForm("customerName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t("地址", "Address")}</label>
                  <input value={form.customerAddress} onChange={e => updateForm("customerAddress", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t("电话", "Phone")}</label>
                    <input value={form.customerPhone} onChange={e => updateForm("customerPhone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t("邮箱", "Email")}</label>
                    <input value={form.customerEmail} onChange={e => updateForm("customerEmail", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-900 hover:bg-gray-50">
                <span className="flex items-center gap-2"><Receipt className="w-4 h-4 text-purple-600" />{t("发票详情", "Invoice Details")}</span>
              </button>
              <div className="px-4 pb-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t("货币", "Currency")}</label>
                    <select value={form.currency} onChange={e => updateForm("currency", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code} {c.symbol})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t("发票号", "Invoice No.")}</label>
                    <input value={form.invoiceNo} onChange={e => updateForm("invoiceNo", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t("日期", "Date")}</label>
                    <input type="date" value={form.invoiceDate} onChange={e => updateForm("invoiceDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t("付款方式", "Payment")}</label>
                    <input value={form.paymentTerms} onChange={e => updateForm("paymentTerms", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t("贸易条款", "Trade Terms")}</label>
                    <select value={form.tradeTerms} onChange={e => updateForm("tradeTerms", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                      {TRADE_TERMS.map(tt => <option key={tt} value={tt}>{tt}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Settings */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-900 hover:bg-gray-50">
                <span className="flex items-center gap-2">{t("费用设置", "Fee Settings")}</span>
              </button>
              <div className="px-4 pb-4 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={form.enableTax} onChange={e => updateForm("enableTax", e.target.checked)}
                      className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                  <span className="text-sm text-gray-700">{t("启用税费", "Enable Tax")}</span>
                  {form.enableTax && (
                    <div className="flex items-center gap-1">
                      <input value={form.taxRate} onChange={e => updateForm("taxRate", e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-center" />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={form.enableShipping} onChange={e => updateForm("enableShipping", e.target.checked)}
                      className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                  <span className="text-sm text-gray-700">{t("启用运费", "Enable Shipping")}</span>
                  {form.enableShipping && (
                    <div className="flex items-center gap-1">
                      <input value={form.shippingCost} onChange={e => updateForm("shippingCost", e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-200 rounded text-sm text-center" />
                      <span className="text-sm text-gray-500">{form.currency}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-900 hover:bg-gray-50">
                <span className="flex items-center gap-2"><Package className="w-4 h-4 text-orange-600" />{t("商品项目", "Product Items")}</span>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{form.items.length}</span>
              </button>
              <div className="px-4 pb-4 space-y-2">
                <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-gray-400 px-2">
                  <span className="col-span-4">{t("商品描述", "Description")}</span>
                  <span className="col-span-2">{t("HS编码", "HS Code")}</span>
                  <span className="col-span-1">{t("数量", "Qty")}</span>
                  <span className="col-span-1">{t("单位", "Unit")}</span>
                  <span className="col-span-2">{t("单价", "Unit Price")}</span>
                  <span className="col-span-1">{t("操作", "Action")}</span>
                </div>
                {form.items.map((item, idx) => (
                  <div key={item.id} className="grid md:grid-cols-12 grid-cols-1 gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="md:col-span-4">
                      <input value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)}
                        placeholder={t("商品描述", "Description")}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <input value={item.hsCode} onChange={e => updateItem(item.id, "hsCode", e.target.value)}
                        placeholder={t("HS编码", "HS Code")}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="md:col-span-1">
                      <input type="number" value={item.quantity} onChange={e => updateItem(item.id, "quantity", e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="md:col-span-1">
                      <select value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)}
                        className="w-full px-1 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, "unitPrice", e.target.value)}
                        placeholder={t("单价", "Unit Price")}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500 hidden md:inline">{currency.symbol}{((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2)}</span>
                      <button onClick={() => removeItem(item.id)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={addItem}
                  className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-green-400 hover:text-green-600 flex items-center justify-center gap-1">
                  <Plus className="w-4 h-4" />{t("添加商品", "Add Item")}
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-900 hover:bg-gray-50">
                <span className="flex items-center gap-2">{t("备注", "Notes")}</span>
              </button>
              <div className="px-4 pb-4">
                <textarea value={form.notes} onChange={e => updateForm("notes", e.target.value)} rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={generatePDF}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-200">
                <Download className="w-5 h-5" />{t("下载发票", "Download Invoice")}
              </button>
              <button onClick={handlePrint}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-2 font-medium">
                <Printer className="w-5 h-5" />{t("打印", "Print")}
              </button>
            </div>
          </div>

          {/* ===== Right: Live Preview ===== */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:border-none">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between no-print">
                <h3 className="text-sm font-medium text-gray-700">{t("发票预览", "Invoice Preview")}</h3>
                <span className="text-xs text-gray-400">{t("实时更新", "Live Preview")}</span>
              </div>

              {/* FIX #1 + #2: Preview area with logo - captured by html2canvas for PDF */}
              <div ref={previewRef} className="relative p-6" style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
                {/* FIX #3: Watermark for non-subscribed users */}
                {!subscribed && (
                  <div id="invoice-watermark" className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="text-6xl font-black text-gray-100 opacity-40 -rotate-12 select-none">海外百宝箱</span>
                  </div>
                )}

                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                  <div className="flex-1">
                    {/* FIX #1: Show logo in preview */}
                    {logoPreview && (
                      <img src={logoPreview} alt="Logo" className="h-10 mb-2 object-contain" />
                    )}
                    <h2 className="text-lg font-bold text-gray-900">{form.companyName}</h2>
                    <p className="text-xs text-gray-500 mt-1">{form.companyAddress}</p>
                    <p className="text-xs text-gray-500">{form.companyCity} {form.companyZip}</p>
                    <p className="text-xs text-gray-500">{form.companyPhone}</p>
                    <p className="text-xs text-gray-500">{form.companyEmail}</p>
                    <p className="text-xs text-blue-600">{form.companyWebsite}</p>
                  </div>
                  <div className="text-right ml-4">
                    <h1 className="text-2xl font-bold text-blue-600">PROFORMA INVOICE</h1>
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      <p><span className="text-gray-400">No.</span> {form.invoiceNo}</p>
                      <p><span className="text-gray-400">Date:</span> {form.invoiceDate}</p>
                      <p><span className="text-gray-400">Payment:</span> {form.paymentTerms}</p>
                      <p><span className="text-gray-400">Terms:</span> {form.tradeTerms}</p>
                    </div>
                  </div>
                </div>

                {/* Shipper / Consignee */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-600 mb-1">{t("发货方 Shipper", "Shipper")}</p>
                    <p className="text-sm font-medium text-gray-900">{form.companyName}</p>
                    <p className="text-xs text-gray-500">{form.companyAddress}, {form.companyCity}</p>
                    <p className="text-xs text-gray-500">{form.companyPhone}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-600 mb-1">{t("收货方 Consignee", "Consignee")}</p>
                    <p className="text-sm font-medium text-gray-900">{form.customerName || "—"}</p>
                    <p className="text-xs text-gray-500">{form.customerAddress || "—"}</p>
                    <p className="text-xs text-gray-500">{form.customerPhone || form.customerEmail || "—"}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className="py-2 px-2 text-left">#</th>
                        <th className="py-2 px-2 text-left">{t("商品描述", "Description")}</th>
                        <th className="py-2 px-2 text-center">{t("HS编码", "HS Code")}</th>
                        <th className="py-2 px-2 text-center">{t("原产地", "Origin")}</th>
                        <th className="py-2 px-2 text-center">{t("数量", "Qty")}</th>
                        <th className="py-2 px-2 text-center">{t("单位", "Unit")}</th>
                        <th className="py-2 px-2 text-right">{t("单价", "Unit Price")}</th>
                        <th className="py-2 px-2 text-right">{t("总额", "Amount")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.filter(i => i.description).map((item, idx) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-2 px-2 text-gray-400">{idx + 1}</td>
                          <td className="py-2 px-2">{item.description}</td>
                          <td className="py-2 px-2 text-center text-gray-500">{item.hsCode || "—"}</td>
                          <td className="py-2 px-2 text-center text-gray-500">{item.origin}</td>
                          <td className="py-2 px-2 text-center">{item.quantity}</td>
                          <td className="py-2 px-2 text-center">{item.unit}</td>
                          <td className="py-2 px-2 text-right">{currency.symbol}{parseFloat(item.unitPrice || "0").toFixed(2)}</td>
                          <td className="py-2 px-2 text-right font-medium">{currency.symbol}{((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-48 space-y-1 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>{t("小计", "Subtotal")}:</span>
                      <span>{currency.symbol}{subtotal.toFixed(2)}</span>
                    </div>
                    {form.enableTax && (
                      <div className="flex justify-between text-gray-600">
                        <span>{t("税费", "Tax")} ({form.taxRate}%):</span>
                        <span>{currency.symbol}{taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {form.enableShipping && (
                      <div className="flex justify-between text-gray-600">
                        <span>{t("运费", "Shipping")}:</span>
                        <span>{currency.symbol}{shippingAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-blue-600 border-t border-blue-200 pt-1">
                      <span>{t("总计", "TOTAL")}:</span>
                      <span>{currency.symbol}{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {form.notes && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-1">{t("备注 Notes:", "Notes:")}</p>
                    <p className="text-xs text-gray-500 whitespace-pre-line">{form.notes}</p>
                  </div>
                )}

                {/* Signature */}
                <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
                  {t("授权签名 Authorized Signature: ____________", "Authorized Signature: ____________")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <RelatedGuidesSection slugs={["commercial-invoice-how-to-fill", "packing-list-how-to-make"]} />
      </div>
    </div>
  );
}
