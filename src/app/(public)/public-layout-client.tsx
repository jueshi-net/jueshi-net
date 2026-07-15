'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/header';
import FooterNew from '@/components/layout/footer-new';
import MobileHeader from '@/components/mobile/MobileHeader';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { cn } from '@/lib/utils';

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
  const isChangelog = pathname === '/changelog';
  const isShipping = pathname === '/shipping';

  // 首页、UI Lab、资源页、目的地页、指南页、清单页、专题页、搜索页、新手资源、定价页、社区页、反馈页、帮助页、支付成功页、AI工具页、数据分析页、商业页、更新日志页、跨境寄送页使用各自的 shell，跳过公共 Header/Footer
  // 工具页（/tools）现在使用公共 Shell，以便统一移动端体验
  if (isUILab || isV4Home || isResources || isResourcesSite || isDestinations || isGuides || isChecklists || isTopics || isSearch || isStarter || isPricing || isBBS || isFeedback || isHelp || isPaymentSuccess || isAiTools || isAnalytics || isBusiness || isChangelog || isShipping) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <div className="lg:hidden">
        <MobileBottomNav />
      </div>
      <FooterNew />
    </>
  );
}
