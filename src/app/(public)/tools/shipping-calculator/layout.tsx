import type { Metadata } from 'next';
import { softwareApplicationJsonLd, buildCanonical } from '@/lib/seo';

export const metadata: Metadata = {
  title: '运费计算器 - 体积重/CBM/计费重 - 海外百宝箱',
  description: '国际快递运费计算器：支持体积重、CBM、计费重量计算，自动比较DHL/FedEx/UPS/海运/空运报价。跨境物流、集运必备工具。',
  alternates: { canonical: buildCanonical('/tools/shipping-calculator') },
  openGraph: {
    title: '运费计算器 - 体积重/CBM/计费重',
    description: '国际快递运费计算器：支持体积重、CBM、计费重量计算，自动比较DHL/FedEx/UPS/海运/空运报价。',
    url: buildCanonical('/tools/shipping-calculator'),
    type: 'website',
  },
};

export default function ShippingCalculatorLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = softwareApplicationJsonLd({
    name: '运费计算器 - 体积重/CBM/计费重',
    description: '国际快递运费计算器，支持体积重、CBM、计费重量计算，自动比较多个物流渠道报价。',
    url: buildCanonical('/tools/shipping-calculator'),
    category: 'UtilityApplication',
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {children}
    </>
  );
}
