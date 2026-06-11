// src/components/tools/task-chain-next-step.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Trash2, Save, LogIn, Check, X, Monitor, CloudOff } from 'lucide-react';
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

/** Check if user is logged in by calling NextAuth session endpoint.
 *  Note: next-auth session cookie is httpOnly, so document.cookie won't work.
 *  We use /api/auth/session which returns the session if authenticated. */
function useIsLoggedIn(): boolean | null {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/session', { credentials: 'include' })
      .then(res => {
        if (cancelled) return null;
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        // NextAuth returns { user: {...}, expires: "..." } when logged in, or empty/null when not
        setIsLoggedIn(!!data?.user);
      })
      .catch(() => {
        if (!cancelled) setIsLoggedIn(false);
      });
    return () => { cancelled = true; };
  }, []);
  return isLoggedIn;
}

export function TaskChainNextStep({ sourceTool, steps, className = '' }: TaskChainNextStepProps) {
  const [context, setContext] = useState<TaskChainContext | null>(null);
  const [cleared, setCleared] = useState(false);
  const [toast, setToast] = useState<ToastType>(null);
  const [workspacePrompt, setWorkspacePrompt] = useState<'login' | 'coming-soon' | null>(null);
  const isLoggedIn = useIsLoggedIn();

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

  const handleLocalContinue = () => {
    trackEvent.custom(sourceTool, 'task_chain_local_continue');
    showToast('saved');
  };

  const handleWorkspaceClick = () => {
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

  // Determine if user is logged in AND has local data
  const showLocalDetectedBanner = isLoggedIn === true && context !== null && summaryItems.length > 0;

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-5 ${className}`}>
      {/* Toast notification */}
      {toast && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <Check className="w-4 h-4 shrink-0" />
          {toast === 'saved' && '已继续暂存在本机浏览器'}
          {toast === 'cleared' && '已清除本机暂存数据'}
          {toast === 'detected' && '已检测到本机暂存的任务数据'}
        </div>
      )}

      {/* Logged-in user with local data: show sync warning banner */}
      {showLocalDetectedBanner && (
        <div className="mb-3 flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <CloudOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-amber-900">检测到本机暂存的跨境发货任务。当前尚未同步到工作台。</p>
            <p className="text-xs text-amber-700 mt-0.5">换设备或清理浏览器数据后可能无法恢复。保存到工作台功能即将开放。</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-3">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-blue-600" />
          跨境发货下一步
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          本次工具结果已暂存在本机浏览器，可继续用于发票、报价单、运费估算或清单检查。换设备或清理浏览器数据后可能无法恢复。
        </p>
      </div>

      {/* Context summary */}
      {summaryItems.length > 0 && (
        <div className="mb-4 bg-white/60 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Monitor className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-500 font-medium">本机暂存的任务信息：</p>
          </div>
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
      {displaySteps.length > 0 && (
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
      )}

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

        {/* Continue local task (logged-in users only) */}
        {showLocalDetectedBanner && (
          <button
            onClick={handleLocalContinue}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 rounded transition-colors"
          >
            <Monitor className="w-3 h-3" />
            继续使用本机任务
          </button>
        )}

        {/* Clear button */}
        {context && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-auto"
          >
            <Trash2 className="w-3 h-3" />
            清除本机任务
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
                <div className="flex items-start gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <CloudOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    登录后，未来可将这条发货任务保存到工作台。当前数据仅暂存在本机浏览器，换设备或清理缓存后可能丢失。
                  </p>
                </div>
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/')}`}
                  onClick={() => trackEvent.custom(sourceTool, 'task_chain_workspace_login_prompt')}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  去登录并继续
                </Link>
                <p className="text-xs text-gray-400 text-center mt-2">登录后本机暂存数据不会丢失</p>
              </>
            )}

            {workspacePrompt === 'coming-soon' && (
              <>
                <div className="flex items-start gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <CloudOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    保存到工作台功能即将开放。当前任务链仍仅暂存在本机浏览器，尚未保存到云端。
                  </p>
                </div>
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
    { label: '填入商业发票', href: '/tools/documents/commercial-invoice', icon: <span className="text-sm">📄</span> },
    { label: '估算运费', href: '/tools/shipping-calculator', icon: <span className="text-sm">🧮</span> },
    { label: '换算申报价值', href: '/tools/exchange-rate', icon: <span className="text-sm">💱</span> },
  ],
  'exchange-rate': [
    { label: '用于报价单', href: '/tools/documents/quotation', icon: <span className="text-sm">📄</span> },
    { label: '填入商业发票', href: '/tools/documents/commercial-invoice', icon: <span className="text-sm">📄</span> },
    { label: '估算总成本', href: '/tools/shipping-calculator', icon: <span className="text-sm">🧮</span> },
  ],
  'shipping-calculator': [
    { label: '整理收件地址', href: '/tools/address-formatter', icon: <span className="text-sm">📍</span> },
    { label: '检查集运清单', href: '/checklists/first-shipping-checklist', icon: <span className="text-sm">✅</span> },
    { label: '填入商业发票', href: '/tools/documents/commercial-invoice', icon: <span className="text-sm">📄</span> },
  ],
  'address-formatter': [
    { label: '填入商业发票', href: '/tools/documents/commercial-invoice', icon: <span className="text-sm">📄</span> },
    { label: '检查集运清单', href: '/checklists/first-shipping-checklist', icon: <span className="text-sm">✅</span> },
    { label: '估算运费', href: '/tools/shipping-calculator', icon: <span className="text-sm">🧮</span> },
  ],
  'postal-code': [
    { label: '整理收件地址', href: '/tools/address-formatter', icon: <span className="text-sm">📍</span> },
    { label: '检查集运清单', href: '/checklists/first-shipping-checklist', icon: <span className="text-sm">✅</span> },
    { label: '估算运费', href: '/tools/shipping-calculator', icon: <span className="text-sm">🧮</span> },
  ],
};
