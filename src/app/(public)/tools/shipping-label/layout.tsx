import type { Metadata } from 'next';
import { softwareApplicationJsonLd, buildCanonical } from '@/lib/seo';

export const metadata: Metadata = {
  title: '箱唛标签生成器 - 外箱唛头制作工具 - 海外百宝箱',
  description: '在线生成外箱唛头标签，支持自定义内容、尺寸、格式。适用于仓储、物流、出口包装。',
  alternates: { canonical: buildCanonical('/tools/shipping-label') },
  openGraph: {
    title: '箱唛标签生成器 - 外箱唛头制作工具',
    description: '在线生成外箱唛头标签，支持自定义内容、尺寸、格式。适用于仓储、物流、出口包装。',
    url: buildCanonical('/tools/shipping-label'),
    type: 'website',
  },
};

export default function ShippingLabelLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = softwareApplicationJsonLd({
    name: '箱唛标签生成器',
    description: '在线生成外箱唛头标签，支持自定义内容、尺寸和格式。仓储、物流、出口包装必备工具。',
    url: buildCanonical('/tools/shipping-label'),
    category: 'UtilityApplication',
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {children}
    </>
  );
}
