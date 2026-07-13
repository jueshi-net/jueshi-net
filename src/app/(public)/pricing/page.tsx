import { Metadata } from 'next';
import { buildCanonical, buildTitle } from '@/lib/seo';
import PricingClient from './pricing-client';
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';

export const metadata: Metadata = {
  title: buildTitle('价格方案与会员权益'),
  description: '查看绝世百宝箱免费版、积分权益、会员权益和即将开放的升级方案。',
  alternates: { canonical: buildCanonical('/pricing') },
  openGraph: {
    title: buildTitle('价格方案与会员权益'),
    description: '查看绝世百宝箱免费版、积分权益、会员权益和即将开放的升级方案。',
    url: buildCanonical('/pricing'),
  },
};

export default function PricingPage() {
  return (
    <JueshiV4PublicShell>
      <PricingClient />
    </JueshiV4PublicShell>
  );
}
