'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'cookie_consent_v1';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      if (!consent) {
        // Show after 1s delay for smoother UX
        const timer = setTimeout(() => setShow(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch { /* localStorage unavailable */ }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    } catch {}
    setShow(false);
  };

  if (!mounted || !show) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie 同意"
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          {/* Icon + Text */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="shrink-0 mt-0.5">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="font-medium text-gray-900 dark:text-white mb-0.5">隐私与 Cookie 声明</p>
              <p className="text-xs sm:text-sm leading-relaxed">
                我们使用 Cookie 优化您的浏览体验。继续访问即代表您同意我们的
                <Link href="/privacy" className="text-teal-600 dark:text-teal-400 underline hover:text-teal-700">隐私政策</Link>
                与
                <Link href="/terms" className="text-teal-600 dark:text-teal-400 underline hover:text-teal-700">用户协议</Link>
                。
              </p>
            </div>
          </div>
          {/* Accept Button */}
          <button
            onClick={handleAccept}
            className="shrink-0 w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white text-sm font-semibold rounded-xl shadow-md hover:from-teal-700 hover:to-teal-600 transition-all min-h-[44px]"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
}
