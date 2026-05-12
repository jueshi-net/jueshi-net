'use client';

import { useState, useRef } from 'react';
import { 
  FileText, Plus, Trash2, Download, 
  Package, Globe, Calculator, Info 
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Breadcrumb } from '@/components/breadcrumb';
import { AdSlot } from '@/components/ad-slot';
import { FAQSection } from '@/components/faq-section';

interface CustomsItem {
  id: string;
  nameEn: string;
  nameCn: string;
  hsCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  currency: string;
  origin: string;
  weight: number;
}

export default function CustomsGenerator() {
  const [form, setForm] = useState({
    shipperName: '',
    shipperAddress: '',
    shipperPhone: '',
    consigneeName: '',
    consigneeAddress: '',
    consigneePhone: '',
    invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    tradeTerm: 'FOB',
    paymentTerm: 'T/T',
    portOfLoading: '上海',
    portOfDischarge: '',
    destination: '',
  });

  const [items, setItems] = useState<CustomsItem[]>([
    {
      id: '1',
      nameEn: '',
      nameCn: '',
      hsCode: '',
      quantity: 1,
      unit: '件',
      unitPrice: 0,
      currency: 'USD',
      origin: '中国',
      weight: 0
    }
  ]);

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      nameEn: '',
      nameCn: '',
      hsCode: '',
      quantity: 1,
      unit: '件',
      unitPrice: 0,
      currency: 'USD',
      origin: '中国',
      weight: 0
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof CustomsItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalWeight = items.reduce((sum, item) => sum + (item.quantity * item.weight), 0);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('COMMERCIAL INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Invoice No: ${form.invoiceNo}`, 105, 28, { align: 'center' });
    doc.text(`Date: ${form.date}`, 105, 34, { align: 'center' });

    // Shipper/Consignee
    doc.setFontSize(11);
    doc.text('Shipper:', 14, 45);
    doc.setFontSize(10);
    doc.text(form.shipperName || '-', 14, 51);
    doc.text(form.shipperAddress || '-', 14, 56);
    doc.text(`Tel: ${form.shipperPhone || '-'}`, 14, 61);

    doc.setFontSize(11);
    doc.text('Consignee:', 110, 45);
    doc.setFontSize(10);
    doc.text(form.consigneeName || '-', 110, 51);
    doc.text(form.consigneeAddress || '-', 110, 56);
    doc.text(`Tel: ${form.consigneePhone || '-'}`, 110, 61);

    // Trade info
    doc.setFontSize(10);
    doc.text(`Trade Term: ${form.tradeTerm}`, 14, 72);
    doc.text(`Payment: ${form.paymentTerm}`, 80, 72);
    doc.text(`Loading Port: ${form.portOfLoading}`, 140, 72);

    // Items table
    const tableData = items.map(item => [
      item.hsCode || '-',
      `${item.nameEn}\n${item.nameCn}`,
      item.quantity.toString(),
      item.unit,
      `${item.currency} ${item.unitPrice.toFixed(2)}`,
      `${item.currency} ${(item.quantity * item.unitPrice).toFixed(2)}`,
      `${item.weight} kg`
    ]);

    (doc as any).autoTable({
      startY: 78,
      head: [['HS Code', 'Description', 'Qty', 'Unit', 'Unit Price', 'Amount', 'Weight']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9, cellPadding: 3 }
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.text(`Total Value: ${items[0]?.currency || 'USD'} ${totalValue.toFixed(2)}`, 110, finalY);
    doc.text(`Total Weight: ${totalWeight.toFixed(2)} kg`, 110, finalY + 7);

    // Signature
    doc.text('Signature: _______________', 14, finalY + 25);
    doc.text('Date: _______________', 110, finalY + 25);

    doc.save(`Customs_Invoice_${form.invoiceNo}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-500" />
              报关单生成器
            </h1>
            <p className="text-gray-500 mt-2">快速生成商业发票和报关单据</p>
          </div>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Download className="w-5 h-5" />
            生成 PDF
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shipper Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              发货人信息 (Shipper)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
                <input
                  type="text"
                  value={form.shipperName}
                  onChange={(e) => setForm(prev => ({ ...prev, shipperName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="输入公司英文名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                <textarea
                  value={form.shipperAddress}
                  onChange={(e) => setForm(prev => ({ ...prev, shipperAddress: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="详细地址"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                <input
                  type="text"
                  value={form.shipperPhone}
                  onChange={(e) => setForm(prev => ({ ...prev, shipperPhone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+86"
                />
              </div>
            </div>
          </div>

          {/* Consignee Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-500" />
              收货人信息 (Consignee)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
                <input
                  type="text"
                  value={form.consigneeName}
                  onChange={(e) => setForm(prev => ({ ...prev, consigneeName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="输入公司英文名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                <textarea
                  value={form.consigneeAddress}
                  onChange={(e) => setForm(prev => ({ ...prev, consigneeAddress: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="目的国详细地址"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                <input
                  type="text"
                  value={form.consigneePhone}
                  onChange={(e) => setForm(prev => ({ ...prev, consigneePhone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trade Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">贸易信息</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">发票号</label>
              <input
                type="text"
                value={form.invoiceNo}
                onChange={(e) => setForm(prev => ({ ...prev, invoiceNo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">贸易条款</label>
              <select
                value={form.tradeTerm}
                onChange={(e) => setForm(prev => ({ ...prev, tradeTerm: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="FOB">FOB</option>
                <option value="CIF">CIF</option>
                <option value="EXW">EXW</option>
                <option value="DDP">DDP</option>
                <option value="DAP">DAP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">付款方式</label>
              <select
                value={form.paymentTerm}
                onChange={(e) => setForm(prev => ({ ...prev, paymentTerm: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="T/T">T/T</option>
                <option value="L/C">L/C</option>
                <option value="D/P">D/P</option>
                <option value="D/A">D/A</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">装货港</label>
              <input
                type="text"
                value={form.portOfLoading}
                onChange={(e) => setForm(prev => ({ ...prev, portOfLoading: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="上海"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">卸货港</label>
              <input
                type="text"
                value={form.portOfDischarge}
                onChange={(e) => setForm(prev => ({ ...prev, portOfDischarge: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Los Angeles"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              货物清单
            </h2>
            <button
              onClick={addItem}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              添加项目
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">项目 {index + 1}</span>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">英文品名</label>
                    <input
                      type="text"
                      value={item.nameEn}
                      onChange={(e) => updateItem(item.id, 'nameEn', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      placeholder="Product Name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">中文品名</label>
                    <input
                      type="text"
                      value={item.nameCn}
                      onChange={(e) => updateItem(item.id, 'nameCn', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      placeholder="产品名称"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">HS 编码</label>
                    <input
                      type="text"
                      value={item.hsCode}
                      onChange={(e) => updateItem(item.id, 'hsCode', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">原产国</label>
                    <input
                      type="text"
                      value={item.origin}
                      onChange={(e) => updateItem(item.id, 'origin', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">数量</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">单位</label>
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    >
                      <option value="件">件</option>
                      <option value="箱">箱</option>
                      <option value="千克">千克</option>
                      <option value="米">米</option>
                      <option value="个">个</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">单价</label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">单重 (kg)</label>
                    <input
                      type="number"
                      value={item.weight}
                      onChange={(e) => updateItem(item.id, 'weight', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-500">
                  小计: {item.currency} {(item.quantity * item.unitPrice).toFixed(2)} | 重量: {(item.quantity * item.weight).toFixed(2)} kg
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-blue-900">合计</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  {items[0]?.currency || 'USD'} {totalValue.toFixed(2)}
                </div>
                <div className="text-sm text-blue-500">
                  总重量: {totalWeight.toFixed(2)} kg | 共 {items.length} 项
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <h4 className="font-semibold mb-1">报关提示</h4>
              <ul className="space-y-1">
                <li>• HS 编码建议提前与报关行确认</li>
                <li>• 品名需与实物标签一致</li>
                <li>• 申报价值应真实合理</li>
                <li>• 不同国家进口政策可能不同</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <FAQSection title="报关单生成常见问题" items={[
          {
            question: "商业发票 (Commercial Invoice) 和形式发票 (Proforma Invoice) 有什么区别？",
            answer: "商业发票是货物实际出运后的正式交易凭证，用于报关和结算；形式发票是成交前给买方参考的预估单据。本工具生成的是商业发票，适用于实际报关场景。",
          },
          {
            question: "HS 编码填错了怎么办？",
            answer: "HS 编码错误可能导致清关延误或罚款。建议在提交前通过海关官网或专业报关行核实 HS 编码。不同国家对同一商品的 HS 编码可能略有差异（前6位国际通用，后几位各国自定）。",
          },
          {
            question: "报关单上的申报价值需要和实际交易金额一致吗？",
            answer: "是的，申报价值必须真实反映交易金额。低报可能导致目的国海关查验、补税甚至罚款；高报可能导致进口方多缴关税。建议按照实际成交发票金额如实申报。",
          },
          {
            question: "FOB、CIF、EXW 这些贸易条款是什么意思？",
            answer: "FOB（船上交货）：卖方负责到装运港上船前的费用和风险。CIF（成本+保险+运费）：卖方还需承担海运费和保险费到目的港。EXW（工厂交货）：买方自行到卖方工厂提货。不同条款决定了费用和风险的分担点。",
          },
          {
            question: "这个工具生成的 PDF 可以直接用于报关吗？",
            answer: "本工具生成的商业发票可作为参考模板，但各国海关对单据格式有特定要求。正式报关建议咨询专业报关行或使用海关指定的申报系统。本工具适合快速制作初步单据和内部参考。",
          },
        ]} />

        {/* Ads */}
        <AdSlot placement="tool-customs-generator-bottom" className="mb-6" />
        <AdSlot placement="tool-bottom" className="mb-8" />
      </div>
    </div>
  );
}
