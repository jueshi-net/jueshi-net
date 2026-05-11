'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Printer, Download, FileText, Image, Crown,
  Plus, Trash2, ChevronDown, Building2, AlertTriangle, Eye,
  Palette, Settings, Info, ExternalLink, Bold, FileSpreadsheet, Clock
} from 'lucide-react';
import { getDocumentType, documentStyles } from '@/lib/documents/document-types';
import { getTemplate } from '@/lib/documents/document-fields';
import { getRoleInfo, canRemoveBranding, canUseCustomStyle, canUploadLogo, canExportWord, permissionMessages } from '@/lib/membership/permissions';
import { saveDraft, getDraft, getDraftsByType, deleteDraft, getCompanyProfile, saveCompanyProfile, type DocumentDraft, type CompanyProfile } from '@/lib/documents/storage';
import { AdSlot } from '@/components/ad-slot';

function getTotalLabel(key: string): string {
  const labels: Record<string, string> = {
    totalQuantity: '总数量',
    totalAmount: '总金额',
    totalCartons: '总箱数',
    totalGrossWeight: '总毛重',
    totalNetWeight: '总净重',
    totalVolume: '总体积',
    paidAmount: '已付金额',
    unpaidAmount: '未付金额',
  };
  return labels[key] || key;
}

function formatCurrency(value: number, currency?: string): string {
  const c = currency || 'USD';
  const symbols: Record<string, string> = { USD: '$', EUR: '€', CNY: '¥', GBP: '£', CAD: 'C$', AUD: 'A$', JPY: '¥', HKD: 'HK$' };
  return `${symbols[c] || c}${value.toFixed(2)}`;
}

