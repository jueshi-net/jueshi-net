import type { Metadata } from 'next';
import { softwareApplicationJsonLd, buildCanonical } from '@/lib/seo';

export const metadata: Metadata = {
  title: '地址格式化 - 绝世百宝箱',
  description: '海外地址整理、表单填写、集运仓地址复制，减少地址格式错误。支持多国地址标准化。',
  alternates: { canonical: buildCanonical('/tools/address-formatter') },
  openGraph: {
    title: '地址格式化 - 绝世百宝箱',
    description: '海外地址整理、表单填写、集运仓地址复制，减少地址格式错误。支持多国地址标准化。',
    url: buildCanonical('/tools/address-formatter'),
    type: 'website',
  },
};

export default function AddressFormatterLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = softwareApplicationJsonLd({
    name: '地址格式化工具',
    description: '海外地址整理、表单填写、集运仓地址复制，减少地址格式错误。支持多国地址标准化。',
    url: buildCanonical('/tools/address-formatter'),
    category: 'UtilityApplication',
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {children}
    </>
  );
}
