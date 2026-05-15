'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, Image, Crown, Plus, Trash2, ChevronDown, Eye, Palette, AlertTriangle, Settings, QrCode, Barcode, Save, Package, FileText } from 'lucide-react';
import { getLabelType, getLabelTemplate, labelTypes, labelSizes, labelStyles } from '@/lib/labels/label-types';
import { usePermissions, authorizeExportClient, createPermissionHelpers } from '@/lib/auth/client-permissions';
import { permissionMessages } from '@/lib/membership/permissions';
import { saveLabelDraft, getLabelDraft, getAllLabelDrafts, deleteLabelDraft } from '@/lib/labels/label-storage';
import { AdSlot } from '@/components/ad-slot';
import { Breadcrumb } from '@/components/breadcrumb';
import { FAQSection } from '@/components/faq-section';

import { buildLabelA4ExportHTML, A4_WIDTH, A4_HEIGHT, A4_EXPORT_SCALE } from '@/lib/labels/a4-export-renderer';

const DISCLAIMER = "本工具生成的是通用唛头、箱贴、仓库标签和信息面单，不是任何承运商或平台的官方运单。正式快递面单、平台标签、FBA 标签等，请以承运商、平台、仓库或服务商系统生成为准。";

type MobileTab = 'edit' | 'preview' | 'export';

