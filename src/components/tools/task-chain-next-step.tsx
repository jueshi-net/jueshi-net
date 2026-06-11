// src/components/tools/task-chain-next-step.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Trash2, Save, LogIn, Check, X, Package, MapPin, DollarSign, FileText, Calculator, CheckSquare } from 'lucide-react';
import { getTaskChain, clearTaskChain, saveTaskChain, type TaskChainContext } from '@/lib/task-chain';
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

type ToastType = 'saved' | 'cleared' | 'detected' | null;

export function TaskChainNextStep({ sourceTool, steps, className = '' }: TaskChainNextStepProps) {
  const [context, setContext] = useState<TaskChainContext | null>(null);
  const [cleared, setCleared] = useState(false);
  const [toast, setToast] = useState<ToastType>(null);
  const [workspacePrompt, setWorkspacePrompt] = useState<'login' | 'coming-soon' | null>(null);

  useEffect(() => {
    const data = getTaskChain();
    setContext(data);
    if (data) {
      setToast('detected');
      setTimeout(() => setToast(null), 3000);
    }
  }, []);

  const showToast = (type: ToastType) => {
    setToast(type);
    setTimeout(() => setToast(null), 3000);
  };

  const handleClear = () => {
    clearTaskChain();
    setContext(null);
    setCleared(true);
    showToast('cleared');
    trackEvent.custom(sourceTool, 'task_chain_clear');
  };

  const handleNextClick = (step: NextStepLink) => {
    trackEvent.custom(sourceTool, 'task_chain_next_click');
    if (context) {
      saveTaskChain({ nextStep: step.href });
    }
  };

  const handleWorkspaceClick = () => {
    // Check if user is logged in by checking for session cookie or auth state
    const isLoggedIn = typeof document !== 'undefined' && document.cookie.includes('next-auth.session-token');
    
    if (!isLoggedIn) {
      setWorkspacePrompt('login');
      trackEvent.custom(sourceTool, 'task_chain_workspace_login_prompt');
    } else {
      setWorkspacePrompt('coming-soon');
      trackEvent.custom(sourceTool, 'task_chain_workspace_click');
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
    if (context.addressText) summaryItems.push({ label: '地址', value: context.addressText.length > 30 ? context.addressText.slice(0, 30) + '...' : context.addressText });
    if (context.shippingEstimate) summaryItems.push({ label: '运费估算', value: context.shippingEstimate });
    if (context.destinationCountry) summaryItems.push({ label: '目的地', value: context.destinationCountry });
  }

  // Don't show card if no context and no steps
  if (!context && steps.length === 0) return null;

  // Limit to 3 buttons max
  const displaySteps = steps.slice(0, 3);

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-5 ${className}`}>
      {/* Toast notification */}
      {toast && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <Check className="w-4 h-4" />
          {toast === 'saved' && '已保存到本机任务链'}
          {toast === 'cleared' && '已清除任务链数据'}
          {toast === 'detected' && '已检测到任务链数据'}
        </div>
      )}

      {/* Header */}
      <div className="mb-3">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-blue-600" />
          跨境发货下一步
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          已帮你暂存本次工具结果，可继续用于发票、报价单、运费估算或清单检查。
        </p>
      </div>

      {/* Context summary */}
      {summaryItems.length > 0 && (
        <div className="mb-4 bg-white/60 rounded-lg p-3 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1.5 font-medium">当前任务信息：</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {summaryItems.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                <span className="font-medium">{item.label}:</span>
                <span className="truncate max-w-[120px]">{item.value}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Next step buttons - vertical on mobile, horizontal on desktop */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mb-3">
        {displaySteps.map((step, i) => (
          <Link
            key={i}
            href={step.href}
            onClick={() => handleNextClick(step)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-lg text-sm font-medium text-gray-800 hover:text-blue-700 transition-all shadow-sm w-full sm:w-auto"
          >
            {step.icon}
            <span className="truncate">{step.label}</span>
          </Link>
        ))}
      </div>

      {/* Action buttons row */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-100">
        {/* Save to Workspace */}
        <button
          onClick={handleWorkspaceClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 rounded transition-colors"
        >
          <Save className="w-3 h-3" />
          保存到工作台
        </button>

        {/* Clear button */}
        {context && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-auto"
          >
            <Trash2 className="w-3 h-3" />
            清除任务链数据
          </button>
        )}
      </div>

      {/* Workspace prompt modal */}
      {workspacePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setWorkspacePrompt(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">保存到工作台</h4>
              <button onClick={() => setWorkspacePrompt(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {workspacePrompt === 'login' && (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  登录后可将这条发货任务保存到工作台，稍后继续填写。
                </p>
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')}`}
                  onClick={() => trackEvent.custom(sourceTool, 'task_chain_workspace_login_prompt')}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  去登录
                </Link>
              </>
            )}

            {workspacePrompt === 'coming-soon' && (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  保存到工作台功能即将开放。当前任务链数据已保存在本机浏览器。
                </p>
                <button
                  onClick={() => setWorkspacePrompt(null)}
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
                >
                  知道了
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Preset step configurations for each tool
export const TASK_CHAIN_STEPS = {
  'hs-code': [
    { label: '填入商业发票', href: '/tools/documents/commercial-invoice', icon: <FileText className="w-4 h-4" /> },
    { label: '估算运费', href: '/tools/shipping-calculator', icon: <Calculator className="w-4 h-4" /> },
    { label: '换算申报价值', href: '/tools/exchange-rate', icon: <DollarSign className="w-4 h-4" /> },
  ],
  'exchange-rate': [
    { label: '用于报价单', href: '/tools/documents/quotation', icon: <FileText className="w-4 h-4" /> },
    { label: '填入商业发票', href: '/tools/documents/commercial-invoice', icon: <FileText className="w-4 h-4" /> },
    { label: '估算总成本', href: '/tools/shipping-calculator', icon: <Calculator className="w-4 h-4" /> },
  ],
  'shipping-calculator': [
    { label: '整理收件地址', href: '/tools/address-formatter', icon: <MapPin className="w-4 h-4" /> },
    { label: '检查集运清单', href: '/checklists/first-shipping-checklist', icon: <CheckSquare className="w-4 h-4" /> },
    { label: '填入商业发票', href: '/tools/documents/commercial-invoice', icon: <FileText className="w-4 h-4" /> },
  ],
  'address-formatter': [
    { label: '填入商业发票', href: '/tools/documents/commercial-invoice', icon: <FileText className="w-4 h-4" /> },
    { label: '检查集运清单', href: '/checklists/first-shipping-checklist', icon: <CheckSquare className="w-4 h-4" /> },
    { label: '估算运费', href: '/tools/shipping-calculator', icon: <Calculator className="w-4 h-4" /> },
  ],
  'postal-code': [
    { label: '整理收件地址', href: '/tools/address-formatter', icon: <MapPin className="w-4 h-4" /> },
    { label: '检查集运清单', href: '/checklists/first-shipping-checklist', icon: <CheckSquare className="w-4 h-4" /> },
    { label: '估算运费', href: '/tools/shipping-calculator', icon: <Calculator className="w-4 h-4" /> },
  ],
};
