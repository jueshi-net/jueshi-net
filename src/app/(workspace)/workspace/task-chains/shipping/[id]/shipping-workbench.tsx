'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Package, ArrowRight, ArrowLeft, Loader2, CheckCircle, Circle,
  ExternalLink, Save, AlertTriangle, Shield, MapPin, Calculator,
  FileText, Globe, Truck, ClipboardList, DollarSign, Sparkles,
  ChevronRight, RotateCcw, Download,
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
      const tc = data.data;
      setTask(tc);
      setCurrentStep(tc.currentStep || 0);
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
    const completedSteps = [...new Set([...(task.completedSteps || []), stepIndex])];
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
          completedSteps,
          currentStep: nextStep,
          status: stepIndex === 9 ? 'completed' : 'active',
        } : null);
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
  const completedSteps = task?.completedSteps || [];
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
            {currentStep === 9 && <Step9Complete task={task} context={context} completedSteps={completedSteps} />}
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

// ─── Step 0: Product Info ────────────────────────────────────────
function Step0ProductInfo({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const update = (patch: Record<string, any>) => autoSave(patch);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="商品名称" required>
        <TextInput value={context.productName} onChange={(v) => update({ productName: v })} placeholder="例如：蓝牙耳机" />
      </FormField>
      <FormField label="品牌">
        <TextInput value={context.brand} onChange={(v) => update({ brand: v })} placeholder="例如：Apple、Samsung" />
      </FormField>
      <FormField label="材质">
        <TextInput value={context.material} onChange={(v) => update({ material: v })} placeholder="例如：塑料、金属、棉" />
      </FormField>
      <FormField label="用途">
        <TextInput value={context.productUsage} onChange={(v) => update({ productUsage: v })} placeholder="例如：个人使用、商业用途" />
      </FormField>
      <FormField label="数量">
        <TextInput value={context.quantity} onChange={(v) => update({ quantity: v })} placeholder="例如：100" type="number" />
      </FormField>
      <FormField label="单价（USD）">
        <TextInput value={context.unitPrice} onChange={(v) => update({ unitPrice: v })} placeholder="例如：25.00" type="number" />
      </FormField>
      <FormField label="原产国">
        <TextInput value={context.originCountry} onChange={(v) => update({ originCountry: v })} placeholder="例如：中国" />
      </FormField>
      <div className="md:col-span-2">
        <CheckboxField
          checked={!!context.isSensitiveGoods}
          onChange={(v) => update({ isSensitiveGoods: v })}
          label="标记为敏感货物（含电池、液体、粉末等）"
        />
      </div>
    </div>
  );
}

