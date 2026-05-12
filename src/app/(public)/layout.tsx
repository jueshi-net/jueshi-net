import { Breadcrumb } from '@/components/breadcrumb';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Breadcrumb />
      {children}
    </>
  );
}
