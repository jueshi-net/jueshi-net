"use client";

import { useEffect, useState } from "react";
import { Lock, X, Sparkles, ArrowRight } from "lucide-react";

export interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onLogin?: () => void;
  onUpgrade?: () => void;
}

/**
 * Paywall Modal — Apple 级极简毛玻璃质感 (Glassmorphism)
 * 
 * 纯 React + Tailwind CSS 实现，零额外依赖。
 * 当用户未登录或试用次数耗尽时弹出，引导登录/升级。
 * 
 * Usage:
 *   <PaywallModal
 *     isOpen={showPaywall}
 *     onClose={() => setShowPaywall(false)}
 *     title="每日导出次数已用尽"
 *     description="登录解锁无限导出，或升级高级版解锁 AI 工具"
 *     onLogin={() => router.push('/login')}
 *     onUpgrade={() => router.push('/pricing')}
 *   />
 */
export default function PaywallModal({
  isOpen,
  onClose,
  title = "高级功能需要解锁",
  description = "登录免费账号即可体验更多功能，或升级高级版解锁全部权益。",
  onLogin,
  onUpgrade,
}: PaywallModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Trigger animation after mount
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      // Delay unmount until animation finishes
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal Panel — Mobile-first: w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto */}
      <div
        className={`relative w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto transform rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 p-6 text-left shadow-2xl transition-all duration-300 ${
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={onClose}
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Lock Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 mb-4 shadow-lg shadow-teal-500/25">
          <Lock className="h-7 w-7 text-white" />
        </div>

        {/* Title */}
        <h3
          id="paywall-title"
          className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-2"
        >
          {title}
        </h3>

        {/* Description */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Feature highlights */}
        <div className="space-y-2.5 mb-6 rounded-xl bg-gray-50/80 dark:bg-gray-700/40 p-4">
          {[
            { icon: "📊", text: "无限导出 Word / PNG / PDF 单据" },
            { icon: "🤖", text: "AI 文案 / 翻译 / 摘要高级额度" },
            { icon: "🚀", text: "优先使用新上线的高级工具" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-base">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          {onLogin && (
            <button
              type="button"
              onClick={onLogin}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              立即登录解锁
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {onUpgrade && (
            <button
              type="button"
              onClick={onUpgrade}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/60 dark:bg-gray-700/60 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-[0.98]"
            >
              查看高级版方案
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
