import type { Metadata } from 'next';
import { softwareApplicationJsonLd, buildCanonical } from '@/lib/seo';

export const metadata: Metadata = {
  title: '海外换汇与多币种报价助手 - 绝世百宝箱',
  description: '查询常用货币汇率，估算换汇金额、跨境成本和外贸报价。支持多币种报价表生成、成本估算与建议售价计算。适用于海外生活、跨境收款、外贸报价和电商成本核算。',
  alternates: { canonical: buildCanonical('/tools/exchange-rate') },
  openGraph: {
    title: '海外换汇与多币种报价助手 - 绝世百宝箱',
    description: '查询常用货币汇率，估算换汇金额、跨境成本和外贸报价。支持多币种报价表生成、成本估算与建议售价计算。',
    url: buildCanonical('/tools/exchange-rate'),
    type: 'website',
  },
};

export default function ExchangeRateLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = softwareApplicationJsonLd({
    name: '海外换汇与多币种报价助手',
    description: '全球主要货币汇率查询，支持多币种报价表生成、成本估算与建议售价计算。跨境换汇、外贸报价、电商成本核算必备工具。',
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
