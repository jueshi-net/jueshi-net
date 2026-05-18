"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Printer, Tag, Plus, Trash2, FileText, Loader2, Eye, Code } from "lucide-react";

interface LabelItem {
  id: string;
  trackingNo: string;
  channel: string;
  productName: string;
  qty: number;
  weight: string;
}

export default function ShippingLabelClient() {
  const [companyName, setCompanyName] = useState("");
  const [paperSize, setPaperSize] = useState("100x150");
  const [printCopies, setPrintCopies] = useState(1);
  const [labelItems, setLabelItems] = useState<LabelItem[]>([{ id: "1", trackingNo: "", channel: "", productName: "", qty: 1, weight: "" }]);
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const addLabel = () => {
    setLabelItems([...labelItems, { id: `${Date.now()}`, trackingNo: "", channel: "", productName: "", qty: 1, weight: "" }]);
  };

  const removeLabel = (id: string) => {
    if (labelItems.length <= 1) return;
    setLabelItems(labelItems.filter((l) => l.id !== id));
  };

  const updateLabel = (id: string, field: keyof LabelItem, value: string | number) => {
    setLabelItems(labelItems.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const data = { companyName, paperSize, printCopies, labelItems };
      const res = await fetch("/api/me/tool-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolKey: "shipping_label",
          title: `唛头标签 ${new Date().toLocaleDateString("zh-CN")}`,
          dataJson: JSON.stringify(data),
        }),
      });
      if (res.ok) setSaved(true);
      else alert("保存失败");
    } catch { alert("保存失败"); }
    setSaving(false);
  };

  const handlePrint = () => {
    const content = previewRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Shipping Labels</title>
      <style>
        body { margin: 0; padding: 10px; font-family: Arial, sans-serif; }
        .label { border: 2px solid #333; padding: 10px; margin: 5px; width: ${paperSize === "100x150" ? "100mm" : paperSize === "4x6" ? "4in" : "100mm"}; page-break-inside: avoid; }
        .label-title { text-align: center; font-size: 14px; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 8px; }
        .label-row { display: flex; margin: 4px 0; font-size: 12px; }
        .label-label { width: 80px; font-weight: bold; }
        .label-value { flex: 1; }
        .label-big { text-align: center; font-size: 18px; font-weight: bold; margin: 8px 0; }
      </style></head><body>${content.innerHTML}</body></html>`);
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
              <Tag className="w-5 h-5 text-purple-600 shrink-0" />
              <span className="truncate">唛头标签打印</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setShowPreview(!showPreview)} className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]">
              {showPreview ? <><Code className="w-4 h-4" /> 编辑</> : <><Eye className="w-4 h-4" /> 预览</>}
            </button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 min-h-[44px]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存
            </button>
            <button onClick={handlePrint} className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 min-h-[44px]">
              <Printer className="w-4 h-4" /> 打印
            </button>
          </div>
        </div>
      </header>

      {saved && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">✅ 已保存</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
          {/* Form */}
          <div className="space-y-4">
            {/* Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" /> 标签设置
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="公司名/发货方" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                <select value={paperSize} onChange={(e) => setPaperSize(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]">
                  <option value="100x150">100×150mm (热敏)</option>
                  <option value="4x6">4×6英寸</option>
                  <option value="100x100">100×100mm (方)</option>
                </select>
                <div><label className="text-xs text-gray-500">打印份数</label><input type="number" min={1} max={99} value={printCopies} onChange={(e) => setPrintCopies(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" /></div>
              </div>
            </div>

            {/* Labels */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-700">标签明细</h2>
                <button onClick={addLabel} className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 min-h-[44px]">
                  <Plus className="w-4 h-4" /> 添加
                </button>
              </div>
              <div className="space-y-3">
                {labelItems.map((item) => (
                  <div key={item.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input value={item.trackingNo} onChange={(e) => updateLabel(item.id, "trackingNo", e.target.value)} placeholder="追踪号" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                      <input value={item.channel} onChange={(e) => updateLabel(item.id, "channel", e.target.value)} placeholder="渠道" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                      <input value={item.productName} onChange={(e) => updateLabel(item.id, "productName", e.target.value)} placeholder="品名" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                      <div className="flex gap-2">
                        <input type="number" value={item.qty} onChange={(e) => updateLabel(item.id, "qty", parseInt(e.target.value) || 1)} className="w-16 px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                        <input value={item.weight} onChange={(e) => updateLabel(item.id, "weight", e.target.value)} placeholder="重量" className="flex-1 px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button onClick={() => removeLabel(item.id)} className="text-xs text-red-400 hover:text-red-600 inline-flex items-center gap-1 min-h-[32px]">
                        <Trash2 className="w-3 h-3" /> 删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="lg:sticky lg:top-20 self-start">
              <div ref={previewRef} className="space-y-4">
                {Array.from({ length: Math.min(printCopies, 5) }).map((_, copyIdx) => (
                  <div key={copyIdx}>
                    {printCopies > 1 && <p className="text-xs text-gray-400 mb-1">副本 {copyIdx + 1}/{printCopies}</p>}
                    {labelItems.map((item) => (
                      <div key={`${item.id}-${copyIdx}`} className="bg-white rounded-xl border-2 border-gray-800 p-4 mb-3" style={{ maxWidth: "280px" }}>
                        <div className="text-center font-bold text-sm border-b-2 border-gray-800 pb-2 mb-3">
                          {companyName || "公司名"}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex"><span className="font-bold w-16 shrink-0">追踪号:</span><span className="break-all">{item.trackingNo || "—"}</span></div>
                          <div className="flex"><span className="font-bold w-16 shrink-0">渠道:</span><span>{item.channel || "—"}</span></div>
                          <div className="flex"><span className="font-bold w-16 shrink-0">品名:</span><span className="break-words">{item.productName || "—"}</span></div>
                          <div className="flex"><span className="font-bold w-16 shrink-0">数量:</span><span>{item.qty}</span></div>
                          <div className="flex"><span className="font-bold w-16 shrink-0">重量:</span><span>{item.weight || "—"}</span></div>
                        </div>
                        {printCopies > 1 && <div className="text-center text-xs text-gray-400 mt-2">{copyIdx + 1}/{printCopies}</div>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
