// src/components/tools/task-chain-next-step.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Trash2, Package, MapPin, DollarSign, FileText, Calculator, CheckSquare } from 'lucide-react';
import { getTaskChain, clearTaskChain, type TaskChainContext } from '@/lib/task-chain';
import { trackEvent } from '@/lib/analytics';

interface NextStepLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  params?: Record<string, string>;
}

interface TaskChainNextStepProps {
  sourceTool: string;
  steps: NextStepLink[];
  className?: string;
}

export function TaskChainNextStep({ sourceTool, steps, className = '' }: TaskChainNextStepProps) {
  const [context, setContext] = useState<TaskChainContext | null>(null);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setContext(getTaskChain());
  }, []);

  const handleClear = () => {
    clearTaskChain();
    setContext(null);
    setCleared(true);
    trackEvent.custom(sourceTool, 'task_chain_clear');
  };

  const handleNextClick = (step: NextStepLink) => {
    trackEvent.custom(sourceTool, 'task_chain_next_click');
    // Save nextStep to context
    if (context) {
      const { saveTaskChain } = require('@/lib/task-chain');
      saveTaskChain({ nextStep: step.href });
    }
  };

  if (cleared) return null;

  // Build summary items from context
  const summaryItems: { label: string; value: string }[] = [];
  if (context) {
    if (context.productName) summaryItems.push({ label: '商品', value: context.productName });
    if (context.hsCode) summaryItems.push({ label: 'HS编码', value: context.hsCode });
    if (context.convertedValue && context.currency) {
      summaryItems.push({ label: '金额', value: `${context.convertedValue} ${context.currency}` });
    } else if (context.declaredValue && context.currency) {
      summaryItems.push({ label: '申报价值', value: `${context.declaredValue} ${context.currency}` });
    }
    if (context.postalCode) summaryItems.push({ label: '邮编', value: context.postalCode });
    if (context.addressText) summaryItems.push({ label: '地址', value: context.addressText.slice(0, 30) + '...' });
    if (context.shippingEstimate) summaryItems.push({ label: '运费估算', value: context.shippingEstimate });
    if (context.destinationCountry) summaryItems.push({ label: '目的地', value: context.destinationCountry });
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 ${className}`}>
      <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
        <ArrowRight className="w-4 h-4 text-blue-600" />
        下一步可以做什么？
      </h3>

      {/* Context summary */}
      {summaryItems.length > 0 && (
        <div className="mb-4 bg-white/60 rounded-lg p-3 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1.5 font-medium">当前任务信息：</p>
          <div className="flex flex-wrap gap-2">
            {summaryItems.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                <span className="font-medium">{item.label}:</span>
                <span>{item.value}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Next step buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {steps.map((step, i) => (
          <Link
            key={i}
            href={step.href}
            onClick={() => handleNextClick(step)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-lg text-sm font-medium text-gray-800 hover:text-blue-700 transition-all shadow-sm"
          >
            {step.icon}
            {step.label}
          </Link>
        ))}
      </div>

      {/* Clear button */}
      {context && (
        <button
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          清除任务链数据
        </button>
      )}
    </div>
  );
}

// Preset step configurations for each tool
export const TASK_CHAIN_STEPS = {
  'hs-code': [
    { label: '去商业发票填写商品信息', href: '/tools/documents/commercial-invoice', icon: <FileText className="w-4 h-4" /> },
    { label: '去运费计算估算运输费用', href: '/tools/shipping-calculator', icon: <Calculator className="w-4 h-4" /> },
    { label: '去汇率换算估算申报价值', href: '/tools/exchange-rate', icon: <DollarSign className="w-4 h-4" /> },
  ],
  'exchange-rate': [
    { label: '去报价单使用换算金额', href: '/tools/documents/quotation', icon: <FileText className="w-4 h-4" /> },
    { label: '去商业发票使用申报价值', href: '/tools/documents/commercial-invoice', icon: <FileText className="w-4 h-4" /> },
    { label: '去运费计算估算总成本', href: '/tools/shipping-calculator', icon: <Calculator className="w-4 h-4" /> },
  ],
  'shipping-calculator': [
    { label: '去地址格式化整理收件地址', href: '/tools/address-formatter', icon: <MapPin className="w-4 h-4" /> },
    { label: '去集运发货清单', href: '/checklists/first-shipping-checklist', icon: <CheckSquare className="w-4 h-4" /> },
    { label: '去商业发票补充费用信息', href: '/tools/documents/commercial-invoice', icon: <FileText className="w-4 h-4" /> },
  ],
  'address-formatter': [
    { label: '去商业发票填写收件信息', href: '/tools/documents/commercial-invoice', icon: <FileText className="w-4 h-4" /> },
    { label: '去集运发货清单检查发货准备', href: '/checklists/first-shipping-checklist', icon: <CheckSquare className="w-4 h-4" /> },
    { label: '去运费计算估算费用', href: '/tools/shipping-calculator', icon: <Calculator className="w-4 h-4" /> },
  ],
  'postal-code': [
    { label: '去地址格式化整理收件地址', href: '/tools/address-formatter', icon: <MapPin className="w-4 h-4" /> },
    { label: '去集运发货清单', href: '/checklists/first-shipping-checklist', icon: <CheckSquare className="w-4 h-4" /> },
    { label: '去运费计算估算费用', href: '/tools/shipping-calculator', icon: <Calculator className="w-4 h-4" /> },
  ],
};
