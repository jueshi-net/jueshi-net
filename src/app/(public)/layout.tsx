import { Breadcrumb } from '@/components/breadcrumb';
import Footer from '@/components/layout/footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Breadcrumb />
      {children}
      <Footer />
    </>
  );
}
