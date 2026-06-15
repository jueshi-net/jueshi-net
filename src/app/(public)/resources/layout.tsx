import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '跨境常用网址导航 - 实用工具、出海经营、海外生活、物流追踪 | 绝世百宝箱',
  description: '综合性跨境资源目录：实用工具、出海经营、海外生活、物流追踪、支付收款、外贸单据、教育学习。配套站内免费工具：汇率换算、HS Code 查询、全球邮编、商业发票、报价单。',
  keywords: ['网址导航', '跨境网址', '实用工具', '出海经营', '海外生活', '物流查询', '17TRACK', '汇率换算', 'HS Code', '商业发票'],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: '跨境常用网址导航 - 综合性跨境资源目录 | 绝世百宝箱',
    description: '精选跨境常用外部网站，配套站内免费工具。覆盖实用工具、出海经营、海外生活、物流追踪、支付收款、外贸单据等多个分类。',
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
