"use client";

import { useState, useRef } from "react";
import { Receipt, Download, Plus, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AdSlot } from "@/components/ad-slot";
import { FAQSection } from "@/components/faq-section";

interface ReceiptItem {
  id: string;
  description: string;
  amount: string;
}

export default function ReceiptPage() {
  const [company, setCompany] = useState("海外百宝箱");
  const [receiptNo, setReceiptNo] = useState(`RCP-${Date.now().toString().slice(-6)}`);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [payer, setPayer] = useState("");
  const [items, setItems] = useState<ReceiptItem[]>([
    { id: "1", description: "", amount: "" },
  ]);
  const [paymentMethod, setPaymentMethod] = useState("银行转账");
  const [notes, setNotes] = useState("");

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: "", amount: "" }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof ReceiptItem, value: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const total = items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("收款收据", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text(`收据编号: ${receiptNo}`, 20, 35);
    doc.text(`日期: ${date}`, 150, 35);
    doc.text(`公司: ${company}`, 20, 42);

    doc.text(`付款人: ${payer || "____________"}`, 20, 55);
    doc.text(`付款方式: ${paymentMethod}`, 20, 62);

    const tableData = items
      .filter((i) => i.description)
      .map((i, idx) => [idx + 1, i.description, `¥${parseFloat(i.amount || "0").toFixed(2)}`]);

    autoTable(doc, {
      startY: 70,
      head: [["#", "项目", "金额"]],
      body: [...tableData, ["", "合计", `¥${total.toFixed(2)}`]],
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    if (notes) {
      doc.text(`备注: ${notes}`, 20, (doc as any).lastAutoTable.finalY + 15);
    }

    doc.text("收款人签字: ____________", 20, 260);
    doc.text("盖章: ____________", 120, 260);

    doc.save(`收据_${receiptNo}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">收据生成器</h1>
          <p className="text-gray-500 mt-1">快速生成专业收款收据，支持PDF导出</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">收据编号</label>
              <input value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">付款方式</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>银行转账</option>
                <option>支付宝</option>
                <option>微信支付</option>
                <option>现金</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">付款人</label>
            <input value={payer} onChange={(e) => setPayer(e.target.value)} placeholder="客户姓名/公司名" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">项目明细</label>
              <button onClick={addItem} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                <Plus className="w-4 h-4" /> 添加
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-3 items-start">
                  <span className="text-sm text-gray-400 pt-2 w-6">{idx + 1}</span>
                  <input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="项目描述"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => updateItem(item.id, "amount", e.target.value)}
                    placeholder="金额"
                    className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="text-right mt-3 text-lg font-bold text-blue-600">
              合计: ¥{total.toFixed(2)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="可选备注信息"
            />
          </div>

          <button
            onClick={generatePDF}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            导出 PDF 收据
          </button>
        </div>

        {/* Tool-specific ads */}
        <AdSlot placement="tool-bottom" className="mb-8" />

        {/* FAQ */}
        <FAQSection title="收据生成常见问题" items={[
          { question: "收据和发票有什么区别？", answer: "收据是收到款项的凭证，主要用于记录交易；发票是税务凭证，用于报税和抵扣。跨境贸易中通常需要商业发票，收据可作为补充凭证。" },
          { question: "收据可以作为报销凭证吗？", answer: "取决于公司财务政策。部分公司接受收据作为小额报销凭证，但大额支出通常需要正式发票。" },
          { question: "可以修改已生成的收据吗？", answer: "收据生成后可以重新编辑并导出新的 PDF。建议保留所有版本的记录，避免重复编号。" },
        ]} />
      </div>
    </div>
  );
}