export default function LabelMakerPage() {
  const perms = usePermissions();
  const p = createPermissionHelpers(perms);
  const [selectedType, setSelectedType] = useState('shipping-mark');
  const [selectedSize, setSelectedSize] = useState('a4-full');
  const [selectedStyle, setSelectedStyle] = useState('black-white');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(true);
  const [showBatch, setShowBatch] = useState(false);
  const [batchItems, setBatchItems] = useState<Record<string, any>[]>([]);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('edit');
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  const labelType = getLabelType(selectedType);
  const template = getLabelTemplate(selectedType);
  const size = labelSizes.find(s => s.id === selectedSize) || labelSizes[0];
  const style = labelStyles.find(s => s.id === selectedStyle) || labelStyles[0];

  useEffect(() => {
    const draft = getLabelDraft(selectedType);
    if (draft) {
      setFormData(draft.data || {});
      if (draft.labelSize) setSelectedSize(draft.labelSize);
      if (draft.style) setSelectedStyle(draft.style);
      setDraftId(draft.id);
    }
  }, [selectedType]);

  const updateField = useCallback((key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSaveDraft = useCallback(() => {
    const saved = saveLabelDraft({
      type: selectedType, title: labelType?.titleZh || selectedType,
      labelSize: selectedSize, data: formData, style: selectedStyle,
    }, perms.limits.maxDrafts);
    setDraftId(saved.id);
    alert('草稿已保存');
  }, [selectedType, labelType, selectedSize, formData, selectedStyle, perms.limits.maxDrafts]);

  const handlePrint = useCallback(() => { window.print(); }, []);

  // PNG export: Fixed A4 canvas engine v1.12.8 (div-based, Safari-compatible)
  const handleExportPNG = useCallback(async () => {
    setExporting(true);
    try {
      const html = buildLabelA4ExportHTML({
        type: selectedType,
        titleZh: labelType?.titleZh || selectedType,
        titleEn: labelType?.titleEn || '',
        formData,
        style: { primaryColor: style.primaryColor, borderColor: style.borderColor },
        showBarcode: template?.showBarcode,
        showQrCode: template?.showQrCode,
        canRemoveBranding: p.canRemoveBranding(),
      });

      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = `
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        width: ${A4_WIDTH}px !important;
        min-width: ${A4_WIDTH}px !important;
        max-width: ${A4_WIDTH}px !important;
        z-index: -99999 !important;
        pointer-events: none !important;
      `;
      tempDiv.style.transform = 'translateY(-10000px)';
      document.body.appendChild(tempDiv);
      tempDiv.innerHTML = html;
      await new Promise(r => setTimeout(r, 500));

      const html2canvas = (await import('html2canvas')).default;
      const a4Page = tempDiv.querySelector('.a4-page') as HTMLElement;
      if (!a4Page) throw new Error('A4 page element not found in temp div');

      const rect = a4Page.getBoundingClientRect();
      console.log(`[Label PNG Export] .a4-page rect: ${rect.width}×${rect.height}`);

      const canvas = await html2canvas(a4Page, {
        backgroundColor: '#ffffff', scale: A4_EXPORT_SCALE, useCORS: true, logging: false, allowTaint: true,
        foreignObjectRendering: false, scrollX: 0, scrollY: 0, x: 0, y: 0,
      });
      document.body.removeChild(tempDiv);

      const cw = canvas.width; const ch = canvas.height;
      console.log(`[Label PNG Export] Canvas: ${cw}×${ch}, ratio: ${(cw/ch).toFixed(3)}`);

      const now = new Date();
      const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
      const link = document.createElement('a');
      link.download = `label-${labelType?.titleEn || 'label'}_${ts}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error: any) {
      console.error('Label PNG export failed:', error);
      const tempDiv = document.querySelector('[style*="translateY(-10000px)"]');
      if (tempDiv && tempDiv.parentNode) document.body.removeChild(tempDiv);
      alert(`导出失败：${error?.message || '未知错误'}，请尝试使用浏览器打印功能导出 PDF。`);
    } finally {
      setExporting(false);
    }
  }, [selectedType, labelType, formData, style, template]);

  const addBatchItem = () => {
    const limit = p.getLabelBatchLimit();
    if (batchItems.length >= limit) { alert(`批量生成上限：${limit} 张`); return; }
    setBatchItems(prev => [...prev, { cartonNo: `${batchItems.length + 1}` }]);
  };
  const updateBatchItem = (idx: number, key: string, value: string) => {
    setBatchItems(prev => { const n = [...prev]; n[idx] = { ...n[idx], [key]: value }; return n; });
  };
  const removeBatchItem = (idx: number) => {
    setBatchItems(prev => prev.filter((_, i) => i !== idx).length > 0 ? prev.filter((_, i) => i !== idx) : []);
  };

  const sizeOptions = labelSizes.filter(s => !s.memberOnly || p.canUseCustomStyle());
  const styleOptions = p.canUseCustomStyle() ? labelStyles : [labelStyles[0]];

  const tabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'edit', label: '填写资料', icon: <Settings className="w-4 h-4" /> },
    { id: 'preview', label: '预览', icon: <Eye className="w-4 h-4" /> },
    { id: 'export', label: '导出', icon: <Download className="w-4 h-4" /> },
  ];

  return (
    <>
      <style jsx global>{`
        @media print {
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden !important; display: none !important; }
          [data-label-preview], [data-label-preview] * { visibility: visible !important; }
          [data-label-preview] {
            position: absolute !important; left: 0 !important; top: 0 !important;
            width: 100% !important; max-width: 210mm !important; margin: 0 auto !important;
            padding: 15mm !important; box-shadow: none !important; border: none !important;
            background: white !important;
          }
          @page { margin: 10mm; }
        }
      `}</style>

      {/* Hidden export container */}
      <div ref={exportContainerRef} className="hidden" aria-hidden="true" />

      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="bg-white border-b sticky top-0 z-40 print:hidden">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tools" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> 返回
              </Link>
              <div>
                <h1 className="font-bold text-gray-900">唛头面单生成器</h1>
                <p className="text-xs text-gray-400">Shipping Mark & Label Generator</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <button onClick={handleSaveDraft} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">
                <Save className="w-4 h-4" /> 保存草稿
              </button>
              <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg">
                <Printer className="w-4 h-4" /> 打印/PDF
              </button>
              <button onClick={handleExportPNG} disabled={exporting} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg disabled:opacity-50">
                <Image className="w-4 h-4" /> {exporting ? '生成中...' : 'PNG'}
              </button>
              <span className={`px-2 py-0.5 rounded text-xs ${perms.role === 'member' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                {perms.role === 'member' ? '会员' : perms.role === 'user' ? '用户' : '游客'}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Tab bar */}
        <div className="lg:hidden sticky top-[57px] z-30 bg-white border-b print:hidden">
          <div className="flex">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setMobileTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors ${mobileTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="mb-3 print:hidden"><Breadcrumb /></div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 print:hidden">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">{DISCLAIMER}</p>
            </div>
          </div>
          {template?.disclaimer && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 print:hidden">
              <p className="text-xs text-red-700">⚠️ {template.disclaimer}</p>
            </div>
          )}

          <div className="flex gap-4 print:block">
            {/* Left: Controls - desktop always, mobile only edit tab */}
            <div className={`w-full lg:w-5/12 print:hidden space-y-4 ${mobileTab === 'edit' ? 'block' : 'hidden lg:block'}`}>
              {/* Template selector */}
              <div className="bg-white rounded-xl border p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Package className="w-4 h-4" /> 选择标签类型</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                  {labelTypes.map(lt => (
                    <button key={lt.type} onClick={() => setSelectedType(lt.type)}
                      className={`p-3 rounded-lg border text-left transition-colors text-sm ${selectedType === lt.type ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="text-lg mb-1">{lt.icon}</div>
                      <div className="font-medium text-gray-900 truncate">{lt.titleZh}</div>
                      <div className="text-xs text-gray-400 truncate">{lt.titleEn}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size & Style */}
              <div className="bg-white rounded-xl border p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Settings className="w-4 h-4" /> 尺寸与风格</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">尺寸</label>
                    <select value={selectedSize} onChange={e => setSelectedSize(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                      {sizeOptions.map(s => <option key={s.id} value={s.id}>{s.label} ({s.width}×{s.height}mm)</option>)}
                    </select>
                  </div>
                  {p.canUseCustomStyle() && (
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">风格</label>
                      <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                        {styleOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  )}
                  {p.canUploadLogo() && (
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">公司 Logo</label>
                      <input type="file" accept="image/*" className="w-full text-sm"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) { const reader = new FileReader(); reader.onload = ev => updateField('logoUrl', ev.target?.result); reader.readAsDataURL(file); }
                        }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Form fields */}
              {template && (
                <div className="bg-white rounded-xl border p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">填写信息</h3>
                  <div className="space-y-3">
                    {template.fields.map(f => (
                      <div key={f.key}>
                        <label className="text-xs text-gray-500 mb-1 block">{f.label} {f.required && <span className="text-red-500">*</span>}</label>
                        {f.type === 'textarea' ? (
                          <textarea value={formData[f.key] || ''} onChange={e => updateField(f.key, e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder={f.placeholder} />
                        ) : f.type === 'select' ? (
                          <select value={formData[f.key] || ''} onChange={e => updateField(f.key, e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm">
                            <option value="">请选择</option>
                            {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : f.type === 'number' ? (
                          <input type="number" value={formData[f.key] || ''} onChange={e => updateField(f.key, e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm" placeholder={f.placeholder} />
                        ) : (
                          <input type="text" value={formData[f.key] || ''} onChange={e => updateField(f.key, e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm" placeholder={f.placeholder} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Barcode/QR source */}
              {template && (template.showBarcode || template.showQrCode) && (
                <div className="bg-white rounded-xl border p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Barcode className="w-4 h-4" /> 条码/二维码内容</h3>
                  <select value={formData.barcodeSource || 'custom'} onChange={e => updateField('barcodeSource', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm mb-2">
                    <option value="custom">自定义内容</option>
                    {template.fields.filter(f => f.type !== 'select').map(f => (
                      <option key={f.key} value={f.key}>{f.label}</option>
                    ))}
                  </select>
                  {(formData.barcodeSource === 'custom' || !formData.barcodeSource) && (
                    <input type="text" value={formData.barcodeValue || ''} onChange={e => updateField('barcodeValue', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="输入条码/二维码内容" />
                  )}
                </div>
              )}

              {/* Batch generation */}
              {p.canRemoveBranding() && (
                <div className="bg-white rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">批量生成</h3>
                    <button onClick={() => setShowBatch(!showBatch)} className="text-xs text-blue-600">{showBatch ? '收起' : '展开'}</button>
                  </div>
                  {showBatch && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button onClick={addBatchItem} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg">
                          <Plus className="w-3 h-3" /> 添加 ({batchItems.length}/{p.getLabelBatchLimit()})
                        </button>
                      </div>
                      {batchItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input type="text" value={item.cartonNo || ''} onChange={e => updateBatchItem(idx, 'cartonNo', e.target.value)}
                            className="flex-1 px-2 py-1 border rounded text-xs" placeholder="箱号" />
                          <button onClick={() => removeBatchItem(idx)} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <AdSlot placement="label-maker-bottom" variant="card" className="print:hidden" />

              <div className="text-center text-xs text-gray-400">
                游客最多保存 3 份草稿 | <Link href="/tools/documents" className="text-blue-500">去单据生成器 →</Link>
              </div>
            </div>

            {/* Preview - desktop always, mobile preview/export tabs */}
            <div className={`w-full lg:w-7/12 print:w-full ${(mobileTab === 'preview' || mobileTab === 'export') ? 'block' : 'hidden lg:block'}`}>
              <div className="lg:sticky lg:top-20">
                {mobileTab === 'export' && (
                  <div className="flex flex-wrap gap-2 mb-4 print:hidden">
                    <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                      <Printer className="w-4 h-4" /> 打印/PDF
                    </button>
                    <button onClick={handleExportPNG} disabled={exporting} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium disabled:opacity-50">
                      <Image className="w-4 h-4" /> {exporting ? '生成中...' : 'PNG'}
                    </button>
                  </div>
                )}

                {/* Label preview */}
                <div ref={previewRef} data-label-preview="true"
                  className="bg-white border rounded-xl p-6 print:p-0 print:border-0 print:shadow-none"
                  style={{ fontFamily: style.showBorder ? 'sans-serif' : 'sans-serif' }}>
                  <div className="border-2 p-4" style={{ borderColor: style.borderColor }}>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3" style={{ borderColor: style.borderColor, borderBottomWidth: 2, paddingBottom: 8 }}>
                      <div>
                        {formData.logoUrl && <img src={formData.logoUrl} alt="Logo" className="h-8 mb-1" />}
                        <h2 className="text-lg font-bold" style={{ color: style.primaryColor }}>{labelType?.titleZh || ''}</h2>
                        <p className="text-xs text-gray-500">{labelType?.titleEn || ''}</p>
                      </div>
                      <div className="text-right text-xs">
                        <p>{formData.destination || formData.destCountry || ''}</p>
                        {formData.cartonNo && <p className="font-bold text-base">C/No. {formData.cartonNo}</p>}
                        {formData.combinedNo && <p className="font-bold">合箱: {formData.combinedNo}</p>}
                      </div>
                    </div>

                    {/* Main content */}
                    <div className="space-y-2 text-sm">
                      {selectedType === 'shipping-mark' && (
                        <>
                          {formData.mainMark && <div className="p-2 border rounded"><p className="text-xs text-gray-500">Main Mark</p><p className="font-bold">{formData.mainMark}</p></div>}
                          {formData.sideMark && <div className="p-2 border rounded"><p className="text-xs text-gray-500">Side Mark</p><p>{formData.sideMark}</p></div>}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {formData.grossWeight && <div><span className="text-gray-500">G.W.: </span><span className="font-medium">{formData.grossWeight}</span></div>}
                            {formData.netWeight && <div><span className="text-gray-500">N.W.: </span><span className="font-medium">{formData.netWeight}</span></div>}
                            {formData.measurement && <div><span className="text-gray-500">MEAS: </span><span className="font-medium">{formData.measurement}</span></div>}
                            {formData.origin && <div><span className="text-gray-500">Origin: </span><span className="font-medium">{formData.origin}</span></div>}
                          </div>
                        </>
                      )}
                      {(selectedType === 'consolidation-inbound-label' || selectedType === 'consolidation-combined-label') && (
                        <>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {formData.customerAccount && <div><span className="text-gray-500">账号: </span><span className="font-medium">{formData.customerAccount}</span></div>}
                            {formData.customerNickname && <div><span className="text-gray-500">昵称: </span><span>{formData.customerNickname}</span></div>}
                            {formData.trackingNo && <div><span className="text-gray-500">单号: </span><span className="font-medium">{formData.trackingNo}</span></div>}
                            {formData.itemType && <div><span className="text-gray-500">类型: </span><span>{formData.itemType}</span></div>}
                            {formData.totalWeight && <div><span className="text-gray-500">重量: </span><span>{formData.totalWeight}</span></div>}
                            {formData.totalVolume && <div><span className="text-gray-500">体积: </span><span>{formData.totalVolume}</span></div>}
                          </div>
                          {formData.handlingNote && <div className="p-2 bg-amber-50 rounded text-xs text-amber-700">⚠️ {formData.handlingNote}</div>}
                        </>
                      )}
                      {selectedType === 'warehouse-location-label' && (
                        <div className="text-center py-4">
                          <p className="text-xs text-gray-500">仓库: {formData.warehouseCode || '—'}</p>
                          <p className="text-4xl font-bold my-2" style={{ color: style.primaryColor }}>{formData.locationNo || '—'}</p>
                          <p className="text-xs text-gray-400">{formData.zone || ''} {formData.rackNo || ''} {formData.level || ''}</p>
                        </div>
                      )}
                      {selectedType === 'parcel-info-label' && (
                        <>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div><p className="text-gray-500">寄件人 Sender</p><p className="font-medium whitespace-pre-wrap">{formData.senderName || '—'}</p>{formData.senderPhone && <p className="text-gray-400">{formData.senderPhone}</p>}</div>
                            <div><p className="text-gray-500">收件人 Receiver</p><p className="font-medium whitespace-pre-wrap">{formData.receiverName || '—'}</p>{formData.receiverPhone && <p className="text-gray-400">{formData.receiverPhone}</p>}</div>
                          </div>
                          {formData.receiverAddress && <div className="mt-2 text-xs"><span className="text-gray-500">地址: </span>{formData.receiverAddress}</div>}
                          <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                            {formData.country && <div><span className="text-gray-500">国家: </span>{formData.country}</div>}
                            {formData.postalCode && <div><span className="text-gray-500">邮编: </span>{formData.postalCode}</div>}
                            {formData.refNo && <div><span className="text-gray-500">单号: </span>{formData.refNo}</div>}
                          </div>
                          <p className="text-xs text-red-500 mt-2">此标签非官方快递运单，仅供参考</p>
                        </>
                      )}
                      {selectedType === 'fba-carton-info-label' && (
                        <>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {formData.shipmentId && <div><span className="text-gray-500">Shipment ID: </span><span className="font-medium">{formData.shipmentId}</span></div>}
                            {formData.boxNo && <div><span className="text-gray-500">Box: </span><span className="font-bold">{formData.boxNo}</span></div>}
                            {formData.sku && <div><span className="text-gray-500">SKU: </span>{formData.sku}</div>}
                            {formData.quantity && <div><span className="text-gray-500">Qty: </span>{formData.quantity}</div>}
                            {formData.grossWeight && <div><span className="text-gray-500">GW: </span>{formData.grossWeight}</div>}
                            {formData.cartonSize && <div><span className="text-gray-500">Size: </span>{formData.cartonSize}</div>}
                          </div>
                          <p className="text-xs text-red-500 mt-2">此标签非 Amazon 官方 FBA 标签，仅供装箱信息整理参考</p>
                        </>
                      )}
                      {selectedType === 'pallet-label' && (
                        <>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {formData.palletNo && <div><span className="text-gray-500">Pallet: </span><span className="font-bold">{formData.palletNo}</span></div>}
                            {formData.totalPallets && <div><span className="text-gray-500">Total: </span>{formData.totalPallets}</div>}
                            {formData.cartonsOnPallet && <div><span className="text-gray-500">Cartons: </span>{formData.cartonsOnPallet}</div>}
                            {formData.grossWeight && <div><span className="text-gray-500">GW: </span>{formData.grossWeight}</div>}
                            {formData.destination && <div><span className="text-gray-500">Dest: </span>{formData.destination}</div>}
                            {formData.handlingInstruction && formData.handlingInstruction !== 'None' && <div className="text-red-600 font-bold">⚠️ {formData.handlingInstruction}</div>}
                          </div>
                          {formData.consignee && <div className="mt-2 text-xs"><span className="text-gray-500">Consignee: </span>{formData.consignee}</div>}
                        </>
                      )}
                      {selectedType === 'handling-label' && (
                        <div className="text-center py-4">
                          <div className="text-6xl mb-2">{formData.iconStyle?.split(' ')[0] || '⚠️'}</div>
                          {formData.chineseText && <p className="text-xl font-bold mb-1">{formData.chineseText}</p>}
                          {formData.englishText && <p className="text-lg font-bold" style={{ color: style.primaryColor }}>{formData.englishText}</p>}
                          {!formData.chineseText && !formData.englishText && (
                            <>
                              <p className="text-xl font-bold">{formData.labelType?.split(' ')[0] || '易碎'}</p>
                              <p className="text-lg font-bold" style={{ color: style.primaryColor }}>{formData.labelType?.includes(' ') ? formData.labelType.split(' ').slice(1).join(' ') : 'FRAGILE'}</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Barcode / QR */}
                    {template && (template.showBarcode || template.showQrCode) && (
                      <div className="mt-3 pt-3 border-t flex justify-between items-end" style={{ borderColor: style.borderColor }}>
                        <p className="text-xs text-gray-400">
                          {(() => {
                            const srcKey = formData.barcodeSource;
                            if (srcKey && srcKey !== 'custom') return formData[srcKey] || '';
                            return formData.barcodeValue || '';
                          })()}
                        </p>
                        <div className="flex gap-2">
                          {template.showBarcode && <div className="text-center"><Barcode className="w-16 h-8 text-gray-300 mx-auto" /><p className="text-xs text-gray-400">Code128</p></div>}
                          {template.showQrCode && <div className="text-center"><QrCode className="w-16 h-8 text-gray-300 mx-auto" /><p className="text-xs text-gray-400">QR</p></div>}
                        </div>
                      </div>
                    )}

                    {!p.canRemoveBranding() && (
                      <div className="mt-2 pt-2 border-t text-center text-xs text-gray-300" style={{ borderColor: style.borderColor }}>
                        由海外百宝箱生成，仅供参考 | kjbxb.com
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile bottom action bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-3 z-50 print:hidden">
                  {mobileTab === 'edit' && (
                    <button onClick={() => setMobileTab('preview')} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium text-sm">
                      预览 →
                    </button>
                  )}
                  {mobileTab === 'preview' && (
                    <div className="flex gap-2">
                      <button onClick={() => setMobileTab('edit')} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm">← 返回编辑</button>
                      <button onClick={() => setMobileTab('export')} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium text-sm">导出 ↓</button>
                    </div>
                  )}
                  {mobileTab === 'export' && (
                    <button onClick={() => setMobileTab('preview')} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm">← 返回预览</button>
                  )}
                </div>
                <div className="lg:hidden h-20 print:hidden" />
              </div>
            </div>
          </div>
        </div>

        {/* Tool ads & FAQ */}
        <AdSlot placement="tool-bottom" className="mb-6 print:hidden" />
        <div className="print:hidden">
          <FAQSection title="唛头面单常见问题" items={[
            { question: "这个工具可以生成快递面单吗？", answer: "本工具生成的是通用箱唛、仓库标签和寄件信息贴纸，不是任何承运商（DHL/FedEx/UPS/顺丰等）的官方运单。正式快递面单请在对应承运商官网或其系统中生成。" },
            { question: "唛头（Shipping Mark）是什么？", answer: "唛头是外箱上印刷或粘贴的标识信息，通常包括：收货人简称、目的港、箱号（如 1/50 表示共50箱中的第1箱）、产品名、重量尺寸等。用于仓库和物流环节快速识别货物。" },
            { question: "FBA 标签可以用这个工具生成吗？", answer: "不可以。Amazon FBA 标签（FNSKU、外箱标签、托盘标签等）必须在 Seller Central 后台生成，有严格的格式和条码要求。建议使用 Amazon 系统出具的官方标签。" },
            { question: "批量生成是什么意思？", answer: "批量生成指一次性生成多张相同或不同的标签。游客默认只能单次生成，会员可批量生成多张（如不同箱号的连续标签），提高仓库贴标效率。" },
            { question: "生成的标签可以直接打印吗？", answer: "可以。点击「打印 / PDF」会调用浏览器打印功能，支持 A4 纸打印或导出 PDF。建议打印前预览，确保尺寸和边距正确。" },
          ]} />
        </div>
      </div>
    </>
  );
}
