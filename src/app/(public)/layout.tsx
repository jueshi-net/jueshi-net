import Header from '@/components/layout/header';
import FooterNew from '@/components/layout/footer-new';
import { PublicLayoutClient } from './public-layout-client';
import { isFeatureEnabled } from '@/platform';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const serviceProviderEnabled = isFeatureEnabled('FEATURE_SERVICE_PROVIDER');
  return <PublicLayoutClient serviceProviderEnabled={serviceProviderEnabled}>{children}</PublicLayoutClient>;
}