export default function DocumentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;
  const docType = getDocumentType(type);
  const template = getTemplate(type);
  const previewRef = useRef<HTMLDivElement>(null);

  const roleInfo = getRoleInfo();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [lineItems, setLineItems] = useState<Record<string, any>[]>([{}]);
  const [selectedStyle, setSelectedStyle] = useState('default');
  const [showPreview, setShowPreview] = useState(true);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [wordExportsToday, setWordExportsToday] = useState(0);

  const style = documentStyles.find(s => s.id === selectedStyle) || documentStyles[0];

  // Load draft and company profile on mount
  useEffect(() => {
    const draft = getDraft(type);
    if (draft) {
      setFormData(draft.data || {});
      setLineItems(draft.lineItems && draft.lineItems.length > 0 ? draft.lineItems : [{}]);
      setDraftId(draft.id);
      if (draft.style) setSelectedStyle(draft.style);
    }
    const cp = getCompanyProfile();
    if (cp) setCompanyProfile(cp);
  }, [type]);

  // Load company profile from formData if set
  useEffect(() => {
    if (formData.companyName) {
      setCompanyProfile(prev => {
        if (!prev || prev.companyName !== formData.companyName) {
          return {
            id: 'default',
            companyName: formData.companyName || '',
            companyNameEn: formData.companyNameEn || '',
            address: formData.companyAddress || '',
            addressEn: '',
            phone: formData.companyPhone || '',
            email: formData.companyEmail || '',
            website: formData.companyWebsite || '',
            taxId: '',
            contactPerson: '',
            defaultCurrency: formData.currency || 'USD',
            defaultTerms: formData.terms || '',
          };
        }
        return prev;
      });
    }
  }, [formData.companyName, formData.companyNameEn, formData.companyAddress, formData.companyPhone, formData.companyEmail, formData.companyWebsite, formData.currency, formData.terms]);

  const updateField = useCallback((key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateLineItem = useCallback((idx: number, key: string, value: any) => {
    setLineItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      // Auto-calculate amount
      if (key === 'quantity' || key === 'unitPrice') {
        const qty = parseFloat(next[idx].quantity) || 0;
        const price = parseFloat(next[idx].unitPrice) || 0;
        next[idx].amount = (qty * price).toFixed(2);
        // Also calc total value for express declaration
        next[idx].totalValue = (qty * price).toFixed(2);
      }
      return next;
    });
  }, []);

  const addLineItem = useCallback(() => {
    setLineItems(prev => [...prev, {}]);
  }, []);

  const removeLineItem = useCallback((idx: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== idx).length > 0 ? prev.filter((_, i) => i !== idx) : [{}]);
  }, []);

  const calculateTotal = useCallback((key: string) => {
    if (!template?.lineItems?.length) return 0;
    return lineItems.reduce((sum, item) => {
      const val = parseFloat(item[key]) || 0;
      return sum + val;
    }, 0);
  }, [lineItems, template]);

  const handleSaveDraft = useCallback(() => {
    const saved = saveDraft({
      type,
      title: docType?.titleZh || type,
      documentNo: formData.documentNo || '',
      data: formData,
      lineItems,
      style: selectedStyle,
    }, roleInfo.maxDrafts);
    setDraftId(saved.id);
    alert(`草稿已保存（${roleInfo.maxDrafts === 999 ? '无限制' : `最多 ${roleInfo.maxDrafts} 份`}）`);
  }, [type, docType, formData, lineItems, selectedStyle, roleInfo.maxDrafts]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExportPNG = useCallback(async () => {
    if (!previewRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `${docType?.exportFileNamePrefix || type}-${formData.documentNo || 'draft'}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('导出图片失败，请使用浏览器截图功能');
    }
  }, [previewRef, docType, formData.documentNo, type]);

  const handleExportWord = useCallback(() => {
    if (!canExportWord()) {
      alert(permissionMessages.exportWord);
      return;
    }
    if (wordExportsToday >= roleInfo.canExportWordDailyLimit) {
      alert(`今日 Word 导出次数已达上限（${roleInfo.canExportWordDailyLimit}次）`);
      return;
    }
    // Simple HTML to Word export
    const content = previewRef.current?.innerHTML || '';
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><style>body{font-family:SimSun,serif;font-size:12pt;}table{border-collapse:collapse;width:100%;}td,th{border:1px solid #000;padding:4px 8px;}</style></head>
      <body>${content}</body></html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.download = `${docType?.exportFileNamePrefix || type}-${formData.documentNo || 'draft'}-${new Date().toISOString().slice(0, 10)}.doc`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setWordExportsToday(prev => prev + 1);
  }, [canExportWord, wordExportsToday, roleInfo, previewRef, docType, formData.documentNo, type]);

  if (!docType || !template) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">单据类型未找到</h1>
        <Link href="/tools/documents" className="text-blue-600 hover:text-blue-700">返回单据中心</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tools/documents" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> 返回
            </Link>
            <Link href="/tools/documents/drafts" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1" title="我的草稿">
              <Clock className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-bold text-gray-900">{docType.titleZh}</h1>
              <p className="text-xs text-gray-400">{docType.titleEn}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Style picker (member only) */}
            {canUseCustomStyle() && (
              <div className="relative">
                <button
                  onClick={() => setShowStylePicker(!showStylePicker)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                  title="切换模板风格"
                >
                  <Palette className="w-4 h-4" />
                </button>
                {showStylePicker && (
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-2 w-48 z-50">
                    {documentStyles.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedStyle(s.id); setShowStylePicker(false); }}
                        className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-50 flex items-center gap-2 ${selectedStyle === s.id ? 'bg-blue-50 text-blue-600' : ''}`}
                      >
                        <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: s.primaryColor, borderColor: s.borderColor }} />
                        {s.name}
                        {s.memberOnly && <Crown className="w-3 h-3 text-amber-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button onClick={handleSaveDraft} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <Save className="w-4 h-4" />
              保存草稿
            </button>

            <div className="h-6 w-px bg-gray-200" />

            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
              <Printer className="w-4 h-4" />
              打印 / PDF
            </button>

            <button onClick={handleExportPNG} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors">
              <Image className="w-4 h-4" />
              PNG
            </button>

            <button
              onClick={handleExportWord}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${canExportWord() ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              title={!canExportWord() ? permissionMessages.exportWord : '导出 Word'}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Word
            </button>

            {/* Role badge */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${roleInfo.role === 'member' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
              {roleInfo.role === 'member' ? '会员' : roleInfo.role === 'user' ? '用户' : '游客'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Mobile preview toggle */}
        <div className="lg:hidden mb-4 print:hidden">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${showPreview ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}
          >
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {showPreview ? '收起预览' : '打开实时预览'}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showPreview ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex gap-6 print:block">
          {/* Form panel */}
          <div className="w-full lg:w-1/2 print:hidden">
            {/* Company info */}
            <div className="bg-white rounded-xl border p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  公司信息
                </h2>
                <button onClick={() => setShowCompanyForm(!showCompanyForm)} className="text-xs text-blue-600 hover:text-blue-700">
                  {showCompanyForm ? '收起' : '编辑'}
                </button>
              </div>

              {!showCompanyForm && companyProfile && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium">{companyProfile.companyName}</p>
                  {companyProfile.companyNameEn && <p className="text-xs text-gray-400">{companyProfile.companyNameEn}</p>}
                  {companyProfile.phone && <p className="text-xs">{companyProfile.phone}</p>}
                  {companyProfile.email && <p className="text-xs">{companyProfile.email}</p>}
                </div>
              )}

              {!companyProfile && !showCompanyForm && (
                <p className="text-sm text-gray-400">尚未设置公司信息，点击「编辑」填写</p>
              )}

              {showCompanyForm && (
                <div className="space-y-3">
                  {(['companyName', 'companyNameEn', 'companyAddress', 'companyPhone', 'companyEmail', 'companyWebsite'] as const).map(key => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {key === 'companyName' ? '公司名称' : key === 'companyNameEn' ? '英文名称' : key === 'companyAddress' ? '地址' : key === 'companyPhone' ? '电话' : key === 'companyEmail' ? '邮箱' : '网站'}
                      </label>
                      <input
                        type="text"
                        value={formData[key] || ''}
                        onChange={e => updateField(key, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={key === 'companyName' ? '公司全称' : ''}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const profile: CompanyProfile = {
                        id: 'default',
                        companyName: formData.companyName || '',
                        companyNameEn: formData.companyNameEn || '',
                        address: formData.companyAddress || '',
                        addressEn: '',
                        phone: formData.companyPhone || '',
                        email: formData.companyEmail || '',
                        website: formData.companyWebsite || '',
                        taxId: '',
                        contactPerson: '',
                        defaultCurrency: formData.currency || 'USD',
                        defaultTerms: formData.terms || '',
                      };
                      saveCompanyProfile(profile);
                      setCompanyProfile(profile);
                      setShowCompanyForm(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    保存公司信息
                  </button>
                </div>
              )}
            </div>

            {/* Form sections */}
            {template.sections.map(section => (
              <div key={section.id} className="bg-white rounded-xl border p-5 mb-4">
                <h2 className="font-semibold text-gray-900 mb-4">{section.title}</h2>
                <div className="space-y-3">
                  {section.fields.map(field => (
                    <div key={field.key} className={field.colspan === 2 ? 'col-span-2' : ''}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {field.label} {field.labelEn && <span className="text-gray-300 font-normal">{field.labelEn}</span>}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea
                          value={formData[field.key] || ''}
                          onChange={e => updateField(field.key, e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={field.placeholder}
                          rows={3}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={formData[field.key] || ''}
                          onChange={e => updateField(field.key, e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">请选择</option>
                          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : field.type === 'date' ? (
                        <input
                          type="date"
                          value={formData[field.key] || ''}
                          onChange={e => updateField(field.key, e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : field.type === 'checkbox' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!formData[field.key]}
                            onChange={e => updateField(field.key, e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">{field.label}</span>
                        </div>
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={formData[field.key] || ''}
                          onChange={e => updateField(field.key, e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={field.placeholder}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Special warnings */}
                {type === 'customs-declaration-authorization' && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-700">
                      ⚠️ 此模板仅为通用委托书草稿，正式格式以报关行或主管机关要求为准。
                    </p>
                  </div>
                )}
                {type === 'express-declaration' && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-700">
                      ⚠️ 申报信息需真实准确，虚假申报可能导致扣关、罚款或退运。
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Line items */}
            {template.lineItems && template.lineItems.length > 0 && (
              <div className="bg-white rounded-xl border p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">货物/项目明细</h2>
                  <button onClick={addLineItem} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                    <Plus className="w-4 h-4" /> 添加一行
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-1 text-left text-gray-400 w-8">#</th>
                        {template.lineItems.map(col => (
                          <th key={col.key} className="py-2 px-1 text-left text-gray-500 font-medium whitespace-nowrap" style={{ width: col.width }}>
                            {col.label}
                          </th>
                        ))}
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-50">
                          <td className="py-2 px-1 text-gray-300">{idx + 1}</td>
                          {template.lineItems.map(col => (
                            <td key={col.key} className="py-1 px-1">
                              {col.key === 'amount' || col.key === 'totalValue' ? (
                                <span className="text-gray-700 font-medium">{item[col.key] || '0.00'}</span>
                              ) : (
                                <input
                                  type={col.key === 'quantity' || col.key === 'unitPrice' || col.key === 'grossWeight' || col.key === 'netWeight' || col.key === 'volume' || col.key === 'weight' ? 'number' : 'text'}
                                  value={item[col.key] || ''}
                                  onChange={e => updateLineItem(idx, col.key, e.target.value)}
                                  className="w-full px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder={col.label}
                                />
                              )}
                            </td>
                          ))}
                          <td className="py-1 px-1">
                            <button onClick={() => removeLineItem(idx)} className="text-red-400 hover:text-red-600">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {template.totals && template.totals.length > 0 && (
                      <tfoot>
                        <tr className="bg-gray-50">
                          <td colSpan={template.lineItems.length + 2} className="py-2 px-2 text-right">
                            {template.totals.map(key => (
                              <span key={key} className="ml-4 text-xs">
                                <span className="text-gray-500">{getTotalLabel(key)}: </span>
                                <span className="font-semibold text-gray-900">
                                  {key.includes('Amount') || key.includes('Value') ? formatCurrency(calculateTotal(key), formData.currency) : calculateTotal(key).toFixed(2)}
                                </span>
                              </span>
                            ))}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            )}

            {/* Default terms */}
            {template.defaultTerms && (
              <div className="bg-white rounded-xl border p-5 mb-4">
                <h2 className="font-semibold text-gray-900 mb-3">默认条款</h2>
                <textarea
                  value={formData.terms || template.defaultTerms.join('\n')}
                  onChange={e => updateField('terms', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                />
              </div>
            )}

            {/* Tool links */}
            {(type === 'commercial-invoice' || type === 'express-declaration') && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-700 mb-2">需要查 HS 编码？</p>
                <Link href="/tools/hs-code" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                  前往 HS 编码查询 <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
            {(type === 'proforma-invoice' || type === 'quotation' || type === 'freight-statement') && formData.currency && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
                <p className="text-sm text-indigo-700 mb-2">需要参考汇率？</p>
                <Link href="/tools/exchange-rate" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
                  前往汇率查询 <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
            {(type === 'packing-list' || type === 'booking-instruction' || type === 'consolidation-packing-list') && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
                <p className="text-sm text-green-700 mb-2">需要计算体积/CBM？</p>
                <Link href="/tools/shipping-calculator" className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700">
                  前往体积计算器 <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
            {(type === 'express-declaration' || type === 'consolidation-inbound-receipt' || type === 'consolidation-packing-list') && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-4">
                <p className="text-sm text-orange-700 mb-2">不确定是否属于敏感货？</p>
                <Link href="/tools/sensitive-goods" className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700">
                  查看敏感货参考 <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Ad Slot: document-editor-bottom */}
            <AdSlot placement="document-editor-bottom" variant="card" />

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-800">
                  <p className="font-medium mb-1">免责声明</p>
                  <p>本模板为通用单据参考格式，仅用于资料整理、内部流转或业务沟通。不同国家、海关、银行、船公司、报关行或物流服务商可能有不同要求，正式用途请以相关机构要求为准。</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview panel */}
          <div className={`w-full lg:w-1/2 print:w-full ${showPreview ? 'block' : 'hidden lg:block'}`}>
            <div className="lg:sticky lg:top-20">
              <div className="flex items-center justify-between mb-3 print:hidden">
                <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  实时预览
                </h2>
                <button onClick={() => setShowPreview(!showPreview)} className="text-xs text-gray-400 hover:text-gray-600">
                  {showPreview ? '收起' : '展开'}
                </button>
              </div>

              {showPreview && (
                <div
                  ref={previewRef}
                  className="bg-white rounded-xl border shadow-sm p-8 print:shadow-none print:border-none print:p-0"
                  style={{ fontFamily: 'SimSun, serif', fontSize: '11pt' }}
                >
                  {/* Document header with company info */}
                  <div className="border-b-2 pb-4 mb-4" style={{ borderColor: style.borderColor }}>
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-bold" style={{ color: style.primaryColor }}>
                          {companyProfile?.companyName || formData.companyName || '公司名称'}
                        </h3>
                        {companyProfile?.companyNameEn && <p className="text-xs text-gray-500">{companyProfile.companyNameEn}</p>}
                        {companyProfile?.address && <p className="text-xs text-gray-500">{companyProfile.address}</p>}
                        {(companyProfile?.phone || companyProfile?.email) && (
                          <p className="text-xs text-gray-500">
                            {companyProfile.phone && `Tel: ${companyProfile.phone}`}
                            {companyProfile.email && ` | Email: ${companyProfile.email}`}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <h2 className="text-xl font-bold" style={{ color: style.primaryColor }}>{docType.titleZh}</h2>
                        <p className="text-sm text-gray-500">{docType.titleEn}</p>
                        <p className="text-sm mt-1">No.: <strong>{formData.documentNo || '___'}</strong></p>
                        <p className="text-sm">Date: {formData.documentDate || '___'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Form data display */}
                  {template.sections.map(section => (
                    <div key={section.id} className="mb-4">
                      <h4 className="text-sm font-semibold mb-2 pb-1" style={{ backgroundColor: style.headingBgColor, color: style.primaryColor }}>
                        {section.title}
                      </h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        {section.fields.map(field => (
                          formData[field.key] && (
                            <div key={field.key} className={field.colspan === 2 ? 'col-span-2' : ''}>
                              <span className="text-gray-500">{field.label}: </span>
                              <span className="text-gray-900">{String(formData[field.key])}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Line items table */}
                  {template.lineItems && template.lineItems.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2 pb-1" style={{ backgroundColor: style.headingBgColor, color: style.primaryColor }}>
                        货物/项目明细
                      </h4>
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr style={{ backgroundColor: style.headingBgColor }}>
                            {template.lineItems.map(col => (
                              <th key={col.key} className="border px-2 py-1.5 text-left font-medium" style={{ borderColor: style.borderColor, color: style.primaryColor }}>
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {lineItems.map((item, idx) => (
                            <tr key={idx}>
                              {template.lineItems.map(col => (
                                <td key={col.key} className="border px-2 py-1.5" style={{ borderColor: style.borderColor }}>
                                  {item[col.key] || ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                        {template.totals && template.totals.length > 0 && (
                          <tfoot>
                            <tr className="font-semibold" style={{ backgroundColor: style.headingBgColor }}>
                              <td colSpan={template.lineItems.length} className="border px-2 py-1.5 text-right" style={{ borderColor: style.borderColor }}>
                                {template.totals.map(key => (
                                  <span key={key} className="ml-4">
                                    {getTotalLabel(key)}: {key.includes('Amount') || key.includes('Value') ? formatCurrency(calculateTotal(key), formData.currency) : calculateTotal(key).toFixed(2)}
                                  </span>
                                ))}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  )}

                  {/* Terms */}
                  {formData.terms && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2 pb-1" style={{ backgroundColor: style.headingBgColor, color: style.primaryColor }}>
                        备注条款
                      </h4>
                      <p className="text-xs whitespace-pre-wrap">{formData.terms}</p>
                    </div>
                  )}

                  {/* Signature area */}
                  <div className="mt-8 pt-4 border-t" style={{ borderColor: style.borderColor }}>
                    <div className="grid grid-cols-2 gap-8 text-xs">
                      <div>
                        <p className="text-gray-500 mb-8">卖方/制单人签字盖章：</p>
                        <p>日期：____________</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-8">买方/审核人签字盖章：</p>
                        <p>日期：____________</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer branding */}
                  {!canRemoveBranding() && (
                    <div className="mt-8 pt-3 border-t text-center text-xs text-gray-300" style={{ borderColor: style.borderColor }}>
                      由海外百宝箱生成，仅供参考 | kjbxb.com
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
