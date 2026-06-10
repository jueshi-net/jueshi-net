import type { Metadata } from 'next';
import { softwareApplicationJsonLd, buildCanonical } from '@/lib/seo';

export const metadata: Metadata = {
  title: '汇率换算 - 绝世百宝箱',
  description: '快速进行常用币种换算，适合海外生活、跨境购物、集运费用估算和外贸报价参考。',
  alternates: { canonical: buildCanonical('/tools/exchange-rate') },
  openGraph: {
    title: '汇率换算 - 绝世百宝箱',
    description: '快速进行常用币种换算，适合海外生活、跨境购物、集运费用估算和外贸报价参考。',
    url: buildCanonical('/tools/exchange-rate'),
    type: 'website',
  },
};

export default function ExchangeRateLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = softwareApplicationJsonLd({
    name: '汇率查询与换算工具',
    description: '全球主要货币实时汇率查询，支持多币种换算。跨境汇款、外贸结算必备工具。',
    url: buildCanonical('/tools/exchange-rate'),
    category: 'FinanceApplication',
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {children}
    </>
  );
}
