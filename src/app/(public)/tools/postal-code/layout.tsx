import type { Metadata } from 'next';
import { softwareApplicationJsonLd, buildCanonical } from '@/lib/seo';

export const metadata: Metadata = {
  title: '邮编查询 - 全球50+国家邮编数据库 - 海外百宝箱',
  description: '支持加拿大、美国、英国、日本、德国等50+国家邮编查询。格式校验、城市匹配、DB实时搜索。集运、清关、地址核对必备工具。',
  alternates: { canonical: buildCanonical('/tools/postal-code') },
  openGraph: {
    title: '邮编查询 - 全球50+国家邮编数据库',
    description: '支持加拿大、美国、英国、日本、德国等50+国家邮编查询。格式校验、城市匹配、DB实时搜索。',
    url: buildCanonical('/tools/postal-code'),
    type: 'website',
  },
};

export default function PostalCodeLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = softwareApplicationJsonLd({
    name: '全球邮编查询工具',
    description: '支持50+国家邮编查询、格式校验、城市匹配和DB实时搜索。集运、清关、地址核对必备工具。',
    url: buildCanonical('/tools/postal-code'),
    category: 'UtilityApplication',
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {children}
    </>
  );
}
