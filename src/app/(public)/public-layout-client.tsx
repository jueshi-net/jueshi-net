'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/header';
import FooterNew from '@/components/layout/footer-new';
import MobileHeader from '@/components/mobile/MobileHeader';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';
import { cn } from '@/lib/utils';

export function PublicLayoutClient({ children, serviceProviderEnabled = false }: { children: React.ReactNode; serviceProviderEnabled?: boolean }) {
  const pathname = usePathname();
  const isUILab = pathname.startsWith('/ui-lab');
  const isV4Home = pathname === '/';
  const isResources = pathname === '/resources';
  const isResourcesSite = pathname.startsWith('/resources/site/');
  const isTools = pathname === '/tools';
  const isToolsSubpage = pathname.startsWith('/tools/');
  const isDestinations = pathname === '/destinations';
  const isGuides = pathname === '/guides';
  const isChecklists = pathname === '/checklists';
  const isTopics = pathname === '/topics' || pathname.startsWith('/topics/');
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
  const isGuidesSlug = pathname.startsWith('/guides/');
  const isCities = pathname.startsWith('/cities/');

  // Service Provider Yellow Pages routes - use JueshiV4PublicShell
  const isServiceProviders = pathname === '/service-providers' || pathname.startsWith('/service-providers');
  const isBusinessSlug = pathname.startsWith('/business/');
  const isProfessional = pathname.startsWith('/professional/');
  const isServicesSlug = pathname.startsWith('/services/');

  // 首页、UI Lab、资源页、目的地页、指南页、清单页、专题页、搜索页、新手资源、定价页、社区页、反馈页、帮助页、支付成功页、AI工具页、数据分析页、商业页、更新日志页、跨境寄送页、指南详情、城市详情使用各自的 shell，跳过公共 Header/Footer
  if (isUILab || isV4Home || isResources || isResourcesSite || isDestinations || isGuides || isGuidesSlug || isChecklists || isTopics || isCities || isSearch || isStarter || isPricing || isBBS || isFeedback || isHelp || isPaymentSuccess || isAiTools || isAnalytics || isBusiness || isChangelog || isShipping) {
    return <>{children}</>;
  }

  // 服务商黄页页面使用 JueshiV4PublicShell，统一品牌 Header 和底栏
  if (isServiceProviders || isBusinessSlug || isProfessional || isServicesSlug) {
    return <JueshiV4PublicShell serviceProviderEnabled={serviceProviderEnabled}>{children}</JueshiV4PublicShell>;
  }

  // 工具子页面（/tools/*）使用 JueshiV4PublicShell，统一品牌 Header 和底栏
  if (isToolsSubpage) {
    return <JueshiV4PublicShell serviceProviderEnabled={serviceProviderEnabled}>{children}</JueshiV4PublicShell>;
  }

  // 工具中心（/tools）也使用 JueshiV4PublicShell，避免双 Header
  if (isTools) {
    return <JueshiV4PublicShell serviceProviderEnabled={serviceProviderEnabled}>{children}</JueshiV4PublicShell>;
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
