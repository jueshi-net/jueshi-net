'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/header';
import FooterNew from '@/components/layout/footer-new';

export function PublicLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isUILab = pathname.startsWith('/ui-lab');
  const isV4Home = pathname === '/';
  const isResources = pathname === '/resources';
  const isResourcesSite = pathname.startsWith('/resources/site/');
  const isTools = pathname === '/tools';
  const isDestinations = pathname === '/destinations';
  const isGuides = pathname === '/guides';
  const isChecklists = pathname === '/checklists';
  const isTopics = pathname === '/topics';
  const isSearch = pathname === '/search';
  const isStarter = pathname.startsWith('/starter');
  const isPricing = pathname === '/pricing';
  const isBBS = pathname === '/bbs' || pathname.startsWith('/bbs/');
  const isFeedback = pathname === '/feedback';
  const isHelp = pathname === '/help';
  const isPaymentSuccess = pathname === '/payment/success';
  const isAiTools = pathname === '/ai-tools';
  const isAnalytics = pathname === '/analytics';
  const isBusiness = pathname === '/business';

  // 首页、UI Lab、资源页、工具页、目的地页、指南页、清单页、专题页、搜索页、新手资源、定价页、社区页、反馈页、帮助页、支付成功页、AI工具页、数据分析页、商业页使用各自的 shell，跳过公共 Header/Footer
  if (isUILab || isV4Home || isResources || isResourcesSite || isTools || isDestinations || isGuides || isChecklists || isTopics || isSearch || isStarter || isPricing || isBBS || isFeedback || isHelp || isPaymentSuccess || isAiTools || isAnalytics || isBusiness) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <FooterNew />
    </>
  );
}
