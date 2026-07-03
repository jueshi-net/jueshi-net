import type { Metadata } from 'next';
import { softwareApplicationJsonLd, buildCanonical } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'HS Code 商品归类辅助查询助手 - 绝世百宝箱',
  description: '输入商品中文名、英文名或 HS 编码，查询可能的商品归类结果，辅助填写商业发票、报价单和集运申报资料。',
  keywords: "HS编码查询,HS Code,商品编码,海关编码,商品归类,外贸编码,报关编码,集运编码,商品分类,HS编码查询工具",
  alternates: { canonical: buildCanonical('/tools/hs-code') },
  openGraph: {
    title: 'HS Code 商品归类辅助查询助手 - 绝世百宝箱',
    description: '输入商品中文名、英文名或 HS 编码，查询可能的商品归类结果，辅助填写商业发票、报价单和集运申报资料。',
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
