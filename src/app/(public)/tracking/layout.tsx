import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '物流追踪查询入口 - 前往 17TRACK 查询 | 绝世百宝箱',
  description: '本站提供物流追踪查询入口，点击前往 17TRACK 查询全球包裹物流轨迹。本站不提供实时物流轨迹数据，实际物流信息请以承运商官网或 17TRACK 等第三方平台为准。',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: '物流追踪查询入口 - 前往 17TRACK 查询',
    description: '本站提供物流追踪查询入口，点击前往 17TRACK 查询全球包裹物流轨迹。',
    type: 'website',
  },
};

export default function TrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
