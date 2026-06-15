import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '跨境常用网址导航 - 物流追踪、跨境平台、支付收款、海关税务 | 绝世百宝箱',
  description: '精选跨境常用外部网站：物流追踪（17TRACK、DHL、FedEx、UPS）、跨境平台（Amazon、Shopify）、支付收款（PayPal、Stripe）、海关税务、官方机构、邮编地址、外贸工具。',
  keywords: ['网址导航', '跨境网址', '物流查询', '17TRACK', 'DHL', 'FedEx', 'UPS', 'Amazon', 'Shopify', 'PayPal', 'Stripe'],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: '跨境常用网址导航 - 物流追踪、跨境平台、支付收款 | 绝世百宝箱',
    description: '精选跨境常用外部网站：物流追踪、跨境平台、支付收款、海关税务、官方机构、邮编地址、外贸工具。',
    type: 'website',
  },
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
