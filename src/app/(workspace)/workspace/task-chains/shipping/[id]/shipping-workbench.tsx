'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Package, ArrowRight, ArrowLeft, Loader2, CheckCircle, Circle,
  ExternalLink, Save, AlertTriangle, Shield, MapPin, Calculator,
  FileText, Globe, Truck, ClipboardList, DollarSign, Sparkles,
  ChevronRight, RotateCcw, Download, Copy, Building2, Search, Link2,
  Plus, Trash2, Zap, Droplets, Wind, Magnet, Award, X,
  Check, Phone, ClipboardCheck, Archive, Home,
} from 'lucide-react';
import { WorkspacePageHeader } from '@/components/saas/WorkspacePageHeader';

// ─── Types ───────────────────────────────────────────────────────
interface TaskChainData {
  id: string;
  title: string;
  status: string;
  currentStep: number;
  completedSteps: number[];
  context: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface StepConfig {
  index: number;
  title: string;
  description: string;
  icon: typeof Package;
  toolLink?: string;
  toolLabel?: string;
}

const STEPS: StepConfig[] = [
  { index: 0, title: '商品信息', description: '录入商品基础信息', icon: Package },
  { index: 1, title: 'HS编码', description: '查询或填写HS编码', icon: FileText, toolLink: '/tools/hs-code', toolLabel: 'HS编码查询工具' },
  { index: 2, title: '合规检查', description: '敏感/合规性检查', icon: Shield, toolLink: '/tools/sensitive-goods', toolLabel: '敏感货物查询' },
  { index: 3, title: 'CBM/计费重量', description: '计算体积和计费重量', icon: Calculator, toolLink: '/tools/container', toolLabel: '集装箱计算工具' },
  { index: 4, title: '目的地址', description: '填写目的国地址信息', icon: MapPin, toolLink: '/tools/postal-code', toolLabel: '邮编查询工具' },
  { index: 5, title: '商业发票', description: '生成商业发票', icon: FileText, toolLink: '/tools/commercial-invoice', toolLabel: '商业发票工具' },
  { index: 6, title: '装箱单', description: '生成装箱单', icon: ClipboardList, toolLink: '/tools/documents/packing-list', toolLabel: '装箱单工具' },
  { index: 7, title: '汇率与成本', description: '汇率换算和成本估算', icon: DollarSign, toolLink: '/tools/exchange-rate', toolLabel: '汇率查询工具' },
  { index: 8, title: '报价模板', description: '生成报价模板', icon: Sparkles, toolLink: '/tools/documents/quotation', toolLabel: '报价单工具' },
  { index: 9, title: '完成', description: '任务完成，查看结果', icon: CheckCircle },
];

// ─── Main Component ──────────────────────────────────────────────
export default function ShippingWorkbench({ taskId }: { taskId: string }) {
  const [task, setTask] = useState<TaskChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [context, setContext] = useState<Record<string, any>>({});

  // Fetch task data
  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const res = await fetch(`/api/task-chains/${taskId}`);
      if (res.status === 401) {
        window.location.href = '/login?callbackUrl=/workspace/task-chains/shipping/' + taskId;
        return;
      }
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      const tc = data.taskChain;
      setTask(tc);
      setCurrentStep(tc.context?.currentStep || 0);
      setContext(tc.context || {});
    } catch {
      // Task might not exist yet — use empty state
      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save context
  const autoSave = useCallback(async (patch: Record<string, any>) => {
    setSaveStatus('saving');
    const newContext = { ...context, ...patch };
    setContext(newContext);

    try {
      const res = await fetch(`/api/task-chains/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: newContext,
          currentStep,
        }),
      });
      if (res.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  }, [context, currentStep, taskId]);

  // Mark step as completed
  const completeStep = async (stepIndex: number) => {
    if (!task) return;
    const currentCompletedSteps = context.completedSteps || [];
    const completedSteps = [...new Set([...currentCompletedSteps, stepIndex])];
    const nextStep = stepIndex + 1 < 10 ? stepIndex + 1 : stepIndex;

    try {
      const res = await fetch(`/api/task-chains/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedSteps,
          currentStep: nextStep,
          status: stepIndex === 9 ? 'completed' : 'active',
        }),
      });
      if (res.ok) {
        setTask(prev => prev ? {
          ...prev,
          status: stepIndex === 9 ? 'completed' : 'active',
        } : null);
        setContext(prev => ({ ...prev, completedSteps, currentStep: nextStep }));
        if (stepIndex < 9) {
          setCurrentStep(nextStep);
        }
      }
    } catch (err) {
      console.error('Failed to complete step:', err);
    }
  };

  // Navigation
  const goToStep = (step: number) => {
    if (step >= 0 && step < 10) {
      setCurrentStep(step);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载任务中...</p>
        </div>
      </div>
    );
  }

  const stepConfig = STEPS[currentStep];
  const completedSteps = context?.completedSteps || [];
  const isStepCompleted = completedSteps.includes(currentStep);

  return (
    <div className="max-w-5xl mx-auto">
      <WorkspacePageHeader
        title={task?.title || '发货任务工作台'}
        subtitle={`步骤 ${currentStep + 1}/10: ${stepConfig.title}`}
        icon={<Truck className="w-5 h-5" />}
        breadcrumbs={[
          { label: '工作台', href: '/workspace' },
          { label: '任务链', href: '/workspace/task-chains' },
          { label: task?.title || '发货任务' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {/* Save status indicator */}
            <div className="flex items-center gap-1 text-xs">
              {saveStatus === 'saving' && (
                <><Loader2 className="w-3 h-3 animate-spin text-teal-500" /><span className="text-teal-600">保存中...</span></>
              )}
              {saveStatus === 'saved' && (
                <><CheckCircle className="w-3 h-3 text-green-500" /><span className="text-green-600">已保存</span></>
              )}
              {saveStatus === 'error' && (
                <><AlertTriangle className="w-3 h-3 text-red-500" /><span className="text-red-600">保存失败</span></>
              )}
            </div>
          </div>
        }
      />

      <div className="px-4 py-4 space-y-4">
        {/* ─── Step Progress Indicator ─────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {STEPS.map((step, idx) => {
              const isCompleted = completedSteps.includes(idx);
              const isCurrent = idx === currentStep;
              const StepIcon = step.icon;

              return (
                <button
                  key={idx}
                  onClick={() => goToStep(idx)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isCurrent
                      ? 'bg-teal-600 text-white shadow-sm'
                      : isCompleted
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <StepIcon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                  <span className="sm:hidden">{idx + 1}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Step Content ────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Step Header */}
          <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isStepCompleted ? 'bg-green-100' : 'bg-teal-50'
              }`}>
                {isStepCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <stepConfig.icon className="w-5 h-5 text-teal-600" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  步骤 {currentStep + 1}: {stepConfig.title}
                </h2>
                <p className="text-xs text-gray-500">{stepConfig.description}</p>
              </div>
            </div>
            {stepConfig.toolLink && (
              <Link
                href={stepConfig.toolLink}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                {stepConfig.toolLabel}
              </Link>
            )}
          </div>

          {/* Step Body */}
          <div className="p-5">
            {currentStep === 0 && <Step0ProductInfo context={context} autoSave={autoSave} />}
            {currentStep === 1 && <Step1HSCode context={context} autoSave={autoSave} />}
            {currentStep === 2 && <Step2Compliance context={context} autoSave={autoSave} />}
            {currentStep === 3 && <Step3CBM context={context} autoSave={autoSave} />}
            {currentStep === 4 && <Step4Address context={context} autoSave={autoSave} />}
            {currentStep === 5 && <Step5Invoice context={context} autoSave={autoSave} />}
            {currentStep === 6 && <Step6PackingList context={context} autoSave={autoSave} />}
            {currentStep === 7 && <Step7ExchangeRate context={context} autoSave={autoSave} />}
            {currentStep === 8 && <Step8QuoteTemplate context={context} autoSave={autoSave} />}
            {currentStep === 9 && <Step9Complete task={task} taskId={taskId} context={context} completedSteps={completedSteps} autoSave={autoSave} />}
          </div>

          {/* Step Footer Navigation */}
          <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between">
            <button
              onClick={() => goToStep(currentStep - 1)}
              disabled={currentStep === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              上一步
            </button>

            <div className="flex items-center gap-2">
              {!isStepCompleted && currentStep < 9 && (
                <button
                  onClick={() => completeStep(currentStep)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  标记完成
                </button>
              )}
              {currentStep < 9 && (
                <button
                  onClick={() => goToStep(currentStep + 1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                >
                  下一步
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {currentStep === 9 && !isStepCompleted && (
                <button
                  onClick={() => completeStep(9)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  完成全部任务
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Input Component ──────────────────────────────────────
function FormField({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
    />
  );
}

function SelectInput({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function CheckboxField({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// ─── Step 0: Product Info (Multi-product) ────────────────────────
interface ProductRow {
  id: string;
  name: string;
  brand: string;
  material: string;
  usage: string;
  quantity: string;
  unitPrice: string;
  currency: string;
  originCountry: string;
  hasBattery: boolean;
  hasLiquid: boolean;
  hasPowder: boolean;
  hasMagnetic: boolean;
  isBranded: boolean;
}

const emptyProductRow = (): ProductRow => ({
  id: Math.random().toString(36).slice(2, 9),
  name: '', brand: '', material: '', usage: '',
  quantity: '', unitPrice: '', currency: 'USD', originCountry: '中国',
  hasBattery: false, hasLiquid: false, hasPowder: false,
  hasMagnetic: false, isBranded: false,
});

function Step0ProductInfo({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const update = (patch: Record<string, any>) => autoSave(patch);
  const [savingProduct, setSavingProduct] = useState(false);

  // Initialize products array from context or legacy single-product fields
  const products: ProductRow[] = context.products?.length
    ? context.products
    : [{
        ...emptyProductRow(),
        name: context.productName || '',
        brand: context.brand || '',
        material: context.material || '',
        usage: context.productUsage || '',
        quantity: context.quantity || '',
        unitPrice: context.unitPrice || '',
        currency: context.currency || 'USD',
        originCountry: context.originCountry || '中国',
        hasBattery: !!context.hasBattery,
        hasLiquid: !!context.hasLiquid,
        hasPowder: !!context.hasPowder,
        hasMagnetic: !!context.hasMagnetic,
        isBranded: !!context.isBranded,
      }];

  const updateProduct = (index: number, field: keyof ProductRow, value: any) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    // Also sync first product to legacy context fields for backward compat
    const legacyPatch: Record<string, any> = { products: newProducts };
    if (index === 0) {
      legacyPatch.productName = newProducts[0].name;
      legacyPatch.brand = newProducts[0].brand;
      legacyPatch.material = newProducts[0].material;
      legacyPatch.productUsage = newProducts[0].usage;
      legacyPatch.quantity = newProducts[0].quantity;
      legacyPatch.unitPrice = newProducts[0].unitPrice;
      legacyPatch.currency = newProducts[0].currency;
      legacyPatch.originCountry = newProducts[0].originCountry;
    }
    // Aggregate sensitive flags across all products
    legacyPatch.hasBattery = newProducts.some(p => p.hasBattery);
    legacyPatch.hasLiquid = newProducts.some(p => p.hasLiquid);
    legacyPatch.hasPowder = newProducts.some(p => p.hasPowder);
    legacyPatch.hasMagnetic = newProducts.some(p => p.hasMagnetic);
    legacyPatch.isBranded = newProducts.some(p => p.isBranded);
    legacyPatch.isSensitiveGoods = legacyPatch.hasBattery || legacyPatch.hasLiquid || legacyPatch.hasPowder || legacyPatch.hasMagnetic || legacyPatch.isBranded;
    update(legacyPatch);
  };

  const addProduct = () => {
    const newProducts = [...products, emptyProductRow()];
    update({ products: newProducts });
  };

  const removeProduct = (index: number) => {
    if (products.length <= 1) return;
    const newProducts = products.filter((_, i) => i !== index);
    const legacyPatch: Record<string, any> = { products: newProducts };
    if (index === 0 && newProducts.length > 0) {
      legacyPatch.productName = newProducts[0].name;
      legacyPatch.quantity = newProducts[0].quantity;
      legacyPatch.unitPrice = newProducts[0].unitPrice;
    }
    legacyPatch.hasBattery = newProducts.some(p => p.hasBattery);
    legacyPatch.hasLiquid = newProducts.some(p => p.hasLiquid);
    legacyPatch.hasPowder = newProducts.some(p => p.hasPowder);
    legacyPatch.hasMagnetic = newProducts.some(p => p.hasMagnetic);
    legacyPatch.isBranded = newProducts.some(p => p.isBranded);
    legacyPatch.isSensitiveGoods = legacyPatch.hasBattery || legacyPatch.hasLiquid || legacyPatch.hasPowder || legacyPatch.hasMagnetic || legacyPatch.isBranded;
    update(legacyPatch);
  };

  const copySummary = () => {
    const lines = products.map((p, i) =>
      `${i + 1}. ${p.name || '未命名'} | ${p.brand || '-'} | ${p.material || '-'} | ×${p.quantity || '0'} @ ${p.currency} ${p.unitPrice || '0'} | 原产国: ${p.originCountry || '-'}`
    );
    const sensitive = products.flatMap(p => {
      const flags: string[] = [];
      if (p.hasBattery) flags.push('电池');
      if (p.hasLiquid) flags.push('液体');
      if (p.hasPowder) flags.push('粉末');
      if (p.hasMagnetic) flags.push('磁性');
      if (p.isBranded) flags.push('品牌货');
      return flags;
    });
    const text = `【商品信息摘要】\n${lines.join('\n')}\n敏感属性: ${[...new Set(sensitive)].join(', ') || '无'}`;
    navigator.clipboard.writeText(text);
  };

  const saveToLibrary = async (index: number) => {
    const p = products[index];
    if (!p.name.trim()) { alert('请先填写商品名称'); return; }
    setSavingProduct(true);
    try {
      const res = await fetch('/api/workspace/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: p.name,
          sku: '',
          description: p.usage,
          hsCode: context.hsCode || '',
          unit: 'PCS',
          unitPrice: parseFloat(p.unitPrice) || null,
          currency: p.currency,
          originCountry: p.originCountry,
          material: p.material,
          usage: p.usage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('已保存到商品资料库');
      } else {
        alert(data.error || '保存失败');
      }
    } catch {
      alert('保存失败');
    } finally {
      setSavingProduct(false);
    }
  };

  return (
    <div className="space-y-4">
      {products.map((product, idx) => (
        <div key={product.id} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">商品 {idx + 1}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => saveToLibrary(idx)}
                disabled={savingProduct}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                title="保存为商品资料"
              >
                <Save className="w-3 h-3" /> 存为资料
              </button>
              {products.length > 1 && (
                <button
                  onClick={() => removeProduct(idx)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  title="删除此商品"
                >
                  <Trash2 className="w-3 h-3" /> 删除
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField label="商品名称" required>
              <TextInput value={product.name} onChange={(v) => updateProduct(idx, 'name', v)} placeholder="例如：蓝牙耳机" />
            </FormField>
            <FormField label="品牌">
              <TextInput value={product.brand} onChange={(v) => updateProduct(idx, 'brand', v)} placeholder="例如：Apple、Samsung" />
            </FormField>
            <FormField label="材质">
              <TextInput value={product.material} onChange={(v) => updateProduct(idx, 'material', v)} placeholder="例如：塑料、金属、棉" />
            </FormField>
            <FormField label="用途">
              <TextInput value={product.usage} onChange={(v) => updateProduct(idx, 'usage', v)} placeholder="例如：个人使用、商业用途" />
            </FormField>
            <FormField label="数量">
              <TextInput value={product.quantity} onChange={(v) => updateProduct(idx, 'quantity', v)} placeholder="例如：100" type="number" />
            </FormField>
            <div className="grid grid-cols-2 gap-2">
              <FormField label="单价">
                <TextInput value={product.unitPrice} onChange={(v) => updateProduct(idx, 'unitPrice', v)} placeholder="25.00" type="number" />
              </FormField>
              <FormField label="币种">
                <SelectInput value={product.currency} onChange={(v) => updateProduct(idx, 'currency', v)} options={[
                  { value: 'USD', label: 'USD' },
                  { value: 'CNY', label: 'CNY' },
                  { value: 'EUR', label: 'EUR' },
                  { value: 'GBP', label: 'GBP' },
                ]} />
              </FormField>
            </div>
            <FormField label="原产国">
              <TextInput value={product.originCountry} onChange={(v) => updateProduct(idx, 'originCountry', v)} placeholder="例如：中国" />
            </FormField>
          </div>
          {/* Sensitive attributes */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-medium text-gray-500 mb-2">敏感属性</p>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={product.hasBattery} onChange={(e) => updateProduct(idx, 'hasBattery', e.target.checked)} className="w-3.5 h-3.5 text-amber-600 border-gray-300 rounded focus:ring-amber-500" />
                <span className="text-xs text-gray-600 flex items-center gap-1"><Zap className="w-3 h-3" />电池</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={product.hasLiquid} onChange={(e) => updateProduct(idx, 'hasLiquid', e.target.checked)} className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-xs text-gray-600 flex items-center gap-1"><Droplets className="w-3 h-3" />液体</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={product.hasPowder} onChange={(e) => updateProduct(idx, 'hasPowder', e.target.checked)} className="w-3.5 h-3.5 text-gray-600 border-gray-300 rounded focus:ring-gray-500" />
                <span className="text-xs text-gray-600 flex items-center gap-1"><Wind className="w-3 h-3" />粉末</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={product.hasMagnetic} onChange={(e) => updateProduct(idx, 'hasMagnetic', e.target.checked)} className="w-3.5 h-3.5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                <span className="text-xs text-gray-600 flex items-center gap-1"><Magnet className="w-3 h-3" />磁性</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={product.isBranded} onChange={(e) => updateProduct(idx, 'isBranded', e.target.checked)} className="w-3.5 h-3.5 text-rose-600 border-gray-300 rounded focus:ring-rose-500" />
                <span className="text-xs text-gray-600 flex items-center gap-1"><Award className="w-3 h-3" />品牌货</span>
              </label>
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={addProduct}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
        >
          <Plus className="w-4 h-4" /> 添加商品
        </button>
        <button
          onClick={copySummary}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Copy className="w-4 h-4" /> 复制摘要
        </button>
      </div>
    </div>
  );
}

// ─── Step 1: HS Code (with API search) ───────────────────────────
function Step1HSCode({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const update = (patch: Record<string, any>) => autoSave(patch);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    const q = searchKeyword || context.productName || '';
    if (!q.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/tools/hs-code?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data || []);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectCode = (code: string) => {
    update({ hsCode: code });
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">免责声明</p>
            <p className="text-xs mt-1">HS编码仅供参考，最终归类以海关审核为准。建议使用专业工具或咨询报关行确认。</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="关键词搜索" hint="输入商品关键词搜索建议的HS编码">
          <div className="flex gap-2">
            <TextInput value={searchKeyword} onChange={setSearchKeyword} placeholder="例如：耳机、手机壳" />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 whitespace-nowrap disabled:opacity-50"
            >
              {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
              查询
            </button>
          </div>
        </FormField>
        <FormField label="HS编码" required>
          <TextInput value={context.hsCode} onChange={(v) => update({ hsCode: v })} placeholder="例如：8518.30.0000" />
        </FormField>
        <div className="md:col-span-2">
          <FormField label="商品描述（英文）" hint="用于报关的商品英文描述">
            <TextInput value={context.productDescription} onChange={(v) => update({ productDescription: v })} placeholder="例如：Bluetooth earphones, wireless" />
          </FormField>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b text-xs font-medium text-gray-600">
            查询结果（{searchResults.length} 条）— 点击选用
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
            {searchResults.slice(0, 20).map((item: any, idx: number) => (
              <button
                key={idx}
                onClick={() => selectCode(item.code)}
                className={`w-full text-left px-4 py-2.5 hover:bg-teal-50 transition-colors ${context.hsCode === item.code ? 'bg-teal-50 border-l-2 border-teal-500' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-medium text-teal-700">{item.code}</span>
                  <span className="text-xs text-gray-400">点击选用</span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5 truncate">{item.description || item.descriptionEn || ''}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {context.hsCode && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <p className="text-sm text-green-800 font-medium">已填写 HS 编码: {context.hsCode}</p>
          <p className="text-xs text-green-600 mt-1">该编码将自动带入商业发票和装箱单</p>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href="/tools/hs-code"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> HS编码查询工具
        </Link>
        <a
          href="http://www.customs.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Globe className="w-3 h-3" /> 海关总署官方查询
        </a>
      </div>
    </div>
  );
}

// ─── Step 2: Compliance Check (auto-detect from Step 0) ──────────
function Step2Compliance({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const update = (patch: Record<string, any>) => autoSave(patch);

  // Detect sensitive flags from Step 0 products
  const hasBattery = !!context.hasBattery;
  const hasLiquid = !!context.hasLiquid;
  const hasPowder = !!context.hasPowder;
  const hasMagnetic = !!context.hasMagnetic;
  const isBranded = !!context.isBranded;
  const hasAnySensitive = hasBattery || hasLiquid || hasPowder || hasMagnetic || isBranded;

  // Compliance checklist items
  const complianceItems = [
    ...(hasBattery ? [
      { key: 'battery_un383', label: '已准备 UN38.3 测试报告（锂电池必须）', icon: Zap, color: 'amber' },
      { key: 'battery_msds', label: '已准备 MSDS（材料安全数据表）', icon: Zap, color: 'amber' },
      { key: 'battery_packaging', label: '电池包装符合 PI/II 要求', icon: Zap, color: 'amber' },
    ] : []),
    ...(hasLiquid ? [
      { key: 'liquid_limit', label: '已确认液体容量符合航空运输限制（单件≤100ml/1L）', icon: Droplets, color: 'blue' },
      { key: 'liquid_packaging', label: '液体包装密封良好，有防漏措施', icon: Droplets, color: 'blue' },
    ] : []),
    ...(hasPowder ? [
      { key: 'powder_declaration', label: '已准备粉末类货物声明文件', icon: Wind, color: 'gray' },
      { key: 'powder_restrict', label: '已确认目的国对粉末类商品无进口限制', icon: Wind, color: 'gray' },
    ] : []),
    ...(hasMagnetic ? [
      { key: 'magnetic_test', label: '已完成磁性检测（磁检报告）', icon: Magnet, color: 'purple' },
      { key: 'magnetic_shielding', label: '磁性物质已做屏蔽包装处理', icon: Magnet, color: 'purple' },
    ] : []),
    ...(isBranded ? [
      { key: 'brand_auth', label: '已持有品牌授权书或正规采购凭证', icon: Award, color: 'rose' },
      { key: 'brand_customs', label: '已了解品牌货物报关风险（可能扣货查验）', icon: Award, color: 'rose' },
    ] : []),
  ];

  const confirmedChecks: string[] = context.complianceChecks || [];
  const toggleCheck = (key: string) => {
    const newChecks = confirmedChecks.includes(key)
      ? confirmedChecks.filter(k => k !== key)
      : [...confirmedChecks, key];
    update({ complianceChecks: newChecks });
  };

  const allChecked = complianceItems.length === 0 || complianceItems.every(item => confirmedChecks.includes(item.key));

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">免责声明</p>
            <p className="text-xs mt-1">以下合规提示仅供参考，具体运输要求请咨询物流服务商或报关行。违规运输可能导致扣货、罚款或法律责任。</p>
          </div>
        </div>
      </div>

      {/* Auto-detected warnings */}
      {hasAnySensitive ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">根据商品信息，检测到以下敏感属性：</p>
          {hasBattery && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">含电池</span>
              </div>
              <p className="text-xs text-amber-700">• 锂电池需提供 UN38.3 测试报告和 MSDS</p>
              <p className="text-xs text-amber-700">• 需按 PI/II 包装要求分类，部分航线限制运输</p>
              <p className="text-xs text-amber-700">• 纯电池（ standalone ）可能有额外限制</p>
            </div>
          )}
          {hasLiquid && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">含液体</span>
              </div>
              <p className="text-xs text-blue-700">• 航空运输对液体有严格限制（单件容量限制）</p>
              <p className="text-xs text-blue-700">• 需确保包装密封，防止泄漏</p>
              <p className="text-xs text-blue-700">• 部分液体（易燃、腐蚀性）可能禁止空运</p>
            </div>
          )}
          {hasPowder && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Wind className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">含粉末</span>
              </div>
              <p className="text-xs text-gray-700">• 粉末类货物可能需要额外声明文件</p>
              <p className="text-xs text-gray-700">• 部分目的国对粉末进口有限制</p>
              <p className="text-xs text-gray-700">• 需确认非危险品（非易燃、非有毒）</p>
            </div>
          )}
          {hasMagnetic && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Magnet className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">含磁性</span>
              </div>
              <p className="text-xs text-purple-700">• 磁性货物需做磁性检测（磁检报告）</p>
              <p className="text-xs text-purple-700">• 可能影响航空导航设备，需屏蔽包装</p>
              <p className="text-xs text-purple-700">• 磁性强度超标可能无法空运</p>
            </div>
          )}
          {isBranded && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-medium text-rose-800">品牌货物</span>
              </div>
              <p className="text-xs text-rose-700">• 需提供品牌授权书或正规采购凭证</p>
              <p className="text-xs text-rose-700">• 海关可能查验知识产权，无授权可能扣货</p>
              <p className="text-xs text-rose-700">• 建议提前准备授权文件避免清关延误</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>未检测到敏感属性，该货物属于普通货物。</span>
          </div>
        </div>
      )}

      {/* Compliance Checklist */}
      {complianceItems.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">合规确认清单</p>
            <span className="text-xs text-gray-400">
              {confirmedChecks.length}/{complianceItems.length} 已确认
            </span>
          </div>
          <div className="space-y-2">
            {complianceItems.map(item => {
              const Icon = item.icon;
              const isChecked = confirmedChecks.includes(item.key);
              return (
                <label
                  key={item.key}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    isChecked ? 'bg-green-50 border-green-200' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCheck(item.key)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <Icon className={`w-4 h-4 text-${item.color}-500 shrink-0`} />
                  <span className={`text-sm ${isChecked ? 'text-green-700' : 'text-gray-700'}`}>{item.label}</span>
                </label>
              );
            })}
          </div>
          {allChecked && complianceItems.length > 0 && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> 所有合规项已确认
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Link
          href="/tools/sensitive-goods"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          敏感货物查询工具
        </Link>
      </div>
    </div>
  );
}

