"use client";

import { useState } from "react";
import { FileText, Download, Plus, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface QuoteItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

export default function QuotePage() {
  const [company, setCompany] = useState("海外百宝箱有限公司");
  const [quoteNo, setQuoteNo] = useState(`QT-${Date.now().toString().slice(-6)}`);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState("");
  const [toName, setToName] = useState("");
  const [toCompany, setToCompany] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [paymentTerms, setPaymentTerms] = useState("100% T/T in advance");
  const [leadTime, setLeadTime] = useState("7-10 working days");
  const [items, setItems] = useState<QuoteItem[]>([
    { id: "1", description: "", quantity: "1", unitPrice: "" },
  ]);
  const [notes, setNotes] = useState("");

  const addItem = () => setItems([...items, { id: Date.now().toString(), description: "", quantity: "1", unitPrice: "" }]);
  const removeItem = (id: string) => { if (items.length > 1) setItems(items.filter((i) => i.id !== id)); };
  const updateItem = (id: string, field: keyof QuoteItem, value: string) => setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const subtotal = items.reduce((sum, i) => sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0), 0);

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text("QUOTATION", 105, 20, { align: "center" });
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(10);
    doc.text(`Quote No: ${quoteNo}`, 20, 32);
    doc.text(`Date: ${date}`, 150, 32);
    doc.text(`Valid Until: ${validUntil || "30 days"}`, 20, 39);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("From:", 20, 50);
    doc.setFont("helvetica", "normal");
    doc.text(company, 20, 56);

    doc.setFont("helvetica", "bold");
    doc.text("To:", 20, 66);
    doc.setFont("helvetica", "normal");
    doc.text(toName || "____________", 20, 72);
    doc.text(toCompany || "", 20, 78);

    doc.text(`Currency: ${currency}`, 150, 66);
    doc.text(`Payment: ${paymentTerms}`, 150, 72);
    doc.text(`Lead Time: ${leadTime}`, 150, 78);

    const tableData = items.filter((i) => i.description).map((i, idx) => [
      idx + 1, i.description, i.quantity, `${currency} ${parseFloat(i.unitPrice || "0").toFixed(2)}`,
      `${currency} ${((parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0)).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 88,
      head: [["#", "Description", "Qty", "Unit Price", "Amount"]],
      body: [...tableData, ["", "", "", "Subtotal:", `${currency} ${subtotal.toFixed(2)}`]],
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      styles: { fontSize: 9 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    if (notes) doc.text(`Notes: ${notes}`, 20, finalY);

    doc.setFontSize(9);
    doc.text("Authorized Signature: ________________", 20, 270);
    doc.text("Company Seal: ________________", 120, 270);

    doc.save(`Quotation_${quoteNo}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">报价单生成器</h1>
          <p className="text-gray-500 mt-1">专业Quotation制作，支持PDF导出</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">公司名</label><input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">报价编号</label><input value={quoteNo} onChange={(e) => setQuoteNo(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">日期</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">有效期至</label><input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">客户名称</label><input value={toName} onChange={(e) => setToName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">客户公司</label><input value={toCompany} onChange={(e) => setToCompany(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">货币</label><select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm"><option>USD</option><option>EUR</option><option>CNY</option><option>GBP</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">付款方式</label><input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">交货期</label><input value={leadTime} onChange={(e) => setLeadTime(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          </div>

          <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium text-gray-700">报价项目</label><button onClick={addItem} className="text-sm text-blue-600">+ 添加</button></div>
          {items.map((item, idx) => (
            <div key={item.id} className="flex gap-2 items-start">
              <span className="text-gray-400 pt-2 w-6 text-sm">{idx + 1}</span>
              <input value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} placeholder="项目描述" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", e.target.value)} className="w-20 px-3 py-2 border rounded-lg text-sm" />
              <input type="number" value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)} placeholder="单价" className="w-28 px-3 py-2 border rounded-lg text-sm" />
              <button onClick={() => removeItem(item.id)} className="p-2 text-red-400">×</button>
            </div>
          ))}
          <div className="text-right text-lg font-bold text-teal-600">合计: {currency} {subtotal.toFixed(2)}</div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <button onClick={generatePDF} className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium flex items-center justify-center gap-2"><Download className="w-5 h-5" /> 导出 PDF 报价单</button>
        </div>
      </div>
    </div>
  );
}
