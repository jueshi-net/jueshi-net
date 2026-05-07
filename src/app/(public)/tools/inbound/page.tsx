"use client";

import { useState } from "react";
import { FileText, Download, Plus, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InboundItem {
  id: string;
  name: string;
  quantity: string;
  weight: string;
  volume: string;
  condition: string;
}

export default function InboundPage() {
  const [warehouse, setWarehouse] = useState("深圳仓");
  const [inboundNo, setInboundNo] = useState(`INB-${Date.now().toString().slice(-6)}`);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [carrier, setCarrier] = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const [receiver, setReceiver] = useState("");
  const [items, setItems] = useState<InboundItem[]>([
    { id: "1", name: "", quantity: "1", weight: "", volume: "", condition: "完好" },
  ]);
  const [notes, setNotes] = useState("");

  const addItem = () => setItems([...items, { id: Date.now().toString(), name: "", quantity: "1", weight: "", volume: "", condition: "完好" }]);
  const removeItem = (id: string) => { if (items.length > 1) setItems(items.filter((i) => i.id !== id)); };
  const updateItem = (id: string, field: keyof InboundItem, value: string) => setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const totalQty = items.reduce((sum, i) => sum + (parseInt(i.quantity) || 0), 0);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("入库单", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`入库单号: ${inboundNo}`, 20, 32);
    doc.text(`日期: ${date}`, 150, 32);
    doc.text(`仓库: ${warehouse}`, 20, 39);

    doc.text(`承运商: ${carrier || "____________"}`, 20, 50);
    doc.text(`运单号: ${trackingNo || "____________"}`, 120, 50);
    doc.text(`接收人: ${receiver || "____________"}`, 20, 57);

    const tableData = items.filter((i) => i.name).map((i, idx) => [
      idx + 1, i.name, i.quantity, `${i.weight} kg`, i.volume, i.condition,
    ]);

    autoTable(doc, {
      startY: 65,
      head: [["#", "品名", "数量", "重量", "体积", "状态"]],
      body: [...tableData, ["", `合计: ${totalQty} 件`, "", "", "", ""]],
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
    });

    if (notes) doc.text(`备注: ${notes}`, 20, 260);
    doc.text("仓库签字: ____________", 20, 275);
    doc.save(`入库单_${inboundNo}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">入库单生成器</h1>
          <p className="text-gray-500 mt-1">仓库入库单据制作，支持PDF导出</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">仓库</label><select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm"><option>深圳仓</option><option>广州仓</option><option>义乌仓</option><option>海外仓</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">入库单号</label><input value={inboundNo} onChange={(e) => setInboundNo(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">日期</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">接收人</label><input value={receiver} onChange={(e) => setReceiver(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">承运商</label><input value={carrier} onChange={(e) => setCarrier(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">运单号</label><input value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          </div>

          <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium text-gray-700">入库明细</label><button onClick={addItem} className="text-sm text-blue-600">+ 添加</button></div>
          {items.map((item, idx) => (
            <div key={item.id} className="flex gap-2 items-start">
              <span className="text-gray-400 pt-2 w-6 text-sm">{idx + 1}</span>
              <input value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)} placeholder="品名" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", e.target.value)} className="w-16 px-3 py-2 border rounded-lg text-sm" />
              <input value={item.weight} onChange={(e) => updateItem(item.id, "weight", e.target.value)} placeholder="kg" className="w-20 px-3 py-2 border rounded-lg text-sm" />
              <select value={item.condition} onChange={(e) => updateItem(item.id, "condition", e.target.value)} className="w-24 px-3 py-2 border rounded-lg text-sm"><option>完好</option><option>破损</option><option>缺失</option></select>
              <button onClick={() => removeItem(item.id)} className="p-2 text-red-400">×</button>
            </div>
          ))}
          <div className="text-right text-lg font-bold text-green-600">合计: {totalQty} 件</div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <button onClick={generatePDF} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center justify-center gap-2"><Download className="w-5 h-5" /> 导出 PDF 入库单</button>
        </div>
      </div>
    </div>
  );
}
