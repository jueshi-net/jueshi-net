'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, Image, Crown, Plus, Trash2, ChevronDown, Eye, Palette, AlertTriangle, Settings, QrCode, Barcode, Save, Package, FileText, Loader2 } from 'lucide-react';
import { getLabelType, getLabelTemplate, labelTypes, labelSizes, labelStyles } from '@/lib/labels/label-types';
import { usePermissions, authorizeExportClient, createPermissionHelpers } from '@/lib/auth/client-permissions';
import { permissionMessages } from '@/lib/membership/permissions';
import { saveLabelDraft, getLabelDraft, getAllLabelDrafts, deleteLabelDraft } from '@/lib/labels/label-storage';
import { buttonVariants, inputStyles, cardStyles } from "@/lib/ui-styles";
import { AdSlot } from "@/components/ad-slot";
import { FAQSection } from '@/components/faq-section';
import ToolReviewPanel from '@/components/tools/tool-review-panel';

import { buildLabelA4ExportHTML, A4_WIDTH, A4_HEIGHT, A4_EXPORT_SCALE } from '@/lib/labels/a4-export-renderer';

import { renderLabelPreview } from '@/lib/labels/template-preview-renderers';
import { buildVisualStyle, LabelVisualStyle } from '@/lib/labels/template-renderers';

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
  const lastExportRef = useRef<number>(0);
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
    // Guest upsell: save locally but prompt to login for cloud sync
    if (!perms.authenticated && perms.role === 'guest') {
      const saved = saveLabelDraft({
        type: selectedType, title: labelType?.titleZh || selectedType,
        labelSize: selectedSize, data: formData, style: selectedStyle,
      }, perms.limits.maxDrafts);
      setDraftId(saved.id);
      alert(`💡 草稿已保存到本地（最多 ${perms.limits.maxDrafts} 份）\n\n登录后即可永久保存单据草稿，随时跨设备恢复编辑。`);
      return;
    }
    const saved = saveLabelDraft({
      type: selectedType, title: labelType?.titleZh || selectedType,
      labelSize: selectedSize, data: formData, style: selectedStyle,
    }, perms.limits.maxDrafts);
    setDraftId(saved.id);
    alert('草稿已保存');
  }, [selectedType, labelType, selectedSize, formData, selectedStyle, perms.limits.maxDrafts, perms.authenticated, perms.role]);

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
        windowWidth: A4_WIDTH,
        windowHeight: Math.ceil(a4Page.scrollHeight),
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
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; height: auto !important; overflow: visible !important; }
          body > * { visibility: hidden !important; height: 0 !important; overflow: hidden !important; }
          [data-label-preview], [data-label-preview] * { visibility: visible !important; }
          [data-label-preview] {
            position: absolute !important; left: 0 !important; top: 0 !important;
            width: 100% !important; max-width: 210mm !important; margin: 0 auto !important;
            padding: 15mm !important; box-shadow: none !important; border: none !important;
            background: white !important; overflow: visible !important; height: auto !important;
          }
          @page { margin: 10mm; size: A4; }
        }
      `}</style>

      {/* Hidden export container */}
      <div ref={exportContainerRef} className="hidden" aria-hidden="true" />

      {/* ===== UNIFIED TOOLBAR (h-14, all screen sizes) ===== */}
      <div className="bg-white border-b sticky top-0 z-40 no-print" style={{ height: '56px' }}>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/tools/documents" className="text-sm text-gray-500 hover:text-teal-600 flex items-center gap-1 min-h-[44px]">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">返回</span>
            </Link>
            <div className="h-5 w-px bg-gray-200" />
            <div>
              <h1 className="font-semibold text-gray-900 text-sm leading-tight">唛头/标签生成器</h1>
              <p className="text-[11px] text-gray-400 leading-tight">Shipping Label Maker</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleSaveDraft} className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg transition-colors min-h-[36px] ${!perms.authenticated && perms.role === 'guest' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200' : 'bg-gray-100 hover:bg-gray-200'}`} title={!perms.authenticated && perms.role === 'guest' ? '💡 登录后即可永久保存单据草稿' : '保存草稿'}>
              {!perms.authenticated && perms.role === 'guest' ? <span>🔒</span> : <Save className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">草稿</span>
            </button>
            <button onClick={handlePrint} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-teal-600 text-white hover:bg-teal-700 rounded-lg transition-colors min-h-[36px]" title="打印/PDF">
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">打印</span>
            </button>
            <button onClick={handleExportPNG} disabled={exporting} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px]" title="导出 PNG">
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Image className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{exporting ? '生成中' : 'PNG'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#F5F5F7] min-h-screen">

        {/* Mobile Tab bar */}
        <div className="lg:hidden sticky top-[56px] z-30 bg-white border-b no-print">
          <div className="flex">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setMobileTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors ${mobileTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'} min-h-[44px]`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 no-print">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">{DISCLAIMER}</p>
            </div>
          </div>
          {template?.disclaimer && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 no-print">
              <p className="text-xs text-red-700">⚠️ {template.disclaimer}</p>
            </div>
          )}

          <div className="flex gap-4 print-block">
            {/* Left: Controls - desktop always, mobile only edit tab */}
            <div className={`w-full lg:w-5/12 no-print space-y-4 ${mobileTab === 'edit' ? 'block' : 'hidden lg:block'}`}>
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
                    {p.canUploadLogo() ? (
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">公司 Logo</label>
                        <input type="file" accept="image/*" className="w-full text-sm"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) { const reader = new FileReader(); reader.onload = ev => updateField('logoUrl', ev.target?.result); reader.readAsDataURL(file); }
                          }} />
                      </div>
                    ) : (
                      <div className="relative">
                        <label className="text-xs text-gray-500 mb-1 block">公司 Logo</label>
                        <div className="relative w-full h-20 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden group cursor-not-allowed">
                          {/* Crown upsell overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/90 to-yellow-50/90 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
                            <Crown className="w-5 h-5 text-amber-500 mb-1" />
                            <span className="text-xs font-medium text-amber-700">👑 升级会员解锁</span>
                            <span className="text-[10px] text-amber-500 mt-0.5">自定义公司 Logo · 无水印导出</span>
                          </div>
                          {/* Placeholder background */}
                          <Image className="w-4 h-4 text-gray-300" />
                          <span className="text-xs text-gray-300 ml-1">Logo 预览</span>
                        </div>
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
              {p.canBatchGenerateLabels() && (
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

              <AdSlot placement="label-maker-bottom" variant="card" className="no-print" />

              <div className="text-center text-xs text-gray-400">
                游客最多保存 <strong>{perms.limits.maxDrafts ?? 3}</strong> 份草稿 | <Link href="/tools/documents" className="text-blue-500">去单据生成器 →</Link>
              </div>
            </div>

            {/* Preview - desktop always, mobile preview/export tabs */}
            <div className={`w-full lg:w-7/12 print-full-width ${(mobileTab === 'preview' || mobileTab === 'export') ? 'block' : 'hidden lg:block'}`}>
              <div className="lg:sticky lg:top-20">
                {mobileTab === 'export' && (
                  <div className="flex flex-wrap gap-2 mb-4 no-print">
                    <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                      <Printer className="w-4 h-4" /> 打印/PDF
                    </button>
                    <button onClick={handleExportPNG} disabled={exporting} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed" title={exporting ? '正在生成高清图片，请稍候...' : 'PNG'}>
                      {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />} {exporting ? '生成中...' : 'PNG'}
                    </button>
                  </div>
                )}

                {/* Label preview — v1.20.4 template renderers */}
                <div ref={previewRef} data-label-preview="true"
                  className="bg-white border rounded-xl p-4 print-p-0 print-border-none print-shadow-none overflow-x-hidden"
                  style={{ fontFamily: 'sans-serif', maxWidth: '100%' }}>
                  <div style={{
                    border: `${style.showBorder ? '2px' : '0'} ${style.showBorder ? 'solid' : 'none'} ${style.borderColor}`,
                    borderRadius: style.showBorder ? '6px' : '0',
                    padding: '12px',
                  }}>
                    {formData.logoUrl && <img src={formData.logoUrl} alt="Logo" className="h-8 mb-2 block" />}
                    {renderLabelPreview(
                      selectedType,
                      formData,
                      style,
                      labelType?.titleZh || '',
                      labelType?.titleEn || '',
                    )}

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
                        由海外百宝箱生成，仅供参考 | jueshi.net
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile bottom action bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-3 z-50 no-print">
                  {mobileTab === 'edit' && (
                    <button onClick={() => setMobileTab('preview')} className="w-full py-3 min-h-[48px] bg-blue-600 text-white rounded-xl font-medium text-sm">
                      预览 →
                    </button>
                  )}
                  {mobileTab === 'preview' && (
                    <div className="flex gap-2">
                      <button onClick={() => setMobileTab('edit')} className="flex-1 py-3 min-h-[48px] bg-gray-100 text-gray-700 rounded-xl font-medium text-sm">← 返回编辑</button>
                      <button onClick={() => setMobileTab('export')} className="flex-1 py-3 min-h-[48px] bg-green-600 text-white rounded-xl font-medium text-sm">导出 ↓</button>
                    </div>
                  )}
                  {mobileTab === 'export' && (
                    <button onClick={() => setMobileTab('preview')} className="w-full py-3 min-h-[48px] bg-gray-100 text-gray-700 rounded-xl font-medium text-sm">← 返回预览</button>
                  )}
                </div>
                <div className="lg:hidden h-20 no-print" />
              </div>
            </div>
          </div>
        </div>

        {/* Tool ads & FAQ */}
        <AdSlot placement="tool-bottom" className="mb-6 no-print" />
        <div className="no-print">
          <FAQSection title="唛头面单常见问题" items={[
            { question: "这个工具可以生成快递面单吗？", answer: "本工具生成的是通用箱唛、仓库标签和寄件信息贴纸，不是任何承运商（DHL/FedEx/UPS/顺丰等）的官方运单。正式快递面单请在对应承运商官网或其系统中生成。" },
            { question: "唛头（Shipping Mark）是什么？", answer: "唛头是外箱上印刷或粘贴的标识信息，通常包括：收货人简称、目的港、箱号（如 1/50 表示共50箱中的第1箱）、产品名、重量尺寸等。用于仓库和物流环节快速识别货物。" },
            { question: "FBA 标签可以用这个工具生成吗？", answer: "不可以。Amazon FBA 标签（FNSKU、外箱标签、托盘标签等）必须在 Seller Central 后台生成，有严格的格式和条码要求。建议使用 Amazon 系统出具的官方标签。" },
            { question: "批量生成是什么意思？", answer: "批量生成指一次性生成多张相同或不同的标签。游客默认只能单次生成，会员可批量生成多张（如不同箱号的连续标签），提高仓库贴标效率。" },
            { question: "生成的标签可以直接打印吗？", answer: "可以。点击「打印 / PDF」会调用浏览器打印功能，支持 A4 纸打印或导出 PDF。建议打印前预览，确保尺寸和边距正确。" },
          ]} />

          {/* Tool Reviews */}
          <ToolReviewPanel toolKey="label-maker" isLoggedIn={typeof window !== 'undefined' && (document.cookie.includes('next-auth.session-token') || document.cookie.includes('__Secure-next-auth.session-token'))} />
        </div>
      </div>
    </>
  );
}