// ─── Step 3: CBM / Chargeable Weight (Multi-box) ─────────────────
interface PackageType {
  id: string;
  length: string;  // cm
  width: string;   // cm
  height: string;  // cm
  weight: string;  // kg per carton
  cartons: string; // number of cartons
}

const emptyPackageType = (): PackageType => ({
  id: Math.random().toString(36).slice(2, 9),
  length: '', width: '', height: '', weight: '', cartons: '1',
});

function Step3CBM({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const update = (patch: Record<string, any>) => autoSave(patch);

  // Initialize from context or legacy single-box fields
  const packages: PackageType[] = context.packageTypes?.length
    ? context.packageTypes
    : [{
        ...emptyPackageType(),
        length: context.packageLength || '',
        width: context.packageWidth || '',
        height: context.packageHeight || '',
        weight: context.grossWeight || '',
        cartons: context.totalCartons || '1',
      }];

  const updatePackage = (index: number, field: keyof PackageType, value: string) => {
    const newPackages = [...packages];
    newPackages[index] = { ...newPackages[index], [field]: value };
    // Calculate totals
    let totalCBM = 0;
    let totalVolumeWeight = 0;
    let totalActualWeight = 0;
    let totalCartons = 0;
    for (const pkg of newPackages) {
      const l = parseFloat(pkg.length) || 0;
      const w = parseFloat(pkg.width) || 0;
      const h = parseFloat(pkg.height) || 0;
      const wt = parseFloat(pkg.weight) || 0;
      const qty = parseInt(pkg.cartons) || 1;
      totalCBM += (l * w * h * qty) / 1000000;
      totalVolumeWeight += (l * w * h * qty) / 6000;
      totalActualWeight += wt * qty;
      totalCartons += qty;
    }
    const chargeableWeight = Math.max(totalActualWeight, totalVolumeWeight);
    update({
      packageTypes: newPackages,
      cbm: totalCBM,
      chargeableWeight,
      // Also sync legacy fields for backward compat with Steps 5-9
      packageLength: newPackages[0]?.length || '',
      packageWidth: newPackages[0]?.width || '',
      packageHeight: newPackages[0]?.height || '',
      grossWeight: totalActualWeight.toString(),
      totalCartons: totalCartons.toString(),
    });
  };

  const addPackage = () => {
    const newPackages = [...packages, emptyPackageType()];
    update({ packageTypes: newPackages });
  };

  const removePackage = (index: number) => {
    if (packages.length <= 1) return;
    const newPackages = packages.filter((_, i) => i !== index);
    // Recalculate
    let totalCBM = 0;
    let totalVolumeWeight = 0;
    let totalActualWeight = 0;
    let totalCartons = 0;
    for (const pkg of newPackages) {
      const l = parseFloat(pkg.length) || 0;
      const w = parseFloat(pkg.width) || 0;
      const h = parseFloat(pkg.height) || 0;
      const wt = parseFloat(pkg.weight) || 0;
      const qty = parseInt(pkg.cartons) || 1;
      totalCBM += (l * w * h * qty) / 1000000;
      totalVolumeWeight += (l * w * h * qty) / 6000;
      totalActualWeight += wt * qty;
      totalCartons += qty;
    }
    update({
      packageTypes: newPackages,
      cbm: totalCBM,
      chargeableWeight: Math.max(totalActualWeight, totalVolumeWeight),
      packageLength: newPackages[0]?.length || '',
      packageWidth: newPackages[0]?.width || '',
      packageHeight: newPackages[0]?.height || '',
      grossWeight: totalActualWeight.toString(),
      totalCartons: totalCartons.toString(),
    });
  };

  // Calculate totals for display
  let totalCBM = 0;
  let totalVolumeWeight = 0;
  let totalActualWeight = 0;
  let totalCartons = 0;
  for (const pkg of packages) {
    const l = parseFloat(pkg.length) || 0;
    const w = parseFloat(pkg.width) || 0;
    const h = parseFloat(pkg.height) || 0;
    const wt = parseFloat(pkg.weight) || 0;
    const qty = parseInt(pkg.cartons) || 1;
    totalCBM += (l * w * h * qty) / 1000000;
    totalVolumeWeight += (l * w * h * qty) / 6000;
    totalActualWeight += wt * qty;
    totalCartons += qty;
  }
  const chargeableWeight = Math.max(totalActualWeight, totalVolumeWeight);

  return (
    <div className="space-y-4">
      {packages.map((pkg, idx) => (
        <div key={pkg.id} className="border border-gray-200 rounded-xl p-4 relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">箱型 {idx + 1}</span>
            {packages.length > 1 && (
              <button
                onClick={() => removePackage(idx)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> 删除
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <FormField label="长 (cm)">
              <TextInput value={pkg.length} onChange={(v) => updatePackage(idx, 'length', v)} placeholder="cm" type="number" />
            </FormField>
            <FormField label="宽 (cm)">
              <TextInput value={pkg.width} onChange={(v) => updatePackage(idx, 'width', v)} placeholder="cm" type="number" />
            </FormField>
            <FormField label="高 (cm)">
              <TextInput value={pkg.height} onChange={(v) => updatePackage(idx, 'height', v)} placeholder="cm" type="number" />
            </FormField>
            <FormField label="单箱毛重 (kg)">
              <TextInput value={pkg.weight} onChange={(v) => updatePackage(idx, 'weight', v)} placeholder="kg" type="number" />
            </FormField>
            <FormField label="箱数">
              <TextInput value={pkg.cartons} onChange={(v) => updatePackage(idx, 'cartons', v)} placeholder="1" type="number" />
            </FormField>
          </div>
          {/* Per-box calculation */}
          {(parseFloat(pkg.length) && parseFloat(pkg.width) && parseFloat(pkg.height)) ? (
            <div className="mt-2 flex gap-4 text-xs text-gray-500">
              <span>单箱体积: {((parseFloat(pkg.length) * parseFloat(pkg.width) * parseFloat(pkg.height)) / 1000000).toFixed(4)} CBM</span>
              <span>小计: {((parseFloat(pkg.length) * parseFloat(pkg.width) * parseFloat(pkg.height) * (parseInt(pkg.cartons) || 1)) / 1000000).toFixed(4)} CBM</span>
            </div>
          ) : null}
        </div>
      ))}

      <button
        onClick={addPackage}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
      >
        <Plus className="w-4 h-4" /> 添加箱型
      </button>

      {/* Calculated Results */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600 mb-1">总箱数</p>
          <p className="text-xl font-bold text-blue-800">{totalCartons}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600 mb-1">总体积 (CBM)</p>
          <p className="text-xl font-bold text-blue-800">{totalCBM.toFixed(4)}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-xs text-purple-600 mb-1">体积重 (kg)</p>
          <p className="text-xl font-bold text-purple-800">{totalVolumeWeight.toFixed(2)}</p>
        </div>
        <div className="bg-teal-50 rounded-lg p-3 text-center">
          <p className="text-xs text-teal-600 mb-1">计费重量 (kg)</p>
          <p className="text-xl font-bold text-teal-800">{chargeableWeight.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
        <p>• 计费重量 = max(实际毛重 {totalActualWeight.toFixed(2)}kg, 体积重 {totalVolumeWeight.toFixed(2)}kg) = <strong>{chargeableWeight.toFixed(2)}kg</strong></p>
        <p>• 体积重 = 长×宽×高÷6000（空运标准，单位 cm→kg）</p>
        <p>• 总体积 = 各箱型 长×宽×高×箱数 ÷ 1,000,000（cm³→m³）</p>
      </div>
    </div>
  );
}

// ─── Step 4: Destination Address ─────────────────────────────────
function Step4Address({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const update = (patch: Record<string, any>) => autoSave(patch);
  const [addressFormat, setAddressFormat] = useState<any>(null);
  const [formatLoading, setFormatLoading] = useState(false);
  const [postalLookup, setPostalLookup] = useState<any>(null);
  const [postalLoading, setPostalLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Country list (common destinations)
  const countries = [
    { code: 'US', name: '美国', nameEn: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: '英国', nameEn: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: '加拿大', nameEn: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: '澳大利亚', nameEn: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: '德国', nameEn: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: '法国', nameEn: 'France', flag: '🇫🇷' },
    { code: 'JP', name: '日本', nameEn: 'Japan', flag: '🇯🇵' },
    { code: 'KR', name: '韩国', nameEn: 'South Korea', flag: '🇰🇷' },
    { code: 'SG', name: '新加坡', nameEn: 'Singapore', flag: '🇸🇬' },
    { code: 'MY', name: '马来西亚', nameEn: 'Malaysia', flag: '🇲🇾' },
    { code: 'TH', name: '泰国', nameEn: 'Thailand', flag: '🇹🇭' },
    { code: 'VN', name: '越南', nameEn: 'Vietnam', flag: '🇻🇳' },
    { code: 'IN', name: '印度', nameEn: 'India', flag: '🇮🇳' },
    { code: 'BR', name: '巴西', nameEn: 'Brazil', flag: '🇧🇷' },
    { code: 'MX', name: '墨西哥', nameEn: 'Mexico', flag: '🇲🇽' },
    { code: 'IT', name: '意大利', nameEn: 'Italy', flag: '🇮🇹' },
    { code: 'ES', name: '西班牙', nameEn: 'Spain', flag: '🇪🇸' },
    { code: 'NL', name: '荷兰', nameEn: 'Netherlands', flag: '🇳🇱' },
    { code: 'SE', name: '瑞典', nameEn: 'Sweden', flag: '🇸🇪' },
    { code: 'RU', name: '俄罗斯', nameEn: 'Russia', flag: '🇷🇺' },
    { code: 'NZ', name: '新西兰', nameEn: 'New Zealand', flag: '🇳🇿' },
    { code: 'AE', name: '阿联酋', nameEn: 'UAE', flag: '🇦🇪' },
    { code: 'SA', name: '沙特阿拉伯', nameEn: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'ZA', name: '南非', nameEn: 'South Africa', flag: '🇿🇦' },
    { code: 'PH', name: '菲律宾', nameEn: 'Philippines', flag: '🇵🇭' },
    { code: 'ID', name: '印度尼西亚', nameEn: 'Indonesia', flag: '🇮🇩' },
    { code: 'PL', name: '波兰', nameEn: 'Poland', flag: '🇵🇱' },
    { code: 'HK', name: '香港', nameEn: 'Hong Kong', flag: '🇭🇰' },
    { code: 'TW', name: '中国台湾', nameEn: 'Taiwan', flag: '🇨🇳' },
  ];

  const selectedCountry = countries.find(c => c.code === context.destinationCountryCode);

  // Fetch address format when country changes
  useEffect(() => {
    if (!context.destinationCountryCode) {
      setAddressFormat(null);
      return;
    }
    setFormatLoading(true);
    fetch(`/api/postal-codes/advanced?mode=format&country=${context.destinationCountryCode}`)
      .then(r => r.json())
      .then(data => {
        if (data.results?.[0]) {
          setAddressFormat(data.results[0]);
        } else if (data.basicInfo) {
          setAddressFormat(data.basicInfo);
        } else {
          setAddressFormat(null);
        }
      })
      .catch(() => setAddressFormat(null))
      .finally(() => setFormatLoading(false));
  }, [context.destinationCountryCode]);

  // Postal code → city lookup
  const lookupPostalCode = () => {
    if (!context.postalCode) return;
    setPostalLoading(true);
    setPostalLookup(null);
    fetch(`/api/postal-codes/advanced?mode=region&q=${encodeURIComponent(context.postalCode)}&country=${context.destinationCountryCode || ''}`)
      .then(r => r.json())
      .then(data => {
        if (data.results?.[0]) {
          setPostalLookup(data.results[0]);
        } else {
          setPostalLookup({ error: '未找到匹配的地址信息' });
        }
      })
      .catch(() => setPostalLookup({ error: '查询失败' }))
      .finally(() => setPostalLoading(false));
  };

  // Apply postal lookup result to form
  const applyPostalResult = (result: any) => {
    const patch: Record<string, any> = {};
    if (result.city) patch.destinationCity = result.city;
    if (result.province || result.region) patch.destinationState = result.province || result.region;
    if (result.countryCode) patch.destinationCountryCode = result.countryCode;
    if (result.country) patch.destinationCountry = result.country;
    update(patch);
  };

  // Build English address string
  const buildEnglishAddress = () => {
    const parts: string[] = [];
    if (context.destinationAddress) parts.push(context.destinationAddress);
    if (context.destinationCity) parts.push(context.destinationCity);
    if (context.destinationState) parts.push(context.destinationState);
    if (context.postalCode) parts.push(context.postalCode);
    if (selectedCountry) parts.push(selectedCountry.nameEn);
    return parts.join(', ');
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(buildEnglishAddress());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
        <p className="font-medium">目的国地址信息</p>
        <p className="text-xs mt-1">选择国家后自动显示地址格式，输入邮编可自动匹配城市。</p>
      </div>

      {/* Country Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="国家/地区" required>
          <select
            value={context.destinationCountryCode || ''}
            onChange={(e) => update({ destinationCountryCode: e.target.value, destinationCountry: countries.find(c => c.code === e.target.value)?.nameEn || '' })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
          >
            <option value="">请选择国家</option>
            {countries.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.nameEn})</option>
            ))}
          </select>
        </FormField>

        <FormField label="收件人姓名">
          <TextInput value={context.buyerName} onChange={(v) => update({ buyerName: v })} placeholder="收件人/公司名" />
        </FormField>
      </div>

      {/* Address Format Display */}
      {formatLoading && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-3 h-3 animate-spin" /> 加载地址格式...
        </div>
      )}
      {addressFormat && !formatLoading && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs text-indigo-700">
              <p className="font-medium mb-1">📋 该国地址格式：</p>
              <p className="font-mono text-indigo-900">{addressFormat.format || addressFormat.postalFormat || '标准格式'}</p>
              {addressFormat.example && <p className="text-indigo-600 mt-1">示例：{addressFormat.example}</p>}
              {addressFormat.sampleAddress && <p className="text-indigo-600 mt-1">示例：{addressFormat.sampleAddress}</p>}
            </div>
            {addressFormat.officialLookupUrl && (
              <a
                href={addressFormat.officialLookupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-700 bg-white rounded border border-indigo-200 hover:bg-indigo-100 whitespace-nowrap shrink-0"
              >
                <Link2 className="w-3 h-3" />
                {addressFormat.officialName || '官方查询'}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="邮编" required>
          <div className="flex gap-2">
            <div className="flex-1">
              <TextInput value={context.postalCode} onChange={(v) => update({ postalCode: v })} placeholder="例如：90001" />
            </div>
            <button
              onClick={lookupPostalCode}
              disabled={postalLoading || !context.postalCode}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 disabled:opacity-40 whitespace-nowrap"
            >
              {postalLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
              查询
            </button>
          </div>
        </FormField>

        <FormField label="城市" required>
          <TextInput value={context.destinationCity} onChange={(v) => update({ destinationCity: v })} placeholder="例如：Los Angeles" />
        </FormField>

        <FormField label="省/州">
          <TextInput value={context.destinationState} onChange={(v) => update({ destinationState: v })} placeholder="例如：California" />
        </FormField>

        <FormField label="联系电话">
          <TextInput value={context.buyerContact} onChange={(v) => update({ buyerContact: v })} placeholder="例如：+1-213-555-0100" />
        </FormField>

        <div className="md:col-span-2">
          <FormField label="详细地址" required>
            <TextInput value={context.destinationAddress} onChange={(v) => update({ destinationAddress: v })} placeholder="例如：123 Main Street, Suite 100" />
          </FormField>
        </div>
      </div>

      {/* Postal Code Lookup Result */}
      {postalLookup && (
        <div className={`rounded-lg p-3 text-sm ${postalLookup.error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200'}`}>
          {postalLookup.error ? (
            <p className="text-xs">{postalLookup.error}</p>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-xs text-green-700">
                <p>📍 匹配到：<span className="font-medium">{postalLookup.city || postalLookup.country || ''}</span>{postalLookup.province ? `, ${postalLookup.province}` : ''}, {postalLookup.country}</p>
              </div>
              <button
                onClick={() => applyPostalResult(postalLookup)}
                className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded hover:bg-green-200"
              >
                填入表单
              </button>
            </div>
          )}
        </div>
      )}

      {/* English Address Preview + Copy */}
      {(context.destinationAddress || context.destinationCity || context.postalCode) && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">英文地址格式预览</p>
            <button
              onClick={copyAddress}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-teal-700 bg-white border border-teal-200 rounded hover:bg-teal-50"
            >
              <Copy className="w-3 h-3" />
              {copied ? '已复制!' : '复制英文地址'}
            </button>
          </div>
          <p className="text-sm font-mono text-gray-800">{buildEnglishAddress()}</p>
        </div>
      )}

      {/* Official Links */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href="/tools/postal-code"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> 邮编查询工具
        </Link>
        {addressFormat?.officialLookupUrl && (
          <a
            href={addressFormat.officialLookupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> {addressFormat.officialName || '官方邮政查询'}
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Step 5: Commercial Invoice ──────────────────────────────────
function Step5Invoice({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const update = (patch: Record<string, any>) => autoSave(patch);
  const totalAmount = (parseFloat(context.quantity) || 0) * (parseFloat(context.unitPrice) || 0);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [invoiceCopied, setInvoiceCopied] = useState(false);
  const [plainTextCopied, setPlainTextCopied] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const [saveDocMsg, setSaveDocMsg] = useState('');
  const [generatedAt, setGeneratedAt] = useState<string>(context.invoiceGeneratedAt || '');

  // Fetch company profiles
  useEffect(() => {
    fetch('/api/me/company-profiles')
      .then(r => r.json())
      .then(data => {
        const list = data.data || [];
        setProfiles(list);
        const defaultProfile = list.find((p: any) => p.isDefault) || list[0];
        if (defaultProfile) {
          setCompanyProfile(defaultProfile);
        }
      })
      .catch(() => {});
  }, []);

  // Build consignee address string
  const buildConsigneeAddress = () => {
    const parts: string[] = [];
    if (context.destinationAddress) parts.push(context.destinationAddress);
    if (context.destinationCity) parts.push(context.destinationCity);
    if (context.destinationState) parts.push(context.destinationState);
    if (context.postalCode) parts.push(context.postalCode);
    if (context.destinationCountry) parts.push(context.destinationCountry);
    return parts.join(', ');
  };

  // Generate HTML for the invoice
  const generateInvoiceHTML = () => {
    const shipperName = companyProfile?.companyNameEn || companyProfile?.companyName || context.companyName || '[Your Company Name]';
    const shipperAddr = companyProfile?.address || context.companyAddress || '[Your Address]';
    const date = new Date().toISOString().split('T')[0];

    return `<html><head><meta charset="utf-8"><title>Commercial Invoice</title>
<style>
body{font-family:Arial,sans-serif;padding:40px;color:#333;max-width:800px;margin:0 auto}
h1{text-align:center;font-size:24px;border-bottom:2px solid #333;padding-bottom:10px}
.header{display:flex;justify-content:space-between;margin-bottom:20px}
.section{margin-bottom:20px}
.label{font-size:11px;color:#666;text-transform:uppercase}
table{width:100%;border-collapse:collapse;margin-top:15px}
th{background:#f5f5f5;padding:8px;text-align:left;border:1px solid #ddd;font-size:12px}
td{padding:8px;border:1px solid #ddd;font-size:13px}
.total{text-align:right;font-size:18px;font-weight:bold;margin-top:15px}
.meta{font-size:12px;color:#666}
</style></head><body>
<h1>COMMERCIAL INVOICE</h1>
<div class="meta">Invoice No: ${context.invoiceNo || '—'} | Date: ${date}</div>
<div class="header">
  <div class="section">
    <div class="label">Shipper / Exporter</div>
    <div><strong>${shipperName}</strong></div>
    <div>${shipperAddr}</div>
    ${companyProfile?.taxId ? `<div>Tax ID: ${companyProfile.taxId}</div>` : ''}
  </div>
  <div class="section" style="text-align:right">
    <div class="label">Consignee</div>
    <div><strong>${context.buyerName || '—'}</strong></div>
    <div>${buildConsigneeAddress()}</div>
    ${context.buyerContact ? `<div>Tel: ${context.buyerContact}</div>` : ''}
  </div>
</div>
<table>
  <thead>
    <tr><th>Description</th><th>HS Code</th><th>Origin</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>${context.productDescription || context.productName || '—'}</td>
      <td>${context.hsCode || '—'}</td>
      <td>${context.originCountry || 'China'}</td>
      <td>${context.quantity || '—'}</td>
      <td>USD ${parseFloat(context.unitPrice || '0').toFixed(2)}</td>
      <td>USD ${totalAmount.toFixed(2)}</td>
    </tr>
  </tbody>
</table>
<div class="total">Total Amount: USD ${totalAmount.toFixed(2)}</div>
<div class="meta" style="margin-top:30px">
  <p>Payment Terms: T/T | Trade Terms: FOB</p>
  <p>We certify that this invoice is true and correct.</p>
</div>
</body></html>`;
  };

  const copyInvoiceHTML = () => {
    const html = generateInvoiceHTML();
    // Copy as rich text to clipboard
    const blob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([html], { type: 'text/plain' });
    navigator.clipboard.write([
      new ClipboardItem({
        'text/html': blob,
        'text/plain': textBlob,
      })
    ]).then(() => {
      setInvoiceCopied(true);
      if (!generatedAt) {
        const now = new Date().toISOString();
        setGeneratedAt(now);
        update({ invoiceGeneratedAt: now });
      }
      setTimeout(() => setInvoiceCopied(false), 2000);
    }).catch(() => {
      // Fallback: copy plain text
      navigator.clipboard.writeText(html);
      setInvoiceCopied(true);
      if (!generatedAt) {
        const now = new Date().toISOString();
        setGeneratedAt(now);
        update({ invoiceGeneratedAt: now });
      }
      setTimeout(() => setInvoiceCopied(false), 2000);
    });
  };

  // Generate plain text version of the invoice
  const generateInvoicePlainText = () => {
    const shipperName = companyProfile?.companyNameEn || companyProfile?.companyName || context.companyName || '[Your Company Name]';
    const shipperAddr = companyProfile?.address || context.companyAddress || '[Your Address]';
    const date = new Date().toISOString().split('T')[0];
    const consigneeAddr = buildConsigneeAddress();

    return `COMMERCIAL INVOICE
═══════════════════════════════════════════
Invoice No: ${context.invoiceNo || '—'}
Date: ${date}

── Shipper / Exporter ──
${shipperName}
${shipperAddr}
${companyProfile?.taxId ? `Tax ID: ${companyProfile.taxId}` : ''}

── Consignee ──
${context.buyerName || '—'}
${consigneeAddr}
${context.buyerContact ? `Tel: ${context.buyerContact}` : ''}

── Item Details ──
Description: ${context.productDescription || context.productName || '—'}
HS Code:     ${context.hsCode || '—'}
Origin:      ${context.originCountry || 'China'}
Quantity:    ${context.quantity || '—'}
Unit Price:  USD ${parseFloat(context.unitPrice || '0').toFixed(2)}
Amount:      USD ${totalAmount.toFixed(2)}

── Total ──
Total Amount: USD ${totalAmount.toFixed(2)}

Payment Terms: T/T | Trade Terms: FOB
We certify that this invoice is true and correct.`;
  };

  const copyInvoicePlainText = () => {
    const text = generateInvoicePlainText();
    navigator.clipboard.writeText(text).then(() => {
      setPlainTextCopied(true);
      if (!generatedAt) {
        const now = new Date().toISOString();
        setGeneratedAt(now);
        update({ invoiceGeneratedAt: now });
      }
      setTimeout(() => setPlainTextCopied(false), 2000);
    });
  };

  const saveToDocuments = async () => {
    setSavingDoc(true);
    setSaveDocMsg('');
    try {
      const res = await fetch('/api/user/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: 'commercial_invoice',
          documentNo: context.invoiceNo || '',
          documentData: {
            formData: {
              invoiceNo: context.invoiceNo || '',
              companyName: companyProfile?.companyNameEn || companyProfile?.companyName || '',
              companyAddress: companyProfile?.address || '',
              buyerName: context.buyerName || '',
              buyerAddress: buildConsigneeAddress(),
              date: new Date().toISOString().split('T')[0],
            },
            lineItems: [{
              description: context.productDescription || context.productName || '',
              hsCode: context.hsCode || '',
              origin: context.originCountry || 'China',
              quantity: context.quantity || '',
              unitPrice: parseFloat(context.unitPrice || '0'),
              amount: totalAmount,
              currency: 'USD',
            }],
            totalAmount,
          },
        }),
      });
      if (res.ok) {
        const now = new Date().toISOString();
        setGeneratedAt(now);
        update({ invoiceGeneratedAt: now });
        setSaveDocMsg('✅ 已保存到「我的单据」');
      } else {
        const err = await res.json();
        setSaveDocMsg(`❌ 保存失败: ${err.error || '未知错误'}`);
      }
    } catch (e) {
      setSaveDocMsg('❌ 保存失败，请重试');
    }
    setSavingDoc(false);
    setTimeout(() => setSaveDocMsg(''), 5000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
        <p className="font-medium">商业发票预览</p>
        <p className="text-xs mt-1">系统已自动带入商品信息。选择公司资料后可生成完整发票。</p>
        {generatedAt && (
          <p className="text-xs mt-1 text-green-600">📅 生成时间：{new Date(generatedAt).toLocaleString('zh-CN')}</p>
        )}
      </div>

      {/* Company Profile Selection */}
      <div className="flex items-center gap-3">
        <Building2 className="w-4 h-4 text-gray-400" />
        {profiles.length > 0 ? (
          <select
            value={companyProfile?.id || ''}
            onChange={(e) => {
              const p = profiles.find(x => x.id === e.target.value);
              if (p) setCompanyProfile(p);
            }}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            {profiles.map((p: any) => (
              <option key={p.id} value={p.id}>{p.profileName || p.companyName}{p.isDefault ? ' (默认)' : ''}</option>
            ))}
          </select>
        ) : (
          <span className="text-sm text-gray-400">未找到公司资料</span>
        )}
        <Link
          href="/workspace/settings"
          className="text-xs text-teal-600 hover:underline whitespace-nowrap"
        >
          管理公司资料
        </Link>
      </div>

      {/* Invoice Number */}
      <FormField label="发票号码">
        <TextInput value={context.invoiceNo} onChange={(v) => update({ invoiceNo: v })} placeholder="例如：INV-2024-001" />
      </FormField>

      {/* Invoice Preview */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="font-bold text-gray-900 text-lg">COMMERCIAL INVOICE</h3>
          <span className="text-xs text-gray-400">{context.invoiceNo || 'No. —'} | {new Date().toISOString().split('T')[0]}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase">Shipper / Exporter</p>
            <p className="font-medium">{companyProfile?.companyNameEn || companyProfile?.companyName || '（请在上方选择公司资料）'}</p>
            <p className="text-xs text-gray-500">{companyProfile?.address || ''}</p>
            {companyProfile?.taxId && <p className="text-xs text-gray-500">Tax ID: {companyProfile.taxId}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Consignee</p>
            <p className="font-medium">{context.buyerName || '—'}</p>
            <p className="text-xs text-gray-500">{buildConsigneeAddress() || '—'}</p>
            {context.buyerContact && <p className="text-xs text-gray-500">Tel: {context.buyerContact}</p>}
          </div>
        </div>

        <div className="border-t pt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b bg-gray-50">
                <th className="text-left py-2 px-2">Description</th>
                <th className="text-center py-2 px-2">HS Code</th>
                <th className="text-center py-2 px-2">Origin</th>
                <th className="text-center py-2 px-2">Qty</th>
                <th className="text-right py-2 px-2">Unit Price</th>
                <th className="text-right py-2 px-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 px-2">{context.productDescription || context.productName || '—'}</td>
                <td className="text-center py-2 px-2">{context.hsCode || '—'}</td>
                <td className="text-center py-2 px-2">{context.originCountry || 'China'}</td>
                <td className="text-center py-2 px-2">{context.quantity || '—'}</td>
                <td className="text-right py-2 px-2">${parseFloat(context.unitPrice || '0').toFixed(2)}</td>
                <td className="text-right py-2 px-2 font-medium">${totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t pt-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-xl font-bold text-gray-900">USD ${totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="text-xs text-gray-400 border-t pt-2">
          <p>Payment Terms: T/T | Trade Terms: FOB</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={copyInvoiceHTML}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
        >
          <Copy className="w-4 h-4" />
          {invoiceCopied ? '已复制 HTML!' : '复制 HTML（富文本）'}
        </button>
        <button
          onClick={copyInvoicePlainText}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <ClipboardList className="w-4 h-4" />
          {plainTextCopied ? '已复制纯文本!' : '复制纯文本'}
        </button>
        <button
          onClick={saveToDocuments}
          disabled={savingDoc}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          {savingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          保存到我的单据
        </button>
        <Link
          href="/tools/commercial-invoice"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          在商业发票工具中编辑
        </Link>
      </div>

      {saveDocMsg && (
        <p className="text-sm text-gray-600">{saveDocMsg}</p>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
        💡 提示：「复制 HTML」可粘贴到 Word/邮件中保留格式；「复制纯文本」适合粘贴到聊天工具。PDF 导出即将开放。
      </div>
    </div>
  );
}

// ─── Step 6: Packing List ────────────────────────────────────────
function Step6PackingList({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const update = (patch: Record<string, any>) => autoSave(patch);
  const cartons = parseInt(context.totalCartons) || 1;
  const grossWeight = parseFloat(context.grossWeight) || 0;
  const length = parseFloat(context.packageLength) || 0;
  const width = parseFloat(context.packageWidth) || 0;
  const height = parseFloat(context.packageHeight) || 0;
  const quantity = parseInt(context.quantity) || 0;
  const qtyPerCarton = cartons > 0 ? Math.ceil(quantity / cartons) : quantity;
  const totalVolume = (length * width * height * cartons) / 1000000;
  const weightPerCarton = cartons > 0 ? (grossWeight / cartons) : grossWeight;
  const [packingCopied, setPackingCopied] = useState(false);
  const [plainTextCopied, setPlainTextCopied] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const [saveDocMsg, setSaveDocMsg] = useState('');
  const [generatedAt, setGeneratedAt] = useState<string>(context.packingListGeneratedAt || '');

  // Generate Packing List HTML
  const generatePackingHTML = () => {
    const date = new Date().toISOString().split('T')[0];
    const cartonRows = Array.from({ length: cartons }, (_, i) => {
      const startQty = i * qtyPerCarton + 1;
      const endQty = Math.min((i + 1) * qtyPerCarton, quantity);
      const actualQty = endQty - startQty + 1;
      return `<tr>
        <td>Carton ${i + 1}</td>
        <td>${context.productName || '—'}</td>
        <td>${actualQty} pcs (No. ${startQty}-${endQty})</td>
        <td>${weightPerCarton.toFixed(2)} kg</td>
        <td>${length}×${width}×${height} cm</td>
        <td>${(length * width * height / 1000000).toFixed(4)} CBM</td>
      </tr>`;
    }).join('\n');

    return `<html><head><meta charset="utf-8"><title>Packing List</title>
<style>
body{font-family:Arial,sans-serif;padding:40px;color:#333;max-width:800px;margin:0 auto}
h1{text-align:center;font-size:24px;border-bottom:2px solid #333;padding-bottom:10px}
table{width:100%;border-collapse:collapse;margin-top:15px}
th{background:#f5f5f5;padding:8px;text-align:left;border:1px solid #ddd;font-size:12px}
td{padding:8px;border:1px solid #ddd;font-size:13px}
.summary{display:flex;justify-content:space-between;margin:20px 0;padding:15px;background:#f9f9f9;border:1px solid #eee}
.meta{font-size:12px;color:#666}
</style></head><body>
<h1>PACKING LIST</h1>
<div class="meta">Date: ${date} | Invoice No: ${context.invoiceNo || '—'}</div>
<div class="summary">
  <div><strong>Total Cartons:</strong> ${cartons}</div>
  <div><strong>Total Quantity:</strong> ${quantity} pcs</div>
  <div><strong>Gross Weight:</strong> ${grossWeight} kg</div>
  <div><strong>Total Volume:</strong> ${totalVolume.toFixed(4)} CBM</div>
</div>
<table>
  <thead>
    <tr><th>Carton No.</th><th>Contents</th><th>Quantity</th><th>Weight</th><th>Dimensions</th><th>Volume</th></tr>
  </thead>
  <tbody>
    ${cartonRows}
  </tbody>
  <tfoot>
    <tr style="font-weight:bold;background:#f5f5f5">
      <td colspan="2">TOTAL</td>
      <td>${quantity} pcs</td>
      <td>${grossWeight} kg</td>
      <td>${cartons} cartons</td>
      <td>${totalVolume.toFixed(4)} CBM</td>
    </tr>
  </tfoot>
</table>
<div class="meta" style="margin-top:30px">
  <p>Shipping Marks: N/M | Package: ${cartons} cartons</p>
</div>
</body></html>`;
  };

  const copyPackingHTML = () => {
    const html = generatePackingHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([html], { type: 'text/plain' });
    navigator.clipboard.write([
      new ClipboardItem({
        'text/html': blob,
        'text/plain': textBlob,
      })
    ]).then(() => {
      setPackingCopied(true);
      if (!generatedAt) {
        const now = new Date().toISOString();
        setGeneratedAt(now);
        update({ packingListGeneratedAt: now });
      }
      setTimeout(() => setPackingCopied(false), 2000);
    }).catch(() => {
      navigator.clipboard.writeText(html);
      setPackingCopied(true);
      if (!generatedAt) {
        const now = new Date().toISOString();
        setGeneratedAt(now);
        update({ packingListGeneratedAt: now });
      }
      setTimeout(() => setPackingCopied(false), 2000);
    });
  };

  // Generate plain text version of the packing list
  const generatePackingPlainText = () => {
    const date = new Date().toISOString().split('T')[0];
    const cartonLines = Array.from({ length: cartons }, (_, i) => {
      const startQty = i * qtyPerCarton + 1;
      const endQty = Math.min((i + 1) * qtyPerCarton, quantity);
      const actualQty = endQty - startQty + 1;
      return `  Carton ${i + 1}: ${context.productName || '—'} | ${actualQty} pcs (No.${startQty}-${endQty}) | ${weightPerCarton.toFixed(2)} kg | ${length}×${width}×${height} cm | ${(length * width * height / 1000000).toFixed(4)} CBM`;
    }).join('\n');

    return `PACKING LIST
═══════════════════════════════════════════
Date: ${date} | Invoice No: ${context.invoiceNo || '—'}

── Summary ──
Total Cartons:  ${cartons}
Total Quantity: ${quantity} pcs
Gross Weight:   ${grossWeight} kg
Total Volume:   ${totalVolume.toFixed(4)} CBM

── Carton Breakdown ──
${cartonLines}

── TOTAL ──
${quantity} pcs | ${grossWeight} kg | ${cartons} cartons | ${totalVolume.toFixed(4)} CBM

Shipping Marks: N/M | Package: ${cartons} cartons`;
  };

  const copyPackingPlainText = () => {
    const text = generatePackingPlainText();
    navigator.clipboard.writeText(text).then(() => {
      setPlainTextCopied(true);
      if (!generatedAt) {
        const now = new Date().toISOString();
        setGeneratedAt(now);
        update({ packingListGeneratedAt: now });
      }
      setTimeout(() => setPlainTextCopied(false), 2000);
    });
  };

  const saveToDocuments = async () => {
    setSavingDoc(true);
    setSaveDocMsg('');
    try {
      const res = await fetch('/api/user/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: 'packing_list',
          documentNo: context.invoiceNo || '',
          documentData: {
            formData: {
              invoiceNo: context.invoiceNo || '',
              date: new Date().toISOString().split('T')[0],
              totalCartons: cartons,
              totalQuantity: quantity,
              grossWeight,
              totalVolume: totalVolume.toFixed(4),
              packageDimensions: `${length}×${width}×${height} cm`,
            },
            lineItems: [{
              productName: context.productName || '',
              hsCode: context.hsCode || '',
              quantityPerCarton: qtyPerCarton,
              totalQuantity: quantity,
              cartons,
              weightPerCarton: weightPerCarton.toFixed(2),
              totalWeight: grossWeight,
              volumePerCarton: (length * width * height / 1000000).toFixed(4),
              totalVolume: totalVolume.toFixed(4),
            }],
          },
        }),
      });
      if (res.ok) {
        const now = new Date().toISOString();
        setGeneratedAt(now);
        update({ packingListGeneratedAt: now });
        setSaveDocMsg('✅ 已保存到「我的单据」');
      } else {
        const err = await res.json();
        setSaveDocMsg(`❌ 保存失败: ${err.error || '未知错误'}`);
      }
    } catch (e) {
      setSaveDocMsg('❌ 保存失败，请重试');
    }
    setSavingDoc(false);
    setTimeout(() => setSaveDocMsg(''), 5000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
        <p className="font-medium">装箱单预览</p>
        <p className="text-xs mt-1">已自动带入商品、数量、包装尺寸和重量信息。可逐箱查看内容。</p>
        {generatedAt && (
          <p className="text-xs mt-1 text-green-600">📅 生成时间：{new Date(generatedAt).toLocaleString('zh-CN')}</p>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600 mb-1">总箱数</p>
          <p className="text-xl font-bold text-blue-800">{cartons}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-xs text-purple-600 mb-1">总毛重</p>
          <p className="text-xl font-bold text-purple-800">{grossWeight} kg</p>
        </div>
        <div className="bg-teal-50 rounded-lg p-3 text-center">
          <p className="text-xs text-teal-600 mb-1">总体积</p>
          <p className="text-xl font-bold text-teal-800">{totalVolume.toFixed(4)} CBM</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <p className="text-xs text-amber-600 mb-1">每箱数量</p>
          <p className="text-xl font-bold text-amber-800">{qtyPerCarton} pcs</p>
        </div>
      </div>

      {/* Packing List Preview */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="font-bold text-gray-900 text-lg">PACKING LIST</h3>
          <span className="text-xs text-gray-400">{new Date().toISOString().split('T')[0]} | Invoice: {context.invoiceNo || '—'}</span>
        </div>

        {/* Per-carton breakdown */}
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b bg-gray-50">
              <th className="text-left py-2 px-2">箱号</th>
              <th className="text-left py-2 px-2">内容</th>
              <th className="text-center py-2 px-2">数量</th>
              <th className="text-right py-2 px-2">重量</th>
              <th className="text-right py-2 px-2">尺寸</th>
              <th className="text-right py-2 px-2">体积</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.min(cartons, 10) }, (_, i) => {
              const startQty = i * qtyPerCarton + 1;
              const endQty = Math.min((i + 1) * qtyPerCarton, quantity);
              const actualQty = endQty - startQty + 1;
              return (
                <tr key={i} className="border-b">
                  <td className="py-2 px-2 font-medium">Carton {i + 1}</td>
                  <td className="py-2 px-2">{context.productName || '—'}</td>
                  <td className="text-center py-2 px-2">{actualQty} pcs <span className="text-xs text-gray-400">(No.{startQty}-{endQty})</span></td>
                  <td className="text-right py-2 px-2">{weightPerCarton.toFixed(2)} kg</td>
                  <td className="text-right py-2 px-2 text-xs">{length}×{width}×{height} cm</td>
                  <td className="text-right py-2 px-2">{(length * width * height / 1000000).toFixed(4)} CBM</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-medium bg-gray-50">
              <td colSpan={2} className="py-2 px-2">合计 TOTAL</td>
              <td className="text-center py-2 px-2">{quantity} pcs</td>
              <td className="text-right py-2 px-2">{grossWeight} kg</td>
              <td className="text-right py-2 px-2 text-xs">{cartons} cartons</td>
              <td className="text-right py-2 px-2">{totalVolume.toFixed(4)} CBM</td>
            </tr>
          </tfoot>
        </table>

        {cartons > 10 && (
          <p className="text-xs text-gray-400 text-center">... 显示前 10 箱，共 {cartons} 箱</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={copyPackingHTML}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
        >
          <Copy className="w-4 h-4" />
          {packingCopied ? '已复制 HTML!' : '复制 HTML（富文本）'}
        </button>
        <button
          onClick={copyPackingPlainText}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <ClipboardList className="w-4 h-4" />
          {plainTextCopied ? '已复制纯文本!' : '复制纯文本'}
        </button>
        <button
          onClick={saveToDocuments}
          disabled={savingDoc}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          {savingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          保存到我的单据
        </button>
        <Link
          href="/tools/documents/packing-list"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          在装箱单工具中编辑
        </Link>
      </div>

      {saveDocMsg && (
        <p className="text-sm text-gray-600">{saveDocMsg}</p>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
        💡 提示：「复制 HTML」可粘贴到 Word/邮件中保留格式；「复制纯文本」适合粘贴到聊天工具。PDF 导出即将开放。
      </div>
    </div>
  );
}

// ─── Step 7: Exchange Rate & Cost ────────────────────────────────
function Step7ExchangeRate({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const update = (patch: Record<string, any>) => autoSave(patch);

  // Parse inputs
  const rate = parseFloat(context.exchangeRate) || 0;
  const quantity = parseFloat(context.quantity) || 0;
  const unitPrice = parseFloat(context.unitPrice) || 0;
  const grossWeight = parseFloat(context.grossWeight) || 0;
  const packageLength = parseFloat(context.packageLength) || 0;
  const packageWidth = parseFloat(context.packageWidth) || 0;
  const packageHeight = parseFloat(context.packageHeight) || 0;
  const totalCartons = parseInt(context.totalCartons) || 1;
  const cbm = (packageLength * packageWidth * packageHeight * totalCartons) / 1000000;
  const volumetricWeight = (packageLength * packageWidth * packageHeight) / 5000 * totalCartons;

  // Cost calculations
  const productCostUSD = quantity * unitPrice;
  const productCostCNY = productCostUSD * rate;

  // Shipping estimate reference values
  const airRatePerKg = parseFloat(context.airRatePerKg) || 35; // ¥/kg reference
  const seaRatePerCbm = parseFloat(context.seaRatePerCbm) || 1200; // ¥/CBM reference
  const expressRatePerKg = parseFloat(context.expressRatePerKg) || 55; // ¥/kg reference

  // Calculate shipping estimates
  const airShippingEstimate = grossWeight * airRatePerKg;
  const seaShippingEstimate = cbm * seaRatePerCbm;
  const expressShippingEstimate = Math.max(grossWeight, volumetricWeight) * expressRatePerKg;

  // User selected shipping method
  const shippingMethod = context.shippingMethod || 'sea';
  let selectedShippingEstimate = seaShippingEstimate;
  if (shippingMethod === 'air') selectedShippingEstimate = airShippingEstimate;
  if (shippingMethod === 'express') selectedShippingEstimate = expressShippingEstimate;

  // Manual override
  const manualShippingCost = parseFloat(context.shippingCost) || 0;
  const effectiveShippingCost = manualShippingCost > 0 ? manualShippingCost : selectedShippingEstimate;

  // Total cost
  const totalCostCNY = productCostCNY + effectiveShippingCost;
  const totalCostUSD = rate > 0 ? totalCostCNY / rate : 0;
  const perUnitCostCNY = quantity > 0 ? totalCostCNY / quantity : 0;

  return (
    <div className="space-y-5">
      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">仅供估算，实际以物流商报价为准</p>
            <p className="text-xs mt-1">以下运费为参考估算值，实际运费受航线、季节、货物属性等因素影响。建议向多家物流商询价后确认。</p>
          </div>
        </div>
      </div>

      {/* Exchange Rate Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="汇率 (USD → CNY)" required hint="请手动输入当前汇率，可参考银行牌价或汇率查询工具">
          <TextInput value={context.exchangeRate} onChange={(v) => update({ exchangeRate: v })} placeholder="例如：7.25" type="number" />
        </FormField>
        <div className="flex items-end">
          <Link
            href="/tools/exchange-rate"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> 查询汇率参考
          </Link>
        </div>
      </div>

      {/* Product Cost */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-teal-600" />
          商品成本
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center">
            <p className="text-xs text-gray-500">数量 × 单价</p>
            <p className="text-lg font-bold text-gray-900">{quantity} × ${unitPrice.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">商品总价 (USD)</p>
            <p className="text-lg font-bold text-gray-900">${productCostUSD.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">汇率</p>
            <p className="text-lg font-bold text-gray-900">{rate || '—'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">商品总价 (CNY)</p>
            <p className="text-lg font-bold text-teal-700">¥{productCostCNY.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Shipping Estimate */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-600" />
          运费估算
        </h3>

        {/* Shipping method selector */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { key: 'sea', label: '海运', desc: `¥${seaRatePerCbm}/CBM`, value: seaShippingEstimate },
            { key: 'air', label: '空运', desc: `¥${airRatePerKg}/kg`, value: airShippingEstimate },
            { key: 'express', label: '快递', desc: `¥${expressRatePerKg}/kg`, value: expressShippingEstimate },
          ].map((method) => (
            <button
              key={method.key}
              onClick={() => update({ shippingMethod: method.key })}
              className={`p-3 rounded-lg border text-center transition-all ${
                shippingMethod === method.key
                  ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500'
                  : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50'
              }`}
            >
              <p className={`text-sm font-medium ${shippingMethod === method.key ? 'text-teal-700' : 'text-gray-700'}`}>{method.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
              <p className={`text-lg font-bold mt-1 ${shippingMethod === method.key ? 'text-teal-700' : 'text-gray-900'}`}>
                ¥{method.value.toFixed(0)}
              </p>
            </button>
          ))}
        </div>

        {/* Reference rate inputs */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <FormField label="海运参考 (¥/CBM)">
            <TextInput value={context.seaRatePerCbm || '1200'} onChange={(v) => update({ seaRatePerCbm: v })} placeholder="1200" type="number" />
          </FormField>
          <FormField label="空运参考 (¥/kg)">
            <TextInput value={context.airRatePerKg || '35'} onChange={(v) => update({ airRatePerKg: v })} placeholder="35" type="number" />
          </FormField>
          <FormField label="快递参考 (¥/kg)">
            <TextInput value={context.expressRatePerKg || '55'} onChange={(v) => update({ expressRatePerKg: v })} placeholder="55" type="number" />
          </FormField>
        </div>

        {/* Manual override */}
        <FormField label="手动输入运费（覆盖估算值）" hint="如已从物流商获取报价，可直接输入实际运费">
          <TextInput value={context.shippingCost} onChange={(v) => update({ shippingCost: v })} placeholder="留空则使用估算值" type="number" />
        </FormField>

        {/* Cargo info summary */}
        <div className="bg-gray-50 rounded-lg p-3 mt-3 text-xs text-gray-500">
          <p className="font-medium text-gray-600 mb-1">货物参数</p>
          <div className="grid grid-cols-3 gap-2">
            <span>毛重: {grossWeight || '—'} kg</span>
            <span>体积: {cbm > 0 ? cbm.toFixed(4) : '—'} CBM</span>
            <span>体积重: {volumetricWeight > 0 ? volumetricWeight.toFixed(2) : '—'} kg</span>
          </div>
        </div>
      </div>

      {/* Total Cost Summary */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">总成本估算</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">商品成本</p>
            <p className="text-lg font-bold text-gray-900">¥{productCostCNY.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">运费 ({shippingMethod === 'sea' ? '海运' : shippingMethod === 'air' ? '空运' : '快递'})</p>
            <p className="text-lg font-bold text-gray-900">¥{effectiveShippingCost.toFixed(2)}</p>
          </div>
          <div className="text-center bg-white rounded-lg p-3 border border-green-200">
            <p className="text-xs text-gray-500">总成本</p>
            <p className="text-2xl font-bold text-green-700">¥{totalCostCNY.toFixed(2)}</p>
            {rate > 0 && <p className="text-xs text-green-600">≈ ${totalCostUSD.toFixed(2)} USD</p>}
          </div>
        </div>
        {quantity > 0 && (
          <div className="mt-3 pt-3 border-t border-green-200 text-center">
            <p className="text-xs text-gray-500">单件总成本</p>
            <p className="text-xl font-bold text-green-700">¥{perUnitCostCNY.toFixed(2)} / 件</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 8: Quote Template ──────────────────────────────────────
function Step8QuoteTemplate({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const update = (patch: Record<string, any>) => autoSave(patch);
  const [copiedLogistics, setCopiedLogistics] = useState(false);
  const [copiedCustomer, setCopiedCustomer] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const [saveDocMsg, setSaveDocMsg] = useState('');

  // Gather data from context
  const productName = context.productName || '—';
  const hsCode = context.hsCode || '—';
  const quantity = context.quantity || '—';
  const unitPrice = context.unitPrice || '0.00';
  const totalUSD = (parseFloat(context.quantity) || 0) * (parseFloat(context.unitPrice) || 0);
  const rate = parseFloat(context.exchangeRate) || 0;
  const destinationCountry = context.destinationCountry || '—';
  const destinationCity = context.destinationCity || '';
  const packageLength = context.packageLength || '—';
  const packageWidth = context.packageWidth || '—';
  const packageHeight = context.packageHeight || '—';
  const grossWeight = context.grossWeight || '—';
  const totalCartons = context.totalCartons || '1';
  const cbm = ((parseFloat(context.packageLength) || 0) * (parseFloat(context.packageWidth) || 0) * (parseFloat(context.packageHeight) || 0) * (parseInt(context.totalCartons) || 1)) / 1000000;
  const shippingCost = parseFloat(context.shippingCost) || 0;
  const totalCNY = totalUSD * rate + shippingCost;
  const productDescription = context.productDescription || '';
  const material = context.material || '';
  const buyerName = context.buyerName || '';

  // Logistics inquiry template
  const logisticsTemplate = `【物流询价】

商品名称：${productName}
商品描述：${productDescription || productName}
HS编码：${hsCode}
材质：${material || '—'}

数量：${quantity} 件
单价：USD ${unitPrice}
总货值：USD ${totalUSD.toFixed(2)}

包装信息：
- 单箱尺寸：${packageLength} × ${packageWidth} × ${packageHeight} cm
- 总箱数：${totalCartons} 箱
- 总毛重：${grossWeight} kg
- 总体积：${cbm.toFixed(4)} CBM

目的信息：
- 目的国家：${destinationCountry}
- 目的城市：${destinationCity}
- 收件人：${buyerName || '—'}

请报价以下运输方式：
□ 海运（整柜/拼箱）
□ 空运
□ 快递

期望发货时间：尽快
特殊要求：${context.isSensitiveGoods ? '含敏感货物（电池/液体等），请确认是否可接' : '无'}

谢谢！`;

  // Customer quotation template
  const customerTemplate = `报 价 单
QUOTATION

──────────────────────────────

商品名称：${productName}
HS编码：${hsCode}
数量：${quantity} 件

──────────────────────────────

费用明细：
• 商品费用：${quantity} × USD ${unitPrice} = USD ${totalUSD.toFixed(2)}
${shippingCost > 0 ? `• 运费估算：CNY ${shippingCost.toFixed(2)}\n` : ''}• 汇率参考：1 USD = ${rate || '—'} CNY
${rate > 0 ? `• 商品总价：CNY ${(totalUSD * rate).toFixed(2)}\n` : ''}${shippingCost > 0 ? `• 总成本估算：CNY ${totalCNY.toFixed(2)}\n` : ''}
──────────────────────────────

包装信息：
• 尺寸：${packageLength} × ${packageWidth} × ${packageHeight} cm
• 重量：${grossWeight} kg
• 体积：${cbm.toFixed(4)} CBM
• 箱数：${totalCartons} 箱

目的国家：${destinationCountry}

──────────────────────────────

备注：
• 以上运费为估算值，实际以物流商报价为准
• 报价有效期：30天
• 付款方式：T/T
• 交货期：确认后 ${context.productionDays || '15'} 天`;

  const copyToClipboard = async (text: string, type: 'logistics' | 'customer') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'logistics') {
        setCopiedLogistics(true);
        setTimeout(() => setCopiedLogistics(false), 2000);
      } else {
        setCopiedCustomer(true);
        setTimeout(() => setCopiedCustomer(false), 2000);
      }
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      if (type === 'logistics') {
        setCopiedLogistics(true);
        setTimeout(() => setCopiedLogistics(false), 2000);
      } else {
        setCopiedCustomer(true);
        setTimeout(() => setCopiedCustomer(false), 2000);
      }
    }
  };

  const saveToDocuments = async () => {
    setSavingDoc(true);
    setSaveDocMsg('');
    try {
      const res = await fetch('/api/user/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: 'quotation',
          documentNo: context.invoiceNo || '',
          documentData: {
            formData: {
              productName,
              hsCode,
              quantity,
              unitPrice,
              totalUSD: totalUSD.toFixed(2),
              destinationCountry,
              destinationCity,
              packageDimensions: `${packageLength} × ${packageWidth} × ${packageHeight} cm`,
              grossWeight,
              totalCartons,
              cbm: cbm.toFixed(4),
              exchangeRate: rate || null,
              shippingCost: shippingCost || null,
              totalCNY: totalCNY.toFixed(2),
              buyerName,
              date: new Date().toISOString().split('T')[0],
            },
            logisticsTemplate,
            customerTemplate,
          },
        }),
      });
      if (res.ok) {
        update({
          quotationGenerated: true,
          quotationDate: new Date().toISOString(),
          quotationLogisticsTemplate: logisticsTemplate,
          quotationCustomerTemplate: customerTemplate,
        });
        setSaveDocMsg('✅ 已保存到「我的单据」');
      } else {
        const err = await res.json();
        setSaveDocMsg(`❌ 保存失败: ${err.error || '未知错误'}`);
      }
    } catch (e) {
      setSaveDocMsg('❌ 保存失败，请重试');
    }
    setSavingDoc(false);
    setTimeout(() => setSaveDocMsg(''), 5000);
  };

  return (
    <div className="space-y-5">
      <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 text-sm text-purple-800">
        <p className="font-medium">报价模板已自动生成</p>
        <p className="text-xs mt-1">基于前面步骤填写的商品、包装、目的地信息，已生成物流询价模板和客户报价说明。可直接复制使用。</p>
      </div>

      {/* Logistics Inquiry Template */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-blue-900 text-sm">物流商询价模板</h3>
          </div>
          <button
            onClick={() => copyToClipboard(logisticsTemplate, 'logistics')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              copiedLogistics
                ? 'bg-green-100 text-green-700'
                : 'bg-white text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            {copiedLogistics ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copiedLogistics ? '已复制' : '复制'}
          </button>
        </div>
        <pre className="p-4 text-xs text-gray-700 whitespace-pre-wrap font-mono bg-white leading-relaxed max-h-64 overflow-y-auto">
          {logisticsTemplate}
        </pre>
      </div>

      {/* Customer Quotation Template */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-green-50 border-b border-green-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-600" />
            <h3 className="font-semibold text-green-900 text-sm">客户报价说明</h3>
          </div>
          <button
            onClick={() => copyToClipboard(customerTemplate, 'customer')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              copiedCustomer
                ? 'bg-green-100 text-green-700'
                : 'bg-white text-green-700 hover:bg-green-100 border border-green-200'
            }`}
          >
            {copiedCustomer ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copiedCustomer ? '已复制' : '复制'}
          </button>
        </div>
        <pre className="p-4 text-xs text-gray-700 whitespace-pre-wrap font-mono bg-white leading-relaxed max-h-64 overflow-y-auto">
          {customerTemplate}
        </pre>
      </div>

      {/* Summary Table */}
      <div className="border border-gray-200 rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-gray-900 text-lg">报 价 单</h3>
          <span className="text-xs text-gray-400">QUOTATION</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400">商品</p>
            <p className="font-medium">{productName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">目的国</p>
            <p className="font-medium">{destinationCountry}</p>
          </div>
        </div>

        <table className="w-full text-sm border-t">
          <thead>
            <tr className="text-xs text-gray-400 border-b">
              <th className="text-left py-2">项目</th>
              <th className="text-center py-2">数量</th>
              <th className="text-right py-2">单价</th>
              <th className="text-right py-2">金额</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">商品费用</td>
              <td className="text-center">{quantity}</td>
              <td className="text-right">${unitPrice}</td>
              <td className="text-right font-medium">${totalUSD.toFixed(2)}</td>
            </tr>
            {shippingCost > 0 && (
              <tr className="border-b">
                <td className="py-2">运费</td>
                <td className="text-center">—</td>
                <td className="text-right">—</td>
                <td className="text-right font-medium">¥{shippingCost.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="text-right py-2 font-medium">总计 (CNY)</td>
              <td className="text-right py-2 font-bold text-teal-700 text-lg">¥{totalCNY.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="text-xs text-gray-400 border-t pt-2">
          <p>有效期：30天 | 付款方式：T/T | 交货期：确认后 {context.productionDays || '15'} 天</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={saveToDocuments}
          disabled={savingDoc}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          {savingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          保存到我的单据
        </button>
        <Link
          href="/tools/documents/quotation"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          在报价单工具中编辑
        </Link>
      </div>

      {saveDocMsg && (
        <p className="text-sm text-gray-600">{saveDocMsg}</p>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
        💡 提示：「物流询价模板」发给物流商获取报价；「客户报价说明」发给客户确认。PDF 导出即将开放。
      </div>
    </div>
  );
}

// ─── Step 9: Complete ────────────────────────────────────────────
function Step9Complete({ task, taskId, context, completedSteps, autoSave }: {
  task: TaskChainData | null;
  taskId: string;
  context: Record<string, any>;
  completedSteps: number[];
  autoSave: (p: Record<string, any>) => void;
}) {
  const [archiving, setArchiving] = useState(false);
  const [archiveStatus, setArchiveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const progressPercent = Math.round((completedSteps.length / 10) * 100);
  const isFullyComplete = completedSteps.length === 10;

  const archiveTask = async () => {
    setArchiving(true);
    setArchiveStatus('idle');
    try {
      const res = await fetch(`/api/task-chains/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (res.ok) {
        setArchiveStatus('success');
        autoSave({ archived: true, archivedAt: new Date().toISOString() });
      } else {
        setArchiveStatus('error');
      }
    } catch {
      setArchiveStatus('error');
    } finally {
      setArchiving(false);
    }
  };

  // Determine which documents are available
  const documents = [
    {
      label: '商业发票',
      icon: FileText,
      done: completedSteps.includes(5),
      detail: context.invoiceNo ? `No. ${context.invoiceNo}` : '已生成',
      generatedAt: context.invoiceGeneratedAt || '',
      href: '/tools/commercial-invoice',
      docType: 'commercial_invoice',
    },
    {
      label: '装箱单',
      icon: ClipboardList,
      done: completedSteps.includes(6),
      detail: context.grossWeight ? `${context.grossWeight}kg / ${context.totalCartons || 1}箱` : '已生成',
      generatedAt: context.packingListGeneratedAt || '',
      href: '/tools/documents/packing-list',
      docType: 'packing_list',
    },
    {
      label: '报价模板',
      icon: Sparkles,
      done: completedSteps.includes(8) || context.quotationGenerated,
      detail: context.quotationGenerated ? `生成于 ${new Date(context.quotationDate).toLocaleDateString()}` : '已生成',
      generatedAt: context.quotationDate || '',
      href: '/tools/documents/quotation',
      docType: 'quotation',
    },
  ];

  const nextSteps = [
    {
      label: '联系物流商询价',
      description: '复制询价模板发送给物流商，获取实际运费报价',
      icon: Phone,
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
      href: '/tools/shipping-calculator',
    },
    {
      label: '准备报关资料',
      description: '确认商业发票、装箱单、报关委托书等资料齐全',
      icon: ClipboardCheck,
      color: 'bg-amber-50',
      iconColor: 'text-amber-600',
      href: '/tools/customs-declaration',
    },
    {
      label: '查看我的单据',
      description: '管理和下载已生成的所有单据',
      icon: FileText,
      color: 'bg-purple-50',
      iconColor: 'text-purple-600',
      href: '/workspace/documents',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Completion Status */}
      <div className={`rounded-xl border p-5 text-center ${
        isFullyComplete
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
          : 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200'
      }`}>
        {isFullyComplete ? (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-1">任务已完成！🎉</h3>
            <p className="text-sm text-green-600">所有步骤已完成，已生成全套发货资料</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
              <Package className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-teal-800 mb-1">任务进度 {completedSteps.length}/10</h3>
            <p className="text-sm text-teal-600">已完成 {completedSteps.length} 个步骤，还有 {10 - completedSteps.length} 个待完成</p>
            <div className="w-full max-w-xs mx-auto h-3 bg-white rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-xs text-teal-500 mt-2">{progressPercent}% 完成</p>
          </>
        )}
      </div>

      {/* Generated Documents */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          已生成资料清单
        </h3>
        <div className="space-y-2">
          {documents.map((doc, idx) => {
            const DocIcon = doc.icon;
            return (
              <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                doc.done ? 'border-green-200 bg-green-50/50' : 'border-gray-100 bg-gray-50'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.done ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {doc.done ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <DocIcon className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${doc.done ? 'text-green-800' : 'text-gray-400'}`}>{doc.label}</p>
                  <p className="text-xs text-gray-500 truncate">{doc.detail}</p>
                  {doc.done && doc.generatedAt && (
                    <p className="text-xs text-gray-400 mt-0.5">📅 {new Date(doc.generatedAt).toLocaleString('zh-CN')}</p>
                  )}
                </div>
                {doc.done && (
                  <div className="flex items-center gap-1">
                    <Link
                      href={doc.href}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-teal-600 hover:bg-teal-50 rounded transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      查看
                    </Link>
                    <button
                      onClick={() => {
                        // Copy summary to clipboard
                        const summary = `${doc.label}\n${doc.detail}\n生成时间: ${doc.generatedAt ? new Date(doc.generatedAt).toLocaleString('zh-CN') : '—'}`;
                        navigator.clipboard.writeText(summary);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      复制
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/user/documents', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              documentType: doc.docType,
                              documentNo: context.invoiceNo || '',
                              documentData: {
                                formData: context,
                                generatedAt: doc.generatedAt || new Date().toISOString(),
                              },
                            }),
                          });
                          if (res.ok) {
                            alert('✅ 已保存到「我的单据」');
                          } else {
                            alert('❌ 保存失败');
                          }
                        } catch {
                          alert('❌ 保存失败，请重试');
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded transition-colors"
                    >
                      <Save className="w-3 h-3" />
                      保存
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">📄 PDF 导出即将开放，敬请期待</p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-500" />
          下一步建议
        </h3>
        <div className="space-y-2">
          {nextSteps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <Link
                key={idx}
                href={step.href}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all"
              >
                <div className={`w-8 h-8 rounded-lg ${step.color} flex items-center justify-center`}>
                  <StepIcon className={`w-4 h-4 ${step.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{step.label}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">操作</h3>
        <div className="flex flex-wrap gap-3">
          {/* Archive / Complete Task */}
          <button
            onClick={archiveTask}
            disabled={archiving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
              archiveStatus === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            } disabled:opacity-50 shadow-sm`}
          >
            {archiving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : archiveStatus === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Archive className="w-4 h-4" />
            )}
            {archiving ? '归档中...' : archiveStatus === 'success' ? '已归档' : archiveStatus === 'error' ? '重试归档' : '保存并归档任务'}
          </button>

          {/* Create New Task */}
          <Link
            href="/workspace/task-chains/shipping/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            创建新任务
          </Link>

          {/* Back to Workspace */}
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Home className="w-4 h-4" />
            回工作台
          </Link>
        </div>

        {archiveStatus === 'error' && (
          <p className="text-xs text-red-500 mt-2">归档失败，请重试</p>
        )}
        {archiveStatus === 'success' && (
          <p className="text-xs text-green-600 mt-2">任务已归档，可在任务列表中查看</p>
        )}
      </div>
    </div>
  );
}
