import type { Metadata } from 'next';
import { softwareApplicationJsonLd, buildCanonical } from '@/lib/seo';

export const metadata: Metadata = {
  title: '商业发票生成器 - Commercial Invoice 模板 - 海外百宝箱',
  description: '免费在线生成商业发票（Commercial Invoice），支持中英文，自动计算总价。外贸、跨境电商、集运必备单据工具。',
  alternates: { canonical: buildCanonical('/tools/commercial-invoice') },
  openGraph: {
    title: '商业发票生成器 - Commercial Invoice 模板',
    description: '免费在线生成商业发票，支持中英文，自动计算总价。外贸、跨境电商必备。',
    url: buildCanonical('/tools/commercial-invoice'),
    type: 'website',
  },
};

export default function CommercialInvoiceLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = softwareApplicationJsonLd({
    name: '商业发票生成器',
    description: '免费在线生成商业发票（Commercial Invoice），支持中英文，自动计算总价。外贸、跨境电商必备单据工具。',
    url: buildCanonical('/tools/commercial-invoice'),
    category: 'BusinessApplication',
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {children}
    </>
  );
}
