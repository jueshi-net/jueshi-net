import type { Metadata } from 'next';
import { softwareApplicationJsonLd, buildCanonical } from '@/lib/seo';

export const metadata: Metadata = {
  title: '汇率查询 - 实时汇率多币种换算 - 海外百宝箱',
  description: '查询全球主要货币实时汇率，支持多币种换算。跨境汇款、外贸结算、留学生换汇必备。',
  alternates: { canonical: buildCanonical('/tools/exchange-rate') },
  openGraph: {
    title: '汇率查询 - 实时汇率多币种换算',
    description: '查询全球主要货币实时汇率，支持多币种换算。跨境汇款、外贸结算必备。',
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
