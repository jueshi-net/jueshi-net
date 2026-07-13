import Header from '@/components/layout/header';
import FooterNew from '@/components/layout/footer-new';
import { PublicLayoutClient } from './public-layout-client';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayoutClient>{children}</PublicLayoutClient>;
}
