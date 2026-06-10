import type { Metadata } from 'next';
import { softwareApplicationJsonLd, buildCanonical } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'HS编码查询 - 绝世百宝箱',
  description: '用于辅助查询商品 HS 编码和报关分类信息，适合跨境电商、外贸和集运发货前参考。',
  alternates: { canonical: buildCanonical('/tools/hs-code') },
  openGraph: {
    title: 'HS编码查询 - 绝世百宝箱',
    description: '用于辅助查询商品 HS 编码和报关分类信息，适合跨境电商、外贸和集运发货前参考。',
    url: buildCanonical('/tools/hs-code'),
    type: 'website',
  },
};

export default function HSCodeLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = softwareApplicationJsonLd({
    name: 'HS编码查询工具',
    description: '海关商品编码搜索，支持关键词搜索和分类浏览。外贸、报关、跨境物流必备。',
    url: buildCanonical('/tools/hs-code'),
    category: 'UtilityApplication',
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {children}
    </>
  );
}