// ─── Step 1: HS Code ─────────────────────────────────────────────
function Step1HSCode({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const update = (patch: Record<string, any>) => autoSave(patch);
  const [searchKeyword, setSearchKeyword] = useState('');

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
            <Link
              href={`/tools/hs-code?q=${encodeURIComponent(searchKeyword || context.productName || '')}`}
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 whitespace-nowrap"
            >
              <ExternalLink className="w-3 h-3" /> 查询
            </Link>
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

      {context.hsCode && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <p className="text-sm text-green-800 font-medium">已填写 HS 编码: {context.hsCode}</p>
          <p className="text-xs text-green-600 mt-1">该编码将自动带入商业发票和装箱单</p>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Compliance Check ────────────────────────────────────
function Step2Compliance({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const update = (patch: Record<string, any>) => autoSave(patch);

  const checks = [
    { key: 'hasBattery', label: '含电池（锂电池/干电池）' },
    { key: 'hasLiquid', label: '含液体' },
    { key: 'hasPowder', label: '含粉末' },
    { key: 'hasMagnetic', label: '含磁性材料' },
    { key: 'needsMSDS', label: '需要MSDS（材料安全数据表）' },
    { key: 'needsCertification', label: '需要特殊认证（CE/FCC/FDA等）' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
        <p className="font-medium">敏感/合规性检查</p>
        <p className="text-xs mt-1">勾选适用的项目，系统将提示对应的运输要求和注意事项。</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {checks.map(({ key, label }) => (
          <div key={key} className="border border-gray-100 rounded-lg p-3 hover:border-teal-200 transition-colors">
            <CheckboxField
              checked={!!context[key]}
              onChange={(v) => update({ [key]: v })}
              label={label}
            />
          </div>
        ))}
      </div>

      <FormField label="认证详情" hint="如有特殊认证需求，请详细说明">
        <TextInput value={context.certificationDetails} onChange={(v) => update({ certificationDetails: v })} placeholder="例如：需要CE认证、FCC认证" />
      </FormField>

      {Object.values(context).some((v, i) => checks.some(c => c.key === Object.keys(context)[i] && v === true)) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 inline mr-1" />
          <span>检测到敏感货物属性，请确保已了解相关运输限制和要求。</span>
        </div>
      )}

      <Link
        href="/tools/sensitive-goods"
        target="_blank"
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        使用敏感货物查询工具
      </Link>
    </div>
  );
}

// ─── Step 3: CBM / Chargeable Weight ─────────────────────────────
function Step3CBM({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const update = (patch: Record<string, any>) => autoSave(patch);

  const length = parseFloat(context.packageLength) || 0;
  const width = parseFloat(context.packageWidth) || 0;
  const height = parseFloat(context.packageHeight) || 0;
  const weight = parseFloat(context.grossWeight) || 0;
  const cartons = parseInt(context.totalCartons) || 1;
  const volumetricWeight = (length * width * height * cartons) / 5000;
  const cbm = (length * width * height * cartons) / 1000000;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <FormField label="长 (cm)" required>
          <TextInput value={context.packageLength} onChange={(v) => update({ packageLength: v })} placeholder="cm" type="number" />
        </FormField>
        <FormField label="宽 (cm)" required>
          <TextInput value={context.packageWidth} onChange={(v) => update({ packageWidth: v })} placeholder="cm" type="number" />
        </FormField>
        <FormField label="高 (cm)" required>
          <TextInput value={context.packageHeight} onChange={(v) => update({ packageHeight: v })} placeholder="cm" type="number" />
        </FormField>
        <FormField label="毛重 (kg)" required>
          <TextInput value={context.grossWeight} onChange={(v) => update({ grossWeight: v })} placeholder="kg" type="number" />
        </FormField>
        <FormField label="箱数">
          <TextInput value={context.totalCartons} onChange={(v) => update({ totalCartons: v })} placeholder="1" type="number" />
        </FormField>
      </div>

      {/* Calculated Results */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600 mb-1">总体积 (CBM)</p>
          <p className="text-xl font-bold text-blue-800">{cbm.toFixed(4)}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-xs text-purple-600 mb-1">体积重 (kg)</p>
          <p className="text-xl font-bold text-purple-800">{volumetricWeight.toFixed(2)}</p>
        </div>
        <div className="bg-teal-50 rounded-lg p-3 text-center">
          <p className="text-xs text-teal-600 mb-1">计费重量 (kg)</p>
          <p className="text-xl font-bold text-teal-800">{Math.max(weight, volumetricWeight).toFixed(2)}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        计费重量 = max(实际毛重, 体积重)。体积重 = 长×宽×高÷5000（空运标准）。
      </p>
    </div>
  );
}

// ─── Step 4: Destination Address ─────────────────────────────────
function Step4Address({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const update = (patch: Record<string, any>) => autoSave(patch);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
        <p className="font-medium">目的国地址信息</p>
        <p className="text-xs mt-1">填写收货地址，系统将自动格式化用于商业发票和装箱单。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="国家/地区" required>
          <TextInput value={context.destinationCountry} onChange={(v) => update({ destinationCountry: v })} placeholder="例如：United States" />
        </FormField>
        <FormField label="城市" required>
          <TextInput value={context.destinationCity} onChange={(v) => update({ destinationCity: v })} placeholder="例如：Los Angeles" />
        </FormField>
        <FormField label="省/州">
          <TextInput value={context.destinationState} onChange={(v) => update({ destinationState: v })} placeholder="例如：California" />
        </FormField>
        <FormField label="邮编" required>
          <TextInput value={context.postalCode} onChange={(v) => update({ postalCode: v })} placeholder="例如：90001" />
        </FormField>
        <div className="md:col-span-2">
          <FormField label="详细地址" required>
            <TextInput value={context.destinationAddress} onChange={(v) => update({ destinationAddress: v })} placeholder="例如：123 Main Street, Suite 100" />
          </FormField>
        </div>
        <FormField label="收件人姓名">
          <TextInput value={context.buyerName} onChange={(v) => update({ buyerName: v })} placeholder="收件人/公司名" />
        </FormField>
        <FormField label="联系电话">
          <TextInput value={context.buyerContact} onChange={(v) => update({ buyerContact: v })} placeholder="例如：+1-213-555-0100" />
        </FormField>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/tools/postal-code"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> 邮编查询
        </Link>
        <Link
          href="/tools/address-formatter"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> 地址格式化
        </Link>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
        <p className="font-medium mb-1">格式提醒：</p>
        <p>• 美国地址格式：Street, City, State ZIP</p>
        <p>• 英国地址格式：Street, City, Postcode</p>
        <p>• 日本地址格式：〒ZIP Prefecture City Street</p>
      </div>
    </div>
  );
}

// ─── Step 5: Commercial Invoice ──────────────────────────────────
function Step5Invoice({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const update = (patch: Record<string, any>) => autoSave(patch);
  const totalAmount = (parseFloat(context.quantity) || 0) * (parseFloat(context.unitPrice) || 0);

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
        <p className="font-medium">商业发票预览</p>
        <p className="text-xs mt-1">系统已自动带入商品信息和公司资料。可前往工具进一步编辑。</p>
      </div>

      {/* Invoice Preview */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="font-bold text-gray-900">COMMERCIAL INVOICE</h3>
          <FormField label="">
            <TextInput value={context.invoiceNo} onChange={(v) => update({ invoiceNo: v })} placeholder="Invoice No." />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-400">Shipper</p>
            <p className="font-medium">（自动带入公司资料）</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Consignee</p>
            <p className="font-medium">{context.buyerName || '—'}</p>
            <p className="text-xs text-gray-500">{context.destinationAddress || ''}</p>
          </div>
        </div>

        <div className="border-t pt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b">
                <th className="text-left py-1">Description</th>
                <th className="text-center py-1">HS Code</th>
                <th className="text-center py-1">Qty</th>
                <th className="text-right py-1">Unit Price</th>
                <th className="text-right py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">{context.productName || '—'}</td>
                <td className="text-center">{context.hsCode || '—'}</td>
                <td className="text-center">{context.quantity || '—'}</td>
                <td className="text-right">${context.unitPrice || '0.00'}</td>
                <td className="text-right font-medium">${totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t pt-2">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-xl font-bold text-gray-900">${totalAmount.toFixed(2)} USD</p>
          </div>
        </div>
      </div>

      <Link
        href="/tools/commercial-invoice"
        target="_blank"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        在商业发票工具中编辑
      </Link>
    </div>
  );
}

// ─── Step 6: Packing List ────────────────────────────────────────
function Step6PackingList({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const cartons = parseInt(context.totalCartons) || 1;
  const grossWeight = parseFloat(context.grossWeight) || 0;
  const length = parseFloat(context.packageLength) || 0;
  const width = parseFloat(context.packageWidth) || 0;
  const height = parseFloat(context.packageHeight) || 0;

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
        <p className="font-medium">装箱单预览</p>
        <p className="text-xs mt-1">已自动带入商品、数量、包装尺寸和重量信息。</p>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 space-y-3">
        <h3 className="font-bold text-gray-900 border-b pb-2">PACKING LIST</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-400">总箱数</p>
            <p className="font-bold text-lg">{cartons}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-400">总毛重</p>
            <p className="font-bold text-lg">{grossWeight} kg</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-400">单箱尺寸</p>
            <p className="font-bold text-sm">{length}×{width}×{height} cm</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-400">商品名称</p>
            <p className="font-bold text-sm truncate">{context.productName || '—'}</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b">
              <th className="text-left py-1">Item</th>
              <th className="text-center py-1">Qty/Carton</th>
              <th className="text-center py-1">Cartons</th>
              <th className="text-center py-1">Total Qty</th>
              <th className="text-right py-1">NW/GW</th>
              <th className="text-right py-1">Measurement</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2">{context.productName || '—'}</td>
              <td className="text-center">{context.quantity || '—'}</td>
              <td className="text-center">{cartons}</td>
              <td className="text-center">{context.quantity || '—'}</td>
              <td className="text-right">{grossWeight} kg</td>
              <td className="text-right">{(length * width * height / 1000000).toFixed(4)} CBM</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Link
        href="/tools/documents/packing-list"
        target="_blank"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        在装箱单工具中编辑
      </Link>
    </div>
  );
}

// ─── Step 7: Exchange Rate & Cost ────────────────────────────────
function Step7ExchangeRate({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const update = (patch: Record<string, any>) => autoSave(patch);
  const rate = parseFloat(context.exchangeRate) || 0;
  const totalUSD = (parseFloat(context.quantity) || 0) * (parseFloat(context.unitPrice) || 0);
  const totalCNY = totalUSD * rate;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="汇率 (USD → CNY)" required>
          <TextInput value={context.exchangeRate} onChange={(v) => update({ exchangeRate: v })} placeholder="例如：7.25" type="number" />
        </FormField>
        <div>
          <Link
            href="/tools/exchange-rate"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors mt-6"
          >
            <ExternalLink className="w-3 h-3" /> 查询实时汇率
          </Link>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">成本估算</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center">
            <p className="text-xs text-gray-500">商品总价 (USD)</p>
            <p className="text-lg font-bold text-gray-900">${totalUSD.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">汇率</p>
            <p className="text-lg font-bold text-gray-900">{rate || '—'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">商品总价 (CNY)</p>
            <p className="text-lg font-bold text-teal-700">¥{totalCNY.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">单件成本 (CNY)</p>
            <p className="text-lg font-bold text-teal-700">
              ¥{context.quantity ? (totalCNY / parseInt(context.quantity)).toFixed(2) : '—'}
            </p>
          </div>
        </div>
      </div>

      <FormField label="运费估算（可选）">
        <TextInput value={context.shippingCost} onChange={(v) => update({ shippingCost: v })} placeholder="预估运费 (CNY)" type="number" />
      </FormField>
    </div>
  );
}

// ─── Step 8: Quote Template ──────────────────────────────────────
function Step8QuoteTemplate({ context, autoSave }: { context: Record<string, any>; autoSave: (p: Record<string, any>) => void }) {
  const totalUSD = (parseFloat(context.quantity) || 0) * (parseFloat(context.unitPrice) || 0);
  const rate = parseFloat(context.exchangeRate) || 0;
  const shippingCost = parseFloat(context.shippingCost) || 0;
  const totalCNY = totalUSD * rate + shippingCost;

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 text-sm text-purple-800">
        <p className="font-medium">报价模板已自动生成</p>
        <p className="text-xs mt-1">基于前面步骤的信息，系统已生成报价模板。可前往报价工具进一步编辑。</p>
      </div>

      {/* Quote Preview */}
      <div className="border border-gray-200 rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-gray-900 text-lg">报 价 单</h3>
          <span className="text-xs text-gray-400">QUOTATION</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400">商品</p>
            <p className="font-medium">{context.productName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">目的国</p>
            <p className="font-medium">{context.destinationCountry || '—'}</p>
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
              <td className="text-center">{context.quantity || '—'}</td>
              <td className="text-right">${context.unitPrice || '0.00'}</td>
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

      <Link
        href="/tools/documents/quotation"
        target="_blank"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        在报价单工具中编辑
      </Link>
    </div>
  );
}

// ─── Step 9: Complete ────────────────────────────────────────────
function Step9Complete({ task, context, completedSteps }: {
  task: TaskChainData | null;
  context: Record<string, any>;
  completedSteps: number[];
}) {
  const progressPercent = Math.round((completedSteps.length / 10) * 100);
  const isFullyComplete = completedSteps.length === 10;

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
            <h3 className="text-xl font-bold text-teal-800 mb-1">任务进度 {progressPercent}%</h3>
            <p className="text-sm text-teal-600">已完成 {completedSteps.length}/10 个步骤</p>
            <div className="w-full max-w-xs mx-auto h-3 bg-white rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </>
        )}
      </div>

      {/* Generated Documents */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">已生成资料</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: '商品信息', done: completedSteps.includes(0), value: context.productName },
            { label: 'HS编码', done: completedSteps.includes(1), value: context.hsCode },
            { label: '合规检查', done: completedSteps.includes(2) },
            { label: 'CBM/重量', done: completedSteps.includes(3), value: context.grossWeight ? `${context.grossWeight}kg` : undefined },
            { label: '目的地址', done: completedSteps.includes(4), value: context.destinationCountry },
            { label: '商业发票', done: completedSteps.includes(5) },
            { label: '装箱单', done: completedSteps.includes(6) },
            { label: '汇率成本', done: completedSteps.includes(7), value: context.exchangeRate ? `汇率 ${context.exchangeRate}` : undefined },
            { label: '报价模板', done: completedSteps.includes(8) },
          ].map((item, idx) => (
            <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg ${item.done ? 'bg-green-50' : 'bg-gray-50'}`}>
              {item.done ? (
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300 shrink-0" />
              )}
              <span className={`text-sm ${item.done ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {item.value && (
                <span className="text-xs text-gray-500 ml-auto truncate max-w-[100px]">{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">下一步建议</h3>
        <div className="space-y-2">
          <Link
            href="/tools/shipping-calculator"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">运费计算</p>
              <p className="text-xs text-gray-500">使用运费计算器估算实际运费</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <Link
            href="/workspace/documents"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">查看我的单据</p>
              <p className="text-xs text-gray-500">管理和下载已生成的单据</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <Link
            href="/workspace/task-chains"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">创建新任务</p>
              <p className="text-xs text-gray-500">开始新的发货任务链</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
