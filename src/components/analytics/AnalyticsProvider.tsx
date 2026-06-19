"use client";

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initAnalytics, trackPageView, cleanupAnalytics } from '@/lib/analytics/client';

/**
 * Analytics Provider Inner - 实际使用 searchParams 的组件
 */
function AnalyticsProviderInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 初始化 analytics
    initAnalytics();

    // 清理函数
    return () => {
      cleanupAnalytics();
    };
  }, []);

  useEffect(() => {
    // 路由变化时追踪 page_view
    if (pathname) {
      trackPageView();
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}

/**
 * Analytics Provider - 全局初始化 analytics
 * 在 layout.tsx 中使用
 * 使用 Suspense 包装以支持 useSearchParams
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AnalyticsProviderInner>{children}</AnalyticsProviderInner>
    </Suspense>
  );
}
