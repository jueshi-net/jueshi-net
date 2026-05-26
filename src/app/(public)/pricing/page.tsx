import { Metadata } from 'next';
import { buildCanonical, buildTitle } from '@/lib/seo';
import PricingClient from './pricing-client';

export const metadata: Metadata = {
  title: buildTitle('价格方案与会员权益'),
  description: '查看海外百宝箱免费版、积分权益、会员权益和即将开放的升级方案。',
  alternates: { canonical: buildCanonical('/pricing') },
  openGraph: {
    title: buildTitle('价格方案与会员权益'),
    description: '查看海外百宝箱免费版、积分权益、会员权益和即将开放的升级方案。',
    url: buildCanonical('/pricing'),
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
